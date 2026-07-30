from unittest import result

from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
import json
from langchain_ollama import ChatOllama
import re

llm = ChatOllama(
    model="qwen2.5:1.5b",
    format="json",   # forces valid JSON token-by-token, not just an instruction
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
import json
import re


def clean_summary_output(raw) -> str:
    # Guard: raw might not be a plain string depending on the LLM client
    if isinstance(raw, list):
        raw = " ".join(str(part) for part in raw)
    text = str(raw).strip()

    # Case 1: model wrapped it in JSON
    if text.startswith("{"):
        try:
            parsed = json.loads(text)
            candidate = parsed.get("text") or parsed.get("summary") or parsed.get("analysis")
            if candidate is None:
                # fall back to the first value, but only if it's actually a string
                for v in parsed.values():
                    if isinstance(v, str):
                        candidate = v
                        break
            if isinstance(candidate, str):
                text = candidate
            # if nothing string-like was found, just fall through and clean `text` as-is
        except json.JSONDecodeError:
            match = re.search(r'"text"\s*:\s*"([^"]+)"', text)
            if match:
                text = match.group(1)

    # Case 2: model added markdown headers/bullets — strip them, keep prose lines
    lines = [l for l in text.split("\n") if l.strip() and not l.strip().startswith(("#", "-", "*"))]
    text = " ".join(lines) if lines else text

    return text.strip().strip('"')
def summarize_top_risks(risks: dict, n: int = 3) -> str:
        top = risks["risks"][:n]
        return "; ".join(f"{r['type']} ({r['severity']}) - {r['clause']}" for r in top)
def generate_summary(
    metadata,
    text,
    extracted_info,
    clauses,
    risks,
):
    
    system_prompt = """You are a senior commercial contract analyst who writes executive-level contract summaries.

    Follow these rules exactly:
    1. Write exactly ONE paragraph, 120-170 words.
    2. Use ONLY the information provided in the user message. Never invent facts.
    3. Write for a busy business executive: plain, direct, non-legal language.
    4. You MUST state the overall risk score somewhere in the paragraph.
    5. Do NOT mention: contract ID, upload date, file status, or internal metadata.
    6. Output PLAIN PROSE TEXT ONLY. Do NOT use JSON, do NOT use headings (#, ##), do NOT use bullet points, do NOT wrap the output in quotes or an object.
    7. Output nothing except the paragraph itself — no preamble, no title, no labels.

    WRONG (do not do this):
    {{"title": "Executive Summary", "text": "This agreement..."}}

    WRONG (do not do this):
    ### Executive Summary
    - Risk score: 78

    CORRECT (do this):
    This agreement establishes a co-branding partnership between... The overall risk score is 78 out of 100, driven primarily by..."""

    user_prompt = """Extracted Information:
    {extracted}

    Key Clauses:
    {clauses}

    Risk Assessment (overall score: {risk_score}/100):
    Top risks: {top_risks}

    Write the executive summary paragraph now."""

    chain = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("user", user_prompt),
    ]) | llm

    raw = chain.invoke({
        "extracted": json.dumps(extracted_info, indent=2),
        "clauses": json.dumps(clauses, indent=2),
        "risk_score": risks["risk_score"],
        "top_risks": summarize_top_risks(risks),
    }).content

    return clean_summary_output(raw)



def generate_key_findings(
    summary,
    risks,
    clauses,
):
    def shorten_clause(text, max_sentences=3, max_chars=500):
        text = " ".join(text.split())

        sentences = re.split(r'(?<=[.!?])\s+', text)
        short = " ".join(sentences[:max_sentences])

        if len(short) > max_chars:
            short = short[:max_chars]

        return short + ("..." if len(text) > len(short) else "")
    short_clauses = []

    for clause in clauses:
        short_clauses.append({
            "title": clause["title"],
            "text": shorten_clause(clause["text"]),
            "page": clause["page"]
        })
    system_prompt = """You are a senior commercial contract analyst who writes executive contract reports.

    Follow these rules exactly:
    1. Output ONLY valid JSON. No markdown code fences, no ```json, no preamble, no explanation — just the raw JSON object.
    2. Use ONLY the information given in the user message. Never invent facts.
    3. Return between 5 and 8 findings.
    4. Each finding must be grounded in a specific clause, risk, or fact from the input — no vague generic statements.
    5. Each finding is ONE short, concise sentence (max ~20 words).
    6. Classify each finding's "sentiment" as exactly "positive" or "negative" — no other values.
    7. Order findings by importance, most critical first.
    8. restrictly Match this exact JSON schema:
    {{
    "findings": [
        {{"text": "...", "sentiment": "positive"}},
        {{"text": "...", "sentiment": "negative"}}
    ]
    }}"""

    user_prompt = """Executive Summary:
    {summary}

    Risk Assessment:
    {risks}

    Key Clauses:
    {clauses}

    Write the Key Findings JSON now."""

    chain = (
        ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("user", user_prompt),
        ])
        | llm
        | JsonOutputParser()
    )

    result = chain.invoke({
    "summary": summary,
    "risks": json.dumps(risks, indent=2),
    "clauses": json.dumps(short_clauses, indent=2),
    })

    if isinstance(result, dict):
        first_key = next(iter(result), None)
        if first_key and first_key != "findings":
            result["findings"] = result.pop(first_key)

    return result

    

