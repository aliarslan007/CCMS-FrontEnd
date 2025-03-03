import { yupResolver } from '@hookform/resolvers/yup';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import * as Yup from 'yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Checkbox,
  CircularProgress,
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
import { logActivity } from 'src/utils/log-activity';

// ----------------------------------------------------------------------

export default function UserCompanyContactEditForm({ moduleName }) {
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

  const [officePhone1, setOfficePhone1] = useState('');

  const [officePhone2, setOfficePhone2] = useState('');

  const [cellPhone1, setCellPhone1] = useState('');

  const [cellPhone2, setCellPhone2] = useState('');

  const itemsPerPage = 100;

  const logSentRef = useRef(false);

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
    location_address3: Yup.string().nullable(),
    region: Yup.string().nullable(),
    department: Yup.string().nullable(),
    business_fax: Yup.string().nullable(),
    photo_url: Yup.string().nullable(),
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
      location_address3: '',
      city: '',
      country: '',
      region: '',
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
      department: '',
      business_fax: '',
    },
  });

  const { watch, control, setValue } = methods;

  const values = watch();

  const handleSaveChanges = async (data) => {
    if (!logSentRef.current) {
      const dynamicModuleName = moduleName || 'CLIENT ACCOUNT MANAGEMENT';
      logActivity('New Contact Created', dynamicModuleName);
      logSentRef.current = true;
    }
    setLoading(true);
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
    formData.append('location_address3', data.location_address3);
    formData.append('city', data.city);
    formData.append('country', data.country);
    formData.append('zip', data.zip);
    formData.append('office_phone1', officePhone1);
    formData.append('office_phone2', officePhone2);
    formData.append('cell_phone1', cellPhone1);
    formData.append('cell_phone2', cellPhone2);
    formData.append('office_email', data.office_email);
    formData.append('personal_email', data.personal_email);
    formData.append('business_fax', data.business_fax);
    formData.append('department', data.department);
    formData.append('region', data.region);
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
      const token = sessionStorage.getItem('authToken');
      await axiosInstance.post(endpoints.contact.details, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
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
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (setter) => (event) => {
    const input = event.target.value;
    const formatted = input && !input.startsWith('+') ? `+${input}` : input;
    setter(formatted);
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
          <Card sx={{ p: 3, position: 'relative' }}>
            {/* Add relative positioning */}
            {loading && (
              <CircularProgress
                color="inherit"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            )}
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
              <RHFTextField name="client_first_name" label="First Name" />
              <RHFTextField name="client_last_name" label="Last Name" />
              <RHFTextField name="title" label="Job Title" />
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
              <RHFTextField name="department" label="Department" />
              <RHFTextField name="location_address1" label="Business Street" />
              <RHFTextField name="location_address2" label="Business Street 2" />
              <RHFTextField name="location_address3" label="Business Street 3" />
              <RHFTextField name="city" label="Business City" />
              <RHFAutocomplete
                name="country"
                label="Business Country/Region"
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
                <InputLabel>Business State</InputLabel>
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
              <RHFTextField name="zip" label="Business Postal Code" />
              <RHFTextField name="region" label="Region" />
              <RHFTextField
                name="Business Phone"
                label="Office Phone Number 1"
                placeholder="12345678901"
                value={officePhone1}
                onChange={handlePhoneChange(setOfficePhone1)}
              />

              <RHFTextField
                name="Business Phone 2"
                label="Office Phone Number 2"
                placeholder="12345678901"
                value={officePhone2}
                onChange={handlePhoneChange(setOfficePhone2)}
              />

              <RHFTextField
                name="cell_phone1"
                label="Mobile Phone"
                placeholder="12345678901"
                value={cellPhone1}
                onChange={handlePhoneChange(setCellPhone1)}
              />

              <RHFTextField
                name="cell_phone2"
                label="Other Phone"
                placeholder="12345678901"
                value={cellPhone2}
                onChange={handlePhoneChange(setCellPhone2)}
              />

              <RHFTextField name="office_email" label="E-mail Address" />
              <RHFTextField name="personal_email" label="Personal Email Address" />
              <RHFTextField name="business_fax" label="Business Fax" />
            </Box>
            <Stack alignItems="flex-end" sx={{ mb: 3.5, mt: 2 }}>
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

UserCompanyContactEditForm.propTypes = {
  currentUser: PropTypes.object,
  moduleName: PropTypes.string,
};
