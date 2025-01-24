import { Helmet } from 'react-helmet-async';
// sections
import { UserDeleteView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function DeletePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: User List</title>
      </Helmet>

      <UserDeleteView />
    </>
  );
}
