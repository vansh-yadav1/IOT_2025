import React, { useEffect, useRef } from 'react';
import { reportService } from '../services/reportService';
import { TestHealthReport } from '../types/reports';
import { useAuth } from '../context/AuthContext';
import { Alert, Snackbar } from '@mui/material';

interface TestHealthReportSaverProps {
  report: TestHealthReport;
  reportElementRef: React.RefObject<HTMLElement>;
  onSaveComplete?: () => void;
}

const TestHealthReportSaver: React.FC<TestHealthReportSaverProps> = ({
  report,
  reportElementRef,
  onSaveComplete
}) => {
  const { user } = useAuth();
  const [error, setError] = React.useState<string | null>(null);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const hasAttemptedSave = useRef(false);

  useEffect(() => {
    const saveReport = async () => {
      if (!user || !reportElementRef.current || hasAttemptedSave.current) return;
      console.log('Attempting to save report:', report);
      try {
        hasAttemptedSave.current = true;
        const savedReport = await reportService.saveReport(report, reportElementRef.current);
        console.log('Save result:', savedReport);
        if (savedReport) {
          setShowSuccess(true);
          onSaveComplete?.();
        } else {
          setError('Failed to save report');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save report');
        console.error('Save error:', err);
      }
    };

    saveReport();
  }, [user, report, reportElementRef, onSaveComplete]);

  return (
    <>
      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
        message="Report saved successfully"
      />
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TestHealthReportSaver; 