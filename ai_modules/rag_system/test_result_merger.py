from ai_modules.rag_system.vector_store import VectorStore
from ai_modules.rag_system.retriever import Retriever
from ai_modules.rag_system.result_merger import ResultMerger


def main():

    vector_store = VectorStore()

    retriever = Retriever(
        vector_store=vector_store,
        top_k=5,
    )

    merger = ResultMerger()

    queries = [

        "payment due date",

        "invoice payment",

        "payment terms",

        "payment deadline",

    ]

    all_results = []

    print("=" * 80)
    print("RETRIEVAL RESULTS")
    print("=" * 80)

    for query in queries:

        print(f"\nQuery: {query}")

        results = retriever.retrieve(query)

        all_results.append(results)

        for result in results:

            payload = result.payload

            print(
                f"  {payload['chunk_id']} | "
                f"{payload['section']} | "
                f"{result.score:.4f}"
            )

    print("\n")
    print("=" * 80)
    print("MERGED RESULTS")
    print("=" * 80)

    merged = merger.merge(all_results)

    for i, result in enumerate(merged, start=1):

        payload = result.payload

        print(f"\nResult {i}")

        print(f"Chunk ID : {payload['chunk_id']}")
        print(f"Section  : {payload['section']}")
        print(f"Score    : {result.score:.4f}")

    print("\n")
    print(f"Total Unique Chunks: {len(merged)}")


if __name__ == "__main__":
    main()