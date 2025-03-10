import {
  Avatar,
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import OrganizationChart from 'react-orgchart';
import 'react-orgchart/index.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'src/components/snackbar';
import axiosInstance, { endpoints } from 'src/utils/axios';
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
            cursor: 'pointer',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
            },
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
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const [userRole, setUserRole] = useState(null);
  const { search } = useLocation();

  const queryParams = new URLSearchParams(search);
  const encodedData = queryParams.get('data');
  const companyIds = encodedData ? atob(encodedData) : null;

  useEffect(() => {
    const fetchOrgChart = async () => {
      try {
        const response = await axiosInstance.get('/api/organization-chart', {
          params: { company_id: companyIds },
        });
        setOrgData(response.data);
      } catch (error) {
        console.error('Error fetching organization chart:', error);
      }
    };

    if (companyIds) {
      fetchOrgChart();
    }
  }, [companyIds]);

  const handleCompanyClick = (uuid) => {
    if (userRole === 'Admin') {
      navigate(paths.dashboard.user.companycontactdetails(uuid));
    }
  };

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    setUserRole(storedRole);
  }, []);

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axiosInstance.get(endpoints.all.company, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies(response.data);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  if (companies.length === 0) fetchCompanies();

  const handleCompanyChange = async (event) => {
    const companyId = event.target.value;
    setSelectedCompany(companyId);

    try {
      const response = await axiosInstance.get('/api/organization-chart', {
        params: { company_id: companyId },
      });
      setOrgData(response.data);
    } catch (error) {
      console.error('Failed to fetch organization chart:', error);
      enqueueSnackbar(' No organization chart data available', { variant: 'error' });
    }
  };

  return (
    <Box sx={{ width: '100%', overflowX: 'auto', backgroundColor: '#fff', padding: 1 }}>
      <Box sx={{ mb: 2, maxWidth: 200, mt: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Select Company</InputLabel>
          <Select
            value={selectedCompany}
            onChange={handleCompanyChange}
            label="Select Company"
            sx={{ minWidth: 200 }}
          >
            {companies.map((company) => (
              <MenuItem key={company.id} value={company.id}>
                {company.company_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box
        sx={{
          minWidth: '1200px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '40px',
        }}
      >
        {orgData ? (
          <div className="orgchart-container">
            <OrganizationChart
              tree={orgData}
              NodeComponent={(nodeProps) => (
                <NodeComponent {...nodeProps} onAvatarClick={handleCompanyClick} />
              )}
              className="orgchart-sibling-nodes"
            />
          </div>
        ) : (
          <Typography sx={{ mt: 4, color: 'text.secondary' }}>
            Select any company from dropdown to view organization chart
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default OrgChartComponent;
