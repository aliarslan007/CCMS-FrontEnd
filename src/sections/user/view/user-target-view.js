import { useEffect, useRef, useState } from 'react';
// @mui
import Container from '@mui/material/Container';
// routes
// import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
// components
import {
  Button,
  Checkbox,
  FormControl,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { format } from 'date-fns';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

//
import PropTypes from 'prop-types';
import { useSnackbar } from 'src/components/snackbar';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { logActivity } from 'src/utils/log-activity';

// ----------------------------------------------------------------------

export default function UserTargetView({ moduleName }) {
  const { enqueueSnackbar } = useSnackbar();

  const [users, setUsers] = useState([]);

  const [selectedUsers, setSelectedUsers] = useState(null);

  const [projectName, setProjectName] = useState('');

  const [targets, setTargets] = useState([]);

  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [editedValue, setEditedValue] = useState('');

  const [tempValue, setTempValue] = useState('');

  const [sessionrole, setRole] = useState('');

  const logSentRef = useRef(false);

  useEffect(() => {
    const Role = sessionStorage.getItem('userRole');
    setRole(Role);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userId = sessionStorage.getItem('userid');

        const params = { userId };
        if (sessionrole === 'Sales Manager') {
          params.isManager = true;
        }

        const response = await axiosInstance.get(endpoints.admin.details, { params });

        const activeUsers = response.data.map((user) => ({
          id: user.id,
          full_name: user.full_name,
          last_name: user.last_name,
        }));

        setUsers(activeUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [sessionrole]);

  useEffect(() => {
    const fetchTargets = async () => {
      if (!logSentRef.current) {
        const dynamicModuleName = moduleName || 'REPORTS';
        logActivity('User view target', dynamicModuleName);
        logSentRef.current = true;
      }
      try {
        setLoading(true);

        // Get user role and ID from session storage
        const role = sessionStorage.getItem('userRole');
        const userId = sessionStorage.getItem('userid');

        let response;

        if (role === 'Admin') {
          response = await axiosInstance.get(endpoints.store.target, {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
            },
          });
        } else if (role === 'Sales Representative' || role === 'Sales Manager') {
          response = await axiosInstance.get(endpoints.store.target, {
            params: { targeted_user_id: userId },
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
            },
          });
        }

        if (response) {
          setTargets(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching targets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTargets();
  }, [moduleName]);

  const handleUserChange = (event) => {
    setSelectedUsers(event.target.value);
  };

  const handleEditClick = (target) => {
    setEditingId(target.id);
    setTempValue(target.target_value);
    setEditedValue(target.target_value);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedValue('');
    setTempValue('');
  };

  const handleDelete = async (id) => {
    logActivity('User deleted target', moduleName || 'REPORTS');
    try {
      await axiosInstance.delete(endpoints.store.del(id));

      setTargets((prevTargets) => prevTargets.filter((target) => target.id !== id));

      enqueueSnackbar('Target deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error('Delete failed:', error);
      enqueueSnackbar('Failed to delete target', { variant: 'error' });
    }
  };

  const handleSubmit = async () => {
    const userId = sessionStorage.getItem('userid');

    const payload = {
      user_id: userId,
      targeted_user_id: selectedUsers,
      target_value: projectName,
    };

    try {
      setLoading(true);
      const response = await axiosInstance.post(endpoints.store.target, payload, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
        },
      });

      const newTarget = response.data.data;

      setTargets((prevTargets) => [...prevTargets, newTarget]);

      enqueueSnackbar('Target created successfully!', { variant: 'success' });

      // Reset form fields
      setProjectName('');
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error submitting pipeline:', error);

      if (error.response) {
        const errorMessage =
          error.response.data?.message || 'Failed to create pipeline. Please try again.';
        enqueueSnackbar(errorMessage, { variant: 'error' });
      } else {
        enqueueSnackbar('Something went wrong. Please check your network and try again.', {
          variant: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (targetId) => {
    const targetToUpdate = targets.find((t) => t.id === targetId);
    if (!targetToUpdate) return; // Ensure the target exists

    try {
      await axiosInstance.put(endpoints.store.target, {
        target_value: editedValue,
        targeted_user_id: targetToUpdate.targeted_user_id,
      });
      logActivity('User edit the existing target vlaue', moduleName || 'REPORTS');
      setTargets(
        targets.map((currentTarget) =>
          currentTarget.id === targetId
            ? { ...currentTarget, target_value: editedValue }
            : currentTarget
        )
      );

      enqueueSnackbar('Target updated successfully', { variant: 'success' });
      handleCancel();
    } catch (error) {
      console.error('Update failed:', error);
      enqueueSnackbar('Failed to update target', { variant: 'error' });
    }
  };

  return (
    <Container maxWidth="" sx={{ mb: 3.5 }}>
      {/* Existing Table and Content */}
      <CustomBreadcrumbs
        heading="Target"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'target' }]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {(sessionrole === 'Admin' || sessionrole === 'Sales Manager') && (
        <Grid container spacing={2}>
          {/* Select Company Dropdown */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Select Users</InputLabel>
              <Select
                value={selectedUsers} // Use single value for selected user
                onChange={handleUserChange}
                renderValue={(selected) => {
                  const selectedUser = users.find((user) => user.id === selected);
                  return selectedUser ? `${selectedUser.full_name} ${selectedUser.last_name}` : '';
                }}
                label="Select User"
              >
                {users.length > 0 ? (
                  users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      <Checkbox checked={selectedUsers === user.id} />
                      <ListItemText primary={`${user.full_name} ${user.last_name}`} />
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No Users available</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>

          {/* Project Name TextField (Target Value) */}
          <Grid item xs={12} md={3}>
            <TextField
              label="Add Target"
              fullWidth
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={handleSubmit} size="small">
              Save
            </Button>
          </Grid>
        </Grid>
      )}

      <TableContainer component={Paper} sx={{ mt: 10, maxHeight: '500px', overflow: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User Name</TableCell>
              <TableCell>Target Value</TableCell>
              <TableCell>Targeted Year</TableCell>
              {(sessionrole === 'Admin' || sessionrole === 'Sales Manager') && (
                <TableCell>Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4}>Loading...</TableCell>
              </TableRow>
            ) : (
              targets.map((target) => (
                <TableRow key={target.id}>
                  <TableCell>{`${target.full_name} ${target.last_name}`}</TableCell>
                  <TableCell>
                    {editingId === target.id ? (
                      <TextField
                        value={editedValue}
                        onChange={(e) => setEditedValue(e.target.value)}
                        size="small"
                        type="number"
                      />
                    ) : (
                      target.target_value
                    )}
                  </TableCell>
                  <TableCell>
                    {target.created_at
                      ? format(new Date(target.created_at), 'yyyy')
                      : target.professional_name}
                  </TableCell>

                  {(sessionrole === 'Admin' || sessionrole === 'Sales Manager') && (
                    <TableCell>
                      {editingId === target.id ? (
                        <>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleSave(target.id)}
                            sx={{ mr: 1 }}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={handleCancel}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleEditClick(target)}
                            sx={{ mr: 1 }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleDelete(target.id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
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

UserTargetView.propTypes = {
  moduleName: PropTypes.string,
};
