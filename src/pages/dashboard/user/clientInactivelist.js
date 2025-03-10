import { Helmet } from 'react-helmet-async';
// sections
import { UserClinetListView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function ClientListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: User List</title>
      </Helmet>

      <UserClinetListView />
    </>
  );
}
