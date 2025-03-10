import { Helmet } from 'react-helmet-async';
// sections
import { UserClientDeleteView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function ClientDeletePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Marked For Delete</title>
      </Helmet>

      <UserClientDeleteView />
    </>
  );
}
