import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Button,
  TextField,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  Alert,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon,
  Medication as MedicationIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Alarm as AlarmIcon,
  Event as CalendarIcon,
  CheckCircle as CheckIcon,
  NoteAdd as PrescriptionIcon,
  ExpandMore as ExpandMoreIcon,
  History as HistoryIcon,
  Refresh as RefillIcon,
  LocalPharmacy as PharmacyIcon,
  Image as ImageIcon,
  Receipt as ReceiptIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays, isToday, isPast, isFuture } from 'date-fns';
import { SelectChangeEvent } from '@mui/material';

// Types
interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay: string[];
  startDate: Date;
  endDate?: Date;
  instructions: string;
  prescribedBy?: string;
  pharmacy?: string;
  refillDate?: Date;
  remainingCount?: number;
  image?: string;
}

interface MedicationHistory {
  id: number;
  medicationId: number;
  medicationName: string;
  dateTaken: Date;
  status: 'taken' | 'skipped' | 'delayed';
  note?: string;
}

// Mock data
const mockMedications: Medication[] = [
  {
    id: 1,
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    timeOfDay: ['Morning'],
    startDate: new Date('2023-07-01'),
    endDate: addDays(new Date(), 30),
    instructions: 'Take with food',
    prescribedBy: 'Dr. Johnson',
    pharmacy: 'City Pharmacy',
    refillDate: addDays(new Date(), 10),
    remainingCount: 15
  },
  {
    id: 2,
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    timeOfDay: ['Morning', 'Evening'],
    startDate: new Date('2023-06-15'),
    instructions: 'Take with meals',
    prescribedBy: 'Dr. Smith',
    pharmacy: 'County Drugstore',
    refillDate: addDays(new Date(), 5),
    remainingCount: 8
  },
  {
    id: 3,
    name: 'Ibuprofen',
    dosage: '200mg',
    frequency: 'As needed',
    timeOfDay: ['As needed'],
    startDate: new Date('2023-08-01'),
    endDate: addDays(new Date(), 7),
    instructions: 'Take for pain, do not exceed 6 tablets in 24 hours',
    remainingCount: 24
  }
];

const mockHistory: MedicationHistory[] = [
  {
    id: 1,
    medicationId: 1,
    medicationName: 'Lisinopril',
    dateTaken: new Date('2023-08-14 08:30'),
    status: 'taken'
  },
  {
    id: 2,
    medicationId: 1,
    medicationName: 'Lisinopril',
    dateTaken: new Date('2023-08-13 08:45'),
    status: 'taken'
  },
  {
    id: 3,
    medicationId: 1,
    medicationName: 'Lisinopril',
    dateTaken: new Date('2023-08-12 09:15'),
    status: 'delayed',
    note: 'Took 1 hour later than scheduled'
  },
  {
    id: 4,
    medicationId: 2,
    medicationName: 'Metformin',
    dateTaken: new Date('2023-08-14 08:30'),
    status: 'taken'
  },
  {
    id: 5,
    medicationId: 2,
    medicationName: 'Metformin',
    dateTaken: new Date('2023-08-14 19:45'),
    status: 'taken'
  },
  {
    id: 6,
    medicationId: 2,
    medicationName: 'Metformin',
    dateTaken: new Date('2023-08-13 08:30'),
    status: 'taken'
  },
  {
    id: 7,
    medicationId: 2,
    medicationName: 'Metformin',
    dateTaken: new Date('2023-08-13 19:30'),
    status: 'skipped',
    note: 'Forgot to take evening dose'
  }
];

// Time of day options
const timeOfDayOptions = [
  'Morning',
  'Afternoon',
  'Evening',
  'Bedtime',
  'With breakfast',
  'With lunch',
  'With dinner',
  'Before meals',
  'After meals',
  'As needed'
];

// Frequency options
const frequencyOptions = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Four times daily',
  'Every other day',
  'Weekly',
  'As needed',
  'Custom'
];

