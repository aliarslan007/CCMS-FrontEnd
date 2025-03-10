import isEqual from 'lodash/isEqual';
import { useCallback, useEffect, useRef, useState } from 'react';
// @mui
import { Box, Grid, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
// routes
import { RouterLink } from 'src/routes/components';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
// _mock
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { ConfirmDialog } from 'src/components/custom-dialog';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import {
  getComparator,
  TableHeadCustom,
  TablePaginationCustom,
  TableSelectedAction,
  useTable,
} from 'src/components/table';
//
import PropTypes from 'prop-types';
import { useSnackbar } from 'src/components/snackbar';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { logActivity } from 'src/utils/log-activity';
import UserTableToolbar from '../profile-table-toolbar';
import UserTableFiltersResult from '../user-table-filters-result';
import UserTableRow from '../user-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'full_name', label: 'Full Name' },
  { id: 'full_name', label: 'Client Companies' },
  { id: 'main_phone_number', label: 'Mobile Phone No', width: '15%' },
  { id: 'title', label: 'Title', width: '15%' },
  { id: 'personal_email', label: 'Email', width: '15%' },
  { id: 'role', label: 'Role', width: '15%' },
  { id: 'access', label: 'Permissions', width: '5%' },
  { id: '', width: 88 },
];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

// ----------------------------------------------------------------------

