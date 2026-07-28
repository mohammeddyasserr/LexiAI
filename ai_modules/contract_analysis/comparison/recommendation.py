import re
import json

from ..prompts.recommendations_prompts import RECOMMENDATION_PROMPT
from ai_modules.llm.qwen_comparison import ask_llm


def generate_recommendation(comparison):

    prompt = RECOMMENDATION_PROMPT.format(
        comparison=json.dumps(comparison, indent=4)
    )
    response = ask_llm(prompt)

    response = re.sub(
        r"```json|```",
        "",
        response
    ).strip()

    return json.loads(response)