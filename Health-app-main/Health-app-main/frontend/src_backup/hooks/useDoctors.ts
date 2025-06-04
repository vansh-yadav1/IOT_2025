import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image?: string;
  department?: string;
  hospital?: string;
  schedule?: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  education?: string[];
  certifications?: string[];
  experience?: string;
  acceptingNewPatients?: boolean;
  bio?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    officeLocation?: string;
  };
}

// Mock doctor data
const mockDoctors: Doctor[] = [
  {
    id: 'dr1',
    name: 'Dr. John Smith',
    specialty: 'General Practitioner',
    image: '/assets/doctors/john-smith.jpg',
    department: 'Family Medicine',
    hospital: 'Main Hospital',
    schedule: [
      { day: 'Monday', startTime: '09:00', endTime: '17:00' },
      { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
      { day: 'Friday', startTime: '09:00', endTime: '15:00' }
    ],
    education: [
      'MD, Harvard Medical School',
      'Residency, Massachusetts General Hospital'
    ],
    certifications: [
      'American Board of Family Medicine',
      'Advanced Cardiac Life Support'
    ],
    experience: '15 years',
    acceptingNewPatients: true,
    bio: 'Dr. Smith specializes in family medicine with a focus on preventive care and chronic disease management.',
    contactInfo: {
      email: 'john.smith@hospital.com',
      phone: '(555) 123-4567',
      officeLocation: 'Main Building, Floor 2, Room 201'
    }
  },
  {
    id: 'dr2',
    name: 'Dr. Emily Chen',
    specialty: 'Cardiology',
    image: '/assets/doctors/emily-chen.jpg',
    department: 'Cardiology',
    hospital: 'Heart Center',
    schedule: [
      { day: 'Tuesday', startTime: '08:00', endTime: '16:00' },
      { day: 'Thursday', startTime: '08:00', endTime: '16:00' },
      { day: 'Friday', startTime: '09:00', endTime: '13:00' }
    ],
    education: [
      'MD, Johns Hopkins University School of Medicine',
      'Residency, Cleveland Clinic',
      'Fellowship in Cardiology, Mayo Clinic'
    ],
    certifications: [
      'American Board of Internal Medicine - Cardiovascular Disease',
      'Certification in Advanced Heart Failure and Transplant Cardiology'
    ],
    experience: '12 years',
    acceptingNewPatients: true,
    bio: 'Dr. Chen is a board-certified cardiologist specializing in heart failure and cardiovascular disease.',
    contactInfo: {
      email: 'emily.chen@hospital.com',
      phone: '(555) 234-5678',
      officeLocation: 'Heart Center, Floor 3, Room 305'
    }
  },
  {
    id: 'dr3',
    name: 'Dr. Maria Rodriguez',
    specialty: 'Family Medicine',
    image: '/assets/doctors/maria-rodriguez.jpg',
    department: 'Family Medicine',
    hospital: 'Community Health Center',
    schedule: [
      { day: 'Monday', startTime: '10:00', endTime: '18:00' },
      { day: 'Tuesday', startTime: '10:00', endTime: '18:00' },
      { day: 'Thursday', startTime: '10:00', endTime: '18:00' }
    ],
    education: [
      'MD, University of California, San Francisco',
      'Residency, UCLA Medical Center'
    ],
    certifications: [
      'American Board of Family Medicine',
      'Certified in Telehealth Services'
    ],
    experience: '8 years',
    acceptingNewPatients: true,
    bio: 'Dr. Rodriguez is dedicated to providing comprehensive care for patients of all ages, with special interest in women\'s health and telemedicine.',
    contactInfo: {
      email: 'maria.rodriguez@hospital.com',
      phone: '(555) 345-6789',
      officeLocation: 'Community Health Center, Room 105'
    }
  },
  {
    id: 'dr4',
    name: 'Dr. David Kim',
    specialty: 'Pediatrics',
    image: '/assets/doctors/david-kim.jpg',
    department: 'Pediatrics',
    hospital: 'Children\'s Hospital',
    schedule: [
      { day: 'Monday', startTime: '08:30', endTime: '16:30' },
      { day: 'Wednesday', startTime: '08:30', endTime: '16:30' },
      { day: 'Thursday', startTime: '08:30', endTime: '16:30' }
    ],
    education: [
      'MD, Stanford University School of Medicine',
      'Residency in Pediatrics, Children\'s Hospital of Philadelphia'
    ],
    certifications: [
      'American Board of Pediatrics',
      'Pediatric Advanced Life Support Instructor'
    ],
    experience: '10 years',
    acceptingNewPatients: true,
    bio: 'Dr. Kim is passionate about children\'s health and development, focusing on creating a comfortable environment for young patients and their families.',
    contactInfo: {
      email: 'david.kim@hospital.com',
      phone: '(555) 456-7890',
      officeLocation: 'Children\'s Wing, Floor 1, Room 110'
    }
  }
];

export const useDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { showNotification } = useNotification();

  // Fetch all doctors
  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setDoctors(mockDoctors);
      return mockDoctors;
    } catch (err) {
      const error = err as Error;
      setError(error);
      showNotification('Error fetching doctors: ' + error.message, 'error');
      return [];
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Fetch a doctor by ID
  const fetchDoctorById = useCallback(async (doctorId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const doctor = mockDoctors.find(d => d.id === doctorId);
      
      if (!doctor) {
        throw new Error('Doctor not found');
      }
      
      return doctor;
    } catch (err) {
      const error = err as Error;
      setError(error);
      showNotification('Error fetching doctor: ' + error.message, 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Filter doctors by specialty
  const filterDoctorsBySpecialty = useCallback(async (specialty: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const filteredDoctors = mockDoctors.filter(
        d => d.specialty.toLowerCase() === specialty.toLowerCase()
      );
      
      return filteredDoctors;
    } catch (err) {
      const error = err as Error;
      setError(error);
      showNotification('Error filtering doctors: ' + error.message, 'error');
      return [];
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Initialize by fetching all doctors
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  return {
    doctors,
    loading,
    error,
    fetchDoctors,
    fetchDoctorById,
    filterDoctorsBySpecialty
  };
};

export default useDoctors; 