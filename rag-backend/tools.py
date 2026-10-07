from langchain.tools import tool
from vector_store import vector_store

@tool
def retrieve_by_author(author: str, k: int = 1) -> str:
    """Search for books written by a specific author.

    Use this tool when the user asks for books by a particular author.

    Args:
        author (str): The name of the book's author.
        k (int): The maximum number of books to return. Defaults to 1 if the user does not specify a number.
    """

    author = author.lower().strip()

    results = vector_store.similarity_search(
        query="book",
        k=k,
        filter={
            "author": {"$eq": author}
        }
    )

    if not results:
        return "No books found."

    return "\n\n".join([
        f"title: {doc.metadata.get('title')}\n"
        f"author: {doc.metadata.get('author')}\n"
        f"category: {doc.metadata.get('category')}"
        for doc in results
    ])

@tool
def retrieve_by_title(title: str) -> str:
    """Search for a book with a specific title.

    Use this tool when the user asks about a specific book title.

    Args:
        title (str): The title of the book.
    """

    title = title.lower().strip()

    results = vector_store.similarity_search(
        query="book",
        k=1,
        filter={
            "title": {"$eq": title}
        }
    )

    if not results:
        return "No books found."

    return "\n\n".join([
        f"title: {doc.metadata.get('title')}\n"
        f"author: {doc.metadata.get('author')}\n"
        f"category: {doc.metadata.get('category')}"
        for doc in results
    ])

@tool
def retrieve_by_category(category: str, k: int = 1) -> str:
    """Search for books in a specific category or genre.

    Use this tool when the user asks for books from a particular category or genre.

    Args:
        category (str): The category or genre of the book.
        k (int): The maximum number of books to return. Defaults to 1 if the user does not specify a number.
    """

    category = category.lower().strip()

    results = vector_store.similarity_search(
        query="book",
        k=k,
        filter={
            "category": {"$eq": category}
        }
    )

    if not results:
        return "No books found."

    return "\n\n".join([
        f"title: {doc.metadata.get('title')}\n"
        f"author: {doc.metadata.get('author')}\n"
        f"category: {doc.metadata.get('category')}"
        for doc in results
    ])

@tool
def retrieve_by_vector(query: str, k: int = 5) -> str:
    """Search books or passages using semantic similarity.

    Args:
        query (str): The user's search query or question.
        k (int): The maximum number of relevant results to retrieve.
    """

    results = vector_store.similarity_search(
        query,
        k=k
    )

    return "\n\n".join([
            f"title{doc.metadata.get('title')}\n"
            f"author{doc.metadata.get('author')}\n"
            f"category: {doc.metadata.get('category')}\n"
            f"content {doc.page_content}"
            for doc in results
        ])