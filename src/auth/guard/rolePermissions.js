export const rolePermissions = {
    Admin: [
        '/dashboard',
        '/dashboard/ecommerce',
        '/dashboard/saleslist',
        '/dashboard/user/mycompany',
        '/dashboard/user/list',
        '/dashboard/user/new',
        '/dashboard/user/account',
        '/dashboard/user/mycompany',
        '/dashboard/user/companylist',
        '/dashboard/user/company',
        '/dashboard/user/contactaccount',
        '/dashboard/user/companycontact',
        '/dashboard/analytics',
        '/dashboard/user/permission',
        '/dashboard/user/deletion',
        '/dashboard/user/inactivelist',       
      // Add a routes an admin can access
    ],
    SalesManager: [
      '/dashboard',
      '/dashboard/ecommerce',
      '/dashboard/saleslist',
      '/dashboard/user/mycompany',
      // Add a routes a sales manager can access
    ],
    SalesRepresentative: [
        '/dashboard',
        '/dashboard/ecommerce',
        '/dashboard/saleslist',
        '/dashboard/user/mycompany',
      // Add a routes a sales representative can access
    ],
  };