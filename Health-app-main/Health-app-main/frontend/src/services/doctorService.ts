import { supabase } from './supabaseClient';

export async function upsertDoctor({ full_name, email }: { full_name: string; email: string }) {
  const { data, error } = await supabase
    .from('doctors')
    .upsert([{ full_name, email }], { onConflict: 'email' });
  if (error) throw error;
  return data;
}

export async function fetchAllDoctors() {
  const { data, error } = await supabase
    .from('doctors')
    .select('id,full_name,specialization')
    .order('full_name', { ascending: true });
  if (error) throw error;
  return data;
}

export async function fetchAllPatients() {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('full_name', { ascending: true });
      
    if (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
    
    console.log('Fetched patients:', data);
    return data;
  } catch (error) {
    console.error('Failed to fetch patients:', error);
    throw error;
  }
} 