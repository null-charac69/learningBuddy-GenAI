"""Per-user vector store backed by a persistent ChromaDB collection.

Every chunk carries `user_id`, `document_id` and `filename` metadata so queries
are always scoped to the requesting user's documents.
"""
from functools import lru_cache
from typing import Optional

import chromadb

from app.core.config import settings


@lru_cache
def _collection():
    client = chromadb.PersistentClient(path=settings.CHROMA_DIR)
    return client.get_or_create_collection(
        settings.CHROMA_COLLECTION, metadata={"hnsw:space": "cosine"}
    )


def add_document(user_id: int, document_id: int, filename: str, chunks: list[str]) -> None:
    if not chunks:
        return
    _collection().upsert(
        ids=[f"{user_id}:{document_id}:{i}" for i in range(len(chunks))],
        documents=chunks,
        metadatas=[
            {"user_id": user_id, "document_id": document_id, "filename": filename, "chunk": i}
            for i in range(len(chunks))
        ],
    )


def delete_document(user_id: int, document_id: int) -> None:
    _collection().delete(where={"$and": [{"user_id": user_id}, {"document_id": document_id}]})


def delete_user(user_id: int) -> None:
    _collection().delete(where={"user_id": user_id})


def query(
    user_id: int,
    text: str,
    k: Optional[int] = None,
    document_ids: Optional[list[int]] = None,
    max_distance: float = 0.8,
) -> list[dict]:
    """Return the top-k chunks for `text` from this user's documents.

    Chunks with cosine distance above `max_distance` are dropped as irrelevant.
    """
    where: dict = {"user_id": user_id}
    if document_ids:
        where = {"$and": [where, {"document_id": {"$in": document_ids}}]}

    res = _collection().query(query_texts=[text], n_results=k or settings.RAG_TOP_K, where=where)
    docs = (res.get("documents") or [[]])[0]
    metas = (res.get("metadatas") or [[]])[0]
    dists = (res.get("distances") or [[]])[0] or [0.0] * len(docs)

    return [
        {
            "text": doc,
            "document_id": int(meta["document_id"]),
            "filename": meta["filename"],
            "distance": dist,
        }
        for doc, meta, dist in zip(docs, metas, dists)
        if dist <= max_distance
    ]
