import isEqual from 'lodash/isEqual';
import { useCallback, useEffect, useRef, useState } from 'react';
// @mui
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
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
import { Box, Grid, Stack, Typography } from '@mui/material';
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
import UserTableToolbar from '../contact-table-toolbar';
import UserTableFiltersResult from '../user-table-filters-result';
import UserTableRow from '../user-table-row-contact';
import DuplicateRecordsModal from './duplicate-view';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'company_account_id', label: 'Company Name', width: '15%' },
  { id: 'title', label: 'Title', width: '15%' },
  { id: 'client_first_name', label: 'First Name', width: '15%' },
  { id: 'client_last_name', label: 'Last Name', width: '15%' },
  { id: 'personal_email', label: 'Email Address', width: '15%' },
  { id: 'cell_phone1', label: 'Cell Phone 1', width: '15%' },
  { id: 'office_phone1', label: 'Office Phone 1', width: '5%' },
  { id: '', width: '5%' },
];

const defaultFilters = {
  name: '',
  role: [],
};

// ----------------------------------------------------------------------

export default function OverviewContactAccountView({ moduleName }) {
  const table = useTable({
    onSortChange: (newOrder, newOrderBy) => {
      fetchSortedData(newOrderBy, newOrder);
    },
  });

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [filters, setFilters] = useState(defaultFilters);

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedIds, setSelectedIds] = useState([]);

  const { enqueueSnackbar } = useSnackbar();

  const [selectedCompanyTypes, setSelectedCompanyTypes] = useState(filters?.companyType || []);

  const [isExporting, setIsExporting] = useState(false);

  const [isImporting, setIsImporting] = useState(false);

  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);

  const [duplicateRecords, setDuplicateRecords] = useState([]);

  const logSentRef = useRef(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!logSentRef.current) {
        const dynamicModuleName = moduleName || 'CCMS USER MANAGMENT';
        logActivity('User view Client Contact List', dynamicModuleName);
        logSentRef.current = true;
      }
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const response = await axiosInstance.get(endpoints.contact.details, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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

  // Sorting
  const fetchSortedData = async (sortField, sortOrder) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axiosInstance.get(endpoints.contact.details, {
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

  // Handle inactive contacts
  const handleMarkInactive = async () => {
    if (selectedIds.length === 0) {
      enqueueSnackbar('No contacts selected', { variant: 'warning' });
      return;
    }
    try {
      const idsString = selectedIds.map((user) => user.id).join(',');
      const url = endpoints.inactive.contact(idsString);
      const loginuser = JSON.parse(localStorage.getItem('user'));
      const representativeName = loginuser ? loginuser.display_name : '';
      const data = {
        representative_name: representativeName,
        profiles: selectedIds.map((user) => ({
          id: user.id,
          full_name: user.client_first_name,
          role: user.title,
        })),
      };
      await axiosInstance.patch(url, data);
      logActivity('User Inactive A Contact', moduleName || 'CLIENT ACCOUNT MANAGEMENT');
      enqueueSnackbar('Selected contacts marked as inactive', { variant: 'success' });

      setUsers((prevUsers) =>
        prevUsers.filter((user) => !selectedIds.map((s) => s.id).includes(user.id))
      );

      setSelectedIds([]);
    } catch (error) {
      console.error('Error marking contacts as inactive:', error);
      enqueueSnackbar('Error marking contacts as inactive', { variant: 'error' });
    }
  };

  // Handle Filter For Contacts
  const handleTypeChange = async (updatedTypes) => {
    setSelectedCompanyTypes(updatedTypes);

    if (updatedTypes.length === 0) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axiosInstance.get(endpoints.contact.details, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const activeUsers = response.data.filter((user) => user.is_active === 1);
        setUsers(activeUsers);
        setTableData(activeUsers);
      } catch (error) {
        console.error('Error fetching all companies:', error);
        enqueueSnackbar('Failed to fetch all companies. Please try again.', {
          variant: 'error',
        });
      }
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      const response = await axiosInstance.get(endpoints.filter.company, {
        params: {
          model: 'company_contact',
          company_account_id: updatedTypes.join(','),
        },
        headers: {
          Authorization: `Bearer ${token}`,
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

  // Handle search functionality
  const fetchFilteredData = async (nameFilter) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axiosInstance.get(endpoints.search.contact, {
        params: { name: nameFilter },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data.data);
      setTableData(response.data.data);
      setPage(0);
    } catch (error) {
      console.error('Error fetching filtered data:', error);
    }
  };

  // Function to handle export
  const handleExport = async (selectedFields) => {
    if (!selectedIds.length) {
      console.error('No items selected for export');
      return;
    }
    setIsExporting(true);
    try {
      const response = await axiosInstance.post(endpoints.export.function, {
        ids: selectedIds,
        fields: selectedFields,
      });

      logActivity(
        'Contact data export requested by user',
        moduleName || 'CLENT ACCOUNT MANAGEMENT'
      );

      if (response.data.file_path) {
        const link = document.createElement('a');
        link.href = response.data.file_path;
        link.download = 'Contacts.xlsx';
        link.click();
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Function to handle import
  const handleImport = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    setIsImporting(true);

    try {
      const response = await axiosInstance.post(endpoints.import.function, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.duplicates) {
        setDuplicateRecords(response.data.duplicates);
        setIsDuplicateModalOpen(true);
        enqueueSnackbar(response.data.message, { variant: 'warning' });
      } else if (response.status === 200) {
        const { message, new_entries, skipped_entries, skipped_reasons } = response.data;

        enqueueSnackbar(
          `${message} Added: ${new_entries} entries. Skipped: ${skipped_entries} entries. ${
            skipped_reasons && skipped_reasons.length > 0
              ? `Reasons for skipped records: ${skipped_reasons.join(', ')}`
              : ''
          }`,
          { variant: 'success' }
        );
      } else {
        enqueueSnackbar('Failed to import file', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error importing file:', error);
      if (error.response?.data?.duplicates) {
        setDuplicateRecords(error.response.data.duplicates);
        setIsDuplicateModalOpen(true);
        enqueueSnackbar(error.response.data.message, { variant: 'warning' });
      } else if (error.response?.data) {
        const { message, new_entries, skipped_entries, skipped_reasons } = error.response.data;

        enqueueSnackbar(
          `${message} Added: ${new_entries} entries. Skipped: ${skipped_entries} entries. ${
            skipped_reasons && skipped_reasons.length > 0
              ? `Reasons for skipped records: ${skipped_reasons.join(', ')}`
              : ''
          }`,
          { variant: 'error' }
        );
      } else {
        enqueueSnackbar('An error occurred during file import', { variant: 'error' });
      }
    } finally {
      setIsImporting(false);
    }
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
          client_first_name: row.client_first_name,
          title: row.title,
        },
      ];
    });
  };

  const handleSelectAllRows = (checked) => {
    if (checked) {
      setSelectedIds(
        users.map((row) => ({
          id: row.id,
          client_first_name: row.client_first_name,
          title: row.title,
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
          heading="Contacts"
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Contact' }]}
          action={
            <Stack direction="row" spacing={5}>
              <Button
                variant="contained"
                sx={{
                  width: '100px',
                }}
                color="warning"
                onClick={handleMarkInactive}
              >
                Inactive
              </Button>
              <Button
                component={RouterLink}
                href={paths.dashboard.user.companycontact}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                New Contact
              </Button>
            </Stack>
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
            onExport={handleExport}
            isExporting={isExporting}
            onImport={handleImport}
          />
          <DuplicateRecordsModal
            open={isDuplicateModalOpen}
            onClose={() => setIsDuplicateModalOpen(false)}
            duplicates={duplicateRecords}
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

                {/* Show the loader when export is in progress */}
                {(isImporting || isExporting) && (
                  <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="center"
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <CircularProgress size={50} />
                  </Stack>
                )}

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
                        onExport={handleExport}
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

OverviewContactAccountView.propTypes = {
  moduleName: PropTypes.string,
};
