import { Helmet } from 'react-helmet-async';
// sections
import { UserCompanyyView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function CompanyInactiveListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: User List</title>
      </Helmet>

      <UserCompanyyView />
    </>
  );
}
