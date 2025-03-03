import { useEffect, useRef, useState } from 'react';
// @mui
import { Card, Grid } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
// _mock
import { _ecommerceSalesOverview } from 'src/_mock';
// components
import { useSettingsContext } from 'src/components/settings';
// assets
//
import { useSnackbar } from 'src/components/snackbar';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { logActivity } from 'src/utils/log-activity';
import EcommerceSaleByGender from '../ecommerce-sale-by-gender';
import EcommerceSalesOverview from '../ecommerce-sales-overview';
import EcommerceWidgetSummary from '../ecommerce-widget-summary';
import EcommerceYearlySales from '../ecommerce-yearly-sales';

// ----------------------------------------------------------------------

export default function OverviewEcommerceView({ moduleName }) {
  const { user } = useMockedUser();

  const theme = useTheme();

  const settings = useSettingsContext();

  const [companyTypes, setCompanyTypes] = useState([]);

  const logSentRef = useRef(false);

  const [loading, setLoading] = useState(true);

  const { enqueueSnackbar } = useSnackbar();

  const [role, setRole] = useState('');

  const [pipelines, setPipelines] = useState([]);

  const [selectedUserComparison, setSelectedUserComparison] = useState([]);

  useEffect(() => {
    const storedRole = sessionStorage.getItem('userRole');
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
        const userId = sessionStorage.getItem('userid');
        const token = sessionStorage.getItem('authToken');
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

  const computePipelineStatusSeries = (data) => {
    const totalCount = data.length;
    const statusCount = data.reduce((acc, pipeline) => {
      const status = pipeline.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const statusSeries = Object.keys(statusCount).map((status) => ({
      label: status.charAt(0).toUpperCase() + status.slice(1),
      value: totalCount > 0 ? Math.round((statusCount[status] / totalCount) * 100) : 0,
    }));

    return { series: statusSeries, total: totalCount };
  };

  const pipelineStatusData = computePipelineStatusSeries(pipelines);

  return (
    <Container maxWidth="" sx={{ paddingBottom: '60px' }}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4} sx={{ height: '200px', display: 'flex', alignItems: 'center' }}>
          <EcommerceWidgetSummary
            title="Product Sold"
            percent={2.6}
            total={765}
            chart={{
              series: [22, 8, 35, 50, 82, 84, 77, 12, 87, 43],
            }}
          />
        </Grid>

        <Grid xs={12} md={4} sx={{ height: '200px', display: 'flex', alignItems: 'center' }}>
          <EcommerceWidgetSummary
            title="Sales Target Progress"
            percent={-0.1}
            total={18765}
            chart={{
              colors: [theme.palette.info.light, theme.palette.info.main],
              series: [56, 47, 40, 62, 73, 30, 23, 54, 67, 68],
            }}
          />
        </Grid>

        <Grid xs={12} md={4} sx={{ height: '200px', display: 'flex', alignItems: 'center' }}>
          <EcommerceWidgetSummary
            title="Sales Profit"
            percent={0.6}
            total={4876}
            chart={{
              colors: [theme.palette.warning.light, theme.palette.warning.main],
              series: [40, 70, 75, 70, 50, 28, 7, 64, 38, 27],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4} mt={3}>
          <EcommerceSaleByGender
            title="Sale By Users"
            total={pipelineStatusData.total}
            chart={{
              series: pipelineStatusData.series,
            }}
          />
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
          <EcommerceSalesOverview title="Sales Overview" data={_ecommerceSalesOverview} />
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
