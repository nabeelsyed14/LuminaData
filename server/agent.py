import ollama
import google.generativeai as genai
import os
import re
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional

load_dotenv()

# --- PROMPTS ---

CODE_GEN_PROMPT = """You are a Python data analyst. Write code to answer the question.

CRITICAL RULES:
- The data is ALREADY loaded in a variable called `df` (a pandas DataFrame).
- pandas is `pd`, numpy is `np`, matplotlib.pyplot is `plt`, seaborn is `sns`. They are ALL pre-imported.
- DO NOT write any import statements.
- DO NOT call plt.show() or plt.savefig().
- DO NOT use print().
- Store your final answer in a variable called `result`.
- If creating a chart, also set `result` to a short description of what the chart shows.
- Convert date columns with pd.to_datetime() before time-based operations.
- ONLY use columns from the schema below.

Schema:
{schema}

Question: {query}

Write ONLY the code inside ```python ``` blocks. Nothing else.
"""

FINAL_ANSWER_PROMPT = """You are LuminaData, a professional Data Analyst.
A user asked: "{query}"
The computed data result is: {result}

Write a friendly, clear, and concise summary of this result for the user. 
If the result contains a plot, mention that you've generated the visualization.
Do not mention the code. Just give the answer.
"""

class DataAgent:
    def __init__(self):
        self.provider = "ollama"
        self.model = "llama3"

    def _call_llm(self, prompt: str, provider: str, model: str, api_key: str = None) -> str:
        if provider == "ollama":
            try:
                response = ollama.chat(model=model, messages=[
                    {'role': 'system', 'content': prompt}
                ])
                return response['message']['content']
            except Exception as e:
                return f"Ollama Error: {str(e)}"
        
        elif provider == "gemini":
            if not api_key: return "Gemini Error: No API Key"
            try:
                genai.configure(api_key=api_key)
                m = genai.GenerativeModel('gemini-1.5-flash')
                response = m.generate_content(prompt)
                return response.text
            except Exception as e:
                return f"Gemini Error: {str(e)}"
        
        return "Error: No provider"

    def generate_code(self, query: str, schema: Dict[str, Any], provider: str, model: str, api_key: str) -> str:
        schema_str = f"Columns: {schema.get('columns')}\nSample: {schema.get('sample')}"
        prompt = CODE_GEN_PROMPT.format(schema=schema_str, query=query)
        response = self._call_llm(prompt, provider, model, api_key)
        
        match = re.search(r"```(?:python|py)?\s+(.*?)```", response, re.DOTALL | re.IGNORECASE)
        if match: return match.group(1).strip()
        match = re.search(r"```(.*?)```", response, re.DOTALL)
        if match: return match.group(1).strip()
        return response.strip()

    def generate_final_answer(self, query: str, result: Any, provider: str, model: str, api_key: str) -> str:
        prompt = FINAL_ANSWER_PROMPT.format(query=query, result=str(result))
        return self._call_llm(prompt, provider, model, api_key)

agent = DataAgent()
