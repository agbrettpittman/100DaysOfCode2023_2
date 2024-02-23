import traceback
from fastapi import APIRouter, HTTPException
from typing import List
from ..models.systems import Systems_Full, Systems_Base, Systems_Update, Systems_Add_Test, Systems_Test
from ..models.tests_for_systems import Tests_For_Systems_Full, Tests_For_Systems_Base
from database.connection import DBConn
from datetime import datetime

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
    
@router.post("/{id}/tests")
async def add_test_to_system(id: int, data: Systems_Add_Test) -> Tests_For_Systems_Full:
    try:
        query = '''
        INSERT INTO tests_for_systems (
            systems_id,
            tests_id,
            signature,
            signedOn
        ) 
        VALUES (
            %(systems_id)s,
            %(tests_id)s,
            %(signature)s,
            %(signedOn)s
        )
        '''

        test_check_query = "SELECT * FROM tests WHERE id = %s"
        get_results_query = "SELECT * FROM tests_for_systems WHERE id = %s"

        values_to_insert = data.__dict__
        values_to_insert['systems_id'] = id

        if (values_to_insert["signature"] and values_to_insert["signedOn"] is None):
            values_to_insert["signedOn"] = datetime.now()

        async with DBConn.getCursor() as (cursor,conn):
            try:
                await cursor.execute(test_check_query, (values_to_insert["tests_id"],))
                test = cursor.fetchone()
                if not test:
                    raise HTTPException(status_code=404, detail="Test not found")
                await cursor.execute(query, values_to_insert)
            except Exception as e:
                await conn.rollback()
                if hasattr(e, "status_code"):
                    raise e
                raise HTTPException(status_code=500, detail=str(e))
            else:
                await conn.commit()
                inserted_id = cursor.lastrowid
                await cursor.execute(get_results_query, (inserted_id,))
                result = cursor.fetchone()
                return result

    except Exception as e:
        traceback.print_exc()
        print(e)
        if hasattr(e, "status_code"):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/{id}/tests")
async def get_tests_for_system(id: int) -> List[Systems_Test]:
    try:
        query = '''
            SELECT
                tests_for_systems.id AS id,
                tests_for_systems.tests_id,
                tests.name,
                tests_for_systems.signature,
                tests_for_systems.signedOn
            FROM tests
            JOIN tests_for_systems ON tests.id = tests_for_systems.tests_id
            WHERE systems_id = %s
        '''
        async with DBConn.getCursor() as (cursor,conn):
            await cursor.execute(query, (id,))
            results = cursor.fetchall()
        return results
    except Exception as e:
        traceback.print_exc()
        print(e)
        raise HTTPException(status_code=404, detail=str(e))
    
@router.put("/{system_id}/tests/{tests_id}")
async def update_test_for_system(system_id: int, tests_id: int, data: Tests_For_Systems_Base) -> Tests_For_Systems_Full:
    try:
        where_clause = "WHERE systems_id = %(system_id)s AND tests_id = %(tests_id)s"

        update_query = f'''
        UPDATE tests_for_systems
        SET 
            signature = %(signature)s,
            signedOn = %(signedOn)s
        {where_clause}
        '''
        
        get_results_query = f'''
        SELECT * FROM tests_for_systems 
        {where_clause}
        '''

        update_query_args = data.__dict__
        update_query_args["system_id"] = system_id
        update_query_args["tests_id"] = tests_id
        if (update_query_args["signature"] and update_query_args["signedOn"] is None):
            update_query_args["signedOn"] = datetime.now()

        get_results_args = {
            "system_id": system_id,
            "tests_id": tests_id
        }

        async with DBConn.getCursor() as (cursor,conn):
            try:
                await cursor.execute(get_results_query, get_results_args)
                result = cursor.fetchone()
                if not result:
                    raise HTTPException(status_code=404, detail="Test not found for system")
                await cursor.execute(update_query, update_query_args)
            except Exception as e:
                await conn.rollback()
                if hasattr(e, "status_code"):
                    raise e
                raise HTTPException(status_code=500, detail=str(e))
            else:
                await conn.commit()
                await cursor.execute(get_results_query, get_results_args)
                result = cursor.fetchone()
                return result

    except Exception as e:
        traceback.print_exc()
        print(e)
        if hasattr(e, "status_code"):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
    
@router.delete("/{system_id}/tests/{tests_id}")
async def remove_test_from_system(system_id: int, tests_id: int):
    try:
        query = "DELETE FROM tests_for_systems WHERE systems_id = %s AND tests_id = %s"
        async with DBConn.getCursor() as (cursor,conn):
            await cursor.execute(query, (system_id, tests_id))
            await conn.commit()
        return {"message": "Test removed from system"}
    except Exception as e:
        traceback.print_exc()
        print(e)
        raise HTTPException(status_code=500, detail=str(e))