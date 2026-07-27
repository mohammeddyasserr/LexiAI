import re
from typing import List, Dict

# ---------- Keywords / Patterns ----------

UNLIMITED_LIABILITY_PATTERNS = [
    r"unlimited liability",
    r"without limit(ation)? of liability",
    r"no cap on liability",
]

HIGH_PENALTY_PATTERN = r"penalt(y|ies)[^.]*?(\d{1,3})\s*%"
PAYMENT_DAYS_PATTERN = r"(?:within|in)\s+(\d{1,4})\s+days"

REQUIRED_CLAUSE_TYPES = ["Payment", "Termination", "Confidentiality", "Liability"]

MAX_ACCEPTABLE_PAYMENT_DAYS = 60
MAX_ACCEPTABLE_PENALTY_PERCENT = 10


def check_unlimited_liability(clause_text: str) -> List[Dict]:
    risks = []
    text_lower = clause_text.lower()
    for pattern in UNLIMITED_LIABILITY_PATTERNS:
        if re.search(pattern, text_lower):
            risks.append({
                "type": "Financial",
                "severity": "High",
                "clause": "Liability",
                "reason": "The clause includes unlimited liability with no financial cap.",
            })
            break
    return risks


def check_payment_period(clause_text: str) -> List[Dict]:
    risks = []
    match = re.search(PAYMENT_DAYS_PATTERN, clause_text.lower())
    if match:
        days = int(match.group(1))
        if days > MAX_ACCEPTABLE_PAYMENT_DAYS:
            severity = "High" if days > 90 else "Medium"
            risks.append({
                "type": "Financial",
                "severity": severity,
                "clause": "Payment",
                "reason": f"Payment period is {days} days, which exceeds the acceptable limit of {MAX_ACCEPTABLE_PAYMENT_DAYS} days.",
            })
    return risks


def check_high_penalty(clause_text: str) -> List[Dict]:
    risks = []
    match = re.search(HIGH_PENALTY_PATTERN, clause_text.lower())
    if match:
        percent = int(match.group(2))
        if percent > MAX_ACCEPTABLE_PENALTY_PERCENT:
            risks.append({
                "type": "Financial",
                "severity": "High" if percent >= 20 else "Medium",
                "clause": "Penalty",
                "reason": f"Penalty clause specifies {percent}%, considered high relative to the standard {MAX_ACCEPTABLE_PENALTY_PERCENT}%.",
            })
    return risks


def check_missing_clauses(existing_clause_types: List[str]) -> List[Dict]:

    risks = []
    existing_set = {c.strip().lower() for c in existing_clause_types}
    for required in REQUIRED_CLAUSE_TYPES:
        if required.lower() not in existing_set:
            risks.append({
                "type": "Legal",
                "severity": "Medium",
                "clause": required,
                "reason": f"The contract does not contain a '{required}' clause.",
            })
    return risks


def run_rule_based_checks(clause_text: str) -> List[Dict]:
    risks = []
    risks += check_unlimited_liability(clause_text)
    risks += check_payment_period(clause_text)
    risks += check_high_penalty(clause_text)
    return risks
