import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import MedicalProfile from '../profile/MedicalProfile';
import { Box, Typography, Paper } from '@mui/material';
import { reportService } from '../../services/reportService';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { Report } from '../../types/reports';
import { supabase } from '../../services/supabaseClient';

const PatientTestHealthReports: React.FC<{ userId: string }> = ({ userId }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    console.log('Fetching reports for userId:', userId);
    // Initial fetch
    reportService.getReports(userId).then((data) => {
      setReports(data);
      setLoading(false);
    });
    // Subscribe to all changes in the reports table (global channel)
    const channel = supabase
      .channel('reports-changes-global')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reports',
        },
        async () => {
          const data = await reportService.getReports(userId);
          setReports(data);
          setLoading(false);
        }
      )
      .subscribe();
    // Polling fallback every 5 seconds
    const interval = setInterval(async () => {
      const data = await reportService.getReports(userId);
      setReports(data);
      setLoading(false);
    }, 5000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [userId]);

  const handleDownload = async (pdfPath: string) => {
    const url = await reportService.getReportDownloadUrl(pdfPath);
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Medicine</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Half-life (min)</TableCell>
            <TableCell>Full-life (min)</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={5}>Loading...</TableCell></TableRow>
          ) : reports && reports.length > 0 ? (
            reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{report.medicine}</TableCell>
                <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{report.half_life}</TableCell>
                <TableCell>{report.full_life}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleDownload(report.pdf_path)}><DownloadIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow><TableCell colSpan={5}>No reports found.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [userId, setUserId] = useState<string>('');
  const [userIdError, setUserIdError] = useState<string>('');
  const [userIdLoading, setUserIdLoading] = useState<boolean>(true);

  useEffect(() => {
    setUserId('');
    setUserIdError('');
    setUserIdLoading(true);
    // Get email from query params
    const params = new URLSearchParams(location.search);
    const email = params.get('email');
    if (email) {
      (async () => {
        const { data, error } = await supabase
          .from('patients')
          .select('id')
          .eq('email', email)
          .single();
        if (error || !data || !data.id) {
          setUserIdError('No user account linked to this patient.');
        } else {
          setUserId(data.id);
        }
        setUserIdLoading(false);
      })();
    } else {
      setUserIdError('No patient email provided.');
      setUserIdLoading(false);
    }
  }, [location.search]);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Patient Details</Typography>
      <Paper elevation={3} sx={{ mb: 4, p: 2 }}>
        <Typography variant="h5" gutterBottom>Medical Profile</Typography>
        <MedicalProfile patientId={id} isDoctorView />
      </Paper>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>Test Health Reports</Typography>
        {userIdLoading ? (
          <Typography>Loading reports...</Typography>
        ) : userIdError ? (
          <Typography color="error">{userIdError}</Typography>
        ) : (
          <PatientTestHealthReports userId={userId} />
        )}
      </Paper>
    </Box>
  );
};

export default PatientDetails; 