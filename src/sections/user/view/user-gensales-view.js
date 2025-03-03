import { useEffect, useRef, useState } from 'react';
// @mui
import Container from '@mui/material/Container';
// routes
// import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
// components
import { AccessTime, CheckCircleOutline, ErrorOutline } from '@mui/icons-material';
import {
  alpha,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

//
import PropTypes from 'prop-types';
import { useSnackbar } from 'src/components/snackbar';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { logActivity } from 'src/utils/log-activity';
import AppAreaInstalled from '../../overview/app/app-area-installed';
import AppCurrentDownload from '../../overview/app/app-current-download';

// ----------------------------------------------------------------------

export default function UserGenSalesView({ moduleName }) {
  const { enqueueSnackbar } = useSnackbar();

  const [userRole, setUserRole] = useState(null);

  const [loading, setLoading] = useState(false);

  const [pipelines, setPipelines] = useState([]);

  const [profileOptions, setProfileOptions] = useState([]);

  const [selectedProfileIds, setSelectedProfileIds] = useState([]);

  const [fromDate, setFromDate] = useState('');

  const [toDate, setToDate] = useState('');

  const [filtersCleared, setFiltersCleared] = useState(false);

  const logSentRef = useRef(false);

  useEffect(() => {
    // Only run this effect if the role is "Admin"
    if (userRole !== 'Admin') return;

    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get(endpoints.admin.details);

        const uniqueProfiles = [];
        const seenIds = new Set();

        response.data.forEach((details) => {
          if (details.id && !seenIds.has(details.id)) {
            seenIds.add(details.id);
            uniqueProfiles.push({
              id: details.id,
              name: `${details.full_name} ${details.last_name}`.trim(),
            });
          }
        });

        setProfileOptions(uniqueProfiles);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [userRole]);

  useEffect(() => {
    const fetchPipelines = async () => {
      if (!logSentRef.current) {
        const dynamicModuleName = moduleName || 'REPORTS';
        logActivity('User view generated sales', dynamicModuleName);
        logSentRef.current = true;
      }
      if (!userRole) return;
      setLoading(true);
      try {
        const userId = sessionStorage.getItem('userid');
        const token = sessionStorage.getItem('authToken');

        const params = {
          user_id: userId,
          ...(userRole === 'Sales Representative' && {
            role: 'sales_representative',
            gensales: true,
          }),
          ...(userRole === 'Sales Manager' && {
            role: 'sales_manager',
            gensales: true,
          }),
          ...(userRole === 'Admin' && {
            role: 'admin',
            gensales: true,
          }),
        };

        const response = await axiosInstance.get(endpoints.get.pipeline, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params,
        });

        setPipelines(response.data);

        const uniqueProfiles = [];
        const seenIds = new Set();

        response.data.forEach((pipeline) => {
          if (pipeline.profile_id && !seenIds.has(pipeline.profile_id)) {
            seenIds.add(pipeline.profile_id);
            uniqueProfiles.push({
              id: pipeline.profile_id,
              name: pipeline.profile_name || 'N/A',
            });
          }
        });

        if (userRole !== 'Admin') {
          setProfileOptions(uniqueProfiles);
        }
      } catch (error) {
        console.error('Error fetching pipelines:', error);
        enqueueSnackbar('Failed to fetch pipelines.', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchPipelines();
  }, [enqueueSnackbar, userRole, filtersCleared, moduleName]);

  useEffect(() => {
    const storedRole = sessionStorage.getItem('userRole');
    setUserRole(storedRole);
  }, []);

  const fetchFilteredPipelines = async (filters = {}) => {
    try {
      const token = sessionStorage.getItem('authToken');
      const params = {
        ...(filters.profile_ids?.length > 0 && { profile_ids: filters.profile_ids.join(',') }),
        ...(filters.from_date && { from_date: filters.from_date }),
        ...(filters.to_date && { to_date: filters.to_date }),
        ...(filters.role && { role: filters.role }),
        usergen: true,
      };

      const response = await axiosInstance.get(endpoints.pipelines.filter, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      const approvedPipelines = response.data.filter((pipeline) => pipeline.status === 'approved');
      setPipelines(approvedPipelines);
    } catch (error) {
      console.error('Filter error:', error);
      enqueueSnackbar('Failed to apply filters', { variant: 'error' });
    }
  };

  const clearFilters = () => {
    setSelectedProfileIds([]);
    setFromDate('');
    setToDate('');

    setFiltersCleared((prev) => !prev);
  };

  const getFormattedRole = (role) => {
    if (role === 'Sales Manager') {
      return 'sales_manager';
    }

    if (role === 'Sales Representative') {
      return 'sales_representative';
    }

    return role;
  };

  const handleProfileFilterChange = (event) => {
    const value = event.target.value;
    const selectedIds = typeof value === 'string' ? value.split(',') : value;
    setSelectedProfileIds(selectedIds);

    fetchFilteredPipelines({
      profile_ids: selectedIds,
      from_date: fromDate,
      to_date: toDate,
      role: getFormattedRole(userRole),
    });
  };

  const applyDateFilter = () => {
    if (!fromDate) {
      enqueueSnackbar('Please select both From and To dates.', { variant: 'warning' });
      return;
    }

    const userId = sessionStorage.getItem('userid');

    let params = {
      from_date: fromDate,
      to_date: toDate,
      profile_ids: selectedProfileIds,
    };

    if (
      (userRole === 'Sales Representative' || userRole === 'Sales Manager') &&
      userId &&
      selectedProfileIds.length === 0
    ) {
      params = {
        ...params,
        profile_ids: [userId],
      };
    }

    fetchFilteredPipelines(params);
  };

  const handleExport = async () => {
    try {
      const token = sessionStorage.getItem('authToken');

      const profileIds = pipelines.map((pipeline) => pipeline.profile_id);

      const payload = { profile_ids: profileIds };

      if (fromDate) payload.from_date = fromDate;
      if (toDate) payload.to_date = toDate;

      const response = await axiosInstance.post(endpoints.exports.pipelines, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });
      logActivity('User export generated sales record', moduleName || 'REPORTS');
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'pipelines.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      enqueueSnackbar('Export successful!', { variant: 'success' });
    } catch (error) {
      console.error('Export error:', error);
      enqueueSnackbar(error.response?.data?.message || 'Export failed. Please try again.', {
        variant: 'error',
      });
    }
  };

  // For quarter graph
  const groupByQuarter = (data) => {
    const quarterMap = {
      0: 'Q1 (Jan - Mar)',
      1: 'Q1 (Jan - Mar)',
      2: 'Q1 (Jan - Mar)',
      3: 'Q2 (Apr - Jun)',
      4: 'Q2 (Apr - Jun)',
      5: 'Q2 (Apr - Jun)',
      6: 'Q3 (Jul - Sep)',
      7: 'Q3 (Jul - Sep)',
      8: 'Q3 (Jul - Sep)',
      9: 'Q4 (Oct - Dec)',
      10: 'Q4 (Oct - Dec)',
      11: 'Q4 (Oct - Dec)',
    };

    const groupedData = data.reduce((acc, pipeline) => {
      const monthIndex = new Date(pipeline.created_at).getMonth();
      const quarter = quarterMap[monthIndex];

      if (!acc[quarter]) {
        acc[quarter] = 0;
      }
      acc[quarter] += parseFloat(pipeline.worth);

      return acc;
    }, {});

    const chartData = Object.keys(groupedData).map((quarter) => ({
      label: quarter,
      value: groupedData[quarter],
    }));

    return chartData;
  };

  const chartData = groupByQuarter(pipelines);

  // For Yearly graph

  const allYears = [
    ...new Set(pipelines.map((pipeline) => new Date(pipeline.created_at).getFullYear())),
  ].sort((a, b) => b - a);

  const [selectedYear, setSelectedYear] = useState(allYears[0] || new Date().getFullYear());

  const monthlyData = Array(12)
    .fill(0)
    .map(() => ({ approved: 0 })); // Only one field for 'approved' data

  pipelines.forEach((pipeline) => {
    const createdYear = new Date(pipeline.created_at).getFullYear();
    if (createdYear === selectedYear && pipeline.status === 'approved') {
      // Filter only approved status
      const monthIndex = new Date(pipeline.created_at).getMonth();
      monthlyData[monthIndex].approved += parseFloat(pipeline.worth);
    }
  });

  const chartCategories = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const chartSeries = [
    {
      name: 'Approved',
      data: monthlyData.map((data) => data.approved),
      color: 'green',
    },
  ];

  const getStatusColor = (theme, pipelineStatus) => {
    switch (pipelineStatus?.toLowerCase()) {
      case 'approved':
        return theme.palette.success.main;
      case 'rejected':
        return theme.palette.error.main;
      case 'pending':
        return theme.palette.warning.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  return (
    <Container maxWidth="">
      {/* Existing Table and Content */}
      <CustomBreadcrumbs
        heading="Generated Sales"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'generated sales' }]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'left', mt: 4, gap: 2, flexWrap: 'wrap' }}>
        {/* Filter by User - Visible Only to Sales Manager */}
        {(userRole === 'Sales Manager' || userRole === 'Admin') && (
          <FormControl variant="outlined" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by User</InputLabel>
            <Select
              multiple
              value={selectedProfileIds}
              onChange={handleProfileFilterChange}
              input={<OutlinedInput label="Filter by User" />}
              renderValue={(selected) =>
                selected.length > 0 ? `${selected.length} users selected` : 'All Users'
              }
              MenuProps={{
                PaperProps: {
                  style: { maxHeight: 300 },
                },
              }}
            >
              {profileOptions.map((profile) => (
                <MenuItem key={profile.id} value={profile.id}>
                  <Checkbox checked={selectedProfileIds.includes(profile.id)} />
                  <ListItemText primary={profile.name} />
                  <Chip
                    label={profile.name}
                    size="small"
                    sx={{
                      ml: 1,
                      backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                      color: (theme) => theme.palette.primary.main,
                    }}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Date Range Filter - Visible to All Roles */}
        <TextField
          label="From Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          sx={{ minWidth: 150 }}
        />

        <TextField
          label="To Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          sx={{ minWidth: 150 }}
        />

        <Button variant="contained" onClick={applyDateFilter} sx={{ height: '40px', mt: '10px' }}>
          Apply
        </Button>

        {/* Clear Filter Button */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="outlined"
            onClick={clearFilters}
            sx={{
              height: '30px',
              mt: '13px',
              color: 'text.secondary',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
              },
            }}
          >
            Clear Filters
          </Button>

          {/* Export Button */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: { xs: 'center', sm: 'flex-start' },
              mt: -4,
            }}
          >
            <Box sx={{ position: 'relative', width: '100%', margin: 0 }}>
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={handleExport}
                sx={{
                  position: 'absolute',
                  right: { xs: 0, sm: -420 }, // Stick to right edge
                  top: 0, // Stick to top edge
                  minWidth: 100,
                  px: 3,
                  py: 1,
                  fontSize: { xs: '0.8rem', sm: '1rem' },
                  margin: '8px', // Add small consistent margin
                  transform: 'none', // Disable any default transforms
                }}
              >
                Export
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          marginTop: '20px',
          maxHeight: '500px',
          overflowY: 'auto',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              {(userRole === 'Sales Manager' || userRole === 'Admin') && (
                <TableCell>
                  <strong>User Name</strong>
                </TableCell>
              )}
              <TableCell>
                <strong>Company</strong>
              </TableCell>
              <TableCell>
                <strong>Contacts</strong>
              </TableCell>
              <TableCell>
                <strong>Project Name</strong>
              </TableCell>
              <TableCell>
                <strong>Worth</strong>
              </TableCell>
              <TableCell>
                <strong>Status</strong>
              </TableCell>
              <TableCell>
                <strong>Created At</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pipelines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No Pipeline Records Found
                </TableCell>
              </TableRow>
            ) : (
              pipelines.map((pipeline) => (
                <TableRow key={pipeline.id}>
                  {(userRole === 'Sales Manager' || userRole === 'Admin') && (
                    <TableCell>{pipeline.profile_name || 'N/A'}</TableCell>
                  )}
                  <TableCell>{pipeline.company_name || 'N/A'}</TableCell>
                  <TableCell>
                    {pipeline.company_contacts
                      ?.map((contact) => `${contact.client_first_name} ${contact.client_last_name}`)
                      .join(', ') || 'N/A'}
                  </TableCell>
                  <TableCell>{pipeline.project_name}</TableCell>
                  <TableCell>${pipeline.worth}</TableCell>
                  <TableCell>
                    <Tooltip title={`Status: ${pipeline.status || 'Pending'}`} arrow>
                      <Chip
                        label={pipeline.status || 'Pending'}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontWeight: 600,
                          borderWidth: '2px',
                          borderColor: (theme) => getStatusColor(theme, pipeline.status),
                          color: (theme) => getStatusColor(theme, pipeline.status),
                          '&:hover': {
                            backgroundColor: (theme) =>
                              alpha(getStatusColor(theme, pipeline.status), 0.1),
                          },
                        }}
                        icon={
                          {
                            success: <CheckCircleOutline fontSize="small" />,
                            failed: <ErrorOutline fontSize="small" />,
                          }[pipeline.status] || <AccessTime fontSize="small" />
                        }
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell>{new Date(pipeline.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Container maxWidth="xl" sx={{ paddingBottom: '60px', mt: '50px' }}>
        <Grid container spacing={3}>
          {/* Left Side - Quarterly Valuation */}
          <Grid item xs={12} md={4} lg={4}>
            <Card sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                Quarterly Generated Sales Valuation
              </Typography>
              <Box
                sx={{ mb: 2, p: 1, border: '1px dashed', borderColor: 'grey.300', borderRadius: 1 }}
              >
                <Typography variant="caption" color="text.secondary">
                  Quarter Legend: Q1 (Jan - Mar), Q2 (Apr - Jun), Q3 (Jul - Sep), Q4 (Oct - Dec)
                </Typography>
              </Box>
              <AppCurrentDownload
                chart={{
                  series: chartData,
                }}
                sx={{ height: 350 }}
              />
            </Card>
          </Grid>

          {/* Right Side - Yearly Analysis */}
          <Grid item xs={12} md={8} lg={8}>
            <Card sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
              <AppAreaInstalled
                title="Yearly Generated Sales Analysis"
                subheader={`(${selectedYear}) Analysis Data`}
                chart={{
                  categories: chartCategories,
                  series: chartSeries,
                  availableYears: allYears,
                }}
                showStateSelect={false}
                onYearChange={(year) => setSelectedYear(year)}
                sx={{ height: 400 }}
              />
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Box>
        <Grid container>{/* Your content */}</Grid>
        <Box
          component="footer"
          sx={{
            marginTop: '70px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            height: '50px',
            position: 'fixed',
            bottom: 0,
            left: '-50px',
            width: '100%',
            maxWidth: '1520px',
            margin: 'auto',
            zIndex: 1300,
            backgroundColor: 'white',
            padding: '10px',
            paddingRight: '50px',

            // Responsive styling
            '@media (max-width: 1024px)': {
              justifyContent: 'center',
              paddingRight: '20px',
            },

            '@media (max-width: 600px)': {
              justifyContent: 'center',
              left: '0',
              width: '100%',
              padding: '10px 15px',
            },
          }}
        >
          <Typography variant="body2" color="textSecondary">
            &copy; {new Date().getFullYear()}
            <span style={{ marginLeft: '5px' }}>
              <strong>www.SoluComp.com</strong>
            </span>
            v1.0
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { name, status, role } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (user) => user.name && user.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((user) => user.status === status);
  }

  if (role.length) {
    inputData = inputData.filter((user) => role.includes(user.role));
  }

  return inputData;
}

UserGenSalesView.propTypes = {
  moduleName: PropTypes.string,
};
