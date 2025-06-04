export interface Doctor {
  id: string;
  email: string;
  user_metadata: {
    full_name: string;
    firstName: string;
    lastName: string;
    specialization: string;
    licenseNumber: string;
    role: string;
    roles: string[];
  };
} 