import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import * as Yup from 'yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import { useSnackbar } from 'src/components/snackbar';
import axiosInstance, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export default function AccountChangePassword() {
  const { enqueueSnackbar } = useSnackbar();

  const { uuid } = useParams();

  const password = useBoolean();

  const ChangePassWordSchema = Yup.object().shape({
    oldPassword: Yup.string().required('Old Password is required'),
    newPassword: Yup.string()
      .required('New Password is required')
      .min(6, 'Password must be at least 6 characters')
      .test(
        'no-match',
        'New password must be different than old password',
        (value, { parent }) => value !== parent.oldPassword
      ),
    confirmNewPassword: Yup.string().oneOf([Yup.ref('newPassword')], 'Passwords must match'),
  });

  const methods = useForm({
    resolver: yupResolver(ChangePassWordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const { watch, control, setValue } = methods;

  const values = watch();

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      enqueueSnackbar('Update success!');
    } catch (error) {
      console.error(error);
    }
  });

  const handlePasswordChanges = async (data) => {
    try {
      const payload = {
        new_password: data.newPassword,
      };

      if (uuid) {
        payload.userid = uuid;
      }

      const response = await axiosInstance.post(endpoints.change.password, payload);

      if (response?.status === 200) {
        enqueueSnackbar(response.data?.message, {
          variant: 'success',
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Stack component={Card} spacing={3} sx={{ p: 3 }}>
        <RHFTextField name="newPassword" label="New Password" />
        <RHFTextField name="confirmNewPassword" label="Confirm New Password" />
        <LoadingButton
          type="submit"
          variant="contained"
          sx={{ ml: 'auto' }}
          onClick={(e) => {
            handlePasswordChanges(watch());
          }}
        >
          Save Changes
        </LoadingButton>
      </Stack>
    </FormProvider>
  );
}
