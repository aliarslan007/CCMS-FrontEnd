import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
// @mui
import { Box, Checkbox } from '@mui/material';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useTheme } from '@mui/material/styles';
// components
import Chart, { useChart } from 'src/components/chart';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function AppAreaInstalled({
  title,
  subheader,
  chart,
  onYearChange,
  onStateChange,
  selectedState,
  showStateSelect,
  ...other
}) {
  const theme = useTheme();

  const {
    colors = [
      [theme.palette.primary.light, theme.palette.primary.main],
      [theme.palette.warning.light, theme.palette.warning.main],
    ],
    categories,
    series,
    availableYears = [],
    availableStates = [],
    options,
  } = chart;

  const popover = usePopover();

  const [selectedYear, setSelectedYear] = useState(
    availableYears[0]?.toString() || new Date().getFullYear().toString()
  );

  const chartOptions = useChart({
    colors: colors.map((colr) => colr[1]),
    fill: {
      type: 'gradient',
      gradient: {
        colorStops: colors.map((colr) => [
          { offset: 0, color: colr[0] },
          { offset: 100, color: colr[1] },
        ]),
      },
    },
    xaxis: {
      categories,
    },
    ...options,
  });

  const handleChangeSeries = useCallback(
    (newValue) => {
      popover.onClose();
      setSelectedYear(newValue);
      onYearChange(parseInt(newValue, 10));
    },
    [popover, onYearChange]
  );

  return (
    <>
      <Card {...other}>
        <CardHeader
          title={title}
          subheader={subheader}
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Year Dropdown */}
              <ButtonBase
                onClick={popover.onOpen}
                sx={{
                  pl: 1,
                  py: 0.5,
                  pr: 0.5,
                  borderRadius: 1,
                  typography: 'subtitle2',
                  bgcolor: 'background.neutral',
                }}
              >
                {selectedYear}
                <Iconify
                  width={16}
                  icon={popover.open ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
                  sx={{ ml: 0.5 }}
                />
              </ButtonBase>

              {/* State Dropdown */}
              {showStateSelect && (
                <Select
                  multiple
                  value={selectedState || []}
                  onChange={(e) => onStateChange(e.target.value)}
                  displayEmpty
                  renderValue={(selected) =>
                    selected.length === 0 ? 'All States' : selected.join(', ')
                  }
                  sx={{ minWidth: 100, height: 30 }}
                >
                  {availableStates.map((state) => (
                    <MenuItem key={state} value={state}>
                      <Checkbox checked={selectedState.includes(state)} />
                      {state}
                    </MenuItem>
                  ))}
                </Select>
              )}
            </Box>
          }
        />

        <Box sx={{ mt: 3, mx: 3 }}>
          <Chart dir="ltr" type="line" series={series} options={chartOptions} height={170} />
        </Box>
      </Card>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 140 }}>
        {availableYears.map((year) => (
          <MenuItem
            key={year}
            selected={year.toString() === selectedYear}
            onClick={() => handleChangeSeries(year.toString())}
          >
            {year}
          </MenuItem>
        ))}
      </CustomPopover>
    </>
  );
}

AppAreaInstalled.propTypes = {
  chart: PropTypes.object,
  subheader: PropTypes.string,
  title: PropTypes.string,
  onYearChange: PropTypes.func,
  onStateChange: PropTypes.func,
  selectedState: PropTypes.string,
  showStateSelect: PropTypes.bool,
};
