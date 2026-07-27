from ai_modules.rag_system.demo_loader import load_demo_data
from ai_modules.rag_system.chunking import SmartLegalChunker

document, legal = load_demo_data()

chunker = SmartLegalChunker()

chunks = chunker.chunk_document(document)

print(f"\nTotal Chunks: {len(chunks)}")

for chunk in chunks:

    print("\n" + "=" * 80)

    print(f"Chunk ID      : {chunk.chunk_id}")
    print(f"Parent ID     : {chunk.parent_id}")
    print(f"Contract ID   : {chunk.contract_id}")
    print(f"Section       : {chunk.section}")
    print(f"Page          : {chunk.page}")
    print(f"Split Method  : {chunk.split_method}")
    print(f"Start Char    : {chunk.start_char}")
    print(f"End Char      : {chunk.end_char}")
    print(f"Importance    : {chunk.importance}")

    print("\nText:")
    print(chunk.text)

    print("\nMetadata:")
    print(chunk.metadata)