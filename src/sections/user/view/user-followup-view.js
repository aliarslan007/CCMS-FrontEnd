import isEqual from 'lodash/isEqual';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import UserTableToolbar from '../followup-table-toolbar';
import UserTableFiltersResult from '../user-table-filters-result';
import UserTableRow from '../user-table-row-contact';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'company', label: 'Company Name', width: '15%' },
  { id: 'phoneNumber', label: 'Title', width: '15%' },
  { id: 'company', label: 'First Name', width: '15%' },
  { id: 'company', label: 'Last Name', width: '15%' },
  { id: '', label: 'Email Address', width: '15%' },
  { id: '', label: 'Recent Notes', width: '15%' },
  { id: '', label: 'Follow Up', width: '15%' },
  { id: '', width: '10%' },
];

const defaultFilters = {
  name: '',
  role: [],
};

// ----------------------------------------------------------------------

export default function OverviewContactAccountView({ moduleName }) {
  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState([]);

  const [filters, setFilters] = useState(defaultFilters);

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedIds, setSelectedIds] = useState([]);

  const { enqueueSnackbar } = useSnackbar();

  const [selectedCompanyTypes, setSelectedCompanyTypes] = useState(filters?.companyType || []);

  const logSentRef = useRef(false);

  useEffect(() => {
    const fetchFollowUps = async () => {
      if (!logSentRef.current) {
        const dynamicModuleName = moduleName || 'FOLLOW UPS';
        logActivity('User view follow ups', dynamicModuleName);
        logSentRef.current = true;
      }
      setLoading(true);
      const userId = sessionStorage.getItem('userid');

      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get(endpoints.follow_ups.date, {
          params: { profile_id: userId },
        });

        const followUps = response.data.data.filter((user) => user.is_active === 1);
        setUsers(followUps);
        setTableData(followUps);
      } catch (error) {
        console.error('Error fetching follow-up dates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowUps();
  }, [moduleName]);

  // Handle Filter For Contacts
  const handleTypeChange = async (updatedTypes) => {
    setSelectedCompanyTypes(updatedTypes);

    if (updatedTypes.length === 0) {
      try {
        const response = await axiosInstance.get(endpoints.contact.details);
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
          model: 'company_contact',
          company_account_id: updatedTypes.join(','),
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

  // Handle search functionality
  const fetchFilteredData = async (nameFilter) => {
    const userId = sessionStorage.getItem('userid');
    try {
      const response = await axiosInstance.get(endpoints.follow_ups.date, {
        params: {
          name: nameFilter,
          profile_id: userId,
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
          heading="Follow Up"
          links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Follow Up' }]}
          // action={
          //   <Stack direction="row" spacing={5}>
          //     <Button
          //       variant="contained"
          //       sx={{
          //         width: '100px',
          //       }}
          //       color="warning"
          //       onClick={handleMarkInactive}
          //     >
          //        Inactive
          //     </Button>
          //     <Button
          //       component={RouterLink}
          //       href={paths.dashboard.user.companycontact}
          //       variant="contained"
          //       startIcon={<Iconify icon="mingcute:add-line" />}
          //     >
          //       New Contact
          //     </Button>
          //   </Stack>
          // }
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
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar sx={{ maxHeight: 400 }}>
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
