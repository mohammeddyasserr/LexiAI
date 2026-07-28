from pathlib import Path
from typing import List, Optional
import hashlib

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
)

from ai_modules.rag_system.chunking import Chunk
from ai_modules.rag_system.embedding_service import EmbeddingService
BASE_DIR = Path(__file__).resolve().parents[2]

DEFAULT_QDRANT_PATH = BASE_DIR / "data" / "qdrant"

class VectorStore:
    """
    Qdrant Vector Store.

    Development:
        Uses local persistent storage.
        
        WARNING: Qdrant local storage (QdrantLocal) locks the files in the
        storage directory and does NOT support concurrent access from multiple
        OS processes (e.g. running the API server and indexing/test scripts
        at the same time). If concurrent access is needed, use Qdrant Server.

    Production:
        Replace with Qdrant Server.
    """

    def __init__(
          self,
          collection_name: str = "legal_contracts",
          local_path: str = str(DEFAULT_QDRANT_PATH),
          embedding_service: Optional[EmbeddingService] = None,
      ):

    
        self.collection_name = collection_name

        # Reuse a provided EmbeddingService or create one internally
        self.embedding_service = embedding_service if embedding_service is not None else EmbeddingService()

        # ----------------------------------------
        # Local Qdrant Database
        # ----------------------------------------

        db_path = Path(local_path)

        db_path.mkdir(
            parents=True,
            exist_ok=True
        )

        self.client = QdrantClient(
            path=str(db_path)
        )

        self._create_collection()


    # ======================================================

    def _create_collection(self):

        collections = self.client.get_collections()

        names = [
            collection.name
            for collection in collections.collections
        ]

        if self.collection_name in names:
            return

        self.client.create_collection(

            collection_name=self.collection_name,

            vectors_config=VectorParams(

                size=self.embedding_service.get_dimension(),

                distance=Distance.COSINE

            )

        )

    # ======================================================

    def add_chunks(
        self,
        chunks: List[Chunk]
    ):

        # Ensure the collection exists (handles post-delete_collection() scenarios)
        self._create_collection()

        points = []

        for chunk in chunks:

            embedding = self.embedding_service.embed_text(
                chunk.text
            )

            payload = {

                "chunk_id": chunk.chunk_id,

                "contract_id": chunk.contract_id,

                "page": chunk.page,

                "section": chunk.section,

                "text": chunk.text,

                "metadata": chunk.metadata

            }

            # Generate a deterministic 64-bit integer point ID from chunk_id
            hash_bytes = hashlib.sha256(chunk.chunk_id.encode("utf-8")).digest()
            point_id = int.from_bytes(hash_bytes[:8], byteorder="big") & 0x7FFFFFFFFFFFFFFF

            points.append(

                PointStruct(

                    id=point_id,

                    vector=embedding.tolist(),

                    payload=payload

                )

            )

        self.client.upsert(

            collection_name=self.collection_name,

            points=points

        )

    # ======================================================

    def search(
        self,
        query: str,
        limit: int = 5,
        contract_id: int | None = None,
    ):
        """
        Search for similar chunks.

        Args:
            query:       The text query to embed and search.
            limit:       Maximum number of results to return.
            contract_id: If provided, restrict results to this contract only.
        """

        query_vector = self.embedding_service.embed_text(
            query
        )

        # Build optional contract_id filter
        query_filter = None
        if contract_id is not None:
            query_filter = Filter(
                must=[
                    FieldCondition(
                        key="contract_id",
                        match=MatchValue(value=contract_id),
                    )
                ]
            )

        # Qdrant Client >= 1.10
        if hasattr(self.client, "query_points"):

            response = self.client.query_points(

                collection_name=self.collection_name,

                query=query_vector.tolist(),

                limit=limit,

                query_filter=query_filter,

            )

            return response.points

        # Older Versions
        return self.client.search(

            collection_name=self.collection_name,

            query_vector=query_vector.tolist(),

            limit=limit,

            query_filter=query_filter,

        )

    # ======================================================

    def count(self):

        info = self.client.get_collection(
            self.collection_name
        )

        return info.points_count

    # ======================================================

    def delete_collection(self):

        self.client.delete_collection(
            self.collection_name
        )

    # ======================================================

    def clear_contract(self, contract_id: int):
        """
        Delete all indexed chunks belonging to a specific contract.

        Safer than delete_collection() — other contracts are untouched.
        Use this before re-indexing a contract to avoid stale vectors.
        """

        # Ensure collection exists before trying to delete from it
        self._create_collection()

        self.client.delete(
            collection_name=self.collection_name,
            points_selector=Filter(
                must=[
                    FieldCondition(
                        key="contract_id",
                        match=MatchValue(value=contract_id),
                    )
                ]
            ),
        )

        print(f"[VectorStore] Cleared all vectors for contract_id={contract_id}")

    # ======================================================

    def get_all_chunks(self):

        points, _ = self.client.scroll(

            collection_name=self.collection_name,

            limit=1000,

            with_payload=True,

            with_vectors=False

        )

        return points

    # ======================================================

    def __len__(self):

        return self.count()