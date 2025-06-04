import jwt
from fastapi import Depends, HTTPException, Header
from starlette.status import HTTP_401_UNAUTHORIZED

SUPABASE_JWT_SECRET = "YOUR_SUPABASE_JWT_SECRET"  # Replace with your actual secret

def get_current_user_id(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Invalid auth header")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"])
        return payload["sub"]
    except Exception as e:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Invalid token") 