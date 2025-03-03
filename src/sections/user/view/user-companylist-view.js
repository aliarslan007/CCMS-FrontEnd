import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Box, Grid, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Tooltip from '@mui/material/Tooltip';
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
import { useSnackbar } from 'src/components/snackbar';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { logActivity } from 'src/utils/log-activity';
import UserTableFiltersResult from '../user-table-filters-result';
import UserTableRow from '../user-table-row-accounts';
import UserTableToolbar from '../user-table-toolbar';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'company', label: 'Company Name', width: '15%' },
  { id: 'phoneNumber', label: 'Phone Number', width: '15%' },
  { id: 'company', label: 'Company Type', width: '15%' },
  { id: 'Email', label: 'Service', width: '15%' },
  { id: 'types', label: 'Compnay Address', width: '15%' },
  { id: '', width: '25%' },
];

const defaultFilters = {
  name: '',
  role: [],
};

// ----------------------------------------------------------------------

export default function OverviewSalesListView({ contactId, onFilters, moduleName }) {
  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const navigate = useNavigate();

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedIds, setSelectedIds] = useState([]);

  const { enqueueSnackbar } = useSnackbar();

  const [selectedCompanyTypes, setSelectedCompanyTypes] = useState(filters?.companyType || []);

  const [companyTypes, setCompanyTypes] = useState([]);

  const logSentRef = useRef(false);

  useEffect(() => {
    if (!logSentRef.current) {
      const dynamicModuleName = moduleName || 'CLIENT ACCOUNT MANAGMENT';
      logActivity('User view Client Companies', dynamicModuleName);
      logSentRef.current = true;
    }
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem('authToken');
        const response = await axiosInstance.get(endpoints.all.company, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const activeUsers = response.data.filter((user) => user.is_active === 1);
        const uniqueCompanyTypes = [...new Set(activeUsers.map((company) => company.company_type))];
        setUsers(activeUsers);
        setTableData(activeUsers);
        setCompanyTypes(uniqueCompanyTypes);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [moduleName]);

  // Handle inactive companies
  const handleMarkInactive = async () => {
    if (selectedIds.length === 0) {
      enqueueSnackbar('No contacts selected', { variant: 'warning' });
      return;
    }
    try {
      const idsString = selectedIds.map((user) => user.id).join(',');
      const url = endpoints.inactive.comapany(idsString);
      const loginuser = JSON.parse(sessionStorage.getItem('user'));
      const representativeName = loginuser ? loginuser.display_name : '';

      const data = {
        representative_name: representativeName,
        profiles: selectedIds.map((user) => ({
          id: user.id,
          full_name: user.company_name,
          role: user.company_type,
        })),
      };
      await axiosInstance.patch(url, data);
      logActivity('User inactive a company', moduleName || 'CLIENT ACCOUNT MANAGEMENT');

      enqueueSnackbar('Selected Company marked as inactive', { variant: 'success' });
      setUsers((prevUsers) =>
        prevUsers.filter((user) => !selectedIds.map((s) => s.id).includes(user.id))
      );
      setSelectedIds([]);
    } catch (error) {
      console.error('Error marking contacts as inactive:', error);
      enqueueSnackbar('Error marking contacts as inactive', { variant: 'error' });
    }
  };

  // Handle Filter
  const handleTypeChange = async (updatedTypes) => {
    setSelectedCompanyTypes(updatedTypes);
    if (updatedTypes.length === 0) {
      try {
        const token = sessionStorage.getItem('authToken');
        const response = await axiosInstance.get(endpoints.all.company, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data);
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
          model: 'company_account',
          company_type: updatedTypes.join(','),
        },
      });
      setUsers(response.data.data);
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
      const response = await axiosInstance.get(endpoints.search.company, {
        params: { name: nameFilter },
      });
      const activeUsers = response.data.data.filter((user) => user.is_active === 1);
      setUsers(activeUsers);
    } catch (error) {
      console.error('Error fetching filtered data:', error);
    }
  };

  const handleCompanyClick = (uuid) => {
    navigate(paths.dashboard.user.companydetailsinfo(uuid));
  };
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
          company_name: row.company_name,
          company_type: row.company_type,
        },
      ];
    });
  };

  const handleSelectAllRows = (checked) => {
    if (checked) {
      setSelectedIds(
        users.map((row) => ({
          id: row.id,
          company_name: row.company_name,
          company_type: row.company_type,
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
          heading="Companies"
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Company' }]}
          action={
            <>
              <Button
                variant="contained"
                color="warning"
                onClick={handleMarkInactive}
                sx={{ marginRight: 2, width: 100 }}
              >
                Inactive
              </Button>

              <Button
                component={RouterLink}
                href={paths.dashboard.user.company}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                sx={{ marginRight: 1 }}
              >
                New Company
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
            companyTypes={companyTypes}
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
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
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
                        onCompanyClick={handleCompanyClick}
                      />
                    ))}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
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
// Add PropTypes validation here
OverviewSalesListView.propTypes = {
  contactId: PropTypes.number.isRequired,
  onFilters: PropTypes.func,
};

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

OverviewSalesListView.propTypes = {
  moduleName: PropTypes.string,
};
