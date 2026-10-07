import os

from dotenv import load_dotenv
from pinecone import Pinecone
from langchain_pinecone import PineconeVectorStore
from langchain_ollama import ChatOllama, OllamaEmbeddings

load_dotenv()

# =========================
# Embedding Model
# =========================

embeddings = OllamaEmbeddings(
    model="mxbai-embed-large"
)

# =========================
# Pinecone Vector Database
# =========================

pc = Pinecone(
    api_key=os.getenv("PINECONE_API_KEY")
)

index = pc.Index(
    os.getenv("PINECONE_INDEX_NAME")
)

# index.delete(delete_all=True)

vector_store = PineconeVectorStore(embedding=embeddings, index=index)