from dataclasses import dataclass
from typing import List

from sentence_transformers import CrossEncoder


@dataclass
class RankedResult:
    """
    Holds both similarity score (Qdrant)
    and cross-encoder score.
    """

    point: object

    similarity_score: float

    cross_score: float


class ReRanker:
    """
    Cross Encoder Re-ranker.
    """

    def __init__(
        self,
        model_name: str = "cross-encoder/ms-marco-MiniLM-L6-v2",
        cross_score_threshold: float = -2.0,
    ):

        self.model_name = model_name
        self.cross_score_threshold = cross_score_threshold

        self.model = CrossEncoder(model_name)

    # ======================================================

    def rerank(
        self,
        question: str,
        retrieved_chunks: List,
        top_k: int = 5,
    ) -> List[RankedResult]:

        if not retrieved_chunks:
            return []

        sentence_pairs = [

            (question, result.payload["text"])

            for result in retrieved_chunks

        ]

        scores = self.model.predict(sentence_pairs)

        ranked = []

        for result, cross_score in zip(retrieved_chunks, scores):

            ranked.append(

                RankedResult(

                    point=result,

                    similarity_score=float(result.score),

                    cross_score=float(cross_score),

                )

            )

        # -----------------------------------------
        # Sort by Cross Encoder Score
        # -----------------------------------------

        ranked.sort(

            key=lambda x: x.cross_score,

            reverse=True

        )

        # -----------------------------------------
        # Filter weak matches
        # -----------------------------------------

        filtered = [

            result

            for result in ranked

            if result.cross_score >= self.cross_score_threshold

        ]

        return filtered[:top_k]

    # ======================================================

    def get_model_name(self):

        return self.model_name

    # ======================================================

    def get_threshold(self):

        return self.cross_score_threshold