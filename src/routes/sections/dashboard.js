import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
// auth
import ProtectedRoute from 'src/auth/guard/role-based-guard';
// layouts
import DashboardLayout from 'src/layouts/dashboard';
// components
import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

// OVERVIEW
const IndexPage = lazy(() => import('src/pages/dashboard/app'));
const OverviewEcommercePage = lazy(() => import('src/pages/dashboard/ecommerce'));
const OverviewSalesListPage = lazy(() => import('src/pages/dashboard/saleslist'));
const OverviewAnalyticsPage = lazy(() => import('src/pages/dashboard/analytics'));
const OverviewFilePage = lazy(() => import('src/pages/dashboard/file'));
// USER
const UserProfilePage = lazy(() => import('src/pages/dashboard/user/profile'));
const UserCardsPage = lazy(() => import('src/pages/dashboard/user/cards'));
const UserListPage = lazy(() => import('src/pages/dashboard/user/list'));
const CompanyListPage = lazy(() => import('src/pages/dashboard/user/companylist'));
const ContactAccount = lazy(() => import('src/pages/dashboard/user/contactaccount'));
const UserAccountPage = lazy(() => import('src/pages/dashboard/user/account'));
const UserAccountDetails = lazy(() => import('src/pages/dashboard/user/accountuser'));
const UserCreatePage = lazy(() => import('src/pages/dashboard/user/new'));
const UserCompanyPage = lazy(() => import('src/pages/dashboard/user/company'));
const UserCompanyContactPage = lazy(() => import('src/pages/dashboard/user/companycontact'));
const CompanyContactDetails = lazy(() => import('src/pages/dashboard/user/companycontactdetails'));
const AccountGeneral = lazy(() => import('src/pages/dashboard/user/companycontactdetailsedit'));
const UserDetails = lazy(() => import('src/pages/dashboard/user/userdetails'));
const MyCompany = lazy(() => import('src/pages/dashboard/user/mycompany'));
const InactiveListPage = lazy(() => import('src/pages/dashboard/user/inactivelist'));
const ClientListPage = lazy(() => import('src/pages/dashboard/user/clientInactivelist'));
const InactiveCompanyListPage = lazy(() => import('src/pages/dashboard/user/companyInactivlist'));
const DeletePage = lazy(() => import('src/pages/dashboard/user/deletion'));
const ClientDeletePage = lazy(() => import('src/pages/dashboard/user/client_deletion'));
const OrgChartPage = lazy(() => import('src/pages/dashboard/user/orgchart'));
const PermissionPage = lazy(() => import('src/pages/dashboard/user/permission'));
const PiplinePage = lazy(() => import('src/pages/dashboard/user/pipline'));
const TargetPage = lazy(() => import('src/pages/dashboard/user/target'));
const NotificationPage = lazy(() => import('src/pages/dashboard/user/notification'));
const GenSalesPage = lazy(() => import('src/pages/dashboard/user/gensales'));
const FollowupPage = lazy(() => import('src/pages/dashboard/user/followup'));
const CompanyDetailsInfo = lazy(() => import('src/pages/dashboard/user/companydetailsinfo'));
const CompanyDetailsInfoEdit = lazy(() =>
  import('src/pages/dashboard/user/companydetailsinfoedit')
);
const UserEditPage = lazy(() => import('src/pages/dashboard/user/edit'));
// FILE MANAGER
const FileManagerPage = lazy(() => import('src/pages/dashboard/file-manager'));
// TEST RENDER PAGE BY ROLE
const PermissionDeniedPage = lazy(() => import('src/pages/dashboard/permission'));
// BLANK PAGE
const BlankPage = lazy(() => import('src/pages/dashboard/blank'));

