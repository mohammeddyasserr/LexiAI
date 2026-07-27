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


class RAGPipeline:
    """
    Complete Retrieval-Augmented Generation Pipeline.

    Pipeline

    User Question
            ↓
    Query Rewriter
            ↓
    Multi Query Generator
            ↓
    Retriever (Multiple Queries)
            ↓
    Merge Results
            ↓
    Cross Encoder Re-ranking
            ↓
    Context Builder
            ↓
    Prompt Builder
            ↓
    Generator (Ollama)
            ↓
    Final Answer
    """

    def __init__(self):

        self.vector_store = VectorStore()

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
        context: str
    ) -> str:

        user_prompt = USER_PROMPT_TEMPLATE.format(
            context=context,
            question=question
        )

        return f"{SYSTEM_PROMPT}\n\n{user_prompt}"

    # ======================================================

    def answer(
        self,
        question: str
    ) -> str:

        # -----------------------------------------
        # Rewrite Query
        # -----------------------------------------

        rewritten_question = self.query_rewriter.rewrite(
            question
        )

        # -----------------------------------------
        # Multi Query Generation
        # -----------------------------------------

        queries = self.multi_query.generate(
            rewritten_question
        )

        if rewritten_question not in queries:
            queries.insert(0, rewritten_question)

        # -----------------------------------------
        # Retrieve using every query
        # -----------------------------------------

        all_results = []

        for query in queries:

            results = self.retriever.retrieve(query)

            all_results.append(results)

        # -----------------------------------------
        # Merge duplicated chunks
        # -----------------------------------------

        retrieved_chunks = self.result_merger.merge(
            all_results
        )

        if not retrieved_chunks:

            return "No relevant information was found."

        # -----------------------------------------
        # Cross Encoder Re-ranking
        # -----------------------------------------

        reranked_chunks = self.reranker.rerank(
            question=question,
            retrieved_chunks=retrieved_chunks,
            top_k=5,
        )

        if not reranked_chunks:

            return "No relevant information was found."

        # -----------------------------------------
        # Build Context
        # -----------------------------------------

        context = self.context_builder.build(

            [result.point for result in reranked_chunks]

        )

        # -----------------------------------------
        # Build Prompt
        # -----------------------------------------

        prompt = self.build_prompt(
            question,
            context
        )

        # -----------------------------------------
        # Generate Answer
        # -----------------------------------------

        answer = self.generator.generate(
            prompt
        )

        return answer

    # ======================================================

    def answer_with_sources(
        self,
        question: str
    ):
        """
        Returns the generated answer together with
        the retrieved chunks.
        """

        # -----------------------------------------
        # Rewrite Query
        # -----------------------------------------

        rewritten_question = self.query_rewriter.rewrite(
            question
        )

        # -----------------------------------------
        # Multi Query Generation
        # -----------------------------------------

        queries = self.multi_query.generate(
            rewritten_question
        )

        if rewritten_question not in queries:
            queries.insert(0, rewritten_question)

        # -----------------------------------------
        # Retrieve using every query
        # -----------------------------------------

        all_results = []

        for query in queries:

            results = self.retriever.retrieve(query)

            all_results.append(results)

        # -----------------------------------------
        # Merge duplicated chunks
        # -----------------------------------------

        retrieved_chunks = self.result_merger.merge(
            all_results
        )

        if not retrieved_chunks:

            return {

                "original_question": question,

                "rewritten_question": rewritten_question,

                "queries": queries,

                "answer": "No relevant information was found.",

                "sources": []

            }

        # -----------------------------------------
        # Cross Encoder Re-ranking
        # -----------------------------------------

        reranked_chunks = self.reranker.rerank(

            question=question,

            retrieved_chunks=retrieved_chunks,

            top_k=5,

        )

        if not reranked_chunks:

            return {

                "original_question": question,

                "rewritten_question": rewritten_question,

                "queries": queries,

                "answer": "No relevant information was found.",

                "sources": []

            }

        # -----------------------------------------
        # Build Context
        # -----------------------------------------

        context = self.context_builder.build(

            [result.point for result in reranked_chunks]

        )

        # -----------------------------------------
        # Build Prompt
        # -----------------------------------------

        prompt = self.build_prompt(

            question,

            context

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

        sources = []

        for result in reranked_chunks:

            payload = result.point.payload

            sources.append({

                "chunk_id": payload["chunk_id"],

                "contract_id": payload["contract_id"],

                "section": payload["section"],

                "page": payload["page"],

                "similarity_score": result.similarity_score,

                "cross_score": result.cross_score,

            })

        return {

            "original_question": question,

            "rewritten_question": rewritten_question,

            "queries": queries,

            "answer": answer,

            "sources": sources

        }
        