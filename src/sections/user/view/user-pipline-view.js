import { useEffect, useRef, useState } from 'react';
// @mui
import Container from '@mui/material/Container';
// routes
// import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
// components
import { AccessTime, CheckCircleOutline, ErrorOutline, Send } from '@mui/icons-material';
import {
  alpha,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  FormControl,
  Grid,
  InputAdornment,
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

export default function UserPiplineView({ moduleName }) {
  const { enqueueSnackbar } = useSnackbar();

  const [userRole, setUserRole] = useState(null);

  const [companies, setCompanies] = useState([]);

  const [selectedCompanies, setSelectedCompanies] = useState([]);

  const [selectedContacts, setSelectedContacts] = useState([]);

  const [contacts, setContacts] = useState([]);

  const [projectName, setProjectName] = useState('');

  const [worth, setWorth] = useState('');

  const [status, setStatus] = useState('Pending');

  const [loading, setLoading] = useState(false);

  const [pipelines, setPipelines] = useState([]);

  const [profileOptions, setProfileOptions] = useState([]);

  const [selectedProfileIds, setSelectedProfileIds] = useState([]);

  const [selectedStatus, setSelectedStatus] = useState([]);

  const [fromDate, setFromDate] = useState('');

  const [toDate, setToDate] = useState('');

  const [filtersCleared, setFiltersCleared] = useState(false);

  const logSentRef = useRef(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const userId = localStorage.getItem('userid');
        const response = await axiosInstance.get(endpoints.complete.accounts(userId), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const activeCompanies = response.data.data;

        const companyList = activeCompanies.map((company) => ({
          id: company.id,
          name: company.company_name || 'Unknown Company',
        }));

        setCompanies(companyList);
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    const fetchPipelines = async () => {
      if (!logSentRef.current) {
        const dynamicModuleName = moduleName || 'REPORTS';
        logActivity('User view pipeline', dynamicModuleName);
        logSentRef.current = true;
      }
      if (!userRole) return;
      setLoading(true);
      try {
        const userId = localStorage.getItem('userid');
        const token = localStorage.getItem('authToken');
        const roleParam = userRole?.toLowerCase().replace(/\s+/g, '_') || 'unknown_role';
        const params = {
          user_id: userId,
          role: roleParam,
          pipemod: true,
          ...(userRole === 'Sales Representative' || userRole === 'Admin'),
        };

        const response = await axiosInstance.get(endpoints.get.pipeline, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params,
        });
        const filteredPipelines =
          userRole === 'Admin'
            ? response.data
            : response.data.filter((pipeline) => pipeline.status !== '');

        setPipelines(response.data);

        const uniqueProfiles = [];
        const seenIds = new Set();

        filteredPipelines.forEach((pipeline) => {
          if (pipeline.profile_id && !seenIds.has(pipeline.profile_id)) {
            seenIds.add(pipeline.profile_id);
            uniqueProfiles.push({
              id: pipeline.profile_id,
              name: pipeline.profile_name || 'N/A',
            });
          }
        });

        setProfileOptions(uniqueProfiles);
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
    const storedRole = localStorage.getItem('userRole');
    setUserRole(storedRole);
  }, []);

  const handleCompanyChange = async (event) => {
    const selectedIds = event.target.value;
    setSelectedCompanies(selectedIds);
    setContacts([]);
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userid');
      const companyId = selectedIds[selectedIds.length - 1];
      const response = await axiosInstance.get(endpoints.solo.details(companyId), {
        params: {
          flag: true,
          userId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setContacts(response.data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactChange = (event) => {
    const value = event.target.value;
    setSelectedContacts(Array.isArray(value) ? value : []);
  };

  const handleSubmit = async () => {
    const userId = localStorage.getItem('userid');

    if (!selectedCompanies.length || !selectedContacts.length || !projectName || !worth) {
      enqueueSnackbar('Please fill all required fields!', { variant: 'warning' });
      return;
    }

    if (!selectedCompanies.length || !selectedContacts.length || !projectName || !worth) {
      enqueueSnackbar('Please fill all required fields!', { variant: 'warning' });
      return;
    }

    const payload = {
      profile_id: userId,
      company_account_id: selectedCompanies[0],
      company_contact_ids: selectedContacts,
      project_name: projectName,
      worth,
    };

    try {
      setLoading(true);
      const response = await axiosInstance.post(endpoints.pipeline.create, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      const newPipeline = response.data[0];

      logActivity('User created a new pipeline', moduleName || 'REPORTS');

      setPipelines((prevPipelines) => [...prevPipelines, newPipeline]);

      enqueueSnackbar('Pipeline created successfully!', { variant: 'success' });

      setSelectedCompanies([]);
      setSelectedContacts([]);
      setProjectName('');
      setWorth('');
    } catch (error) {
      console.error('Error submitting pipeline:', error);

      if (error.response) {
        const errorMessage =
          error.response.data?.message || 'Failed to create pipeline. Please try again.';
        enqueueSnackbar(errorMessage, { variant: 'error' });
      } else {
        enqueueSnackbar('Something went wrong. Please check your network and try again.', {
          variant: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (pipelineId, newStatus) => {
    if (userRole === 'Sales Representative' && newStatus === 'rejected') {
      enqueueSnackbar('You do not have the authority to reject the pipeline', { variant: 'error' });
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      const response = await axiosInstance.put(
        `${endpoints.update.pipeline}/${pipelineId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      logActivity('User updated a status of pipeline', moduleName || 'REPORTS');
      setPipelines((prev) =>
        prev.map((p) => (p.id === pipelineId ? { ...p, status: newStatus } : p))
      );
      enqueueSnackbar('Status updated successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error updating status:', error);
      enqueueSnackbar('Failed to update status', { variant: 'error' });
    }
  };

  const getFormattedRole = (role) => {
    if (role === 'Sales Manager') return 'sales_manager';
    if (role === 'Sales Representative') return 'sales_representative';
    return role;
  };

  const fetchFilteredPipelines = async (selectedIds = [], selectedStatusValues) => {
    try {
      if (!pipelines || pipelines.length === 0) {
        return;
      }

      const token = localStorage.getItem('authToken');

      const params = {
        ...(selectedIds.length > 0 && { profile_ids: selectedIds.join(',') }),
        ...(selectedStatusValues?.length > 0 && { status: selectedStatusValues.join(',') }),
        ...(userRole && { role: getFormattedRole(userRole) }),
        ...(fromDate && { from_date: fromDate }),
        ...(toDate && { to_date: toDate }),
      };

      const response = await axiosInstance.get(endpoints.pipelines.filter, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      const filteredPipelines =
        userRole === 'Admin'
          ? response.data
          : response.data.filter((pipeline) => pipeline.status !== 'approved');

      setPipelines(filteredPipelines);
    } catch (error) {
      console.error('Error fetching pipelines:', error);
    }
  };

  const handleProfileFilterChange = (event) => {
    const value = event.target.value;
    const selectedIds = typeof value === 'string' ? value.split(',') : value;

    setSelectedProfileIds(selectedIds);

    fetchFilteredPipelines(selectedIds, selectedStatus);
  };

  const handleStatusFilterChange = (event) => {
    const selectedStatusValues = event.target.value;
    setSelectedStatus(selectedStatusValues);

    let selectedIds = selectedProfileIds;

    if (userRole === 'Sales Representative' || userRole === 'Sales Manager') {
      const pipelineProfileIds = pipelines.map((pipeline) => pipeline.profile_id);
      selectedIds = [...new Set([...selectedIds, ...pipelineProfileIds])];
    }

    fetchFilteredPipelines(selectedIds, selectedStatusValues);
  };

  const applyDateFilter = () => {
    const userId = localStorage.getItem('userid');
    let selectedIds = selectedProfileIds;

    if (
      (userRole === 'Sales Representative' || userRole === 'Sales Manager') &&
      userId &&
      selectedProfileIds.length === 0
    ) {
      selectedIds = [userId];
    }

    fetchFilteredPipelines(selectedIds, selectedStatus, fromDate, toDate);
  };

  const clearFilters = () => {
    setSelectedProfileIds([]);
    setFromDate('');
    setToDate('');

    setFiltersCleared((prev) => !prev);
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('authToken');

      const profileIds = pipelines.map((pipeline) => pipeline.profile_id);

      const payload = {
        profile_ids: profileIds,
        role: userRole,
        pipemod: true,
      };

      if (selectedProfileIds.length > 0) payload.selected_profile_ids = selectedProfileIds;
      if (selectedStatus.length > 0) payload.selected_status = selectedStatus;
      if (fromDate) payload.from_date = fromDate;
      if (toDate) payload.to_date = toDate;

      const response = await axiosInstance.post(endpoints.exports.pipelines, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });
      logActivity('User exports pipeline record', moduleName || 'REPORTS');
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
    .map(() => ({ submitted: 0, pending: 0 }));

  pipelines.forEach((pipeline) => {
    const createdYear = new Date(pipeline.created_at).getFullYear();
    if (createdYear === selectedYear) {
      const monthIndex = new Date(pipeline.created_at).getMonth();
      if (pipeline.status === 'submitted') {
        monthlyData[monthIndex].submitted += parseFloat(pipeline.worth);
      } else if (pipeline.status === 'pending') {
        monthlyData[monthIndex].pending += parseFloat(pipeline.worth);
      }
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
      name: 'Submitted',
      data: monthlyData.map((data) => data.submitted),
    },
    {
      name: 'Pending',
      data: monthlyData.map((data) => data.pending),
    },
  ];

  const getStatusColor = (theme, pipelineStatus) => {
    switch (pipelineStatus?.toLowerCase()) {
      case 'approved':
        return theme.palette.success.main;
      case 'rejected':
        return theme.palette.error.main;
      case 'submitted':
        return theme.palette.info.main;
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
        heading="Create Pipline"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'pipline' }]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Grid container spacing={2}>
        {/* Select Company Dropdown */}
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Select Company</InputLabel>
            <Select
              multiple
              value={selectedCompanies}
              onChange={handleCompanyChange}
              renderValue={(selected) =>
                selected
                  .map((id) => companies.find((company) => company.id === id)?.name)
                  .join(', ')
              }
              label="Select Company"
            >
              {companies.length > 0 ? (
                companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>
                    <Checkbox checked={selectedCompanies.indexOf(company.id) > -1} />
                    <ListItemText primary={company.name} />
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No Companies available</MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>

        {/* Select Contact Dropdown */}
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Select Contact</InputLabel>
            <Select
              multiple
              value={selectedContacts}
              onChange={handleContactChange}
              renderValue={(selected) =>
                selected
                  .map((id) => contacts.find((contact) => contact.id === id)?.client_first_name)
                  .join(', ')
              }
              label="Select Contact"
            >
              {loading && <MenuItem disabled>Loading contacts...</MenuItem>}

              {!loading &&
                contacts.length > 0 &&
                contacts.map((contact) => (
                  <MenuItem key={contact.id} value={contact.id}>
                    <Checkbox checked={selectedContacts.includes(contact.id)} />
                    <ListItemText primary={contact.client_first_name} />
                  </MenuItem>
                ))}

              {!loading && contacts.length === 0 && (
                <MenuItem disabled>No Contacts available</MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>

        {/* Project Name TextField */}
        <Grid item xs={12} md={3}>
          <TextField
            label="Project Name"
            fullWidth
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </Grid>

        {/* Worth TextField */}
        <Grid item xs={12} md={3}>
          <TextField
            label="Worth"
            fullWidth
            value={worth}
            onChange={(e) => setWorth(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={handleSubmit} size="small">
            Save
          </Button>
        </Grid>
      </Grid>

      {/* Filter Section */}
      {(userRole === 'Sales Manager' ||
        userRole === 'Admin' ||
        userRole === 'Sales Representative') && (
        <Box sx={{ display: 'flex', justifyContent: 'left', mt: 4 }}>
          {/* Profile Filter - Only for Sales Manager & Admin */}
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
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}
              >
                {profileOptions.map((profile) => (
                  <MenuItem key={profile.id} value={profile.id}>
                    <Checkbox checked={selectedProfileIds.indexOf(profile.id) > -1} />
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

          {/* Status Filter - Visible to All Roles */}
          <FormControl variant="outlined" sx={{ minWidth: 200, left: '10px' }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              multiple
              value={selectedStatus}
              onChange={handleStatusFilterChange}
              input={<OutlinedInput label="Filter by Status" />}
              renderValue={(selected) =>
                selected.length > 0 ? `${selected.length} statuses selected` : 'All Statuses'
              }
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                  },
                },
              }}
            >
              <MenuItem value="pending">
                <Checkbox checked={selectedStatus.indexOf('pending') > -1} />
                <ListItemText primary="Pending" />
              </MenuItem>
              <MenuItem value="submitted">
                <Checkbox checked={selectedStatus.indexOf('submitted') > -1} />
                <ListItemText primary="Submitted" />
              </MenuItem>
            </Select>
          </FormControl>

          {/* Date Range Filter - Visible to All Roles */}
          <Box sx={{ marginLeft: '20px' }}>
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
              sx={{ minWidth: 150, marginLeft: '10px' }}
            />

            <Button
              variant="contained"
              onClick={applyDateFilter}
              sx={{ height: '40px', mt: '10px', marginLeft: '10px' }}
            >
              Apply
            </Button>

            <Button
              variant="outlined"
              onClick={clearFilters}
              sx={{
                height: '30px',
                mt: '13px',
                marginLeft: '10px',
                color: 'text.secondary',
                borderColor: 'divider',
                '&:hover': {
                  borderColor: 'primary.main',
                },
              }}
            >
              Clear Filters
            </Button>
          </Box>
        </Box>
      )}

      <Box sx={{ position: 'relative', width: '100%', margin: 0 }}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={handleExport}
          sx={{
            position: 'absolute',
            right: { xs: 0, sm: 0 },
            top: -25,
            minWidth: 100,
            px: 3,
            py: 1,
            fontSize: { xs: '0.8rem', sm: '1rem' },
            margin: '8px',
            transform: 'none',
          }}
        >
          Export
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          marginTop: '20px',
          maxHeight: '500px',
          overflow: 'auto',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              {/* Conditionally render "User Name" column only for Sales Manager */}
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
                    {userRole === 'Admin' ||
                    userRole === 'Sales Manager' ||
                    userRole === 'Sales Representative' ? (
                      <Select
                        value={pipeline.status ? pipeline.status.toLowerCase() : 'pending'}
                        onChange={(e) => {
                          handleStatusUpdate(pipeline.id, e.target.value);
                        }}
                        size="small"
                        sx={{
                          width: 120,
                          fontWeight: 600,
                          borderWidth: '2px',
                          borderColor: (theme) => getStatusColor(theme, pipeline.status),
                          color: (theme) => getStatusColor(theme, pipeline.status),
                          '& .MuiSelect-icon': {
                            color: (theme) => getStatusColor(theme, pipeline.status),
                          },
                          '&:hover': {
                            backgroundColor: (theme) =>
                              alpha(getStatusColor(theme, pipeline.status), 0.1),
                          },
                        }}
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                        {(userRole === 'Admin' || userRole === 'Sales Manager') && (
                          <MenuItem value="approved">Approved</MenuItem>
                        )}
                        {/* {(userRole === 'Admin' || userRole === 'Sales Manager') && (
                          <MenuItem value="rejected">Reject</MenuItem>
                        )} */}
                        <MenuItem value="submitted">Submitted</MenuItem>
                      </Select>
                    ) : (
                      <Tooltip title={`Status: ${pipeline.status || 'Pending'}`} arrow>
                        <Chip
                          label={(() => {
                            if (pipeline.status === 'submitted') {
                              return 'Submitted';
                            }
                            if (pipeline.status === 'rejected') return 'Rejected';
                            if (pipeline.status) {
                              return (
                                pipeline.status.charAt(0).toUpperCase() + pipeline.status.slice(1)
                              );
                            }
                            return 'Pending';
                          })()}
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
                              approved: <CheckCircleOutline fontSize="small" />,
                              rejected: <ErrorOutline fontSize="small" />,
                              submitted: <Send fontSize="small" />,
                            }[pipeline.status] || <AccessTime fontSize="small" />
                          }
                        />
                      </Tooltip>
                    )}
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
                Quarterly Pipeline Valuation
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
                sx={{ height: 350 }} // Adjust height as needed
              />
            </Card>
          </Grid>

          {/* Right Side - Yearly Analysis */}
          <Grid item xs={12} md={8} lg={8}>
            <Card sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
              <AppAreaInstalled
                title="Yearly Pipeline Analysis"
                subheader={`(${selectedYear}) Analysis Data`}
                chart={{
                  categories: chartCategories,
                  series: chartSeries,
                  availableYears: allYears,
                }}
                onYearChange={(year) => setSelectedYear(year)}
                sx={{ height: 400 }} // Adjust height as needed
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

UserPiplineView.propTypes = {
  moduleName: PropTypes.string,
};
