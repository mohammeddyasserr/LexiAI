# for example:
# from routers import prison
# app.include_router(prison.router)

from fastapi import FastAPI
from routers.upload import router as upload_contract
from routers.rag import router as ask
from backend.routers.contract_analysis import router as analysis_router
from backend.routers.upload import router as upload_contract

app = FastAPI()

# Try to include the upload router, but don't fail startup if it errors
try:
	app.include_router(upload_contract)
except Exception as e:
	print(f"Upload router not included: {e}")


app.include_router(analysis_router)


app.include_router(upload_contract)
app.include_router(ask)