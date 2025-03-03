import { yupResolver } from '@hookform/resolvers/yup';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as Yup from 'yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
// utils
// routes
// assets
import { countries } from 'src/assets/data';
// components
import { Checkbox, FormControl, InputLabel, ListItemText, MenuItem, Select } from '@mui/material';
import imageCompression from 'browser-image-compression';
import FormProvider, {
  RHFAutocomplete,
  RHFTextField,
  RHFUploadAvatar,
} from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { logActivity } from 'src/utils/log-activity';

// ----------------------------------------------------------------------
// Initial dropdown options
const companyTypes = [
  'Customer',
  'Wireless Service Provider',
  'Wireline Service Provider',
  'Manufacturer',
  'OEM',
  'General Contractor',
  'Parts Supplier',
  'Consultant',
  'Legal',
  'Accountant',
  'Misc.',
];

export default function UserCompanyEditForm({ moduleName }) {
  const { enqueueSnackbar } = useSnackbar();

  const [isCompressing, setIsCompressing] = useState(false);

  const [saving, setSaving] = useState(false);

  const [statesList, setStatesList] = useState([]);

  const [selectedStates, setSelectedStates] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 100;

  const [phoneNumber, setPhoneNumber] = useState('');

  const logSentRef = useRef(false);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const stateresponse = await axiosInstance.get(endpoints.state.function);
        setStatesList(stateresponse.data);
      } catch (error) {
        console.error('Failed to fetch states:', error);
      }
    };

    fetchStates();
  }, []);

  const handlePhoneNumberChange = (event) => {
    const input = event.target.value;
    const formattedPhoneNumber = input && !input.startsWith('+') ? `+${input}` : input; // Ternary operator

    setPhoneNumber(formattedPhoneNumber);
  };

  const NewUserSchema = Yup.object().shape({
    company_name: Yup.string().required('Company name is required'),
    company_type: Yup.string().required('Company type is required'),
    service: Yup.string().nullable(),
    address1: Yup.string().required('Address line 1 is required'),
    address2: Yup.string().nullable(),
    city: Yup.string().required('City is required'),
    country: Yup.string().required('Country is required'),
    state: Yup.string().required('State is required'),
    zip: Yup.string().required('Zip code is required'),
    phone_number: Yup.string().required('Phone number is required'),
    website: Yup.string().url('Website must be a valid URL').nullable(),
    facebook_url: Yup.string().url('Facebook URL must be a valid URL').nullable(),
    linkedin_url: Yup.string().url('LinkedIn URL must be a valid URL').nullable(),
    photo_url: Yup.mixed().nullable().required('Company photo is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues: {
      company_name: '',
      company_type: '',
      service: '',
      address1: '',
      address2: '',
      city: '',
      country: '',
      state: '',
      zip: '',
      phone_number: '',
      website: '',
      facebook_url: '',
      linkedin_url: '',
      photo_url: '',
    },
  });

  const {
    watch,
    control,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const handleSaveChanges = async (data) => {
    if (!logSentRef.current) {
      const dynamicModuleName = moduleName || 'CLIENT ACCOUNT MANAGMENT';
      logActivity('User creates a new Company', dynamicModuleName);
      logSentRef.current = true;
    }
    const formData = new FormData();
    const token = sessionStorage.getItem('authToken');

    // Append all fields except photoURL
    formData.append('company_name', data.company_name);
    formData.append('company_type', data.company_type);
    formData.append('service', data.service);
    formData.append('address1', data.address1);
    formData.append('address2', data.address2);
    formData.append('city', data.city);
    formData.append('country', data.country);
    formData.append('zip', data.zip);
    formData.append('phone_number', phoneNumber);
    formData.append('website', data.website);
    formData.append('facebook_url', data.facebook_url);
    formData.append('linkedin_url', data.linkedin_url);
    if (data.photo_url && data.photo_url instanceof File) {
      formData.append('photo_url', data.photo_url);
    }
    if (selectedStates.length > 0) {
      formData.append('state', selectedStates.join(','));
    } else {
      formData.append('state', '');
    }

    formData.append('_method', 'POST');

    try {
      await axiosInstance.post(endpoints.companies.accounts, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`, // Include the token
        },
      });

      enqueueSnackbar('Company created successfully', { variant: 'success' });
      // window.location.reload();
    } catch (error) {
      console.error('Error details:', error.response ? error.response.data : error);

      if (error.response && error.response.data) {
        const errorData = error.response.data;

        if (errorData.errors) {
          const errorMessages = errorData.errors;
          Object.keys(errorMessages).forEach((field) => {
            enqueueSnackbar(`${field}: ${errorMessages[field].join(', ')}`, { variant: 'error' });
          });
        } else if (errorData.message) {
          enqueueSnackbar(errorData.message, { variant: 'error' });
        } else {
          enqueueSnackbar('Error saving company details', { variant: 'error' });
        }
      } else {
        enqueueSnackbar('An unexpected error occurred', { variant: 'error' });
      }
    }
  };

  const onSubmit = (data) => {
    handleSaveChanges(data);
  };

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        try {
          setIsCompressing(true);
          const options = {
            maxSizeMB: 0.8,
            maxWidthOrHeight: 600,
            useWebWorker: true,
          };

          const compressedFile = await imageCompression(file, options);

          const recreatedFile = new File([compressedFile], file.name, {
            type: compressedFile.type,
            lastModified: compressedFile.lastModified,
          });

          const newFile = Object.assign(recreatedFile, {
            preview: URL.createObjectURL(recreatedFile),
          });

          setValue('photo_url', newFile, { shouldValidate: true });
          setIsCompressing(false);
        } catch (error) {
          setIsCompressing(false);
          console.error('Error compressing image:', error);
        }
      }
    },
    [setValue]
  );

  const handleChange = (event) => {
    const { value } = event.target;

    if (value.includes('all')) {
      if (selectedStates.length === statesList.length) {
        setSelectedStates([]);
      } else {
        setSelectedStates(statesList.map((state) => state.name));
      }
    } else {
      setSelectedStates(value);
    }
  };

  const totalPages = Math.ceil(statesList.length / itemsPerPage);
  const currentItems = statesList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const isAllSelected = selectedStates.length === statesList.length;

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3, height: '100%' }}>
            <Box sx={{ mb: 5 }}>
              {isCompressing && <p>Compressing image, please wait...</p>}
              <RHFUploadAvatar
                name="photo_url"
                onDrop={handleDrop}
                helperText={
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 3,
                      mx: 'auto',
                      display: 'block',
                      textAlign: 'center',
                      color: 'text.disabled',
                    }}
                  >
                    Allowed *.jpeg, *.jpg, *.png, *.gif
                  </Typography>
                }
              />
            </Box>
          </Card>
        </Grid>

        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="company_name" label="Company Name" />
              <FormControl fullWidth variant="outlined">
                <InputLabel>Company Type</InputLabel>
                <Controller
                  name="company_type"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Select {...field} label="Company Type">
                      {companyTypes.map((type, index) => (
                        <MenuItem key={index} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
              <RHFTextField name="service" label="Services" />
              <RHFTextField name="address1" label="Company Address 1" />
              <RHFTextField name="address2" label="Company Address 2" />
              <RHFTextField name="city" label="City" />

              <RHFAutocomplete
                name="country"
                label="Country"
                options={countries.map((country) => country.label)}
                getOptionLabel={(option) => option}
                isOptionEqualToValue={(option, value) => option === value}
                renderOption={(props, option) => {
                  const { code, label, phone } = countries.filter(
                    (country) => country.label === option
                  )[0];

                  if (!label) {
                    return null;
                  }

                  return (
                    <li {...props} key={label}>
                      <Iconify
                        key={label}
                        icon={`circle-flags:${code.toLowerCase()}`}
                        width={28}
                        sx={{ mr: 1 }}
                      />
                      {label} ({code}) +{phone}
                    </li>
                  );
                }}
              />

              <FormControl fullWidth>
                <InputLabel>State/Province</InputLabel>
                <Select
                  multiple
                  value={selectedStates}
                  onChange={handleChange}
                  renderValue={(selected) => selected.join(', ')}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                        overflowY: 'auto',
                      },
                    },
                  }}
                >
                  <MenuItem value="all">
                    <Checkbox checked={isAllSelected} />
                    <ListItemText primary="Select All" />
                  </MenuItem>
                  {currentItems.map((state) => (
                    <MenuItem key={state.name} value={state.name}>
                      <Checkbox checked={selectedStates.includes(state.name)} />
                      <ListItemText primary={`${state.name} (${state.country})`} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <RHFTextField name="zip" label="Zip Code/Postal Code" />
              <RHFTextField
                name="phone_number"
                label="Main Phone Number"
                placeholder="12345678901"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
              />
              <RHFTextField name="website" label="Website" placeholder="www.example.com" />
              <RHFTextField
                name="linkedin_url"
                label="LinkedIn URL"
                placeholder="www.linkedin.com/in/username"
              />
              <RHFTextField
                name="facebook_url"
                label="Facebook URL"
                placeholder="www.facebook.com/someprofile"
              />
            </Box>

            <Stack alignItems="flex-end" sx={{ mb: 3.5 }}>
              <LoadingButton
                variant="contained"
                onClick={(e) => {
                  handleSaveChanges(watch()); // Directly pass data from form state (watch)
                }}
                disabled={saving}
              >
                {saving ? 'Create Company...' : 'Create Company'}
              </LoadingButton>
            </Stack>
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
    </FormProvider>
  );
}

UserCompanyEditForm.propTypes = {
  currentUser: PropTypes.object,
  moduleName: PropTypes.string,
};
