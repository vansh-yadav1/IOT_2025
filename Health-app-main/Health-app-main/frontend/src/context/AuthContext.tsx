import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase, Session, AuthChangeEvent } from '../lib/supabase';
import { User, UserMetadata } from '../types/user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata: UserMetadata) => Promise<any>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setUser(session?.user as User || null);
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      console.log('Auth state changed:', event, session);
      setUser(session?.user as User || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata: UserMetadata) => {
    try {
      setError(null);
      
      // Validate the metadata
      if (!metadata.firstName || !metadata.lastName || !metadata.role) {
        throw new Error('Missing required user information');
      }

      console.log('Attempting signup with metadata:', metadata);

      // Attempt to sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName: metadata.firstName,
            lastName: metadata.lastName,
            full_name: `${metadata.firstName} ${metadata.lastName}`,
            role: metadata.role,
            profileImage: metadata.profileImage || ''
          }
        }
      });

      if (signUpError) {
        console.error('Signup error details:', signUpError);
        throw signUpError;
      }

      if (!data?.user || !data.user.id) {
        throw new Error('No user ID returned from signup');
      }

      // Insert into doctors table if role is DOCTOR
      if (metadata.role === 'DOCTOR') {
        const { error: doctorInsertError } = await supabase.from('doctors').insert([
          {
            id: data.user.id,
            email: email,
            full_name: `${metadata.firstName} ${metadata.lastName}`,
            phone: metadata.phone || '',
            specialization: metadata.specialization || ''
          }
        ]);
        if (doctorInsertError) {
          console.error('Error inserting doctor profile:', doctorInsertError);
          throw doctorInsertError;
        }
      }
      // Insert into patients table if role is PATIENT
      if (metadata.role === 'PATIENT') {
        const { error: patientInsertError } = await supabase.from('patients').insert([
          {
            id: data.user.id,
            email: email,
            full_name: `${metadata.firstName} ${metadata.lastName}`,
            phone: metadata.phone || ''
            // Add more fields as needed
          }
        ]);
        if (patientInsertError) {
          console.error('Error inserting patient profile:', patientInsertError);
          throw patientInsertError;
        }
      }

      console.log('Signup successful, user data:', data);

      // Check if email confirmation is required
      if (data.session === null) {
        return { requiresEmailConfirmation: true };
      }

      return data;
    } catch (error) {
      console.error('Registration error details:', error);
      setError(error instanceof Error ? error : new Error('An unknown error occurred'));
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }

      if (!data.user) {
        throw new Error('No user data returned from signin');
      }

      setUser(data.user as User);
    } catch (error) {
      console.error('Sign in error:', error);
      setError(error instanceof Error ? error : new Error('An unknown error occurred'));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      setError(error instanceof Error ? error : new Error('An unknown error occurred'));
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw error;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('An unknown error occurred'));
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('An unknown error occurred'));
      throw error;
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    forgotPassword,
    resetPassword,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 