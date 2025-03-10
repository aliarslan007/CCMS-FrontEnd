import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import {
  Card,
  CardHeader,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from '@mui/material';
import Box from '@mui/material/Box';

// components
import { useTheme } from '@mui/material/styles';
import Chart, { useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

export default function EcommerceYearlySales({
  title,
  subheader,
  chart,
  availableUsers,
  onUserChange,
  ...other
}) {
  const { colors, categories, series, options } = chart;

  const theme = useTheme();

  const [selectedUsers, setSelectedUsers] = useState([]);

  const chartOptions = useChart({
    colors: chart.colors || [theme.palette.primary.main, theme.palette.warning.main],
    chart: {
      sparkline: { enabled: false },
    },
    xaxis: {
      categories: chart.categories,
      labels: { show: true },
    },
    yaxis: {
      labels: {
        formatter: (val) => `$${val.toLocaleString()}`,
      },
      forceNiceScale: true,
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val) => `$${val.toLocaleString()}`,
      },
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    markers: {
      size: 4,
      hover: {
        size: 6,
      },
    },
    dataLabels: {
      enabled: false,
    },
    ...chart.options,
  });

  const handleChangeUsers = (event) => {
    const value = event.target.value;
    setSelectedUsers(value);
    onUserChange(value);
  };

  const userRole = localStorage.getItem('userRole');

  return (
    <>
      <Card {...other}>
        <CardHeader
          title={title}
          subheader={subheader}
          action={
            userRole === 'Admin' || userRole === 'Sales Manager' ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Select Users</InputLabel>
                  <Select
                    multiple
                    value={selectedUsers}
                    onChange={handleChangeUsers}
                    renderValue={(selected) => selected.join(', ')}
                    label="Select Users"
                  >
                    {availableUsers.map((user) => (
                      <MenuItem key={user.id} value={user.name}>
                        <Checkbox checked={selectedUsers.indexOf(user.name) > -1} />
                        <ListItemText primary={user.name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            ) : null
          }
        />
        <Box
          sx={{
            flex: 1,
            p: { xs: 1, sm: 2, md: 3 },
            position: 'relative',
            minHeight: 250,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              '& > div': {
                width: '100%!important',
                height: '100%!important',
              },
            }}
          >
            <Chart
              type="line"
              series={chart.series}
              options={{
                ...chartOptions,
                chart: {
                  ...chartOptions.chart,
                  toolbar: { show: false },
                  zoom: { enabled: false },
                },
                responsive: [
                  {
                    breakpoint: 768,
                    options: {
                      chart: {
                        height: 250,
                      },
                      legend: {
                        position: 'bottom',
                      },
                    },
                  },
                  {
                    breakpoint: 480,
                    options: {
                      chart: {
                        height: 200,
                      },
                      legend: {
                        position: 'bottom',
                      },
                    },
                  },
                ],
                maintainAspectRatio: false,
              }}
              height="100%"
              width="100%"
            />
          </Box>
        </Box>
      </Card>
    </>
  );
}

EcommerceYearlySales.propTypes = {
  chart: PropTypes.object,
  subheader: PropTypes.string,
  title: PropTypes.string,
  availableUsers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
    })
  ),
  onUserChange: PropTypes.func,
};
