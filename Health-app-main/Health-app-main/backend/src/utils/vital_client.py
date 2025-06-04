import os
import requests
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import json

class VitalAPIClient:
    """Client for interacting with the Vital API to get wearable data"""
    
    def __init__(self):
        self.api_key = os.environ.get("VITAL_API_KEY", "")
        self.base_url = "https://api.tryvital.io/v2"
        self.headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-API-Key": self.api_key
        }
        
    def get_user_devices(self, user_id: str) -> List[Dict[str, Any]]:
        """Get a list of connected devices for a user"""
        url = f"{self.base_url}/user/{user_id}/devices"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json().get("devices", [])
    
    def get_heart_rate_data(self, user_id: str, start_date: Optional[datetime] = None, 
                          end_date: Optional[datetime] = None) -> Dict[str, Any]:
        """Get heart rate data for a user within a date range"""
        if not start_date:
            start_date = datetime.now() - timedelta(days=7)
        if not end_date:
            end_date = datetime.now()
            
        url = f"{self.base_url}/timeseries/{user_id}/heart_rate"
        params = {
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d"),
        }
        response = requests.get(url, headers=self.headers, params=params)
        response.raise_for_status()
        return response.json()
    
    def get_activity_data(self, user_id: str, start_date: Optional[datetime] = None,
                         end_date: Optional[datetime] = None) -> Dict[str, Any]:
        """Get activity data for a user within a date range"""
        if not start_date:
            start_date = datetime.now() - timedelta(days=7)
        if not end_date:
            end_date = datetime.now()
            
        url = f"{self.base_url}/timeseries/{user_id}/activity"
        params = {
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d"),
        }
        response = requests.get(url, headers=self.headers, params=params)
        response.raise_for_status()
        return response.json()
    
    def get_sleep_data(self, user_id: str, start_date: Optional[datetime] = None,
                      end_date: Optional[datetime] = None) -> Dict[str, Any]:
        """Get sleep data for a user within a date range"""
        if not start_date:
            start_date = datetime.now() - timedelta(days=7)
        if not end_date:
            end_date = datetime.now()
            
        url = f"{self.base_url}/timeseries/{user_id}/sleep"
        params = {
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d"),
        }
        response = requests.get(url, headers=self.headers, params=params)
        response.raise_for_status()
        return response.json()
    
    def get_blood_oxygen_data(self, user_id: str, start_date: Optional[datetime] = None,
                            end_date: Optional[datetime] = None) -> Dict[str, Any]:
        """Get blood oxygen data for a user within a date range"""
        if not start_date:
            start_date = datetime.now() - timedelta(days=7)
        if not end_date:
            end_date = datetime.now()
            
        url = f"{self.base_url}/timeseries/{user_id}/blood_oxygen"
        params = {
            "start_date": start_date.strftime("%Y-%m-%d"),
            "end_date": end_date.strftime("%Y-%m-%d"),
        }
        response = requests.get(url, headers=self.headers, params=params)
        response.raise_for_status()
        return response.json()
    
    def create_user(self, client_user_id: str, profile: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new user in Vital API"""
        url = f"{self.base_url}/user"
        payload = {
            "client_user_id": client_user_id,
            "profile": profile
        }
        response = requests.post(url, headers=self.headers, json=payload)
        response.raise_for_status()
        return response.json()
    
    def get_user_link(self, user_id: str) -> Dict[str, Any]:
        """Get a link for a user to connect their wearable devices"""
        url = f"{self.base_url}/user/{user_id}/link"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()
    
    def get_connected_sources(self, user_id: str) -> List[Dict[str, Any]]:
        """Get a list of connected data sources for a user"""
        url = f"{self.base_url}/user/{user_id}/providers"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json().get("providers", [])

def get_vital_client() -> VitalAPIClient:
    """Get a configured Vital API client"""
    return VitalAPIClient() 