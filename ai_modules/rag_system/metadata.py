from typing import List

from sklearn.metrics.pairwise import cosine_similarity

from ai_modules.rag_system.chunking import Chunk
from ai_modules.rag_system.schemas import LegalInfo
from ai_modules.rag_system.embedding_service import EmbeddingService


class MetadataEnricher:
    """
    Enriches document chunks with metadata using semantic similarity.

    Pipeline

    Chunks
        ↓
    Embedding Service
        ↓
    Clause Embeddings
        ↓
    Cosine Similarity
        ↓
    Best Matching Clause
        ↓
    Attach Metadata
    """

    def __init__(self, embedding_service: EmbeddingService):

        self.embedding_service = embedding_service

    # ======================================================

    def enrich(
        self,
        chunks: List[Chunk],
        legal_info: LegalInfo
    ) -> List[Chunk]:

        # ---------------------------------------
        # Embed all sections once
        # ---------------------------------------

        section_texts = [
            section.text
            for section in legal_info.sections
        ]

        section_vectors = self.embedding_service.embed_documents(
            section_texts
        )

        # ---------------------------------------
        # Process every chunk
        # ---------------------------------------

        for chunk in chunks:

            chunk_vector = self.embedding_service.embed_text(
                chunk.text
            )

            similarities = cosine_similarity(
                [chunk_vector],
                section_vectors
            )[0]

            best_index = similarities.argmax()

            best_score = float(
                similarities[best_index]
            )

            chunk.section = matched_section.title

            chunk.metadata = {

                "semantic_score": best_score,

                "clause_type": matched_section.title,

                "matched_clause": matched_section.text,

                "entities": entities,

                "keywords": [],

                "risk_score": None

            }

        return chunks

    # ======================================================

    def _find_entities(
        self,
        text: str,
        legal_info: LegalInfo
    ):

        entities = []

        lower_text = text.lower()

        for entity in legal_info.entities:

            if entity.value.lower() in lower_text:

                entities.append({

                    "type": entity.type,

                    "value": entity.value

                })

        return entities