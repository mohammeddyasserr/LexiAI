import json

from .report_pipeline import generate_report

with open("sample.json", "r", encoding="utf-8") as f:
    data = json.load(f)

report = generate_report(
    metadata=data["metadata"],
    contract_text=data["contract_text"],
    clauses=data["clauses"],
    risks=data["risks"],
)

print(json.dumps(report, indent=4, ensure_ascii=False))