// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import UserCompanyEditForm from '../user-company-edit-form';

// ----------------------------------------------------------------------

export default function UserCompnayView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth="">
      <CustomBreadcrumbs
        heading="Create Company"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          { name: 'New Compnay' },
        ]}
        sx={{
          mb: { xs: 3, md: 2 },
        }}
      />

      <UserCompanyEditForm />
    </Container>
  );
}
