import re, json

from ai_modules.llm.qwen_comparison import ask_llm
from ..prompts.comparison_prompts import COMPARISON_PROMPT


FEATURES = {
    "Payment Terms": "Payment",
    "Contract Duration": "Duration",
    "Penalty Clause": "Penalty",
    "Warranty": "Warranty",
    "Liability": "Liability",
    "Termination Notice": "Termination",
    "Confidentiality": "Confidentiality",
    "Governing Law": "GoverningLaw",
}


def compare_clauses(clauses_a, clauses_b):

    results = []

    for feature, key in FEATURES.items():

        clause_a = clauses_a.get(key)
        clause_b = clauses_b.get(key)

        prompt = COMPARISON_PROMPT.format(
            feature=feature,
            clause_a=clause_a or "Not Found",
            clause_b=clause_b or "Not Found"
        )

        response = ask_llm(prompt)

        cleaned = re.sub(r"```json|```", "", response).strip()

        # Extract JSON object safely
        start = cleaned.find("{")
        end = cleaned.rfind("}")

        if start != -1 and end != -1:
            cleaned = cleaned[start:end + 1]
        else:
            print("Invalid response:")
            print(response)

            results.append({
                "feature": feature,
                "contract_a": clause_a,
                "contract_b": clause_b,
                "winner": "Unknown",
                "reason": "Invalid model response."
            })
            continue

        try:
            result = json.loads(cleaned)

        except json.JSONDecodeError:
            print("JSON ERROR:")
            print(response)

            results.append({
                "feature": feature,
                "contract_a": clause_a,
                "contract_b": clause_b,
                "winner": "Unknown",
                "reason": "Invalid JSON response."
            })
            continue

        results.append(result)

    return results

# def compare_clauses(clauses_a, clauses_b):

#     # Normalize input: if lists, join into clean readable text
#     def format_clauses(clauses):

#      if isinstance(clauses, list):
#          return "\n\n".join(
#              f"{c['type']}:\n{c['text']}"
#              for c in clauses
#          )

#      return str(clauses)

#     clauses_a_text = format_clauses(clauses_a)
#     clauses_b_text = format_clauses(clauses_b)

#     prompt = COMPARISON_PROMPT.format(
#         clauses_a_text=clauses_a_text,
#         clauses_b_text=clauses_b_text
#     )

#     response = ask_llm(prompt)

    # # Strip code fences if present
    # cleaned = re.sub(r"```json|```", "", response).strip()

    # # Extract just the JSON array in case the model added stray text
    # match = re.search(r"\[.*\]", cleaned, re.DOTALL)
    # if match:
    #     cleaned = match.group(0)

    # try:
    #     result = json.loads(cleaned)
    # except json.JSONDecodeError:
    #     # Fallback: response may have been truncated (e.g. hit the
    #     # token limit) before the closing bracket was written.
    #     # Try trimming to the last complete object and closing the array.
    #     last_complete = cleaned.rfind("}")
    #     if last_complete != -1:
    #         repaired = cleaned[:last_complete + 1] + "\n]"
    #         try:
    #             result = json.loads(repaired)
    #             print(f"Warning: JSON was truncated — recovered {len(result)} of 8 objects")
    #         except json.JSONDecodeError:
    #             print("Invalid JSON (unrecoverable):")
    #             print(response)
    #             return []
    #     else:
    #         print("Invalid JSON:")
    #         print(response)
    #         return []

    # if not isinstance(result, list) or len(result) != 8:
    #     print(f"Warning: expected 8 objects, got {len(result) if isinstance(result, list) else 'non-list'}")
    #     print(response)

    # return result