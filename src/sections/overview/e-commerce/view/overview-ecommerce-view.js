import { useCallback, useEffect, useRef, useState } from 'react';
// @mui
import {
  Button,
  Card,
  Checkbox,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
// hooks
// _mock
// components
import { useSettingsContext } from 'src/components/settings';
// assets
//
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { useSnackbar } from 'src/components/snackbar';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { logActivity } from 'src/utils/log-activity';
import EcommerceSaleByGender from '../ecommerce-sale-by-gender';
import EcommerceSalesOverview from '../ecommerce-sales-overview';
import EcommerceWidgetSummary from '../ecommerce-widget-summary';
import EcommerceYearlySales from '../ecommerce-yearly-sales';

// ----------------------------------------------------------------------

export default function OverviewEcommerceView({ moduleName }) {
  const theme = useTheme();
  const settings = useSettingsContext();
  const logSentRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const [role, setRole] = useState('');
  const [pipelines, setPipelines] = useState([]);
  const [selectedUserComparison, setSelectedUserComparison] = useState([]);
  const [pendingWorth, setPendingWorth] = useState(0);
  const [approvedWorth, setapproved_total_worth] = useState(0);
  const [submittedWorth, setsubmitted_total_count] = useState(0);
  const [targetWorth, settarget_total_count] = useState(0);
  const [remainingWorth, setRemainingWorth] = useState(0);
  const [percentageWorth, setPercentage] = useState('');
  const [approvedPercentageWorth, setApprovedPercentage] = useState('');
  const [pendingApprovals, setPendingApprovals] = useState('');
  const [ecommerceSalesOverview, setEcommerceSalesOverview] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  useEffect(() => {
    if (!logSentRef.current) {
      const dynamicModuleName = moduleName || 'Sales Metrics Module';
      logActivity('User view Sales Metrics', dynamicModuleName);
      logSentRef.current = true;
    }

    const fetchPipelines = async () => {
      if (!role) return;
      setLoading(true);
      try {
        const userId = localStorage.getItem('userid');
        const token = localStorage.getItem('authToken');
        const roleParam = role?.toLowerCase().replace(/\s+/g, '_') || 'unknown_role';
        const params = {
          user_id: userId,
          role: roleParam,
          // pipemod: true,
          dash: true,
          ...(role === 'Sales Representative' || role === 'Admin'),
        };

        const response = await axiosInstance.get(endpoints.get.pipeline, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params,
        });
        const filteredPipelines =
          role === 'Admin'
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

        const approvedPipelines = response.data.filter(
          (pipeline) => pipeline.status === 'approved'
        );
        setPipelines(approvedPipelines);
      } catch (error) {
        console.error('Error fetching pipelines:', error);
        enqueueSnackbar('Failed to fetch pipelines.', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchPipelines();
  }, [enqueueSnackbar, role, moduleName]);

  const fetchPendingWorth = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userRole = localStorage.getItem('userRole');
      const userId = localStorage.getItem('userid');

      if ((userRole === 'Sales Representative' || userRole === 'Sales Manager') && !userId) {
        console.error('User ID is missing for role:', userRole);
        return;
      }

      const params = {};
      if (userRole === 'Sales Representative') {
        params.userId = userId;
      } else if (userRole === 'Sales Manager') {
        const allUserIds = allUsers.map((user) => user.id);
        params.userId = [userId, ...allUserIds].join(',');
        params['get-corresponding'] = true;
      }
      const response = await axiosInstance.get(endpoints.get.pending, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      const data = response.data;
      setPendingWorth(parseFloat(data.total_worth));
      setapproved_total_worth(data.approved_total_worth);
      setsubmitted_total_count(data.submitted_count);
      settarget_total_count(parseFloat(data.total_targeted_value));
      setRemainingWorth(parseFloat(data.remaining_target_value));
      setPercentage(parseFloat(data.percentage_change));
      setApprovedPercentage(parseFloat(data.approved_percentage_change));
      setPendingApprovals(parseFloat(data.submitted_count_last_week));
      const overviewData = [
        { label: 'Weekly Pending Pipelines Worth ', value: Number(data.pending_today_total) },
        { label: 'Weekly Approved Pipelines Worth ', value: Number(data.approved_today_total) },
        { label: 'Weekly Submitted Pipelines Worth ', value: Number(data.submitted_today_total) },
      ];
      setEcommerceSalesOverview(overviewData);
    } catch (error) {
      console.error('Error fetching pending worth:', error);
    }
  }, [allUsers]);

  const Role = localStorage.getItem('userRole');

  useEffect(() => {
    if (Role === 'Sales Manager' && allUsers.length === 0) {
      return;
    }
    fetchPendingWorth();
  }, [fetchPendingWorth, allUsers, Role]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userId = localStorage.getItem('userid');
        const logedrole = localStorage.getItem('userRole');
        const params = { userId };
        if (logedrole === 'Sales Manager') {
          params.isManager = true;
        }

        const response = await axiosInstance.get(endpoints.admin.details, { params });

        const activeUsers = response.data.map((user) => ({
          id: user.id,
          profile_id: user.profile_id,
          name: user.full_name,
        }));

        setAllUsers(activeUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const token = localStorage.getItem('authToken');
  const logedRole = localStorage.getItem('userRole');
  const isFirstRender = useRef(true);
  const fetchData = useCallback(async () => {
    try {
      const response = await axiosInstance.get(endpoints.get.pending, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          profile_id: selectedUser.length > 0 ? selectedUser.join(',') : null,
          from_date: fromDate ? dayjs(fromDate).format('YYYY-MM-DD') : null,
          to_date: toDate ? dayjs(toDate).format('YYYY-MM-DD') : null,
        },
      });

      const data = response.data;

      setPendingWorth(data.total_worth || 0);
      setapproved_total_worth(data.approved_total_worth || 0);
      setsubmitted_total_count(data.submitted_count || 0);
      settarget_total_count(data.total_targeted_value || 0);
      setRemainingWorth(parseFloat(data.remaining_target_value || 0));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [selectedUser, fromDate, toDate, token]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (
      (logedRole === 'Sales Manager' || logedRole === 'Admin') &&
      (selectedUser || fromDate || toDate)
    ) {
      fetchData();
    }
  }, [fetchData, selectedUser, fromDate, toDate, logedRole]);

  const availableUsers = pipelines.reduce((acc, pipeline) => {
    if (pipeline.profile_name) {
      if (!acc.find((u) => u.name === pipeline.profile_name)) {
        acc.push({ id: pipeline.id, name: pipeline.profile_name });
      }
    }
    return acc;
  }, []);

  const approvedPipelines = pipelines.filter((record) => record.status === 'approved');

  const monthlyDataByUser = {};
  approvedPipelines.forEach((record) => {
    const monthIndex = new Date(record.created_at).getMonth();
    const userName = record.profile_name || 'Unknown User';
    if (!monthlyDataByUser[userName]) {
      monthlyDataByUser[userName] = Array(12).fill(0);
    }
    monthlyDataByUser[userName][monthIndex] += parseFloat(record.worth);
  });

  const series = Object.keys(monthlyDataByUser).map((userName) => ({
    name: userName,
    data: monthlyDataByUser[userName],
  }));

  const filteredSeries =
    selectedUserComparison.length > 0
      ? series.filter((serie) => selectedUserComparison.includes(serie.name))
      : series;

  const chartData = {
    categories: [
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
    ],
    series: filteredSeries,
  };
  const userRole = localStorage.getItem('userRole');
  return (
    <Container maxWidth="" sx={{ paddingBottom: '60px' }}>
      {(userRole === 'Sales Manager' || userRole === 'Admin') && (
        <Grid container spacing={2} sx={{ mb: 5 }}>
          <Grid item xs={12} md={6} lg={2}>
            <FormControl fullWidth>
              <InputLabel>Select Users</InputLabel>
              <Select
                multiple
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                label="Select Users"
                renderValue={(selected) => {
                  if (!selected.length) return 'All Users';
                  return selected.map((id) => allUsers.find((u) => u.id === id)?.name).join(', ');
                }}
              >
                <MenuItem value="">
                  <Checkbox checked={selectedUser.length === 0} />
                  All Users
                </MenuItem>
                {allUsers.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    <Checkbox checked={selectedUser.includes(user.id)} />
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6} lg={6}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <DatePicker
                label="From Date"
                value={fromDate}
                onChange={(newValue) => setFromDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              <DatePicker
                label="To Date"
                value={toDate}
                onChange={(newValue) => setToDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={fetchData}
                sx={{
                  width: '120px',
                  height: '35px',
                  marginTop: '10px',
                }}
              >
                Apply
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setFromDate(null);
                  setSelectedUser([]);
                  setToDate(null);
                  fetchPendingWorth();
                }}
                sx={{
                  width: '120px',
                  height: '35px',
                  marginTop: '10px',
                }}
              >
                Clear
              </Button>
            </Stack>
          </Grid>
        </Grid>
      )}
      <Grid container spacing={3}>
        <Grid xs={12} md={4} sx={{ height: '200px', display: 'flex', alignItems: 'center' }}>
          <EcommerceWidgetSummary
            title="Generated Sales - Yearly Report"
            percent={approvedPercentageWorth}
            total={approvedWorth}
            chart={{
              colors: [theme.palette.info.light, theme.palette.info.main],
              series: [],
            }}
          />
        </Grid>
        <Grid xs={12} md={4} sx={{ height: '200px', display: 'flex', alignItems: 'center' }}>
          <EcommerceWidgetSummary
            title="Current Year Pending Pipelines"
            percent={percentageWorth}
            total={pendingWorth}
            chart={{
              series: [],
            }}
          />
        </Grid>
        <Grid xs={12} md={4} sx={{ height: '180px', display: 'flex', alignItems: 'center' }}>
          <EcommerceWidgetSummary
            title="Submitted Pipelines - Awaiting Approval"
            percent={pendingApprovals}
            total={submittedWorth}
            chart={{
              colors: [theme.palette.warning.light, theme.palette.warning.main],
              series: [],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4} mt={3} sx={{ height: '300px' }}>
          {targetWorth > 0 ? (
            <EcommerceSaleByGender
              title="Total Targets"
              targetWorth={targetWorth}
              remainingWorth={remainingWorth}
            />
          ) : null}
        </Grid>

        <Grid item xs={12} md={3} lg={8} mb={3}>
          <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2, height: '100%' }}>
            <EcommerceYearlySales
              title="Sales Comparison"
              subheader="Comparison between users sales"
              chart={chartData}
              availableUsers={availableUsers}
              onUserChange={(selected) => setSelectedUserComparison(selected)}
            />
          </Card>
        </Grid>
        <Grid xs={12} md={12} lg={12} sx={{ mt: 0 }}>
          <EcommerceSalesOverview title="Weekly Pipeline Summary" data={ecommerceSalesOverview} />
        </Grid>
      </Grid>
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

OverviewEcommerceView.propTypes = {
  moduleName: PropTypes.string,
};
