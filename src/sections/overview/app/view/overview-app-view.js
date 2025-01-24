import { useState, useEffect } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
// _mock
import { _appFeatured, _appAuthors, _appInstalled, _appRelated, _appInvoices } from 'src/_mock';
// components
import { useSettingsContext } from 'src/components/settings';
// assets
import { SeoIllustration } from 'src/assets/illustrations';
//
import AppWidget from '../app-widget';
import AppWelcome from '../app-welcome';
import AppFeatured from '../app-featured';
import AppNewInvoice from '../app-new-invoice';
import AppTopAuthors from '../app-top-authors';
import AppTopRelated from '../app-top-related';
import AppAreaInstalled from '../app-area-installed';
import AppWidgetSummary from '../app-widget-summary';
import AppCurrentDownload from '../app-current-download';
import AppTopInstalledCountries from '../app-top-installed-countries';

// ----------------------------------------------------------------------

export default function OverviewAppView() {
  const { user } = useMockedUser();

  const theme = useTheme();

  const settings = useSettingsContext();

  const [role, setRole] = useState('');

  useEffect(() => {
    const storedRole = sessionStorage.getItem('userRole');
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  return (
    <Container maxWidth=""sx={{ paddingBottom: '60px' }}>
      <Grid container spacing={3}>
        <Grid xs={12} md={8} sx={{ height: '240px', display: 'flex', alignItems: 'center' }}>
          <AppWelcome
            title={`Welcome back 👋 \n ${role}`}
            description="If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything."
            img={<SeoIllustration />}
          />
        </Grid>

        <Grid xs={12} md={4} sx={{ height: '240px' }}>
          <AppFeatured list={_appFeatured} />
        </Grid>

        <Grid xs={12} md={3.5}>
          <AppWidgetSummary
            title="Total Active Users"
            percent={2.6}
            total={18765}
            chart={{
              series: [5, 18, 12, 51, 68, 11, 39, 37, 27, 20],
            }}
          />
        </Grid>

        <Grid xs={12} md={3.5}>
          <AppWidgetSummary
            title="Total Sales"
            percent={-0.1}
            total={678}
            chart={{
              colors: [theme.palette.warning.light, theme.palette.warning.main],
              series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31],
            }}
          />
        </Grid>

        <Grid xs={12} md={4}>
          {/* <AppWidgetSummary
            title="Total Ins"
            percent={0.2}
            total={4876}
            chart={{
              colors: [theme.palette.info.light, theme.palette.info.main],
              series: [20, 41, 63, 33, 28, 35, 50, 46, 11, 26],
            }}
          /> */}
        </Grid>

        <Grid xs={12} md={6} lg={3.5}>
          <AppCurrentDownload
            title="Current Sales"
            chart={{
              series: [
                { label: 'June', value: 12244 },
                { label: 'July', value: 53345 },
                { label: 'Novemeber', value: 44313 },
                { label: 'October', value: 78343 },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={3} lg={8} sx={{ padding: '18px', paddingBottom: '1px' }}>
          <AppAreaInstalled
            title="Area Sales"
            subheader="(+43%) than last year"
            chart={{
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
              series: [
                {
                  year: '2019',
                  data: [
                    {
                      name: 'Area',
                      data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
                    },
                    {
                      name: 'Area',
                      data: [10, 34, 13, 56, 77, 88, 99, 77, 45, 13, 56, 77],
                    },
                  ],
                },
                {
                  year: '2020',
                  data: [
                    {
                      name: 'Area',
                      data: [51, 35, 41, 10, 91, 69, 62, 148, 91, 69, 62, 49],
                    },
                    {
                      name: 'Area',
                      data: [56, 13, 34, 10, 77, 99, 88, 45, 77, 99, 88, 77],
                    },
                  ],
                },
              ],
            }}
          />
        </Grid>
      </Grid>
      <Box>
        <Grid container>{/* Your content */}</Grid>
        <Box
          component="footer"
          sx={{
            marginTop: '70px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50px',
            left: '170px',
            position: 'fixed',
            bottom: 0,
            width: '80%',
            zIndex: 1300,
            backgroundColor: 'white',
          }}
        >
          <Typography variant="body2" color="textSecondary">
            &copy; {new Date().getFullYear()}
            <strong>www.SoluComp.com</strong> v1.0
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
