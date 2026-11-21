import os
from backend.app.services.rag_service import add_to_rag

def index_data():
    data_dir = "backend/data/raw"
    for filename in os.listdir(data_dir):
        if filename.endswith(".txt"):
            with open(os.path.join(data_dir, filename), "r") as f:
                content = f.read()
                add_to_rag(document=content, metadata={"source": filename}, doc_id=filename)
                print(f"Indexed {filename}")

if __name__ == "__main__":
    index_data()