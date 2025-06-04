from supabase import create_client
import os
from dotenv import load_dotenv
import requests

def test_supabase_connection():
    print("\n=== Testing Supabase Connection ===")
    
    # Load environment variables
    load_dotenv()
    
    # Get Supabase credentials
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    print(f"Supabase URL: {supabase_url}")
    print(f"Supabase Key exists: {bool(supabase_key)}")
    
    try:
        # Create Supabase client
        supabase = create_client(supabase_url, supabase_key)
        
        # Try to fetch users
        response = supabase.table('users').select("*").execute()
        print("\n✅ Supabase connection successful!")
        print(f"Number of users found: {len(response.data)}")
        
        return True
    except Exception as e:
        print("\n❌ Error connecting to Supabase:")
        print(str(e))
        return False

def test_backend_connection():
    print("\n=== Testing Backend Connection ===")
    try:
        response = requests.get("http://localhost:8000/docs")
        if response.status_code == 200:
            print("✅ Backend is running and accessible!")
            return True
        else:
            print(f"❌ Backend returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend. Make sure it's running on port 8000")
        return False

def test_database_connection():
    print("\n=== Testing Database Connection ===")
    try:
        db_url = os.getenv("DATABASE_URL")
        if not db_url:
            print("❌ DATABASE_URL not found in environment variables")
            return False
            
        print(f"Database URL exists: {bool(db_url)}")
        print("Attempting to connect to database...")
        
        # Try to connect using supabase client
        supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
        
        # Try to list all tables
        response = supabase.table('users').select("count").execute()
        
        print("✅ Database connection successful!")
        print(f"Tables accessible and query executed successfully")
        return True
        
    except Exception as e:
        print("❌ Error connecting to database:")
        print(str(e))
        return False

if __name__ == "__main__":
    print("🏥 Hospital Management System - Connection Tester")
    print("=" * 50)
    
    supabase_ok = test_supabase_connection()
    backend_ok = test_backend_connection()
    db_ok = test_database_connection()
    
    print("\n=== Summary ===")
    print(f"Supabase Connection: {'✅' if supabase_ok else '❌'}")
    print(f"Backend Server:      {'✅' if backend_ok else '❌'}")
    print(f"Database Connection: {'✅' if db_ok else '❌'}")
    
    if not all([supabase_ok, backend_ok, db_ok]):
        print("\n⚠️ Some connections failed. Please check the error messages above.") 