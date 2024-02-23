import traceback
from fastapi import APIRouter, HTTPException
from typing import List
from ..models.tests import Tests_Full, Tests_Base
from database.connection import DBConn

router = APIRouter(
    prefix="/tests",
    tags=["Tests"],
    responses={
        404: {"description": "Test(s) not found"},
        500: {"description": "Internal Server Error"},
    },
)

@router.get("")
async def get_tests() -> List[Tests_Full]:
    try:
        results = []
        query = "SELECT * FROM tests"
        async with DBConn.getCursor() as (cursor,conn):
            await cursor.execute(query)
            results = cursor.fetchall()
        return results
    except Exception as e:
        traceback.print_exc()
        print(e)
        raise HTTPException(status_code=404, detail=str(e))
    
@router.post("")
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
        async with DBConn.getCursor() as (cursor,conn):
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
    
@router.get("/{id}")
async def get_test(id: int) -> Tests_Full:
    try:
        query = "SELECT * FROM tests WHERE id = %s"
        async with DBConn.getCursor() as (cursor,conn):
            await cursor.execute(query, (id,))
            result = cursor.fetchone()
        return result
    except Exception as e:
        traceback.print_exc()
        print(e)
        raise HTTPException(status_code=404, detail=str(e))
    
@router.put("/{id}")
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

        async with DBConn.getCursor() as (cursor,conn):
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
    
@router.delete("/{id}")
async def delete_test(id: int):
    try:
        query = "DELETE FROM tests WHERE id = %s"
        async with DBConn.getCursor() as (cursor,conn):
            await cursor.execute(query, (id,))
            await conn.commit()
        return {"message": "Test deleted"}
    except Exception as e:
        traceback.print_exc()
        print(e)
        raise HTTPException(status_code=500, detail=str(e))