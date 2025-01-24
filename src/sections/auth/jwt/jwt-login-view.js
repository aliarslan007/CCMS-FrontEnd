import { yupResolver } from '@hookform/resolvers/yup';
import { useState,useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as Yup from 'yup';
// @mui
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// routes
import { RouterLink } from 'src/routes/components';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
// config
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// auth
import { useAuthContext } from 'src/auth/hooks';
// components
import ReCAPTCHA from 'react-google-recaptcha';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { useAuth } from '../../../auth/context/jwt/auth-context';

// ----------------------------------------------------------------------

export default function JwtLoginView() {
  const { login } = useAuthContext();

  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState('');

  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo');

  const password = useBoolean();

  const [email, setEmail] = useState('');

  const LoginSchema = Yup.object().shape({
    personal_email: Yup.string()
      .required('Email is required')
      .email('Email must be a valid email address'),
    password: Yup.string().required('Password is required'),
  });

  const defaultValues = {
    personal_email: '',
    password: '',
    recaptcha: '',
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
    setValue,
    control,
    getValues,
  } = methods;

  const recaptchaRef = useRef(null);

  const { setUserRole } = useAuth();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const recaptchaToken = getValues('recaptcha');
      const response = await axiosInstance.post(endpoints.login.url, {
        personal_email: data.personal_email,
        password: data.password,
        recaptcha: recaptchaToken,
      });

      const { user } = response.data;
      const { access_token } = response.data.user;
      const { role, access, id, uuid } = user;
      setUserRole(role);
      sessionStorage.setItem('userRole', role);
      sessionStorage.setItem('authToken', access_token);
      sessionStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('userid', id);
      sessionStorage.setItem('uuid', uuid);

      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setValue('password', '');
      setValue('recaptcha', '');
      setEmail(getValues('personal_email'));
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      if (error.response && error.response.data) {
        const backendMessage = error.response.data.message;
        const errors = error.response.data.errors;
        if (backendMessage) {
          setErrorMsg(backendMessage);
        } else if (errors && Object.values(errors).length > 0) {
          const errorMessages = Object.values(errors).flat().join(' ');
          setErrorMsg(errorMessages);
        } else {
          setErrorMsg('Login failed');
        }
      } else {
        setErrorMsg(typeof error === 'string' ? error : error.message || 'Login failed');
      }
    }
  });

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5 }}>
      <Typography variant="h4">Sign in to CCMS</Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2">New user?</Typography>

        <Link component={RouterLink} href={paths.auth.jwt.register} variant="subtitle2">
          Create an account
        </Link>
      </Stack>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      <RHFTextField
        name="personal_email"
        label="Email address"
        value={email || getValues('personal_email')}
        onChange={(e) => {
          setValue('personal_email', e.target.value);
          setEmail(e.target.value);
        }}
      />
      <RHFTextField
        name="password"
        label="Password"
        type={password.value ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Link
        component={RouterLink}
        href={paths.auth.firebase.forgotPassword}
        variant="body2"
        color="inherit"
        underline="always"
        sx={{ alignSelf: 'flex-end' }}
      >
        Forgot password?
      </Link>
      Google reCAPTCHA
      <Controller
      name="recaptcha"
      control={control}
      render={({ field }) => (
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey="6Le_qaMqAAAAAJh8K0tT8pBiPUJ6PIrzsULPjI4T"
          onChange={(value) => setValue('recaptcha', value)}
        />
      )}
    />
      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        Login
      </LoadingButton>
    </Stack>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      {renderHead}

      {renderForm}
    </FormProvider>
  );
}
