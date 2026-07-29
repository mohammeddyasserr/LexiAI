from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
import json
from langchain_ollama import ChatOllama


llm = ChatOllama(
    model="qwen2.5:1.5b",
    temperature=0
)

def extract_metadata(contract_text):

    prompt = """
    You are an expert legal document analyst.

    Extract the following information from the contract.

    Rules:
    - Never guess.
    - If information is missing return null.
    - For "purpose": Provide a brief, high-level summary name/title (e.g., "Supplier Agreement", "Global Supply Agreement", "Equipment Supply & Maintenance Agreement"). Do NOT copy entire sentences.
    - For "parties": Return a simple list of string names only (e.g., ["ABC Company", "XYZ Supplier Ltd."]). Do NOT include object metadata like location or company type.
    - Return ONLY valid JSON.

    {{
        "purpose": "",
        "parties": [],
        "duration": "",
        "contract_value": ""
    }}

    Contract:
    {contract}
    """

    chain = ChatPromptTemplate.from_template(prompt) | llm

    response = chain.invoke({
        "contract": contract_text[:8000]
    })

    try:
        raw = response.content.strip()
        if raw.startswith("```json"):
            raw = raw.replace("```json", "", 1)

        if raw.endswith("```"):
            raw = raw[:-3]

        raw = raw.strip()

        return json.loads(raw)
    except Exception:
        print("Model output:")
        print(response.content)

        return {
            "purpose": None,
            "parties": [],
            "duration": None,
            "contract_value": None,
        }

def generate_header(metadata, extracted_info):
    title = metadata.get("title", "Contract")

    parties = extracted_info.get("parties", [])
    duration = extracted_info.get("duration")
    contract_value = extracted_info.get("contract_value")

    party_1 = parties[0] if len(parties) > 0 else None
    party_2 = parties[1] if len(parties) > 1 else None

    subtitle_parts = []

    if party_1 and party_2:
        subtitle_parts.append(f"{party_1} × {party_2}")

    if duration:
        subtitle_parts.append(duration)

    if contract_value:
        subtitle_parts.append(contract_value)

    subtitle = " · ".join(subtitle_parts)

    return {
        "title": title,
        "subtitle": subtitle,
        "party_1": party_1,
        "party_2": party_2,
        "duration": duration,
        "contract_value": contract_value
    }

def generate_kpi_cards(clauses, risks):

    risk_score = risks.get("risk_score", 0)

    clauses_count = len(clauses)

    findings_count = len(risks.get("risks", []))

    return {
        "risk_score": risk_score,
        "clauses": clauses_count,
        "findings": findings_count
    }

def generate_summary(
    metadata,
    text,
    extracted_info,
    clauses,
    risks,
):

    prompt = """
    You are a senior commercial contract analyst.

    Write a professional Executive Summary.

    Rules:
    - 120-170 words.
    - Use only the provided information.
    - Do not invent facts.
    - Mention the overall risk score.
    - Write for business executives.
    - don't mention the contract_id, upload_date, language, status in the output.
    
    contract text:
    {text}
    
    Metadata:
    {metadata}

    Extracted Information:
    {extracted}

    Clauses:
    {clauses}

    Risks:
    {risks}
    """

    chain = ChatPromptTemplate.from_template(prompt) | llm

    return chain.invoke({
        "metadata": json.dumps(metadata, indent=2),
        "text": text,
        "extracted": json.dumps(extracted_info, indent=2),
        "clauses": json.dumps(clauses, indent=2),
        "risks": json.dumps(risks, indent=2),
    }).content

def generate_key_findings(
    summary,
    risks,
    clauses,
):

    prompt = """
    You are a senior commercial contract analyst.

    Your task is to write the Key Findings section of an executive contract report.

    Rules:
    - Use ONLY the provided information.
    - Do NOT invent facts.
    - Return at least 5 findings.
    - Findings may be positive or negative.
    - Prioritize the most important contractual observations.
    - Each finding should be one short concise sentence.
    - Classify each finding as either:
      - "positive"
      - "negative"

    Executive Summary:
    {summary}

    Risks:
    {risks}

    Clauses:
    {clauses}

    Return ONLY valid JSON in the following format:

    {{
        "findings": [
            {{
                "text": "...",
                "sentiment": "positive"
            }},
            {{
                "text": "...",
                "sentiment": "negative"
            }}
        ]
    }}
    """

    chain = (
        ChatPromptTemplate.from_template(prompt)
        | llm
        | JsonOutputParser()
    )

    return chain.invoke({
        "summary": summary,
        "risks": json.dumps(risks, indent=2),
        "clauses": json.dumps(clauses, indent=2),
    })

def generate_important_clauses(
    summary,
    risks,
    clauses,
):

    prompt = """
    You are a senior commercial contract analyst.

    Your task is to identify the most important clauses in the contract.

    Rules:
    - Use ONLY the provided information.
    - Do NOT invent clauses.
    - Return the important clauses.
    - Prioritize clauses associated with higher risks.
    - If a clause has no risk but is commercially important, it may still be included.

    For each clause return:
    - clause_id
    - title
    - description (max 12 words)
    - priority (Critical, High, Medium, Low)

    Executive Summary:
    {summary}

    Risks:
    {risks}

    Clauses:
    {clauses}

    Return ONLY valid JSON:

    {{
        "important_clauses":[
            {{
                "title":"",
                "description":"",
                "priority":""
            }}
        ]
    }}
    """

    chain = (
        ChatPromptTemplate.from_template(prompt)
        | llm
        | JsonOutputParser()
    )

    return chain.invoke({
        "summary": summary,
        "risks": json.dumps(risks, indent=2),
        "clauses": json.dumps(clauses, indent=2),
    })

def generate_risk_analysis(
    summary,
    risks,
    clauses,
):

    prompt = """
    You are a senior legal risk analyst.

    Your task is to write the Risk Analysis section of an executive contract report.

    Rules:
    - Maximum 120 words.
    - Use ONLY the provided information.
    - Do NOT invent risks or facts.
    - Keep the analysis consistent with the Executive Summary.
    - Mention the overall risk score.
    - Explain the primary sources of risk.
    - Describe the potential business impact.
    - Mention whether the overall risk is Low, Medium, or High.
    - Write in a professional business style suitable for executives.

    contract Summary:
    {summary}

    Risks:
    {risks}

    Clauses:
    {clauses}
    """

    chain = ChatPromptTemplate.from_template(prompt) | llm

    return chain.invoke({
        "summary": summary,
        "risks": json.dumps(risks, indent=2),
        "clauses": json.dumps(clauses, indent=2),
    }).content

def generate_recommendations(
    summary,
    risk_analysis,
    risks,
    clauses,
):

    prompt = """
    You are a senior commercial contract advisor.

    Your task is to write the Recommendations section of an executive contract report.

    Rules:
    - Use ONLY the provided information.
    - Do NOT invent new risks.
    - Do NOT repeat the Risk Analysis.
    - Generate 4 to 6 actionable recommendations.
    - Prioritize recommendations based on risk severity.
    - Each recommendation should be concise (one sentence).
    - Focus on reducing legal, financial, and operational risks.
    - Write in a professional business style suitable for executives.

    contract Summary:
    {summary}

    Risk Analysis:
    {risk_analysis}

    Risks:
    {risks}

    Clauses:
    {clauses}
    """

    chain = ChatPromptTemplate.from_template(prompt) | llm

    return chain.invoke({
        "summary": summary,
        "risk_analysis": risk_analysis,
        "risks": json.dumps(risks, indent=2),
        "clauses": json.dumps(clauses, indent=2),
    }).content