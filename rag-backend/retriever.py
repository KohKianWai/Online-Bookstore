from tools import retrieve_by_vector, retrieve_by_author, retrieve_by_category, retrieve_by_title
from langchain_ollama import ChatOllama, OllamaEmbeddings
from typing import TypedDict, Annotated
from langchain_core.messages import AnyMessage, HumanMessage, AIMessage, SystemMessage
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from langgraph.prebuilt import tools_condition
from langgraph.graph import START, StateGraph
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_nvidia_ai_endpoints import ChatNVIDIA

import os

# =========================
# Ollama LLM
# =========================

# llm = ChatOllama(
#     model="llama3.1",
#     temperature=0
# )

# =========================
# Gemini LLM
# =========================

# llm = ChatGoogleGenerativeAI(
#     model="gemini-3.1-pro-preview",
#     api_key=os.environ["GOOGLE_API_KEY"],
#     temperature=0
# )

# =========================
# DeepSeek LLM
# =========================

llm = ChatNVIDIA(
    model="nvidia/nemotron-3.5-lightning-30b-a3b",
    api_key=os.environ["NVIDIA_API_KEY"],
    temperature=0,
)


# =========================
# Tools
# =========================

tools = [
    retrieve_by_author,
    retrieve_by_title,
    retrieve_by_category,
    retrieve_by_vector
]

llm_with_tools = llm.bind_tools(tools)

# =========================
# AgentState and Agent graph
# =========================

# Generate the AgentState and Agent graph
class AgentState(TypedDict):
    messages: Annotated[list[AnyMessage], add_messages]

def assistant(state: AgentState):
    return {
        "messages": [llm_with_tools.invoke(state["messages"])],
    }


# Build state graph
builder = StateGraph(AgentState)

# Define nodes
builder.add_node("assistant", assistant)
builder.add_node("tools", ToolNode(tools))

# Define edges
builder.add_edge(START, "assistant")
builder.add_conditional_edges(
    "assistant",
    tools_condition
)
builder.add_edge("tools", "assistant")
chatbot = builder.compile()