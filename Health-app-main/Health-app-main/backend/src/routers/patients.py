from fastapi import APIRouter, HTTPException
from src.utils.supabase_client import get_supabase_client
import logging

router = APIRouter(prefix="/patients", tags=["patients"])

@router.get("/")
def get_all_patients():
    try:
        supabase = get_supabase_client()
        if not supabase:
            raise HTTPException(status_code=500, detail="Failed to initialize Supabase client")
            
        logging.info("Fetching all patients from Supabase")
        resp = supabase.table("patients").select("*").execute()
        
        if hasattr(resp, 'error') and resp.error:
            logging.error(f"Supabase error: {resp.error.message}")
            raise HTTPException(status_code=400, detail=resp.error.message)
            
        logging.info(f"Successfully fetched {len(resp.data)} patients")
        return resp.data
    except Exception as e:
        logging.error(f"Error fetching patients: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 