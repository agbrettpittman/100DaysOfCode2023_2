from typing import Union
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Optional

class Systems_Base(BaseModel):
    hardwareMake: str
    hardwareModel: str
    softwareName: str
    softwareVersion: str

class Systems_Full(Systems_Base):
    id: int

class Systems_Update(BaseModel):
    hardwareMake: Optional[str] = None
    hardwareModel: Optional[str] = None
    softwareName: Optional[str] = None
    softwareVersion: Optional[str] = None


