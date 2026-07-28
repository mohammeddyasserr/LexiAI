from ai_modules.rag_system.demo_loader import load_demo_data
from ai_modules.rag_system.index_service import index_contract
from ai_modules.rag_system.services import vector_store


def main():

    # ======================================================
    # Single shared VectorStore from services.py
    # (same instance used by the API at runtime)
    # ======================================================

    # ======================================================
    # Step 1 - Clean the database
    # ======================================================

    print("=== Cleaning VectorStore ===")

    before = vector_store.count()
    print(f"Points before clean : {before}")

    vector_store.delete_collection()
    print("Collection deleted.\n")

    # ======================================================
    # Step 2 - Load Demo Data
    # ======================================================

    print("=== Loading Demo Data ===")

    document, legal_info = load_demo_data()

    print(f"Contract ID : {document.contract_id}")
    print(f"Pages       : {len(document.pages)}")
    print(f"Sections    : {len(legal_info.sections)}")
    print(f"Entities    : {len(legal_info.entities)}")

    # ======================================================
    # Step 3 - Run index_contract()
    # (uses shared vector_store automatically)
    # ======================================================

    print("\n=== Running index_contract() ===")

    result = index_contract(document, legal_info)

    print(f"Status         : {result['status']}")
    print(f"Contract ID    : {result['contract_id']}")
    print(f"Indexed Chunks : {result['indexed_chunks']}")

    # ======================================================
    # Step 4 - Verify Chunks in VectorStore
    # ======================================================

    print("\n=== Verifying VectorStore Contents ===")

    all_chunks = vector_store.get_all_chunks()
    count = vector_store.count()

    print(f"Total Points in DB : {count}")
    print()

    for point in all_chunks:
        p = point.payload
        print(f"  Point ID : {point.id}")
        print(f"  Chunk ID : {p['chunk_id']}")
        print(f"  Contract : {p['contract_id']}   Page: {p['page']}   Section: {p['section']!r}")
        print(f"  Text     : {p['text'][:70]}")
        print()

    # ======================================================
    # Step 5 - Semantic Search Test
    # ======================================================

    print("=== Semantic Search Test ===")

    query = "When should the invoice be paid?"
    results = vector_store.search(query, limit=3)

    print(f"Query : {query}\n")

    for r in results:
        p = r.payload
        print(f"  Score    : {r.score:.4f}   Chunk ID : {p['chunk_id']}   Page : {p['page']}")
        print(f"  Text     : {p['text']}")
        print()

    # ======================================================
    # Step 6 - Idempotency check (index same contract twice)
    # ======================================================

    print("=== Idempotency Check (re-indexing same contract) ===")

    index_contract(document, legal_info)

    count_after = vector_store.count()

    print(f"Points after re-index : {count_after}")

    if count_after == count:
        print("PASS - Re-indexing same contract did NOT add duplicate points.")
    else:
        print(f"FAIL - Expected {count} points but got {count_after}!")


if __name__ == "__main__":
    main()
