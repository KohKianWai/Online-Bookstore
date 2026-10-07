from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from vector_store import vector_store
import pypdf
from fastapi import UploadFile
import os
from vector_store import index
from pathlib import Path

UPLOAD_DIR = "pdfs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# =========================
# Text Splitter
# =========================

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=750,
    chunk_overlap=150
)

# =========================
# PDF Loader
# =========================
def load_pdf_pages(bookId: str, title: str, author: str, category: str, file_path: str) -> list[Document]:
    reader = pypdf.PdfReader(file_path)
    return [
        Document(
            page_content=page.extract_text() or "",
            metadata={
                "bookId": bookId,
                "title": title.lower().strip(),
                "author": author.lower().strip(),
                "category": category.lower().strip(),
                "source": file_path, 
                "page": i},
        )
        for i, page in enumerate(reader.pages)
    ]

def delete_book_data(book_id: str):
    
    pdf_path = Path(UPLOAD_DIR) / f"{book_id}.pdf"

    if pdf_path.exists():
        pdf_path.unlink(missing_ok=True)

    index.delete(
        namespace="",
        filter={
            "bookId": {"$eq": book_id}
        }
    )

async def ingest_book(
    book_id: str,
    title: str,
    author: str,
    category: str,
    file: UploadFile
):
    file_path = Path(UPLOAD_DIR) / f"{book_id}.pdf"

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    docs = load_pdf_pages(
        book_id,
        title,
        author,
        category,
        str(file_path)
    )

    chunks = text_splitter.split_documents(docs)

    vector_store.add_documents(chunks)

    print(
        f"Ingest {file.filename} completed "
        f"with {len(chunks)} chunks"
    )

    return len(chunks)

