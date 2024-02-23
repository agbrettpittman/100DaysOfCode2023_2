import traceback
from fastapi import FastAPI, HTTPException
from database.connection import DBConn
from .routers import systems, tests
from typing import List


app = FastAPI()
app.include_router(systems.router)
app.include_router(tests.router)

@app.on_event("startup")
def startup():
    DBConn.connect()

@app.get("/")
async def root():
    return {"message": "Welcome to the System Tests API"}