import os
import re
from pathlib import Path
from urllib.parse import quote_plus

import pymysql
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv(Path(__file__).resolve().parents[1] / '.env')

host = os.getenv('MYSQL_HOST', '127.0.0.1')
port = os.getenv('MYSQL_PORT', '3306')
database = os.getenv('MYSQL_DATABASE', 'muji_clone')
user = os.getenv('MYSQL_USER')
password = os.getenv('MYSQL_PASSWORD')

if not user or password is None:
    raise RuntimeError('MySQL credentials are not configured. Copy backend/.env.example to backend/.env and set MYSQL_USER/MYSQL_PASSWORD.')
if not re.fullmatch(r'[A-Za-z0-9_]+', database):
    raise RuntimeError('MYSQL_DATABASE must contain only letters, numbers, and underscores.')

DATABASE_URL = (
    f'mysql+pymysql://{quote_plus(user)}:{quote_plus(password)}@{host}:{port}/'
    f'{database}?charset=utf8mb4'
)

def ensure_database():
    connection = pymysql.connect(
        host=host,
        port=int(port),
        user=user,
        password=password,
        charset='utf8mb4',
        autocommit=True,
    )
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                f'CREATE DATABASE IF NOT EXISTS `{database}` '
                'CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
            )
    finally:
        connection.close()

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

def get_session():
    with SessionLocal() as session:
        yield session
