import React from 'react';
import {
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  FormHelperText
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';
import './Auth.css';

// Define props interface for the component
export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  specialization: string | null;
  licenseNumber: string | null;
}

interface RegisterProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  isSubmitting: boolean;
}

const validationSchema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  role: Yup.string().required('Role is required'),
  specialization: Yup.string()
    .transform((value) => (value === '' ? null : value))
    .nullable()
    .when('role', {
      is: 'DOCTOR',
      then: (schema) => schema.required('Specialization is required for doctors'),
      otherwise: (schema) => schema.nullable()
    }),
  licenseNumber: Yup.string()
    .transform((value) => (value === '' ? null : value))
    .nullable()
    .when('role', {
      is: 'DOCTOR',
      then: (schema) => schema.required('License number is required for doctors'),
      otherwise: (schema) => schema.nullable()
    })
});

const RegisterComponent: React.FC<RegisterProps> = ({ onSubmit, isSubmitting }) => {
  const formik = useFormik<RegisterFormData>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      specialization: '',
      licenseNumber: '',
    },
    validationSchema,
    onSubmit: async (values: RegisterFormData) => {
      await onSubmit(values);
    },
  });

  const isDoctor = formik.values.role === 'DOCTOR';

  return (
    <div className="auth-container">
      <h2 className="auth-title">Create a new account</h2>
      <form onSubmit={formik.handleSubmit} className="auth-form">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="firstName"
              label="First Name"
              variant="outlined"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              error={formik.touched.firstName && Boolean(formik.errors.firstName)}
              helperText={formik.touched.firstName && formik.errors.firstName}
              disabled={isSubmitting}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="lastName"
              label="Last Name"
              variant="outlined"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched.lastName && formik.errors.lastName}
              disabled={isSubmitting}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              name="email"
              label="Email Address"
              variant="outlined"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              disabled={isSubmitting}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth error={formik.touched.role && Boolean(formik.errors.role)}>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formik.values.role}
                onChange={formik.handleChange}
                label="Role"
                disabled={isSubmitting}
              >
                <MenuItem value="PATIENT">Patient</MenuItem>
                <MenuItem value="DOCTOR">Doctor</MenuItem>
              </Select>
              {formik.touched.role && formik.errors.role && (
                <FormHelperText error>{formik.errors.role}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          {isDoctor && (
            <>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="specialization"
                  label="Specialization"
                  variant="outlined"
                  value={formik.values.specialization}
                  onChange={formik.handleChange}
                  error={formik.touched.specialization && Boolean(formik.errors.specialization)}
                  helperText={formik.touched.specialization && formik.errors.specialization}
                  disabled={isSubmitting}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="licenseNumber"
                  label="Medical License Number"
                  variant="outlined"
                  value={formik.values.licenseNumber}
                  onChange={formik.handleChange}
                  error={formik.touched.licenseNumber && Boolean(formik.errors.licenseNumber)}
                  helperText={formik.touched.licenseNumber && formik.errors.licenseNumber}
                  disabled={isSubmitting}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              name="password"
              label="Password"
              type="password"
              variant="outlined"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              disabled={isSubmitting}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              variant="outlined"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              disabled={isSubmitting}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isSubmitting}
              size="large"
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Register'}
            </Button>
          </Grid>
        </Grid>
      </form>
      <p>
        <Link to="/login" className="auth-link">Already have an account? Login here</Link>
      </p>
    </div>
  );
};

export default RegisterComponent; 