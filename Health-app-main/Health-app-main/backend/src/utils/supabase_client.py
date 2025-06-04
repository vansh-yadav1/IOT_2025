from supabase import create_client
import os
from dotenv import load_dotenv
import traceback

# Load environment variables
load_dotenv()

# Supabase client setup for the Hospital Management System.
# This file initializes the Supabase client for database interactions.

def get_supabase_client():
    try:
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_KEY")
        
        if not supabase_url or not supabase_key:
            print("Environment variables check:")
            print(f"SUPABASE_URL present: {'Yes' if supabase_url else 'No'}")
            print(f"SUPABASE_KEY present: {'Yes' if supabase_key else 'No'}")
            raise ValueError("Supabase URL and key must be provided in environment variables")
        
        # Create Supabase client
        client = create_client(supabase_url, supabase_key)
        return client
    except Exception as e:
        print(f"Error initializing Supabase client: {str(e)}")
        print("Full error traceback:")
        print(traceback.format_exc())
        return None

def test_connection():
    client = get_supabase_client()
    if client:
        try:
            # Try to fetch a small amount of data to test connection
            print("Attempting to connect to Supabase...")
            print(f"Using URL: {os.getenv('SUPABASE_URL', 'Not set')[:20]}...")  # Only show first 20 chars for security
            response = client.table('users').select("id").limit(1).execute()
            print("Successfully connected to Supabase!")
            print("Response data:", response.data)
            return True
        except Exception as e:
            print(f"Failed to connect to Supabase: {str(e)}")
            print("Full error traceback:")
            print(traceback.format_exc())
            return False
    return False 

# Function to get the Supabase client instance.
# It ensures that the client is initialized with the correct credentials.

supabase = get_supabase_client() 