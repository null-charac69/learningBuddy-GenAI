from fastapi import APIRouter
from backend.app.models.chat import ChatMessage
from backend.app.services.llm_service import get_llm_response
from backend.app.services.rag_service import query_rag

router = APIRouter()

@router.post("/chat", response_model=ChatMessage)
def chat(message: ChatMessage):
    rag_results = query_rag(message.message)
    llm_prompt = f"Context: {rag_results}\n\nQuestion: {message.message}\n\nAnswer:"
    llm_response = get_llm_response(llm_prompt)
    return ChatMessage(message=llm_response, sender="assistant")