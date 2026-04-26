from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uvicorn
import os
import uuid
import numpy as np
from typing import List, Optional, Dict, Any

from data_manager import data_manager
from agent import agent
import models
from database import engine, get_db
import auth

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Ensure uploads directory exists
os.makedirs("uploads", exist_ok=True)

app = FastAPI(title="LuminaData API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Schemas ---
class UserCreate(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class QueryRequest(BaseModel):
    file_id: str
    query: str
    provider: str = "ollama"
    model: str = "llama3"
    api_key: Optional[str] = None

class CommonQueryRequest(BaseModel):
    query: str
    provider: str = "ollama"
    model: str = "llama3"
    api_key: Optional[str] = None

# --- Auth Routes ---
@app.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    access_token = auth.create_access_token(data={"sub": new_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# --- Data Routes ---
@app.get("/datasets")
def get_datasets(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    datasets = db.query(models.Dataset).filter(models.Dataset.owner_id == current_user.id).all()
    return [{"id": d.id, "filename": d.filename, "created_at": d.created_at} for d in datasets]

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...), 
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    content = await file.read()
    file_type = file.filename.split(".")[-1].lower()
    
    if file_type not in ["csv", "json"]:
        raise HTTPException(status_code=400, detail="Only CSV and JSON files are supported")
    
    try:
        file_id = str(uuid.uuid4())
        file_path = f"uploads/{file_id}.{file_type}"
        
        # Save to disk
        with open(file_path, "wb") as f:
            f.write(content)
            
        # Load into memory for current session
        data_manager.load_data(content, file_type, file_id)
        
        # Save to database
        db_dataset = models.Dataset(
            id=file_id, 
            filename=file.filename, 
            file_path=file_path, 
            owner_id=current_user.id
        )
        db.add(db_dataset)
        db.commit()
        
        return {"file_id": file_id, "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/schema/{file_id}")
async def get_schema(file_id: str, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # Verify ownership
    dataset = db.query(models.Dataset).filter(models.Dataset.id == file_id, models.Dataset.owner_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="File not found")
        
    # Lazy load if not in memory
    if data_manager.get_df(file_id) is None:
        data_manager.load_from_path(dataset.file_path, file_id)
        
    schema = data_manager.get_schema(file_id)
    return schema

@app.get("/data/{file_id}")
async def get_data(file_id: str, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # Verify ownership
    dataset = db.query(models.Dataset).filter(models.Dataset.id == file_id, models.Dataset.owner_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="File not found")
        
    # Lazy load if not in memory
    if data_manager.get_df(file_id) is None:
        data_manager.load_from_path(dataset.file_path, file_id)
        
    df = data_manager.get_df(file_id)
    # Replace NaN with None for JSON serialization
    safe_df = df.head(50).replace({np.nan: None})
    return safe_df.to_dict(orient="records")

@app.post("/query")
async def query_data(request: QueryRequest, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    dataset = db.query(models.Dataset).filter(models.Dataset.id == request.file_id, models.Dataset.owner_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="File not found")
        
    if data_manager.get_df(request.file_id) is None:
        data_manager.load_from_path(dataset.file_path, request.file_id)
        
    schema = data_manager.get_schema(request.file_id)
    
    try:
        code = agent.generate_code(request.query, schema, request.provider, request.model, request.api_key)
        if any(err in code for err in ["Ollama Error:", "Gemini Error:"]):
            raise Exception(code)
            
        exec_res = data_manager.execute_query(request.file_id, code)
        result = exec_res["answer"]
        plot = exec_res["plot"]
        
        final_answer = agent.generate_final_answer(request.query, result, request.provider, request.model, request.api_key)
        if any(err in final_answer for err in ["Ollama Error:", "Gemini Error:"]):
            raise Exception(final_answer)
            
    except Exception as e:
        return {"answer": f"AI Error: {str(e)}", "code": locals().get('code', ''), "result": "Error", "plot": None}
    
    return {"answer": final_answer, "code": code, "result": str(result), "plot": plot}

@app.post("/query_common")
async def query_common(request: CommonQueryRequest, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    datasets = db.query(models.Dataset).filter(models.Dataset.owner_id == current_user.id).all()
    all_schemas = []
    for d in datasets:
        try:
            if data_manager.get_df(d.id) is None:
                data_manager.load_from_path(d.file_path, d.id)
            all_schemas.append({"filename": d.filename, "schema": data_manager.get_schema(d.id)})
        except Exception as e:
            print(f"Skipping broken dataset {d.filename}: {e}")
            continue
    
    if not all_schemas:
        return {"answer": "You haven't uploaded any datasets yet, or they are currently unavailable."}

    # Common chat context
    context = f"The user has the following datasets uploaded:\n{str(all_schemas)}"
    prompt = f"{context}\n\nUser Question: {request.query}\n\nAnswer the question based on the schemas provided. Be professional and concise."
    
    try:
        answer = agent._call_llm(prompt, request.provider, request.model, request.api_key)
        if any(err in answer for err in ["Ollama Error:", "Gemini Error:"]):
            raise Exception(answer)
    except Exception as e:
        return {"answer": f"Global AI Error: {str(e)}"}
        
    return {"answer": answer}

if __name__ == "__main__":
    print("LuminaData Backend is initializing...")
    uvicorn.run(app, host="0.0.0.0", port=8000)



