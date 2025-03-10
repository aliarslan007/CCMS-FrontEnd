import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
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
import TableHeadCustomContact from 'src/components/table/table-head-custom-contact';
//
import { useSnackbar } from 'src/components/snackbar';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { logActivity } from 'src/utils/log-activity';
//
import { useAuth } from '../../../../auth/context/jwt/auth-context';
import UserTableFiltersResult from '../../../user/user-table-filters-result';
import UserTableRow from '../../../user/user-table-row-accounts';
import UserTableRows from '../../../user/user-table-row-sales';
import UserTableToolbar from '../../../user/user-table-toolbar';
// import { width } from '@mui/system';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'company_name', label: 'Company Name', width: '15%' },
  { id: 'phone_number', label: 'Phone Number', width: '15%' },
  { id: 'company_type', label: 'Company Type', width: '15%' },
  { id: 'service', label: 'Services', width: '15%' },
  { id: 'address1', label: 'Company Address', width: '15%' },
  { id: '', width: '25%' },
];

const CONTACT_TABLE_HEAD = [
  { id: 'company', label: 'Contact Name', width: '15%' },
  { id: 'phoneNumber', label: 'Title', width: '15%' },
  { id: 'company', label: 'First Name', width: '15%' },
  { id: 'company', label: 'Last Name', width: '15%' },
  { id: '', label: 'Email Address', width: '15%' },
  { id: '', label: 'Cell Phone 1', width: '10%' },
  { id: '', width: '25%' },
];

const defaultFilters = {
  name: '',
  role: [],
};

// ----------------------------------------------------------------------

export default function OverviewSalesListView({ contactId, onFilters, moduleName }) {
  const table = useTable({
    onSortChange: (newOrder, newOrderBy) => {
      fetchSortedData(newOrderBy, newOrder);
    },
  });

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);

  const [tableDataContact, setTableDataContact] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const navigate = useNavigate();

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedIds, setSelectedIds] = useState([]);

  const { enqueueSnackbar } = useSnackbar();

  const [selectedCompanyTypes, setSelectedCompanyTypes] = useState(filters?.companyType || []);

  const { userRole } = useAuth(); // Get the user's role from the authentication context

  const isAdmin = userRole === 'Admin';

  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  const [companyContacts, setCompanyContacts] = useState([]);

  const [selectedCompanyname, setSelectedCompanyname] = useState('');

  const [companyTypes, setCompanyTypes] = useState([]);

  const logSentRef = useRef(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!logSentRef.current) {
        const dynamicModuleName = moduleName || 'CLIENT COMPANIES';
        logActivity('User view client companies', dynamicModuleName);
        logSentRef.current = true;
      }
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userid');
        const response = await axiosInstance.get(endpoints.complete.accounts(userId), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const companyArray = Object.values(response.data.data);
        const activeCompanies = companyArray.filter((company) => company.is_active !== 0);
        const uniqueCompanyTypes = [
          ...new Set(activeCompanies.map((company) => company.company_type)),
        ];
        setUsers(activeCompanies);
        setTableData(activeCompanies);
        setCompanyTypes(uniqueCompanyTypes);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [moduleName]);

  // Sorting
  const fetchSortedData = async (sortField, sortOrder) => {
    try {
      const token = localStorage.getItem('authToken');
      const companyIds = users.map((user) => user.id);

      const response = await axiosInstance.get(endpoints.all.company, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          sortBy: sortField,
          sortOrder,
          companyIds: companyIds.join(','),
        },
      });

      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching sorted data:', error);
    }
  };

  // Handle inactive companies
  const handleMarkInactive = async () => {
    if (selectedIds.length === 0) {
      enqueueSnackbar('No contacts selected', { variant: 'warning' });
      return;
    }
    try {
      const idsString = selectedIds.map((user) => user.id).join(',');
      const url = endpoints.inactive.comapany(idsString);
      const loginuser = JSON.parse(localStorage.getItem('user'));
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

      const fullNames = selectedIds.map((user) => user.company_name).join(', ');

      logActivity('User inactive a company', moduleName || 'CLIENT COMPANIES', {
        identification: fullNames,
      });
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
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userid');
        const response = await axiosInstance.get(endpoints.complete.accounts(userId), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const companyArray = Object.values(response.data.data);
        setUsers(companyArray);
      } catch (error) {
        console.error('Error fetching filter companies:', error);
        enqueueSnackbar('Failed to fetch filter companies. Please try again.', {
          variant: 'error',
        });
      }
      return;
    }
    try {
      const userId = localStorage.getItem('userid');
      const response = await axiosInstance.get(endpoints.filter.company, {
        params: {
          id: userId,
          model: 'company_account',
          company_type: updatedTypes.join(','),
        },
      });
      setUsers(response.data.data);
    } catch (error) {
      enqueueSnackbar('Failed to fetch filtered companies. Please try again.', {
        variant: 'error',
      });
    }
  };

  const handleCompanyClick = async (companyId, company_name) => {
    setSelectedCompanyId(companyId);
    setSelectedCompanyname(company_name);
    const flag = true;
    try {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userid');
      const response = await axiosInstance.get(endpoints.solo.details(companyId), {
        params: {
          flag,
          userId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const contacts = response.data || [];
      setCompanyContacts(contacts);
      setTableDataContact(contacts);
    } catch (error) {
      console.error('Error fetching company contacts:', error);
      enqueueSnackbar('No contacts against this company.', { variant: 'error' });
    }
  };

  // Handle Search
  const fetchFilteredData = async (nameFilter) => {
    try {
      const userId = localStorage.getItem('userid');

      const response = await axiosInstance.get(endpoints.search.company, {
        params: {
          name: nameFilter,
          id: userId,
        },
      });

      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching filtered data:', error);
    }
  };

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const dataFilteredContact = applyFilter({
    inputData: tableDataContact,
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
      <Container maxWidth="">
        <CustomBreadcrumbs
          heading="Companies"
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'company' }]}
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

              {isAdmin && (
                <Button
                  component={RouterLink}
                  to={paths.dashboard.user.company}
                  variant="contained"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  sx={{ marginRight: 1 }}
                >
                  New Company
                </Button>
              )}
            </>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card sx={{ mb: 5 }}>
          <Typography variant="body2" sx={{ p: 2, color: 'text.secondary' }}>
            Select a company name from the this table to view their contacts in the table below.
          </Typography>
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
                        // onCompanyClick={handleCompanyClick}
                        onCompanyClick={() => handleCompanyClick(row.id, row.company_name)}
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

        {/* Second Table To display the contacts of company */}

        <Card sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ p: 2 }}>
            <Box component="span" sx={{ color: 'text.secondary' }}>
              Contacts of{' '}
            </Box>
            <Box
              component="span"
              sx={{
                fontWeight: 'bold',
              }}
            >
              {selectedCompanyname || 'Selected Company'}
            </Box>
          </Typography>

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
              numSelected={table.selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked) => handleSelectAllRows(checked)}
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
                <TableHeadCustomContact
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={CONTACT_TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) => handleSelectAllRows(checked)}
                />

                <TableBody>
                  {(Array.isArray(companyContacts) ? companyContacts : [])
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <UserTableRows
                        key={row.id}
                        row={row}
                        selected={selectedIds.includes(row.id)}
                        onSelectRow={() => handleSelectRow(row.id)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                      />
                    ))}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFilteredContact.length}
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
    </>
  );
}
// Add PropTypes validation here
OverviewSalesListView.propTypes = {
  contactId: PropTypes.number.isRequired,
  onFilters: PropTypes.func,
  moduleName: PropTypes.string,
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
