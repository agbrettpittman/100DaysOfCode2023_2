from typing import Union
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Tests_For_Systems_Base(BaseModel):
    signature: Optional[str] = None
    signedOn: Optional[datetime] = None

class Tests_For_Systems_Full(Tests_For_Systems_Base):
    systems_id: int
    tests_id: int
    id: int

