from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.database import get_db
from app.db.models import Document, User
from app.schemas import DocumentOut
from app.services import rag_service
from app.services.file_service import UnsupportedFileError, chunk_text, extract_text

router = APIRouter()


@router.get("", response_model=list[DocumentOut])
def list_documents(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.uploaded_at.desc())
        .all()
    )


# Sync handler on purpose: extraction + embedding are CPU-bound, so FastAPI runs it in a threadpool.
@router.post("/upload", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    filename = (file.filename or "").strip()
    if not filename:
        raise HTTPException(status_code=400, detail="File must have a name")

    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    data = file.file.read(max_bytes + 1)
    if len(data) > max_bytes:
        raise HTTPException(status_code=413, detail=f"File exceeds {settings.MAX_UPLOAD_MB} MB limit")

    try:
        text = extract_text(filename, data)
    except UnsupportedFileError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=422, detail="Could not read this file. Is it corrupted or password-protected?")

    chunks = chunk_text(text, settings.CHUNK_SIZE, settings.CHUNK_OVERLAP)
    if not chunks:
        raise HTTPException(
            status_code=422,
            detail="No extractable text found (scanned PDFs/images are not supported yet).",
        )

    # Re-uploading a file with the same name replaces the previous version.
    existing = (
        db.query(Document)
        .filter(Document.user_id == current_user.id, Document.filename == filename)
        .first()
    )
    if existing:
        rag_service.delete_document(current_user.id, existing.id)
        db.delete(existing)
        db.flush()

    doc = Document(
        user_id=current_user.id, filename=filename, char_count=len(text), chunk_count=len(chunks)
    )
    db.add(doc)
    db.flush()
    try:
        rag_service.add_document(current_user.id, doc.id, filename, chunks)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to index document")
    db.commit()
    db.refresh(doc)
    return doc


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = (
        db.query(Document)
        .filter(Document.id == document_id, Document.user_id == current_user.id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    rag_service.delete_document(current_user.id, doc.id)
    db.delete(doc)
    db.commit()
