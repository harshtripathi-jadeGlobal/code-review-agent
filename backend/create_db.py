import asyncio
import os
import aiomysql
from urllib.parse import unquote

async def create_database():
    url = os.getenv("DATABASE_URL")
    if not url or "mysql+aiomysql" not in url:
        return
        
    # parse credentials
    # mysql+aiomysql://root:Aa%4031122003@localhost:3306/code_review_db
    parts = url.split("://")[1].split("@")
    user_pass = parts[0].split(":")
    user = user_pass[0]
    password = unquote(user_pass[1])
    
    host_port_db = parts[1].split("/")
    host_port = host_port_db[0].split(":")
    host = host_port[0]
    port = int(host_port[1])
    db_name = host_port_db[1]
    
    try:
        conn = await aiomysql.connect(host=host, port=port, user=user, password=password)
        async with conn.cursor() as cur:
            await cur.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        conn.close()
        print(f"Database {db_name} created successfully!")
    except Exception as e:
        print(f"Failed to create database: {e}")

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    asyncio.run(create_database())
