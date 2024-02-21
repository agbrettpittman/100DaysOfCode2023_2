import traceback
from fastapi import FastAPI, HTTPException
from database.connection import DBConn

app = FastAPI()

@app.on_event("startup")
def startup():
    app.state.pool = DBConn()

@app.get("/")
async def root():
    return {"message": "Welcome to the System Tests API"}

@app.get("/systems")
async def get_systems():
    try:
        results = []
        query = "SELECT * FROM systems"
        async with app.state.pool.getCursor() as cursor:
            await cursor.execute(query)
            results = cursor.fetchall()
        return results
    except Exception as e:
        traceback.print_exc()
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
        
