from ai_modules.rag_system.demo_loader import load_demo_data
from ai_modules.rag_system.chunking import SmartLegalChunker
from ai_modules.rag_system.embedding_service import EmbeddingService
from ai_modules.rag_system.metadata import MetadataEnricher
from ai_modules.rag_system.vector_store import VectorStore
from ai_modules.rag_system.retriever import Retriever
from ai_modules.rag_system.context_builder import ContextBuilder


def main():

    # -----------------------------------------
    # Load Demo Data
    # -----------------------------------------

    document, legal = load_demo_data()

    # -----------------------------------------
    # Chunking
    # -----------------------------------------

    chunker = SmartLegalChunker()

    chunks = chunker.chunk_document(document)

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
    # Retrieve
    # -----------------------------------------

    retriever = Retriever(store)

    results = retriever.retrieve(
        "When should the invoice be paid?"
    )

    # -----------------------------------------
    # Build Context
    # -----------------------------------------

    builder = ContextBuilder()

    context = builder.build(results)

    print("\n")
    print("=" * 80)
    print("FINAL CONTEXT")
    print("=" * 80)
    print()
    print(context)


if __name__ == "__main__":
    main()