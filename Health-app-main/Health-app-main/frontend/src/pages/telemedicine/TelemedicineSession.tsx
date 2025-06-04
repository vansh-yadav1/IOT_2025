import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
  TextField,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Breadcrumbs,
  Link,
  Chip
} from '@mui/material';
import {
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  ScreenShare as ScreenShareIcon,
  StopScreenShare as StopScreenShareIcon,
  Chat as ChatIcon,
  Info as InfoIcon,
  Send as SendIcon,
  CallEnd as CallEndIcon,
  ArrowBack as ArrowBackIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNotification } from '../../context/NotificationContext';

// Mock appointment data for the session
const mockAppointment = {
  id: '12345',
  title: 'Follow-up Consultation',
  doctor: {
    id: 'dr1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    profileImage: '/assets/avatars/doctor1.jpg'
  },
  patient: {
    id: 'pt1',
    name: 'Michael Williams',
    age: 45,
    profileImage: '/assets/avatars/patient1.jpg'
  },
  startTime: new Date().toISOString(),
  endTime: new Date(Date.now() + 30 * 60000).toISOString(), // 30 min from now
  status: 'IN_PROGRESS',
  type: 'VIRTUAL',
  notes: 'Follow-up on heart medication and review of recent test results.'
};

// Mock chat messages
const initialMessages = [
  {
    id: '1',
    senderId: 'dr1',
    senderName: 'Dr. Sarah Johnson',
    content: 'Hello Mr. Williams, how are you feeling today?',
    timestamp: new Date(Date.now() - 120000).toISOString() // 2 minutes ago
  }
];

