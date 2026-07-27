import re
import requests


class MultiQueryGenerator:
    """
    Generates multiple legal search queries
    from a single user question.

    Example:

    User:
        When do I pay?

    Output:
        [
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
        num_queries: int = 4,
    ) -> list[str]:

        prompt = f"""
You are an expert legal contract retrieval assistant.

Generate exactly {num_queries} semantic search queries.

Rules:

- Preserve the original meaning.
- Return EXACTLY {num_queries} queries.
- Each query must contain ONLY legal search keywords.
- Maximum 4 words per query.
- One query per line.
- No numbering.
- No bullet points.
- No punctuation.
- No quotation marks.
- No explanations.
- Do NOT answer the question.
- Do NOT write titles.
- Do NOT write complete sentences.

Example

Question:
When do I pay?

Output:
payment due date
invoice payment
payment terms
payment deadline

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

        text = response.json()["response"].strip()

        queries = []

        for line in text.splitlines():

            line = line.strip()

            if not line:
                continue

            # إزالة أي ترقيم أو Bullet
            line = re.sub(r"^\s*(\d+[\.\)]|-|•)\s*", "", line)

            line = line.replace('"', "")
            line = line.replace("'", "")

            line = line.strip()

            if line:
                queries.append(line)

        # إزالة التكرار مع الحفاظ على الترتيب
        unique_queries = []

        seen = set()

        for query in queries:

            key = query.lower()

            if key not in seen:

                seen.add(key)

                unique_queries.append(query)

        # إضافة السؤال المعاد كتابته إذا لم يكن موجودًا
        if question.lower() not in seen:

            unique_queries.insert(0, question)

        # الحد الأقصى = السؤال الأساسي + عدد الـ Queries
        unique_queries = unique_queries[: num_queries + 1]

        return unique_queries

    # ======================================================

    def get_model_name(self):

        return self.model