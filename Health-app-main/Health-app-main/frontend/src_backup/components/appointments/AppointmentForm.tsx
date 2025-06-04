import React from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import DoctorsList from './DoctorsList';
import { Doctor } from '../../types/doctor';

interface AppointmentFormValues {
  doctorId: string;
  dateTime: Date | null;
  reason: string;
}

interface AppointmentFormProps {
  onSubmit: (values: AppointmentFormValues) => Promise<void>;
}

const validationSchema = Yup.object().shape({
  doctorId: Yup.string().required('Please select a doctor'),
  dateTime: Yup.date().required('Please select a date and time'),
  reason: Yup.string().required('Please provide a reason for the appointment')
});

export default function AppointmentForm({ onSubmit }: AppointmentFormProps) {
  const formik = useFormik<AppointmentFormValues>({
    initialValues: {
      doctorId: '',
      dateTime: null,
      reason: ''
    },
    validationSchema,
    onSubmit: async (values: AppointmentFormValues) => {
      await onSubmit(values);
    },
  });

  const handleDoctorSelect = (doctor: Doctor) => {
    formik.setFieldValue('doctorId', doctor.id);
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Select Doctor
            </Typography>
            <DoctorsList
              onSelectDoctor={handleDoctorSelect}
              selectedDoctorId={formik.values.doctorId}
            />
            {formik.touched.doctorId && formik.errors.doctorId && (
              <Typography color="error" variant="caption">
                {formik.errors.doctorId}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <DateTimePicker
              label="Appointment Date & Time"
              value={formik.values.dateTime}
              onChange={(value) => formik.setFieldValue('dateTime', value)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: formik.touched.dateTime && Boolean(formik.errors.dateTime),
                  helperText: formik.touched.dateTime && formik.errors.dateTime
                }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              name="reason"
              label="Reason for Appointment"
              value={formik.values.reason}
              onChange={formik.handleChange}
              error={formik.touched.reason && Boolean(formik.errors.reason)}
              helperText={formik.touched.reason && formik.errors.reason}
            />
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={formik.isSubmitting}
              >
                Schedule Appointment
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
} 