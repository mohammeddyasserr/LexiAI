import re
import requests


class MultiQueryGenerator:
    """
    Uses an LLM to generate multiple semantic legal
    search queries for retrieval.

    Example

    Input:
        payment due date invoice payment terms

    Output:
        [
            "payment due date invoice payment terms",
            "payment due date",
            "invoice payment",
            "payment terms",
            "payment deadline"
        ]
    """

    def __init__(
        self,
        model: str = "qwen2.5:1.5b-instruct",
        base_url: str = "http://localhost:11434",
    ):

        self.model = model
        self.base_url = base_url.rstrip("/")

    # ======================================================

    def generate(
        self,
        question: str,
        num_queries: int = 3,
    ) -> list[str]:

        prompt = f"""
You are an expert legal contract retrieval assistant.

Your task is to generate alternative semantic search queries.

IMPORTANT:

Every generated query MUST describe the EXACT SAME legal concept.

Never introduce another legal topic.

Examples of forbidden behavior:

Question:
payment due date

BAD:
contract termination
nda
insurance clause
assignment rights

GOOD:
payment deadline
invoice payment
payment terms
payment obligation

Rules:

- Return exactly {num_queries} queries.
- Preserve the original meaning.
- Use legal contract terminology.
- Maximum 4 words.
- Keywords only.
- No complete sentences.
- No explanations.
- No numbering.
- No bullets.
- No punctuation.
- No quotation marks.
- One query per line.

Question:
{question}

Queries:
"""

        response = requests.post(

            f"{self.base_url}/api/generate",

            json={

                "model": self.model,

                "prompt": prompt,

                "stream": False,

                "options": {

                    "temperature": 0.0,

                    "top_p": 0.8,

                    "num_predict": 80,

                },

            },

            timeout=120,

        )

        response.raise_for_status()

        text = response.json()["response"].strip()

        queries = []

        # --------------------------------------------------
        # Cleanup
        # --------------------------------------------------

        for line in text.splitlines():

            line = line.strip()

            if not line:
                continue

            line = re.sub(r"^\s*(\d+[\.\)]|-|•)\s*", "", line)

            line = line.replace('"', "")
            line = line.replace("'", "")

            line = line.strip()

            if line:

                queries.append(line)

        # --------------------------------------------------
        # Remove duplicates
        # --------------------------------------------------

        unique_queries = []

        seen = set()

        for q in queries:

            key = q.lower()

            if key not in seen:

                seen.add(key)

                unique_queries.append(q)

        # --------------------------------------------------
        # Keep original rewritten query
        # --------------------------------------------------

        if question.lower() not in seen:

            unique_queries.insert(0, question)

        # --------------------------------------------------
        # Topic Filtering
        # --------------------------------------------------

        original_words = {

            word.lower()

            for word in re.findall(r"[a-zA-Z]+", question)

        }

        filtered = [question]

        for q in unique_queries[1:]:

            words = {

                word.lower()

                for word in re.findall(r"[a-zA-Z]+", q)

            }

            overlap = len(original_words & words)

            if overlap >= 1:

                filtered.append(q)

        # --------------------------------------------------
        # Fallback
        # --------------------------------------------------

        if len(filtered) == 1:

            filtered.extend(unique_queries[1:3])

        return filtered

    # ======================================================

    def get_model_name(self):

        return self.model