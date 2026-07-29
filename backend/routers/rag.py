from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from ai_modules.rag_system.rag_pipeline import RAGPipeline

router = APIRouter(prefix="/RAG", tags=["RAG"])
pipeline = RAGPipeline()

class QuestionRequest(BaseModel):

    question: str

    contract_id: str | None = None

    debug: bool = False




@router.post("/ask")
def ask(request: QuestionRequest):

    result = pipeline.answer_with_sources(

        request.question,

        contract_id=request.contract_id,

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