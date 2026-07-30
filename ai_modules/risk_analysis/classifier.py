from typing import Dict
import json

from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_ollama import ChatOllama


llm = ChatOllama(
    model="qwen2.5:1.5b-instruct",
    temperature=0
)


SYSTEM_PROMPT = """
You are an expert legal contract risk analyst.

Analyze ONLY one contract clause.

Your goal is to determine whether the clause contains a REAL contractual risk.

Rules:

1. Report a risk ONLY if the clause clearly contains an unfavorable, unfair, missing, excessive, or risky contractual condition.

2. Do NOT invent risks.

3. Do NOT assume missing information unless it is explicitly stated.

4. Standard commercial clauses are NOT risks.

5. If there is no real risk return:

{{
"risk_type": "None",
"severity": "Low",
"reason": "No significant contractual risk."
}}


Risk Types:

- Financial
- Legal
- Operational
- None


Few-shot examples:

Example 1:

Clause:
The buyer shall pay all invoices within 30 days from the invoice date.

Answer:
{{
"risk_type":"None",
"severity":"Low",
"reason":"The payment terms are commercially reasonable."
}}


Example 2:

Clause:
The buyer shall pay the total amount within 180 days from the invoice date.

Answer:
{{
"risk_type":"Financial",
"severity":"High",
"reason":"The payment period is excessively long and increases financial exposure."
}}


Example 3:

Clause:
The supplier shall have unlimited liability for all damages arising from this agreement.

Answer:
{{
"risk_type":"Legal",
"severity":"High",
"reason":"Unlimited liability creates excessive legal obligations."
}}


Example 4:

Clause:
The supplier must deliver all equipment within three business days.

Answer:
{{
"risk_type":"Operational",
"severity":"Medium",
"reason":"The delivery deadline may be difficult to achieve."
}}


Return ONLY valid JSON.

Format:

{{
"risk_type":"Financial | Legal | Operational | None",
"severity":"High | Medium | Low",
"reason":"One short sentence."
}}

Do not return markdown.
Do not explain.
"""


def classify_clause_risk(clause_text: str) -> Dict:

    if not clause_text or not clause_text.strip():
        return {
            "risk_type": "None",
            "severity": "Low",
            "reason": "Empty clause."
        }


    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                SYSTEM_PROMPT
            ),
            (
                "user",
                'Clause: "{clause_text}"'
            )
        ]
    )


    chain = (
        prompt
        | llm
        | JsonOutputParser()
    )


    try:

        result = chain.invoke(
            {
                "clause_text": clause_text
            }
        )


    except Exception as e:

        return {
            "risk_type": "None",
            "severity": "Low",
            "reason": f"ollama_error: {e}"
        }


    result.setdefault(
        "risk_type",
        "None"
    )


    if result.get("severity") not in [
        "High",
        "Medium",
        "Low"
    ]:
        result["severity"] = "Low"


    result.setdefault(
        "reason",
        "No explanation provided."
    )


    return result