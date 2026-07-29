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
    Filter Sections by Page
        ↓
    Embedding Service
        ↓
    Cosine Similarity
        ↓
    Best Matching Section
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
        # No sections available
        # ---------------------------------------

        if not legal_info.sections:
            return chunks

        # ---------------------------------------
        # Process every chunk
        # ---------------------------------------

        for chunk in chunks:

            # =====================================
            # Filter sections by page
            # =====================================

            page_sections = [

                section

                for section in legal_info.sections

                if getattr(section, "page", None) == chunk.page

            ]

            # If no sections exist on this page,
            # fall back to all sections.

            if not page_sections:

                page_sections = legal_info.sections

            # =====================================
            # Embed only sections from this page
            # =====================================

            section_vectors = self.embedding_service.embed_documents(

                [section.text for section in page_sections]

            )

            # =====================================
            # Embed chunk
            # =====================================

            chunk_vector = self.embedding_service.embed_text(
                chunk.text
            )

            # =====================================
            # Compute similarities
            # =====================================

            similarities = cosine_similarity(
                [chunk_vector],
                section_vectors
            )[0]

            best_index = similarities.argmax()

            best_score = float(
                similarities[best_index]
            )

            matched_section = page_sections[best_index]

            # =====================================
            # Extract entities
            # =====================================

            entities = self._find_entities(
                chunk.text,
                legal_info
            )

            # =====================================
            # Attach metadata
            # =====================================

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