import { Helmet } from 'react-helmet-async';
// sections
import { OverviewSalesListView } from 'src/sections/overview/saleslist/view';

// ----------------------------------------------------------------------

export default function OverviewSalesListPage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: My Companies</title>
      </Helmet>

      <OverviewSalesListView />
    </>
  );
}
