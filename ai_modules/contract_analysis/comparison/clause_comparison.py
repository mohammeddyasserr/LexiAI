import re, json

from ai_modules.llm.qwen_comparison import ask_llm
from ..prompts.comparison_prompts import COMPARISON_PROMPT


def compare_clauses(clauses_a, clauses_b):

    # Normalize input: if lists, join into clean readable text
    def format_clauses(clauses):

     if isinstance(clauses, list):
         return "\n\n".join(
             f"{c['type']}:\n{c['text']}"
             for c in clauses
         )

     return str(clauses)

    clauses_a_text = format_clauses(clauses_a)
    clauses_b_text = format_clauses(clauses_b)

    prompt = COMPARISON_PROMPT.format(
        clauses_a_text=clauses_a_text,
        clauses_b_text=clauses_b_text
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
        # Fallback: response may have been truncated (e.g. hit the
        # token limit) before the closing bracket was written.
        # Try trimming to the last complete object and closing the array.
        last_complete = cleaned.rfind("}")
        if last_complete != -1:
            repaired = cleaned[:last_complete + 1] + "\n]"
            try:
                result = json.loads(repaired)
                print(f"Warning: JSON was truncated — recovered {len(result)} of 8 objects")
            except json.JSONDecodeError:
                print("Invalid JSON (unrecoverable):")
                print(response)
                return []
        else:
            print("Invalid JSON:")
            print(response)
            return []

    if not isinstance(result, list) or len(result) != 8:
        print(f"Warning: expected 8 objects, got {len(result) if isinstance(result, list) else 'non-list'}")
        print(response)

    return result