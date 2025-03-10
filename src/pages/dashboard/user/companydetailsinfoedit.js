import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import * as Yup from 'yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import { Checkbox, FormControl, InputLabel, ListItemText, MenuItem, Select } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
// utils
// assets
import { countries } from 'src/assets/data';
// components
import imageCompression from 'browser-image-compression';
import PropTypes from 'prop-types';
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

export default function CompanyDetailsInfoEdit({ moduleName }) {
  const { id } = useParams();
  const { uuid } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const { user } = useMockedUser();

  const [isEditable, setIsEditable] = useState(false);

  const [loading, setLoading] = useState(true);

  const [companyDetails, setCompanyDetails] = useState(null);

  const [isCompressing, setIsCompressing] = useState(false);

  const [saving, setSaving] = useState(false);

  const [statesList, setStatesList] = useState([]);

  const [selectedStates, setSelectedStates] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 100;

  const [phoneNumber, setPhoneNumber] = useState('');

  const handlePhoneNumberChange = (event) => {
    const input = event.target.value;
    const formattedPhoneNumber = input && !input.startsWith('+') ? `+${input}` : input;

    setPhoneNumber(formattedPhoneNumber);
  };

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axiosInstance.get(endpoints.details.accounts(id), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const stateresponse = await axiosInstance.get(endpoints.state.function);
        setStatesList(stateresponse.data);
        setCompanyDetails(response.data);

        setLoading(false);
      } catch (error) {
        enqueueSnackbar('Error loading company details', { variant: 'error' });
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [id, enqueueSnackbar]);

  const UpdateUserSchema = Yup.object().shape({
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
    resolver: yupResolver(UpdateUserSchema),
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

  const { setValue, watch } = methods;

  const values = watch();

  useEffect(() => {
    if (companyDetails) {
      setValue('company_name', companyDetails.company_name);
      setValue('company_type', companyDetails.company_type);
      setValue('service', companyDetails.service);
      setValue('address1', companyDetails.address1);
      setValue('address2', companyDetails.address2);
      setValue('city', companyDetails.city);
      setValue('country', companyDetails.country);
      setValue('zip', companyDetails.zip);
      setValue('phone_number', companyDetails.phone_number);
      setPhoneNumber(companyDetails.phone_number);
      setValue('website', companyDetails.website);
      setValue('facebook_url', companyDetails.facebook_url);
      setValue('linkedin_url', companyDetails.linkedin_url);
      setValue('photo_url', companyDetails.photo_url);
      if (companyDetails.state) {
        setSelectedStates([companyDetails.state]);
      }
    }
  }, [companyDetails, setValue]);

  const token = localStorage.getItem('authToken');
  const handleSaveChanges = async (data) => {
    logActivity('User edit company details', moduleName || 'COMPANY EDIT DETAILS', {
      identification: companyDetails.company_name,
    });
    const formData = new FormData();

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
      const userId = companyDetails.uuid;

      const dynamicEndpoint = endpoints.details.accounts(userId);

      await axiosInstance.post(dynamicEndpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      enqueueSnackbar('Company details updated successfully', { variant: 'success' });

      const updatedResponse = await axiosInstance.get(dynamicEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCompanyDetails(updatedResponse.data);

      methods.reset(updatedResponse.data);

      setIsEditable(false);
    } catch (error) {
      console.error('Error details:', error.response ? error.response.data : error);
      if (error.response && error.response.data && error.response.data.errors) {
        const errorMessages = error.response.data.errors;
        Object.keys(errorMessages).forEach((field) => {
          enqueueSnackbar(`${field}: ${errorMessages[field].join(', ')}`, { variant: 'error' });
        });
      } else {
        enqueueSnackbar('Error saving company details', { variant: 'error' });
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

  const handleEditClick = () => {
    setIsEditable(true);
  };

  const handleCancel = () => {
    setIsEditable(false);
  };

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
          <Card sx={{ pt: 10, pb: 5, px: 3, textAlign: 'center' }}>
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
              <RHFTextField name="company_name" label="Company Name" disabled={!isEditable} />
              <RHFTextField name="company_type" label="Company Type" disabled={!isEditable} />
              <RHFTextField name="service" label="Services" disabled={!isEditable} />
              <RHFTextField name="address1" label="Company Address 1" disabled={!isEditable} />
              <RHFTextField name="address2" label="Company Address 2" disabled={!isEditable} />
              <RHFTextField name="city" label="City" disabled={!isEditable} />
              {!isEditable ? (
                <RHFTextField
                  name="state"
                  label="State/Province"
                  value={selectedStates.join(', ')}
                  disabled
                  fullWidth
                />
              ) : (
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
              )}

              <RHFAutocomplete
                name="country"
                label="Country"
                options={countries.map((country) => country.label)}
                getOptionLabel={(option) => option}
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
                disabled={!isEditable}
              />
              <RHFTextField name="zip" label="Zip/Code" disabled={!isEditable} />
              <RHFTextField
                name="phone_number"
                label="Main Phone Number"
                placeholder="12345678901"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                disabled={!isEditable}
              />
              <RHFTextField
                name="website"
                label="Website"
                placeholder="www.website.com"
                disabled={!isEditable}
              />
              <RHFTextField
                name="linkedin_url"
                label="LinkedIn url"
                placeholder="www.linkedin.com/in/username"
                disabled={!isEditable}
              />
              <RHFTextField
                name="facebook_url"
                label="Facebook url"
                placeholder="www.facebook.com/someprofile"
                disabled={!isEditable}
              />
            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <Box>
                {isEditable ? (
                  <>
                    <LoadingButton variant="outlined" onClick={handleCancel} sx={{ ml: 7, mr: 2 }}>
                      Cancel
                    </LoadingButton>
                    <LoadingButton
                      variant="contained"
                      onClick={(e) => {
                        handleSaveChanges(watch()); // Directly pass data from form state (watch)
                      }}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </LoadingButton>
                  </>
                ) : (
                  <LoadingButton variant="contained" onClick={handleEditClick}>
                    Edit
                  </LoadingButton>
                )}
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
CompanyDetailsInfoEdit.propTypes = {
  moduleName: PropTypes.string,
};
