import requests


class QueryRewriter:
    """
    Uses an LLM to rewrite user questions into
    clearer legal search queries.

    This rewritten query is ONLY used for retrieval,
    not shown to the user.
    """

    def __init__(
        self,
        model: str = "qwen2.5:1.5b-instruct",
        base_url: str = "http://localhost:11434",
    ):

        self.model = model
        self.base_url = base_url.rstrip("/")

    # ======================================================

    def rewrite(
        self,
        question: str,
    ) -> str:

        prompt = f"""
You are an expert legal retrieval query optimizer.

Convert the user's question into a compact legal search query.

Rules:
- Do NOT answer the question.
- Return keywords, not a sentence.
- Focus on legal contract terminology.
- Expand the query with closely related legal terms.
- No explanations.
- No punctuation.
- No quotation marks.
- Return one line only.

Example:
Question:
When do I pay?

Output:
payment due date invoice payment terms

Question:
{question}

Output:
"""

        response = requests.post(

            f"{self.base_url}/api/generate",

            json={

                "model": self.model,

                "prompt": prompt,

                "stream": False,

                "options": {

                    "temperature": 0.0,

                    "num_predict": 80,

                },

            },

            timeout=120,

        )

        response.raise_for_status()

        rewritten = response.json()["response"].strip()

        # -----------------------------------------
        # Cleanup
        # -----------------------------------------

        rewritten = rewritten.replace('"', "")
        rewritten = rewritten.replace("'", "")

        if rewritten.lower().startswith("rewritten query:"):
            rewritten = rewritten.split(":", 1)[1].strip()

        if rewritten.lower().startswith("query:"):
            rewritten = rewritten.split(":", 1)[1].strip()

        rewritten = rewritten.strip()

        # لو الموديل رجع نص فاضي
        if not rewritten:
            return question

        return rewritten

    # ======================================================

    def get_model_name(self):

        return self.model