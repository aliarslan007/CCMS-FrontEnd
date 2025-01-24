import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
// @mui
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
}) {
  const popover = usePopover();

  const [localSelectedTypes, setLocalSelectedTypes] = useState(selectedTypes || []);

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [companyOptions, setCompanyOptions] = useState([]);

  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     setLoading(true);
  //     try {
  //       const response = await axiosInstance.get(endpoints.contact.details);
  //       const activeUsers = response.data.filter((user) => user.is_active === 1);
  
  //       const companies = activeUsers.map((user) => ({
  //         id: user.company_account_id, 
  //         name: user.company_name,      
  //       }));
  
  //       const uniqueCompanies = Array.from(new Set(companies.map((company) => company.id)))
  //         .map(id => companies.find(company => company.id === id));
  
  //       setCompanyOptions(uniqueCompanies); 
  //       setUsers(activeUsers);  
  //     } catch (error) {
  //       console.error('Error fetching users:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchUsers();
  // }, []);

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

  const handleFilterRole = useCallback(
    (event) => {
      onFilters(
        'role',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [onFilters]
  );

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
        {/* <FormControl
          sx={{
            flexShrink: 0,
            width: { xs: 1, md: 200 },
          }}
        >
          <InputLabel>Contacts</InputLabel>

          <Select
            multiple
            value={localSelectedTypes} // Ensure it's always an array
            onChange={handleChange}
            input={<OutlinedInput label="companies" />}
            renderValue={(selected) => {
              const selectedCompanies = companyOptions.filter(company =>
                selected.includes(company.id)
              );
              return selectedCompanies.map(company => company.name).join(', ');
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
        </FormControl> */}

        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.name || ''}
            onChange={handleFilterName}
            placeholder="Search by followup date..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          {/* <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton> */}
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

        <MenuItem
          onClick={() => {
            popover.onClose();
          }}
        >
          <Iconify icon="solar:import-bold" />
          Import
        </MenuItem>

        <MenuItem
        onClick={() => {
          popover.onClose();
          onExport(); 
        }}
      >
        <Iconify icon="solar:export-bold" />
        Export
      </MenuItem>
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
};