const TelemedicineSession: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [appointment, setAppointment] = useState<any>(null);
  
  // Video controls
  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  // Chat functionality
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Refs for video elements
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // Timer for session
  const [elapsedTime, setElapsedTime] = useState(0);
  
  useEffect(() => {
    // In a real app, fetch appointment details from the API
    // For now, use mock data
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (appointmentId === mockAppointment.id) {
          setAppointment(mockAppointment);
        } else {
          throw new Error('Appointment not found');
        }
      } catch (err) {
        setError(err as Error);
        showNotification('Failed to load appointment details', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointment();
    
    // Start session timer
    const timerInterval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    // Cleanup
    return () => {
      clearInterval(timerInterval);
    };
  }, [appointmentId, showNotification]);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // In a real app, set up WebRTC here
  useEffect(() => {
    if (!loading && !error && localVideoRef.current) {
      // Simulate video setup
      const setupVideo = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
          });
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          
          // In a real app, you would:
          // 1. Set up WebRTC connection
          // 2. Exchange ICE candidates
          // 3. Connect to remote peer
          // 4. Handle remote stream
          
          showNotification('Video connection established', 'success');
        } catch (err) {
          console.error('Error accessing media devices:', err);
          showNotification('Could not access camera or microphone', 'error');
          setVideoOn(false);
          setAudioOn(false);
        }
      };
      
      setupVideo();
    }
  }, [loading, error, showNotification]);
  
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    // Add new message to the chat
    const message = {
      id: `msg-${Date.now()}`,
      senderId: 'pt1', // Current user (patient) in this example
      senderName: 'Michael Williams',
      content: newMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
    
    // In a real app, send message via WebSocket or WebRTC data channel
  };
  
  const handleToggleVideo = () => {
    setVideoOn(!videoOn);
    // In a real app, toggle video track
    showNotification(`Camera ${!videoOn ? 'enabled' : 'disabled'}`, 'info');
  };
  
  const handleToggleAudio = () => {
    setAudioOn(!audioOn);
    // In a real app, toggle audio track
    showNotification(`Microphone ${!audioOn ? 'enabled' : 'disabled'}`, 'info');
  };
  
  const handleToggleScreenShare = () => {
    // In a real app, implement screen sharing
    setScreenSharing(!screenSharing);
    showNotification(`Screen sharing ${!screenSharing ? 'started' : 'stopped'}`, 'info');
  };
  
  const handleEndCall = () => {
    // In a real app, properly close WebRTC connection
    showNotification('Call ended', 'info');
    navigate('/appointments');
  };
  
  const formatElapsedTime = () => {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !appointment) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error?.message || 'Failed to load appointment'}
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/appointments')}
          sx={{ mt: 2 }}
        >
          Back to Appointments
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link 
          color="inherit" 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            navigate('/appointments');
          }}
        >
          Appointments
        </Link>
        <Typography color="text.primary">Telemedicine Session</Typography>
      </Breadcrumbs>
      
      {/* Header */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={2}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h5" component="h1">
            Telemedicine Session
          </Typography>
          <Chip 
            label={`LIVE • ${formatElapsedTime()}`} 
            color="error" 
            size="small" 
            variant="filled" 
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
        
        <Button
          variant="outlined"
          color="error"
          startIcon={<CallEndIcon />}
          onClick={handleEndCall}
        >
          End Call
        </Button>
      </Box>
      
      {/* Main content */}
      <Grid container spacing={2}>
        {/* Video section */}
        <Grid item xs={12} md={showChat ? 8 : 12}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 2, 
              bgcolor: 'black', 
              height: 'calc(100vh - 220px)',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 2
            }}
          >
            {/* Remote video (doctor) - main view */}
            <Box 
              sx={{ 
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              <video
                ref={remoteVideoRef}
                autoPlay
                muted
                playsInline
                poster="/assets/doctor-placeholder.jpg"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  backgroundColor: '#1a1a1a'
                }}
              />
              
              {/* Display doctor name */}
              <Box 
                sx={{ 
                  position: 'absolute', 
                  bottom: 8, 
                  left: 8, 
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  borderRadius: 1,
                  px: 1
                }}
              >
                <Typography variant="caption" color="white">
                  {appointment.doctor.name}
                </Typography>
              </Box>
            </Box>
            
            {/* Local video (patient) - picture in picture */}
            <Box 
              sx={{ 
                position: 'absolute', 
                bottom: 16, 
                right: 16, 
                width: '160px',
                height: '90px',
                backgroundColor: '#333',
                borderRadius: 1,
                overflow: 'hidden',
                border: '2px solid #666'
              }}
            >
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)' // Mirror effect
                }}
              />
              
              {!videoOn && (
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.8)'
                  }}
                >
                  <VideocamOffIcon />
                </Box>
              )}
            </Box>
            
            {/* Video controls */}
            <Box 
              sx={{ 
                position: 'absolute', 
                bottom: 16, 
                left: '50%', 
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 1,
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: 5,
                p: 1
              }}
            >
              <Tooltip title={videoOn ? "Turn off camera" : "Turn on camera"}>
                <IconButton 
                  onClick={handleToggleVideo} 
                  color={videoOn ? "primary" : "error"}
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
                >
                  {videoOn ? <VideocamIcon /> : <VideocamOffIcon />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title={audioOn ? "Mute microphone" : "Unmute microphone"}>
                <IconButton 
                  onClick={handleToggleAudio} 
                  color={audioOn ? "primary" : "error"}
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
                >
                  {audioOn ? <MicIcon /> : <MicOffIcon />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title={screenSharing ? "Stop sharing screen" : "Share screen"}>
                <IconButton 
                  onClick={handleToggleScreenShare} 
                  color={screenSharing ? "primary" : "inherit"}
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
                >
                  {screenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title={showChat ? "Hide chat" : "Show chat"}>
                <IconButton 
                  onClick={() => setShowChat(!showChat)} 
                  color={showChat ? "primary" : "inherit"}
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
                >
                  <ChatIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Call information">
                <IconButton 
                  color="inherit"
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
                  onClick={() => {
                    showNotification(`Appointment: ${appointment.title}`, 'info');
                  }}
                >
                  <InfoIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="End call">
                <IconButton 
                  onClick={handleEndCall} 
                  color="error"
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
                >
                  <CallEndIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        </Grid>
        
        {/* Chat section (conditionally rendered) */}
        {showChat && (
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={1} 
              sx={{ 
                height: 'calc(100vh - 220px)',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2
              }}
            >
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">Session Chat</Typography>
              </Box>
              
              {/* Messages area */}
              <Box 
                sx={{ 
                  flexGrow: 1, 
                  overflowY: 'auto',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1
                }}
              >
                {messages.map(message => {
                  const isCurrentUser = message.senderId === 'pt1';
                  return (
                    <Box 
                      key={message.id}
                      sx={{ 
                        alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
                        maxWidth: '80%'
                      }}
                    >
                      <Box
                        sx={{
                          backgroundColor: isCurrentUser ? 'primary.main' : 'grey.100',
                          color: isCurrentUser ? 'white' : 'text.primary',
                          p: 1,
                          borderRadius: 2,
                          borderBottomLeftRadius: !isCurrentUser ? 0 : undefined,
                          borderBottomRightRadius: isCurrentUser ? 0 : undefined,
                        }}
                      >
                        {!isCurrentUser && (
                          <Typography variant="caption" fontWeight="bold">
                            {message.senderName}
                          </Typography>
                        )}
                        <Typography variant="body2">
                          {message.content}
                        </Typography>
                        <Typography variant="caption" color={isCurrentUser ? 'rgba(255,255,255,0.7)' : 'text.secondary'} sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                          {format(new Date(message.timestamp), 'h:mm a')}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
                <div ref={chatEndRef} />
              </Box>
              
              {/* Message input */}
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Grid container spacing={1}>
                  <Grid item xs>
                    <TextField
                      fullWidth
                      placeholder="Type a message..."
                      variant="outlined"
                      size="small"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage();
                        }
                      }}
                    />
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      endIcon={<SendIcon />}
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      Send
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
      
      {/* Appointment info */}
      <Paper elevation={1} sx={{ mt: 2, p: 2, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Appointment Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="text.secondary">
              Title
            </Typography>
            <Typography variant="body1" gutterBottom>
              {appointment.title}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="text.secondary">
              With
            </Typography>
            <Typography variant="body1" gutterBottom>
              {appointment.doctor.name} ({appointment.doctor.specialty})
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="text.secondary">
              Scheduled Time
            </Typography>
            <Typography variant="body1" gutterBottom>
              {format(new Date(appointment.startTime), 'MMM d, yyyy h:mm a')} - 
              {format(new Date(appointment.endTime), 'h:mm a')}
            </Typography>
          </Grid>
          
          {appointment.notes && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Notes
              </Typography>
              <Typography variant="body1">
                {appointment.notes}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
};

export default TelemedicineSession; 