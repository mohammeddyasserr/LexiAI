# LexiAI

> **Privacy-first legal intelligence for contract analysis, comparison, and grounded Q&A.**

![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-Local%20LLMs-000000?logo=ollama&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-Orchestration-1C3C3C)
![Qdrant](https://img.shields.io/badge/Qdrant-Vector%20DB-DC382D?logo=qdrant&logoColor=white)
![HuggingFace](https://img.shields.io/badge/HuggingFace-Embeddings-FCC624?logo=huggingface&logoColor=black)

## Core Idea

LexiAI turns contracts into actionable legal intelligence. It uses a modular, local-first AI stack to ingest documents, structure legal content, compare clauses, and answer questions from source-grounded context instead of generic model memory.

## Main Features

- Smart document ingestion for native PDFs and scanned files.
- Side-by-side clause comparison with buyer-risk evaluation.
- Grounded legal Q&A powered by retrieval-augmented generation.
- Automated executive reporting with structured summaries and recommendations.

## Technology Stack

| Layer                   | Technologies                     |
| ----------------------- | -------------------------------- |
| AI & Inference          | Ollama, Qwen models, HuggingFace |
| Backend & Orchestration | FastAPI, LangChain               |
| Storage & Search        | Qdrant Vector DB                 |
| Document Processing     | PyMuPDF, EasyOCR                 |

## High-Level Flow

Document in, structure out: LexiAI routes each file through ingestion, extraction, analysis, and insight generation. Native PDFs are handled with fast text extraction, while scanned documents fall back to OCR. The processed content then feeds comparison, reporting, and grounded RAG answers.

## Installation

1. `...`
2. `...`
3. `...`
