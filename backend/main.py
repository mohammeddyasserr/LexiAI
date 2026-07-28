# for example:
# from routers import prison
# app.include_router(prison.router)

from fastapi import FastAPI
from routers.upload import router as upload_contract

app = FastAPI()


app = FastAPI()

app.include_router(upload_contract)