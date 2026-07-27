from ai_modules.rag_system.demo_loader import load_demo_data
from ai_modules.rag_system.chunking import SmartLegalChunker
from ai_modules.rag_system.metadata import MetadataEnricher
from ai_modules.rag_system.embedding_service import EmbeddingService


def main():

    document, legal = load_demo_data()

    # ------------------------------------------
    # 1. Chunking
    # ------------------------------------------

    chunker = SmartLegalChunker()

    chunks = chunker.chunk_document(document)

    # ------------------------------------------
    # 2. Shared Embedding Service
    # ------------------------------------------

    embedding_service = EmbeddingService()

    # ------------------------------------------
    # 3. Metadata Enrichment
    # ------------------------------------------

    enricher = MetadataEnricher(
        embedding_service
    )

    chunks = enricher.enrich(chunks, legal)

    # ------------------------------------------
    # 4. Embeddings
    # ------------------------------------------

    print(f"\nEmbedding Model     : {embedding_service.get_model_name()}")
    print(f"Embedding Dimension : {embedding_service.get_dimension()}")

    print(f"\nTotal Chunks: {len(chunks)}")

    for chunk in chunks:

        embedding = embedding_service.embed_text(chunk.text)

        print("\n" + "=" * 80)

        print(f"Chunk ID : {chunk.chunk_id}")
        print(f"Section  : {chunk.section}")
        print(f"Page     : {chunk.page}")

        print("\nText:")
        print(chunk.text)

        print("\nMetadata:")
        print(chunk.metadata)

        print(f"\nEmbedding Length : {len(embedding)}")

        print("First 5 Values:")
        print(embedding[:5])


if __name__ == "__main__":
    main()