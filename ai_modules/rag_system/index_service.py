from ai_modules.rag_system.schemas import DocumentInput, LegalInfo
from ai_modules.rag_system.chunking import SmartLegalChunker
from ai_modules.rag_system.metadata import MetadataEnricher
from ai_modules.rag_system.vector_store import VectorStore
from ai_modules.rag_system.services import (
    embedding_service as _shared_embedding_service,
    vector_store as _shared_vector_store,
)



def index_contract(
    document: DocumentInput,
    legal_info: LegalInfo,
    vector_store: VectorStore = None,
):

    print(
        f"[IndexService] Starting indexing for contract_id={document.contract_id}"
    )


    try:


        # =============================================
        # 1. Chunking
        # =============================================

        print("[IndexService] Creating chunker...")

        chunker = SmartLegalChunker()


        print("[IndexService] Starting chunking...")


        chunks = chunker.chunk_document(
            document,
            legal_info
        )


        print(
            f"[IndexService] Chunking complete — {len(chunks)} chunks produced"
        )



        if not chunks:

            print(
                "[IndexService] WARNING: No chunks produced"
            )

            return {

                "status": "error",

                "contract_id": document.contract_id,

                "indexed_chunks": 0,

                "error": "No chunks were produced"

            }



        # =============================================
        # Verify chunks
        # =============================================

        print("[IndexService] Validating chunks...")


        for chunk in chunks:


            assert chunk.contract_id == document.contract_id


            assert chunk.page is not None



        print(
            "[IndexService] Chunk validation complete"
        )



        # =============================================
        # 2. Metadata enrichment
        # =============================================


        print(
            "[IndexService] Starting metadata enrichment..."
        )


        enricher = MetadataEnricher(
            _shared_embedding_service
        )


        chunks = enricher.enrich(
            chunks,
            legal_info
        )


        print(
            "[IndexService] Metadata enrichment complete"
        )



        # =============================================
        # 3. Vector Store
        # =============================================


        store = (

            vector_store

            if vector_store is not None

            else _shared_vector_store

        )


        print(
            "[IndexService] Clearing old vectors..."
        )


        store.clear_contract(
            document.contract_id
        )



        print(
            "[IndexService] Adding chunks to Qdrant..."
        )


        store.add_chunks(
            chunks
        )


        print(
            f"[IndexService] Indexing complete — {len(chunks)} chunks stored in Qdrant"
        )



        return {


            "status": "success",

            "contract_id": document.contract_id,

            "indexed_chunks": len(chunks)


        }



    except Exception as e:


        print(
            f"[IndexService] ERROR during indexing: {e}"
        )


        return {


            "status": "error",

            "contract_id": document.contract_id,

            "indexed_chunks": 0,

            "error": str(e)


        }