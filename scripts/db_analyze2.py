import os
import psycopg2
from dotenv import load_dotenv

load_dotenv('server/.env')
DATABASE_URL = os.getenv('DATABASE_URL')
if DATABASE_URL and '+asyncpg' in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace('+asyncpg', '')

def analyze():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    print("--- Onboarding Applications ---")
    cur.execute("SELECT id, company_name, super_admin_email, status FROM onboarding_applications;")
    apps = cur.fetchall()
    for app in apps:
        print(f"ID: {app[0]}, Company: {app[1]}, Email: {app[2]}, Status: {app[3]}")
        
    print("\n--- Leave Balances Count ---")
    cur.execute("SELECT count(*) FROM leave_balances;")
    print(f"Total leave balances: {cur.fetchone()[0]}")
    
    cur.close()
    conn.close()

if __name__ == '__main__':
    analyze()
