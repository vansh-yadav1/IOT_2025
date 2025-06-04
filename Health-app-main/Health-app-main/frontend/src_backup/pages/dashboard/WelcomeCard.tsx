import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { Card3D, MeteorEffect, SpotlightEffect, ShimmerButton } from '../../components/ui/aceternity';
import { useNavigate } from 'react-router-dom';

interface WelcomeCardProps {
  userName: string;
  upcomingAppointments: number;
  pendingResults: number;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({
  userName,
  upcomingAppointments,
  pendingResults
}) => {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <Card3D className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-100 dark:border-purple-800/30 rounded-xl overflow-hidden min-h-[220px]">
        <MeteorEffect number={10} />
        <SpotlightEffect className="h-full">
          <Box sx={{ position: 'relative', zIndex: 10 }}>
            <Typography variant="h5" component="h2" className="text-purple-800 dark:text-purple-200 mb-3">
              Welcome back, {userName}
            </Typography>
            
            <div className="space-y-4">
              <div className="p-4 bg-white/80 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm">
                <Typography variant="body1" className="text-slate-700 dark:text-slate-300">
                  You have <strong>{upcomingAppointments}</strong> upcoming appointments
                </Typography>
              </div>
              
              {pendingResults > 0 && (
                <div className="p-4 bg-white/80 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm">
                  <Typography variant="body1" className="text-slate-700 dark:text-slate-300">
                    <strong>{pendingResults}</strong> test results ready for review
                  </Typography>
                </div>
              )}
            </div>
            
            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <ShimmerButton
                onClick={() => navigate('/appointments')}
                className="bg-purple-600 hover:bg-purple-700 text-white border-purple-700"
              >
                View Appointments
              </ShimmerButton>
              
              {pendingResults > 0 && (
                <ShimmerButton
                  onClick={() => navigate('/reports')}
                  className="bg-violet-600 hover:bg-violet-700 text-white border-violet-700"
                >
                  Check Results
                </ShimmerButton>
              )}
            </Box>
          </Box>
        </SpotlightEffect>
      </Card3D>
    </div>
  );
};

export default WelcomeCard; 