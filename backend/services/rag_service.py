import chromadb
from chromadb.config import Settings
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Initialize ChromaDB client (in-memory for this session)
chroma_client = chromadb.Client(Settings(is_persistent=False))

def process_context_files(context_files: list[dict], main_code: str, top_k: int = 5) -> str:
    """
    Processes the provided context files, chunks them using RecursiveCharacterTextSplitter,
    embeds them into a temporary ChromaDB collection, and retrieves the most relevant chunks
    for the given `main_code`.
    """
    if not context_files:
        return ""

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        is_separator_regex=False,
    )

    documents = []
    ids = []
    metadatas = []

    doc_id = 0
    for file in context_files:
        filename = file.get("filename", "unknown")
        code = file.get("code", "")
        if not code.strip():
            continue

        chunks = text_splitter.split_text(code)
        for i, chunk in enumerate(chunks):
            documents.append(chunk)
            ids.append(f"{filename}_{i}_{doc_id}")
            metadatas.append({"filename": filename, "chunk_index": i})
            doc_id += 1

    if not documents:
        return ""

    # Create a temporary collection
    collection_name = "temp_code_context"
    try:
        chroma_client.delete_collection(collection_name)
    except Exception:
        pass  # Collection doesn't exist

    collection = chroma_client.create_collection(name=collection_name)

    # Add all chunks to the collection
    collection.add(
        documents=documents,
        metadatas=metadatas,
        ids=ids
    )

    # Query the collection
    results = collection.query(
        query_texts=[main_code],
        n_results=min(top_k, len(documents))
    )

    # Clean up the temporary collection
    try:
        chroma_client.delete_collection(collection_name)
    except Exception:
        pass

    if not results or not results["documents"] or not results["documents"][0]:
        return ""

    rag_chunks = results["documents"][0]
    rag_metadatas = results["metadatas"][0]

    # Format the retrieved chunks for the LLM context
    context_str = "--- RAG RETRIEVED CONTEXT START ---\n"
    for chunk, meta in zip(rag_chunks, rag_metadatas):
        context_str += f"\n[From Context File: {meta['filename']}]\n"
        context_str += chunk + "\n"
    context_str += "\n--- RAG RETRIEVED CONTEXT END ---\n"

    return context_str
