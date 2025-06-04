from datetime import datetime, timedelta
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field

# Appointment model for the Hospital Management System.
# This file defines the structure and behavior of appointments in the system, ensuring seamless integration with IoT devices for health monitoring.

class AppointmentStatus(str, Enum):
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    NO_SHOW = "no_show"

class AppointmentType(str, Enum):
    REGULAR = "regular"
    FOLLOW_UP = "follow_up"
    URGENT = "urgent"
    CONSULTATION = "consultation"

class AppointmentBase(BaseModel):
    patient_id: str
    doctor_id: str
    appointment_date: datetime
    appointment_type: AppointmentType
    reason: str
    duration_minutes: int = Field(default=30, ge=15, le=120)
    notes: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    appointment_date: Optional[datetime] = None
    appointment_type: Optional[AppointmentType] = None
    reason: Optional[str] = None
    duration_minutes: Optional[int] = Field(default=None, ge=15, le=120)
    notes: Optional[str] = None
    status: Optional[AppointmentStatus] = None

# Appointment class that represents a scheduled appointment between a patient and a doctor.
# It includes methods for creating, updating, and retrieving appointment details, supporting real-time health data synchronization.

class Appointment(AppointmentBase):
    id: str
    status: AppointmentStatus = AppointmentStatus.SCHEDULED
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 