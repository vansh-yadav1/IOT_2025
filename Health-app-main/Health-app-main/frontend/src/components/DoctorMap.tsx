import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  latitude: number;
  longitude: number;
}

// Only inject CSS once
if (!document.getElementById('doctor-marker-style')) {
  const markerStyle = document.createElement('style');
  markerStyle.id = 'doctor-marker-style';
  markerStyle.innerHTML = `
  .doctor-marker-label {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    min-height: 36px;
    background: #fff;
    color: #222;
    font-weight: 500;
    border-radius: 50%;
    padding: 4px 8px;
    box-shadow: 0 2px 8px rgba(124,58,237,0.12);
    font-size: 0.85rem;
    border: 2px solid #7c3aed;
    animation: fadeInUp 0.7s;
    transition: transform 0.2s;
    cursor: pointer;
    line-height: 1.1;
  }
  .doctor-marker-label span {
    margin-left: 3px;
    color: #222;
    font-size: 0.85rem;
    font-weight: 500;
    white-space: nowrap;
  }
  .doctor-marker-label:hover {
    transform: scale(1.08);
    background: #ede9fe;
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  `;
  document.head.appendChild(markerStyle);
}

const DoctorMap: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          // Fetch doctors near the user's location
          fetch(`http://localhost:8000/doctors/nearby?latitude=${latitude}&longitude=${longitude}&radius=10`)
            .then(response => response.json())
            .then(data => setDoctors(data))
            .catch(error => console.error('Error fetching doctors:', error));
        },
        error => console.error('Error getting location:', error)
      );
    }
  }, []);

  useEffect(() => {
    if (userLocation) {
      // Initialize map only once
      if (!mapRef.current) {
        mapRef.current = L.map('map').setView([userLocation.lat, userLocation.lng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapRef.current);
      } else {
        mapRef.current.setView([userLocation.lat, userLocation.lng], 13);
      }

      // Remove old markers
      if (markersRef.current) {
        markersRef.current.clearLayers();
      } else {
        markersRef.current = L.layerGroup().addTo(mapRef.current);
      }

      // Add user's location marker
      L.marker([userLocation.lat, userLocation.lng])
        .addTo(markersRef.current)
        .bindPopup('Your Location')
        .openPopup();

      // Add doctors' markers with location icon and name
      doctors.forEach((doctor) => {
        try {
          const icon = L.divIcon({
            className: 'doctor-marker-label',
            html: `<span>📍</span><span>${doctor.name}</span>`,
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -36],
          });
          L.marker([doctor.latitude, doctor.longitude], { icon })
            .addTo(markersRef.current!)
            .bindPopup(`<b>${doctor.name}</b><br/>${doctor.specialty}`);
        } catch (e) {
          // Fallback to default marker
          L.marker([doctor.latitude, doctor.longitude])
            .addTo(markersRef.current!)
            .bindPopup(`<b>${doctor.name}</b><br/>${doctor.specialty}`);
        }
      });
    }
  }, [userLocation, doctors]);

  // Clean up map on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return <div id="map" style={{ height: '500px', width: '100%' }} />;
};

export default DoctorMap; 