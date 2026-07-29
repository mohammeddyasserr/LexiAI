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

        model_name="cross-encoder/ms-marco-MiniLM-L6-v2",

    ):

        self.model_name = model_name

        self.model = CrossEncoder(model_name)



    def rerank(

        self,

        question: str,

        retrieved_chunks: List,

        top_k: int = 5,

    ):


        if not retrieved_chunks:

            return []


        print(
            f"[Reranker Debug] Before reranking: {len(retrieved_chunks)} chunks"
        )


        pairs = []


        for chunk in retrieved_chunks:

            text = chunk.payload.get("text","")

            pairs.append(
                (
                    question,
                    text
                )
            )



        scores = self.model.predict(pairs)



        ranked=[]


        for chunk,score in zip(retrieved_chunks,scores):

            ranked.append(

                RankedResult(

                    point=chunk,

                    similarity_score=float(chunk.score),

                    cross_score=float(score)

                )

            )



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


        # لا تعمل filtering هنا

        final = ranked[:top_k]


        print(
            f"[Reranker Debug] Final chunks: {len(final)}"
        )


        return final



    def get_model_name(self):

        return self.model_name