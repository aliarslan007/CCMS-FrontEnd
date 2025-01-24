import { Helmet } from 'react-helmet-async';
// sections
import { AccountUsers } from 'src/sections/account/view';

// ----------------------------------------------------------------------

export default function AccountPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Account Settings</title>
      </Helmet>

      <AccountUsers />
    </>
  );
}
