import os
from dotenv import load_dotenv
load_dotenv()
try:
    print("Script started")
    print("Supabase URL from .env:", os.getenv("SUPABASE_URL"))
    from src.utils.supabase_client import get_supabase_client

    def test_patients():
        client = get_supabase_client()
        print("Client:", client)
        # Try to list all tables (using information_schema)
        try:
            resp_tables = client.table('information_schema.tables').select('table_name').eq('table_schema', 'public').execute()
            print("Tables in public schema:", [t['table_name'] for t in resp_tables.data])
        except Exception as e:
            print("Could not list tables:", e)
        resp = client.table("patients").select("*").execute()
        print("Raw response:", resp)
        print("Patients:", resp.data)

    if __name__ == "__main__":
        test_patients()
except Exception as e:
    print("Exception occurred:", e) 