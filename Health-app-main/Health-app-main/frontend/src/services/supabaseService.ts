import { supabase } from './supabaseClient';

// Patient related operations
export const createPatient = async (patientData: any) => {
  const { data, error } = await supabase
    .from('patients')
    .insert([patientData])
    .select();
  
  if (error) throw error;
  return data;
};

export const getPatient = async (userId: string) => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

// Doctor related operations
export const createDoctor = async (doctorData: any) => {
  const { data, error } = await supabase
    .from('doctors')
    .insert([doctorData])
    .select();
  
  if (error) throw error;
  return data;
};

export const getDoctor = async (userId: string) => {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

// Appointment related operations
export const createAppointment = async (appointmentData: any) => {
  const { data, error } = await supabase
    .from('appointments')
    .insert([appointmentData])
    .select();
  
  if (error) throw error;
  return data;
};

export const getPatientAppointments = async (patientId: string) => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      doctors (
        full_name,
        specialization
      )
    `)
    .eq('patient_id', patientId);
  
  if (error) throw error;
  return data;
};

export const getDoctorAppointments = async (doctorId: string) => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      patients (
        full_name,
        phone
      )
    `)
    .eq('doctor_id', doctorId);
  
  if (error) throw error;
  return data;
};

// Message related operations
export const sendMessage = async (messageData: any) => {
  const { data, error } = await supabase
    .from('messages')
    .insert([messageData])
    .select();
  
  if (error) throw error;
  return data;
};

export const getMessages = async (userId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Health records related operations
export const saveHealthRecord = async (healthData: any) => {
  const { data, error } = await supabase
    .from('health_records')
    .insert([healthData])
    .select();
  
  if (error) throw error;
  return data;
};

export const getPatientHealthRecords = async (patientId: string) => {
  const { data, error } = await supabase
    .from('health_records')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Update patient profile (for doctor or patient)
export const updatePatient = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('patients')
    .update(updates)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data;
}; 

// Update doctor profile (for doctor)
export const updateDoctor = async (id: string, updates: any) => {
  console.log('Updating doctor:', id, updates);
  const { data, error } = await supabase
    .from('doctors')
    .update(updates)
    .eq('id', id)
    .select();
  console.log('Supabase update result:', data, error);
  if (error) throw error;
  return data;
}; 