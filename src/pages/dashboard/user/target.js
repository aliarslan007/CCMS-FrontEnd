import { Helmet } from 'react-helmet-async';
// sections
import { UserTargetView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function TargetPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: User List</title>
      </Helmet>

      <UserTargetView />
    </>
  );
}
