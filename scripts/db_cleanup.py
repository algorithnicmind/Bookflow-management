import os
import psycopg2
from dotenv import load_dotenv

load_dotenv('server/.env')
DATABASE_URL = os.getenv('DATABASE_URL')
if DATABASE_URL and '+asyncpg' in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace('+asyncpg', '')

def cleanup():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cur = conn.cursor()
    try:
        # Delete all leave types as requested
        print("Deleting all leave types...")
        cur.execute("DELETE FROM leave_types;")
        
        # Rename 'technev' to 'Tech Nova' to match user request
        print("Ensuring 'Tech Nova' organization exists...")
        cur.execute("UPDATE organizations SET name = 'Tech Nova' WHERE name ILIKE 'technev';")
        
        # Delete any organization that is NOT 'Design Studio X' or 'Tech Nova'
        print("Deleting other organizations...")
        cur.execute("DELETE FROM organizations WHERE name NOT IN ('Design Studio X', 'Tech Nova');")
        
        # If there are any tenants not associated with any organization, we can leave them or delete them, 
        # but the prompt specifically asked to delete other organizations and keep data related to the two.
        # Since tables CASCADE from organizations or tenants, deleting other organizations removes their data.
        
        print("Cleanup complete!")
    except Exception as e:
        print(f"Error during cleanup: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == '__main__':
    cleanup()