const MedicationsPage: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>(mockMedications);
  const [medicationHistory, setMedicationHistory] = useState<MedicationHistory[]>(mockHistory);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });
  const [openLogDialog, setOpenLogDialog] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [logStatus, setLogStatus] = useState<'taken' | 'skipped' | 'delayed'>('taken');
  const [logNote, setLogNote] = useState('');
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [selectedMedicationId, setSelectedMedicationId] = useState<number | null>(null);

  // New medication form state
  const [newMedication, setNewMedication] = useState<Omit<Medication, 'id'>>({
    name: '',
    dosage: '',
    frequency: 'Once daily',
    timeOfDay: ['Morning'],
    startDate: new Date(),
    instructions: '',
    remainingCount: 30
  });

  useEffect(() => {
    // Simulate loading data from an API
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setEditingMedication(null);
    setNewMedication({
      name: '',
      dosage: '',
      frequency: 'Once daily',
      timeOfDay: ['Morning'],
      startDate: new Date(),
      instructions: '',
      remainingCount: 30
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle input changes for text fields and basic selects
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setNewMedication({
      ...newMedication,
      [name as string]: value,
    });
  };

  // Handle frequency select change with SelectChangeEvent type
  const handleFrequencyChange = (event: SelectChangeEvent<string>) => {
    setNewMedication({
      ...newMedication,
      frequency: event.target.value,
    });
  };

  // Handle time of day multiple select change
  const handleTimeOfDayChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setNewMedication({
      ...newMedication,
      timeOfDay: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleDateChange = (name: string, date: Date | null) => {
    if (date) {
      setNewMedication(prev => ({ ...prev, [name]: date }));
    }
  };

  const handleSaveMedication = () => {
    if (editingMedication) {
      // Update existing medication
      setMedications(prev => 
        prev.map(med => 
          med.id === editingMedication.id 
            ? { ...newMedication, id: editingMedication.id } 
            : med
        )
      );
      setSnackbar({
        open: true,
        message: 'Medication updated successfully',
        severity: 'success'
      });
    } else {
      // Add new medication
      const newId = Math.max(...medications.map(m => m.id), 0) + 1;
      setMedications(prev => [...prev, { ...newMedication, id: newId }]);
      setSnackbar({
        open: true,
        message: 'New medication added successfully',
        severity: 'success'
      });
    }
    
    handleCloseDialog();
  };

  const handleEditMedication = (medication: Medication) => {
    setEditingMedication(medication);
    setNewMedication({
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      timeOfDay: medication.timeOfDay,
      startDate: medication.startDate,
      endDate: medication.endDate,
      instructions: medication.instructions,
      prescribedBy: medication.prescribedBy,
      pharmacy: medication.pharmacy,
      refillDate: medication.refillDate,
      remainingCount: medication.remainingCount,
      image: medication.image
    });
    setOpenDialog(true);
  };

  const handleDeleteMedication = (id: number) => {
    setMedications(prev => prev.filter(medication => medication.id !== id));
    setSnackbar({
      open: true,
      message: 'Medication deleted',
      severity: 'success'
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleOpenLogDialog = (medication: Medication) => {
    setSelectedMedication(medication);
    setOpenLogDialog(true);
    setLogStatus('taken');
    setLogNote('');
  };

  const handleCloseLogDialog = () => {
    setOpenLogDialog(false);
    setSelectedMedication(null);
  };

  const handleLogMedication = () => {
    if (selectedMedication) {
      const newHistoryEntry: MedicationHistory = {
        id: Math.max(...medicationHistory.map(h => h.id), 0) + 1,
        medicationId: selectedMedication.id,
        medicationName: selectedMedication.name,
        dateTaken: new Date(),
        status: logStatus,
        note: logNote || undefined
      };
      
      setMedicationHistory(prev => [newHistoryEntry, ...prev]);
      
      // Update remaining count if the medication was taken
      if (logStatus === 'taken') {
        setMedications(prev => 
          prev.map(med => 
            med.id === selectedMedication.id && med.remainingCount 
              ? { ...med, remainingCount: med.remainingCount - 1 } 
              : med
          )
        );
      }
      
      setSnackbar({
        open: true,
        message: `Medication ${logStatus === 'taken' ? 'taken' : logStatus === 'skipped' ? 'skipped' : 'delayed'} successfully`,
        severity: 'success'
      });
      
      handleCloseLogDialog();
    }
  };

  const handleOpenHistoryDialog = (medicationId: number) => {
    setSelectedMedicationId(medicationId);
    setOpenHistoryDialog(true);
  };

  const handleCloseHistoryDialog = () => {
    setOpenHistoryDialog(false);
    setSelectedMedicationId(null);
  };

  const handleRequestRefill = (medication: Medication) => {
    // In a real app, this would send a request to the backend
    setSnackbar({
      open: true,
      message: `Refill request sent for ${medication.name}`,
      severity: 'success'
    });
  };

  const getDueMedications = () => {
    const today = new Date();
    return medications.filter(med => {
      const endDate = med.endDate || new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
      return !isPast(endDate) && 
        (med.frequency !== 'As needed' || med.remainingCount && med.remainingCount < 10);
    });
  };

  const getMedicationHistoryForId = (medicationId: number) => {
    return medicationHistory.filter(history => history.medicationId === medicationId);
  };

  const renderMedicationStatus = (medication: Medication) => {
    const medicationHistoryToday = medicationHistory.filter(
      h => h.medicationId === medication.id && isToday(h.dateTaken)
    );
    
    // For medications that need to be taken multiple times a day
    if (medication.frequency.includes('twice') || medication.frequency.includes('two') ||
        medication.frequency.includes('three') || medication.frequency.includes('four')) {
      const times = medication.frequency.includes('twice') || medication.frequency.includes('two') ? 2 :
                    medication.frequency.includes('three') ? 3 : 4;
      
      return (
        <Box display="flex" alignItems="center">
          {medicationHistoryToday.length === times ? (
            <Chip 
              icon={<CheckIcon />} 
              label="All doses taken" 
              color="success" 
              size="small" 
              variant="outlined" 
            />
          ) : (
            <Chip 
              icon={<AlarmIcon />} 
              label={`${medicationHistoryToday.length}/${times} doses taken`} 
              color="primary" 
              size="small" 
              variant="outlined" 
            />
          )}
        </Box>
      );
    }
    
    // For once daily medications
    return medicationHistoryToday.length > 0 ? (
      <Chip 
        icon={<CheckIcon />} 
        label="Taken today" 
        color="success" 
        size="small" 
        variant="outlined" 
      />
    ) : (
      <Chip 
        icon={<AlarmIcon />} 
        label="Due today" 
        color="primary" 
        size="small" 
        variant="outlined" 
      />
    );
  };

  const renderMedicationCard = (medication: Medication) => {
    const isLowStock = medication.remainingCount !== undefined && medication.remainingCount <= 7;
    const hasRefillSoon = medication.refillDate && isFuture(medication.refillDate) && 
                         medication.refillDate.getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000;
    
    return (
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box display="flex" alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <MedicationIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">{medication.name}</Typography>
                <Typography variant="body2" color="text.secondary">{medication.dosage}</Typography>
              </Box>
            </Box>
            {medication.frequency !== 'As needed' && renderMedicationStatus(medication)}
          </Box>
          
          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Frequency</Typography>
                <Typography variant="body1">{medication.frequency}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Time of Day</Typography>
                <Typography variant="body1">{medication.timeOfDay.join(', ')}</Typography>
              </Grid>
              
              {medication.remainingCount !== undefined && (
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Remaining</Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="body1" color={isLowStock ? 'error.main' : 'text.primary'}>
                      {medication.remainingCount} {medication.remainingCount === 1 ? 'dose' : 'doses'}
                    </Typography>
                    {isLowStock && (
                      <Chip 
                        label="Low stock" 
                        color="error" 
                        size="small" 
                        sx={{ ml: 1 }} 
                      />
                    )}
                  </Box>
                </Grid>
              )}
              
              {medication.refillDate && (
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Next Refill</Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="body1">
                      {format(medication.refillDate, 'MMM d, yyyy')}
                    </Typography>
                    {hasRefillSoon && (
                      <Chip 
                        label="Soon" 
                        color="warning" 
                        size="small" 
                        sx={{ ml: 1 }} 
                      />
                    )}
                  </Box>
                </Grid>
              )}
            </Grid>
            
            {medication.instructions && (
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">Instructions</Typography>
                <Typography variant="body2">{medication.instructions}</Typography>
              </Box>
            )}
            
            {(medication.prescribedBy || medication.pharmacy) && (
              <Box mt={2} display="flex">
                {medication.prescribedBy && (
                  <Box mr={3}>
                    <Typography variant="body2" color="text.secondary">Prescribed by</Typography>
                    <Typography variant="body2">{medication.prescribedBy}</Typography>
                  </Box>
                )}
                
                {medication.pharmacy && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">Pharmacy</Typography>
                    <Typography variant="body2">{medication.pharmacy}</Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </CardContent>
        
        <Divider />
        
        <CardActions>
          <Button 
            size="small" 
            startIcon={<CheckIcon />} 
            onClick={() => handleOpenLogDialog(medication)}
            color="primary"
          >
            Log Dose
          </Button>
          
          <Button 
            size="small" 
            startIcon={<HistoryIcon />} 
            onClick={() => handleOpenHistoryDialog(medication.id)}
          >
            History
          </Button>
          
          {(isLowStock || hasRefillSoon) && (
            <Button 
              size="small" 
              startIcon={<RefillIcon />} 
              onClick={() => handleRequestRefill(medication)}
              color="secondary"
            >
              Request Refill
            </Button>
          )}
          
          <Box flexGrow={1} />
          
          <IconButton size="small" onClick={() => handleEditMedication(medication)}>
            <EditIcon fontSize="small" />
          </IconButton>
          
          <IconButton size="small" onClick={() => handleDeleteMedication(medication.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </CardActions>
      </Card>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4">Medications</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Add Medication
          </Button>
        </Box>
        
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Daily medications section */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                Daily Medications
              </Typography>
              
              {getDueMedications().filter(med => med.frequency !== 'As needed').length === 0 ? (
                <Box p={2} textAlign="center">
                  <Typography color="textSecondary">No daily medications added yet</Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {getDueMedications()
                    .filter(med => med.frequency !== 'As needed')
                    .map(medication => (
                      <Grid item xs={12} md={6} key={medication.id}>
                        {renderMedicationCard(medication)}
                      </Grid>
                    ))}
                </Grid>
              )}
            </Paper>
            
            {/* As needed medications section */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                As Needed Medications
              </Typography>
              
              {getDueMedications().filter(med => med.frequency === 'As needed').length === 0 ? (
                <Box p={2} textAlign="center">
                  <Typography color="textSecondary">No as-needed medications added yet</Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {getDueMedications()
                    .filter(med => med.frequency === 'As needed')
                    .map(medication => (
                      <Grid item xs={12} md={6} key={medication.id}>
                        {renderMedicationCard(medication)}
                      </Grid>
                    ))}
                </Grid>
              )}
            </Paper>
          </>
        )}
        
        {/* Add/Edit Medication Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            {editingMedication ? 'Edit Medication' : 'Add New Medication'}
          </DialogTitle>
          
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Medication Name"
                  name="name"
                  value={newMedication.name}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Dosage"
                  name="dosage"
                  value={newMedication.dosage}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  required
                  placeholder="e.g., 10mg, 1 tablet"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Frequency</InputLabel>
                  <Select
                    name="frequency"
                    value={newMedication.frequency}
                    onChange={handleFrequencyChange}
                    label="Frequency"
                  >
                    {frequencyOptions.map(option => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Time of Day</InputLabel>
                  <Select
                    multiple
                    value={newMedication.timeOfDay}
                    onChange={handleTimeOfDayChange}
                    label="Time of Day"
                    renderValue={(selected) => (selected as string[]).join(', ')}
                  >
                    {timeOfDayOptions.map(option => (
                      <MenuItem key={option} value={option}>
                        <Checkbox checked={newMedication.timeOfDay.indexOf(option) > -1} />
                        <ListItemText primary={option} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Start Date"
                  value={newMedication.startDate}
                  onChange={(date) => handleDateChange('startDate', date)}
                  slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="End Date (Optional)"
                  value={newMedication.endDate || null}
                  onChange={(date) => handleDateChange('endDate', date)}
                  slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Instructions"
                  name="instructions"
                  value={newMedication.instructions}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  multiline
                  rows={2}
                  placeholder="e.g., Take with food, avoid alcohol"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Additional Information (Optional)
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Prescribed By"
                  name="prescribedBy"
                  value={newMedication.prescribedBy || ''}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Pharmacy"
                  name="pharmacy"
                  value={newMedication.pharmacy || ''}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Next Refill Date (Optional)"
                  value={newMedication.refillDate || null}
                  onChange={(date) => handleDateChange('refillDate', date)}
                  slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Remaining Count"
                  name="remainingCount"
                  type="number"
                  value={newMedication.remainingCount || ''}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">doses</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleSaveMedication} 
              variant="contained" 
              color="primary"
              disabled={!newMedication.name || !newMedication.dosage}
            >
              {editingMedication ? 'Update' : 'Add'} Medication
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Log Medication Dialog */}
        <Dialog 
          open={openLogDialog} 
          onClose={handleCloseLogDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Log Medication</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Record that you've taken {selectedMedication?.name} {selectedMedication?.dosage}.
            </DialogContentText>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={logStatus}
                onChange={(e: SelectChangeEvent) => setLogStatus(e.target.value as 'taken' | 'skipped' | 'delayed')}
                label="Status"
              >
                <MenuItem value="taken">Taken</MenuItem>
                <MenuItem value="skipped">Skipped</MenuItem>
                <MenuItem value="delayed">Delayed</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Note (Optional)"
              value={logNote}
              onChange={(e) => setLogNote(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              rows={2}
              placeholder="Add any notes about this dose"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseLogDialog}>Cancel</Button>
            <Button 
              onClick={handleLogMedication} 
              variant="contained" 
              color="primary"
            >
              Log Medication
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Medication History Dialog */}
        <Dialog 
          open={openHistoryDialog} 
          onClose={handleCloseHistoryDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedMedicationId && medications.find(m => m.id === selectedMedicationId)?.name} History
          </DialogTitle>
          <DialogContent dividers>
            {selectedMedicationId && (
              <>
                {getMedicationHistoryForId(selectedMedicationId).length === 0 ? (
                  <Box p={3} textAlign="center">
                    <Typography color="textSecondary">No history recorded yet for this medication</Typography>
                  </Box>
                ) : (
                  <List>
                    {getMedicationHistoryForId(selectedMedicationId).map(history => (
                      <ListItem key={history.id} divider>
                        <ListItemAvatar>
                          <Avatar sx={{ 
                            bgcolor: history.status === 'taken' ? 'success.light' : 
                                     history.status === 'delayed' ? 'warning.light' : 'error.light' 
                          }}>
                            {history.status === 'taken' ? <CheckIcon /> : 
                             history.status === 'delayed' ? <AlarmIcon /> : <DeleteIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={format(history.dateTaken, 'MMMM d, yyyy h:mm a')}
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                              </Typography>
                              {history.note && (
                                <Typography variant="body2" component="span">
                                  {" — "}{history.note}
                                </Typography>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseHistoryDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      
        {/* Snackbar for notifications */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={4000} 
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default MedicationsPage; 