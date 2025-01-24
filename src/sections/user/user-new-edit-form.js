import { yupResolver } from '@hookform/resolvers/yup';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as Yup from 'yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Box,
  Checkbox,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import Card from '@mui/material/Card';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// utils
// routes
import { useRouter } from 'src/routes/hooks';
// assets

import imageCompression from 'browser-image-compression';
import FormProvider, { RHFTextField, RHFUploadAvatar } from 'src/components/hook-form';
import { useSnackbar } from 'src/components/snackbar';
import axiosInstance, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export default function UserNewEditForm() {
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const [isCompressing, setIsCompressing] = useState(false);

  const [saving, setSaving] = useState(false);

  const [loading, setLoading] = useState(false);

  const [filteredUsers, setFilteredUsers] = useState([]);

  const [selectedReportTo, setSelectedReportTo] = useState(null);

  const permissionssName = ['Full Access', 'Partial Access', 'Limited', 'View Only'];

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);

      try {
        const response = await axiosInstance.get(endpoints.admin.details);

        const activeUsers = response.data.filter((user) => user.is_active === 1);

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
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const NewUserSchema = Yup.object().shape({
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
    status: Yup.string(),
    password: Yup.string().required('Password is required'),
    access: Yup.string(),
  });

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
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
      photo_url: '',
      status: '',
      password: '',
      access: '',
    },
  });

  const {
    watch,
    control,
    setValue,
    formState: { isSubmitting },
  } = methods;

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
    formData.append('timezone', data.timezone);
    formData.append('reports_to', data.reports_to || '');
    formData.append('is_superuser', data.is_superuser === true ? '1' : '0');
    formData.append('password', data.password);
    formData.append('access', data.access);
    // formData.append('is_superuser', data.is_superuser !== undefined ? data.is_superuser : '0');
    if (data.photo_url && data.photo_url instanceof File) {
      formData.append('photo_url', data.photo_url);
    }

    formData.append('_method', 'POST');

    formData.forEach((value, key) => {});

    try {
      await axiosInstance.post(endpoints.user.create, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      enqueueSnackbar('User created successfully', { variant: 'success' });
      // methods.reset();
    } catch (error) {
      if (error.response?.data?.errors?.personal_email) {
        enqueueSnackbar(error.response.data.errors.personal_email[0], { variant: 'error' });
      } else if (error.response?.data?.message) {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      } else {
        enqueueSnackbar('Error saving User details', { variant: 'error' });
      }
      console.error('Error details:', error.response ? error.response.data : error);
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
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="full_name" label="First Name" />
              <RHFTextField name="last_name" label="Last Name" />
              <RHFTextField name="title" label="Title" />
              <RHFTextField name="responsibilities" label="Responsibilities" />
              <RHFTextField
                name="office_phone"
                label="Office Phone"
                placeholder="+1 234 567-8901"
              />
              <RHFTextField
                name="main_phone_number"
                label="Mobile Phone Number"
                placeholder="+1 234 567-8901"
              />
              <RHFTextField name="office_email" label="Office Email Address" />
              <RHFTextField name="personal_email" label="Personal Email Address" />
              {/* ROLE */}
              <Controller
                name="role"
                control={control}
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
              {/* Time Zone Dropdown */}
              <Controller
                name="timezone"
                control={control} // Pass control here
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="TimeZone"
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
              {/* Report To Dropdown */}
              <div>
                {loading ? (
                  <CircularProgress />
                ) : (
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
                            setSelectedReportTo(selectedUserId);
                            setValue('reports_to', selectedUserId);
                          }
                        }}
                        value={selectedReportTo || ''}
                      >
                        {filteredUsers.map((user) => (
                          <MenuItem key={user.id} value={user.id}>
                            {' '}
                            {`${user.full_name} ${user.last_name} - ${user.role}`}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                )}
              </div>

              {/* Super User Checkbox */}
              <FormControlLabel
                control={
                  <Controller
                    name="is_superuser"
                    control={control}
                    defaultValue={false}
                    render={({ field }) => (
                      <Checkbox
                        {...field}
                        checked={field.value === true}
                        onChange={(event) => {
                          field.onChange(event.target.checked);
                        }}
                      />
                    )}
                  />
                }
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Super User?
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      (A Super User will have access to every account, every feature, etc.)
                    </Typography>
                  </>
                }
                labelPlacement="end"
                sx={{ mx: 0, mb: 3, width: 1, justifyContent: 'space-between' }}
              />
              <FormControl fullWidth variant="outlined">
                <InputLabel>Permissions Access</InputLabel>
                <Controller
                  name="access"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Select {...field} label="Persmissions Access">
                      {permissionssName.map((access, index) => (
                        <MenuItem key={index} value={access}>
                          {access}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
              <RHFTextField
                name="password"
                label="Password"
                helperText="Password must be at least 8 characters long."
              />
            </Box>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                variant="contained"
                onClick={(e) => {
                  handleSaveChanges(watch());
                }}
                disabled={saving}
              >
                {saving ? 'Create User...' : 'Create User'}
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

UserNewEditForm.propTypes = {
  currentUser: PropTypes.object,
};
