import PropTypes from 'prop-types';
// @mui
import { styled, useTheme } from '@mui/material/styles';
import CardHeader from '@mui/material/CardHeader';
import Card from '@mui/material/Card';
// utils
import { fNumber } from 'src/utils/format-number';
// components
import Chart, { useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

const CHART_HEIGHT = 260;

const LEGEND_HEIGHT = 90;

const StyledChart = styled(Chart)(({ theme }) => ({
  height: CHART_HEIGHT,
  '& .apexcharts-canvas, .apexcharts-inner, svg, foreignObject': {
    height: `100% !important`,
  },
  '& .apexcharts-legend': {
    height: LEGEND_HEIGHT,
    borderTop: `dashed 1px ${theme.palette.divider}`,
    top: `calc(${CHART_HEIGHT - LEGEND_HEIGHT}px) !important`,
  },
}));

// ----------------------------------------------------------------------

export default function EcommerceTargetDonut({ title, targetWorth, remainingWorth, ...other }) {
  const theme = useTheme();
  const numericTarget = Number(targetWorth) || 0;
  const numericPending = Number(remainingWorth) || 0;

  const chartSeries = [numericTarget, numericPending];

  const chartOptions = useChart({
    chart: {
      type: 'donut',
      sparkline: { enabled: true },
    },
    labels: ['Total Target', 'Remaining'],
    colors: [theme.palette.success.main, theme.palette.warning.main],
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Target',
              formatter: (w) => {
                const total = w.config.series[0]; 
                return fNumber(total);
              },
            },
          },
        },
      },
    },
    legend: {
      floating: true,
      position: 'bottom',
      horizontalAlign: 'center',
    },
  });

  return (
    <Card {...other}>
      <CardHeader title={title} sx={{ pt: 1 }} />
      <StyledChart
        dir="ltr"
        type="donut"
        series={chartSeries}
        options={chartOptions}
        height={345}
      />
    </Card>
  );
}

EcommerceTargetDonut.propTypes = {
  title: PropTypes.string,
  targetWorth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  remainingWorth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};