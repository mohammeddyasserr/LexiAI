import json
from pathlib import Path
from .report_pipeline import generate_report
SCRIPT_DIR = Path(__file__).resolve().parent
json_path = SCRIPT_DIR / "sample.json"
with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

report = generate_report(
    metadata=data["metadata"],
    contract_text=data["full_text"],
    clauses=data["sections"],
    risks=data["risks"],
)

print(json.dumps(report, indent=4, ensure_ascii=False))