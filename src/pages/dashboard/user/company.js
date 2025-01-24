import { Helmet } from 'react-helmet-async';
// sections
import { UserCompanyView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function UserCompanyPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new company</title>
      </Helmet>

      <UserCompanyView  />
    </>
  );
}

