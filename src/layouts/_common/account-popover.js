import { m } from 'framer-motion';
import { useContext, useEffect, useMemo, useState } from 'react';
// @mui
import NotificationsIcon from '@mui/icons-material/Notifications';
import {
  Badge,
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Popover,
  Typography,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';

import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
// routes
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
// hooks
// auth
import { useAuthContext } from 'src/auth/hooks';
// components
import { varHover } from 'src/components/animate';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { useSnackbar } from 'src/components/snackbar';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { NotificationContext } from '../../context/NotificationContext';

// ----------------------------------------------------------------------

const HIDE_SETTINGS_ROLES = ['Sales Representative', 'Sales Manager'];

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const router = useRouter();

  const { user } = useAuthContext();

  const { logout } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();

  const popover = usePopover();

  const [options, setOptions] = useState([]);

  const photo = JSON.parse(localStorage.getItem('user')) || null;

  const [anchorEl, setAnchorEl] = useState(null);

  const { notifications: realTimeNotifications } = useContext(NotificationContext);

  const [notifications, setNotifications] = useState([]);

  const [loadingNotifications, setLoadingNotifications] = useState(true);

  const [errorNotifications, setErrorNotifications] = useState(null);

  const [showAllNotifications, setShowAllNotifications] = useState(false);

  const notificationsPerPage = 3;

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));

    const computedOptions = [
      {
        label: 'Home',
        linkTo: '/dashboard',
      },
      ...(storedUser && !HIDE_SETTINGS_ROLES.includes(storedUser.role)
        ? [
            {
              label: 'Settings',
              linkTo: paths.dashboard.user.account,
            },
          ]
        : []),
    ];

    setOptions(computedOptions);
  }, []);

  const fetchNotifications = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('userid'));
      if (!userId) {
        console.warn('User ID not found in session storage.');
        setLoadingNotifications(false);
        return;
      }

      const token = localStorage.getItem('authToken');
      const response = await axiosInstance.get(endpoints.notification.user(userId), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      setNotifications((prev) => {
        const allNotifications = [...response.data.data, ...realTimeNotifications];

        return allNotifications.filter(
          (notif, index, self) => index === self.findIndex((n) => n.id === notif.id)
        );
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setErrorNotifications('Failed to load notifications');
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('userid'));
      if (!userId) {
        console.warn('User ID not found in session storage.');
        return;
      }

      const token = localStorage.getItem('authToken');
      await axiosInstance.put(
        endpoints.notification.is_read,
        { id: userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const combinedNotifications = useMemo(() => {
    const all = [...realTimeNotifications, ...notifications];
    return all.filter((notif, index, self) => index === self.findIndex((n) => n.id === notif.id));
  }, [realTimeNotifications, notifications]);

  const displayedNotifications = useMemo(() => {
    if (showAllNotifications) {
      return combinedNotifications;
    }
    return combinedNotifications.slice(0, notificationsPerPage);
  }, [combinedNotifications, showAllNotifications]);

  const unreadCount = useMemo(
    () =>
      combinedNotifications.filter((notif) => notif.is_read === 0 || notif.is_read === undefined)
        .length,
    [combinedNotifications]
  );

  const handleClick = async (event) => {
    setAnchorEl(event.currentTarget);
    await fetchNotifications();
    await markNotificationsAsRead();
  };

  const handleClose = () => {
    setAnchorEl(null);
    setShowAllNotifications(false);
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read_at: new Date().toISOString() }))
    );
  };

  const handleClickItem = (path) => {
    popover.onClose();
    router.push(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      popover.onClose();
      router.replace('/auth/jwt/login');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to logout!', { variant: 'error' });
    }
  };

  const formatTimestamp = (notification) => {
    if (notification?.created_at) {
      return new Date(notification.created_at).toLocaleString();
    }
    if (notification?.timestamp) {
      return new Date(notification.timestamp).toLocaleString();
    }
    return 'Invalid Date';
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ width: 350, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Notifications
          </Typography>
          <List>
            {displayedNotifications.map((notification) => (
              <ListItem key={notification.id} alignItems="flex-start" divider>
                <ListItemText
                  primary={
                    notification?.data?.message || notification?.message || 'No message available'
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {formatTimestamp(notification)}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
          {combinedNotifications.length > notificationsPerPage && (
            <Button
              fullWidth
              variant="text"
              onClick={() => setShowAllNotifications(!showAllNotifications)}
              sx={{ mt: 1 }}
            >
              {showAllNotifications ? 'Show Less' : 'View All'}
            </Button>
          )}
        </Box>
      </Popover>

      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        onClick={popover.onOpen}
        sx={{
          width: 40,
          height: 40,
          background: (theme) => alpha(theme.palette.grey[500], 0.08),
          ...(popover.open && {
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          }),
        }}
      >
        <Avatar
          src={photo?.photo_url || ''}
          alt={user?.displayName || 'Guest'}
          sx={{
            width: 36,
            height: 36,
            border: (theme) => `solid 2px ${theme.palette.background.default}`,
          }}
        >
          {user?.displayName.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 200, p: 0 }}>
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {user?.full_name}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {user?.personal_email}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          {options.map((option) => (
            <MenuItem key={option.label} onClick={() => handleClickItem(option.linkTo)}>
              {option.label}
            </MenuItem>
          ))}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={handleLogout}
          sx={{ m: 1, fontWeight: 'fontWeightBold', color: 'error.main' }}
        >
          Logout
        </MenuItem>
      </CustomPopover>
    </>
  );
}
