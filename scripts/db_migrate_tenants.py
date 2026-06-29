import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv('server/.env')
DATABASE_URL = os.getenv('DATABASE_URL')
# ensure it uses postgresql:// for asyncpg
if DATABASE_URL and '+asyncpg' in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace('+asyncpg', '')

async def migrate():
    print(f"Connecting to {DATABASE_URL}")
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        # Create tenants table
        await conn.execute("""
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
        await conn.execute("""
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
                res = await conn.fetchval(f"SELECT column_name FROM information_schema.columns WHERE table_name='{table}' AND column_name='tenant_id';")
                if not res:
                    print(f"Adding tenant_id to {table}")
                    await conn.execute(f"ALTER TABLE {table} ADD COLUMN tenant_id INTEGER DEFAULT 1;")
                    await conn.execute(f"ALTER TABLE {table} ADD CONSTRAINT fk_{table}_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;")
            except Exception as e:
                print(f"Failed on {table}: {e}")
    finally:
        await conn.close()

if __name__ == '__main__':
    asyncio.run(migrate())
