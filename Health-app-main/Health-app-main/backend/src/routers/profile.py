from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from src.utils.supabase_client import supabase
from src.utils.auth import get_current_user_id
from src.models.doctor import DoctorProfile

router = APIRouter(prefix="/profile", tags=["profile"])

class Address(BaseModel):
    street: str
    city: str
    state: str
    zipCode: str
    country: str

class Insurance(BaseModel):
    provider: str
    policyNumber: str
    groupNumber: str
    validUntil: str

class EmergencyContact(BaseModel):
    name: str
    relationship: str
    phone: str

@router.put("/address")
async def update_address(address: Address, user_id: str = Depends(get_current_user_id)):
    result = supabase.table('profiles').update(address.dict()).eq('id', user_id).execute()
    if result.error:
        raise HTTPException(status_code=400, detail=result.error.message)
    return {"message": "Address updated", "address": address}

@router.put("/insurance")
async def update_insurance(insurance: Insurance, user_id: str = Depends(get_current_user_id)):
    result = supabase.table('profiles').update(insurance.dict()).eq('id', user_id).execute()
    if result.error:
        raise HTTPException(status_code=400, detail=result.error.message)
    return {"message": "Insurance updated", "insurance": insurance}

@router.put("/emergency-contact")
async def update_emergency_contact(contact: EmergencyContact, user_id: str = Depends(get_current_user_id)):
    result = supabase.table('profiles').update(contact.dict()).eq('id', user_id).execute()
    if result.error:
        raise HTTPException(status_code=400, detail=result.error.message)
    return {"message": "Emergency contact updated", "contact": contact}

@router.put("/doctor")
async def update_doctor_profile(
    profile: DoctorProfile,
    user_id: str = Depends(get_current_user_id)
):
    print("[DEBUG] Incoming doctor profile update:", profile.dict())
    print("[DEBUG] user_id:", user_id)
    if not user_id:
        print("[DEBUG] No user_id provided!")
        raise HTTPException(status_code=401, detail="User authentication failed. No user ID.")
    result = supabase.table('doctors').update(profile.dict()).eq('id', user_id).execute()
    print("[DEBUG] Supabase update result:", result)
    if result.error:
        print("[DEBUG] Supabase error:", result.error)
        raise HTTPException(status_code=400, detail=str(result.error))
    if not result.data or (isinstance(result.data, list) and len(result.data) == 0):
        print("[DEBUG] No doctor record updated for user_id:", user_id)
        raise HTTPException(status_code=404, detail="Doctor profile not found for this user.")
    return {"message": "Doctor profile updated", "profile": profile} 