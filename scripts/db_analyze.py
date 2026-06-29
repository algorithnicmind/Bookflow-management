import os
import psycopg2
from dotenv import load_dotenv
import json

load_dotenv('server/.env')
DATABASE_URL = os.getenv('DATABASE_URL')
if DATABASE_URL and '+asyncpg' in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace('+asyncpg', '')

def analyze():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    cur.execute("SELECT id, name, tenant_id FROM organizations;")
    orgs = cur.fetchall()
    print("Organizations:")
    for org in orgs:
        print(f"  ID: {org[0]}, Name: {org[1]}, Tenant ID: {org[2]}")
        
    cur.execute("SELECT id, name FROM tenants;")
    tenants = cur.fetchall()
    print("\nTenants:")
    for tenant in tenants:
        print(f"  ID: {tenant[0]}, Name: {tenant[1]}")
        
    cur.execute("SELECT id, name, tenant_id FROM leave_types;")
    lts = cur.fetchall()
    print("\nLeave Types:")
    for lt in lts:
        print(f"  ID: {lt[0]}, Name: {lt[1]}, Tenant ID: {lt[2]}")
        
    cur.close()
    conn.close()

if __name__ == '__main__':
    analyze()
