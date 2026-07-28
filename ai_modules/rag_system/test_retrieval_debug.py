from ai_modules.rag_system.demo_loader import load_demo_data
from ai_modules.rag_system.index_service import index_contract
from ai_modules.rag_system.services import vector_store
from ai_modules.rag_system.rag_pipeline import RAGPipeline


def run_debug_test():
    print("=== [Debug Test] Step 1: Cleaning collection ===")
    vector_store.delete_collection()
    print("Collection deleted.")

    print("\n=== [Debug Test] Step 2: Loading and indexing a single contract ===")
    document, legal_info = load_demo_data()
    # Force a specific contract ID to test custom indexing and retrieval
    document.contract_id = 45
    for page in document.pages:
        pass

    # Re-build chunks inside chunker logic to verify
    print(f"Indexing contract_id={document.contract_id}...")
    index_res = index_contract(document, legal_info)
    print(f"Indexing result: {index_res}")
    assert index_res["status"] == "success", "Indexing contract failed!"

    print("\n=== [Debug Test] Step 3: Verifying Qdrant metadata & point mapping ===")
    all_chunks = vector_store.get_all_chunks()
    print(f"Total points in DB: {len(all_chunks)}")
    for point in all_chunks:
        payload = point.payload
        print(f"  Point ID: {point.id}")
        print(f"    chunk_id:    {payload.get('chunk_id')}")
        print(f"    contract_id: {payload.get('contract_id')}")
        print(f"    page:        {payload.get('page')}")
        print(f"    section:     {payload.get('section')}")

    print("\n=== [Debug Test] Step 4: Asking query and retrieving chunks ===")
    query = "What is the payment period?"
    pipeline = RAGPipeline()
    
    # Retrieve with contract_id constraint
    print(f"Searching with query: '{query}' and contract_id={document.contract_id}...")
    retrieved_points = pipeline.retriever.retrieve(query, contract_id=document.contract_id)
    
    print("\nRetrieved results (after threshold filtering):")
    for idx, r in enumerate(retrieved_points):
        payload = r.payload
        print(f"  Result #{idx}:")
        print(f"    Score:       {r.score:.4f}")
        print(f"    chunk_id:    {payload.get('chunk_id')}")
        print(f"    contract_id: {payload.get('contract_id')}")
        print(f"    page:        {payload.get('page')}")
        print(f"    Text:        {payload.get('text')}")

    print("\n=== [Debug Test] Step 5: answer_with_sources validation ===")
    rag_res = pipeline.answer_with_sources(query, contract_id=document.contract_id)
    print(f"RAG Answer: {rag_res['answer']}")
    print(f"Sources:    {rag_res['sources']}")
    print(f"Debug Info: {rag_res['debug']}")

    print("\n=== [Debug Test] Step 6: Verifying isolation from other contract_ids ===")
    # Search for contract_id=999 (which does not exist)
    empty_points = pipeline.retriever.retrieve(query, contract_id=999)
    print(f"Retrieved points for non-existent contract_id=999: {len(empty_points)}")
    assert len(empty_points) == 0, "Leaked chunks from another contract!"

    print("\nDEBUG TEST PASSED SUCCESSFULLY! ✅")


if __name__ == "__main__":
    run_debug_test()
