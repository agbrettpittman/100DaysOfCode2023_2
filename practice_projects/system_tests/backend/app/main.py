import traceback
from fastapi import FastAPI, HTTPException
from database.connection import DBConn
from models.systems import Systems_Full, Systems_Base, Systems_Update
from models.tests import Tests_Full, Tests_Base
from typing import List


app = FastAPI()

@app.on_event("startup")
def startup():
    app.state.pool = DBConn()

@app.get("/")
async def root():
    return {"message": "Welcome to the System Tests API"}

@app.get("/systems")
async def get_systems() -> List[Systems_Full]:
    try:
        results = []
        query = "SELECT * FROM systems"
        async with app.state.pool.getCursor() as (cursor,conn):
            await cursor.execute(query)
            results = cursor.fetchall()
        return results
    except Exception as e:
        traceback.print_exc()
        print(e)
        raise HTTPException(status_code=404, detail=str(e))
        
@app.post("/systems")
async def create_system(system: Systems_Base) -> Systems_Full:
    print(system)
    try:
        query = '''
        INSERT INTO systems (
            hardwareMake, 
            hardwareModel, 
            softwareName, 
            softwareVersion
        ) 
        VALUES (
            %(hardwareMake)s,
            %(hardwareModel)s,
            %(softwareName)s,
            %(softwareVersion)s
        )
        '''
        async with app.state.pool.getCursor() as (cursor,conn):
            inserted_id = None
            try:
                await cursor.execute(query, system.__dict__)
            except Exception as e:
                await conn.rollback()
                raise HTTPException(status_code=500, detail=str(e))
            else:
                await conn.commit()
                inserted_id = cursor.lastrowid

            if inserted_id is None:
                raise HTTPException(status_code=500, detail="Failed to insert system")

            try:
                inserted_system = await get_system(inserted_id)
                return inserted_system
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))
            
    except Exception as e:
        traceback.print_exc()
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/systems/{id}")
async def get_system(id: int) -> Systems_Full:
    try:
        query = "SELECT * FROM systems WHERE id = %s"
        async with app.state.pool.getCursor() as (cursor,conn):
            await cursor.execute(query, (id,))
            result = cursor.fetchone()
        return result
    except Exception as e:
        traceback.print_exc()
        print(e)
        raise HTTPException(status_code=404, detail=str(e))
    
@app.put("/systems/{id}")
async def update_system(id: int, system: Systems_Update) -> Systems_Full:
    try:

        values_to_insert = system.__dict__

        cols_to_change = [
            f'{k} = %({k})s' 
            for k in values_to_insert.keys() 
            if values_to_insert[k] is not None
        ]

        cols_to_change = ', '.join(cols_to_change)

        values_to_insert['id'] = id

        query = f'''
            UPDATE systems
            SET 
                {cols_to_change}
            WHERE id = %(id)s
        '''

        async with app.state.pool.getCursor() as (cursor,conn):
            try:
                await cursor.execute(query, values_to_insert)
            except Exception as e:
                await conn.rollback()
                raise HTTPException(status_code=500, detail=str(e))
            else:
                await conn.commit()

            try:
                updated_system = await get_system(id)
                return updated_system
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))

    except Exception as e:
        traceback.print_exc()
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    
@app.delete("/systems/{id}")
async def delete_system(id: int):
    try:
        query = "DELETE FROM systems WHERE id = %s"
        async with app.state.pool.getCursor() as (cursor,conn):
            await cursor.execute(query, (id,))
            await conn.commit()
        return {"message": "System deleted"}
    except Exception as e:
        traceback.print_exc()
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/tests")
async def get_tests() -> List[Tests_Full]:
    try:
        results = []
        query = "SELECT * FROM tests"
        async with app.state.pool.getCursor() as (cursor,conn):
            await cursor.execute(query)
            results = cursor.fetchall()
        return results
    except Exception as e:
        traceback.print_exc()
        print(e)
        raise HTTPException(status_code=404, detail=str(e))
    
@app.post("/tests")
async def create_test(test: Tests_Base) -> Tests_Full:
    try:
        query = '''
        INSERT INTO tests (
            name
        ) 
        VALUES (
            %(name)s
        )
        '''
        async with app.state.pool.getCursor() as (cursor,conn):
            inserted_id = None
            try:
                await cursor.execute(query, test.__dict__)
            except Exception as e:
                await conn.rollback()
                raise HTTPException(status_code=500, detail=str(e))
            else:
                await conn.commit()
                inserted_id = cursor.lastrowid

            if inserted_id is None:
                raise HTTPException(status_code=500, detail="Failed to insert test")

            try:
                inserted_test = await get_test(inserted_id)
                return inserted_test
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))
            
    except Exception as e:
        traceback.print_exc()
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/tests/{id}")
async def get_test(id: int) -> Tests_Full:
    try:
        query = "SELECT * FROM tests WHERE id = %s"
        async with app.state.pool.getCursor() as (cursor,conn):
            await cursor.execute(query, (id,))
            result = cursor.fetchone()
        return result
    except Exception as e:
        traceback.print_exc()
        print(e)
        raise HTTPException(status_code=404, detail=str(e))
    
@app.put("/tests/{id}")
async def update_test(id: int, test: Tests_Base) -> Tests_Full:
    try:
        values_to_insert = test.__dict__
        values_to_insert['id'] = id

        query = '''
            UPDATE tests
            SET 
                name = %(name)s
            WHERE id = %(id)s
        '''

        async with app.state.pool.getCursor() as (cursor,conn):
            try:
                await cursor.execute(query, values_to_insert)
            except Exception as e:
                await conn.rollback()
                raise HTTPException(status_code=500, detail=str(e))
            else:
                await conn.commit()

            try:
                updated_test = await get_test(id)
                return updated_test
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))

    except Exception as e:
        traceback.print_exc()
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    
@app.delete("/tests/{id}")
async def delete_test(id: int):
    try:
        query = "DELETE FROM tests WHERE id = %s"
        async with app.state.pool.getCursor() as (cursor,conn):
            await cursor.execute(query, (id,))
            await conn.commit()
        return {"message": "Test deleted"}
    except Exception as e:
        traceback.print_exc()
        print(e)
        raise HTTPException(status_code=500, detail=str(e))