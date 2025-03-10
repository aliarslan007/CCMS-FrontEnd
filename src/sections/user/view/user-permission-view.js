import isEqual from 'lodash/isEqual';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Tooltip from '@mui/material/Tooltip';
// routes
// import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
// _mock
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import {
  Box,
  Checkbox,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
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
import TableHeadSimple from 'src/components/table/table-head-permission-contact';
import { useRouter } from 'src/routes/hooks';
//

import { methods } from 'lodash';
import PropTypes from 'prop-types';
import { useSnackbar } from 'src/components/snackbar';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { logActivity } from 'src/utils/log-activity';
import UserTableToolbar from '../profile-table-toolbar';
import UserTableFiltersResult from '../user-table-filters-result';
import UserTableRow from '../user-table-row';
import UserTableRows from '../user-table-row-contact';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'full_name', label: 'Full Name' },
  { id: 'full_name', label: 'Company Name' },
  { id: 'main_phone_number', label: 'Mobile Phone No', width: '15%' },
  { id: 'title', label: 'Title', width: '15%' },
  { id: 'personal_email', label: 'Email', width: '15%' },
  { id: 'role', label: 'Role', width: '15%' },
  { id: 'access', label: 'Permission Access', width: '15%' },
  { id: '', width: 88 },
];

const USER_TABLE_HEAD = [
  { id: '', label: 'Avatar' },
  { id: 'title', label: 'Title', width: '15%' },
  { id: 'client_first_name', label: 'Client First Name', width: '15%' },
  { id: 'client_last_name', label: 'Client Last Name', width: '15%' },
  { id: 'email', label: 'Personal Email', width: '15%' },
  { id: 'cell_phone1', label: 'Cell Phone 1', width: '15%' },
  { id: 'office_phone1', label: 'Office Phone', width: '15%' },
  { id: '', width: '15%' },
];

const permissions = ['Full Access', 'Partial Access', 'Limited', 'View Only'];

const defaultFilters = {
  name: '',
  role: [],
  status: 'all',
};

// ----------------------------------------------------------------------

