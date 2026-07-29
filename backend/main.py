# for example:
# from routers import prison
# app.include_router(prison.router)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers.upload import router as upload_contract
from backend.routers.rag import router as ask
from backend.routers.contract_analysis import router as analysis_router
from backend.routers.report import router as get_report
from backend.routers.risk_analysis import router as get_risk
from backend.routers.dashboard import router as get_dashboard_stats
from backend.routers.contracts import router as get_contracts

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://localhost:3000",
        "http://localhost:8081",
        "http://127.0.0.1:8081"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis_router)
app.include_router(get_report)
app.include_router(upload_contract)
app.include_router(ask)
app.include_router(get_risk)
app.include_router(get_dashboard_stats)
app.include_router(get_contracts)