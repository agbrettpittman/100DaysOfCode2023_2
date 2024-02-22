from typing import Union
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Optional

class Tests_Base(BaseModel):
    name: str

class Tests_Full(Tests_Base):
    id: int