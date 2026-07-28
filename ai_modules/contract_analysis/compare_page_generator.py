def generate_compare_page(
    contract_a,
    contract_b,
    comparison,
    recommendation
):

    return {

        "page_type": "contract_comparison",

        "contracts": {

            "contract_a": {
                "name": contract_a["name"],
                "risk_analysis": contract_a["risk_analysis"]
            },

            "contract_b": {
                "name": contract_b["name"],
                "risk_analysis": contract_b["risk_analysis"]
            }
        },

        "comparison": comparison,

        "recommendation": recommendation

    }