from pydantic import BaseModel

class Doctor(BaseModel):
    id: str
    name: str
    specialty: str
    latitude: float
    longitude: float

class DoctorProfile(BaseModel):
    firstName: str
    lastName: str
    email: str
    phone: str
    specialty: str
    qualifications: str
    languages: str
    licenseNumber: str
    yearsOfExperience: str
    clinicAffiliation: str
    officeAddress: str
    consultationHours: str 