// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import UserCompanyContactEditForm from '../user-companycontact-edit-form';

// ----------------------------------------------------------------------

export default function UserCompnayContactView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth="">
      <CustomBreadcrumbs
        heading="Create Contact"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          { name: 'New Contact' },
        ]}
        sx={{
          mb: { xs: 3, md: 2 },
        }}
      />

      <UserCompanyContactEditForm />
    </Container>
  );
}
