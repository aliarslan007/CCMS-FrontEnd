import PropTypes from 'prop-types';
import { useState } from 'react';
// components
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {} from 'src/components/chart';

// ----------------------------------------------------------------------

export default function AnalyticsActivityPage({ title, subheader }) {
  const [activityData] = useState([
    {
      id: 1,
      username: 'admin@admin.com',
      timestamp: '2023-10-25T09:30:00Z',
      action: 'Login',
      details: 'User logged in from web portal',
    },
    {
      id: 2,
      username: 'test@test.com',
      timestamp: '2023-10-25T10:15:00Z',
      action: 'Viewed Dashboard',
      details: 'User viewed the sales dashboard',
    },
    {
      id: 3,
      username: 'user@user.com',
      timestamp: '2023-10-25T11:45:00Z',
      action: 'Downloaded Report',
      details: 'User downloaded monthly sales report',
    },
    {
      id: 4,
      username: 'ccms@ccms.com',
      timestamp: '2023-10-25T12:00:00Z',
      action: 'Logout',
      details: 'User logged out of the system',
    },
  ]);

  return (
    <Card>
      {/* Activity Table */}
      <Typography
        variant="h5"
        component="div"
        gutterBottom
        sx={{ ml: 2, pt: 1 }} // Adjust the value as needed
      >
        User Activity
      </Typography>
      <TableContainer sx={{ height: '365px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>username</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>Activity</TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activityData.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>{activity.username}</TableCell>
                <TableCell>{new Date(activity.timestamp).toLocaleString()}</TableCell>
                <TableCell>{activity.action}</TableCell>
                <TableCell>{activity.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

AnalyticsActivityPage.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
};
