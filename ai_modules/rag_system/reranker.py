from dataclasses import dataclass
from typing import List

from sentence_transformers import CrossEncoder


@dataclass
class RankedResult:
    point: object
    similarity_score: float
    cross_score: float


class ReRanker:

    def __init__(
        self,
        model_name: str = "cross-encoder/ms-marco-MiniLM-L6-v2",
        score_margin: float = 3.0,
    ):

        self.model_name = model_name
        self.score_margin = score_margin
        self.model = CrossEncoder(model_name)

    # ======================================================

    def rerank(
        self,
        question: str,
        retrieved_chunks: List,
        top_k: int = 15,
    ):

        if not retrieved_chunks:
            return []

        print(
            f"[Reranker Debug] Before reranking: {len(retrieved_chunks)} chunks"
        )

        # ------------------------------------------
        # Build (question, chunk) pairs
        # ------------------------------------------

        pairs = []

        for chunk in retrieved_chunks:

            text = chunk.payload.get("text", "")

            pairs.append(
                (
                    question,
                    text,
                )
            )

        # ------------------------------------------
        # Cross Encoder prediction
        # ------------------------------------------

        scores = self.model.predict(pairs)

        # ------------------------------------------
        # Build ranked results
        # ------------------------------------------

        ranked = []

        for chunk, score in zip(retrieved_chunks, scores):

            ranked.append(

                RankedResult(

                    point=chunk,

                    similarity_score=float(chunk.score),

                    cross_score=float(score),

                )

            )

        if not ranked:
            return []

        # ------------------------------------------
        # Sort by CrossEncoder score
        # ------------------------------------------

        ranked.sort(
            key=lambda x: x.cross_score,
            reverse=True,
        )

        print("[Reranker Debug] Sorted results:")

        for r in ranked:

            print(
                f"chunk={r.point.payload.get('chunk_id')} "
                f"cross={r.cross_score:.4f} "
                f"sim={r.similarity_score:.4f}"
            )

        # ------------------------------------------
        # Dynamic filtering
        # ------------------------------------------

        best_score = ranked[0].cross_score

        filtered = [

            r

            for r in ranked

            if r.cross_score >= best_score - self.score_margin

        ]

        # Always keep at least one result

        if not filtered:

            filtered = ranked[:1]

        # Never exceed top_k

        final = filtered[:top_k]

        # ------------------------------------------
        # Debug
        # ------------------------------------------

        print(
            f"[Reranker Debug] Best score: {best_score:.4f}"
        )

        print(
            f"[Reranker Debug] After dynamic filtering: {len(filtered)} chunks"
        )

        print(
            f"[Reranker Debug] Final chunks: {len(final)}"
        )

        return final

    # ======================================================

    def get_model_name(self):

        return self.model_name