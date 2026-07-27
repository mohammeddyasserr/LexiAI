from ai_modules.rag_system.vector_store import VectorStore
from ai_modules.rag_system.retriever import Retriever
from ai_modules.rag_system.reranker import ReRanker


def main():

    vector_store = VectorStore()

    retriever = Retriever(
        vector_store=vector_store,
        top_k=10,
    )

    reranker = ReRanker()

    question = "When should the invoice be paid?"

    print("\n")
    print("=" * 80)
    print("BEFORE RE-RANKING")
    print("=" * 80)

    retrieved = retriever.retrieve(question)

    for i, result in enumerate(retrieved, start=1):

        payload = result.payload

        print(f"\nResult {i}")

        print(f"Similarity : {result.score:.4f}")
        print(f"Chunk ID   : {payload['chunk_id']}")
        print(f"Section    : {payload['section']}")
        print(payload["text"])

    print("\n")
    print("=" * 80)
    print("AFTER CROSS ENCODER RE-RANKING")
    print("=" * 80)

    reranked = reranker.rerank(
        question=question,
        retrieved_chunks=retrieved,
        top_k=5,
    )

    for i, result in enumerate(reranked, start=1):

        payload = result.point.payload

        print(f"\nResult {i}")

        print(f"Similarity : {result.similarity_score:.4f}")
        print(f"Cross Score: {result.cross_score:.4f}")
        print(f"Chunk ID   : {payload['chunk_id']}")
        print(f"Section    : {payload['section']}")
        print(payload["text"])

    print("\n")
    print("=" * 80)
    print("Cross Encoder Model")
    print("=" * 80)
    print(reranker.get_model_name())


if __name__ == "__main__":
    main()