// ----------------------------------------------------------------------

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: (
      <DashboardLayout>
        <Suspense fallback={<LoadingScreen />}>
          <Outlet />
        </Suspense>
      </DashboardLayout>
    ),
    children: [
      { element: <IndexPage />, index: true },
      {
        path: 'ecommerce',
        element: (
          <ProtectedRoute allowedRoles={['Admin', 'Sales Manager', 'Sales Representative']}>
            <OverviewEcommercePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'analytics',
        element: (
          <ProtectedRoute allowedRoles={['Admin']}>
            <OverviewAnalyticsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'analytics',
        element: (
          <ProtectedRoute allowedRoles={['Admin', 'Sales Manager', 'Sales Representative']}>
            <OverviewSalesListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'saleslist',
        element: (
          <ProtectedRoute allowedRoles={['Admin', 'Sales Manager', 'Sales Representative']}>
            <OverviewSalesListPage />
          </ProtectedRoute>
        ),
      },
      { path: 'file', element: <OverviewFilePage /> },
      {
        path: 'user',
        children: [
          { element: <UserProfilePage />, index: true },
          { path: 'profile', element: <UserProfilePage /> },
          { path: 'cards', element: <UserCardsPage /> },
          {
            path: 'list',
            element: (
              <ProtectedRoute allowedRoles={['Admin']}>
                <UserListPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'companylist',
            element: (
              <ProtectedRoute allowedRoles={['Admin']}>
                <CompanyListPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'contactaccount',
            element: (
              <ProtectedRoute allowedRoles={['Admin']}>
                <ContactAccount />
              </ProtectedRoute>
            ),
          },
          {
            path: 'new',
            element: (
              <ProtectedRoute allowedRoles={['Admin']}>
                <UserCreatePage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'company',
            element: (
              <ProtectedRoute allowedRoles={['Admin', 'Sales Representative', 'Sales Manager']}>
                <UserCompanyPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'companycontact/:id',
            element: (
              <ProtectedRoute allowedRoles={['Admin', 'Sales Representative']}>
                <UserCompanyContactPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'companycontacts',
            element: (
              <ProtectedRoute allowedRoles={['Admin', 'Sales Representative', 'Sales Manager']}>
                <UserCompanyContactPage />
              </ProtectedRoute>
            ),
          },
          { path: 'companycontactdetailsedit/:id', element: <AccountGeneral /> },
          { path: 'companycontactdetails/:id', element: <CompanyContactDetails /> },
          { path: 'companydetailsinfo/:id', element: <CompanyDetailsInfo /> },
          { path: 'companydetailsinfoedit/:id', element: <CompanyDetailsInfoEdit /> },
          { path: 'userdetails', element: <UserDetails /> },
          { path: 'followup', element: <FollowupPage /> },
          {
            path: 'mycompany',
            element: (
              <ProtectedRoute allowedRoles={['Admin']}>
                <MyCompany />
              </ProtectedRoute>
            ),
          },
          {
            path: 'inactivelist',
            element: (
              <ProtectedRoute allowedRoles={['Admin', 'Sales Manager']}>
                <InactiveListPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'Clientinactivelist',
            element: (
              <ProtectedRoute allowedRoles={['Admin', 'Sales Manager']}>
                <ClientListPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'companyInactivlist',
            element: (
              <ProtectedRoute allowedRoles={['Admin', 'Sales Manager']}>
                <InactiveCompanyListPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'orgchartpage',
            element: (
              <ProtectedRoute allowedRoles={['Admin', 'Sales Manager', 'Sales Representative']}>
                <OrgChartPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'deletion',
            element: (
              <ProtectedRoute allowedRoles={['Admin', 'Sales Manager']}>
                <DeletePage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'client_deletion',
            element: (
              <ProtectedRoute allowedRoles={['Admin', 'Sales Manager']}>
                <ClientDeletePage />
              </ProtectedRoute>
            ),
          },
          { path: 'orgchart', element: <OrgChartPage /> },
          {
            path: 'permission',
            element: (
              <ProtectedRoute allowedRoles={['Admin', 'Sales Manager']}>
                <PermissionPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'pipline',
            element: (
              <ProtectedRoute allowedRoles={['Admin', 'Sales Manager', 'Sales Representative']}>
                <PiplinePage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'target',
            element: (
              <ProtectedRoute allowedRoles={['Admin', 'Sales Manager', 'Sales Representative']}>
                <TargetPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'notification',
            element: (
              <ProtectedRoute allowedRoles={['Admin', 'Sales Manager', 'Sales Representative']}>
                <NotificationPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'gensales',
            element: (
              <ProtectedRoute allowedRoles={['Admin', 'Sales Manager', 'Sales Representative']}>
                <GenSalesPage />
              </ProtectedRoute>
            ),
          },

          { path: ':id/edit', element: <UserEditPage /> },
          {
            path: 'account',
            element: (
              <ProtectedRoute allowedRoles={['Admin']}>
                <UserAccountPage />
              </ProtectedRoute>
            ),
          },
          { path: 'accountuser/:uuid', element: <UserAccountDetails /> },
        ],
      },

      { path: 'file-manager', element: <FileManagerPage /> },
      { path: 'permission', element: <PermissionDeniedPage /> },
      { path: 'blank', element: <BlankPage /> },
    ],
  },
];
