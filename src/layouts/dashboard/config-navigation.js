import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// routes
import { paths } from 'src/routes/paths';
// locales
import SvgColor from 'src/components/svg-color';
import { useLocales } from 'src/locales';
import { useAuth } from '../../auth/context/jwt/auth-context';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  // OR
  // <Iconify icon="fluent:mail-24-filled" />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
);

const ICONS = {
  job: icon('ic_job'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
  permission: icon('ic_permission'),
};

// ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useLocales();
  const { userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user'));

    if (!storedUser || !storedUser.role) {
      sessionStorage.clear();
      navigate('http://localhost:3030/ccms/');
    }
  }, [navigate]);

  // Memoized function to get subheader based on userRole
  const getSubheader = useCallback(() => {
    switch (userRole) {
      case 'Sales Representative':
        return 'Sales Representative';
      case 'Sales Manager':
        return 'Sales Manager';
      case 'Admin':
        return 'CCMS ADMIN PANEL';
      default:
        return 'Default Subheader';
    }
  }, [userRole]);

  // Memoized navigation data
  const data = useMemo(() => {
    const baseNav = [
      {
        subheader: getSubheader(),
        items: [
          {
            title: (
              <span
                style={{
                  paddingLeft: '15px',
                }}
              >
                {t('Dashboard')}
              </span>
            ),
            path: paths.dashboard.root,
            // icon: ICONS.dashboard,
          },
          {
            // title: t('Sales Metrics'),
            title: (
              <span
                style={{
                  paddingLeft: '15px',
                }}
              >
                {t('Sales Metrics')}
              </span>
            ),

            path: paths.dashboard.general.ecommerce,
            // icon: ICONS.ecommerce,
          },
          ...(userRole === 'Admin'
            ? [
                {
                  title: (
                    <span
                      style={{
                        paddingLeft: '15px',
                      }}
                    >
                      {t('My corporation')}
                    </span>
                  ),
                  path: paths.dashboard.user.mycompany,
                  // icon: ICONS.job,
                },
                {
                  title: (
                    <span
                      style={{
                        paddingLeft: '15px',
                      }}
                    >
                      {t('Admin Profile')}
                    </span>
                  ),
                  path: paths.dashboard.user.account,
                  // icon: ICONS.user,
                },
              ]
            : [
                {
                  title: (
                    <span
                      style={{
                        paddingLeft: '15px',
                      }}
                    >
                      {t('Client Companies')}
                    </span>
                  ),
                  path: paths.dashboard.general.saleslist,
                  // icon: ICONS.user,
                },
              ]),
          ...(userRole !== 'Admin'
            ? [
                {
                  title: (
                    <span
                      style={{
                        paddingLeft: '15px',
                      }}
                    >
                      {t('Follow ups')}
                    </span>
                  ),
                  path: paths.dashboard.user.followup,
                  icon: ICONS.ecommerce,
                },
              ]
            : []),
        ],
      },
    ];

    const managementNav = [
      // CCMS USER MANAGEMENT
      {
        subheader: t('CCMS USER MANAGEMENT'),
        items: [
          {
            title: (
              <span
                style={{
                  textAlign: 'left',
                  paddingLeft: '15px',
                  display: 'block',
                  paddingRight: '115px',
                }}
              >
                {t('Create User')}
              </span>
            ),
            path: paths.dashboard.user.new,
          },
          {
            title: (
              <span
                style={{
                  textAlign: 'left',
                  paddingLeft: '15px',
                  display: 'block',
                  paddingRight: '88px',
                }}
              >
                {t('View Users List')}
              </span>
            ),
            path: paths.dashboard.user.list,
          },
        ],
      },

      // CLIENT ACCOUNT MANAGEMENT
      {
        subheader: t('CLIENT ACCOUNT MANAGEMENT'),
        items: [
          {
            title: (
              <span
                style={{
                  textAlign: 'left',
                  paddingLeft: '15px',
                  display: 'block',
                  paddingRight: '75px',
                }}
              >
                {t('Client Companies')}
              </span>
            ),
            path: paths.dashboard.user.companylist,
          },
          {
            title: (
              <span
                style={{
                  display: 'block',
                  textAlign: 'left',
                  paddingLeft: '15px',
                  marginRight: '20px',
                }}
              >
                {t('Create Company Contacts')}
              </span>
            ),
            path: paths.dashboard.user.companycontact,
          },

          {
            title: (
              <span
                style={{
                  textAlign: 'left',
                  paddingLeft: '15px',
                  display: 'block',
                  paddingRight: '70px',
                }}
              >
                {t('Client Contact List')}
              </span>
            ),
            path: paths.dashboard.user.contactaccount,
          },
          {
            title: (
              <span
                style={{
                  display: 'block',
                  textAlign: 'left',
                  paddingLeft: '15px',
                  marginRight: '8px',
                }}
              >
                {t('Create New Client Company')}
              </span>
            ),
            path: paths.dashboard.user.company,
          },
        ],
      },

      // PERMISSION CONTROL
      {
        subheader: t('PERMISSION CONTROL'),
        items: [
          {
            title: (
              <span
                style={{
                  textAlign: 'left',
                  paddingLeft: '15px',
                  display: 'block',
                  paddingRight: '70px',
                }}
              >
                {t('Sales Rep Settings')}
              </span>
            ),
            path: paths.dashboard.user.permission,
          },
        ],
      },

      {
        subheader: t('REPORTS'),
        items: [
          {
            title: (
              <span
                style={{
                  textAlign: 'left',
                  paddingLeft: '15px',
                  display: 'block',
                  paddingRight: '70px',
                }}
              >
                {t('Pipeline')}
              </span>
            ),
            path: paths.dashboard.user.pipline,
          },
          {
            title: (
              <span
                style={{
                  textAlign: 'left',
                  paddingLeft: '15px',
                  display: 'block',
                  paddingRight: '70px',
                }}
              >
                {t('Generated Sales')}
              </span>
            ),
            path: paths.dashboard.user.gensales,
          },
          {
            title: (
              <span
                style={{
                  textAlign: 'left',
                  paddingLeft: '15px',
                  display: 'block',
                  paddingRight: '70px',
                }}
              >
                {t('Set Target')}
              </span>
            ),
            path: paths.dashboard.user.target,
          },
        ],
      },

      {
        subheader: t('Analytics'),
        items: [
          {
            title: (
              <span
                style={{
                  textAlign: 'left',
                  paddingLeft: '15px',
                  display: 'block',
                }}
              >
                {t('Activity Log')}
              </span>
            ),
            path: paths.dashboard.general.analytics,
            // icon: ICONS.analytics,
          },
        ],
      },

      {
        subheader: t('Inactive'),
        items: [
          {
            title: (
              <span
                style={{
                  textAlign: 'left',
                  paddingLeft: '15px',
                  display: 'block',
                  paddingRight: '150px',
                }}
              >
                {t('Inactive')}
              </span>
            ),
            path: paths.dashboard.user.inactivelist,
            // icon: ICONS.analytics,
          },
        ],
      },

      {
        subheader: t('Records Marked for deletion'),
        items: [
          {
            title: (
              <span
                style={{
                  textAlign: 'left',
                  paddingLeft: '15px',
                  display: 'block',
                  paddingRight: '90px',
                }}
              >
                {t('Marked For Deletion')}
              </span>
            ),
            path: paths.dashboard.user.deletion,
            // icon: ICONS.analytics,
          },
        ],
      },
    ];

    if (userRole === 'Sales Representative') {
      return [
        ...baseNav, // Include the base navigation items
        {
          subheader: t('REPORTS'),
          items: [
            {
              title: (
                <span
                  style={{
                    textAlign: 'left',
                    paddingLeft: '15px',
                    display: 'block',
                    paddingRight: '70px',
                  }}
                >
                  {t('Pipeline')}
                </span>
              ),
              path: paths.dashboard.user.pipline,
            },
            {
              title: (
                <span
                  style={{
                    textAlign: 'left',
                    paddingLeft: '15px',
                    display: 'block',
                    paddingRight: '70px',
                  }}
                >
                  {t('Generated Sales')}
                </span>
              ),
              path: paths.dashboard.user.gensales,
            },
            {
              title: (
                <span
                  style={{
                    textAlign: 'left',
                    paddingLeft: '15px',
                    display: 'block',
                    paddingRight: '70px',
                  }}
                >
                  {t('Sales Target')}
                </span>
              ),
              path: paths.dashboard.user.target,
            },
          ],
        },
      ];
    }

    if (userRole === 'Sales Manager') {
      return [
        ...baseNav,
        {
          subheader: t('Management'),
          items: [
            {
              title: t('Permission Control'),
              path: paths.dashboard.user.root,
              // icon: ICONS.analytics,
              children: [{ title: t('Sales Rep Settings'), path: paths.dashboard.user.permission }],
            },
          ],
        },

        {
          subheader: t('REPORTS'),
          items: [
            {
              title: (
                <span
                  style={{
                    textAlign: 'left',
                    paddingLeft: '15px',
                    display: 'block',
                    paddingRight: '70px',
                  }}
                >
                  {t('Pipeline')}
                </span>
              ),
              path: paths.dashboard.user.pipline,
            },
            {
              title: (
                <span
                  style={{
                    textAlign: 'left',
                    paddingLeft: '15px',
                    display: 'block',
                    paddingRight: '70px',
                  }}
                >
                  {t('Generated Sales')}
                </span>
              ),
              path: paths.dashboard.user.gensales,
            },
            {
              title: (
                <span
                  style={{
                    textAlign: 'left',
                    paddingLeft: '15px',
                    display: 'block',
                    paddingRight: '70px',
                  }}
                >
                  {t('Sales Target')}
                </span>
              ),
              path: paths.dashboard.user.target,
            },
          ],
        },

        {
          items: [
            {
              title: t('Inactive'),
              path: paths.dashboard.user.root,
              // icon: ICONS.analytics,
              children: [{ title: t('Inactive'), path: paths.dashboard.user.inactivelist }],
            },
          ],
        },

        {
          items: [
            {
              title: t('Mark For Delete'),
              path: paths.dashboard.user.root,
              // icon: ICONS.analytics,
              children: [{ title: t('Mark For Delete'), path: paths.dashboard.user.deletion }],
            },
          ],
        },
      ];
    }

    if (userRole === 'Admin') {
      return [...baseNav, ...managementNav];
    }

    return [];
  }, [t, userRole, getSubheader]);

  return data;
}
