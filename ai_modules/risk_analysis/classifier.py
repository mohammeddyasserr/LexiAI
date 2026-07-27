import os
import re
import json
import requests
from typing import Dict

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
MODEL_NAME = os.getenv("CLASSIFIER_MODEL", "qwen2.5:1.5b")

SYSTEM_PROMPT = """
You are an expert legal contract risk analyst.

Analyze ONLY one contract clause.

Your goal is to determine whether the clause contains a REAL contractual risk.

Rules:

1. Report a risk ONLY if the clause clearly contains an unfavorable, unfair, missing, excessive, or risky contractual condition.

2. Do NOT invent risks.

3. Do NOT assume missing information unless it is explicitly stated.

4. Standard commercial clauses are NOT risks.

5. If the clause is balanced, reasonable, or commonly used in commercial contracts, return:
   {
     "risk_type": "None",
     "severity": "Low",
     "reasoning": "No significant contractual risk."
   }

Risk Types:

- Financial:
  Excessive payment periods, unlimited liability, high penalties, financial exposure, payment obligations.

- Legal:
  Missing legal protections, missing confidentiality, missing termination rights, missing governing law, unfair legal obligations, compliance issues.

- Operational:
  Unrealistic deadlines, unclear responsibilities, delivery risks, impossible service levels, execution risks.

Return ONLY valid JSON.

Format:

{
  "risk_type": "Financial | Legal | Operational | None",
  "severity": "High | Medium | Low",
  "reasoning": "One short sentence."
}

Do not return markdown.
Do not explain your answer.
Do not output anything except JSON.
"""

FEW_SHOT_EXAMPLES = [

# ---------------- SAFE PAYMENT ----------------

{
    "role": "user",
    "content": 'Clause: "The buyer shall pay all invoices within 30 days from the invoice date."'
},
{
    "role": "assistant",
    "content": '{"risk_type":"None","severity":"Low","reason":"The payment terms are commercially reasonable."}'
},

# ---------------- RISKY PAYMENT ----------------

{
    "role": "user",
    "content": 'Clause: "The buyer shall pay the total amount within 180 days from the invoice date."'
},
{
    "role": "assistant",
    "content": '{"risk_type":"Financial","severity":"High","reason":"The payment period is excessively long and increases financial exposure."}'
},

# ---------------- SAFE LIABILITY ----------------

{
    "role": "user",
    "content": 'Clause: "Each party\'s liability shall be limited to the total contract value."'
},
{
    "role": "assistant",
    "content": '{"risk_type":"None","severity":"Low","reason":"Liability is reasonably limited by a financial cap."}'
},

# ---------------- UNLIMITED LIABILITY ----------------

{
    "role": "user",
    "content": 'Clause: "The supplier shall have unlimited liability for all damages arising from this agreement."'
},
{
    "role": "assistant",
    "content": '{"risk_type":"Legal","severity":"High","reason":"Unlimited liability creates excessive legal obligations."}'
},

# ---------------- SAFE PENALTY ----------------

{
    "role": "user",
    "content": 'Clause: "A penalty of 5% of the contract value shall apply for delayed delivery."'
},
{
    "role": "assistant",
    "content": '{"risk_type":"None","severity":"Low","reason":"The penalty percentage is within normal commercial practice."}'
},

# ---------------- HIGH PENALTY ----------------

{
    "role": "user",
    "content": 'Clause: "A penalty of 40% of the contract value shall apply for delayed delivery."'
},
{
    "role": "assistant",
    "content": '{"risk_type":"Financial","severity":"High","reason":"The penalty percentage is excessively high."}'
},

# ---------------- CONFIDENTIALITY MISSING ----------------

{
    "role": "user",
    "content": 'Clause: "This agreement does not include a confidentiality clause."'
},
{
    "role": "assistant",
    "content": '{"risk_type":"Confidentiality","severity":"Medium","reason":"Sensitive information is not adequately protected."}'
},

# ---------------- TERMINATION SAFE ----------------

{
    "role": "user",
    "content": 'Clause: "Either party may terminate this agreement by providing thirty days written notice."'
},
{
    "role": "assistant",
    "content": '{"risk_type":"None","severity":"Low","reason":"The termination notice period is reasonable."}'
},

# ---------------- OPERATIONAL ----------------

{
    "role": "user",
    "content": 'Clause: "The supplier must deliver all equipment within three business days."'
},
{
    "role": "assistant",
    "content": '{"risk_type":"Operational","severity":"Medium","reason":"The delivery deadline may be difficult to achieve."}'
},

# ---------------- DATA PRIVACY ----------------

{
    "role": "user",
    "content": 'Clause: "The supplier may share customers personal data with third parties without consent."'
},
{
    "role": "assistant",
    "content": '{"risk_type":"Data Privacy","severity":"High","reason":"Personal data may be disclosed without appropriate protection."}'
},

# ---------------- INTELLECTUAL PROPERTY ----------------

{
    "role": "user",
    "content": 'Clause: "All intellectual property created under this agreement shall belong exclusively to the supplier."'
},
{
    "role": "assistant",
    "content": '{"risk_type":"Intellectual Property","severity":"Medium","reason":"The ownership of intellectual property may disadvantage one party."}'
}

]


def classify_clause_risk(clause_text: str) -> Dict:
    """
    {
    "risk_type": "...",
    "severity": "High" | "Medium" | "Low",
    "reason": "..."
    }
    """
    if not clause_text or not clause_text.strip():
        return {"risk_type": "None", "severity": "Low", "reasoning": "empty clause"}

    messages = (
        [{"role": "system", "content": SYSTEM_PROMPT}]
        + FEW_SHOT_EXAMPLES
        + [{"role": "user", "content": f'Clause: "{clause_text}"'}]
    )

    try:
        response = requests.post(
            f"{OLLAMA_HOST}/api/chat",
            json={
                "model": MODEL_NAME,
                "messages": messages,
                "stream": False,
                "format": "json",          # بيجبر Ollama يرجع JSON صالح دايمًا
                "options": {"temperature": 0},
            },
            timeout=60,
        )
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
       
        return {
            "risk_type": "None",
            "severity": "Low",
            "reasoning": f"ollama_unreachable: {e}",
        }

    content = response.json().get("message", {}).get("content", "")

    match = re.search(r"\{.*\}", content, re.DOTALL)
    if not match:
        return {"risk_type": "None", "severity": "Low", "reasoning": "parse_error"}

    try:
        parsed = json.loads(match.group())
    except json.JSONDecodeError:
        return {"risk_type": "None", "severity": "Low", "reasoning": "parse_error"}

    if "risk_type" not in parsed:
        parsed["risk_type"] = "None"

    if parsed.get("severity") not in ("High", "Medium", "Low"):
        parsed["severity"] = "Low"

    if "reason" not in parsed:
        parsed["reason"] = "No explanation provided."

    return parsed
