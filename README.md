# Online Bookstore with Agentic RAG Chatbot

A full-stack online bookstore application that allows users to browse, purchase, and read e-books, while providing moderators with tools to manage books, user accounts, and payment transactions.

The application also integrates an Agentic Retrieval-Augmented Generation (RAG) chatbot powered by LangChain, LangGraph, and Pinecone, enabling users to discover books, receive recommendations, and ask questions about book content using natural language.

## Setup

### 1. Run the Spring Boot Backend

Navigate to the backend directory:  
```
cd demo
```

Run the backend:  
```
.\mvnw.cmd spring-boot:run
```

The Spring Boot API will typically run at:  
```
http://localhost:8080
```

### 2. Configure the RAG Backend

Navigate to the RAG directory:  
```
cd rag-backend
```

Create a virtual environment:  
```
python -m venv venv
```

Activate it:  
```
venv\Scripts\activate
```

Install the required dependencies:  
```
pip install -r requirements.txt
```

Create a .env file:  
```
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_index_name

# Configure the credentials required by your selected LLM provider.
LLM_API_KEY=your_llm_api_key
```

Start the FastAPI server:  
```
uvicorn main:app --reload
```

The RAG backend will run at:  
```
http://127.0.0.1:8000
```

### 3. Configure the frontend

Navigate to the frontend directory:  
```
cd frontend
```

Install dependencies:  
```
npm install
```

Start the development server:  
```
npm run dev
```

Open the application at:  
```
http://localhost:5173
```