def generate_important_clauses(
    summary,
    risks,
    clauses,
):

    system_prompt = """You are a senior commercial contract analyst who flags the most important clauses in a contract for executive attention.

    Follow these rules exactly:
    1. Output ONLY valid JSON. No markdown code fences, no ```json, no preamble — just the raw JSON object.
    2. Only use clause titles that appear in the "Clauses" input. Never invent a clause.
    3. Return between 3 and 6 clauses, ranked most important first.
    4. Prioritize clauses that appear in the Risks input.
    5. A clause with no associated risk may still be included if it is commercially significant (e.g. Payment, Term, GoverningLaw).
    6. "description" is a plain-language explanation of why the clause matters, max 12 words.
    7. "priority" must be exactly one of: "Critical", "High", "Medium", "Low".
    8. Match this exact JSON schema:

    {{
    "important_clauses": [
        {{"title": "...", "description": "...", "priority": "High"}}
    ]
    }}"""

    user_prompt = """Executive Summary:
    {summary}

    Risk Assessment:
    {risks}

    Available Clauses:
    {clauses}

    Identify the important clauses now."""

    chain = (
        ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("user", user_prompt),
        ])
        | llm
        | JsonOutputParser()
    )

    return chain.invoke({
        "summary": summary,
        "risks": json.dumps(risks, indent=2),
        "clauses": json.dumps(clauses, indent=2),
    })

def get_risk_tier(score: float) -> str:
    if score >= 67:
        return "High"
    elif score >= 34:
        return "Medium"
    return "Low"
import json

def format_risk_analysis(input_data) -> str:
    # If passed as a raw JSON string, parse it into a dict
    if isinstance(input_data, str):
        print(type(input_data))
        print(len(input_data))
        print(input_data[-1000:])   # آخر 1000 حرف
        data = json.loads(input_data)
    else:
        data = input_data
    
    # Extract items and format each entry
    risk_list = data.get("riskAnalysis", [])
    blocks = [
        f"- **{item['title']}**\n{item['description']}"
        for item in risk_list
    ]
    
    return "\n\n".join(blocks)

def generate_risk_analysis(summary, risks, clauses):

    system_prompt = """You are a senior legal risk analyst who writes the Risk Analysis section of an executive contract report.

    Follow these rules exactly:
    1. Use ONLY the risks and clauses provided. Never invent a risk or fact that isn't in the input.
    2. Structure each entry with four fields: "title", "description", "impact", and "mitigationStrategies" (an array of strings).
    3. "description" must explain the risk source referencing the specific clause or scenario provided.
    4. "impact" must describe the practical legal, financial, or operational business consequence.
    5. "mitigationStrategies" must contain 2 clear, actionable strategies to reduce the risk.
    6. Stay consistent with the Executive Summary and overall contract context.
    7. Write in a professional business style suitable for executives.
    8. Output ONLY valid JSON matching the exact structure below. Do NOT wrap the output in markdown code blocks (like ```json), and do NOT include any preamble, title, or commentary outside the JSON object.

    JSON Schema:
    {{
    "riskAnalysis": [
        {{
        "title": "Risk title summarizing the concern",
        "description": "Explanation of the contract clause or scenario causing the risk.",
        "impact": "Potential financial, legal, or operational impact on the organization.",
        "mitigationStrategies": [
            "First actionable mitigation strategy",
            "Second actionable mitigation strategy"
        ]
        }}
    ]
    }}"""

    user_prompt = """Contract Summary:
    {summary}

    Identified Risks:
    {risks}


    Write the Risk Analysis JSON now."""

    chain = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("user", user_prompt),
    ]) | llm

    raw = chain.invoke({
        "summary": summary,
        "risk_score": risks["risk_score"],
        "risk_tier": get_risk_tier(risks["risk_score"]),
        "risks": summarize_top_risks(risks),
        "clauses": json.dumps(clauses, indent=2),
    }).content

    return format_risk_analysis(clean_summary_output(raw))
import json

def format_recommendations(input_data) -> str:
    # Handle both raw JSON string or pre-parsed dictionary
    if isinstance(input_data, str):
        data = json.loads(input_data)
    else:
        data = input_data
    
    # Extract recommendations and format entries
    rec_list = data.get("recommendations", [])
    blocks = [
        f"- **{item['title']}**\n{item['description']}"
        for item in rec_list
    ]
    
    return "\n\n".join(blocks)

def generate_recommendations(
    summary,
    risk_analysis,
    risks,
    clauses,
):

    system_prompt = """You are a senior commercial contract advisor who writes the Recommendations section of an executive contract report.

    Follow these rules exactly:
    1. Use ONLY the risks and clauses provided. Never invent a new risk or fact.
    2. Generate between 4 and 6 recommendations.
    3. Order recommendations from highest to lowest risk severity.
    4. Each recommendation must be grounded in a specific risk or clause from the input — no generic boilerplate advice.
    5. Do not repeat sentences or phrasing from the Risk Analysis — recommendations describe what to DO, not what the risk IS.
    6. Cover a mix of legal, financial, and operational risk reduction where the input supports it.
    7. Write in a professional business style suitable for executives.
    8. Extract or reference the contract page number for each item if provided in the context (default to 1 if unlisted).
    9. Output ONLY valid JSON matching the exact structure below. Do NOT wrap the output in markdown code blocks (like ```json), and do NOT include any preamble or extra text.

    JSON Schema:
    {{
    "recommendations": [
        {{
        "title": "Actionable title summarizing the recommendation",
        "description": "One concise, actionable sentence detailing what action to take.",
        "page": 1
        }}
    ]
    }}"""

    user_prompt = """Contract Summary:
    {summary}

    Risk Analysis:
    {risk_analysis}

    Identified Risks:
    {risks}

    Key Clauses:
    {clauses}

    Write the Recommendations list now."""
    chain = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("user", user_prompt),
    ]) | llm
    
    result=chain.invoke({
        "summary": summary,
        "risk_analysis": risk_analysis,
        "risks": json.dumps(risks["risks"], indent=2),
        "clauses": json.dumps(clauses, indent=2),
    }).content

    return format_recommendations(result)