import pandas as pd
import numpy as np
import datetime as dt
import io
import uuid
import json
from typing import Dict, Optional, Any

class DataManager:
    def __init__(self):
        self.dataframes: Dict[str, pd.DataFrame] = {}

    def load_data(self, content: bytes, file_type: str, file_id: str = None) -> str:
        if file_id is None:
            file_id = str(uuid.uuid4())
        if file_type == "csv":
            df = pd.read_csv(io.BytesIO(content))
        elif file_type == "json":
            try:
                df = pd.read_json(io.BytesIO(content))
            except Exception:
                try:
                    data = json.loads(content)
                    df = pd.json_normalize(data)
                except Exception:
                    df = pd.DataFrame(json.loads(content))
        else:
            raise ValueError("Unsupported file type")
        
        self.dataframes[file_id] = df
        
        # Auto-convert date columns
        for col in df.columns:
            if 'date' in col.lower() or 'time' in col.lower():
                try:
                    df[col] = pd.to_datetime(df[col])
                except Exception:
                    pass
                    
        return file_id
        
    def load_from_path(self, file_path: str, file_id: str):
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file_path.endswith('.json'):
            try:
                df = pd.read_json(file_path)
            except Exception:
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    df = pd.json_normalize(data)
                except Exception:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        df = pd.DataFrame(json.load(f))
        else:
            raise ValueError("Unsupported file type")
        self.dataframes[file_id] = df

    def get_df(self, file_id: str) -> Optional[pd.DataFrame]:
        return self.dataframes.get(file_id)


    def get_schema(self, file_id: str) -> Dict[str, Any]:
        df = self.get_df(file_id)
        if df is None:
            return {}
        
        # Replace NaN with None for JSON serialization
        sample_df = df.head(3).replace({np.nan: None})
        
        return {
            "columns": df.columns.tolist(),
            "dtypes": df.dtypes.astype(str).to_dict(),
            "sample": sample_df.to_dict(orient="records"),
            "shape": df.shape
        }

    def _sanitize_code(self, code: str) -> str:
        """Clean up LLM-generated code to work in our sandbox."""
        lines = code.split('\n')
        clean_lines = []
        for line in lines:
            stripped = line.strip()
            # Skip import statements — everything is pre-loaded
            if stripped.startswith('import ') or stripped.startswith('from '):
                continue
            # Remove plt.show() — we capture plots automatically
            if 'plt.show()' in stripped:
                continue
            # Remove plt.savefig() — we capture to buffer, not disk
            if 'plt.savefig(' in stripped:
                continue
            # Remove print() calls — they do nothing in exec
            if stripped.startswith('print('):
                continue
            clean_lines.append(line)
        return '\n'.join(clean_lines)

    def execute_query(self, file_id: str, query_code: str) -> Dict[str, Any]:
        df = self.get_df(file_id)
        if df is None:
            return {"answer": "No data loaded", "plot": None}
        
        import matplotlib
        matplotlib.use('Agg')  # Non-interactive backend
        import matplotlib.pyplot as plt
        import seaborn as sns
        import base64
        
        plt.close('all')  # Close ALL existing figures
        plt.clf()
        
        # Sanitize AI-generated code
        clean_code = self._sanitize_code(query_code)
        
        # Execution context with every common alias an LLM might hallucinate
        local_vars = {
            "df": df, 
            "your_data": df, 
            "data": df, 
            "dataset": df,
            "pd": pd, 
            "np": np, 
            "dt": dt, 
            "plt": plt,
            "sns": sns,
            "matplotlib": matplotlib,
            "timedelta": dt.timedelta,
            "datetime": dt,
            "date": dt.date,
            "Timedelta": pd.Timedelta,
            "Timestamp": pd.Timestamp,
        }
        try:
            exec(clean_code, {}, local_vars)
            res = local_vars.get("result", "Query executed successfully")
            
            # Capture plot if any was created
            plot_base64 = None
            if plt.get_fignums():
                fig = plt.gcf()
                fig.set_size_inches(10, 6)  # Consistent sizing
                fig.tight_layout()
                buf = io.BytesIO()
                fig.savefig(buf, format='png', dpi=150, bbox_inches='tight', facecolor='white')
                buf.seek(0)
                plot_base64 = base64.b64encode(buf.read()).decode('utf-8')
                plt.close('all')

            # Safely convert result to string representation
            if isinstance(res, pd.DataFrame) or isinstance(res, pd.Series):
                res_str = res.to_string()
            else:
                res_str = str(res)
                
            return {"answer": res_str, "plot": plot_base64}
        except Exception as e:
            return {"answer": f"Error executing query: {str(e)}", "plot": None}

data_manager = DataManager()
