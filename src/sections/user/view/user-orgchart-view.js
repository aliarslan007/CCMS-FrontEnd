import { Avatar, Box, Card, CardContent, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import OrganizationChart from 'react-orgchart';
import 'react-orgchart/index.css';
import { useNavigate } from 'react-router-dom';
import axiosInstance from 'src/utils/axios';
import { paths } from '../../../routes/paths';
import '../OrgChart.css';

const NodeComponent = ({ node, onAvatarClick }) => (
  <Card
    sx={{
      width: 100,
      border: '1px solid #e0e0e0',
      borderRadius: 2,
      boxShadow: 'none',
      '&:hover': { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
      margin: '4px auto',
      padding: '2px',
      backgroundColor: 'white',
    }}
  >
    <CardContent
      sx={{
        padding: '4px !important',
        '&:last-child': { paddingBottom: '4px !important' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Avatar
          alt={node.name}
          src={node.photo_url}
          sx={{
            width: 28,
            height: 28,
          }}
          onClick={() => onAvatarClick(node.uuid, node)}
        />
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 'bold',
              fontSize: '0.7rem',
              color: '#333',
              marginBottom: '2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '90px',
            }}
          >
            {node.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#666',
              fontSize: '0.65rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '90px',
            }}
          >
            {node.name}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

NodeComponent.propTypes = {
  node: PropTypes.shape({
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    photo_url: PropTypes.string.isRequired,
    uuid: PropTypes.string.isRequired,
    children: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  onAvatarClick: PropTypes.func.isRequired,
};

const OrgChartComponent = () => {
  const navigate = useNavigate();
  const [orgData, setOrgData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleCompanyClick = (uuid) => {
    navigate(paths.dashboard.user.companycontactdetails(uuid));
  };

  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        const response = await axiosInstance.get('/api/organization-chart');
        setOrgData(response.data);
      } catch (err) {
        setError('Failed to fetch organization chart data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrgData();
  }, []);

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
        <Typography>Loading organization chart...</Typography>
      </Box>
    );

  if (error)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2, color: 'error.main' }}>
        <Typography>{error}</Typography>
      </Box>
    );

  return (
    <Box
      sx={{
        width: '100%',
        overflowX: 'auto',
        backgroundColor: '#fff',
        padding: 1,
      }}
    >
      <Typography sx={{ fontFamily: 'sans-serif', color: 'gray',fontSize:'12px' }}>
        Click any avatar to view contact details.
      </Typography>
      <style>{}</style>
      <Box
        sx={{
          minWidth: '1200px', // Increased to accommodate spacing
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '40px',
        }}
      >
        <div className="orgchart-container">
          <OrganizationChart
            tree={orgData}
            NodeComponent={(nodeProps) => (
              <NodeComponent {...nodeProps} onAvatarClick={handleCompanyClick} />
            )}
            className="orgchart-sibling-nodes"
          />
        </div>
      </Box>
    </Box>
  );
};

export default OrgChartComponent;
