import { Helmet } from 'react-helmet-async';
// sections
import { UserGenSalesView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function GenSalesPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: User List</title>
      </Helmet>

      <UserGenSalesView />
    </>
  );
}
