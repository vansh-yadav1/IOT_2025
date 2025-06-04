import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  IconButton,
  Tabs,
  Tab,
  Divider,
  Breadcrumbs,
  Link,
  CircularProgress,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  InputAdornment,
  Chip,
  Alert,
  AlertTitle,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  History as HistoryIcon,
  NavigateNext as NavigateNextIcon,
  Person as PersonIcon,
  LocalHospital as LocalHospitalIcon,
  CalendarToday as CalendarTodayIcon,
  Description as DescriptionIcon,
  Attachment as AttachmentIcon,
  FilePresent as FilePresentIcon,
  Send as SendIcon,
  Email as EmailIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onRetry: () => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onRetry: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You could log the error to an error reporting service here
    console.error("Error in ReportViewer component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert 
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  this.props.onRetry();
                }}
                aria-label="Retry loading report"
              >
                Retry
              </Button>
            }
          >
            <AlertTitle>Error Loading Report</AlertTitle>
            {this.state.error && this.state.error.message}
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

interface Report {
  id: string;
  title: string;
  type: string;
  date: string;
  provider: string;
  providerFacility: string;
  fileSize: string;
  fileType: string;
  status: 'processed' | 'pending' | 'error';
  patientName: string;
  content: string;
  summary: string;
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    size: string;
  }>;
  history: Array<{
    date: string;
    action: string;
    user: string;
  }>;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `report-tab-${index}`,
    'aria-controls': `report-tabpanel-${index}`,
  };
}

