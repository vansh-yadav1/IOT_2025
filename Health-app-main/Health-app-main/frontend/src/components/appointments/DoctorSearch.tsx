import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FilterListIcon from '@mui/icons-material/FilterList';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Create custom marker icons for different specializations
const createMarkerIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 4px rgba(0,0,0,0.4);
    ">
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
};

// Specialization colors
const specializationColors: { [key: string]: string } = {
  Cardiology: '#e74c3c',
  Dermatology: '#3498db',
  Neurology: '#9b59b6',
  Pediatrics: '#2ecc71',
  Orthopedics: '#f1c40f',
  Psychiatry: '#1abc9c',
  Oncology: '#e67e22',
  Gynecology: '#fd79a8',
  Ophthalmology: '#00cec9',
  Dentistry: '#a29bfe',
  default: '#95a5a6',
};

interface Doctor {
  id: string;
  user_metadata: {
    full_name: string;
    specializations: Array<{ id: string; name: string }>;
    languages: string[];
    location: {
      latitude: number;
      longitude: number;
    };
    address: string;
  };
}

// Map recenter component
function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
}

export default function DoctorSearch() {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const navigate = useNavigate();

  // Fetch doctors
  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select('*');
      if (error) throw error;
      return (data || []) as Doctor[];
    }
  });

  // Filter doctors based on search and specialization
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor: Doctor) => {
      const matchesSearch = doctor.user_metadata.full_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        doctor.user_metadata.address.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSpecialization = selectedSpecialization
        ? doctor.user_metadata.specializations.some((spec) => spec.name === selectedSpecialization)
        : true;

      return matchesSearch && matchesSpecialization;
    });
  }, [doctors, searchTerm, selectedSpecialization]);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Set default location (e.g., city center)
          setUserLocation({ lat: 51.505, lng: -0.09 });
        }
      );
    }
  }, []);

  const handleBookAppointment = (doctorId: string) => {
    navigate(`/appointments/create/${doctorId}`);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Find a Doctor
      </Typography>

      {/* Search and Filter Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by doctor name or address"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Specialization</InputLabel>
              <Select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                label="Specialization"
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="">All Specializations</MenuItem>
                {Object.keys(specializationColors).map((spec) => (
                  <MenuItem key={spec} value={spec}>
                    {spec}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {userLocation && (
        <Box mb={4} height={400}>
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* User location marker */}
            <Marker 
              position={[userLocation.lat, userLocation.lng]}
              icon={createMarkerIcon('#3498db')}
            >
              <Popup>Your Location</Popup>
            </Marker>

            {/* Doctor markers */}
            {filteredDoctors.map((doctor: Doctor) => {
              const mainSpecialization = doctor.user_metadata.specializations[0]?.name || 'default';
              const markerColor = specializationColors[mainSpecialization] || specializationColors.default;
              
              return (
                <Marker
                  key={doctor.id}
                  position={[
                    doctor.user_metadata.location.latitude,
                    doctor.user_metadata.location.longitude
                  ]}
                  icon={createMarkerIcon(markerColor)}
                >
                  <Popup>
                    <Box sx={{ minWidth: 200 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {doctor.user_metadata.full_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {doctor.user_metadata.address}
                      </Typography>
                      <Box display="flex" gap={0.5} flexWrap="wrap" my={1}>
                        {doctor.user_metadata.specializations.map((spec) => (
                          <Chip
                            key={spec.id}
                            label={spec.name}
                            size="small"
                            sx={{
                              backgroundColor: specializationColors[spec.name],
                              color: 'white',
                              fontSize: '0.7rem',
                            }}
                          />
                        ))}
                      </Box>
                      <Button
                        size="small"
                        variant="contained"
                        fullWidth
                        onClick={() => handleBookAppointment(doctor.id)}
                        startIcon={<LocationOnIcon />}
                      >
                        Book Appointment
                      </Button>
                    </Box>
                  </Popup>
                </Marker>
              );
            })}
            
            {selectedDoctor && (
              <RecenterMap
                position={[
                  selectedDoctor.user_metadata.location.latitude,
                  selectedDoctor.user_metadata.location.longitude,
                ]}
              />
            )}
          </MapContainer>
        </Box>
      )}

      <Grid container spacing={3}>
        {filteredDoctors.map((doctor: Doctor) => (
          <Grid item xs={12} md={6} lg={4} key={doctor.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {doctor.user_metadata.full_name}
                </Typography>
                <Box display="flex" gap={0.5} flexWrap="wrap" mb={2}>
                  {doctor.user_metadata.specializations.map((spec) => (
                    <Chip
                      key={spec.id}
                      label={spec.name}
                      size="small"
                      sx={{
                        backgroundColor: specializationColors[spec.name],
                        color: 'white',
                      }}
                    />
                  ))}
                </Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {doctor.user_metadata.address}
                </Typography>
                <Box mb={2}>
                  {doctor.user_metadata.languages.map((lang) => (
                    <Chip
                      key={lang}
                      label={lang}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => {
                    setSelectedDoctor(doctor);
                    handleBookAppointment(doctor.id);
                  }}
                  startIcon={<LocationOnIcon />}
                >
                  Book Appointment
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
} 