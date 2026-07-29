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
        model: str = "qwen2.5:1.5b",
        base_url: str = "http://localhost:11434",
        enable_query_rewrite: bool = True,
    ):

        self.model = model
        self.base_url = base_url.rstrip("/")
        self.enable_query_rewrite = enable_query_rewrite

    # ======================================================

    def rewrite(
        self,
        question: str,
    ) -> str:

        if not self.enable_query_rewrite:
            return question

        try:
            # 1. Validate that the model exists in Ollama
            tags_url = f"{self.base_url}/api/tags"
            res = requests.get(tags_url, timeout=5)
            if res.status_code == 200:
                models = [m["name"] for m in res.json().get("models", [])]
                if self.model not in models and f"{self.model}:latest" not in models:
                    # Fallback partial matching
                    if not any(self.model in m or m in self.model for m in models):
                        raise ValueError(f"Model '{self.model}' is not pulled in Ollama. Available models: {models}")
            else:
                raise ValueError(f"Ollama returned status code {res.status_code}")

            # 2. Synonym-only prompt — do NOT introduce new legal concepts
            prompt = f"""
You are a legal contract search query optimizer.

Your job is to rephrase the user's question as a short search keyword phrase.

Rules:
- Use SYNONYMS ONLY for the exact concept in the question.
- Do NOT introduce any new legal concepts.
- Do NOT add words like: grace period, extension, delay, penalty, termination, liability.
- Return keywords only — no sentence, no explanation.
- No punctuation, no quotation marks, no numbering.
- Return one line only.

Example (GOOD):
Question: What is the payment period?
Output: payment due date payment terms

Example (BAD — do NOT do this):
Question: What is the payment period?
Output: payment term grace period billing period

Question:
{question}

Output:
"""

            # 3. Request execution with timeout
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
                timeout=10,
            )
            response.raise_for_status()

            rewritten = response.json()["response"].strip()

            # -----------------------------------------
            # Cleanup
            # -----------------------------------------
            rewritten = rewritten.replace('"', "")
            rewritten = rewritten.replace("'", "")

            for prefix in ["rewritten query:", "query:", "optimized query:"]:
                if rewritten.lower().startswith(prefix):
                    rewritten = rewritten[len(prefix):].strip()

            rewritten = rewritten.strip()

            if not rewritten:
                return question

            return rewritten

        except Exception as e:
            # Fallback to the original user question instead of crashing the pipeline
            print(f"[QueryRewriter Error] {e}. Falling back to original user question.")
            return question

    # ======================================================

    def get_model_name(self):

        return self.model