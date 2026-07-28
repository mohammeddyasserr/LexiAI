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
                "risk_level": contract_a["risk_level"]
            },

            "contract_b": {
                "name": contract_b["name"],
                "risk_level": contract_b["risk_level"]
            }
        },


        "comparison_table": comparison,


        "ai_recommendation": {

            "winner": recommendation["winner"],

            "title": recommendation["title"],

            "reason": recommendation["reason"]

        }

    }