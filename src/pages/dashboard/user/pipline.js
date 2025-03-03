import { Helmet } from 'react-helmet-async';
// sections
import { UserPiplineView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function PiplinePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: User List</title>
      </Helmet>

      <UserPiplineView />
    </>
  );
}
