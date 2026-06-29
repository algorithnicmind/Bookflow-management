import os
import psycopg2
from dotenv import load_dotenv

load_dotenv('server/.env')
DATABASE_URL = os.getenv('DATABASE_URL')
if DATABASE_URL and '+asyncpg' in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace('+asyncpg', '')

def cleanup2():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cur = conn.cursor()
    try:
        # Keep onboarding apps:
        # 3 (GlobalCorp Inc) -> the "real" looking one
        # 5 (Design Studio X) -> requested
        # 6 (technev / Tech Nova) -> requested
        print("Deleting testing onboarding applications...")
        cur.execute("DELETE FROM onboarding_applications WHERE id NOT IN (3, 5, 6);")
        
        # Rename technev to Tech Nova in onboarding_applications as well just to be thorough
        cur.execute("UPDATE onboarding_applications SET company_name = 'Tech Nova' WHERE id = 6;")
        
        # Delete leave_balances
        print("Deleting all leave balances...")
        cur.execute("DELETE FROM leave_balances;")
        
        print("Cleanup 2 complete!")
    except Exception as e:
        print(f"Error during cleanup: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == '__main__':
    cleanup2()
