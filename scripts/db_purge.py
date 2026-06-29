import os
import psycopg2
from dotenv import load_dotenv

load_dotenv('server/.env')
DATABASE_URL = os.getenv('DATABASE_URL')
if DATABASE_URL and '+asyncpg' in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace('+asyncpg', '')

def purge_database():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cur = conn.cursor()
    try:
        # Get tenant_ids for platform_owners
        cur.execute("SELECT DISTINCT tenant_id FROM platform_owners;")
        po_tenants = [row[0] for row in cur.fetchall()]
        
        # Delete tenants that do NOT have a platform owner
        # We need to make sure we don't break foreign keys, so we'll just delete from tenants directly
        # and CASCADE will handle everything that belongs to those tenants.
        if po_tenants:
            tenant_ids_str = tuple(po_tenants)
            if len(tenant_ids_str) == 1:
                query = f"DELETE FROM tenants WHERE id != {tenant_ids_str[0]};"
            else:
                query = f"DELETE FROM tenants WHERE id NOT IN {tenant_ids_str};"
            
            print(f"Executing: {query}")
            cur.execute(query)
            
            # Now, for the tenant(s) that DO have platform owners, we should delete their organizations, 
            # employees (except platform owners), leave types, etc.
            # Organizations
            cur.execute("DELETE FROM organizations;")
            # Onboarding apps
            cur.execute("DELETE FROM onboarding_applications;")
            # Employees (Platform Owners are in a separate table, so deleting employees is safe)
            cur.execute("DELETE FROM employees;")
            # Other tables that might not cascade from the above:
            cur.execute("DELETE FROM contact_messages;")
            cur.execute("DELETE FROM audit_logs;")
            cur.execute("DELETE FROM system_settings;")
            cur.execute("DELETE FROM leave_types;")
            cur.execute("DELETE FROM public_holidays;")
            cur.execute("DELETE FROM role_permissions;")
            
            # Check what's left
            cur.execute("SELECT count(*) FROM platform_owners;")
            print(f"Platform Owners remaining: {cur.fetchone()[0]}")
            
            cur.execute("SELECT count(*) FROM tenants;")
            print(f"Tenants remaining: {cur.fetchone()[0]}")
            
            cur.execute("SELECT count(*) FROM employees;")
            print(f"Employees remaining: {cur.fetchone()[0]}")
            
            cur.execute("SELECT count(*) FROM organizations;")
            print(f"Organizations remaining: {cur.fetchone()[0]}")
            
        else:
            print("No platform owners found! Deleting EVERYTHING except platform_owners table structure.")
            cur.execute("DELETE FROM tenants;")
            
        print("Database purged successfully.")
    except Exception as e:
        print(f"Error purging database: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == '__main__':
    purge_database()
