# Hospital Management System Database Structure

## Current Database Structure

Based on what we've observed, the current database has these key tables:

### Core Tables
1. **users**
   - `id` (UUID, primary key)
   - `email` (text, unique)
   - `full_name` (text)
   - `role` (DOCTOR, PATIENT, etc.)
   - `phone_number` (text, nullable)
   - Various timestamps and other fields

2. **doctor_profiles**
   - `id` (UUID, primary key) 
   - `user_id` (UUID, foreign key to users.id)
   - `license_number` (text)
   - `bio` (text)
   - `availability_status` (text)

3. **appointments**
   - `id` (UUID, primary key)
   - `doctor_id` (UUID, foreign key to users.id) - Current issue!
   - `patient_id` (UUID, foreign key to users.id)
   - `appointment_date` (date)
   - `start_time` (time)
   - `end_time` (time)
   - `status` (PENDING, CONFIRMED, etc.)
   - `reason` (text)
   - `notes` (text)

### Issues Identified

1. **Incorrect Foreign Key Reference**: The `appointments` table uses `doctor_id` referencing `users.id` rather than `doctor_profiles.id`
2. **Unclear Role-Based Structure**: No clear separation between doctor and patient data
3. **Lack of Data Validation**: Missing constraints and checks
4. **No Automatic Profile Creation**: Doctors need manual profile creation
5. **Missing Location Support**: No way to track user locations for "appointments near me" feature

## Proposed New Database Structure

The redesigned schema addresses all these issues with a cleaner structure:

### Core Tables

1. **users**
   - `id` (UUID, primary key)
   - `email` (text, unique)
   - `first_name` (text)
   - `last_name` (text)
   - `full_name` (computed column)
   - `role` (ADMIN, DOCTOR, PATIENT, STAFF)
   - `phone_number` (text)
   - `date_of_birth` (date)
   - `gender` (MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY)

2. **doctor_profiles**
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to users.id)
   - `license_number` (text)
   - `specialty` (text)
   - `bio` (text)
   - `education` (text array)
   - `certifications` (text array)
   - `experience_years` (integer)
   - `consultation_fee` (decimal)
   - `rating` (decimal)
   - `availability_status` (AVAILABLE, UNAVAILABLE, ON_LEAVE)

3. **patient_profiles**
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to users.id)
   - `blood_type` (text)
   - `allergies` (text array)
   - `chronic_conditions` (text array)
   - `emergency_contact_name` (text)
   - `emergency_contact_phone` (text)
   - `insurance_provider` (text)
   - `insurance_policy_number` (text)

4. **appointments**
   - `id` (UUID, primary key)
   - `doctor_profile_id` (UUID, foreign key to doctor_profiles.id)
   - `patient_id` (UUID, foreign key to users.id)
   - `title` (text)
   - `appointment_date` (date)
   - `start_time` (time)
   - `end_time` (time)
   - `status` (PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW)
   - `type` (IN_PERSON, VIRTUAL)
   - `location` (text)
   - `meeting_link` (text)
   - `reason` (text)
   - `notes` (text)

### Supporting Tables

5. **doctor_availability**
   - `id` (UUID, primary key)
   - `doctor_profile_id` (UUID, foreign key to doctor_profiles.id)
   - `day_of_week` (integer, 0-6)
   - `start_time` (time)
   - `end_time` (time)
   - `is_available` (boolean)

6. **doctor_specializations**
   - `id` (UUID, primary key)
   - `doctor_profile_id` (UUID, foreign key to doctor_profiles.id)
   - `specialization` (text)

7. **health_metrics**
   - `id` (UUID, primary key)
   - `patient_id` (UUID, foreign key to users.id)
   - `measured_at` (timestamp)
   - Various health measurements (height, weight, blood pressure, etc.)

8. **notifications**
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to users.id)
   - `title` (text)
   - `message` (text)
   - `type` (APPOINTMENT, MESSAGE, SYSTEM, REMINDER)
   - `is_read` (boolean)
   - `data` (JSONB)

9. **messages**
   - `id` (UUID, primary key)
   - `sender_id` (UUID, foreign key to users.id)
   - `recipient_id` (UUID, foreign key to users.id)
   - `content` (text)
   - `is_read` (boolean)

### Geographic Tables

10. **locations**
    - `id` (UUID, primary key)
    - `name` (text)
    - `address` (text)
    - `city` (text)
    - `state` (text)
    - `country` (text)
    - `postal_code` (text)
    - `type` (HOSPITAL, CLINIC, PHARMACY, LAB, OTHER)
    - `geom` (GEOMETRY POINT) - geographic coordinates

11. **doctor_locations**
    - `id` (UUID, primary key)
    - `doctor_profile_id` (UUID, foreign key to doctor_profiles.id)
    - `location_id` (UUID, foreign key to locations.id)
    - `is_primary` (boolean)
    - `office_number` (text)
    - `floor_number` (text)

12. **user_locations** ✨
    - `id` (UUID, primary key)
    - `user_id` (UUID, foreign key to users.id)
    - `address` (text)
    - `city` (text)
    - `state` (text)
    - `country` (text)
    - `postal_code` (text)
    - `is_default` (boolean)
    - `label` (text) - "Home", "Work", etc.
    - `geom` (GEOMETRY POINT) - geographic coordinates

13. **user_location_preferences** ✨
    - `id` (UUID, primary key)
    - `user_id` (UUID, foreign key to users.id)
    - `default_search_radius_km` (numeric)
    - `preferred_location_type` (text)
    - `include_virtual_appointments` (boolean)
    - `save_search_history` (boolean)

### Automation Features

The new schema includes automatic profile creation with database triggers:

1. When a user with role="DOCTOR" is created, a doctor_profile is automatically created
2. When a user with role="PATIENT" is created, a patient_profile is automatically created
3. When a user is registered with address information, a user_location record is created

### Special Functions

1. **find_available_doctors_near_me**
   - Find doctors near a user's location
   - Filter by specialty, distance, and availability
   - Returns doctor information with distance and next available appointment slot

### Security

All tables have Row-Level Security with appropriate policies:
- Doctors can only see/edit their own data
- Patients can only see/edit their own data
- Users can only see/edit their own location data
- Admins have broader access where appropriate 