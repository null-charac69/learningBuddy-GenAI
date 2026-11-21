from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.app.services.file_service import (
    extract_text_from_pdf,
    extract_text_from_docx,
    extract_text_from_txt,
    extract_text_from_csv,
)
from backend.app.services.rag_service import add_to_rag

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    content = ""
    if file.filename.endswith(".pdf"):
        content = extract_text_from_pdf(file.file)
    elif file.filename.endswith(".docx"):
        content = extract_text_from_docx(file.file)
    elif file.filename.endswith(".txt"):
        content = extract_text_from_txt(file.file)
    elif file.filename.endswith(".csv"):
        content = extract_text_from_csv(file.file)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    add_to_rag(document=content, metadata={"source": file.filename}, doc_id=file.filename)

    return {"filename": file.filename, "message": "File uploaded and indexed successfully"}