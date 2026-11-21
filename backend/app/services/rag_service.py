import chromadb

client = chromadb.Client()
collection = client.get_or_create_collection("learning_buddy")

def add_to_rag(document: str, metadata: dict, doc_id: str):
    collection.add(
        documents=[document],
        metadatas=[metadata],
        ids=[doc_id]
    )

def query_rag(query: str):
    results = collection.query(
        query_texts=[query],
        n_results=2
    )
    return results["documents"][0]