import { Helmet } from 'react-helmet-async';
// sections
import { UserNotificationView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function NotificationPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: User List</title>
      </Helmet>

      <UserNotificationView />
    </>
  );
}
