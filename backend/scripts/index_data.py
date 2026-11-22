"""Bulk-index files from backend/data/raw into a user's library.

Usage (from backend/):  python -m scripts.index_data <username> [directory]
"""
import sys
from pathlib import Path

from app.core.config import DATA_DIR, settings
from app.db import models  # noqa: F401
from app.db.database import Base, SessionLocal, engine
from app.db.models import Document, User
from app.services import rag_service
from app.services.file_service import SUPPORTED_EXTENSIONS, chunk_text, extract_text


def main(username: str, directory: Path) -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            sys.exit(f"No user named '{username}'. Register in the app first.")
        for path in sorted(directory.iterdir()):
            if path.suffix.lower() not in SUPPORTED_EXTENSIONS:
                continue
            chunks = chunk_text(extract_text(path.name, path.read_bytes()), settings.CHUNK_SIZE, settings.CHUNK_OVERLAP)
            if not chunks:
                print(f"skip  {path.name} (no text)")
                continue
            old = db.query(Document).filter(Document.user_id == user.id, Document.filename == path.name).first()
            if old:
                rag_service.delete_document(user.id, old.id)
                db.delete(old)
                db.flush()
            doc = Document(user_id=user.id, filename=path.name, char_count=sum(map(len, chunks)), chunk_count=len(chunks))
            db.add(doc)
            db.flush()
            rag_service.add_document(user.id, doc.id, path.name, chunks)
            db.commit()
            print(f"index {path.name} ({len(chunks)} chunks)")
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1], Path(sys.argv[2]) if len(sys.argv) > 2 else DATA_DIR / "raw")
