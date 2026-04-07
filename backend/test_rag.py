import os
import sys

# Add backend to path so we can import services
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.rag_service import ingest_repository, retrieve_context

print("Ingesting current backend folder...")
try:
    res = ingest_repository(".")
    print(res)
except Exception as e:
    print(f"Ingestion Error: {e}")

print("\nRetrieving context for 'get_collection' or 'retrieve_context'...")
try:
    context = retrieve_context("def retrieve_context")
    print(context)
except Exception as e:
    print(f"Retrieval Error: {e}")
