// @mui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
// _mock
import { _ecommerceSalesOverview } from 'src/_mock';
// components
import { useSettingsContext } from 'src/components/settings';
// assets
//
import EcommerceSaleByGender from '../ecommerce-sale-by-gender';
import EcommerceSalesOverview from '../ecommerce-sales-overview';
import EcommerceWidgetSummary from '../ecommerce-widget-summary';
import EcommerceYearlySales from '../ecommerce-yearly-sales';

// ----------------------------------------------------------------------

export default function OverviewEcommerceView() {
  const { user } = useMockedUser();

  const theme = useTheme();

  const settings = useSettingsContext();

  return (
    <Container maxWidth=""sx={{ paddingBottom: '60px' }}>
      <Grid container spacing={3}>
        {/* <Grid xs={12} md={8} sx={{ height: '240px', display: 'flex', alignItems: 'center' }}>
          <EcommerceWelcome
            title={`Congratulations! \n ${user?.displayName}`}
            description="Best seller of the month You have done 57.6% more sales today."
            img={<MotivationIllustration />}
          />
        </Grid>

        <Grid xs={12} md={4} sx={{ height: '240px' }}>
          <EcommerceNewProducts list={_ecommerceNewProducts} />
        </Grid> */}

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

        <Grid xs={12} md={6} lg={4}>
          <EcommerceSaleByGender
            title="Sale By Users"
            total={2324}
            chart={{
              series: [
                { label: 'Mens', value: 44 },
                { label: 'Womens', value: 75 },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <EcommerceYearlySales
            title="Yearly Sales"
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
                      name: 'Total Income',
                      data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
                    },
                    {
                      name: 'Total Expenses',
                      data: [10, 34, 13, 56, 77, 88, 99, 77, 45, 13, 56, 77],
                    },
                  ],
                },
                {
                  year: '2020',
                  data: [
                    {
                      name: 'Total Income',
                      data: [51, 35, 41, 10, 91, 69, 62, 148, 91, 69, 62, 49],
                    },
                    {
                      name: 'Total Expenses',
                      data: [56, 13, 34, 10, 77, 99, 88, 45, 77, 99, 88, 77],
                    },
                  ],
                },
              ],
            }}
          />
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