const ReportViewer: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  // Format date for better accessibility
  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }, []);

  // Load mock report data
  const loadReport = useCallback(async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // This would be an API call in a real app
      const mockReport: Report = {
        id,
        title: 'Annual Physical Examination',
        type: 'Examination',
        date: '2023-06-15',
        provider: 'Dr. Maria Rodriguez',
        providerFacility: 'Cityview Medical Center',
        fileSize: '2.4 MB',
        fileType: 'PDF',
        status: 'processed',
        patientName: 'John Doe',
        content: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>ANNUAL PHYSICAL EXAMINATION</h2>
            <p><strong>Date:</strong> June 15, 2023</p>
            <p><strong>Patient:</strong> John Doe</p>
            <p><strong>DOB:</strong> 01/15/1980</p>
            <p><strong>Provider:</strong> Dr. Maria Rodriguez</p>
            
            <h3>VITAL SIGNS:</h3>
            <ul>
              <li>Blood Pressure: 120/80 mmHg</li>
              <li>Heart Rate: 72 bpm</li>
              <li>Respiratory Rate: 16 breaths/min</li>
              <li>Temperature: 98.6°F (37.0°C)</li>
              <li>Height: 5'10" (178 cm)</li>
              <li>Weight: 170 lbs (77.1 kg)</li>
              <li>BMI: 24.4 kg/m²</li>
            </ul>
            
            <h3>GENERAL APPEARANCE:</h3>
            <p>Patient is well-developed, well-nourished, and in no acute distress. Alert and oriented x3.</p>
            
            <h3>HEENT:</h3>
            <p>Head normocephalic, atraumatic. Eyes: PERRLA, EOMI, no discharge. Ears: TMs intact bilaterally, no erythema. Nose: Patent nares, no discharge. Throat: Oropharynx clear, no erythema or exudates.</p>
            
            <h3>CARDIOVASCULAR:</h3>
            <p>Regular rate and rhythm, S1 and S2 normal, no murmurs, gallops, or rubs. No JVD, no carotid bruits.</p>
            
            <h3>RESPIRATORY:</h3>
            <p>Clear to auscultation bilaterally, no wheezes, rhonchi, or rales. Normal respiratory effort.</p>
            
            <h3>GASTROINTESTINAL:</h3>
            <p>Abdomen soft, non-tender, non-distended. No hepatosplenomegaly. Normal bowel sounds in all quadrants.</p>
            
            <h3>MUSCULOSKELETAL:</h3>
            <p>Full range of motion in all extremities. No joint swelling, tenderness, or deformity. Normal muscle tone and strength (5/5) throughout.</p>
            
            <h3>NEUROLOGICAL:</h3>
            <p>Cranial nerves II-XII intact. Sensory and motor function intact. DTRs 2+ and symmetric. No focal deficits.</p>
            
            <h3>SKIN:</h3>
            <p>No rashes, lesions, or concerning moles. Good turgor, no abnormal pigmentation.</p>
            
            <h3>LABORATORY RESULTS:</h3>
            <p>CBC: Within normal limits<br>
            Basic Metabolic Panel: Within normal limits<br>
            Lipid Panel: Total Cholesterol 185 mg/dL, HDL 55 mg/dL, LDL 110 mg/dL, Triglycerides 100 mg/dL<br>
            Urinalysis: Negative for glucose, protein, blood, and leukocytes</p>
            
            <h3>ASSESSMENT:</h3>
            <ol>
              <li>Healthy adult patient with no significant findings</li>
              <li>History of seasonal allergies, well-controlled</li>
              <li>Mild work-related stress</li>
            </ol>
            
            <h3>PLAN:</h3>
            <ol>
              <li>Continue current diet and exercise regimen</li>
              <li>Maintain seasonal allergy medications as needed</li>
              <li>Stress management techniques discussed</li>
              <li>Routine health maintenance:
                <ul>
                  <li>Flu vaccine recommended in fall</li>
                  <li>Continue routine dental check-ups every 6 months</li>
                  <li>Eye examination recommended annually</li>
                </ul>
              </li>
              <li>Return for follow-up in 12 months for next annual physical or sooner if concerns arise</li>
            </ol>
            
            <h3>RECOMMENDATIONS:</h3>
            <p>Patient advised to:
            <ul>
              <li>Maintain healthy diet and regular exercise (150+ minutes per week)</li>
              <li>Practice stress-reduction techniques</li>
              <li>Limit alcohol consumption to moderate levels</li>
              <li>Continue use of sunscreen when outdoors</li>
              <li>Perform monthly skin self-examinations</li>
            </ul>
            </p>
            
            <p style="margin-top: 40px;"><strong>Electronically signed by:</strong> Maria Rodriguez, MD<br>
            <strong>Date:</strong> June 15, 2023</p>
          </div>
        `,
        summary: 'Annual physical examination showing vital signs within normal range. Patient is in good overall health with no significant findings. Recommendations include maintaining current diet and exercise regimen, continuing seasonal allergy medications as needed, and practicing stress management techniques.',
        attachments: [
          {
            id: 'a1',
            name: 'Lab Results - Blood Work',
            type: 'PDF',
            size: '1.2 MB'
          },
          {
            id: 'a2',
            name: 'Recommended Exercise Plan',
            type: 'PDF',
            size: '0.8 MB'
          }
        ],
        history: [
          {
            date: '2023-06-15 10:30 AM',
            action: 'Report Created',
            user: 'Dr. Maria Rodriguez'
          },
          {
            date: '2023-06-15 02:15 PM',
            action: 'Report Verified',
            user: 'Dr. James Wilson'
          },
          {
            date: '2023-06-16 09:45 AM',
            action: 'Report Shared with Patient',
            user: 'System'
          },
          {
            date: '2023-06-20 11:20 AM',
            action: 'Report Viewed',
            user: 'John Doe (Patient)'
          }
        ]
      };
      
      setReport(mockReport);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load report'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Load report on mount or when id changes
  useEffect(() => {
    loadReport();
  }, [loadReport]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle open menu
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle close menu
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Handle share dialog
  const handleOpenShareDialog = () => {
    setShareDialogOpen(true);
    handleCloseMenu();
  };

  // Handle close share dialog
  const handleCloseShareDialog = () => {
    setShareDialogOpen(false);
  };

  // Handle submit share
  const handleSubmitShare = () => {
    console.log(`Sharing report with ${shareEmail}`);
    console.log(`Message: ${shareMessage}`);
    
    // This would be an API call in a real app
    handleCloseShareDialog();
    
    // Reset form
    setShareEmail('');
    setShareMessage('');
  };

  // Handle history dialog
  const handleOpenHistoryDialog = () => {
    setHistoryDialogOpen(true);
    handleCloseMenu();
  };

  // Handle close history dialog
  const handleCloseHistoryDialog = () => {
    setHistoryDialogOpen(false);
  };

  // Handle download report
  const handleDownloadReport = () => {
    console.log(`Downloading report ${id}`);
    // This would be an API call in a real app
    handleCloseMenu();
  };

  // Handle print report
  const handlePrintReport = () => {
    console.log(`Printing report ${id}`);
    window.print();
    handleCloseMenu();
  };

  // Handle navigate back
  const handleNavigateBack = () => {
    navigate('/reports');
  };

  // Handle download attachment
  const handleDownloadAttachment = (attachmentId: string) => {
    console.log(`Downloading attachment ${attachmentId}`);
    // This would be an API call in a real app
  };

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          <Link color="inherit" href="/dashboard" underline="hover" aria-label="Go to Dashboard">
            Dashboard
          </Link>
          <Link color="inherit" href="/reports" underline="hover" aria-label="Go to Reports">
            Reports
          </Link>
          <Typography color="text.primary">View Report</Typography>
        </Breadcrumbs>
        
        <Alert 
          severity="error" 
          sx={{ mb: 4 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={loadReport}
              aria-label="Retry loading report"
            >
              Retry
            </Button>
          }
        >
          <AlertTitle>Error Loading Report</AlertTitle>
          {error.message}
        </Alert>
        
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleNavigateBack}
          sx={{ mt: 2 }}
          aria-label="Return to reports list"
        >
          Back to Reports
        </Button>
      </Container>
    );
  }

  return (
    <ErrorBoundary onRetry={loadReport}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs navigation */}
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          <Link color="inherit" href="/dashboard" underline="hover" aria-label="Go to Dashboard">
            Dashboard
          </Link>
          <Link color="inherit" href="/reports" underline="hover" aria-label="Go to Reports">
            Reports
          </Link>
          <Typography color="text.primary">
            {isLoading ? 'Loading Report...' : report?.title || 'View Report'}
          </Typography>
        </Breadcrumbs>

        {/* Back button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleNavigateBack}
          sx={{ mb: 3 }}
          aria-label="Return to reports list"
        >
          Back to Reports
        </Button>

        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body1">Loading report...</Typography>
          </Box>
        ) : report ? (
          <>
            {/* Report Header */}
            <Paper
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`
              }}
              elevation={0}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <Typography variant="h5" component="h1" gutterBottom>
                    {report.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocalHospitalIcon 
                      fontSize="small" 
                      color="primary" 
                      sx={{ mr: 1 }} 
                      aria-hidden="true" 
                    />
                    <Typography variant="body1">
                      {report.type}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon 
                      fontSize="small" 
                      color="primary" 
                      sx={{ mr: 1 }} 
                      aria-hidden="true" 
                    />
                    <Typography variant="body1">
                      Provider: {report.provider}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarTodayIcon 
                      fontSize="small" 
                      color="primary" 
                      sx={{ mr: 1 }} 
                      aria-hidden="true" 
                    />
                    <Typography variant="body1">
                      Date: {formatDate(report.date)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DescriptionIcon 
                      fontSize="small" 
                      color="primary" 
                      sx={{ mr: 1 }} 
                      aria-hidden="true" 
                    />
                    <Typography variant="body1">
                      Format: {report.fileType} ({report.fileSize})
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid 
                  item 
                  xs={12} 
                  sm={4} 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: { xs: 'flex-start', sm: 'flex-end' }, 
                    justifyContent: 'flex-start' 
                  }}
                >
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                    <Tooltip title="Download Report">
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadReport}
                        size={isMobile ? "small" : "medium"}
                        aria-label="Download report"
                      >
                        Download
                      </Button>
                    </Tooltip>
                    
                    <Tooltip title="Share Report">
                      <Button
                        variant="outlined"
                        startIcon={<ShareIcon />}
                        onClick={handleOpenShareDialog}
                        size={isMobile ? "small" : "medium"}
                        aria-label="Share report"
                      >
                        Share
                      </Button>
                    </Tooltip>
                    
                    <Tooltip title="More Options">
                      <IconButton
                        aria-label="More options"
                        onClick={handleOpenMenu}
                        aria-controls="report-menu"
                        aria-haspopup="true"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <HistoryIcon 
                      fontSize="small" 
                      sx={{ mr: 1, color: theme.palette.text.secondary }} 
                      aria-hidden="true" 
                    />
                    <Button
                      variant="text"
                      size="small"
                      onClick={handleOpenHistoryDialog}
                      aria-label="View report history"
                    >
                      View History
                    </Button>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Chip 
                      label={
                        report.status === 'processed' 
                          ? 'Verified' 
                          : report.status === 'pending' 
                            ? 'Pending Verification' 
                            : 'Error'
                      }
                      color={
                        report.status === 'processed' 
                          ? 'success' 
                          : report.status === 'pending' 
                            ? 'warning' 
                            : 'error'
                      }
                      size="small"
                      aria-label={`Report status: ${
                        report.status === 'processed' 
                          ? 'Verified' 
                          : report.status === 'pending' 
                            ? 'Pending Verification' 
                            : 'Error'
                      }`}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Report Content Tabs */}
            <Paper 
              sx={{ 
                borderRadius: 2, 
                overflow: 'hidden',
                border: `1px solid ${theme.palette.divider}`
              }} 
              elevation={0}
            >
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange} 
                  aria-label="report content tabs"
                  variant={isMobile ? "scrollable" : "standard"}
                  scrollButtons={isMobile ? "auto" : undefined}
                >
                  <Tab 
                    label="Document" 
                    {...a11yProps(0)} 
                    icon={<DescriptionIcon />} 
                    iconPosition="start"
                    aria-label="View document"
                  />
                  <Tab 
                    label="Summary" 
                    {...a11yProps(1)} 
                    icon={<DescriptionIcon />} 
                    iconPosition="start"
                    aria-label="View summary"
                  />
                  <Tab 
                    label="Attachments" 
                    {...a11yProps(2)} 
                    icon={<AttachmentIcon />} 
                    iconPosition="start"
                    aria-label="View attachments"
                  />
                </Tabs>
              </Box>
              
              {/* Document Tab */}
              <TabPanel value={tabValue} index={0}>
                <Box 
                  sx={{ 
                    p: 2, 
                    border: `1px solid ${theme.palette.divider}`, 
                    borderRadius: 1, 
                    bgcolor: theme.palette.background.paper,
                    minHeight: '500px',
                    maxHeight: '800px',
                    overflowY: 'auto',
                    '& img': {
                      maxWidth: '100%'
                    }
                  }}
                  aria-label="Report content"
                  tabIndex={0}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(report.content) }} 
                />
              </TabPanel>
              
              {/* Summary Tab */}
              <TabPanel value={tabValue} index={1}>
                <Box 
                  sx={{ 
                    p: 2, 
                    border: `1px solid ${theme.palette.divider}`, 
                    borderRadius: 1, 
                    bgcolor: theme.palette.background.paper,
                    minHeight: '300px',
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Report Summary
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {report.summary}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                    Key Information
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          bgcolor: theme.palette.background.default,
                          height: '100%'
                        }}
                        elevation={0}
                      >
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                          Patient Information
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PersonIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                          <Typography variant="body2">
                            Name: {report.patientName}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          bgcolor: theme.palette.background.default,
                          height: '100%'
                        }}
                        elevation={0}
                      >
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                          Provider Information
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocalHospitalIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                          <Typography variant="body2">
                            {report.provider}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationOnIcon fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                          <Typography variant="body2">
                            {report.providerFacility}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>
              
              {/* Attachments Tab */}
              <TabPanel value={tabValue} index={2}>
                <Box 
                  sx={{ 
                    p: 2, 
                    border: `1px solid ${theme.palette.divider}`, 
                    borderRadius: 1, 
                    bgcolor: theme.palette.background.paper,
                    minHeight: '300px',
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Attachments ({report.attachments.length})
                  </Typography>
                  
                  {report.attachments.length === 0 ? (
                    <Typography variant="body1" color="text.secondary">
                      No attachments found for this report.
                    </Typography>
                  ) : (
                    <List>
                      {report.attachments.map((attachment) => (
                        <ListItem
                          key={attachment.id}
                          divider
                          secondaryAction={
                            <IconButton 
                              edge="end" 
                              onClick={() => handleDownloadAttachment(attachment.id)}
                              aria-label={`Download ${attachment.name}`}
                            >
                              <DownloadIcon />
                            </IconButton>
                          }
                        >
                          <ListItemIcon>
                            <FilePresentIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={attachment.name}
                            secondary={`${attachment.type} • ${attachment.size}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </TabPanel>
            </Paper>

            {/* Menu */}
            <Menu
              id="report-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
              MenuListProps={{
                'aria-labelledby': 'report-options-button',
              }}
            >
              <MenuItem 
                onClick={handleDownloadReport}
                aria-label="Download report"
              >
                <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
                Download
              </MenuItem>
              <MenuItem 
                onClick={handlePrintReport}
                aria-label="Print report"
              >
                <PrintIcon fontSize="small" sx={{ mr: 1 }} />
                Print
              </MenuItem>
              <MenuItem 
                onClick={handleOpenShareDialog}
                aria-label="Share report"
              >
                <ShareIcon fontSize="small" sx={{ mr: 1 }} />
                Share
              </MenuItem>
              <Divider />
              <MenuItem 
                onClick={handleOpenHistoryDialog}
                aria-label="View report history"
              >
                <HistoryIcon fontSize="small" sx={{ mr: 1 }} />
                View History
              </MenuItem>
            </Menu>

            {/* Share Dialog */}
            <Dialog 
              open={shareDialogOpen} 
              onClose={handleCloseShareDialog}
              maxWidth="sm"
              fullWidth
              aria-labelledby="share-report-dialog-title"
            >
              <DialogTitle id="share-report-dialog-title">
                Share Report
              </DialogTitle>
              <DialogContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    You are sharing: <strong>{report.title}</strong>
                  </Typography>
                </Box>
                <TextField
                  autoFocus
                  margin="dense"
                  id="recipient-email"
                  label="Recipient Email"
                  type="email"
                  fullWidth
                  variant="outlined"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  aria-label="Recipient's email address"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  margin="dense"
                  id="share-message"
                  label="Message (Optional)"
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  placeholder="Add an optional message to the recipient"
                  aria-label="Optional message to recipient"
                />
              </DialogContent>
              <DialogActions>
                <Button 
                  onClick={handleCloseShareDialog}
                  color="inherit"
                  aria-label="Cancel sharing"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitShare}
                  variant="contained"
                  startIcon={<SendIcon />}
                  disabled={!shareEmail}
                  aria-label="Send report"
                >
                  Send
                </Button>
              </DialogActions>
            </Dialog>

            {/* History Dialog */}
            <Dialog
              open={historyDialogOpen}
              onClose={handleCloseHistoryDialog}
              maxWidth="sm"
              fullWidth
              aria-labelledby="report-history-dialog-title"
            >
              <DialogTitle id="report-history-dialog-title">
                Report History
              </DialogTitle>
              <DialogContent dividers>
                <List>
                  {report.history.map((item, index) => (
                    <ListItem key={index} alignItems="flex-start">
                      <ListItemIcon sx={{ minWidth: '40px' }}>
                        <AccessTimeIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.action}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {item.user}
                            </Typography>
                            {` — ${item.date}`}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </DialogContent>
              <DialogActions>
                <Button 
                  onClick={handleCloseHistoryDialog}
                  color="primary"
                  aria-label="Close history dialog"
                >
                  Close
                </Button>
              </DialogActions>
            </Dialog>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Report not found
            </Typography>
            <Button
              variant="contained"
              onClick={handleNavigateBack}
              sx={{ mt: 2 }}
              aria-label="Return to reports list"
            >
              Back to Reports
            </Button>
          </Box>
        )}
      </Container>
    </ErrorBoundary>
  );
};

export default ReportViewer; 