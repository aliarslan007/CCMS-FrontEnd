import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import * as Yup from 'yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
// hooks
// utils
// assets
import { Checkbox, FormControl, InputLabel, ListItemText, MenuItem, Select } from '@mui/material';
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

const permissionssName = ['Full Access', 'Partial Access', 'Limited', 'View Only'];

export default function AccountGeneral({ moduleName }) {
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const [isEditable, setIsEditable] = useState(false);

  const [loading, setLoading] = useState(true);

  const [companyDetails, setCompanyDetails] = useState([]);

  const [selectedCompanyId, setSelectedCompanyId] = useState('');

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

  const [personalEmail, setPersonalEmail] = useState('');

  const itemsPerPage = 100;

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axiosInstance.get(endpoints.solo.details(id), {
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
    company_name: Yup.string(),
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
    photo_url: Yup.mixed().nullable().required('Avatar is required'),
    their_report: Yup.string().nullable,
  });

  const methods = useForm({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues: {
      company_name: '',
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
      their_report: '',
      department: '',
      business_fax: '',
      photo_url: '',
    },
  });

  const { setValue, watch, control } = methods;

  const values = watch();

  useEffect(() => {
    if (companyDetails && companyDetails[0]) {
      const company = companyDetails[0];

      setValue('company_name', company.company_name);
      setValue('client_first_name', company.client_first_name);
      setValue('client_last_name', company.client_last_name);
      setValue('title', company.title);
      setValue('reports_to', company.reports_to);
      setValue('responsibilities', company.responsibilities);
      setValue('special_notes', company.special_notes);
      setValue('location_address1', company.location_address1);
      setValue('location_address2', company.location_address2);
      setValue('location_address3', company.location_address3);
      setValue('city', company.city);
      setValue('country', company.country);
      setValue('region', company.region);
      setValue('state', company.state);
      setValue('office_phone1', company.office_phone1);
      setOfficePhone1(company.office_phone1);
      setValue('office_phone2', company.office_phone2);
      setOfficePhone2(company.office_phone2);
      setValue('cell_phone1', company.cell_phone1);
      setCellPhone1(company.cell_phone1);
      setValue('cell_phone2', company.cell_phone2);
      setCellPhone2(company.cell_phone2);
      setValue('office_email', company.office_email);
      setValue('personal_email', company.personal_email);
      setValue('zip', company.zip);
      setValue('department', company.department);
      setValue('business_fax', company.business_fax);
      setValue('photo_url', company.photo_url);
      setValue(
        'their_report',
        `${company.matched_client_name || 'No Report'} - ${company.matched_title || 'No Title'}`
      );

      if (company.state) {
        setSelectedStates([company.state]);
      }
    }
  }, [companyDetails, setValue]);

  const handleSaveChanges = async (data) => {
    logActivity(
      'User edit a compnay contact detail',
      moduleName || 'COMPANY CONTACT DETAILS PAGE',
      {
        identification: companyDetails[0].client_first_name,
      }
    );
    const formData = new FormData();

    // Append all fields except photoURL
    formData.append('company_account_id', selectedCompanyId);
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
    formData.append('business_fax', data.business_fax);
    formData.append('department', data.department);
    formData.append('region', data.region);
    formData.append('zip', data.zip);
    formData.append('office_phone1', officePhone1);
    formData.append('office_phone2', officePhone2);
    formData.append('cell_phone1', cellPhone1);
    formData.append('cell_phone2', cellPhone2);
    formData.append('office_email', data.office_email);
    formData.append('personal_email', personalEmail || data.personal_email || '');
    if (data.photo_url && data.photo_url instanceof File) {
      formData.append('photo_url', data.photo_url);
    }
    if (selectedStates.length > 0) {
      formData.append('state', selectedStates.join(','));
    } else {
      formData.append('state', '');
    }

    formData.append('_method', 'PUT');
    formData.forEach((value, key) => {});

    try {
      const token = localStorage.getItem('authToken');
      const dynamicEndpoint = endpoints.solo.details(id);
      await axiosInstance.post(dynamicEndpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      enqueueSnackbar('Contacts details updated successfully', { variant: 'success' });

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

      let errorMessage = 'Error saving company details';

      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response && error.response.data && typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.message) {
        errorMessage = error.message;
      }

      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleInputChange = (e) => {
    setPersonalEmail(e.target.value);
  };

  const handlePhoneChange = (setter) => (event) => {
    const input = event.target.value;
    const formatted = input && !input.startsWith('+') ? `+${input}` : input;
    setter(formatted);
  };

  const onSubmit = (data) => {
    handleSaveChanges(data);
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
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
              control={control}
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
              <RHFTextField name="client_first_name" label="First Name" disabled={!isEditable} />
              <RHFTextField name="client_last_name" label="Last Name" disabled={!isEditable} />
              <RHFTextField name="title" label="Job Title" disabled={!isEditable} />
              <RHFTextField name="reports_to" label="Reports To" disabled={!isEditable} />
              {/* <RHFTextField name="their_report" label="There Report" disabled={!isEditable} /> */}
              <RHFTextField
                name="responsibilities"
                label="Responsibilities"
                disabled={!isEditable}
              />
              <RHFTextField name="special_notes" label="Special Notes" disabled={!isEditable} />
              <RHFTextField name="department" label="Department" disabled={!isEditable} />
              <RHFTextField
                name="location_address1"
                label="Business Street"
                disabled={!isEditable}
              />
              <RHFTextField
                name="location_address2"
                label="Business Street 2"
                disabled={!isEditable}
              />
              <RHFTextField
                name="location_address3"
                label="Business Stree 3"
                disabled={!isEditable}
              />
              <RHFTextField name="city" label="Business City" disabled={!isEditable} />
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
                  <InputLabel>Business State</InputLabel>
                  <Select
                    multiple
                    value={selectedStates}
                    onChange={handleChange}
                    renderValue={(selected) => selected.join(', ')}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300, // Set maximum height for the dropdown; adjust as needed
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
                label="Business Country/Region"
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
              <RHFTextField name="zip" label="Business Postal Code" disabled={!isEditable} />
              <RHFTextField name="region" label="Region" disabled={!isEditable} />
              <RHFTextField
                name="office_phone1"
                label="Business Phone"
                placeholder="+1 234 567-8901"
                value={officePhone1}
                disabled={!isEditable}
                onChange={handlePhoneChange(setOfficePhone1)}
              />

              <RHFTextField
                name="office_phone2"
                label="Business Phone 2"
                placeholder="+1 234 567-8901"
                value={officePhone2}
                disabled={!isEditable}
                onChange={handlePhoneChange(setOfficePhone2)}
              />

              <RHFTextField
                name="cell_phone1"
                label="Mobile Phone"
                placeholder="+1 234 567-8901"
                value={cellPhone1}
                disabled={!isEditable}
                onChange={handlePhoneChange(setCellPhone1)}
              />

              <RHFTextField
                name="cell_phone2"
                label="Other Phone"
                placeholder="+1 234 567-8901"
                value={cellPhone2}
                disabled={!isEditable}
                onChange={handlePhoneChange(setCellPhone2)}
              />
              <RHFTextField
                name="personal_email"
                label="Personal Email Address"
                value={personalEmail || methods.watch('personal_email', '')}
                onChange={(e) => {
                  setPersonalEmail(e.target.value);
                  methods.setValue('personal_email', e.target.value);
                }}
                disabled={!isEditable}
              />
              <RHFTextField name="business_fax" label="Business Fax" disabled={!isEditable} />
              <RHFTextField name="their_report" label="Their Reports" disabled={!isEditable} />
            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <Box>
                {isEditable ? (
                  <>
                    <LoadingButton variant="outlined" onClick={handleCancel} sx={{ ml: 2 }}>
                      Cancel
                    </LoadingButton>
                    <LoadingButton
                      sx={{
                        ml: 2,
                      }}
                      variant="contained"
                      onClick={(e) => {
                        handleSaveChanges(watch());
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

AccountGeneral.propTypes = {
  moduleName: PropTypes.string,
};
