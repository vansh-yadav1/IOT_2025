import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Button,
  IconButton,
  Tooltip,
  Alert,
  AlertTitle,
  Skeleton,
  useTheme,
  useMediaQuery,
  Grid,
  Stack,
  Badge,
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  NoteAdd as NewReportIcon,
  Refresh as RefreshIcon,
  FilePresent as FileIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { reportService } from '../../services/reportService';
import { Report } from '../../types/reports';
import { supabase } from '../../services/supabaseClient';

// Define table headers
const headCells = [
  { id: 'medicine', label: 'Medicine', numeric: false, sortable: true },
  { id: 'created_at', label: 'Date', numeric: false, sortable: true, minWidth: 100 },
  { id: 'half_life', label: 'Half-life (min)', numeric: true, sortable: true },
  { id: 'full_life', label: 'Full-life (min)', numeric: true, sortable: true },
];

type Order = 'asc' | 'desc';

const ReportsList: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<keyof Report>('created_at');
  const [order, setOrder] = useState<Order>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const isDoctor = user?.user_metadata?.role === 'DOCTOR';

  const fetchReports = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await reportService.getReports(user.id, isDoctor);
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load reports'));
    } finally {
      setLoading(false);
    }
  }, [user, isDoctor]);

  useEffect(() => {
    fetchReports();
    // Real-time subscription
    let unsubscribe: (() => void) | undefined;
    if (user) {
      if (isDoctor) {
        // Doctors: subscribe to all reports
        const channel = supabase
          .channel('reports-changes-all')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'reports',
            },
            async () => {
              await fetchReports();
            }
          )
          .subscribe();
        unsubscribe = () => supabase.removeChannel(channel);
      } else {
        // Patients: subscribe to their own reports
        unsubscribe = reportService.subscribeToReports(user.id, (data) => {
          setReports(data);
          setLoading(false);
        });
      }
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, isDoctor, fetchReports]);

  useEffect(() => {
    if (user) {
      console.log('Current user.id used for reports:', user.id);
    }
  }, [user]);

  // Filter reports
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      if (searchQuery && !report.medicine.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [reports, searchQuery]);

  // Sort reports
  const sortedReports = useMemo(() => {
    if (!filteredReports.length) return [];
    
    return [...filteredReports].sort((a, b) => {
      if (orderBy === 'created_at') {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return order === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      }
      
      const key = orderBy as keyof typeof a;
      const valueA = a[key];
      const valueB = b[key];
      
      if (valueA === undefined && valueB === undefined) return 0;
      if (valueA === undefined) return order === 'asc' ? -1 : 1;
      if (valueB === undefined) return order === 'asc' ? 1 : -1;
      
      return order === 'asc' 
        ? valueA < valueB ? -1 : 1 
        : valueA > valueB ? -1 : 1;
    });
  }, [filteredReports, order, orderBy]);

  // Pagination logic
  const paginatedReports = useMemo(() => {
    return sortedReports.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedReports, page, rowsPerPage]);

  // Handle sort request
  const handleRequestSort = (property: keyof Report) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  // Handle report download
  const handleDownloadReport = async (report: Report) => {
    try {
      const downloadUrl = await reportService.getReportDownloadUrl(report.pdf_path);
      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  // Format date for better accessibility
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Handle create new report
  const handleCreateNewReport = () => {
    navigate('/test-health');
  };

  // Rendering table skeletons during loading
  const renderSkeletons = () => (
    <TableBody>
      {Array.from({ length: rowsPerPage }).map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          {Array.from({ length: headCells.length + 1 }).map((_, cellIndex) => (
            <TableCell key={`skeleton-cell-${index}-${cellIndex}`}>
              <Skeleton variant="text" width={cellIndex === 0 ? '60%' : '80%'} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );

  // Render empty state
  const renderEmptyState = () => (
    <TableBody>
      <TableRow>
        <TableCell colSpan={headCells.length + 1} align="center" sx={{ py: 8 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
            <FileIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No reports found
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {searchQuery
                ? 'Try adjusting your search criteria'
                : 'There are no reports available at this time'}
            </Typography>
            {searchQuery && (
              <Button 
                startIcon={<RefreshIcon />} 
                variant="outlined" 
                onClick={() => setSearchQuery('')}
                sx={{ mt: 1 }}
              >
                Clear search
              </Button>
            )}
          </Box>
        </TableCell>
      </TableRow>
    </TableBody>
  );

  // Render report count summary
  const renderReportCount = () => (
    <Typography variant="body2" color="text.secondary">
      {filteredReports.length === 0 
        ? 'No reports found' 
        : `Showing ${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, filteredReports.length)} of ${filteredReports.length} reports`}
    </Typography>
  );

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 4 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          }
        >
          <AlertTitle>Error Loading Reports</AlertTitle>
          {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page header */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h4" component="h1">
            Test Health Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and download your test health reports
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Button
            variant="contained"
            startIcon={<NewReportIcon />}
            onClick={handleCreateNewReport}
          >
            New Test
          </Button>
        </Grid>
      </Grid>
      
      {/* Reports table */}
      <Paper
        elevation={0} 
        sx={{ 
          mb: 4, 
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <TableContainer sx={{ maxHeight: 640 }}>
          <Table stickyHeader aria-label="reports table">
            <TableHead>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    sortDirection={orderBy === headCell.id ? order : false}
                    sx={{ 
                      minWidth: headCell.minWidth,
                      backgroundColor: theme.palette.background.paper,
                      fontWeight: 600
                    }}
                  >
                    {headCell.sortable ? (
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={() => handleRequestSort(headCell.id as keyof Report)}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    ) : (
                      headCell.label
                    )}
                  </TableCell>
                ))}
                <TableCell sx={{ backgroundColor: theme.palette.background.paper, fontWeight: 600 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            
            {loading ? (
              renderSkeletons()
            ) : paginatedReports.length === 0 ? (
              renderEmptyState()
            ) : (
              <TableBody>
                {paginatedReports.map((report) => (
                  <TableRow
                    hover
                    key={report.id}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Typography variant="body2">
                        {report.medicine}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(report.created_at)}</TableCell>
                    <TableCell>{report.half_life}</TableCell>
                    <TableCell>{report.full_life}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Download PDF">
                          <IconButton
                            size="small"
                            aria-label={`Download PDF: ${report.medicine}`}
                            onClick={() => handleDownloadReport(report)}
                          >
                            <FileDownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </TableContainer>
        
        {/* Table pagination */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
            py: 1.5,
            borderTop: `1px solid ${theme.palette.divider}`
          }}
        >
          {renderReportCount()}
          
          <TablePagination
            component="div"
            count={filteredReports.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
            labelRowsPerPage={isMobile ? "Rows:" : "Rows per page:"}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default ReportsList; 