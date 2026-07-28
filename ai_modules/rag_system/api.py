from ai_modules.legal_nlp.pipeline import sections_entities_pipeline
from fastapi import FastAPI
from pydantic import BaseModel

from ai_modules.rag_system.rag_pipeline import RAGPipeline
from ai_modules.rag_system.schemas import DocumentInput, LegalInfo, IndexContractRequest
from ai_modules.rag_system.index_service import index_contract


# =====================================================
# FastAPI App
# =====================================================

app = FastAPI(

    title="LexiAI API",

    description="Advanced Legal RAG API",

    version="1.0.0",

)

# =====================================================
# Load Pipeline Once
# (Internally uses the shared VectorStore singleton
#  from services.py — no new QdrantClient created)
# =====================================================

pipeline = RAGPipeline()

# =====================================================
# Request Schema
# =====================================================

class QuestionRequest(BaseModel):

    question: str

    debug: bool = False


class ChatRequest(BaseModel):

    question: str



# =====================================================
# Health Check
# =====================================================

@app.get("/")
def root():

    return {

        "message": "LexiAI API is running."

    }


# =====================================================
# Ask Endpoint
# =====================================================

@app.post("/ask")
def ask(request: QuestionRequest):

    result = pipeline.answer_with_sources(

        request.question

    )

    # -------------------------------------------------
    # Return Full Debug Response
    # -------------------------------------------------

    if request.debug:

        return result

    # -------------------------------------------------
    # Return Frontend Response
    # -------------------------------------------------

    return {

        "status": result["status"],

        "question": result["question"],

        "answer": result["answer"],

        "confidence": result["confidence"],

        "sources": result["sources"],

    }


# =====================================================
# Index Contract Endpoint
# =====================================================

@app.post("/contracts/index")
def index_contract_endpoint(request: IndexContractRequest):

    document, legal_info = sections_entities_pipeline(request.file)

    return index_contract(document, legal_info)

   
# =====================================================
# Chat Endpoint
# =====================================================

@app.post("/chat")
def chat(request: ChatRequest):

    return pipeline.answer_with_sources(request.question)