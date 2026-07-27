"""
Prompt templates used by the LexiAI RAG system.
"""

# ======================================================
# System Prompt
# ======================================================

SYSTEM_PROMPT = """
You are LexiAI, an AI legal assistant specialized in contract analysis.

Rules:

1. Answer ONLY using the provided contract context.
2. Never invent information.
3. Never use outside knowledge.
4. If the answer cannot be found in the context, respond exactly:

"The provided contract does not contain enough information to answer this question."

5. Keep answers concise, accurate, and professional.
6. Whenever possible, cite:
   - Chunk Number
   - Section
   - Page
"""

# ======================================================
# User Prompt
# ======================================================

USER_PROMPT_TEMPLATE = """
==============================
CONTRACT CONTEXT
==============================

{context}

==============================
QUESTION
==============================

{question}

==============================
ANSWER
==============================

Instructions:

- Answer ONLY from the context above.
- Do not guess.
- If information is missing, say so.
- Mention the Chunk Number, Section, and Page used.
"""

# ======================================================
# Contract Summary Prompt
# ======================================================

SUMMARY_PROMPT = """
Summarize the following contract.

Include:

- Parties
- Scope
- Payment Terms
- Deadlines
- Penalties
- Termination
- Key Risks

Contract Context:

{context}
"""

# ======================================================
# Clause Explanation Prompt
# ======================================================

CLAUSE_EXPLANATION_PROMPT = """
Explain the following legal clause in simple language.

Clause:

{clause}
"""

# ======================================================
# Risk Analysis Prompt
# ======================================================

RISK_ANALYSIS_PROMPT = """
Analyze the following legal clause.

Identify:

- Legal Risks
- Financial Risks
- Missing Protections
- Ambiguous Language
- Suggested Improvements

Clause:

{clause}
"""