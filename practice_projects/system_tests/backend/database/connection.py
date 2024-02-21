import tormysql, os, contextlib
from tormysql.cursor import DictCursor

class DBConn:

    def __init__(self):
        self.pool = tormysql.ConnectionPool(
            max_connections = 20, #max open connections
            idle_seconds = 7200, #conntion idle timeout time, 0 is not timeout
            wait_connection_timeout = 3, #wait connection timeout
            host = os.getenv("DB_HOST"),
            user = os.getenv("DB_USER"),
            passwd = os.getenv("DB_PASSWORD"),
            db = os.getenv("DB_NAME"),
            charset = "utf8"
        )

    @contextlib.asynccontextmanager
    async def getCursor(self):
        async with await self.pool.Connection() as conn:
            async with conn.cursor(DictCursor) as cursor:
                yield cursor
                