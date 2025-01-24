import { Helmet } from 'react-helmet-async';
// sections
import { UserPermissionView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function PermissionPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: User List</title>
      </Helmet>

      <UserPermissionView />
    </>
  );
}
