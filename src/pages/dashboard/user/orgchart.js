import { Helmet } from 'react-helmet-async';
// sections
import { UserOrgChartView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function OrgChartPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: User List</title>
      </Helmet>

      <UserOrgChartView />
    </>
  );
}
