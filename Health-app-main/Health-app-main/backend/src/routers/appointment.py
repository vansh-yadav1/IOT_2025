from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime, timedelta
from ..models.appointment import Appointment, AppointmentCreate, AppointmentUpdate, AppointmentStatus
from ..utils.supabase_client import get_supabase_client
import uuid
from src.utils.supabase_client import supabase
from src.utils.auth import get_current_user_id

router = APIRouter(prefix="/appointments", tags=["appointments"])

# Router for appointment-related API endpoints.
# This file defines the routes for creating, updating, and retrieving appointments.

@router.post("/", response_model=Appointment)
async def create_appointment(
    appointment: AppointmentCreate
):
    supabase = get_supabase_client()
    """Create a new appointment"""
    # Check if the time slot is available
    existing = await check_availability(
        appointment.doctor_id,
        appointment.appointment_date,
        appointment.duration_minutes
    )
    if existing:
        raise HTTPException(status_code=400, detail="Time slot not available")

    # Create appointment in database
    data = {
        **appointment.model_dump(),
        "status": AppointmentStatus.SCHEDULED,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = supabase.table("appointments").insert(data).execute()
    
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create appointment")
    
    # Send notification to doctor
    # Fetch patient name (assuming patient_id is in appointment)
    patient = supabase.table("users").select("full_name").eq("id", appointment.patient_id).single().execute().data
    patient_name = patient["full_name"] if patient and "full_name" in patient else "A patient"
    notification = {
        "id": str(uuid.uuid4()),
        "user_id": appointment.doctor_id,
        "title": "New Appointment Booked",
        "message": f"{patient_name} has booked an appointment with you.",
        "created_at": datetime.utcnow(),
        "read": False
    }
    supabase.table("notifications").insert(notification).execute()
    
    return result.data[0]

# Endpoint to create a new appointment.
# It validates the appointment data and stores it in the database.

@router.get("/", response_model=List[Appointment])
async def get_appointments(user_id: str = Depends(get_current_user_id)):
    result = supabase.table('appointments').select('*').eq('user_id', user_id).order('date', desc=True).execute()
    if result.error:
        raise HTTPException(status_code=400, detail=result.error.message)
    return result.data

# Endpoint to retrieve appointments for a specific user.
# It filters appointments based on user ID and returns the results.

@router.get("/availability")
async def check_availability(
    doctor_id: str,
    date: datetime,
    duration: int = 30
):
    supabase = get_supabase_client()
    """Check if a time slot is available"""
    end_time = date + timedelta(minutes=duration)
    
    # Check for overlapping appointments
    result = supabase.table("appointments")\
        .select("*")\
        .eq("doctor_id", doctor_id)\
        .neq("status", AppointmentStatus.CANCELLED)\
        .lte("appointment_date", end_time)\
        .gte("appointment_date", date)\
        .execute()
        
    return len(result.data) == 0

@router.get("/slots")
async def get_available_slots(
    doctor_id: str,
    date: datetime,
    duration: int = 30
):
    supabase = get_supabase_client()
    """Get available time slots for a given day"""
    # Get doctor's schedule (assuming 9 AM to 5 PM)
    start_time = date.replace(hour=9, minute=0)
    end_time = date.replace(hour=17, minute=0)
    
    # Get all appointments for that day
    result = supabase.table("appointments")\
        .select("*")\
        .eq("doctor_id", doctor_id)\
        .neq("status", AppointmentStatus.CANCELLED)\
        .gte("appointment_date", start_time)\
        .lte("appointment_date", end_time)\
        .execute()
    
    booked_slots = [(a["appointment_date"], 
                     a["appointment_date"] + timedelta(minutes=a["duration_minutes"]))
                    for a in result.data]
    
    # Generate available slots
    available_slots = []
    current = start_time
    
    while current + timedelta(minutes=duration) <= end_time:
        slot_end = current + timedelta(minutes=duration)
        is_available = True
        
        for booked_start, booked_end in booked_slots:
            if (current < booked_end and slot_end > booked_start):
                is_available = False
                break
                
        if is_available:
            available_slots.append(current)
            
        current += timedelta(minutes=30)  # 30-minute intervals
        
    return available_slots

@router.put("/{appointment_id}", response_model=Appointment)
async def update_appointment(
    appointment_id: str,
    appointment: AppointmentUpdate
):
    supabase = get_supabase_client()
    """Update an appointment"""
    # Check if appointment exists
    existing = supabase.table("appointments")\
        .select("*")\
        .eq("id", appointment_id)\
        .execute()
        
    if not existing.data:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # If changing date/time, check availability
    if appointment.appointment_date:
        is_available = await check_availability(
            existing.data[0]["doctor_id"],
            appointment.appointment_date,
            appointment.duration_minutes or existing.data[0]["duration_minutes"]
        )
        if not is_available:
            raise HTTPException(status_code=400, detail="Time slot not available")
    
    # Update appointment
    data = {
        **appointment.model_dump(exclude_unset=True),
        "updated_at": datetime.utcnow()
    }
    
    result = supabase.table("appointments")\
        .update(data)\
        .eq("id", appointment_id)\
        .execute()
        
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to update appointment")
        
    return result.data[0]

@router.delete("/{appointment_id}")
async def cancel_appointment(
    appointment_id: str
):
    supabase = get_supabase_client()
    """Cancel an appointment"""
    result = supabase.table("appointments")\
        .update({
            "status": AppointmentStatus.CANCELLED,
            "updated_at": datetime.utcnow()
        })\
        .eq("id", appointment_id)\
        .execute()
        
    if not result.data:
        raise HTTPException(status_code=404, detail="Appointment not found")
        
    return {"message": "Appointment cancelled successfully"} 