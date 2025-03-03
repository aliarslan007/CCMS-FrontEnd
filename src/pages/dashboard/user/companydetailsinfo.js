/* eslint-disable react-hooks/rules-of-hooks */
import {
  Box,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ButtonBase from '@mui/material/ButtonBase';
import { Container } from '@mui/system';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'src/components/snackbar';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { logActivity } from 'src/utils/log-activity';
import { useAuth } from '../../../auth/context/jwt/auth-context';
import { paths } from '../../../routes/paths';

export default function CompanyContactDetails({ moduleName }) {
  const { id } = useParams();
  const [company, setCompanyaccount] = useState(null);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [isMarked, setIsMarked] = useState(false);
  const [buttonText, setButtonText] = useState('Mark For Deletion');
  const { userRole } = useAuth(); // Get the user's role from the authentication context
  const isAdmin = userRole === 'Admin';
  const [contact, setCompanyContacts] = useState([]);
  const [userAccess, setUserAccess] = useState('');
  const { logout } = useAuth();
  const logSentRef = useRef(false);

  const getBorderRadius = (index) => {
    if (index === 0) return '10px 0 0 10px';
    if (index === 6) return '0 10px 10px 0';
    return 0;
  };

  useEffect(() => {
    const fetchDetailsAndStatus = async () => {
      if (!logSentRef.current) {
        const dynamicModuleName = moduleName || 'COMPANY DETAILS PAGE';
        logActivity('User view company details', dynamicModuleName);
        logSentRef.current = true;
      }
      setLoading(true);
      const flag = 'companycontacts';
      const token = sessionStorage.getItem('authToken');

      try {
        let companyData = null;
        try {
          const companyResponse = await axiosInstance.get(endpoints.details.accounts(id), {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          companyData = companyResponse.data;
          setCompanyaccount(companyData);
        } catch (error) {
          console.error('Error fetching company details:', error);
          enqueueSnackbar('Failed to load company details.', { variant: 'error' });
          setCompanyaccount(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDetailsAndStatus();
  }, [id, moduleName, enqueueSnackbar]);

  useEffect(() => {
    const flag = true;
    const fetchCompanyContacts = async () => {
      try {
        const token = sessionStorage.getItem('authToken');
        const userId = sessionStorage.getItem('userid');
        const role = sessionStorage.getItem('userRole');

        const response = await axiosInstance.get(endpoints.solo.details(company.id), {
          params: { flag, userId, role },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const contactData = response.data;
        setCompanyContacts(contactData);
      } catch (error) {
        console.error('Error fetching company contacts:', error);
        enqueueSnackbar('No company contacts found.', { variant: 'error' });
        setCompanyContacts([]);
      }
    };

    if (company && company.id) {
      fetchCompanyContacts();
    }
  }, [company, enqueueSnackbar]);

  useEffect(() => {
    const fetchMarkStatus = async () => {
      try {
        const statusResponse = await axiosInstance.get(endpoints.markdelete.get_marked(company.id));
        const statusData = statusResponse.data;

        if (statusData && statusData.data.status === 1) {
          setButtonText('Marked');
          setIsMarked(true);
        } else {
          setButtonText('Mark For Deletion');
          setIsMarked(false);
        }
      } catch (error) {
        console.error('Failed to load mark status:', error);
        setButtonText('Mark For Deletion');
        setIsMarked(false);
      }
    };

    if (company && company.id) {
      fetchMarkStatus();
    }
  }, [company]);

  useEffect(() => {
    const userId = sessionStorage.getItem('uuid');
    if (!userId) {
      console.error('User ID not found in SessionStorage');
      return;
    }
    const fetchUserDetails = async () => {
      try {
        const response = await axiosInstance.get(endpoints.profile.details(userId));
        const fetchedUser = response.data;
        const Access = fetchedUser.access;
        setUserAccess(Access);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, []);

  const checkUserAccessAndPerformAction = async (actionType) => {
    setLoading(true);
    try {
      const uuid = sessionStorage.getItem('uuid');
      if (!uuid) {
        console.error('User ID not found in sessionStorage');
        return;
      }
      const response = await axiosInstance.get(endpoints.profile.details(uuid));
      const fetchedUser = response.data;
      const { access, is_active } = fetchedUser;

      setUserAccess(access);

      if (is_active !== 1) {
        enqueueSnackbar('Your account is inactive. Logging out...', { variant: 'warning' });

        sessionStorage.clear();

        localStorage.clear();

        navigate('/ccms/auth/jwt/login');

        return;
      }

      if (
        actionType === 'edit' &&
        access !== 'Limited' &&
        access !== 'View Only' &&
        access !== 'Partial Access'
      ) {
        handleAvatarClick(id);
      } else if (actionType === 'addCompany' && access !== 'Limited' && access !== 'View Only') {
        navigate('/dashboard/user/company');
      } else {
        enqueueSnackbar('You do not have permission to perform this action');
      }
    } catch (error) {
      console.error('Error fetching user details during action:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkForDelete = async () => {
    const userId = sessionStorage.getItem('userid');
    try {
      const payload = {
        id: userId,
        profile_type: 'App\\Models\\CompanyAccount',
        name: company.company_name,
        last_name: company.company_type,
        title: company.service,
        company_name: company.company_name,
        sale_rep_name: `${company.full_name} ${company.last_name}`,
      };
      const response = await axiosInstance.post(endpoints.markdelete.marked(company.id), payload);
      logActivity('User marked a company for delete', moduleName || 'COMPANIES DETAILS PAGE', {
        identification: company.company_name,
      });
      enqueueSnackbar(response.data.message, { variant: 'success' });
      setIsMarked(true);
      localStorage.setItem(`markedForDeletion-${id}`, 'true');
    } catch (error) {
      console.error('Error marking for deletion:', error);
      enqueueSnackbar(error.response?.data?.message || 'Failed to mark for deletion', {
        variant: 'error',
      });
    }
  };

  if (!company) {
    return (
      <Typography variant="h6" align="center">
        {/* Loading company details... */}
      </Typography>
    );
  }

  const handleAvatarClick = () => {
    navigate(paths.dashboard.user.companydetailsinfoedit(id));
  };

  return (
    <>
      <Container maxWidth="">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '10px',
            justifyContent: 'end',
          }}
        >
          <Button
            variant="contained"
            sx={{
              backgroundColor: isMarked ? '#ccc' : 'red',
              color: '#fff',
              fontSize: '12px',
              fontWeight: '500',
              textTransform: 'none',
              marginRight: '10px',
              '&:hover': {
                backgroundColor: '#cc0000',
              },
            }}
            onClick={handleMarkForDelete}
            disabled={isMarked}
          >
            {buttonText}
          </Button>
          {/* <Box
            component="img"
            sx={{
              marginRight: '10px',
            }}
            src={chart}
            alt="Profile"
          />
          <Link sx={{ color: 'rgba(24, 35, 61, 1)', fontSize: '14px' }} href="/dashboard/user/orgchart" underline="sx">
            View Organization Chart
          </Link> */}
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  boxShadow: '0 4px 6px rgba(171, 180, 207, 0.12)',
                  paddingBottom: '15px',
                  borderRadius: '10px',
                }}
              >
                <Box
                  sx={{
                    backgroundColor: 'rgba(0, 166, 109, 1)',
                    padding: '5px 22px',
                    borderRadius: '10px 10px 0 0',
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{ fontSize: '20px', color: 'rgba(255, 255, 255, 1)' }}
                  >
                    {company.company_name || 'Company Name Not Available'}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    padding: '0 25px',
                    position: 'relative',
                    paddingTop: '35px',
                  }}
                >
                  <Box
                    component="img"
                    sx={{
                      position: 'absolute',
                      top: '-22px',
                      right: '35px',
                      width: '75px',
                      height: '75px',
                      borderRadius: '50%', // Optional: round image for profile style
                      border: '2px solid rgba(243, 82, 130, 1)',
                    }}
                    src={company.photo_url}
                    alt="Profile"
                  />
                  <Typography
                    variant="span"
                    sx={{
                      fontSize: '25px',
                      display: 'block',
                      color: 'rgba(24, 35, 61, 1)',
                    }}
                  >
                    Welcome
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontSize: '22px', marginBottom: '14px', color: 'rgba(24, 35, 61, 1)' }}
                  >
                    {/* Empty string keeps the space */}{' '}
                  </Typography>

                  <Typography
                    sx={{ fontSize: '12px', marginBottom: '12px', color: 'rgba(107, 119, 154, 1)' }}
                  >
                    Compnay Type: {company.company_type || 'Company Type Name Not Available'}
                  </Typography>
                  <Typography
                    sx={{ fontSize: '12px', marginBottom: '12px', color: 'rgba(107, 119, 154, 1)' }}
                  >
                    {company.website || 'Company Type Name Not Available'}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      color: 'rgba(171, 180, 207, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '10px',
                    }}
                  >
                    LinkedIn:
                    <Typography
                      sx={{ color: 'rgba(107, 119, 154, 1)', fontSize: '14px', marginLeft: '3px' }}
                    >
                      {company.linkedin_url || 'LinkedIn Not Available'}
                    </Typography>
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      color: 'rgba(171, 180, 207, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    Main Phone Number:
                    <Typography
                      sx={{ color: 'rgba(107, 119, 154, 1)', fontSize: '14px', marginLeft: '3px' }}
                    >
                      {company.phone_number || 'Company Type Name Not Available'}
                    </Typography>
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Box
                sx={{
                  boxShadow: '0 4px 6px rgba(171, 180, 207, 0.12)',
                  paddingBottom: '15px',
                  borderRadius: '10px',
                }}
              >
                <Box
                  sx={{
                    backgroundColor: 'rgba(0, 166, 109, 1)',
                    padding: '5px 22px',
                    borderRadius: '10px 10px 0 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{ fontSize: '20px', color: 'rgba(255, 255, 255, 1)' }}
                  >
                    Compnay Details
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {/* "Edit" Button */}
                      {userAccess === 'Limited' ||
                      userAccess === 'View Only' ||
                      userAccess === 'Partial Access' ? (
                        <Typography variant="body2" sx={{ fontSize: '14px', color: '#aaa' }}>
                          Edit (Permission Denied)
                        </Typography>
                      ) : (
                        <ButtonBase
                          sx={{
                            display: 'inline-block',
                            backgroundColor: 'transparent',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                          }}
                          onClick={() => checkUserAccessAndPerformAction('edit')}
                          disabled={loading}
                        >
                          <Typography variant="body2" sx={{ fontSize: '14px', color: '#fff' }}>
                            {loading ? 'Checking...' : 'Edit'}
                          </Typography>
                        </ButtonBase>
                      )}

                      {/* "Add New Company" Button */}
                      {userAccess === 'Limited' || userAccess === 'View Only' ? (
                        <Typography variant="body2" sx={{ fontSize: '14px', color: '#aaa' }}>
                          Add New Company (Permission Denied)
                        </Typography>
                      ) : (
                        <ButtonBase
                          sx={{
                            display: 'inline-block',
                            backgroundColor: 'transparent',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                          }}
                          onClick={() => checkUserAccessAndPerformAction('addCompany')}
                          disabled={loading}
                        >
                          <Typography variant="body2" sx={{ fontSize: '14px', color: '#fff' }}>
                            {loading ? 'Checking...' : 'Add New Company'}
                          </Typography>
                        </ButtonBase>
                      )}
                    </Box>
                  </Box>
                </Box>
                <Box
                  sx={{
                    padding: '0 22px',
                    position: 'relative',
                    paddingTop: '12px',
                  }}
                >
                  <Typography
                    variant="span"
                    sx={{
                      fontSize: '14px',
                      display: 'block',
                      color: 'rgba(171, 180, 207, 1)',
                    }}
                  >
                    Services
                  </Typography>
                  <Typography
                    variant="p"
                    sx={{
                      fontSize: '14px',
                      marginBottom: '14px',
                      display: 'block',
                      color: 'rgba(107, 119, 154, 1)',
                    }}
                  >
                    {company.service || 'Company Type Name Not Available'}
                  </Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item sx={2} md={4} lg={3}>
                        <Typography
                          variant="span"
                          sx={{
                            fontSize: '14px',
                            display: 'block',
                            color: 'rgba(171, 180, 207, 1)',
                          }}
                        >
                          Company Address 1
                        </Typography>
                        <Typography
                          variant="p"
                          sx={{
                            fontSize: '14px',
                            marginBottom: '30px',
                            color: 'rgba(107, 119, 154, 1)',
                          }}
                        >
                          {company.address1 || 'Address 1 Not Available'}
                        </Typography>
                      </Grid>
                      <Grid item sx={2} md={4} lg={3}>
                        <Typography
                          variant="span"
                          sx={{
                            fontSize: '14px',
                            display: 'block',
                            color: 'rgba(171, 180, 207, 1)',
                          }}
                        >
                          Company Address 2
                        </Typography>
                        <Typography
                          variant="p"
                          sx={{
                            fontSize: '14px',
                            marginBottom: '30px',
                            color: 'rgba(107, 119, 154, 1)',
                          }}
                        >
                          {company.address2 || 'Address 2 Not Available'}
                        </Typography>
                      </Grid>
                      <Grid item sx={2} md={4} lg={3}>
                        <Typography
                          variant="span"
                          sx={{
                            fontSize: '14px',
                            display: 'block',
                            color: 'rgba(171, 180, 207, 1)',
                          }}
                        >
                          Country
                        </Typography>
                        <Typography
                          variant="p"
                          sx={{
                            fontSize: '14px',
                            marginBottom: '30px',
                            color: 'rgba(107, 119, 154, 1)',
                          }}
                        >
                          {company.country || 'Country Name Not Available'}
                        </Typography>
                      </Grid>
                      <Grid item sx={2} md={4} lg={3}>
                        <Typography
                          variant="span"
                          sx={{
                            fontSize: '14px',
                            display: 'block',
                            color: 'rgba(171, 180, 207, 1)',
                          }}
                        >
                          City
                        </Typography>
                        <Typography
                          variant="p"
                          sx={{
                            fontSize: '14px',
                            marginBottom: '30px',
                            color: 'rgba(107, 119, 154, 1)',
                          }}
                        >
                          {company.city || 'City Name Not Available'}
                        </Typography>
                      </Grid>
                      <Grid item sx={2} md={4} lg={3}>
                        <Typography
                          variant="span"
                          sx={{
                            fontSize: '14px',
                            display: 'block',
                            color: 'rgba(171, 180, 207, 1)',
                          }}
                        >
                          State/Province
                        </Typography>
                        <Typography
                          variant="p"
                          sx={{
                            fontSize: '14px',
                            marginBottom: '30px',
                            color: 'rgba(107, 119, 154, 1)',
                          }}
                        >
                          {company.state || 'State Name Not Available'}
                        </Typography>
                      </Grid>
                      <Grid item sx={2} md={4} lg={3}>
                        <Typography
                          variant="span"
                          sx={{
                            fontSize: '14px',
                            display: 'block',
                            color: 'rgba(171, 180, 207, 1)',
                          }}
                        >
                          Zip/Code
                        </Typography>
                        <Typography
                          variant="p"
                          sx={{
                            fontSize: '14px',
                            marginBottom: '30px',
                            color: 'rgba(107, 119, 154, 1)',
                          }}
                        >
                          {company.zip || 'ZipCode Not Available'}
                        </Typography>
                      </Grid>
                      {/* <Grid item sx={2} md={4} lg={3}>
                        <Typography
                          variant="span"
                          sx={{
                            fontSize: '14px',
                            display: 'block',
                            color: 'rgba(171, 180, 207, 1)',
                          }}
                        >
                          Website
                        </Typography>
                        <Typography
                          variant="p"
                          sx={{
                            fontSize: '14px',
                            marginBottom: '30px',
                            color: 'rgba(107, 119, 154, 1)',
                          }}
                        >
                          {company.website || 'Website Not Available'}
                        </Typography>
                      </Grid> */}
                      <Grid item sx={2} md={4} lg={3}>
                        <Typography
                          variant="span"
                          sx={{
                            fontSize: '14px',
                            display: 'block',
                            color: 'rgba(171, 180, 207, 1)',
                          }}
                        >
                          Facebook URL
                        </Typography>
                        <Typography
                          variant="p"
                          sx={{
                            fontSize: '14px',
                            marginBottom: '30px',
                            color: 'rgba(107, 119, 154, 1)',
                          }}
                        >
                          {company.facebook_url || 'Facebook Url Not Available'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ flexGrow: 1, marginTop: '27px', width: '100%' }}>
          <Grid container spacing={2}>
            {/* Contact History Table */}
            <Grid item xs={12} md={12} mt={-1}>
              <Typography
                sx={{ fontSize: '24px', color: 'rgba(24, 35, 61, 1)', marginBottom: '7px' }}
                variant="h6"
                gutterBottom
              >
                Company Contacts
              </Typography>
              <Typography
                sx={{
                  fontSize: '11px',
                  marginTop: '5px',
                }}
              >
                Click on the contact name to see the details of the contact
              </Typography>
              <TableContainer
                component={Paper}
                sx={{
                  width: '100%',
                  height: '350px',
                  overflowX: 'auto', // Enables horizontal scroll for large tables
                }}
              >
                <Table
                  sx={{
                    width: '100%',
                    borderCollapse: 'separate',
                    borderSpacing: '0 20px',
                    marginTop: '-14px',
                  }}
                >
                  <TableHead>
                    <TableRow>
                      {[
                        'Contact Name',
                        'Last Name',
                        'Phone Number',
                        'Email Address',
                        'Region',
                        'Title',
                        // 'Assigned To',
                      ].map((heading, index) => (
                        <TableCell
                          key={index}
                          sx={{
                            backgroundColor: 'rgba(224, 237, 250, 1)',
                            color: 'rgba(24, 35, 61, 1)',
                            fontSize: '16px',
                            textAlign: 'center',
                            padding: '10px 15px',
                            borderRadius: getBorderRadius(index),
                          }}
                        >
                          {heading}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody className="Table-custom">
                    {contact.map((row, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          boxShadow: '0 4px 6px rgb(171 180 207 / 22%)',
                          borderRadius: '10px',
                        }}
                      >
                        <TableCell
                          sx={{
                            padding: '10px 15px',
                            textAlign: 'center',
                          }}
                          component={Link} // Make it clickable
                          to={`/dashboard/user/companycontactdetails/${row.uuid}`}
                          style={{ textDecoration: 'none', color: '#00A76F' }}
                        >
                          {row.client_first_name}
                        </TableCell>
                        <TableCell sx={{ padding: '10px 15px', textAlign: 'center' }}>
                          {row.client_last_name}
                        </TableCell>
                        <TableCell sx={{ padding: '10px 15px', textAlign: 'center' }}>
                          {row.cell_phone1}
                        </TableCell>
                        <TableCell sx={{ padding: '10px 15px', textAlign: 'center' }}>
                          {row.office_email}
                        </TableCell>
                        <TableCell sx={{ padding: '10px 15px', textAlign: 'center' }}>
                          {row.region}
                        </TableCell>
                        <TableCell sx={{ padding: '10px 15px', textAlign: 'center' }}>
                          {row.title}
                        </TableCell>
                        <TableCell sx={{ padding: '10px 15px', textAlign: 'center' }}>
                          {row.fullname}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </Box>
      </Container>{' '}
    </>
  );
}
CompanyContactDetails.propTypes = {
  moduleName: PropTypes.string,
};
