import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import * as Yup from 'yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import { Button, MenuItem, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
// hooks
// utils
// components
import imageCompression from 'browser-image-compression';
import FormProvider, { RHFTextField, RHFUploadAvatar } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import axiosInstance, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

const TABS = [
  {
    value: 'general',
    label: 'General',
    icon: <Iconify icon="solar:user-id-bold" width={24} />,
  },

  {
    value: 'security',
    label: 'Security',
    icon: <Iconify icon="ic:round-vpn-key" width={24} />,
  },
];

export default function AccountUser() {
  const { enqueueSnackbar } = useSnackbar();

  const { uuid } = useParams();

  const [isEditable, setIsEditable] = useState(false);

  const [profileDetails, setProfileDetails] = useState(null);

  const [loading, setLoading] = useState(true);

  const [isCompressing, setIsCompressing] = useState(false);

  const [saving, setSaving] = useState(false);

  const [filteredUsers, setFilteredUsers] = useState([]);

  const [selectedReportToName, setSelectedReportToName] = useState('');

  const [reportsTo, setReportsTo] = useState('');

  const UpdateUserSchema = Yup.object().shape({
    full_name: Yup.string().required('First name is required'),
    last_name: Yup.string().required('Last name is required'),
    title: Yup.string().required('Title is required'),
    responsibilities: Yup.string().required('Responsibilities are required'),
    office_phone: Yup.string().required('Office phone is required'),
    main_phone_number: Yup.string().required('Mobile phone number is required'),
    office_email: Yup.string()
      .required('Office email address is required')
      .email('Email must be a valid email address'),
    personal_email: Yup.string()
      .required('Personal email address is required')
      .email('Email must be a valid email address'),
    role: Yup.string().required('Role is required'),
    timezone: Yup.string().required('Time zone is required'),
    reports_to: Yup.string().required('Reports to is required'),
    is_superuser: Yup.boolean(),
    photo_url: Yup.mixed().nullable().required('Avatar is required'),
  });

  const methods = useForm({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues: {
      full_name: '',
      last_name: '',
      title: '',
      responsibilities: '',
      office_phone: '',
      main_phone_number: '',
      office_email: '',
      personal_email: '',
      role: '',
      timezone: '',
      reports_to: '',
      is_superuser: '',
      avatarUrl: '',
      status: '',
      photo_url: '',
    },
  });
  const { setValue, handleSubmit, watch, control } = methods;

  useEffect(() => {
    if (profileDetails) {
      setValue('full_name', profileDetails.full_name);
      setValue('last_name', profileDetails.last_name);
      setValue('title', profileDetails.title);
      setValue('responsibilities', profileDetails.responsibilities);
      setValue('office_phone', profileDetails.office_phone);
      setValue('main_phone_number', profileDetails.main_phone_number);
      setValue('office_email', profileDetails.office_email);
      setValue('personal_email', profileDetails.personal_email);
      setValue('role', profileDetails.role);
      setValue('timezone', profileDetails.timezone);
      setValue('photo_url', profileDetails.photo_url);
      setValue('reports_to', profileDetails.reports_to || '');
    }
  }, [profileDetails, setValue]);

  useEffect(() => {
    const fetchProfileDetails = async () => {
      try {
        const response = await axiosInstance.get(endpoints.profile.details(uuid));
        const report_response = await axiosInstance.get(endpoints.admin.details);
        const activeUsers = report_response.data.filter((user) => user.is_active === 1);
        setProfileDetails(response.data);
        setReportsTo(response.data.reports_to);
        setValue('reports_to', response.data.reports_to || '');
        setSelectedReportToName(
          `${response.data.report_to_full_name} ${response.data.report_to_last_name}`
        );

        const filteredSalesManagers = activeUsers
          .filter((user) => user.role === 'Sales Manager')
          .map((user) => ({
            id: user.id,
            full_name: user.full_name || 'Unknown Name',
            last_name: user.last_name || '',
            role: user.role || 'Unknown Role',
          }));

        setFilteredUsers(filteredSalesManagers);
      } catch (error) {
        enqueueSnackbar('Error loading user details', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileDetails();
  }, [uuid, enqueueSnackbar, setValue]);

  const handleEditClick = () => {
    setIsEditable(true);
  };

  const handleCancel = () => {
    setIsEditable(false);
  };

  const handleSaveChanges = async (data) => {
    const formData = new FormData();

    // Append all fields except photoURL
    formData.append('full_name', data.full_name);
    formData.append('last_name', data.last_name);
    formData.append('title', data.title);
    formData.append('responsibilities', data.responsibilities);
    formData.append('office_phone', data.office_phone);
    formData.append('main_phone_number', data.main_phone_number);
    formData.append('office_email', data.office_email);
    formData.append('personal_email', data.personal_email);
    formData.append('role', data.role);
    formData.append('reports_to', data.reports_to);
    formData.append('timezone', data.timezone);
    if (data.photo_url && data.photo_url instanceof File) {
      formData.append('photo_url', data.photo_url);
    }

    formData.append('_method', 'PUT');

    try {
      const userId = profileDetails.uuid;

      const dynamicEndpoint = endpoints.profile.details(userId);

      await axiosInstance.post(dynamicEndpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      enqueueSnackbar('User details updated successfully', { variant: 'success' });

      const updatedResponse = await axiosInstance.get(dynamicEndpoint);

      setProfileDetails(updatedResponse.data);
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

  const handleUnlock = async () => {
    try {
      await axiosInstance.put(endpoints.profile.details(uuid), {
        locked: 0,
        failed_attempts: 0,
      });
      setProfileDetails((prevDetails) => ({
        ...prevDetails,
        locked: 0,
        failed_attempts: 0,
      }));
    } catch (error) {
      console.error('Error unlocking user:', error);
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
  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {profileDetails?.locked === 1 && (
        <Grid
          sx={{
            mb: 2,
            mt: -1,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: 'rgb(230, 11, 11)',
              fontWeight: 'bold',
            }}
          >
            ⚠️ This user account is locked due to multiple password attempts.
          </Typography>
          <Button variant="contained" color="error" onClick={handleUnlock} sx={{ mt: 2 }}>
            Unlock Account
          </Button>
        </Grid>
      )}
      <Grid container spacing={3}>
        {/* Avatar Section */}
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

        {/* Form Section */}
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
              <RHFTextField name="full_name" label="First Name" disabled={!isEditable} />
              <RHFTextField name="last_name" label="Last Name" disabled={!isEditable} />
              <RHFTextField name="title" label="Title" disabled={!isEditable} />
              <RHFTextField
                name="responsibilities"
                label="Responsibilities"
                disabled={!isEditable}
              />
              <RHFTextField
                name="office_phone"
                label="Office Phone"
                placeholder="+1 234 567-8901"
                disabled={!isEditable}
              />
              <RHFTextField
                name="main_phone_number"
                label="Mobile Phone Number"
                placeholder="+1 234 567-8901"
                disabled={!isEditable}
              />
              <RHFTextField
                name="office_email"
                label="Office Email Address"
                disabled={!isEditable}
              />
              <RHFTextField
                name="personal_email"
                label="Personal Email Address"
                disabled={!isEditable}
              />
              {isEditable ? (
                <Controller
                  name="role"
                  control={control} // Pass control here
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Role"
                      fullWidth
                      variant="outlined"
                      margin="normal"
                    >
                      {/* <MenuItem value="Admin">Admin</MenuItem> */}
                      <MenuItem value="Sales Manager">Sales Manager</MenuItem>
                      <MenuItem value="Sales Representative">Sales Representative</MenuItem>
                    </TextField>
                  )}
                />
              ) : (
                <RHFTextField name="role" label="Role" disabled />
              )}
              {isEditable ? (
                <Controller
                  name="reports_to"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Report To"
                      fullWidth
                      variant="outlined"
                      margin="normal"
                      onChange={(e) => {
                        const selectedUserId = e.target.value;
                        const selectedUser = filteredUsers.find(
                          (user) => user.id === selectedUserId
                        );

                        if (selectedUser) {
                          setReportsTo(selectedUserId); 
                          setValue('reports_to', selectedUserId);
                        }
                      }}
                      value={field.value || reportsTo || ''} 
                    >
                      {filteredUsers.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {`${user.full_name} ${user.last_name} - ${user.role}`}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              ) : (
                <RHFTextField
                  name="reports_to"
                  label="Reports To"
                  value={
                    selectedReportToName ||
                    `${profileDetails?.report_to_full_name || ''} ${
                      profileDetails?.report_to_last_name || ''
                    }`
                  }
                  disabled
                />
              )}

              {isEditable ? (
                <Controller
                  name="timezone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Time Zone"
                      fullWidth
                      variant="outlined"
                      margin="normal"
                    >
                      <MenuItem value="Eastern">Eastern</MenuItem>
                      <MenuItem value="Central">Central</MenuItem>
                      <MenuItem value="Mountain">Mountain</MenuItem>
                      <MenuItem value="Pacific">Pacific</MenuItem>
                    </TextField>
                  )}
                />
              ) : (
                <RHFTextField name="timezone" label="Time Zone" disabled />
              )}
            </Box>

            {/* Buttons */}
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