export default function UserListView({ moduleName }) {
  const table = useTable({
    onSortChange: (newOrder, newOrderBy) => {
      fetchSortedData(newOrderBy, newOrder);
    },
  });
  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const [users, setUsers] = useState([]);

  const [selectedIds, setSelectedIds] = useState([]);

  const [loading, setLoading] = useState(true);

  const { enqueueSnackbar } = useSnackbar();

  const [selectedCompanyTypes, setSelectedCompanyTypes] = useState(filters?.companyType || []);

  const logSentRef = useRef(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!logSentRef.current) {
        const dynamicModuleName = moduleName || 'CCMS USER MANAGMENT';
        logActivity('User access View Users List', dynamicModuleName);
        logSentRef.current = true;
      }
      setLoading(true);

      try {
        const response = await axiosInstance.get(endpoints.admin.details);
        const activeUsers = response.data.filter((user) => user.is_active === 1);
        setUsers(activeUsers);
        setTableData(activeUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [moduleName]);

  const fetchSortedData = async (sortField, sortOrder) => {
    try {
      const response = await axiosInstance.get(endpoints.admin.details, {
        params: {
          sortBy: sortField,
          sortOrder,
        },
      });
      setUsers(response.data);
      setTableData(response.data);
    } catch (error) {
      console.error('Error fetching sorted data:', error);
    }
  };

  // Handle Inactive Profiles
  const handleMarkInactive = async () => {
    if (selectedIds.length === 0) {
      enqueueSnackbar('No User selected', { variant: 'warning' });
      return;
    }
    try {
      // Create array of just the IDs and join them
      const idsString = selectedIds.map((user) => user.id).join(',');
      const url = endpoints.inactive.profile(idsString);

      const loginuser = JSON.parse(localStorage.getItem('user'));
      const representativeName = loginuser ? loginuser.display_name : '';

      const data = {
        representative_name: representativeName,
        profiles: selectedIds.map((user) => ({
          id: user.id,
          full_name: user.full_name,
          role: user.role,
        })),
      };

      await axiosInstance.patch(url, data);
      logActivity('User inactive a userprofile', moduleName || 'CCMS USER MANAGEMENT');
      enqueueSnackbar('Selected User marked as inactive', { variant: 'success' });
      setUsers((prevUsers) =>
        prevUsers.filter((user) => !selectedIds.map((s) => s.id).includes(user.id))
      );
      setSelectedIds([]);
    } catch (error) {
      console.error('Error marking user as inactive:', error);
      enqueueSnackbar('Error marking user as inactive', { variant: 'error' });
    }
  };

  const handleTypeChange = async (updatedTypes) => {
    setSelectedCompanyTypes(updatedTypes);

    if (updatedTypes.length === 0) {
      try {
        const response = await axiosInstance.get(endpoints.admin.details);
        const activeUsers = response.data.filter((user) => user.is_active === 1);
        setUsers(activeUsers);
      } catch (error) {
        console.error('Error fetching all companies:', error);
        enqueueSnackbar('Failed to fetch all companies. Please try again.', {
          variant: 'error',
        });
      }
      return;
    }
    try {
      const response = await axiosInstance.get(endpoints.filter.company, {
        params: {
          model: 'profile',
          role: updatedTypes.join(','),
        },
      });
      setUsers(response.data.data);
      setTableData(response.data.data);
    } catch (error) {
      console.error('Error fetching filtered companies:', error);
      enqueueSnackbar('Failed to fetch filtered companies. Please try again.', {
        variant: 'error',
      });
    }
  };

  // Handle Search
  const fetchFilteredData = async (nameFilter) => {
    try {
      const response = await axiosInstance.get(endpoints.search.profile, {
        params: { name: nameFilter },
      });
      setUsers(response.data.data);
      setTableData(response.data.data);
    } catch (error) {
      console.error('Error fetching filtered data:', error);
    }
  };

  const handleUserClick = async (companyId) => {};

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const canReset = !isEqual(defaultFilters, filters);

  const handleFilters = async (key, value) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);

    if (key === 'name') {
      await fetchFilteredData(value);
    }
  };

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      setTableData(deleteRow);

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));
    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRows: tableData.length,
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, table, tableData]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.user.edit(id));
    },
    [router]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const handleSelectRow = (row) => {
    setSelectedIds((prev) => {
      const isAlreadySelected = prev.some((selected) => selected.id === row.id);
      if (isAlreadySelected) {
        return prev.filter((item) => item.id !== row.id);
      }
      return [
        ...prev,
        {
          id: row.id,
          full_name: row.full_name,
          role: row.role,
        },
      ];
    });
  };

  const handleSelectAllRows = (checked) => {
    if (checked) {
      setSelectedIds(
        users.map((row) => ({
          id: row.id,
          full_name: row.full_name,
          role: row.role,
        }))
      );
    } else {
      setSelectedIds([]);
    }
  };

  const numSelected = selectedIds.length;
  const rowCount = users.length;

  return (
    <>
      <Container maxWidth="" sx={{ paddingBottom: '60px' }}>
        <CustomBreadcrumbs
          heading="Profiles"
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'profiles' }]}
          action={
            <>
              <Button
                variant="contained"
                color="warning"
                onClick={handleMarkInactive}
                sx={{ marginRight: 2 }}
              >
                Inactive
              </Button>

              <Button
                component={RouterLink}
                href={paths.dashboard.user.new}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                sx={{ marginRight: 1 }}
              >
                New User
              </Button>
            </>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <UserTableToolbar
            filters={filters}
            onFilters={handleFilters}
            roleOptions={[]}
            selectedTypes={selectedCompanyTypes}
            onTypeChange={handleTypeChange}
          />

          {canReset && (
            <UserTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={numSelected}
              rowCount={rowCount}
              onSelectAllRows={handleSelectAllRows}
            />

            <Scrollbar sx={{ maxHeight: 700000 }}>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={handleSelectAllRows}
                />

                <TableBody>
                  {(Array.isArray(users) ? users : [])
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <UserTableRow
                        key={row.id}
                        row={row}
                        selected={selectedIds.some((selected) => selected.id === row.id)}
                        onSelectRow={() => handleSelectRow(row)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        onUserClick={handleUserClick}
                      />
                    ))}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={users.length}
            page={table.page}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
      <Box>
        <Grid container>{/* Your content */}</Grid>

        <Box
          component="footer"
          sx={{
            marginTop: '70px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            height: '50px',
            position: 'fixed',
            bottom: 0,
            left: '-50px',
            width: '100%',
            maxWidth: '1520px',
            margin: 'auto',
            zIndex: 1300,
            backgroundColor: 'white',
            padding: '10px',
            paddingRight: '50px',

            // Responsive styling
            '@media (max-width: 1024px)': {
              justifyContent: 'center',
              paddingRight: '20px',
            },

            '@media (max-width: 600px)': {
              justifyContent: 'center',
              left: '0',
              width: '100%',
              padding: '10px 15px',
            },
          }}
        >
          <Typography variant="body2" color="textSecondary">
            &copy; {new Date().getFullYear()}
            <span style={{ marginLeft: '5px' }}>
              <strong>www.SoluComp.com</strong>
            </span>
            v1.0
          </Typography>
        </Box>
      </Box>
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters }) {
  const { name, status, role } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (user) => user.name && user.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((user) => user.status === status);
  }

  if (role.length) {
    inputData = inputData.filter((user) => role.includes(user.role));
  }

  return inputData;
}

UserListView.propTypes = {
  moduleName: PropTypes.string,
};
