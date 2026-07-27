from ai_modules.rag_system.demo_loader import load_demo_data
from ai_modules.rag_system.chunking import SmartLegalChunker
from ai_modules.rag_system.metadata import MetadataEnricher
from ai_modules.rag_system.embedding_service import EmbeddingService


def main():

    document, legal = load_demo_data()

    # ----------------------------------------
    # Chunking
    # ----------------------------------------

    chunker = SmartLegalChunker()

    chunks = chunker.chunk_document(document)

    # ----------------------------------------
    # Shared Embedding Service
    # ----------------------------------------

    embedding_service = EmbeddingService()

    # ----------------------------------------
    # Metadata Enrichment
    # ----------------------------------------

    enricher = MetadataEnricher(
        embedding_service
    )

    enriched_chunks = enricher.enrich(
        chunks,
        legal
    )

    # ----------------------------------------
    # Print Results
    # ----------------------------------------

    print(f"\nEmbedding Model : {embedding_service.model_name}")
    print(f"Embedding Dimension : {embedding_service.get_dimension()}")

    print(f"\nTotal Chunks: {len(enriched_chunks)}\n")

    for chunk in enriched_chunks:

        print("=" * 80)

        print(f"Chunk ID : {chunk.chunk_id}")
        print(f"Section  : {chunk.section}")
        print(f"Page     : {chunk.page}")

        print("\nText:")
        print(chunk.text)

        print("\nMetadata:")

        for key, value in chunk.metadata.items():
            print(f"{key}: {value}")

        print()


if __name__ == "__main__":
    main()