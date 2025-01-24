import { yupResolver } from '@hookform/resolvers/yup';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import * as Yup from 'yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
// utils
// routes
import { useRouter } from 'src/routes/hooks';
// assets
import { countries } from 'src/assets/data';
// components
import imageCompression from 'browser-image-compression';
import FormProvider, {
  RHFAutocomplete,
  RHFTextField,
  RHFUploadAvatar,
} from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import axiosInstance, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

const permissionssName = ['Full Access', 'Partial Access', 'Limited', 'View Only'];
export default function UserCompanyContactEditForm() {
  const { id } = useParams();
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const [companyDetails, setCompanyDetails] = useState([]);

  const [adminDetails, setAdminDetails] = useState([]);

  const [selectedCompanyId, setSelectedCompanyId] = useState('');

  const [reportsName, setReportsName] = useState([]);

  const [selectedAdminId, setSelectedAdminId] = useState('');

  const [loading, setLoading] = useState(true);

  const [uploadedFile, setUploadedFile] = useState(null);

  const [isCompressing, setIsCompressing] = useState(false);

  const [saving, setSaving] = useState(false);

  const [statesList, setStatesList] = useState([]);

  const [selectedStates, setSelectedStates] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  // Fetch the companies for Admin and User{Only those companies are fetched which are related to that user}
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem('authToken');

        let companyResponse;
        if (id) {
          companyResponse = await axiosInstance.get(endpoints.complete.accounts(id), {
            params: { contact_company: true },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } else {
          companyResponse = await axiosInstance.get(endpoints.all.company, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          companyResponse.data = companyResponse.data.filter((company) => company.is_active === 1);
        }
        const adminResponse = await axiosInstance.get(endpoints.admin.details);

        const stateresponse = await axiosInstance.get(endpoints.state.function);

        setStatesList(stateresponse.data);

        setCompanyDetails(companyResponse.data);

        setAdminDetails(adminResponse.data);

        setLoading(false);
      } catch (error) {
        enqueueSnackbar('Error loading data', { variant: 'error' });
        setLoading(false);
      }
    };

    fetchData();
  }, [id, enqueueSnackbar]);

  // Handle the Reports To field {“Reports To” we need to display the list of ALL users that were previously created under this company.}
  const fetchCompanyContacts = useCallback(async () => {
    if (!selectedCompanyId) return;
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/reports-to/${selectedCompanyId}`);
      const formattedNames = response.data.map(
        (report) => `${report.client_first_name} ${report.client_last_name}, ${report.title}`
      );
      setReportsName(formattedNames); // Set the formatted string
    } catch (error) {
      console.error('Error fetching company contacts:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    fetchCompanyContacts(selectedCompanyId);
  }, [fetchCompanyContacts, selectedCompanyId]);

  const NewUserSchema = Yup.object().shape({
    client_first_name: Yup.string()
      .nullable()
      .max(255, 'First name must be at most 255 characters'),
    client_last_name: Yup.string().nullable().max(255, 'Last name must be at most 255 characters'),
    title: Yup.string().nullable().max(255, 'Title must be at most 255 characters'),
    reports_to: Yup.string().nullable().max(255, 'Reports To must be at most 255 characters'),
    responsibilities: Yup.string().nullable(),
    special_notes: Yup.string().nullable(),
    location_address1: Yup.string().nullable(),
    location_address2: Yup.string().nullable(),
    city: Yup.string().nullable(),
    country: Yup.string().nullable(),
    state: Yup.string().nullable(),
    zip: Yup.string().nullable(),
    office_phone1: Yup.string().nullable(),
    office_phone2: Yup.string().nullable(),
    cell_phone1: Yup.string().nullable(),
    cell_phone2: Yup.string().nullable(),
    office_email: Yup.string().nullable().email('Office email must be a valid email address'),
    personal_email: Yup.string().nullable().email('Personal email must be a valid email address'),
    photo_url: Yup.string().nullable().url('Photo URL must be a valid URL'),
    assigned_agent: Yup.string(),
    access: Yup.string(),
    their_report: Yup.string().nullable().url(),
  });

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues: {
      client_first_name: '',
      client_last_name: '',
      title: '',
      reports_to: '',
      responsibilities: '',
      special_notes: '',
      location_address1: '',
      location_address2: '',
      city: '',
      country: '',
      state: '',
      zip: '',
      office_phone1: '',
      office_phone2: '',
      cell_phone1: '',
      cell_phone2: '',
      office_email: '',
      personal_email: '',
      photo_url: '',
      assigned_agent: '',
      access: '',
      their_report: '',
    },
  });

  const { watch, control, setValue } = methods;

  const values = watch();

  const handleSaveChanges = async (data) => {
    const formData = new FormData();

    // Append all fields except photoURL
    formData.append('company_account_id', selectedCompanyId);
    formData.append('assigned_agent', selectedAdminId);
    formData.append('client_first_name', data.client_first_name);
    formData.append('client_last_name', data.client_last_name);
    formData.append('title', data.title);
    formData.append('reports_to', data.reports_to);
    formData.append('responsibilities', data.responsibilities);
    formData.append('special_notes', data.special_notes);
    formData.append('location_address1', data.location_address1);
    formData.append('location_address2', data.location_address2);
    formData.append('city', data.city);
    formData.append('country', data.country);
    // formData.append('state', data.selectedStates);
    formData.append('zip', data.zip);
    formData.append('office_phone1', data.office_phone1);
    formData.append('office_phone2', data.office_phone2);
    formData.append('cell_phone1', data.cell_phone1);
    formData.append('cell_phone2', data.cell_phone2);
    formData.append('office_email', data.office_email);
    formData.append('personal_email', data.personal_email);
    formData.append('photo_url', data.photo_url);
    formData.append('access', data.access);
    if (data.photo_url && data.photo_url instanceof File) {
      formData.append('photo_url', data.photo_url);
    }
    if (uploadedFile) {
      formData.append('their_report', uploadedFile);
    }
    if (selectedStates.length > 0) {
      formData.append('state', selectedStates.join(','));
    } else {
      formData.append('state', '');
    }

    formData.append('_method', 'POST');
    formData.forEach((value, key) => {});

    try {
      await axiosInstance.post(endpoints.contact.details, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      enqueueSnackbar('Contact created successfully', { variant: 'success' });
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        const backendErrors = error.response.data.errors;
        Object.keys(backendErrors).forEach((field) => {
          backendErrors[field].forEach((message) => {
            enqueueSnackbar(`${field}: ${message}`, { variant: 'error' });
          });
        });
      } else {
        enqueueSnackbar('Error saving contact details', { variant: 'error' });
      }
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
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
          <Card sx={{ pt: 10, pb: 5, px: 3 }}>
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
                sm: 'repeat(3, 1fr)',
              }}
            >
              <FormControl fullWidth variant="outlined">
                <InputLabel>Company Name</InputLabel>
                <Controller
                  name="company"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Select
                      label="Company Name"
                      value={selectedCompanyId}
                      onChange={(e) => setSelectedCompanyId(e.target.value)}
                    >
                      {companyDetails.map((company) => (
                        <MenuItem key={company.id} value={company.id}>
                          {company.company_name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
              <RHFTextField name="client_first_name" label="Client First Name" />
              <RHFTextField name="client_last_name" label="Client Last Name" />
              <RHFTextField name="title" label="Title" />
              <FormControl fullWidth variant="outlined">
                <InputLabel>Reports To</InputLabel>
                <Controller
                  name="reports_to"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Select {...field} label="Reports To">
                      {reportsName.map((reports, index) => (
                        <MenuItem key={index} value={reports}>
                          {reports}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
              <RHFTextField name="responsibilities" label="Responsibilities" />
              <RHFTextField name="special_notes" label="Special Notes" />
              <RHFTextField name="location_address1" label="Location Address 1" />
              <RHFTextField name="location_address2" label="Location Address 2" />
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
                  <Box display="flex" justifyContent="space-between" p={1}>
                    <Button size="small" disabled={currentPage === 1} onClick={handlePrevPage}>
                      Previous
                    </Button>
                    <Button
                      size="small"
                      disabled={currentPage === totalPages}
                      onClick={handleNextPage}
                    >
                      Next
                    </Button>
                  </Box>
                </Select>
              </FormControl>
              <RHFTextField name="zip" label="Zip Code/Postal Code" />
              <RHFTextField
                name="office_phone1"
                label="Office Phone Number 1"
                placeholder="+1 234 567-8901"
              />
              <RHFTextField
                name="office_phone2"
                label="Office Phone Number 2"
                placeholder="+1 234 567-8901"
              />
              <RHFTextField
                name="cell_phone1"
                label="Cell Phone Number 1"
                placeholder="+1 234 567-8901"
              />
              <RHFTextField
                name="cell_phone2"
                label="Cell Phone Number 2"
                placeholder="+1 234 567-8901"
              />
              <RHFTextField name="office_email" label="Office Email address" />
              <RHFTextField name="personal_email" label="Personal Email address" />
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                variant="contained"
                onClick={(e) => {
                  handleSaveChanges(watch());
                }}
                disabled={saving}
              >
                {saving ? 'Create Contact...' : 'Create Contact'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
      <Box
        component="footer"
        sx={{
          marginTop: '3px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50px',
          right: '35px',
          position: 'sticky',
          bottom: 0,
          width: '80%',
          zIndex: 1300,
          backgroundColor: 'white',
        }}
      >
        <Typography variant="body2" color="textSecondary">
          &copy; {new Date().getFullYear()}
          <strong>www.SoluComp.com</strong> v1.0
        </Typography>
      </Box>
    </FormProvider>
  );
}

UserCompanyContactEditForm.propTypes = {
  currentUser: PropTypes.object,
};
