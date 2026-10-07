from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from rag_service import ingest_book, delete_book_data
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, ToolMessage
from retriever import chatbot
from pydantic import BaseModel
import asyncio

class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/ingest-pdf")
async def ingest_pdf(
    bookId: str = Form(...),
    title: str = Form(...),
    author: str = Form(...),
    category: str = Form(...),
    file: UploadFile = File(...)
):

    return await ingest_book(
        bookId,
        title,
        author,
        category,
        file
    )

@app.delete("/book/{book_id}")
async def delete_book(book_id: str):

    delete_book_data(book_id)

    print(f"Book {book_id} deleted")

@app.put("/book/{book_id}")
async def update_book(
    book_id: str,
    title: str = Form(...),
    author: str = Form(...),
    category: str = Form(...),
    file: UploadFile = File(...)
    ):

    delete_book_data(book_id)

    # Wait 3 seconds for Pinecone to process the deletion
    await asyncio.sleep(3)

    await ingest_book(
        book_id,
        title,
        author,
        category,
        file
    )

    print("Update Successfully")

@app.post("/chat")
async def chat(request: ChatRequest):

    messages = [
            SystemMessage(content="""
                               You are a bookstore assistant.
    
                                RULE 1: Only answer questions about books or the bookstore catalog.

                                RULE 2: If the user is greeting:
                                - Greet back to the user.
    
                                RULE 3: If the question is NOT about books or the bookstore catalog:
                                - DO NOT use any tool.
                                - DO NOT provide any information.
                                - Reply EXACTLY:
                                "Sorry, I can only help with books and the bookstore catalog."
    
                                RULE 4: If the question is about books:
                                - Use retrieve_by_author when the user asks for books by an author.
                                - Use retrieve_by_title when the user asks for a specific title.
                                - Use retrieve_by_category when the user asks for a category or genre.
                                - Use retrieve_by_vector for semantic searches and book content questions.
                                - The information returned by the retrieval tools is the ONLY source of truth.
                                - NEVER invent, guess, or add a book that does not appear in the tool results.
    
                                RULE 5: If no relevant book information is found, reply EXACTLY:
                                "Sorry, no information found."
    
                                DO NOT mention your reasoning step. Just output the final answer to user.
                                NEVER add follow up question after the final answer.
                                """),
        ]
    
    # for message in request.messages:
    #     if message.role == "user":
    #         messages.append(
    #             HumanMessage(content=message.content)
    #         )

    #     elif message.role == "assistant":
    #         messages.append(
    #             AIMessage(content=message.content)
    #         )

    messages.append(HumanMessage(content=request.messages[-1].content))
    
    response = await chatbot.ainvoke({
        "messages": messages
    })

    print("🎩 Bot's Response:")
    print(response['messages'][-1].content)
    print(response)
    # for message in response['messages']:
    #     if isinstance(message, AIMessage):
    #         print(message.tool_calls)
    #     else:
    #         print(message.content)

    return {
        "answer": response["messages"][-1].content
    }
