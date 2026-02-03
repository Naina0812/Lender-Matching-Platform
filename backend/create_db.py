import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_database():
    try:
        # Connect to default 'postgres' database to create the new one
        conn = psycopg2.connect(
            dbname="postgres",
            user="postgres",
            password="1234",
            host="localhost",
            port="5432"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        
        # Check if database exists
        cur.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'loan_db'")
        exists = cur.fetchone()
        
        if not exists:
            print("Creating database 'loan_db'...")
            cur.execute("CREATE DATABASE loan_db")
            print("Database created successfully.")
        else:
            print("Database 'loan_db' already exists.")
            
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error creating database: {e}")
        print("Please ensure PostgreSQL is running and the credentials (postgres/postgres) are correct.")

if __name__ == "__main__":
    create_database()
