import os
from langchain_text_splitters import RecursiveCharacterTextSplitter, Language
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import Qdrant
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams

QDRANT_PATH = os.path.join(os.path.dirname(__file__), "..", "qdrant_db")

# Initialize Qdrant local client persistent
client = QdrantClient(path=QDRANT_PATH)

# Initialize embeddings using all-MiniLM-L6-v2 (fast and effective for code/text)
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
vector_size = 384  # MiniLM-L6 uses 384 dimensions

COLLECTION_NAME = "repo_context"

# Ensure collection exists
if not client.collection_exists(COLLECTION_NAME):
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
    )

vector_store = Qdrant(
    client=client,
    collection_name=COLLECTION_NAME,
    embeddings=embeddings,
)

def ingest_repository(repo_path: str):
    if not os.path.exists(repo_path):
        raise ValueError(f"Path does not exist: {repo_path}")
        
    # Supported extensions
    ext_mapping = {
        ".py": Language.PYTHON,
        ".js": Language.JS,
        ".ts": Language.TS,
        ".jsx": Language.JS,
        ".tsx": Language.TS,
    }
    
    docs_to_insert = []
    
    # We will search through the repo
    for root, dirs, files in os.walk(repo_path):
        # Skip hidden dirs like .git and node_modules
        dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', 'venv', '.venv', '__pycache__', 'dist', 'build']]
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in ext_mapping:
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                        
                    # Split as per industry standard chunking for code
                    splitter = RecursiveCharacterTextSplitter.from_language(
                        language=ext_mapping[ext],
                        chunk_size=1000,
                        chunk_overlap=200
                    )
                    
                    chunks = splitter.create_documents(
                        [content],
                        metadatas=[{"source": file_path, "language": ext_mapping[ext].value}]
                    )
                    
                    docs_to_insert.extend(chunks)
                except Exception as e:
                    print(f"Failed to read/chunk {file_path}: {e}")

    if not docs_to_insert:
        raise ValueError("No parsable code files found in the specified repository.")

    # We clear the collection before inserting new repo or just append
    # Let's just append for now
    
    # Insert chunks asynchronously (using batching automatically handled by QdrantVectorStore)
    vector_store.add_documents(docs_to_insert)
        
    return {"message": f"Successfully ingested {len(docs_to_insert)} logic chunks from {repo_path}"}


def retrieve_context(code_snippet: str, top_k: int = 3) -> str:
    try:
        # Check if empty collection - if info is present we will get 0 collections on empty setup
        info = client.get_collection(COLLECTION_NAME)
        if info.points_count == 0:
            return ""
            
        retriever = vector_store.as_retriever(search_kwargs={"k": top_k})
        docs = retriever.invoke(code_snippet)
        
        if not docs:
            return ""
            
        context = "### EXTERNAL REPOSITORY CONTEXT ###\n"
        context += "The following are potentially relevant snippets retrieved from the broader project repository. Use them to understand function boundaries and missing references:\n\n"
        for doc in docs:
            source = doc.metadata.get("source", "Unknown")
            context += f"--- Snippet from {source} ---\n{doc.page_content}\n\n"
            
        return context
    except Exception as e:
        print(f"Context retrieval failed: {e}")
        return ""
