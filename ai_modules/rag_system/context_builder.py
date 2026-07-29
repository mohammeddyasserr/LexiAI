from typing import List
import re


class ContextBuilder:
    """
    Builds the final context passed to the LLM.

    Pipeline

    Re-ranked Chunks
            ↓
    Restore Document Order
            ↓
    Format Context
            ↓
    Final Context
    """

    def __init__(self):
        pass

    # ======================================================

    def build(
        self,
        retrieved_chunks: List,
    ) -> str:
        """
        Build a formatted context string from retrieved chunks.
        """

        if not retrieved_chunks:
            return "No relevant context found."

        # ==========================================
        # Restore original document order
        # ==========================================

        def get_chunk_number(chunk):

            chunk_id = chunk.payload.get("chunk_id", "")

            match = re.search(r"_(\d+)$", chunk_id)

            if match:
                return int(match.group(1))

            return 0

        retrieved_chunks = sorted(

            retrieved_chunks,

            key=lambda chunk: (

                chunk.payload.get("page", 0),

                get_chunk_number(chunk),

            ),

        )

        # ==========================================
        # Build formatted context
        # ==========================================

        sections = []

        for index, result in enumerate(retrieved_chunks, start=1):

            payload = result.payload

            section = f"""
==============================
Excerpt {index}
==============================

Contract ID : {payload.get("contract_id")}
Section     : {payload.get("section", "Unknown")}
Page        : {payload.get("page")}

Clause Text:
{payload.get("text", "").strip()}
"""

            sections.append(section.strip())

        return "\n\n".join(sections)