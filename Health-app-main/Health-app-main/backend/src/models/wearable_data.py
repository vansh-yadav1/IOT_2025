from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class WearableDataPoint(BaseModel):
    """Model for a single data point from a wearable device"""
    value: float
    unit: str
    timestamp: datetime

class HeartRateData(BaseModel):
    """Model for heart rate data from wearable devices"""
    average: Optional[float] = None
    max: Optional[float] = None
    min: Optional[float] = None
    resting: Optional[float] = None
    data_points: Optional[List[WearableDataPoint]] = None

class ActivityData(BaseModel):
    """Model for activity data from wearable devices"""
    steps: Optional[int] = None
    calories_burned: Optional[float] = None
    distance: Optional[float] = None
    active_minutes: Optional[int] = None
    exercise_time: Optional[int] = None
    data_points: Optional[Dict[str, List[WearableDataPoint]]] = None

class SleepData(BaseModel):
    """Model for sleep data from wearable devices"""
    duration: Optional[float] = None
    efficiency: Optional[float] = None
    score: Optional[float] = None
    deep_sleep: Optional[float] = None
    rem_sleep: Optional[float] = None
    light_sleep: Optional[float] = None
    data_points: Optional[Dict[str, List[WearableDataPoint]]] = None

class VitalSigns(BaseModel):
    """Model for vital signs from wearable devices"""
    blood_oxygen: Optional[float] = None
    respiratory_rate: Optional[float] = None
    temperature: Optional[float] = None
    blood_glucose: Optional[float] = None
    data_points: Optional[Dict[str, List[WearableDataPoint]]] = None

class WearableData(BaseModel):
    """Model for wearable device data"""
    user_id: str
    device_id: Optional[str] = None
    device_type: Optional[str] = None
    heart_rate: Optional[HeartRateData] = None
    activity: Optional[ActivityData] = None
    sleep: Optional[SleepData] = None
    vitals: Optional[VitalSigns] = None
    timestamp: datetime
    raw_data: Optional[Dict[str, Any]] = None

class WearableDataResponse(BaseModel):
    """Response model for wearable data endpoints"""
    data: List[WearableData]
    
class WearableDeviceInfo(BaseModel):
    """Model for wearable device information"""
    id: str
    name: str
    type: str
    manufacturer: str
    connected_since: Optional[datetime] = None
    last_sync: Optional[datetime] = None 