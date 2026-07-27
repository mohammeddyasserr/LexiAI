from ai_modules.rag_system.query_rewriter import QueryRewriter


def main():

    rewriter = QueryRewriter()

    print("=" * 80)
    print("LLM QUERY REWRITER")
    print("=" * 80)

    while True:

        question = input("\nQuestion: ").strip()

        if question.lower() == "exit":
            break

        rewritten = rewriter.rewrite(question)

        print("\nOriginal:")
        print(question)

        print("\nRewritten:")
        print(rewritten)


if __name__ == "__main__":
    main()