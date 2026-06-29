import os
import psycopg2
from dotenv import load_dotenv

load_dotenv('server/.env')
DATABASE_URL = os.getenv('DATABASE_URL')
if DATABASE_URL and '+asyncpg' in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace('+asyncpg', '')

def update_plans():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cur = conn.cursor()
    try:
        cur.execute("UPDATE tenants SET plan_type = 'free_tier' WHERE plan_type = 'starter';")
        cur.execute("UPDATE tenants SET plan_type = 'customization' WHERE plan_type = 'enterprise';")
        print("Plan types updated successfully!")
    except Exception as e:
        print(f"Error updating plans: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == '__main__':
    update_plans()
