import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
// import { useParams } from 'react-router-dom';
import * as Yup from 'yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
// utils
import { fData } from 'src/utils/format-number';
// components
import FormProvider, {
  RHFTextField,
  RHFUploadAvatar,
} from 'src/components/hook-form';
import { useSnackbar } from 'src/components/snackbar';

// ----------------------------------------------------------------------

export default function UserDetails() {
  // const { id } = useParams(); // This will grab the id from the URL
  const { enqueueSnackbar } = useSnackbar();

  const { user } = useMockedUser();
  const [isEditable, setIsEditable] = useState(false);

  const handleEditClick = () => {
    setIsEditable(true); // Switch to Save Changes and Cancel
  };

  const handleSaveChanges = () => {
    // Your save logic here
    setIsEditable(false); // Revert to showing only the Edit button after saving
  };

  const handleCancel = () => {
    setIsEditable(false); // Revert back to showing only the Edit button
  };

  const UpdateUserSchema = Yup.object().shape({
    displayName: Yup.string().required('Name is required'),
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    photoURL: Yup.mixed().nullable().required('Avatar is required'),
    phoneNumber: Yup.string().required('Phone number is required'),
    country: Yup.string().required('Country is required'),
    address: Yup.string().required('Address is required'),
    state: Yup.string().required('State is required'),
    city: Yup.string().required('City is required'),
    zipCode: Yup.string().required('Zip code is required'),
    about: Yup.string().required('About is required'),
    // not required
    isPublic: Yup.boolean(),
  });

  const defaultValues = {
    displayName: user?.displayName || '',
    email: user?.email || '',
    photoURL: user?.photoURL || null,
    phoneNumber: user?.phoneNumber || '',
    country: user?.country || '',
    address: user?.address || '',
    state: user?.state || '',
    city: user?.city || '',
    zipCode: user?.zipCode || '',
    about: user?.about || '',
    isPublic: user?.isPublic || false,
  };

  const methods = useForm({
    resolver: yupResolver(UpdateUserSchema),
    defaultValues,
  });

  const {
    setValue,
    handleSubmit,
    // formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      enqueueSnackbar('Update success!');
      setIsEditable(false);
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('photoURL', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3, textAlign: 'center' }}>
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
            />

            {/* <RHFSwitch
              name="isPublic"
              labelPlacement="start"
              label="Public Profile"
              sx={{ mt: 5 }}
            /> */}

            <Button variant="soft" color="error" sx={{ mt: 3 }}>
              Delete User
            </Button>
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
              <RHFTextField name="displayName" label="Full Name" disabled={!isEditable} />
              <RHFTextField name="displayName2 " label="Last Name" disabled={!isEditable} />
              <RHFTextField name="Title" label="Title" disabled={!isEditable} />
              <RHFTextField name="responsibilites" label="Responsibilites" disabled={!isEditable} />
              <RHFTextField
                name="officephone"
                label="Office Phone"
                disabled={!isEditable}
              />
              <RHFTextField
                name="Mobile Phone Number"
                label="Mobile Phone Number"
                disabled={!isEditable}
              />
              <RHFTextField name="email" label="Office Email Address" disabled={!isEditable} />
              <RHFTextField name="email0" label="Personal Email Address" disabled={!isEditable} />
              <RHFTextField name="role" label="Role" disabled={!isEditable} />
              <RHFTextField name="time" label="Time Zone" disabled={!isEditable} />
              <RHFTextField name="time" label="Report To" disabled={!isEditable} />
              <RHFTextField name="user" label="Super User" disabled={!isEditable} />
            </Box>

            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>

              <Box>
                {isEditable ? (
                  <>
                    <LoadingButton variant="outlined" onClick={handleCancel} sx={{  ml: 7, mr: 2  }}>
                      Cancel
                    </LoadingButton>
                    <LoadingButton variant="contained" onClick={handleSaveChanges}>
                      Save Changes
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
