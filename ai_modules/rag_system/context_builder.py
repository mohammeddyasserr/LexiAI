from typing import List


class ContextBuilder:
    """
    Builds the final context passed to the LLM.

    Pipeline

    Retrieved Chunks
            ↓
    Sort / Format
            ↓
    Concatenate
            ↓
    Final Context
    """

    def __init__(self):
        pass

    # ======================================================

    def build(
        self,
        retrieved_chunks: List
    ) -> str:
        """
        Build a formatted context string from retrieved chunks.

        Parameters
        ----------
        retrieved_chunks : List
            Results returned by the Retriever.

        Returns
        -------
        str
            Context ready to be inserted into the LLM prompt.
        """

        if not retrieved_chunks:
            return "No relevant context found."

        sections = []

        for index, result in enumerate(retrieved_chunks, start=1):

            payload = result.payload

            section = (
                f"[Chunk {index}]\n\n"
                f"Chunk ID : {payload['chunk_id']}\n"
                f"Contract : {payload['contract_id']}\n"
                f"Section  : {payload['section']}\n"
                f"Page     : {payload['page']}\n\n"
                f"{payload['text']}"
            )

            sections.append(section)

        separator = "\n\n" + "-" * 80 + "\n\n"

        return separator.join(sections)