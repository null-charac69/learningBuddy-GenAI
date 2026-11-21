import google.generativeai as genai
from backend.app.core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

def get_llm_response(prompt: str):
    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return str(e)