import asyncio
import asyncpg
import ssl

async def main():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    try:
        conn = await asyncpg.connect('postgresql://neondb_owner:npg_OwNdDnegY30T@ep-shiny-bonus-aq9jopbg-pooler.c-8.us-east-1.aws.neon.tech/neondb', ssl=ctx)
        rows = await conn.fetch("SELECT id, email, name FROM platform_owners")
        print("Owners in DB:", rows)
        
        # Now update the owner password to something known
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        new_hash = pwd_context.hash("Owner@123!")
        
        if len(rows) > 0:
            owner_id = rows[0]['id']
            await conn.execute("UPDATE platform_owners SET password_hash = $1 WHERE id = $2", new_hash, owner_id)
            print(f"Updated password for {rows[0]['email']} to 'Owner@123!'")
        else:
            print("No owners found!")
            
        await conn.close()
    except Exception as e:
        print("Error:", e)

asyncio.run(main())
