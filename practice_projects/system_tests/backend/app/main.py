import traceback
from fastapi import FastAPI, HTTPException
from database.connection import DBConn
from .routers import systems, tests
from typing import List
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.include_router(systems.router)
app.include_router(tests.router)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    DBConn.connect()

@app.get("/")
async def root():
    return {"message": "Welcome to the System Tests API"}