import { useEffect, useState } from 'react';
// @mui
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// components
import axiosInstance, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export default function NavUpgrade() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('uuid');

    if (userId) {
      axiosInstance
        .get(endpoints.profile.details(userId), {
          params: { fields: 'basic' },
        })
        .then((response) => {
          setUser(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <Stack sx={{ px: 2, py: 5, textAlign: 'center' }}>
        <Typography variant="body2">Loading...</Typography>
      </Stack>
    );
  }

  if (!user) {
    return (
      <Stack sx={{ px: 2, py: 5, textAlign: 'center' }}>
        <Typography variant="body2">User data not available</Typography>
      </Stack>
    );
  }

  return (
    <Stack
      sx={{
        px: 2,
        py: 5,
        textAlign: 'center',
      }}
    >
      <Stack alignItems="center">
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={user.photo_url}
            alt={`${user.full_name} ${user.last_name}`}
            sx={{ width: 48, height: 48 }}
          />
        </Box>

        <Stack spacing={0.5} sx={{ mt: 1.5, mb: 2 }}>
          <Typography variant="subtitle2" noWrap>
            {user.full_name} {user.last_name}
          </Typography>

          <Typography variant="body2" noWrap sx={{ color: 'text.disabled' }}>
            {user.personal_email}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
}
