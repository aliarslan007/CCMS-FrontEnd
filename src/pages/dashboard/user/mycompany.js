import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect, useState,useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
// import { useParams } from 'react-router-dom';
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
import { countries } from 'src/assets/data';
// components
import imageCompression from 'browser-image-compression';
import FormProvider, {
  RHFAutocomplete,
  RHFTextField,
  RHFUploadAvatar,
} from 'src/components/hook-form';
import PropTypes from 'prop-types';
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { logActivity } from 'src/utils/log-activity';

// ----------------------------------------------------------------------

export default function MyCompany({moduleName}) {
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const [companyDetails, setCompanyDetails] = useState(null);

  const [isEditable, setIsEditable] = useState(false);

  const [loading, setLoading] = useState(true);

  const [isCompressing, setIsCompressing] = useState(false);

  const [saving, setSaving] = useState(false);

  const logSentRef = useRef(false);

  useEffect(() => {
    if (!logSentRef.current) {
      const dynamicModuleName = moduleName || 'My Corporation Module';
      logActivity('User view My Corporation', dynamicModuleName);
      logSentRef.current = true;
    }
    const fetchCompanyDetails = async () => {
      try {
        const response = await axiosInstance.get(endpoints.company.details);
        setCompanyDetails(response.data);

        setLoading(false);
      } catch (error) {
        enqueueSnackbar('Error loading company details', { variant: 'error' });
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [id, enqueueSnackbar,moduleName]);

  const UpdateCompanySchema = Yup.object().shape({
    displayName: Yup.string().required('Name is required'),
    address1: Yup.string().required('Address 1 is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    country: Yup.string().required('Country is required'),
    zipCode: Yup.string().required('Zip Code is required'),
    phone1: Yup.string().required('Phone number is required'),
    phone2: Yup.string(),
    website: Yup.string(),
  });

  const methods = useForm({
    resolver: yupResolver(UpdateCompanySchema),
    defaultValues: {
      displayName: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      phone1: '',
      phone2: '',
      website: '',
      photoURL: '',
    },
  });

  const { setValue, handleSubmit } = methods;

  useEffect(() => {
    if (companyDetails) {
      setValue('displayName', companyDetails.displayName);
      setValue('address1', companyDetails.address1);
      setValue('address2', companyDetails.address2);
      setValue('city', companyDetails.city);
      setValue('state', companyDetails.state);
      setValue('country', companyDetails.country);
      setValue('zipCode', companyDetails.zipCode);
      setValue('phone1', companyDetails.phone1);
      setValue('phone2', companyDetails.phone2);
      setValue('website', companyDetails.website);
      setValue('photoURL', companyDetails.photoURL);
    }
  }, [companyDetails, setValue]);

  const handleEditClick = () => {
    setIsEditable(true);
  };

  const handleCancel = () => {
    setIsEditable(false);
  };

  const handleSaveChanges = async (data) => {
    const formData = new FormData();

    // Append all fields except photoURL
    formData.append('displayName', data.displayName);
    formData.append('address1', data.address1);
    formData.append('address2', data.address2);
    formData.append('city', data.city);
    formData.append('state', data.state);
    formData.append('country', data.country);
    formData.append('zipCode', data.zipCode);
    formData.append('phone1', data.phone1);
    formData.append('phone2', data.phone2);
    formData.append('website', data.website);
    if (data.photoURL && data.photoURL instanceof File) {
      formData.append('photoURL', data.photoURL);
    }

    formData.append('_method', 'PUT');

    try {
      await axiosInstance.post(endpoints.company.details, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      enqueueSnackbar('Company details updated successfully', { variant: 'success' });

      const updatedResponse = await axiosInstance.get(endpoints.company.details);

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

          setValue('photoURL', newFile, { shouldValidate: true });
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
          <Card sx={{ pt: 10, pb: 5, px: 3, textAlign: 'center', height: '100%' }}>
            {isCompressing && <p>Compressing image, please wait...</p>}
            <RHFUploadAvatar
              name="photoURL"
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
              initialValue={companyDetails?.photoURL || '/default-avatar.png'} // Update this if your backend has a URL
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
              <RHFTextField name="displayName" label="Company Name" disabled={!isEditable} />
              <RHFTextField name="address1" label="Company Address 1" disabled={!isEditable} />
              <RHFTextField name="address2" label="Company Address 2" disabled={!isEditable} />
              <RHFTextField name="city" label="City" disabled={!isEditable} />
              <RHFTextField name="state" label="State/Province" disabled={!isEditable} />

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
              <RHFTextField name="zipCode" label="Zip/Code" disabled={!isEditable} />
              <RHFTextField
                name="phone1"
                label="Main Office Number"
                placeholder="+1 234 567-8901"
                disabled={!isEditable}
              />
              <RHFTextField
                name="phone2"
                label="Main Contact Person"
                placeholder="+1 234 567-8901"
                disabled={!isEditable}
              />
              <RHFTextField name="website" label="Website" disabled={!isEditable} />
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
                      onClick={methods.handleSubmit(handleSaveChanges)}
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

MyCompany.propTypes = {
  moduleName: PropTypes.string,
};
