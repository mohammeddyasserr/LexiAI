import re
import json

#from ...model import ask_llm
from ..prompts.comparison_prompts import RECOMMENDATION_PROMPT
from ai_modules.llm.qwen_comparison import ask_llm

def generate_recommendation(comparison):


    prompt = RECOMMENDATION_PROMPT.format(
        comparison=comparison
    )
    prompt = f"""
You are a contract recommendation assistant.

You are comparing contracts from the BUYER risk perspective.

Based ONLY on this comparison:

{comparison}


Return ONLY valid JSON.

Format:

{{
    "winner": "Contract A | Contract B | Equal",
    "title": "",
    "reason": ""
}}


Rules:

- Count how many features each contract wins.
- Prefer lower financial and legal exposure.
- Limited liability is better than unlimited liability.
- Lower penalties are better.
- Longer warranty is better.
- Shorter termination notice is better.
- Equal clauses should not affect the winner.
- Do not repeat the comparison list.
- Do not include feature objects.
"""

    response = ask_llm(prompt)

    response = re.sub(
        r"```json|```",
        "",
        response
    ).strip()

    return json.loads(response)