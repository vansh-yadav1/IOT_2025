import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { Button, TextField, Typography, Box, Alert } from '@mui/material';

const SetRoleDev: React.FC = () => {
  const [role, setRole] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSetRole = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setError('Could not fetch current user.');
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ data: { role } });
    if (error) {
      setError('Failed to update role: ' + error.message);
    } else {
      setMessage('Role updated! Please log out and log in again.');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 6 }}>
      <Typography variant="h5" mb={2}>Set My Role (Dev Only)</Typography>
      <TextField
        label="Role (DOCTOR, PATIENT, ADMIN)"
        value={role}
        onChange={e => setRole(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={handleSetRole} disabled={loading || !role} fullWidth>
        {loading ? 'Updating...' : 'Set Role'}
      </Button>
      {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Box>
  );
};

export default SetRoleDev; 