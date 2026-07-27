from ai_modules.rag_system.multi_query import MultiQueryGenerator


def main():

    generator = MultiQueryGenerator()

    print("=" * 80)
    print("MULTI QUERY GENERATOR")
    print("=" * 80)

    while True:

        question = input("\nQuestion: ").strip()

        if question.lower() in ["exit", "quit"]:

            break

        queries = generator.generate(question)

        print("\nGenerated Queries:\n")

        for index, query in enumerate(queries, start=1):

            print(f"{index}. {query}")

        print("\n" + "=" * 80)


if __name__ == "__main__":
    main()