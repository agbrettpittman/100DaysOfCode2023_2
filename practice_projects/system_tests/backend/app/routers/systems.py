import traceback
from fastapi import APIRouter, HTTPException
from typing import List
from ..models.systems import Systems_Full, Systems_Base, Systems_Update
from database.connection import DBConn

router = APIRouter(
    prefix="/systems",
    tags=["Systems"],
    responses={
        404: {"description": "System(s) not found"},
        500: {"description": "Internal Server Error"},
    },
)

@router.get("")
async def get_systems() -> List[Systems_Full]:
    try:
        results = []
        query = "SELECT * FROM systems"
        async with DBConn.getCursor() as (cursor,conn):
            await cursor.execute(query)
            results = cursor.fetchall()
        return results
    except Exception as e:
        traceback.print_exc()
        print(e)
        raise HTTPException(status_code=404, detail=str(e))
        
@router.post("")
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
        async with DBConn.getCursor() as (cursor,conn):
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
    
@router.get("/{id}")
async def get_system(id: int) -> Systems_Full:
    try:
        query = "SELECT * FROM systems WHERE id = %s"
        async with DBConn.getCursor() as (cursor,conn):
            await cursor.execute(query, (id,))
            result = cursor.fetchone()
        return result
    except Exception as e:
        traceback.print_exc()
        print(e)
        raise HTTPException(status_code=404, detail=str(e))
    
@router.put("/{id}")
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

        async with DBConn.getCursor() as (cursor,conn):
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
    
@router.delete("/{id}")
async def delete_system(id: int):
    try:
        query = "DELETE FROM systems WHERE id = %s"
        async with DBConn.getCursor() as (cursor,conn):
            await cursor.execute(query, (id,))
            await conn.commit()
        return {"message": "System deleted"}
    except Exception as e:
        traceback.print_exc()
        print(e)
        raise HTTPException(status_code=500, detail=str(e))