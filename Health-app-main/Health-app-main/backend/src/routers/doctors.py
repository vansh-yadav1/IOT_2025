from fastapi import APIRouter, Depends, HTTPException, Query, Body
from typing import List
from ..models.doctor import Doctor
from ..utils.supabase_client import get_supabase_client

router = APIRouter(prefix="/doctors", tags=["doctors"])

@router.get("/locations", response_model=List[Doctor])
async def get_doctors_locations():
    supabase = get_supabase_client()
    """Get all doctors' locations"""
    result = supabase.table("doctors").select("*").execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="No doctors found")
    return result.data

@router.get("/nearby", response_model=List[Doctor])
async def get_doctors_nearby(
    latitude: float = Query(..., description="User's latitude"),
    longitude: float = Query(..., description="User's longitude"),
    radius: float = Query(10, description="Search radius in kilometers")
):
    supabase = get_supabase_client()
    """Get doctors near a user's location"""
    # This is a simplified example. In a real application, you would use a more sophisticated
    # query to find doctors within a certain radius of the user's location.
    result = supabase.table("doctors").select("*").execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="No doctors found")
    return result.data

@router.post("/sample")
async def create_sample_doctors():
    supabase = get_supabase_client()
    """Create sample doctors in the database for testing purposes"""
    sample_doctors = [
        {"id": "1", "name": "Dr. John Doe", "specialty": "Cardiology", "latitude": 30.3165, "longitude": 78.0322},
        {"id": "2", "name": "Dr. Jane Smith", "specialty": "Pediatrics", "latitude": 30.3165, "longitude": 78.0322},
        {"id": "3", "name": "Dr. Robert Johnson", "specialty": "Orthopedics", "latitude": 30.3165, "longitude": 78.0322},
        {"id": "4", "name": "Dr. Emily Davis", "specialty": "Dermatology", "latitude": 30.3165, "longitude": 78.0322},
        {"id": "5", "name": "Dr. Michael Brown", "specialty": "Neurology", "latitude": 30.3165, "longitude": 78.0322},
        {"id": "6", "name": "Dr. Sarah Wilson", "specialty": "Oncology", "latitude": 30.3165, "longitude": 78.0322},
        {"id": "7", "name": "Dr. David Miller", "specialty": "Gastroenterology", "latitude": 30.3165, "longitude": 78.0322},
        {"id": "8", "name": "Dr. Lisa Taylor", "specialty": "Endocrinology", "latitude": 30.3165, "longitude": 78.0322},
        {"id": "9", "name": "Dr. James Anderson", "specialty": "Urology", "latitude": 30.3165, "longitude": 78.0322},
        {"id": "10", "name": "Dr. Patricia Thomas", "specialty": "Rheumatology", "latitude": 30.3165, "longitude": 78.0322},
        {"id": "11", "name": "Dr. William White", "specialty": "Cardiology", "latitude": 30.3165, "longitude": 78.0322},
        {"id": "12", "name": "Dr. Elizabeth Black", "specialty": "Pediatrics", "latitude": 30.3165, "longitude": 78.0322},
        {"id": "13", "name": "Dr. Charles Green", "specialty": "Orthopedics", "latitude": 30.3165, "longitude": 78.0322},
        {"id": "14", "name": "Dr. Margaret Blue", "specialty": "Dermatology", "latitude": 30.3165, "longitude": 78.0322},
        {"id": "15", "name": "Dr. Joseph Red", "specialty": "Neurology", "latitude": 30.3165, "longitude": 78.0322},
        {"id": "16", "name": "Dr. Susan Yellow", "specialty": "Oncology", "latitude": 30.3165, "longitude": 78.0322},
        {"id": "17", "name": "Dr. Thomas Purple", "specialty": "Gastroenterology", "latitude": 30.3165, "longitude": 78.0322},
        {"id": "18", "name": "Dr. Nancy Orange", "specialty": "Endocrinology", "latitude": 30.3165, "longitude": 78.0322},
        {"id": "19", "name": "Dr. Richard Pink", "specialty": "Urology", "latitude": 30.3165, "longitude": 78.0322},
        {"id": "20", "name": "Dr. Karen Brown", "specialty": "Rheumatology", "latitude": 30.3165, "longitude": 78.0322}
    ]
    for doctor in sample_doctors:
        supabase.table("doctors").insert(doctor).execute()
    return {"message": "Sample doctors created successfully"}

@router.post("/register", response_model=Doctor)
async def register_doctor(
    id: str = Body(...),
    name: str = Body(...),
    specialty: str = Body(...),
    latitude: float = Body(...),
    longitude: float = Body(...)
):
    supabase = get_supabase_client()
    # Check if doctor already exists
    existing = supabase.table("doctors").select("*").eq("id", id).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Doctor already exists")
    doctor = {
        "id": id,
        "name": name,
        "specialty": specialty,
        "latitude": latitude,
        "longitude": longitude
    }
    result = supabase.table("doctors").insert(doctor).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to register doctor")
    return result.data[0] 