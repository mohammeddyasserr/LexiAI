from ai_modules.rag_system.demo_loader import load_demo_data
from ai_modules.rag_system.index_service import index_contract
from ai_modules.rag_system.services import vector_store
from ai_modules.rag_system.rag_pipeline import RAGPipeline
from ai_modules.rag_system.query_rewriter import QueryRewriter


def main():

    # ======================================================
    # Single shared VectorStore from services.py
    # ======================================================

    # ======================================================
    # Step 1 - Clean the database
    # ======================================================

    print("=== Step 1: Cleaning VectorStore ===")

    before = vector_store.count()
    print(f"Points before clean : {before}")

    vector_store.delete_collection()
    print("Collection deleted.\n")

    # ======================================================
    # Step 2 - Load Demo Data
    # ======================================================

    print("=== Step 2: Loading Demo Data ===")

    document, legal_info = load_demo_data()

    print(f"Contract ID : {document.contract_id}")
    print(f"Pages       : {len(document.pages)}")
    print(f"Sections    : {len(legal_info.sections)}")
    print(f"Entities    : {len(legal_info.entities)}")

    # ======================================================
    # Step 3 - Run index_contract()
    # ======================================================

    print("\n=== Step 3: Running index_contract() ===")

    result = index_contract(document, legal_info)

    print(f"Status         : {result['status']}")
    print(f"Contract ID    : {result['contract_id']}")
    print(f"Indexed Chunks : {result['indexed_chunks']}")

    assert result["status"] == "success", "Indexing failed!"
    assert result["indexed_chunks"] > 0, "No chunks were indexed!"

    # ======================================================
    # Step 4 - Verify Chunks in VectorStore
    # ======================================================

    print("\n=== Step 4: Verifying VectorStore Contents ===")

    all_chunks = vector_store.get_all_chunks()
    count = vector_store.count()

    print(f"Total Points in DB : {count}")
    assert count > 0, "Expected Qdrant points_count > 0!"

    for point in all_chunks:
        p = point.payload
        print(f"  Point ID : {point.id}")
        print(f"  Chunk ID : {p['chunk_id']}")
        print(f"  Contract : {p['contract_id']}   Page: {p['page']}   Section: {p['section']!r}")
        print(f"  Text     : {p['text'][:70]}")
        print()

    # ======================================================
    # Step 5 - Search Test
    # ======================================================

    print("=== Step 5: Search Test ===")

    query = "What is the payment period?"
    results = vector_store.search(query, limit=3)

    print(f"Query : {query}\n")

    found_correct_chunk = False
    for r in results:
        p = r.payload
        print(f"  Score    : {r.score:.4f}   Chunk ID : {p['chunk_id']}   Page : {p['page']}")
        print(f"  Text     : {p['text']}")
        print()
        if "thirty calendar days" in p["text"] or "Payment shall be made" in p["text"]:
            found_correct_chunk = True

    assert found_correct_chunk, "Did not find the expected payment period chunk!"

    # ======================================================
    # Step 6 - RAG Answer Test
    # ======================================================

    print("=== Step 6: RAG Answer Test ===")

    pipeline = RAGPipeline()
    rag_res = pipeline.answer_with_sources(query)

    print("RAG Result:")
    print(f"  Status     : {rag_res['status']}")
    print(f"  Answer     : {rag_res['answer']}")
    print(f"  Confidence : {rag_res['confidence']}")
    print(f"  Sources    : {rag_res['sources']}")
    print(f"  Debug Info : {rag_res['debug']}")
    print()

    assert rag_res["status"] == "success", "RAG pipeline failed!"
    assert len(rag_res["sources"]) > 0, "RAG pipeline returned no sources!"

    # ======================================================
    # Step 7 - QueryRewriter Unavailable Fallback Test
    # ======================================================

    print("=== Step 7: QueryRewriter Unavailable Fallback Test ===")

    # Instantiate rewriter with enable_query_rewrite = False to simulate query rewrite bypass/unavailable state
    disabled_rewriter = QueryRewriter(enable_query_rewrite=False)
    fallback_pipeline = RAGPipeline()
    fallback_pipeline.query_rewriter = disabled_rewriter

    fallback_res = fallback_pipeline.answer_with_sources(query)

    print("RAG Fallback Result:")
    print(f"  Status     : {fallback_res['status']}")
    print(f"  Answer     : {fallback_res['answer']}")
    print(f"  Sources    : {fallback_res['sources']}")
    print(f"  Debug Info : {fallback_res['debug']}")
    print()

    assert fallback_res["status"] == "success", "Fallback pipeline failed!"
    assert fallback_res["debug"]["rewritten_question"] == query, "QueryRewriter did not fall back to original question!"

    print("ALL TESTS PASSED SUCCESSFULLY! ✅")


if __name__ == "__main__":
    main()
