from fastapi import APIRouter, HTTPException, Query, Body, Path, Depends
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from ..models.wearable_data import (
    WearableData, 
    WearableDataResponse, 
    WearableDeviceInfo,
    HeartRateData,
    ActivityData,
    SleepData,
    VitalSigns
)
from ..utils.vital_client import get_vital_client
from ..utils.supabase_client import get_supabase_client
from ..utils.user_utils import get_current_user

router = APIRouter(prefix="/wearable", tags=["wearable"])

@router.get("/connect/{user_id}", response_model=Dict[str, Any])
async def get_connection_link(user_id: str = Path(..., description="User ID")):
    """Get a link for a user to connect their wearable devices"""
    try:
        client = get_vital_client()
        link_data = client.get_user_link(user_id)
        return link_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get connection link: {str(e)}")

@router.get("/devices/{user_id}", response_model=List[WearableDeviceInfo])
async def get_user_devices(user_id: str = Path(..., description="User ID")):
    """Get a list of connected devices for a user"""
    try:
        client = get_vital_client()
        devices = client.get_user_devices(user_id)
        return devices
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user devices: {str(e)}")

@router.get("/sources/{user_id}", response_model=List[Dict[str, Any]])
async def get_connected_sources(user_id: str = Path(..., description="User ID")):
    """Get a list of connected data sources for a user"""
    try:
        client = get_vital_client()
        sources = client.get_connected_sources(user_id)
        return sources
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get connected sources: {str(e)}")

@router.post("/users", response_model=Dict[str, Any])
async def create_vital_user(
    client_user_id: str = Body(..., description="Client user ID"),
    profile: Dict[str, Any] = Body(..., description="User profile")
):
    """Create a new user in Vital API"""
    try:
        client = get_vital_client()
        user_data = client.create_user(client_user_id, profile)
        
        # Store the Vital user ID in Supabase for future reference
        supabase = get_supabase_client()
        supabase.table("vital_users").insert({
            "user_id": client_user_id,
            "vital_user_id": user_data.get("user_id"),
            "created_at": datetime.now().isoformat()
        }).execute()
        
        return user_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")

