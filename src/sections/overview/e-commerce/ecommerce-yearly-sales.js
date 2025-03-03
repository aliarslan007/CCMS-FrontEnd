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
import { usePopover } from 'src/components/custom-popover';

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

  const popover = usePopover();

  const theme = useTheme();

  const [selectedUsers, setSelectedUsers] = useState([]);

  const [seriesData, setSeriesData] = useState('2019');

  const [openPopover, setOpenPopover] = useState(false);

  const chartOptions = useChart({
    colors: chart.colors || [theme.palette.primary.main, theme.palette.warning.main],
    chart: {
      sparkline: { enabled: false }, // Keep normal axes
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
    // 2) Add line-specific options (stroke, markers, etc.)
    stroke: {
      curve: 'smooth', // makes the lines smoother
      width: 3, // line thickness
    },
    markers: {
      size: 4, // marker size for each data point
      hover: {
        size: 6,
      },
    },
    dataLabels: {
      enabled: false, // or `true` if you want numeric labels on each point
    },
    // Remove or ignore any bar-specific options here
    // e.g., plotOptions.bar is not needed for line charts
    ...chart.options,
  });

  const handleChangeUsers = (event) => {
    const value = event.target.value;
    setSelectedUsers(value);
    onUserChange(value);
  };

  return (
    <>
      <Card {...other}>
        <CardHeader
          title={title}
          subheader={subheader}
          action={
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
          }
        />
        {/* 4) Change the chart type to "line" */}
        <Box sx={{ mt: 5, mx: 5, position: 'relative', overflow: 'visible' }}>
          <Chart type="line" series={chart.series} options={chartOptions} height={190} />
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
