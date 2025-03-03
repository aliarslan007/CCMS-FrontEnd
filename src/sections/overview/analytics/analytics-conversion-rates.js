import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// components
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Button,
  Card,
  Checkbox,
  FormControl,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import {} from 'src/components/chart';
import axiosInstance, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export default function AnalyticsActivityPage({ title, subheader, onFilterApply, onClearFilter }) {
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 7;
  const totalPages = Math.ceil(activityData.length / rowsPerPage);
  const paginatedData = activityData.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const fetchUserActivity = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await axiosInstance.get(endpoints.activity.user, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setActivityData(response.data);
      const usersResponse = await axiosInstance.get(endpoints.admin.details, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(usersResponse.data);
    } catch (err) {
      setError('Failed to load activity data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserActivity();
  }, []);

  const handleUserChange = (event) => {
    setSelectedUserIds(event.target.value);
  };

  const handleApplyFilter = async () => {
    try {
      const token = sessionStorage.getItem('authToken');

      const response = await axiosInstance.post(
        endpoints.activity.filter,
        {
          userIds: selectedUserIds,
          fromDate,
          toDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setActivityData(response.data.data);
      onFilterApply?.({ userIds: selectedUserIds, fromDate, toDate });
    } catch (err) {
      console.error('Error sending selected users and dates:', err);
    }
  };

  const handleDelete = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      if (selectedRows.length === 0) {
        enqueueSnackbar('No rows selected');
        return;
      }
      await axiosInstance.delete(endpoints.activity.delete, {
        data: { ids: selectedRows },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setActivityData((prevData) =>
        prevData.filter((activity) => !selectedRows.includes(activity.id))
      );
      enqueueSnackbar('Selected rows deleted successfully');
      setSelectedRows([]);
      setSelectAll(false);
    } catch (errors) {
      console.error('Error deleting rows:', errors);
      enqueueSnackbar('Failed to delete rows');
    }
  };

  const handleRowSelect = (event, rowId) => {
    if (event.target.checked) {
      setSelectedRows([...selectedRows, rowId]);
    } else {
      setSelectedRows(selectedRows.filter((id) => id !== rowId));
    }
  };

  // Handle select all checkbox change
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedRows(paginatedData.map((activity) => activity.id));
    } else {
      setSelectedRows([]);
    }
    setSelectAll(event.target.checked);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleClearFilter = () => {
    setSelectedUserIds([]);
    setFromDate('');
    setToDate('');
    fetchUserActivity();
  };

  return (
    <Card
      sx={{
        width: '100%',
        mx: 0,
        px: 0,
        boxShadow: 'none',
        borderRadius: 0,
      }}
    >
      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Users Filter Dropdown */}
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="user-filter-label">Users</InputLabel>
            <Select
              multiple
              value={selectedUserIds}
              onChange={handleUserChange}
              renderValue={(selected) =>
                users
                  .filter((user) => selected.includes(user.id))
                  .map((user) => `${user.full_name} ${user.last_name}`)
                  .join(', ')
              }
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  <Checkbox checked={selectedUserIds.includes(user.id)} />
                  <ListItemText primary={`${user.full_name} ${user.last_name}`} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Date Filter: From Date */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1,
              alignItems: { xs: 'stretch', sm: 'center' },
              p: 1,
            }}
          >
            <TextField
              label="From Date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{ flex: 1 }}
            />

            <TextField
              label="To Date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{ flex: 1 }}
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleApplyFilter}
              sx={{ flexShrink: 0 }}
            >
              Apply Filter
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              onClick={handleClearFilter}
              sx={{ flexShrink: 0 }}
            >
              Clear Filter
            </Button>

            <IconButton
              color="secondary"
              onClick={handleDelete}
              disabled={selectedRows.length === 0}
              sx={{ flexShrink: 0 }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Stack>
      </Box>
      {/* Activity Table */}
      <Typography variant="h5" component="div" gutterBottom sx={{ ml: 2, pt: 1 }}>
        USER ACTIVITY
      </Typography>
      <TableContainer
        component={Paper}
        sx={{
          height: '800px',
          width: '100%',
          overflow: 'auto',
          mx: 0,
          px: 0,
          boxShadow: 'none',
        }}
      >
        <Table sx={{ width: '100%' }}>
          <TableHead>
            <TableRow>
              <TableCell>
                <Checkbox
                  checked={selectAll}
                  onChange={handleSelectAll}
                  inputProps={{ 'aria-label': 'select all' }}
                />
              </TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Activity</TableCell>
              <TableCell>Identification</TableCell>
              <TableCell>Module</TableCell>
              <TableCell>Browser and Operating System Info</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(activity.id)}
                      onChange={(event) => handleRowSelect(event, activity.id)}
                    />
                  </TableCell>
                  <TableCell>{activity.full_name}</TableCell>
                  <TableCell>{activity.activity}</TableCell>
                  <TableCell>{activity.identification}</TableCell>
                  <TableCell>{activity.url}</TableCell>
                  <TableCell>{activity.user_agent}</TableCell>
                  <TableCell>{activity.ip_address}</TableCell>
                  <TableCell>{new Date(activity.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8}>
                  <Typography align="center">No Record Available</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 2,
          pb: 2,
          width: '100%',
          mx: 0,
          px: 0,
        }}
      >
        <Pagination
          count={totalPages}
          page={page}
          onChange={handleChangePage}
          color="primary"
          sx={{
            '& .MuiPaginationItem-root': {
              mx: 0.5, // Reduce pagination item spacing
            },
          }}
        />
      </Box>
    </Card>
  );
}

AnalyticsActivityPage.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  onFilterApply: PropTypes.func.isRequired,
  onClearFilter: PropTypes.func.isRequired,
};
