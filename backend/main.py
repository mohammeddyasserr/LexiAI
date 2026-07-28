# for example:
# from routers import prison
# app.include_router(prison.router)

from fastapi import FastAPI
from routers.upload import router as upload_contract
from routers.rag import router as ask

app = FastAPI()


app = FastAPI()

app.include_router(upload_contract)
app.include_router(ask)