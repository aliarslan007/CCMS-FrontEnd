import isEqual from 'lodash/isEqual';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
// routes
import { RouterLink } from 'src/routes/components';
import { useRouter } from 'src/routes/hooks';
// import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
// _mock
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { ConfirmDialog } from 'src/components/custom-dialog';
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
import UserTableRow from '../user-table-row-restore';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'representative_name', label: 'Inactive By', width: 180 },
  { id: 'record_name', label: 'Company Name', width: 180 },
  { id: 'identification', label: 'Company Type', width: 180 },
  { id: '', label: 'Created At', width: 180 },
  { id: '', width: 88 },
];

const defaultFilters = {
  name: '',
  role: [],
};

// ----------------------------------------------------------------------

export default function UserCompanyyView({ moduleName }) {
  const router = useRouter();

  const navigate = useNavigate();

  const table = useTable({
    onSortChange: (newOrder, newOrderBy) => {
      fetchSortedData(newOrderBy, newOrder);
    },
  });

  const settings = useSettingsContext();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);

  const [selectedIds, setSelectedIds] = useState([]);

  const { enqueueSnackbar } = useSnackbar();

  const [confirmationText, setConfirmationText] = useState('');

  const [openModal, setOpenModal] = useState(false);

  const [password, setPassword] = useState('');

  const [email, setEmail] = useState('');

  const [profileId, setProfileId] = useState(null);

  const logSentRef = useRef(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!logSentRef.current) {
        const dynamicModuleName = moduleName || 'RECORDS MADE INACTIVE';
        logActivity('User view Company Accounts Records', dynamicModuleName);
        logSentRef.current = true;
      }
      setLoading(true);

      try {
        const token = localStorage.getItem('authToken');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            flag: 'get-company',
          },
        };
        const response = await axiosInstance.get(endpoints.restores.details, config);
        const activeUsers = response.data;
        setUsers(activeUsers);
        setTableData(activeUsers);
        if (activeUsers.length > 0) {
          setProfileId(activeUsers[0].profile_id);
        }
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
      const response = await axiosInstance.get(endpoints.restores.details, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          sortBy: sortField,
          sortOrder,
          flag: 'get-company',
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching sorted data:', error);
    }
  };

  const handleRestore = async () => {
    if (selectedIds.length === 0) {
      enqueueSnackbar('No contacts selected', { variant: 'warning' });
      return;
    }
    try {
      const idsString = selectedIds.join(',');
      const url = endpoints.restore.profile(idsString);

      await axiosInstance.patch(url);
      logActivity('User restore a record', moduleName || 'INACTIVE');
      enqueueSnackbar('Selected Profile is Restored', { variant: 'success' });
      setUsers((prevUsers) => prevUsers.filter((user) => !selectedIds.includes(user.id)));
    } catch (error) {
      enqueueSnackbar('Error restoring profile', { variant: 'error' });
      console.error('Error restoring profile:', error);
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

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

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

  const handleConfirmDeletion = async () => {
    if (!selectedIds || selectedIds.length === 0) {
      enqueueSnackbar('No row selected for deletion', { variant: 'warning' });
      return;
    }
    try {
      const idsString = selectedIds.join(',');
      const url = endpoints.inactive.delete(idsString);
      const payload = {
        email,
        password,
        profileId,
      };
      logActivity('User delete a record', moduleName || 'INACTIVE');
      const response = await axiosInstance.delete(url, { data: payload });
      enqueueSnackbar(response.data.message, { variant: 'success' });

      setUsers((prevUsers) => prevUsers.filter((user) => !selectedIds.includes(user.id)));

      setSelectedIds([]);
      setOpenModal(false);
    } catch (error) {
      console.error('Error deleting row(s):', error);
      enqueueSnackbar('Credentials are incorrect', { variant: 'error' });
    }
  };

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

  const numSelected = selectedIds.length;
  const rowCount = users.length;

  return (
    <>
      <Container maxWidth="">
        <CustomBreadcrumbs
          heading="Inactive Companies "
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'inactive companies' },
          ]}
          action={
            <Stack direction="row" spacing={5}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: 'red',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: '500',
                  textTransform: 'none', // To prevent uppercase text
                  marginRight: '10px',
                  width: '100px',
                  '&:hover': {
                    backgroundColor: '#cc0000',
                  },
                }}
                onClick={() => setOpenModal(true)}
              >
                Delete
              </Button>
              <Dialog open={openModal} onClose={() => setOpenModal(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                  <Typography sx={{ marginBottom: '20px' }}>
                    Please enter your email and password to confirm the deletion.
                  </Typography>
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ marginBottom: '20px' }}
                  />
                  <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{ marginBottom: '20px' }}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setOpenModal(false)} color="secondary">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmDeletion}
                    color="primary"
                    disabled={!email || !password} // Ensure both email and password are provided
                  >
                    Confirm
                  </Button>
                </DialogActions>
              </Dialog>

              <Button component={RouterLink} variant="contained" onClick={handleRestore}>
                RESTORE INACTIVE
              </Button>
            </Stack>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
        <Card>
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={numSelected}
              rowCount={rowCount}
              onSelectAllRows={handleSelectAllRows}
              // action={
              //   <Tooltip title="Delete">
              //     <IconButton color="primary" onClick={confirm.onTrue}>
              //       <Iconify icon="solar:trash-bin-trash-bold" />
              //     </IconButton>
              //   </Tooltip>
              // }
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
                  {users
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
                        profile_id={row.profile_uuid}
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
      (user) => user.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
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

UserCompanyyView.propTypes = {
  moduleName: PropTypes.string,
};
