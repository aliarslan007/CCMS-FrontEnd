import { Helmet } from 'react-helmet-async';
// sections
import { UserCompanyListView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function CompanyListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: User List</title>
      </Helmet>

      <UserCompanyListView />
    </>
  );
}
