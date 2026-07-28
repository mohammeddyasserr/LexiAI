import re, json

#from ...model import ask_llm
from ai_modules.llm.qwen_comparison import ask_llm
from ..prompts.comparison_prompts import COMPARISON_PROMPT

def compare_clauses(clauses_a, clauses_b):

    # Normalize input: if lists, join into clean readable text
    def format_clauses(clauses):
        if isinstance(clauses, (list, tuple)):
            return "\n".join(str(c) for c in clauses)
        return str(clauses)

    clauses_a_text = format_clauses(clauses_a)
    clauses_b_text = format_clauses(clauses_b)

    prompt = COMPARISON_PROMPT.format(
           clauses_a=clauses_a,
           clauses_b=clauses_b
       )
    response = ask_llm(prompt)

    # Strip code fences if present
    cleaned = re.sub(r"```json|```", "", response).strip()

    # Extract just the JSON array in case the model added stray text
    match = re.search(r"\[.*\]", cleaned, re.DOTALL)
    if match:
        cleaned = match.group(0)

    try:
        result = json.loads(cleaned)
    except json.JSONDecodeError:
        print("Invalid JSON:")
        print(response)
        return []

    if not isinstance(result, list) or len(result) != 8:
        print(f"Warning: expected 8 objects, got {len(result) if isinstance(result, list) else 'non-list'}")
        print(response)

    return result