import { Helmet } from 'react-helmet-async';
// sections
import { UserCompnayContactView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function UserCompanyContactPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Create a new company</title>
      </Helmet>

      <UserCompnayContactView/>
    </>
  );
}

