from dataclasses import dataclass, field
from typing import List, Dict, Any

from ai_modules.rag_system.schemas import (
    DocumentInput,
    LegalInfo,
)



# ======================================================
# Chunk Configuration
# ======================================================

@dataclass
class ChunkingConfig:

    max_chunk_chars: int = 1200

    min_chunk_chars: int = 200

    overlap_chars: int = 250

    preserve_sections: bool = True

    preserve_paragraphs: bool = True

    preserve_sentences: bool = True



# ======================================================
# Chunk Model
# ======================================================

@dataclass
class Chunk:

    chunk_id: str

    parent_id: str  

    contract_id: int

    page: int

    section: str

    text: str

    split_method: str

    start_char: int

    end_char: int

    importance: float = 0.0

    metadata: Dict[str, Any] = field(default_factory=dict)



# ======================================================
# Smart Legal Chunker
# ======================================================

class SmartLegalChunker:


    def __init__(
        self,
        config: ChunkingConfig | None = None
    ):
    
        self.config = config or ChunkingConfig()



    # ==================================================
    # Smart text splitter
    # ==================================================

    def split_large_text(
        self,
        text: str
    ):

        text = text.strip()


        if not text:
            return []


        if len(text) <= self.config.max_chunk_chars:
            return [text]


        chunks = []

        start = 0

        length = len(text)



        while start < length:


            end = min(
                start + self.config.max_chunk_chars,
                length
            )



            if end < length:


                boundary = text.rfind(
                    "\n",
                    start,
                    end
                )


                if boundary <= start:

                    boundary = text.rfind(
                        ".",
                        start,
                        end
                    )


                if boundary <= start:

                    boundary = text.rfind(
                        " ",
                        start,
                        end
                    )


                if boundary > start:

                    end = boundary + 1



            chunk_text = text[start:end].strip()



            if len(chunk_text) >= self.config.min_chunk_chars:

                chunks.append(chunk_text)



            #
            # Prevent infinite loop
            #

            new_start = end - self.config.overlap_chars


            if new_start <= start:

                new_start = end



            start = new_start



        return chunks




    # ==================================================
    # Helper for Section Object / Dict
    # ==================================================

    def get_section_value(
        self,
        section,
        key,
        default=None
    ):


        if isinstance(section, dict):

            return section.get(
                key,
                default
            )


        return getattr(
            section,
            key,
            default
        )



    # ==================================================
    # Section Based Chunking
    # ==================================================

    def chunk_sections(
        self,
        document: DocumentInput,
        legal_info: LegalInfo,
    ):


        chunks = []

        counter = 0



        print(
            "[Chunk Debug] Sections count:",
            len(legal_info.sections)
        )



        for section in legal_info.sections:



            section_title = (

                self.get_section_value(
                    section,
                    "title"
                )

                or

                self.get_section_value(
                    section,
                    "type"
                )

                or

                self.get_section_value(
                    section,
                    "name"
                )

                or

                "UNKNOWN"

            )



            section_text = self.get_section_value(
                section,
                "text",
                ""
            )


            page_number = self.get_section_value(
                section,
                "page",
                1
            )



            print(
                "[Chunk Debug]",
                section_title,
                "chars:",
                len(section_text)
            )



            if not section_text:

                continue



            pieces = self.split_large_text(
                section_text
            )



            position = 0



            for piece in pieces:



                chunk = Chunk(

                    chunk_id=f"{document.contract_id}_{counter}",


                    parent_id=f"section_{section_title}",


                    contract_id=document.contract_id,


                    page=page_number,


                    section=section_title,


                    text=piece,


                    split_method="legal_section",


                    start_char=position,


                    end_char=position + len(piece),


                    importance=0.0,


                    metadata={

                        "section": section_title,

                        "page": page_number,

                        "source": "legal_nlp"

                    }

                )



                chunks.append(chunk)



                position += len(piece)

                counter += 1



        return chunks




    # ==================================================
    # Page Fallback
    # ==================================================

    def chunk_pages(
        self,
        document: DocumentInput
    ):


        chunks = []

        counter = 0



        for page in document.pages:


            pieces = self.split_large_text(
                page.text
            )


            position = 0



            for piece in pieces:


                chunk = Chunk(

                    chunk_id=f"{document.contract_id}_{counter}",


                    parent_id=f"page_{page.page_number}",


                    contract_id=document.contract_id,


                    page=page.page_number,


                    section="",


                    text=piece,


                    split_method="page",


                    start_char=position,


                    end_char=position + len(piece),


                    metadata={

                        "page": page.page_number,

                        "source": "pdf"

                    }

                )



                chunks.append(chunk)



                position += len(piece)

                counter += 1



        return chunks

    # ==================================================
    # Full Text Chunking
    # ==================================================

    def chunk_full_text(
        self,
        document: DocumentInput
    ) -> List[Chunk]:
        text = document.full_text
        if not text:
            return []

        # 1. Map each page's start and end offsets in full_text
        page_offsets = []
        current_search_idx = 0
        for page in document.pages:
            if not page.text:
                continue
            idx = text.find(page.text, current_search_idx)
            if idx != -1:
                page_offsets.append((page.page_number, idx, idx + len(page.text)))
                current_search_idx = idx + len(page.text)
            else:
                idx = text.find(page.text)
                if idx != -1:
                    page_offsets.append((page.page_number, idx, idx + len(page.text)))
                else:
                    est_idx = current_search_idx
                    page_offsets.append((page.page_number, est_idx, est_idx + len(page.text)))
                    current_search_idx = est_idx + len(page.text)

        # Helper to get the page number based on character offset in full_text
        def get_page_number(start_idx: int, end_idx: int) -> int:
            # Try to find which page contains the start of the chunk
            for page_num, p_start, p_end in page_offsets:
                if p_start <= start_idx < p_end:
                    return page_num
            # Fallback: check which page has the maximum overlap
            best_page = 1
            max_overlap = -1
            for page_num, p_start, p_end in page_offsets:
                overlap = max(0, min(end_idx, p_end) - max(start_idx, p_start))
                if overlap > max_overlap:
                    max_overlap = overlap
                    best_page = page_num
            return best_page

        length = len(text)
        if length <= self.config.max_chunk_chars:
            page_num = get_page_number(0, length)
            chunk = Chunk(
                chunk_id=f"{document.contract_id}_0",
                parent_id=f"page_{page_num}",
                contract_id=document.contract_id,
                page=page_num,
                section="",
                text=text.strip(),
                split_method="full_text",
                start_char=0,
                end_char=length,
                metadata={
                    "page": page_num,
                    "source": "full_text"
                }
            )
            return [chunk]

        chunks = []
        counter = 0
        start = 0

        while start < length:
            end = min(
                start + self.config.max_chunk_chars,
                length
            )

            if end < length:
                boundary = text.rfind(
                    "\n",
                    start,
                    end
                )

                if boundary <= start:
                    boundary = text.rfind(
                        ".",
                        start,
                        end
                    )

                if boundary <= start:
                    boundary = text.rfind(
                        " ",
                        start,
                        end
                    )

                if boundary > start:
                    end = boundary + 1

            chunk_text = text[start:end].strip()

            if len(chunk_text) >= self.config.min_chunk_chars:
                page_num = get_page_number(start, end)
                
                chunk = Chunk(
                    chunk_id=f"{document.contract_id}_{counter}",
                    parent_id=f"page_{page_num}",
                    contract_id=document.contract_id,
                    page=page_num,
                    section="",
                    text=chunk_text,
                    split_method="full_text",
                    start_char=start,
                    end_char=end,
                    metadata={
                        "page": page_num,
                        "source": "full_text"
                    }
                )
                chunks.append(chunk)
                counter += 1

            # Prevent infinite loop
            new_start = end - self.config.overlap_chars

            if new_start <= start:
                new_start = end

            start = new_start

        return chunks

    # ==================================================
    # Main Entry
    # ==================================================

    def chunk_document(
        self,
        document: DocumentInput,
        legal_info: LegalInfo | None = None,
    ):


        print(
            "[Chunk Debug] chunk_document started"
        )



        print(
            "[Chunk Debug] Chunking based on full text"
        )


        chunks = self.chunk_full_text(
            document
        )



        return self.optimize_chunks(
            chunks
        )




    # ==================================================
    # Optimization
    # ==================================================

    def optimize_chunks(
        self,
        chunks: List[Chunk]
    ):

        return chunks