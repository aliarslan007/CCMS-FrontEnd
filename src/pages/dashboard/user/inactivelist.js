import { Helmet } from 'react-helmet-async';
// sections
import { UserInactiveListView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function InactiveListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: User List</title>
      </Helmet>

      <UserInactiveListView />
    </>
  );
}