export default function UserPermissionView({ moduleName }) {
  const navigate = useNavigate();

  const quickEdit = useBoolean();

  const [permission, setpermissions] = useState('');

  const [users, setUsers] = useState([]);

  const router = useRouter();

  const [filters, setFilters] = useState(defaultFilters);

  const [selectedIds, setSelectedIds] = useState([]);

  const [loading, setLoading] = useState(true);

  const { enqueueSnackbar } = useSnackbar();

  const [selectedCompanyTypes, setSelectedCompanyTypes] = useState(filters?.companyType || []);

  const table = useTable({
    onSortChange: (newOrder, newOrderBy) => {
      fetchSortedData(newOrderBy, newOrder);
    },
  });

  const settings = useSettingsContext();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);

  const [page, setPage] = useState(0);

  const [tableDataContact, setTableDataContact] = useState([]);

  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  const [companyContacts, setCompanyContacts] = useState([]);

  const [salesReps, setSalesReps] = useState([]);

  const [salesManagers, setSalesManagers] = useState([]);

  const [salesRep, setSalesRep] = useState('');

  const [salesManager, setSalesManager] = useState('');

  const [companies, setCompanies] = useState([]);

  const [selectedCompany, setSelectedCompany] = useState([]);

  const [stateProvince, setStateProvince] = useState([]);

  const [statesList, setStatesList] = useState([]);

  const [userRole, setUserRole] = useState(null);

  const [selectedUsername, setSelectedUsername] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 100;

  const startIndex = (currentPage - 1) * itemsPerPage;

  const endIndex = startIndex + itemsPerPage;

  const visibleStates = statesList.slice(startIndex, endIndex);

  const [contactsTablePage, setContactsTablePage] = useState(0);

  const [contactsTableRowsPerPage, setContactsTableRowsPerPage] = useState(10);

  const [isSalesManagerSelected, setIsSalesManagerSelected] = useState(false);

  const [isSalesRepSalesManager, setIsSalesRepSalesManager] = useState(false);

  const logSentRef = useRef(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!logSentRef.current) {
        const dynamicModuleName = moduleName || 'PERMISSION CONTROL';
        logActivity('User view sale representative settings', dynamicModuleName);
        logSentRef.current = true;
      }

      setLoading(true);
      const userId = localStorage.getItem('userid');
      const role = localStorage.getItem('userRole');
      const token = localStorage.getItem('authToken');
      try {
        const params = { userId };
        if (role === 'Sales Manager') {
          params.isManager = true;
        }

        const response = await axiosInstance.get(endpoints.admin.details, { params });

        const activeUsers = response.data.filter((user) => user.is_active === 1);

        const filteredSalesReps = activeUsers.map((user) => ({
          id: user.uuid,
          name: user.full_name || 'Unknown Name',
          role: user.role || 'Unknown Role',
        }));

        const filteredSalesManagers = activeUsers
          .filter((user) => user.role === 'Sales Manager')
          .map((user) => ({
            id: user.id,
            name: user.full_name || 'Unknown Name',
            role: user.role || 'Unknown Role',
          }));

        setSalesReps(filteredSalesReps);
        setSalesManagers(filteredSalesManagers);
        setUsers(activeUsers);
        setTableData(activeUsers);

        const companyResponse = await axiosInstance.get(endpoints.all.company, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const activeCompanies = companyResponse.data.filter((company) => company.is_active === 1);
        const companyList = activeCompanies.map((company) => ({
          id: company.id,
          name: company.company_name || 'Unknown Company',
          states: company.state ? company.state.split(',') : [],
        }));
        setCompanies(companyList);
        const stateresponse = await axiosInstance.get(endpoints.state.function);
        setStatesList(stateresponse.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [moduleName]);

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    setUserRole(storedRole);
  }, []);

  // Sorting
  const fetchSortedData = async (sortField, sortOrder) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axiosInstance.get(endpoints.admin.details, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          sortBy: sortField,
          sortOrder,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching sorted data:', error);
    }
  };

  const handleTypeChange = async (updatedTypes) => {
    setSelectedCompanyTypes(updatedTypes);
    const userId = localStorage.getItem('userid');
    const role = localStorage.getItem('userRole');

    if (updatedTypes.length === 0) {
      try {
        const params = { userId };
        if (role === 'Sales Manager') {
          params.isManager = true;
        }
        const response = await axiosInstance.get(endpoints.admin.details, { params });
        const activeUsers = response.data.filter((user) => user.is_active === 1);
        setUsers(activeUsers);
        setTableData(activeUsers);
      } catch (error) {
        console.error('Error fetching all companies:', error);
        enqueueSnackbar('Failed to fetch User. Please try again.', {
          variant: 'error',
        });
      }
      return;
    }
    try {
      const params = {
        model: 'profile',
        role: updatedTypes.join(','),
      };

      if (role === 'Sales Manager') {
        params.userId = userId;
        params.isManager = true;
      }

      const response = await axiosInstance.get(endpoints.filter.company, { params });
      setUsers(response.data.data);
      setTableData(response.data.data);
    } catch (error) {
      console.error('Error fetching filtered companies:', error);
      enqueueSnackbar('Failed to fetch filtered companies. Please try again.', {
        variant: 'error',
      });
    }
  };

  // Handle Click to show the contact of User {Only Active}
  const handleUserClick = async (companyId, full_name) => {
    setSelectedCompanyId(companyId);
    setSelectedUsername(full_name);
    const flag = false;
    const role = localStorage.getItem('userRole');
    try {
      const token = localStorage.getItem('authToken');

      const response = await axiosInstance.get(endpoints.solo.details(companyId), {
        params: {
          flag,
          role,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const contact = response.data.company_contacts || [];
      setCompanyContacts(contact);
      setTableDataContact(contact);
      setTableData(contact);
    } catch (error) {
      console.error('Error fetching company contacts:', error);
      enqueueSnackbar('Failed to fetch contact against this user', { variant: 'error' });
    }
  };

  const fetchFilteredData = async (nameFilter) => {
    const userId = localStorage.getItem('userid');
    const role = localStorage.getItem('userRole');
    try {
      const params = { name: nameFilter };
      if (role === 'Sales Manager') {
        params.userId = userId;
        params.isManager = true;
      }
      const response = await axiosInstance.get(endpoints.search.profile, { params });
      setUsers(response.data.data);
      setTableData(response.data.data);
      setPage(0);
    } catch (error) {
      console.error('Error fetching filtered data:', error);
    }
  };

  const handleAddRecord = async () => {
    logActivity('add assign record permissions to user', moduleName || 'PERMISSION CONTROL');
    if (!salesManager && !isSalesRepSalesManager) {
      enqueueSnackbar('Please select a Sales Manager before adding the record.', {
        variant: 'warning',
      });
      return;
    }
    const payload = {
      company_account_id: selectedCompany,
      assigned_manager: salesManager,
      access: permission,
      id: salesRep,
      states: stateProvince,
    };

    try {
      const response = await axiosInstance.post(endpoints.assigned.agent, payload);

      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar('Record added successfully!');
        methods.reset();
      } else {
        enqueueSnackbar('Failed to add record. Please check the input.', { variant: 'error' });
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessage =
          error.response.data.message || 'Failed to add record. Please try again.';
        enqueueSnackbar(errorMessage, { variant: 'error' });
        console.error('Backend error:', error.response.data.message);
      } else {
        // enqueueSnackbar('Failed to add permissions. Please try again.', { variant: 'error' });
        console.error('Error adding record:', error);
      }
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

  // const denseHeight = table.dense ? 52 : 72;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

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

  const handleSelectRow = (id) => {
    setSelectedIds((prev) => {
      const isAlreadySelected = prev.includes(id);
      return isAlreadySelected ? prev.filter((item) => item !== id) : [...prev, id];
    });
  };

  const handleSelectAllRows = (checked) => {
    if (checked) {
      setSelectedIds(users.map((row) => row.id));
    } else {
      setSelectedIds([]);
    }
  };

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

  const handleContactsTablePageChange = (event, newPage) => {
    setContactsTablePage(newPage);
  };

  const handleContactsTableRowsPerPageChange = (event) => {
    setContactsTableRowsPerPage(parseInt(event.target.value, 10));
    setContactsTablePage(0);
  };

  return (
    <Container maxWidth="" sx={{ mb: 3.5 }}>
      {/* Existing Table and Content */}
      <CustomBreadcrumbs
        heading="Permissions"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Sales Rep Setting' }]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Card sx={{ mb: 5 }}>
        <Typography variant="body2" sx={{ p: 2, color: 'text.secondary' }}>
          Select a username from the this table to view their contacts in the table below.
        </Typography>
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
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={tableData.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    tableData.map((row) => row.id)
                  )
                }
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
                      selected={selectedIds.includes(row.id)}
                      onSelectRow={() => handleSelectRow(row.id)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                      onEditRow={() => handleEditRow(row.id)}
                      onUserClick={() => handleUserClick(row.id, row.full_name)}
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

      {/* Second Table To display the contacts of Assigned Agent */}

      <Card>
        <Typography variant="h6" sx={{ p: 2 }}>
          <Box component="span" sx={{ color: 'text.secondary' }}>
            Contacts of{' '}
          </Box>
          <Box
            component="span"
            sx={{
              fontWeight: 'bold',
              // textDecoration: 'underline', // Adds underline to the username
            }}
          >
            {selectedUsername || 'Selected User'}
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
              <TableHeadSimple
                order={table.order}
                orderBy={table.orderBy}
                headLabel={USER_TABLE_HEAD}
                rowCount={tableData.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) => handleSelectAllRows(checked)}
              />
              <TableBody>
                {(Array.isArray(companyContacts) ? companyContacts : [])
                  .slice(
                    contactsTablePage * contactsTableRowsPerPage,
                    contactsTablePage * contactsTableRowsPerPage + contactsTableRowsPerPage
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
          page={contactsTablePage}
          rowsPerPage={contactsTableRowsPerPage}
          onPageChange={handleContactsTablePageChange}
          onRowsPerPageChange={handleContactsTableRowsPerPageChange}
          //
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong>{table.selected.length}</strong> items?
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
      {/* Dropdown Selection */}
      <Card sx={{ mt: 8 }}>
        {userRole === 'Admin' ? (
          <>
            <Typography variant="h6" gutterBottom>
              Assign Record Permissions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Select Users</InputLabel>
                  <Select
                    value={salesRep}
                    onChange={async (e) => {
                      const selectedId = e.target.value;
                      setSalesRep(selectedId);
                      setSalesManager('');
                      setIsSalesManagerSelected(false);
                      setIsSalesRepSalesManager(false);
                      try {
                        const response = await axiosInstance.get(
                          `${endpoints.profile.details(selectedId)}`
                        );
                        const { reports_to, company_names, access, state_ids, role } =
                          response.data;
                        if (role === 'Sales Manager') {
                          setIsSalesRepSalesManager(true);
                          setSalesManager(selectedId);
                          setIsSalesManagerSelected(true);
                        } else {
                          setIsSalesRepSalesManager(false);
                        }
                        if (company_names && company_names.length > 0) {
                          const matchedCompanies = companies.filter((company) =>
                            company_names.includes(company.name)
                          );
                          if (matchedCompanies.length > 0) {
                            setSelectedCompany(matchedCompanies.map((company) => company.id));
                          } else {
                            console.warn(
                              `Companies '${company_names.join(
                                ', '
                              )}' not found in dropdown options.`
                            );
                            setSelectedCompany([]);
                          }
                        } else {
                          setSelectedCompany([]);
                        }
                        const matchedManager = salesManagers.find(
                          (manager) => manager.id === Number(reports_to)
                        );
                        if (matchedManager && !isSalesRepSalesManager) {
                          setSalesManager(matchedManager.id);
                          setIsSalesManagerSelected(true); // Mark that Sales Manager is selected
                        } else {
                          setSalesManager('');
                          setIsSalesManagerSelected(false); // Mark Sales Manager as not selected
                        }
                        setpermissions(access);
                        setStateProvince(state_ids || []);
                        enqueueSnackbar('Sales Representative details loaded successfully!', {
                          variant: 'success',
                        });
                      } catch (error) {
                        console.error('Error fetching Sales Representative details:', error);
                        enqueueSnackbar(
                          'Failed to load Sales Representative details. Please try again.',
                          { variant: 'error' }
                        );
                      }
                    }}
                    label="Select Sales Representative"
                  >
                    {salesReps.length > 0 ? (
                      salesReps.map((rep) => (
                        <MenuItem key={rep.id} value={rep.id}>
                          {`${rep.name} - ${rep.role}`}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No Users available</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              {!isSalesRepSalesManager && (
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Select Sales Manager</InputLabel>
                    <Select
                      value={salesManager}
                      onChange={(e) => {
                        setSalesManager(e.target.value);
                        setIsSalesManagerSelected(e.target.value !== '');
                      }}
                      label="Select Sales Manager"
                      disabled={!salesRep}
                    >
                      {salesManagers.length > 0 ? (
                        salesManagers.map((manager) => (
                          <MenuItem key={manager.id} value={manager.id}>
                            {`${manager.name} - ${manager.role}`}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No Sales Managers available</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Select Customer Company</InputLabel>
                  <Select
                    multiple
                    value={Array.isArray(selectedCompany) ? selectedCompany : [selectedCompany]}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    label="Select Customer Company"
                    renderValue={(selected) => {
                      // Display selected company names
                      const selectedCompanies = companies.filter((company) =>
                        selected.includes(company.id)
                      );
                      return selectedCompanies.map((company) => company.name).join(', ');
                    }}
                  >
                    {companies.length > 0 ? (
                      companies.map((company) => (
                        <MenuItem key={company.id} value={company.id}>
                          <Checkbox
                            checked={
                              Array.isArray(selectedCompany)
                                ? selectedCompany.includes(company.id)
                                : selectedCompany === company.id
                            }
                          />
                          {company.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No active companies available</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Permissions</InputLabel>
                  <Select
                    value={permission}
                    onChange={(e) => setpermissions(e.target.value)}
                    label="Permissions"
                  >
                    {permissions.map((state) => (
                      <MenuItem key={state} value={state}>
                        {state}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Select State/Province</InputLabel>
                  <Select
                    multiple
                    value={stateProvince}
                    onChange={(e) => {
                      const selectedValues = e.target.value;

                      if (selectedValues.includes('all')) {
                        setStateProvince(
                          stateProvince.length === visibleStates.length
                            ? []
                            : visibleStates.map((state) => state.name)
                        );
                      } else {
                        setStateProvince(selectedValues);
                      }
                    }}
                    label="Select State/Province"
                    renderValue={(selected) => {
                      const selectedStates = statesList.filter((state) =>
                        selected.includes(state.name)
                      );
                      return selectedStates
                        .map((state) => `${state.name} (${state.country})`)
                        .join(', ');
                    }}
                    MenuProps={{
                      PaperProps: {
                        style: { maxHeight: 300, overflow: 'auto' },
                      },
                    }}
                  >
                    {/* Select All Option */}
                    <MenuItem value="all">
                      <Checkbox checked={stateProvince.length === visibleStates.length} />
                      <ListItemText primary="Select All" />
                    </MenuItem>

                    {/* Render Visible States */}
                    {visibleStates.map((state) => (
                      <MenuItem key={state.id} value={state.name}>
                        <Checkbox checked={stateProvince.includes(state.name)} />
                        <ListItemText primary={`${state.name} (${state.country})`} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid
                item
                xs={12}
                sx={{
                  marginBottom: '6px',
                  marginLeft: '7px',
                }}
              >
                <Button
                  variant="contained"
                  onClick={handleAddRecord}
                  disabled={!salesRep || (!isSalesRepSalesManager && !salesManager)}
                >
                  Add Record
                </Button>
              </Grid>
            </Grid>
          </>
        ) : (
          <Typography variant="body2" sx={{ fontSize: '14px', color: '#aaa' }}>
            Manager do not have permission to access this section.
          </Typography>
        )}
      </Card>
      {/* Permissions Explanation Box */}
      <Grid container justifyContent="flex-start" sx={{ mt: 6, mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              p: (theme) => theme.spacing(3),
              borderRadius: 10,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography variant="h6" align="center" sx={{ mb: (theme) => theme.spacing(3) }}>
              User Permissions Overview
            </Typography>
            <Typography
              variant="body2"
              align="center"
              sx={{
                mb: (theme) => theme.spacing(3),
                color: 'text.secondary',
              }}
            >
              Assign roles effectively by understanding the permissions available for users.
            </Typography>
            <List>
              <ListItem sx={{ mb: (theme) => theme.spacing(2) }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 'bold',
                    mr: (theme) => theme.spacing(1),
                  }}
                >
                  Full Access
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Users can create new contacts, delete existing contacts, update contact details,
                  and add notes to contacts.
                </Typography>
              </ListItem>
              <ListItem sx={{ mb: (theme) => theme.spacing(2) }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 'bold',
                    mr: (theme) => theme.spacing(1),
                  }}
                >
                  Partial Access
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Users can create new contacts and add notes but cannot delete or update existing
                  contacts.
                </Typography>
              </ListItem>
              <ListItem sx={{ mb: (theme) => theme.spacing(2) }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 'bold',
                    mr: (theme) => theme.spacing(1),
                  }}
                >
                  View Only
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Users can only view contacts without the ability to make any changes or add notes.
                </Typography>
              </ListItem>
              <ListItem sx={{ mb: (theme) => theme.spacing(2) }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 'bold',
                    mr: (theme) => theme.spacing(1),
                  }}
                >
                  Limited
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Users can only add notes to existing contacts.
                </Typography>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
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
    </Container>
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

UserPermissionView.propTypes = {
  moduleName: PropTypes.string,
};
