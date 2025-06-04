import { User as SupabaseUser } from '@supabase/supabase-js';

export interface UserMetadata {
  firstName: string;
  lastName: string;
  full_name: string;
  role: Role;
  profileImage?: string;
  phone?: string;
  specialization?: string;
}

export interface User extends SupabaseUser {
  user_metadata: UserMetadata;
}

export type Role = 'ADMIN' | 'DOCTOR' | 'PATIENT'; 