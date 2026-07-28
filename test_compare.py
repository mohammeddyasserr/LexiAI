"""
Real end-to-end test for analyze_contracts().

Unlike test_pipeline.py, this does NOT mock anything — it calls your
actual document_ai.extractor, risk_analysis.classifier, and
llm.qwen_comparison modules. So this test will really hit the LLM and
really parse the contract files you point it at.

Usage:
    python test_real_pipeline.py path/to/contract_a.pdf path/to/contract_b.pdf

    python test_compare.py data/raw/contractA.pdf data/raw/contractB.pdf
"""

import sys
import json

from ai_modules.contract_analysis.analys_contarct import analyze_contracts

FEATURES = {
    "Payment Terms", "Contract Duration", "Penalty Clause", "Warranty",
    "Liability", "Termination Notice", "Confidentiality", "Governing Law",
}


def run(contract_a_path, contract_b_path):

    print(f"Analyzing:\n  A: {contract_a_path}\n  B: {contract_b_path}\n")

    result = analyze_contracts(contract_a_path, contract_b_path)

    # ---- structural checks -------------------------------------------
    assert "contracts" in result, "missing 'contracts' key"
    assert "contract_a" in result["contracts"], "missing contract_a"
    assert "contract_b" in result["contracts"], "missing contract_b"

    assert result["contracts"]["contract_a"]["name"] == contract_a_path
    assert result["contracts"]["contract_b"]["name"] == contract_b_path

    for side in ("contract_a", "contract_b"):
        risk = result["contracts"][side]["risk_analysis"]
        assert isinstance(risk, dict) and len(risk) > 0, f"{side} has no risk_analysis"
        print(f"[{side}] risk_analysis keys: {list(risk.keys())}")

    assert isinstance(result["comparison"], list), "comparison should be a list"
    assert len(result["comparison"]) == 8, (
        f"expected 8 comparison rows, got {len(result['comparison'])}"
    )
    got_features = {row.get("feature") for row in result["comparison"]}
    assert got_features == FEATURES, (
        f"comparison features mismatch.\nExpected: {FEATURES}\nGot: {got_features}"
    )
    for row in result["comparison"]:
        for key in ("feature", "contract_a", "contract_b", "winner", "reason"):
            assert key in row, f"comparison row missing '{key}': {row}"

    rec = result["recommendation"]
    assert isinstance(rec, dict), "recommendation should be a dict"
    for key in ("winner", "title", "reason"):
        assert key in rec, f"recommendation missing '{key}'"

    print("\nALL CHECKS PASSED\n")
    print(json.dumps(result, indent=2, ensure_ascii=False))

    return result


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python test_real_pipeline.py <contract_a_path> <contract_b_path>")
        sys.exit(1)

    run(sys.argv[1], sys.argv[2])