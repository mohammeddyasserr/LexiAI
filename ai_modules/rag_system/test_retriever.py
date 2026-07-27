from ai_modules.rag_system.demo_loader import load_demo_data
from ai_modules.rag_system.chunking import SmartLegalChunker
from ai_modules.rag_system.embedding_service import EmbeddingService
from ai_modules.rag_system.metadata import MetadataEnricher
from ai_modules.rag_system.vector_store import VectorStore
from ai_modules.rag_system.retriever import Retriever


def main():

    # ----------------------------------------
    # Load Demo Data
    # ----------------------------------------

    document, legal = load_demo_data()

    # ----------------------------------------
    # Chunking
    # ----------------------------------------

    chunker = SmartLegalChunker()

    chunks = chunker.chunk_document(document)

    # ----------------------------------------
    # Metadata
    # ----------------------------------------

    embedding_service = EmbeddingService()

    enricher = MetadataEnricher(
        embedding_service
    )

    chunks = enricher.enrich(
        chunks,
        legal
    )

    # ----------------------------------------
    # Vector Store
    # ----------------------------------------

    store = VectorStore()

    store.add_chunks(chunks)

    # ----------------------------------------
    # Retriever
    # ----------------------------------------

    retriever = Retriever(
        store,
        top_k=3
    )

    question = "When should the invoice be paid?"

    results = retriever.retrieve(question)

    print("\n")
    print("=" * 80)
    print("Retriever")
    print("=" * 80)

    print(f"Question: {question}")

    print("\nResults:\n")

    for result in results:

        payload = result.payload

        print("-" * 80)

        print(f"Score   : {result.score:.4f}")

        print(f"Chunk ID: {payload['chunk_id']}")

        print(f"Section : {payload['section']}")

        print(f"Page    : {payload['page']}")

        print("\nText:")

        print(payload["text"])

        print()


if __name__ == "__main__":
    main()