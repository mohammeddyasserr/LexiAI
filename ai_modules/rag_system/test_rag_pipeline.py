from ai_modules.rag_system.rag_pipeline import RAGPipeline


def main():

    pipeline = RAGPipeline()

    print("=" * 80)
    print("LexiAI RAG Pipeline")
    print("=" * 80)

    while True:

        question = input("\nAsk a legal question (or type 'exit'): ").strip()

        if question.lower() in ["exit", "quit"]:

            print("\nGoodbye!")
            break

        print("\nRetrieving answer...\n")

        result = pipeline.answer_with_sources(question)

        # =====================================================
        # Query Processing
        # =====================================================

        print("=" * 80)
        print("QUERY PROCESSING")
        print("=" * 80)

        print(f"Question          : {result['question']}")
        print(f"Rewritten Query   : {result['debug']['rewritten_query']}")

        print("\nGenerated Queries:")

        for index, query in enumerate(
            result["debug"]["generated_queries"],
            start=1,
        ):

            print(f"{index}. {query}")

        # =====================================================
        # Answer
        # =====================================================

        print("\n" + "=" * 80)
        print("ANSWER")
        print("=" * 80)

        print(result["answer"])

        print(f"\nConfidence : {result['confidence']:.2f}")

        # =====================================================
        # Sources
        # =====================================================

        print("\n" + "=" * 80)
        print("SOURCES")
        print("=" * 80)

        if not result["sources"]:

            print("No sources found.")

        else:

            for index, source in enumerate(result["sources"], start=1):

                print(f"\nSource {index}")

                print(f"Contract : {source['contract_id']}")
                print(f"Section  : {source['section']}")
                print(f"Page     : {source['page']}")

        # =====================================================
        # Debug
        # =====================================================

        print("\n" + "=" * 80)
        print("DEBUG")
        print("=" * 80)

        debug = result["debug"]

        print(f"Processing Time : {debug['processing_time']} sec")
        print(f"Retrieved Chunks: {debug['retrieved_chunks']}")
        print(f"Reranked Chunks : {debug['reranked_chunks']}")

        print("\nRetrieval Details:")

        for index, source in enumerate(
            debug["retrieval_details"],
            start=1,
        ):

            print(f"\nChunk {index}")

            print(f"Chunk ID         : {source['chunk_id']}")
            print(f"Contract         : {source['contract_id']}")
            print(f"Section          : {source['section']}")
            print(f"Page             : {source['page']}")
            print(f"Similarity Score : {source['similarity_score']:.4f}")
            print(f"Cross Score      : {source['cross_score']:.4f}")

        print("\n" + "=" * 80)


if __name__ == "__main__":
    main()