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
import { useRouter } from 'src/routes/hooks';
// import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
// _mock
import { _userList } from 'src/_mock';
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
import UserTableRow from '../user-table-row-deletion';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  // { id: '', label: 'ID', width: 150 },
  // { id: '', label: 'Module', width: 180 },
  { id: '', label: 'Representative Name', width: 180 },
  { id: '', label: 'Company/Contact Name', width: 180 },
  { id: '', label: 'Full Name', width: 180 },
  { id: '', label: 'Title/Service', width: 180 },
  // { id: '', label: 'Date&Time', width: 180 },
  { id: '', width: 88 },
];

const defaultFilters = {
  name: '',
  role: [],
};

// ----------------------------------------------------------------------

export default function UserDeleteView({ moduleName }) {
  const router = useRouter();

  const navigate = useNavigate();
  const handleAvatarClick = () => {
    navigate(paths.dashboard.user.companydetailsinfo);
  };
  const table = useTable();

  const settings = useSettingsContext();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState(_userList);

  const [filters, setFilters] = useState(defaultFilters);

  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);

  const [selectedIds, setSelectedIds] = useState([]);

  const { enqueueSnackbar } = useSnackbar();

  const [openModal, setOpenModal] = useState(false);

  const [password, setPassword] = useState('');

  const [email, setEmail] = useState('');

  const [isRemoveMark, setIsRemoveMark] = useState(false);
  const logSentRef = useRef(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!logSentRef.current) {
        const dynamicModuleName = moduleName || 'RECORDS MARKED FOR DELETION';
        logActivity('User view marked for deletion', dynamicModuleName);
        logSentRef.current = true;
      }
      setLoading(true);

      try {
        const token = sessionStorage.getItem('authToken');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axiosInstance.get(endpoints.markdelete.marked_profiles, config);
        const markprofile = response.data.data;
        setUsers(markprofile);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [moduleName]);

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

  const handleActionClick = (actionType) => {
    setIsRemoveMark(actionType);
    setOpenModal(true);
  };

  // Handle Delete and Remove Mark
  const handleConfirmDeletion = async () => {
    logActivity('User restore the record from marked', moduleName || 'RECORDS MARKED FOR DELETION');
    if (!selectedIds || selectedIds.length === 0) {
      enqueueSnackbar('No row selected for deletion', { variant: 'warning' });
      return;
    }
    try {
      const idsString = selectedIds.join(',');
      const url = endpoints.markdelete.confirmdelete(idsString);
      const params = isRemoveMark ? { removeOnlyMark: true } : {};
      const payload = {
        email,
        password,
      };
      await axiosInstance.delete(url, { data: payload, params });
      const successMessage = isRemoveMark ? 'Mark removed successfully' : 'Deleted successfully';
      enqueueSnackbar(successMessage, { variant: 'success' });
      setUsers((prevUsers) => prevUsers.filter((user) => !selectedIds.includes(user.id)));
      setSelectedIds([]);
      setOpenModal(false);
    } catch (error) {
      if (error.response?.data?.message) {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      } else {
        enqueueSnackbar('An error occurred. Please try again.', { variant: 'error' });
      }
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
          heading="Marked For Delete"
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'delete' }]}
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
                    backgroundColor: '#cc0000', // Darker shade on hover
                  },
                }}
                onClick={() => handleActionClick(false)}
              >
                Delete
              </Button>

              <Button variant="contained" onClick={() => handleActionClick(true)}>
                Remove Mark
              </Button>
              {/* Modal for Password Confirmation */}
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

UserDeleteView.propTypes = {
  moduleName: PropTypes.string,
};
