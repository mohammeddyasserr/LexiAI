from fastapi import FastAPI
from pydantic import BaseModel

from ai_modules.rag_system.rag_pipeline import RAGPipeline


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
# =====================================================

pipeline = RAGPipeline()

# =====================================================
# Request Schema
# =====================================================

class QuestionRequest(BaseModel):

    question: str

    debug: bool = False


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