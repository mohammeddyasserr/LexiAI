from typing import List


class ResultMerger:
    """
    Merges retrieved results coming from
    multiple search queries.

    Responsibilities:

        - Remove duplicate chunks
        - Keep the highest similarity score
        - Sort by similarity score
    """

    # ======================================================

    def merge(
        self,
        all_results: List[List],
    ) -> List:

        merged = {}

        for results in all_results:

            for result in results:

                payload = result.payload

                chunk_id = payload["chunk_id"]

                # أول مرة نشوف الـ Chunk
                if chunk_id not in merged:

                    merged[chunk_id] = result

                # لو ظهر مرة تانية نحتفظ بالأعلى Score
                elif result.score > merged[chunk_id].score:

                    merged[chunk_id] = result

        
        return  list(merged.values())