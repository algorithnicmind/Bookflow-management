import os
import psycopg2
from dotenv import load_dotenv

load_dotenv('server/.env')
DATABASE_URL = os.getenv('DATABASE_URL')
if DATABASE_URL and '+asyncpg' in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace('+asyncpg', '')

def migrate():
    print(f"Connecting to {DATABASE_URL}")
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cur = conn.cursor()
    try:
        # Create tenants table
        cur.execute("""
        CREATE TABLE IF NOT EXISTS tenants (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            plan_type VARCHAR(20) DEFAULT 'starter' NOT NULL,
            module_access JSON,
            max_employees INTEGER,
            is_active BOOLEAN DEFAULT TRUE NOT NULL,
            access_days INTEGER DEFAULT 30,
            expires_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
        """)
        
        # Insert a default tenant
        cur.execute("""
        INSERT INTO tenants (id, name) VALUES (1, 'Default Tenant') ON CONFLICT DO NOTHING;
        """)
        
        tables = [
            "organizations", "role_permissions", "departments", "onboarding_applications",
            "system_settings", "public_holidays", "approval_chains", "approval_steps",
            "leave_policies", "accrual_logs", "platform_config", "leave_types",
            "notifications", "employees", "employee_images", "platform_owners",
            "calendar_integrations", "leave_requests", "leave_approvals", "leave_balances",
            "contact_messages", "audit_logs"
        ]
        
        for table in tables:
            try:
                # Check if column exists
                cur.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name='{table}' AND column_name='tenant_id';")
                res = cur.fetchone()
                if not res:
                    print(f"Adding tenant_id to {table}")
                    cur.execute(f"ALTER TABLE {table} ADD COLUMN tenant_id INTEGER DEFAULT 1;")
                    cur.execute(f"ALTER TABLE {table} ADD CONSTRAINT fk_{table}_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;")
            except Exception as e:
                print(f"Failed on {table}: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == '__main__':
    migrate()
