import time
import math

from ai_modules.rag_system.vector_store import VectorStore
from ai_modules.rag_system.retriever import Retriever
from ai_modules.rag_system.query_rewriter import QueryRewriter
from ai_modules.rag_system.multi_query import MultiQueryGenerator
from ai_modules.rag_system.result_merger import ResultMerger
from ai_modules.rag_system.reranker import ReRanker
from ai_modules.rag_system.context_builder import ContextBuilder
from ai_modules.rag_system.generator import Generator
from ai_modules.rag_system.prompts import (
    SYSTEM_PROMPT,
    USER_PROMPT_TEMPLATE,
)
from ai_modules.rag_system.services import vector_store as _shared_vector_store


class RAGPipeline:
    """
    Advanced Legal RAG Pipeline

    Pipeline

    User Question
            ↓
    Query Rewriter
            ↓
    Multi Query Generation
            ↓
    Dense Retrieval
            ↓
    Merge Results
            ↓
    Cross Encoder Re-ranking
            ↓
    Cross Score Filtering
            ↓
    Context Builder
            ↓
    Prompt Builder
            ↓
    Generator
            ↓
    Final Answer
    """

    def __init__(self, vector_store: VectorStore = None):

        # Use the injected store, or fall back to the shared singleton
        self.vector_store = vector_store if vector_store is not None else _shared_vector_store

        self.retriever = Retriever(
            self.vector_store
        )

        self.query_rewriter = QueryRewriter()

        self.multi_query = MultiQueryGenerator()

        self.result_merger = ResultMerger()

        self.reranker = ReRanker()

        self.context_builder = ContextBuilder()

        self.generator = Generator()

    # ======================================================

    def build_prompt(
        self,
        question: str,
        context: str,
    ) -> str:

        user_prompt = USER_PROMPT_TEMPLATE.format(
            context=context,
            question=question,
        )

        return f"{SYSTEM_PROMPT}\n\n{user_prompt}"

    # ======================================================

    def _run_pipeline(
        self,
        question: str,
        contract_id: int | None = None,
    ):

        # -----------------------------------------
        # Rewrite Query
        # -----------------------------------------

        try:
            rewritten_question = self.query_rewriter.rewrite(
                question
            )
        except Exception as e:
            print(f"[RAGPipeline Warning] Query rewrite failed: {e}. Using original question.")
            rewritten_question = question

        # -----------------------------------------
        # Multi Query Generation
        # -----------------------------------------

        queries = self.multi_query.generate(
            rewritten_question,
            original_question=question,   # ← anchor topic filter on user's intent
        )

        if rewritten_question not in queries:
            queries.insert(0, rewritten_question)

        # -----------------------------------------
        # Dense Retrieval
        # -----------------------------------------

        all_results = []

        for query in queries:

            results = self.retriever.retrieve(
                query,
                contract_id=contract_id,
            )

            all_results.append(results)

        # -----------------------------------------
        # Merge Results
        # -----------------------------------------

        merged_results = self.result_merger.merge(
            all_results
        )

        if not merged_results:

            return {

                "rewritten_question": rewritten_question,

                "queries": queries,

                "retrieved_chunks": 0,

                "chunks": [],

            }

        # -----------------------------------------
        # Re-ranking
        # -----------------------------------------

        reranked_chunks = self.reranker.rerank(
            question=question,
            retrieved_chunks=merged_results,
            top_k=15,
        )
            
        if not reranked_chunks:

            return {

                "rewritten_question": rewritten_question,

                "queries": queries,

                "retrieved_chunks": len(merged_results),

                "chunks": [],

            }

        return {

            "rewritten_question": rewritten_question,

            "queries": queries,

            "retrieved_chunks": len(merged_results),

            "chunks": reranked_chunks,

        }

    # ======================================================

    def _build_sources(
        self,
        reranked_chunks,
    ):

        sources = []

        for result in reranked_chunks:

            payload = result.point.payload

            sources.append(

                {

                    "contract_id": payload["contract_id"],

                    "page": payload["page"],

                    "chunk_id": payload["chunk_id"],
                    "section": payload.get("section"),

                    "similarity_score": round(
                        result.similarity_score,
                        4,
                    ),

                    "cross_score": round(
                        result.cross_score,
                        4,
                    ),

                }

            )

        return sources

    # ======================================================

    # ======================================================

    def _calculate_confidence(
    self,
    reranked_chunks,
) -> float:
        if not reranked_chunks:
            return 0.0

    # -----------------------------------------
    # Use the top 3 reranked chunks
    # -----------------------------------------

        top_chunks = reranked_chunks[:3]

        best_score = top_chunks[0].cross_score

        best_score = abs(best_score)  # Ensure it's positive

        avg_score = (
        sum(
            chunk.cross_score
            for chunk in top_chunks
        )
        / len(top_chunks)
    )
        avg_score = abs(avg_score)  # Ensure it's positive

    # -----------------------------------------
    # Weighted score
    # Give more importance to the best chunk
    # -----------------------------------------

        final_score = (
        0.7 * best_score
        + 0.3 * avg_score
    )
        

    # -----------------------------------------
    # Convert to confidence using sigmoid
    # -----------------------------------------

        confidence = 1 / (
        1 + math.exp(-final_score)
    )

        confidence = round(confidence * 100, 1)

        print(
        f"[Confidence] "
        f"best={best_score:.4f} "
        f"avg={avg_score:.4f} "
        f"confidence={confidence}%"
    )

        return confidence
        # ======================================================

    def answer(
        self,
        question: str,
        contract_id: int | None = None,
    ) -> str:

        pipeline = self._run_pipeline(question, contract_id=contract_id)

        reranked_chunks = pipeline["chunks"]

        if not reranked_chunks:
            return "No relevant information was found."

        # -----------------------------------------
        # Build Context
        # -----------------------------------------

        context = self.context_builder.build(

            [chunk.point for chunk in reranked_chunks]

        )

        # -----------------------------------------
        # Build Prompt
        # -----------------------------------------

        prompt = self.build_prompt(

            question,

            context,

        )

        # -----------------------------------------
        # Generate Answer
        # -----------------------------------------

        return self.generator.generate(prompt)

    # ======================================================

    def answer_with_sources(
        self,
        question: str,
        contract_id: int | None = None,
    ):

        start_time = time.perf_counter()

        try:

            pipeline = self._run_pipeline(question, contract_id=contract_id)

            reranked_chunks = pipeline["chunks"]

            rewritten_question = pipeline["rewritten_question"]

            queries = pipeline["queries"]

            retrieved_chunks = pipeline["retrieved_chunks"]

            # -----------------------------------------
            # No Results
            # -----------------------------------------

            if not reranked_chunks:

                elapsed = round(
                    time.perf_counter() - start_time,
                    3,
                )

                return {

                    "status": "not_found",

                    "question": question,

                    "answer": "No relevant information was found.",

                    "confidence": 0.0,

                    "sources": [],

                    "debug": {

                        "processing_time": elapsed,

                        "rewritten_query": rewritten_question,

                        "generated_queries": queries[1:],

                        "retrieved_chunks": retrieved_chunks,

                        "reranked_chunks": 0,

                        "original_question": question,

                        "rewritten_question": rewritten_question,

                        "retrieved_chunks_count": retrieved_chunks,

                        "filtered_chunks_count": 0,

                        "final_sources": [],

                    }

                }

            # -----------------------------------------
            # Build Context
            # -----------------------------------------

            context = self.context_builder.build(

                [chunk.point for chunk in reranked_chunks]

            )

            # -----------------------------------------
            # Build Prompt
            # -----------------------------------------

            prompt = self.build_prompt(

                question,

                context,

            )

            # -----------------------------------------
            # Generate Answer
            # -----------------------------------------

            answer = self.generator.generate(

                prompt

            )

            # -----------------------------------------
            # Sources
            # -----------------------------------------

            raw_sources = self._build_sources(

                reranked_chunks

            )

            frontend_sources = [

                {

                    "contract_id": source["contract_id"],
                    "section": source["section"],

                    "page": source["page"],

                }

                for source in raw_sources

            ]

            # -----------------------------------------
            # Confidence
            # -----------------------------------------

            confidence = self._calculate_confidence(

                reranked_chunks

            )

            # -----------------------------------------
            # Processing Time
            # -----------------------------------------

            elapsed = round(

                time.perf_counter() - start_time,

                3,

            )

            # -----------------------------------------
            # Final Response
            # -----------------------------------------

            return {

                "status": "success",

                "question": question,

                "answer": answer,

                "confidence": confidence,

                "sources": frontend_sources,

                "debug": {

                    "processing_time": elapsed,

                    "rewritten_query": rewritten_question,

                    "generated_queries": queries[1:],

                    "retrieved_chunks": retrieved_chunks,

                    "reranked_chunks": len(reranked_chunks),

                    "retrieval_details": raw_sources,

                    "original_question": question,

                    "rewritten_question": rewritten_question,

                    "retrieved_chunks_count": retrieved_chunks,

                    "filtered_chunks_count": len(reranked_chunks),

                    "final_sources": frontend_sources,

                }

            }

        except Exception as e:

            elapsed = round(time.perf_counter() - start_time, 3)

            print(f"[RAGPipeline Error] answer_with_sources failed: {e}")

            return {

                "status": "error",

                "question": question,

                "answer": "An internal error occurred while processing your question. Please try again.",

                "confidence": 0.0,

                "sources": [],

                "debug": {

                    "processing_time": elapsed,

                    "error": str(e),

                    "original_question": question,

                    "rewritten_question": question,

                    "retrieved_chunks_count": 0,

                    "filtered_chunks_count": 0,

                    "final_sources": [],

                }

            }