from typing import Union
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Optional
from .tests_for_systems import Tests_For_Systems_Base

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

class Systems_Add_Test(Tests_For_Systems_Base):
    tests_id: int

class Systems_Test(BaseModel):
    id: int
    tests_id: int
    name: str
    signature: Optional[str] = None
    signedOn: Optional[str] = None