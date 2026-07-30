"""
ask_llm() backed by a local Ollama server instead of transformers.

Prerequisites:
    1. Install Ollama: https://ollama.com/download
    2. Pull the model once:
           ollama pull qwen2.5:1.5b-instruct
    3. Install the Python client:
           pip install ollama

Ollama runs its own local server (usually on http://localhost:11434)
and manages the model file, quantization, and memory for you — no
manual model loading, no ~15GB full-precision download.
"""

import ollama

MODEL_NAME = "qwen2.5:1.5b"


def ask_llm(prompt: str) -> str:
    """
    Sends a prompt to the local Ollama server and returns the raw
    text response. Same signature/behavior as before: callers
    (compare_clauses, generate_recommendation) still just get back
    a string they parse as JSON themselves.
    """

    response = ollama.chat(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": "You are an expert legal contract analyst."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        options={
            "temperature": 0.1,     # matches the original transformers config
            "num_predict": 3000,    # raised from 1500 — was truncating the 8-object JSON array
        }
    )

    return response["message"]["content"]