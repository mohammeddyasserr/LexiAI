from ai_modules.rag_system.demo_loader import load_demo_data
from ai_modules.rag_system.chunking import SmartLegalChunker
from ai_modules.rag_system.metadata import MetadataEnricher
from ai_modules.rag_system.embedding_service import EmbeddingService
from ai_modules.rag_system.vector_store import VectorStore


def main():

    # -----------------------------------------
    # Load Demo Data
    # -----------------------------------------

    document, legal = load_demo_data()

    # -----------------------------------------
    # Chunking
    # -----------------------------------------

    chunker = SmartLegalChunker()
    chunks = chunker.chunk_document(
        document,
        legal,
    )

    # -----------------------------------------
    # Metadata
    # -----------------------------------------

    embedding_service = EmbeddingService()

    enricher = MetadataEnricher(embedding_service)

    chunks = enricher.enrich(chunks, legal)

    # -----------------------------------------
    # Store
    # -----------------------------------------

    store = VectorStore()

    store.add_chunks(chunks)

    # -----------------------------------------
    # Show Stored Chunks
    # -----------------------------------------

    print("\nStored Chunks:\n")

    stored_chunks = store.get_all_chunks()

    for point in stored_chunks:

        payload = point.payload

        print("=" * 80)

        print(f"Point ID  : {point.id}")
        print(f"Chunk ID  : {payload['chunk_id']}")
        print(f"Section   : {payload['section']}")
        print(f"Page      : {payload['page']}")

        print("\nText:")
        print(payload["text"])

        print("\nMetadata:")
        print(payload["metadata"])

    print("\n")
    print(f"Total Stored Chunks : {len(stored_chunks)}")

    # -----------------------------------------
    # Semantic Search Test
    # -----------------------------------------

    query = "When should the invoice be paid?"

    print("\n")
    print("=" * 80)
    print("Semantic Search")
    print("=" * 80)
    print(f"Query: {query}\n")

    results = store.search(query)

    for result in results:

        payload = result.payload

        print("-" * 80)
        print(f"Score    : {result.score:.4f}")
        print(f"Chunk ID : {payload['chunk_id']}")
        print(f"Section  : {payload['section']}")
        print(f"Page     : {payload['page']}")
        print(f"Text     : {payload['text']}")


if __name__ == "__main__":
    main()