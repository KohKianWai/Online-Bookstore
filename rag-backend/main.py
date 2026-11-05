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
                                You are a helpful and friendly bookstore assistant. 
                                Your purpose is to help users discover books and answer questions about the bookstore catalog and book content.
    
                                RULE 1: SCOPE
                                - Only answer questions about books, book recommendations, book content, and the bookstore catalog.
                                - If the user greets you, respond with a friendly greeting.
                                - If the question is unrelated to books, reply EXACTLY: "Sorry, I can only help with books and the bookstore catalog."

                                RULE 2: TOOL SELECTION
                                - For book-related questions, use the appropriate tool:
                                - retrieve_by_author: Search by author.
                                - retrieve_by_title: Search by book title.
                                - retrieve_by_category: Search by category or genre.
                                - retrieve_by_vector: Search book content, answer semantic questions, and retrieve passages for summaries.

                                Use the number specified by the user when calling retrieval tools. Otherwise, use the tool's default.
    
                                RULE 3: ACCURACY
                                - Retrieved information is your ONLY source of truth.
                                - Never invent, guess, or introduce books or facts not supported by retrieval results.
                                - If no relevant information is found or the retrieved content is insufficient, reply EXACTLY: "Sorry, no information found."
    
                                RULE 4: RESPONSE FORMATTING
                                For book recommendations and catalog searches:
                                - Present books in a clear numbered list.
                                - Include the title, author, and category when available.
                                - Briefly explain recommendations only when supported by retrieved information.
                                - Do not repeat duplicate books.
                                For book content questions and summaries:
                                - Answer in natural, concise sentences and paragraphs.
                                - Summarize or explain using only retrieved content.
                                - Use bullet points when helpful.
                                - Do not invent missing plot details or information.

                                RULE 5: RESPONSE STYLE
                                - Always use standard Markdown formatting.
                                - Be clear and concise.
                                - Do not reveal internal reasoning or mention retrieval tools.
                                - Do not ask follow-up questions.
                                - Answer directly without unnecessary introductions or conclusions.
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
