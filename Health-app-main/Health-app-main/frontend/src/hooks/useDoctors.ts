import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../context/NotificationContext';
import { supabase } from '../lib/supabase';

export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
}

export const useDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('doctors')
          .select('id, full_name, email, specialization');
        if (error) {
          throw error;
        }
        if (data && data.length > 0) {
          setDoctors(
            data.map((doc: any) => ({
              id: doc.id,
              name: doc.full_name,
              email: doc.email,
              specialty: doc.specialization
            }))
          );
        } else {
          setDoctors([]);
        }
      } catch (err) {
        setError(err as Error);
        setDoctors([]);
        if (showNotification) {
          showNotification(`Failed to load doctors: ${(err as Error).message}. Please check your database connection.`, 'error');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [showNotification]);

  // Optionally, you can implement fetchDoctorById and filterDoctorsBySpecialty if needed

  return {
    doctors,
    loading,
    error
  };
};

export default useDoctors; 