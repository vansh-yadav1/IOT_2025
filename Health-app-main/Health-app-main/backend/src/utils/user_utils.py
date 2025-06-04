from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .supabase_client import supabase

security = HTTPBearer()

def upsert_patient(user):
    # user is expected to be a dict with id, email, and user_metadata (which may contain full_name)
    if not user:
        return
    user_id = user.get('id')
    email = user.get('email')
    full_name = user.get('user_metadata', {}).get('full_name') or user.get('user_metadata', {}).get('name')
    if not user_id or not email:
        return
    supabase.table("patients").upsert({
        "id": user_id,
        "email": email,
        "full_name": full_name
    }).execute()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        # Get the token from the Authorization header
        token = credentials.credentials
        
        # Verify the token with Supabase
        user = supabase.auth.get_user(token)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Upsert patient info on login
        upsert_patient(user.get('user'))
        return user
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) 