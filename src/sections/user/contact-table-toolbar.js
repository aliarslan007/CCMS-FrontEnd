import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
// @mui
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
} from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
// components
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import Iconify from 'src/components/iconify';
import axiosInstance, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export default function UserTableToolbar({
  filters,
  onFilters,
  //
  roleOptions,
  selectedTypes,
  onTypeChange,
  onExport,
  onImport,
}) {
  const popover = usePopover();

  const [localSelectedTypes, setLocalSelectedTypes] = useState(selectedTypes || []);

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [companyOptions, setCompanyOptions] = useState([]);

  const [open, setOpen] = useState(false);

  const [selectedFields, setSelectedFields] = useState([]);

  const fields = [
    'company_account_id',
    'client_first_name',
    'client_last_name',
    'title',
    'reports_to',
    'responsibilities',
    'special_notes',
    'location_address1',
    'location_address2',
    'city',
    'country',
    'state',
    'zip',
    'office_phone1',
    'office_phone2',
    'cell_phone1',
    'cell_phone2',
    'office_email',
    'personal_email',
    'photo_url',
    'is_active',
    'follow_up_date',
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem('authToken');
        const response = await axiosInstance.get(endpoints.contact.details, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const activeUsers = response.data.filter((user) => user.is_active === 1);
        const companies = activeUsers.map((user) => ({
          id: user.company_account_id,
          name: user.company_name,
        }));

        const uniqueCompanies = Array.from(new Set(companies.map((company) => company.id))).map(
          (id) => companies.find((company) => company.id === id)
        );

        setCompanyOptions(uniqueCompanies);
        setUsers(activeUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const fileInputRef = useRef();

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(
      (file) => file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    if (validFiles.length > 0) {
      validFiles.forEach((file) => {
        onImport(file);
      });
    } else {
      console.error('Invalid file type. Please upload Excel files only.');
    }

    event.target.value = '';
  };

  const handleChange = useCallback(
    (event) => {
      const selectedValues = event.target.value;
      setLocalSelectedTypes(selectedValues);

      onTypeChange(selectedValues);
    },
    [onTypeChange]
  );

  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const toggleFieldSelection = (field) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const handleSelectAll = () => {
    if (selectedFields.length === fields.length) {
      setSelectedFields([]);
    } else {
      setSelectedFields(fields);
    }
  };

  const handleExportClick = () => {
    onExport(selectedFields);
    setOpen(false);
  };

  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 1 },
        }}
      >
        <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 200 },
          }}
        >
          <InputLabel>Contacts</InputLabel>

          <Select
            multiple
            value={localSelectedTypes}
            onChange={handleChange}
            input={<OutlinedInput label="companies" />}
            renderValue={(selected) => {
              const selectedCompanies = companyOptions.filter((company) =>
                selected.includes(company.id)
              );
              return selectedCompanies.map((company) => company.name).join(', ');
            }}
            MenuProps={{
              PaperProps: {
                sx: { maxHeight: 240 },
              },
            }}
          >
            {companyOptions.map((company) => (
              <MenuItem key={company.id} value={company.id}>
                <Checkbox
                  disableRipple
                  size="small"
                  checked={localSelectedTypes.includes(company.id)}
                />
                {company.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.name || ''}
            onChange={handleFilterName}
            placeholder="Search..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        {/* <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:printer-minimalistic-bold" />
          Print
        </MenuItem> */}

        <div>
          <input
            type="file"
            accept=".xlsx, .xls"
            ref={fileInputRef}
            style={{ display: 'none' }}
            // multiple
            onChange={handleFileChange}
          />

          <MenuItem
            onClick={() => {
              fileInputRef.current.click();
            }}
          >
            <Iconify icon="solar:import-bold" />
            Import
          </MenuItem>
        </div>

        <MenuItem
          onClick={() => {
            setOpen(true);
          }}
        >
          <Iconify icon="solar:export-bold" />
          Export
        </MenuItem>

        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Select Fields for Export</DialogTitle>
          <DialogContent>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedFields.length === fields.length}
                  indeterminate={selectedFields.length > 0 && selectedFields.length < fields.length}
                  onChange={handleSelectAll}
                />
              }
              label="Select All"
            />
            {fields.map((field) => (
              <FormControlLabel
                key={field}
                control={
                  <Checkbox
                    checked={selectedFields.includes(field)}
                    onChange={() => toggleFieldSelection(field)}
                  />
                }
                label={field.replace(/_/g, ' ')}
              />
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleExportClick} color="primary" disabled={!selectedFields.length}>
              Export
            </Button>
          </DialogActions>
        </Dialog>
      </CustomPopover>
    </>
  );
}

UserTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  roleOptions: PropTypes.array,
  selectedTypes: PropTypes.array, // Initial selected types
  onTypeChange: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
};
