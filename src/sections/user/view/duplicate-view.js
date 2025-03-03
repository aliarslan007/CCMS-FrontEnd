import { Close as CloseIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useSnackbar } from 'src/components/snackbar';
import axiosInstance, { endpoints } from 'src/utils/axios';

// Helper function to convert header to field name
const getFieldName = (header) => {
  if (header === 'First Name') return 'firstName';
  if (header === 'Last Name') return 'lastName';
  return 'mobilePhone';
};

const DuplicateRecordsModal = ({ open, onClose, duplicates }) => {
  const [selectedDuplicates, setSelectedDuplicates] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [localDuplicates, setLocalDuplicates] = useState(duplicates);

  useEffect(() => {
    setLocalDuplicates(duplicates);
  }, [duplicates]);

  const handleCheckboxChange = (event, duplicate) => {
    if (event.target.checked) {
      setSelectedDuplicates((prevSelected) => [...prevSelected, duplicate]);
    } else {
      setSelectedDuplicates((prevSelected) => prevSelected.filter((item) => item !== duplicate));
    }
  };

  const handleEditClick = (duplicate) => {
    setEditingId(duplicate.imported_record.id);
    setEditedValues({
      firstName: duplicate.imported_record['First Name'],
      lastName: duplicate.imported_record['Last Name'],
      mobilePhone: duplicate.imported_record['Mobile Phone'],
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedValues({});
  };

  const handleSave = (duplicate) => {
    try {
      const updatedDuplicates = localDuplicates.map((d) =>
        d.imported_record.id === duplicate.imported_record.id
          ? {
              ...d,
              imported_record: {
                ...d.imported_record,
                'First Name': editedValues.firstName,
                'Last Name': editedValues.lastName,
                'Mobile Phone': editedValues.mobilePhone,
              },
            }
          : d
      );

      setLocalDuplicates(updatedDuplicates); // Update local state
      enqueueSnackbar('Changes saved successfully', { variant: 'success' });
      handleCancel();
    } catch (error) {
      console.error('Error saving changes:', error);
      enqueueSnackbar('Failed to save changes', { variant: 'error' });
    }
  };

  const { enqueueSnackbar } = useSnackbar();
  if (!duplicates?.length) return null;

  const handleYesToAll = async () => {
    try {
      const payload = {
        duplicates: localDuplicates.map((dup) => ({
          imported_record: dup.imported_record, // Use updated values
        })),
      };

      const response = await axiosInstance.post(endpoints.import.function, payload);
      enqueueSnackbar('Duplicate records processed successfully.', {
        variant: 'success',
      });
    } catch (error) {
      console.error('Error processing duplicates:', error);
      enqueueSnackbar('Failed to process duplicate records.', { variant: 'error' });
    }
  };

  const handleYes = async () => {
    try {
      const payload = {
        duplicates: selectedDuplicates.map((duplicate) => ({
          imported_record: duplicate.imported_record, 
        })),
      };

      const response = await axiosInstance.post(endpoints.import.function, payload);
      enqueueSnackbar('Selected duplicates processed successfully.', {
        variant: 'success',
      });
    } catch (error) {
      console.error('Error processing selected duplicates:', error);
      enqueueSnackbar('Failed to process selected duplicates.', { variant: 'error' });
    }
  };

  if (!localDuplicates?.length) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Duplicate Records Found</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ marginLeft: '25px' }}
      >
        <Typography variant="h6" color="primary" gutterBottom>
          Existing Record
        </Typography>

        <Typography
          variant="h6"
          color="success.main"
          gutterBottom
          sx={{ marginRight: '450px', marginBottom: '15px' }}
        >
          Imported Record
        </Typography>
      </Box>

      <DialogContent>
        {localDuplicates.map((duplicate, index) => (
          <Box key={index} mb={4}>
            <Grid container spacing={2}>
              {/* Existing Record */}
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 2, height: '100%', bgcolor: 'background.paper' }}>
                  <TableContainer component={Box}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {Object.entries(duplicate.existing_record)
                            .filter(
                              ([key]) =>
                                !['id', 'created_at', 'updated_at', 'profile_id'].includes(key)
                            )
                            .map(([key]) => (
                              <TableCell
                                key={key}
                                sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}
                              >
                                {key.replace(/_/g, ' ')}
                              </TableCell>
                            ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          {Object.entries(duplicate.existing_record)
                            .filter(
                              ([key]) =>
                                !['id', 'created_at', 'updated_at', 'profile_id'].includes(key)
                            )
                            .map(([key, value]) => (
                              <TableCell
                                key={key}
                                sx={{
                                  wordBreak: 'break-word',
                                  maxWidth: '300px',
                                }}
                              >
                                {value?.toString() || '-'}
                              </TableCell>
                            ))}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              {/* Imported Record */}
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 2, height: '100%', bgcolor: 'background.paper' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Select</TableCell>
                        {/* Display only the selected fields in the header */}
                        {['First Name', 'Last Name', 'Mobile Phone', 'Edit'].map((key) => (
                          <TableCell
                            key={key}
                            sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}
                          >
                            {key.replace(/_/g, ' ')}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <Checkbox
                            checked={selectedDuplicates.includes(duplicate)}
                            onChange={(e) => handleCheckboxChange(e, duplicate)}
                          />
                        </TableCell>
                        {['First Name', 'Last Name', 'Mobile Phone'].map((key) => {
                          const fieldName = getFieldName(key);
                          return (
                            <TableCell key={key}>
                              {editingId === duplicate.imported_record.id ? (
                                <TextField
                                  value={editedValues[fieldName] || ''}
                                  onChange={(e) =>
                                    setEditedValues((prev) => ({
                                      ...prev,
                                      [fieldName]: e.target.value,
                                    }))
                                  }
                                  size="small"
                                  fullWidth
                                />
                              ) : (
                                duplicate.imported_record[key] || '-'
                              )}
                            </TableCell>
                          );
                        })}
                        <TableCell>
                          {editingId === duplicate.imported_record.id ? (
                            <>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleSave(duplicate)}
                                sx={{ mr: 1 }}
                              >
                                Save
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={handleCancel}
                                sx={{ mt: 2 }}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleEditClick(duplicate)}
                            >
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        ))}

        {/* Confirmation Buttons */}
        <Box display="flex" justifyContent="flex-end" mt={4}>
          <Box display="flex" justifyContent="flex-end" mt={4}>
            <Button variant="contained" color="success" onClick={handleYesToAll}>
              Yes to all
            </Button>
            <Button variant="outlined" color="secondary" onClick={() => onClose()} sx={{ ml: 2 }}>
              No
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleYes}
              sx={{ ml: 2 }}
              disabled={selectedDuplicates.length === 0} // Disable if no items selected
            >
              Yes
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

DuplicateRecordsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  duplicates: PropTypes.arrayOf(
    PropTypes.shape({
      existing_record: PropTypes.shape({
        id: PropTypes.number,
        company_account_id: PropTypes.number,
        client_first_name: PropTypes.string,
        client_last_name: PropTypes.string,
        title: PropTypes.string,
        reports_to: PropTypes.string,
        their_report: PropTypes.string,
        responsibilities: PropTypes.string,
        special_notes: PropTypes.string,
        location_address1: PropTypes.string,
        location_address2: PropTypes.string,
        city: PropTypes.string,
        country: PropTypes.string,
        state: PropTypes.string,
        zip: PropTypes.string,
        office_phone1: PropTypes.string,
        office_phone2: PropTypes.string,
        cell_phone1: PropTypes.string,
        cell_phone2: PropTypes.string,
        office_email: PropTypes.string,
        personal_email: PropTypes.string,
        photo_url: PropTypes.string,
        is_active: PropTypes.number,
        access: PropTypes.string,
        follow_up_date: PropTypes.string,
      }).isRequired,
      imported_record: PropTypes.object.isRequired,
    })
  ),
};

DuplicateRecordsModal.defaultProps = {
  duplicates: [],
};

export default DuplicateRecordsModal;
