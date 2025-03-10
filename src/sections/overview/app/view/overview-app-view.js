import { useEffect, useRef, useState } from 'react';
// @mui
import { Box, Card } from '@mui/material';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
// _mock
// components
import { useSettingsContext } from 'src/components/settings';
// assets
import { SeoIllustration } from 'src/assets/illustrations';
//
import PropTypes from 'prop-types';
import { useSnackbar } from 'src/components/snackbar';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { logActivity } from 'src/utils/log-activity';
import AppAreaInstalled from '../app-area-installed';
import AppCurrentDownload from '../app-current-download';
import AppWelcome from '../app-welcome';
import AppWidgetSummary from '../app-widget-summary';

// ----------------------------------------------------------------------

export default function OverviewAppView({ moduleName }) {
  const { enqueueSnackbar } = useSnackbar();

  const { user } = useMockedUser();

  const theme = useTheme();

  const settings = useSettingsContext();

  const [role, setRole] = useState('');

  const [totalUsers, setTotalUsers] = useState(0);

  const [totalManager, setManager] = useState(0);

  const [totalRep, setRep] = useState(0);

  const [profileOptions, setProfileOptions] = useState([]);

  const [pipelines, setPipelines] = useState([]);

  const [loading, setLoading] = useState(false);

  const [selectedState, setSelectedState] = useState('');

  const logSentRef = useRef(false);

  useEffect(() => {
    if (!logSentRef.current) {
      const dynamicModuleName = moduleName || 'Dashboard Module';
      logActivity('User view dashboard', dynamicModuleName);
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

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  useEffect(() => {
    const fetchTotalUsers = async () => {
      try {
        const token = localStorage.getItem('authToken');

        const response = await axiosInstance.get(endpoints.users.counts, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.status === 'success') {
          setTotalUsers(response.data.data.total_users);
          setManager(response.data.data.sales_managers);
          setRep(response.data.data.sales_representatives);
        }
      } catch (error) {
        console.error('Error fetching total users:', error);
      }
    };

    fetchTotalUsers();
  }, []);

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

  const allStates = [
    ...new Set(
      pipelines.flatMap((pipeline) =>
        pipeline.company_contacts.flatMap((contact) => contact.states)
      )
    ),
  ];

  const monthlyData = Array(12)
    .fill(0)
    .map(() => ({ submitted: 0, pending: 0, approved: 0 }));

  pipelines.forEach((pipeline) => {
    const createdYear = new Date(pipeline.created_at).getFullYear();

    if (
      createdYear === selectedYear &&
      pipeline.status === 'approved' &&
      (!selectedState.length ||
        pipeline.company_contacts.some((contact) =>
          contact.states.some((state) => selectedState.includes(state))
        ))
    ) {
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

  return (
    <Container maxWidth="" sx={{ paddingBottom: '60px' }}>
      <Grid container spacing={3}>
        <Grid xs={12} md={8} sx={{ height: '240px', display: 'flex', alignItems: 'center' }}>
          <AppWelcome
            title={`Welcome back 👋 \n ${role}`}
            description="Welcome! Your dashboard is ready. Explore insights and manage your tasks effectively."
            img={<SeoIllustration />}
          />
        </Grid>

        <Grid xs={12} md={4} sx={{ height: '240px' }}>
          {/* <AppFeatured list={_appFeatured} /> */}
        </Grid>

        <Grid xs={12} md={3.5}>
          <AppWidgetSummary
            title="Registered Users In System"
            percent={2.6}
            total={totalUsers}
            chart={{
              series: [5, 18, 12, 51, 68, 11, 39, 37, 27, 20],
            }}
          />
        </Grid>

        <Grid xs={12} md={3.5}>
          <AppWidgetSummary
            title={
              role === 'Sales Manager'
                ? 'Reporting Sales Representative'
                : 'Registered Sales Representative In System'
            }
            percent={0.1}
            total={totalRep}
            chart={{
              colors: [theme.palette.warning.light, theme.palette.warning.main],
              series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31],
            }}
            sx={{ height: '170px' }} // Custom height here
          />
        </Grid>

        <Grid xs={12} md={3.5}>
          <AppWidgetSummary
            title="Registered Sales Manager In System"
            percent={0.1}
            total={totalManager}
            chart={{
              colors: [theme.palette.warning.light, theme.palette.warning.main],
              series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31],
            }}
          />
        </Grid>

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

        <Grid item xs={12} md={8} lg={8}>
          <Card sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
            <AppAreaInstalled
              title="Yearly Generated Sales Analysis"
              subheader={`(${selectedYear}) Analysis Data`}
              chart={{
                categories: chartCategories,
                series: chartSeries,
                availableYears: allYears,
                availableStates: allStates,
              }}
              onYearChange={setSelectedYear}
              onStateChange={setSelectedState}
              selectedState={selectedState}
              showStateSelect
              sx={{ height: 400 }}
            />
          </Card>
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

OverviewAppView.propTypes = {
  moduleName: PropTypes.string,
};
