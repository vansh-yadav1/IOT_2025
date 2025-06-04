from fastapi import APIRouter, Depends, HTTPException, status, Request
from src.utils.supabase_client import supabase
from src.utils.auth import get_current_user_id

router = APIRouter(prefix="/appointment-requests", tags=["Appointment Requests"])

@router.post("/")
async def request_appointment(
    request: Request,
    doctor_id: int,
    message: str,
    user_id: str = Depends(get_current_user_id)
):
    data = {
        "doctor_id": doctor_id,
        "patient_id": user_id,
        "message": message,
    }
    result = supabase.table("appointments").insert(data).execute()
    if result.error:
        raise HTTPException(status_code=500, detail=result.error.message)
    return {"success": True, "appointment": result.data[0]}

@router.get("/")
async def get_appointments(user_id: str = Depends(get_current_user_id)):
    result = supabase.table("appointments").select("*").eq("patient_id", user_id).execute()
    if result.error:
        raise HTTPException(status_code=500, detail=result.error.message)
    return result.data 