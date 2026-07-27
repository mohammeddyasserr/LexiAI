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
        # Query Rewriting + Multi Query
        # =====================================================

        print("=" * 80)
        print("QUERY PROCESSING")
        print("=" * 80)

        print(f"Original Question : {result['original_question']}")
        print(f"Rewritten Query   : {result['rewritten_question']}")

        print("\nGenerated Queries:")

        for index, query in enumerate(result["queries"], start=1):

            print(f"{index}. {query}")

        # =====================================================
        # Answer
        # =====================================================

        print("\n" + "=" * 80)
        print("ANSWER")
        print("=" * 80)

        print(result["answer"])

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

                print(f"Chunk ID         : {source['chunk_id']}")
                print(f"Contract         : {source['contract_id']}")
                print(f"Section          : {source['section']}")
                print(f"Page             : {source['page']}")
                print(f"Similarity Score : {source['similarity_score']:.4f}")
                print(f"Cross Score      : {source['cross_score']:.4f}")

        print("\n" + "=" * 80)


if __name__ == "__main__":
    main()