import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import * as Yup from 'yup';
// @mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
// hooks
// utils
// components
import imageCompression from 'browser-image-compression';
import PropTypes from 'prop-types';
import FormProvider, { RHFTextField, RHFUploadAvatar } from 'src/components/hook-form';
import { useSnackbar } from 'src/components/snackbar';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { logActivity } from 'src/utils/log-activity';

// ----------------------------------------------------------------------

export default function AccountGeneral({ moduleName }) {
  const { enqueueSnackbar } = useSnackbar();

  const { uuid } = useParams();

  const [isEditable, setIsEditable] = useState(false);

  const [profileDetails, setProfileDetails] = useState(null);

  const [loading, setLoading] = useState(true);

  const [isSuperUser, setIsSuperUser] = useState(false);

  const [isCompressing, setIsCompressing] = useState(false);

  const [saving, setSaving] = useState(false);

  const logSentRef = useRef(false);

  useEffect(() => {
    const fetchProfileDetails = async () => {
      if (!logSentRef.current) {
        const dynamicModuleName = moduleName || 'Admin Profile';
        logActivity('User view My Admin Profile', dynamicModuleName);
        logSentRef.current = true;
      }
      try {
        const token = localStorage.getItem('authToken');
        const params = new URLSearchParams();
        params.append('admin', true);
        const response = await axiosInstance.get(endpoints.user.create, {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const users = response.data;

        const superuser = users.find((user) => user.is_superuser === 1);

        if (superuser) {
          setIsSuperUser(true);
          setProfileDetails(superuser);
        } else {
          setIsSuperUser(false);
          setProfileDetails(null);
          enqueueSnackbar('No superuser available', { variant: 'warning' });
        }

        setLoading(false);
      } catch (error) {
        enqueueSnackbar('Error loading user details', { variant: 'error' });
        setLoading(false);
      }
    };

    fetchProfileDetails();
  }, [uuid, moduleName, enqueueSnackbar]);

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
    status: Yup.string(),
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
      photo_url: '',
      status: '',
    },
  });
  const { setValue, watch } = methods;

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
      setValue('reports_to', profileDetails.reports_to);
      setValue('photo_url', profileDetails.photo_url);
    }
  }, [profileDetails, setValue]);

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
    formData.append('timezone', data.timezone);
    if (data.photo_url && data.photo_url instanceof File) {
      formData.append('photo_url', data.photo_url);
    }

    formData.append('_method', 'PUT');

    try {
      setSaving(true);
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

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!isSuperUser) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="warning.main" mt={2}>
          No Superuser Available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You do not have the required permissions to edit this profile.
        </Typography>
      </Card>
    );
  }

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3} sx={{ paddingBottom: '50px' }}>
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
              <RHFTextField name="full_name" label="Full Name" disabled={!isEditable} />
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
              {/* <RHFTextField name="role" label="Role" disabled={!isEditable} /> */}
              <RHFTextField name="timezone" label="Time Zone" disabled={!isEditable} />
            </Box>

            {/* Buttons */}
            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <Box>
                {isEditable ? (
                  <>
                    <Button variant="outlined" onClick={handleCancel} sx={{ ml: 7, mr: 2 }}>
                      Cancel
                    </Button>
                    <Button variant="contained" onClick={() => handleSaveChanges(watch())}>
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button variant="contained" onClick={handleEditClick}>
                    Edit
                  </Button>
                )}
              </Box>
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

AccountGeneral.propTypes = {
  moduleName: PropTypes.string,
};
