import { useContext, useEffect, useState } from 'react';
import echo from '../../Config/echoConfig';
import { NotificationContext } from '../../context/NotificationContext';

const NotificationListener = () => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const { setNotifications } = useContext(NotificationContext);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const userId = storedUser?.id;

    echo.connector.pusher.connection.bind('connected', () => {
      setConnectionStatus('connected');
    });

    echo.connector.pusher.connection.bind('disconnected', () => {
      setConnectionStatus('disconnected');
    });

    const channelName = `profile.${userId}`;

    const channel = echo.private(channelName);

    const notificationCallback = (notification) => {
      if (notification?.message) {
        setNotifications((prevNotifications) => [notification, ...prevNotifications]);
      } else {
        console.warn('Notification received but no message found:', notification);
      }
    };

    channel.listen('.AccessChanged', notificationCallback);
    channel.listen(
      '.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated',
      notificationCallback
    );

    return () => {
      channel.stopListening('.AccessChanged');
      channel.stopListening('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated');
      echo.leave(channelName);
      // Avoid unbinding global connection events to prevent unwanted side effects
    };
  }, [setNotifications]);

  return null;
};

export default NotificationListener;
