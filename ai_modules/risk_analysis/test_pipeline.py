import json
from risk_pipeline import analyze_contract



# Load input JSON
with open("sample.json", "r", encoding="utf-8") as f:
    contract = json.load(f)

print("=" * 60)
print("INPUT CONTRACT")
print("=" * 60)
print(json.dumps(contract, indent=4))

print("\nAnalyzing contract...\n")

# Run pipeline
result = analyze_contract(contract)

print("=" * 60)
print("RISK ANALYSIS RESULT")
print("=" * 60)
print(json.dumps(result, indent=4))

