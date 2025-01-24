import { Helmet } from 'react-helmet-async';
// sections
import { OverviewContactAccountView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function contactaccount() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Contact Account</title>
      </Helmet>

      <OverviewContactAccountView />
    </>
  );
}