@router.get("/data/heart-rate/{user_id}", response_model=Dict[str, Any])
async def get_heart_rate_data(
    user_id: str = Path(..., description="User ID"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
):
    """Get heart rate data for a user"""
    try:
        client = get_vital_client()
        
        # Convert string dates to datetime if provided
        start_dt = datetime.strptime(start_date, "%Y-%m-%d") if start_date else None
        end_dt = datetime.strptime(end_date, "%Y-%m-%d") if end_date else None
        
        heart_rate_data = client.get_heart_rate_data(user_id, start_dt, end_dt)
        return heart_rate_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get heart rate data: {str(e)}")

@router.get("/data/activity/{user_id}", response_model=Dict[str, Any])
async def get_activity_data(
    user_id: str = Path(..., description="User ID"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
):
    """Get activity data for a user"""
    try:
        client = get_vital_client()
        
        # Convert string dates to datetime if provided
        start_dt = datetime.strptime(start_date, "%Y-%m-%d") if start_date else None
        end_dt = datetime.strptime(end_date, "%Y-%m-%d") if end_date else None
        
        activity_data = client.get_activity_data(user_id, start_dt, end_dt)
        return activity_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get activity data: {str(e)}")

@router.get("/data/sleep/{user_id}", response_model=Dict[str, Any])
async def get_sleep_data(
    user_id: str = Path(..., description="User ID"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
):
    """Get sleep data for a user"""
    try:
        client = get_vital_client()
        
        # Convert string dates to datetime if provided
        start_dt = datetime.strptime(start_date, "%Y-%m-%d") if start_date else None
        end_dt = datetime.strptime(end_date, "%Y-%m-%d") if end_date else None
        
        sleep_data = client.get_sleep_data(user_id, start_dt, end_dt)
        return sleep_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get sleep data: {str(e)}")

@router.get("/data/blood-oxygen/{user_id}", response_model=Dict[str, Any])
async def get_blood_oxygen_data(
    user_id: str = Path(..., description="User ID"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)")
):
    """Get blood oxygen data for a user"""
    try:
        client = get_vital_client()
        
        # Convert string dates to datetime if provided
        start_dt = datetime.strptime(start_date, "%Y-%m-%d") if start_date else None
        end_dt = datetime.strptime(end_date, "%Y-%m-%d") if end_date else None
        
        blood_oxygen_data = client.get_blood_oxygen_data(user_id, start_dt, end_dt)
        return blood_oxygen_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get blood oxygen data: {str(e)}")

@router.get("/summary/{user_id}", response_model=Dict[str, Any])
async def get_health_summary(
    user_id: str = Path(..., description="User ID"),
    period: str = Query("week", description="Time period (day, week, month)")
):
    """Get a summary of health data for a user"""
    try:
        client = get_vital_client()
        
        # Set time period based on parameter
        if period == "day":
            start_date = datetime.now() - timedelta(days=1)
        elif period == "month":
            start_date = datetime.now() - timedelta(days=30)
        else:  # default to week
            start_date = datetime.now() - timedelta(days=7)
            
        end_date = datetime.now()
        
        # Get data from different sources
        heart_rate = client.get_heart_rate_data(user_id, start_date, end_date)
        activity = client.get_activity_data(user_id, start_date, end_date)
        sleep = client.get_sleep_data(user_id, start_date, end_date)
        blood_oxygen = client.get_blood_oxygen_data(user_id, start_date, end_date)
        
        # Combine into a summary
        summary = {
            "user_id": user_id,
            "period": period,
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d"),
            "heart_rate": heart_rate.get("summary", {}),
            "activity": activity.get("summary", {}),
            "sleep": sleep.get("summary", {}),
            "blood_oxygen": blood_oxygen.get("summary", {})
        }
        
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get health summary: {str(e)}")

@router.get("/report/{user_id}", response_model=Dict[str, Any])
async def generate_health_report(
    user_id: str = Path(..., description="User ID"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    user = Depends(get_current_user)
):
    """Generate a comprehensive health report for a user"""
    if user.role != 'PATIENT':
        raise HTTPException(status_code=403, detail='Not authorized')
    try:
        client = get_vital_client()
        
        # Convert string dates to datetime if provided
        start_dt = datetime.strptime(start_date, "%Y-%m-%d") if start_date else datetime.now() - timedelta(days=30)
        end_dt = datetime.strptime(end_date, "%Y-%m-%d") if end_date else datetime.now()
        
        # Get all health data
        heart_rate = client.get_heart_rate_data(user_id, start_dt, end_dt)
        activity = client.get_activity_data(user_id, start_dt, end_dt)
        sleep = client.get_sleep_data(user_id, start_dt, end_dt)
        blood_oxygen = client.get_blood_oxygen_data(user_id, start_dt, end_dt)
        
        # Process data into a report format
        report = {
            "user_id": user_id,
            "report_period": {
                "start_date": start_dt.strftime("%Y-%m-%d"),
                "end_date": end_dt.strftime("%Y-%m-%d"),
                "duration_days": (end_dt - start_dt).days
            },
            "heart_rate": {
                "average": heart_rate.get("summary", {}).get("average_hr", 0),
                "resting": heart_rate.get("summary", {}).get("resting_hr", 0),
                "max": heart_rate.get("summary", {}).get("max_hr", 0),
                "min": heart_rate.get("summary", {}).get("min_hr", 0)
            },
            "activity": {
                "total_steps": activity.get("summary", {}).get("total_steps", 0),
                "total_calories": activity.get("summary", {}).get("total_calories", 0),
                "total_distance": activity.get("summary", {}).get("total_distance", 0),
                "active_minutes": activity.get("summary", {}).get("active_minutes", 0)
            },
            "sleep": {
                "average_duration": sleep.get("summary", {}).get("average_duration", 0),
                "average_efficiency": sleep.get("summary", {}).get("average_efficiency", 0),
                "average_deep_sleep": sleep.get("summary", {}).get("average_deep_sleep", 0),
                "average_rem_sleep": sleep.get("summary", {}).get("average_rem_sleep", 0)
            },
            "blood_oxygen": {
                "average": blood_oxygen.get("summary", {}).get("average", 0),
                "min": blood_oxygen.get("summary", {}).get("min", 0)
            },
            "generated_at": datetime.now().isoformat()
        }
        
        # Save report to Supabase
        supabase = get_supabase_client()
        report_id = f"{user_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        supabase.table("health_reports").insert({
            "id": report_id,
            "user_id": user_id,
            "report_data": report,
            "created_at": datetime.now().isoformat()
        }).execute()
        
        report["report_id"] = report_id
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate health report: {str(e)}") 