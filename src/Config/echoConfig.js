import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { HOST_API } from '../config-global';

window.Pusher = Pusher;

const getAuthToken = () => {
  const token = localStorage.getItem('authToken');
  return token;
};

const echo = new Echo({
  broadcaster: 'pusher',
  key: 'b2ef7004f0d754d5a7fb',
  cluster: 'ap2',
  forceTLS: true,
  authEndpoint: `${HOST_API}api/broadcasting/auth`,
  auth: {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      Accept: 'application/json',
    },
  },
});

export default echo;
