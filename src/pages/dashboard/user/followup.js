import { Helmet } from 'react-helmet-async';
// sections
import { UserFollowUpView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function FollowupPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: User List</title>
      </Helmet>

      <UserFollowUpView />
    </>
  );
}
