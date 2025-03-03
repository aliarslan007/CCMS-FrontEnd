/* eslint-disable react-hooks/rules-of-hooks */
import { Modal as BaseModal } from '@mui/base/Modal';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import ButtonBase from '@mui/material/ButtonBase';
import Fade from '@mui/material/Fade';
import { Container, css, styled } from '@mui/system';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ActivityIcon from 'src/assets/Images/activity-icon.png';
import chart from 'src/assets/Images/chart.png';
import filterIcon from 'src/assets/Images/filter-icon.jpg';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { logActivity } from 'src/utils/log-activity';
import { paths } from '../../../routes/paths';

export default function CompanyContactDetails({ moduleName }) {
  const { id } = useParams();
  const [followUpDetails, setFollowUpDetails] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const navigate = useNavigate();
  const [contact, setContact] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const [isMarked, setIsMarked] = useState(false);
  const [buttonText, setButtonText] = useState('Mark For Deletion');
  const [userAccess, setUserAccess] = useState(null);
  const [canEdit, setCanEdit] = useState(false);
  const [canAddContact, setCanAddContact] = useState(false);
  const [canAddNote, setCanAddNote] = useState(false);
  const [errors, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [files, setFiles] = useState([]);
  const [awards, setAwards] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewAwardDialog, setOpenViewAwardDialog] = useState(false);
  const [award, setAward] = useState('');
  const [contactId, setContactId] = useState(null);
  const [role, setRole] = useState('');
  const [awardTitle, setAwardTitle] = useState('');
  const [manager, setManager] = useState('');
  const [salesRepName, setSalesRepName] = useState('');
  const [amountDollars, setAmountDollars] = useState('');
  const [awardDetail, setAwardDetail] = useState('');
  const [salesReps, setSalesReps] = useState([]);
  const [selectedSalesRep, setSelectedSalesRep] = useState(null);
  const [detailText, setDetailText] = useState('');
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const logSentRef = useRef(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileStatusAndFollowUps = async () => {
      setLoading(true);
      if (!logSentRef.current) {
        const dynamicModuleName = moduleName || 'COMPANY CONTACT DETAILS PAGE';
        logActivity('User view company contact details', dynamicModuleName);
        logSentRef.current = true;
      }
      try {
        const token = sessionStorage.getItem('authToken');
        const userId = sessionStorage.getItem('uuid');
        if (!userId) {
          console.error('User ID not found in SessionStorage');
          return;
        }

        // Split contact fetch from profile fetch
        const contactPromise = axiosInstance.get(endpoints.solo.details(id), {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Update with contact data first
        const contactResponse = await contactPromise;
        setContact(contactResponse.data || []); 

        // Then fetch profile data
        const profileResponse = await axiosInstance.get(endpoints.profile.details(userId), {
          headers: { Authorization: `Bearer ${token}` },
        });

        const fetchedUser = profileResponse.data;
        const Access = fetchedUser.access;
        setUserAccess(Access);
        setPermissionsBasedOnAccess(Access);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileStatusAndFollowUps();
  }, [id, moduleName]);
  // Removed userAccess from dependencies

  useEffect(() => {
    const fetchMarkedStatus = async () => {
      try {
        if (contact && contact.length > 0 && contact[0].marked_for_deletion_flag) {
          const statusResponse = await axiosInstance.get(
            endpoints.markdelete.get_marked(contact[0].id)
          );
          if (statusResponse.data && statusResponse.data.data.status === 1) {
            setButtonText('Marked');
            setIsMarked(true);
          } else {
            setButtonText('Mark For Deletion');
            setIsMarked(false);
          }
        } else {
          console.log('Marked for deletion flag is false; skipping marked status fetch.');
        }
      } catch (error) {
        console.error('Error fetching marked status:', error);
      }
    };

    fetchMarkedStatus();
  }, [contact]);

  const setPermissionsBasedOnAccess = (access) => {
    if (access === 'Full Access') {
      setCanEdit(true);
      setCanAddContact(true);
      setCanAddNote(true);
    } else if (access === 'Partial Access') {
      setCanEdit(false);
      setCanAddContact(true);
      setCanAddNote(true);
    } else if (access === 'View Only') {
      setCanEdit(false);
      setCanAddContact(false);
      setCanAddNote(false);
    } else if (access === 'Limited') {
      setCanEdit(false);
      setCanAddContact(false);
      setCanAddNote(true);
    }
  };

  const handleActionPermissionCheck = async (actionType) => {
    try {
      const uuid = sessionStorage.getItem('uuid');
      if (!uuid) {
        console.error('User ID not found in sessionStorage');
        return;
      }

      // Fetch the current user details again to get the most up-to-date access level
      const response = await axiosInstance.get(endpoints.profile.details(uuid));
      const fetchedUser = response.data;
      const { access, is_active } = fetchedUser;

      setUserAccess(access);
      if (actionType === 'edit') {
        if (access === 'Full Access') {
          handleAvatarClick(id);
        } else {
          enqueueSnackbar('You do not have permission to edit');
        }
      } else if (actionType === 'addContact') {
        if (access === 'Full Access' || access === 'Partial Access') {
          navigate('/dashboard/user/companycontacts');
        } else {
          enqueueSnackbar('You do not have permission to add a contact');
        }
      }
    } catch (error) {
      console.error('Error fetching user details during action:', error);
    }
  };

  const fetchFollowUps = useCallback(async () => {
    if (!contact || contact.length === 0) return;

    // Fetch follow-ups only if follow_up_flag is true
    try {
      if (contact[0].follow_up_flag) {
        const followUpsResponse = await axiosInstance.get(
          endpoints.follow_up.details(contact[0]?.id)
        );
        if (followUpsResponse.data) {
          setFollowUps(followUpsResponse.data.data);
        }
      } else {
        console.log('Follow-up flag is false; skipping follow-ups fetch.');
      }
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
    }

    // Fetch files only if files_flag is true
    try {
      if (contact[0].files_flag) {
        const filesResponse = await axiosInstance.get(endpoints.files.list(contact[0]?.id));
        if (filesResponse.data) {
          setFiles(filesResponse.data.data);
        }
      } else {
        console.log('Files flag is false; skipping files fetch.');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  }, [contact]);

  useEffect(() => {
    fetchFollowUps();
  }, [fetchFollowUps]);

  const fetchAwards = useCallback(async () => {
    if (!contact || contact.length === 0) return;
    try {
      if (contact[0].award_flag) {
        const awardsResponse = await axiosInstance.get(endpoints.award.function, {
          params: { company_contact_id: contact[0]?.id },
        });
        if (awardsResponse.data) {
          setAwards(awardsResponse.data.data);
        }
      } else {
        console.log('Award flag is false; skipping awards fetch.');
      }
    } catch (error) {
      console.error('Error fetching awards:', error);
    }
  }, [contact]);

  useEffect(() => {
    fetchAwards();
  }, [fetchAwards]);

  useEffect(() => {
    const fetchSalesReps = async () => {
      try {
        const response = await axiosInstance.get(endpoints.admin.details);
        const activeUsers = response.data.filter((user) => user.is_active === 1);

        const filteredSalesReps = activeUsers
          .filter((user) => user.role === 'Sales Representative')
          .map((user) => ({
            id: user.id,
            name: user.full_name || 'Unknown Name',
            role: user.role || 'Unknown Role',
          }));

        setSalesReps(filteredSalesReps);
      } catch (error) {
        console.error('Error fetching sales representatives:', error);
      }
    };

    fetchSalesReps();
  }, []);

  // Handle Mark Deletion
  const handleMarkForDelete = async () => {
    const userId = sessionStorage.getItem('userid');
    try {
      const payload = {
        id: userId,
        profile_type: 'App\\Models\\CompanyContact',
        name: contact[0]?.client_first_name,
        last_name: contact[0]?.client_last_name,
        title: contact[0]?.title,
        company_name: contact[0]?.company_name,
        sale_rep_name: contact[0]?.fullname,
      };
      const response = await axiosInstance.post(
        endpoints.markdelete.marked(contact[0]?.id),
        payload
      );
      logActivity(
        'User marked a contact for delete',
        moduleName || 'COMPANY CONTACT DETAILS PAGE',
        { identification: contact[0]?.client_first_name }
      );
      enqueueSnackbar(response.data.message, { variant: 'success' });
      setIsMarked(true);
      sessionStorage.setItem(`markedForDeletion-${id}`, 'true');
    } catch (error) {
      console.error('Error marking for deletion:', error);
      enqueueSnackbar(error.response?.data?.message || 'Failed to mark for deletion', {
        variant: 'error',
      });
    }
  };

  useEffect(() => {
    const userRole = sessionStorage.getItem('userRole');
    setRole(userRole);
  }, []);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setSelectedFileName(selectedFile.name);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFileName('');
  };

  // Hanlde the Follow_up
  const userId = sessionStorage.getItem('userid');
  const handleSubmit = async () => {
    logActivity('User add notes to contact', moduleName || 'COMPANY CONTACT DETAILS PAGE', {
      identification: contact[0]?.client_first_name,
    });
    try {
      if (!followUpDetails) {
        enqueueSnackbar('Please fill in the Add Notes.', { variant: 'error' });
        return;
      }

      const formData = new FormData();
      formData.append('id', userId);
      formData.append('company_contacts_id', contact[0]?.id);
      formData.append('details', followUpDetails);

      const response = await axiosInstance.post(endpoints.submit.follow_up, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        setFollowUps((prev) => [...prev, response.data.data]);
        enqueueSnackbar('Follow-up created successfully!', { variant: 'success' });
        setFollowUpDetails('');
        setSelectedDate(null);
        setError(null);
      }

      fetchFollowUps();
    } catch (error) {
      console.error('Error file uploading:', error);
      enqueueSnackbar(error.response?.data?.message || 'Failed to upload a file', {
        variant: 'error',
      });
    }
  };

  const handleFileUpload = async () => {
    logActivity('User uploads a file', moduleName || 'COMPANY CONTACT DETAILS PAGE', {
      identification: contact[0]?.client_first_name,
    });
    const formData = new FormData();
    formData.append('id', userId);
    formData.append('company_contacts_id', contact[0]?.id);
    formData.append('file', file);

    try {
      const response = await axiosInstance.post(endpoints.file.upload, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200 || response.status === 201) {
        enqueueSnackbar('File uploaded successfully!', { variant: 'success' });
      }

      fetchFollowUps();
      setFile(null);
      setSelectedFileName(null);
    } catch (error) {
      console.error('Error file uploading:', error);
      enqueueSnackbar(error.response?.data?.message || 'Failed to upload a file', {
        variant: 'error',
      });
    }
  };

  const handleFollowUpDate = async () => {
    if (!selectedDate) {
      enqueueSnackbar('Please select a follow-up date.', { variant: 'warning' });
      return;
    }
    logActivity('User add a follow-up date', moduleName || 'COMPANY CONTACT DETAILS PAGE', {
      identification: contact[0]?.client_first_name,
    });
    const localUserAccess = sessionStorage.getItem('userid');
    if (!localUserAccess) {
      enqueueSnackbar('User ID is missing. Please log in again.', { variant: 'error' });
      return;
    }
    const formData = new FormData();
    formData.append('company_contact_id', contact[0]?.id);
    formData.append('profile_id', localUserAccess);
    formData.append('follow_up_date', selectedDate.toISOString().split('T')[0]);

    try {
      const response = await axiosInstance.post('/api/follow-up-dates', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        enqueueSnackbar('Follow-up date added successfully!', { variant: 'success' });

        fetchFollowUps();
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessage =
          error.response.data.message || 'Failed to add follow-up date. Please try again.';
        enqueueSnackbar(errorMessage, { variant: 'error' });
        console.error('Backend error:', error.response.data.message);
      } else {
        enqueueSnackbar('Failed to add follow-up date. Please try again.', { variant: 'error' });
        console.error('Error adding follow-up date:', error);
      }
    }
  };

  const handleAwardChange = (e) => {
    setAward(e.target.value);
  };

  const handleSave = async () => {
    logActivity('User add a award', moduleName || 'COMPANY CONTACT DETAILS PAGE', {
      identification: contact[0]?.client_first_name,
    });
    try {
      if (!award || !id) {
        enqueueSnackbar('Award and Company Contact ID are required', { variant: 'error' });
        return;
      }

      const response = await axiosInstance.post(endpoints.award.function, null, {
        params: {
          id: userId,
          company_contact_id: contact[0]?.id,
          admin_name: manager,
          award,
          award_title: awardTitle,
          sales_rep_name: selectedSalesRep,
          amount_dollars: amountDollars,
        },
      });

      if (response.status === 201) {
        const newAward = {
          award,
          award_title: awardTitle,
          admin_name: manager,
          sales_rep_name: salesRepName,
          amount_dollars: amountDollars,
          projects: [
            {
              text: award,
              link: 'Link',
              id: response.data.id,
            },
          ],
        };

        setAwards((prevAwards) => [...prevAwards, newAward]);

        handleClose();
        enqueueSnackbar('Award saved successfully', { variant: 'success' });
      } else {
        enqueueSnackbar('Failed to save award', { variant: 'error' });
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessage =
          error.response.data.message || 'Failed to add follow-up date. Please try again.';
        enqueueSnackbar(errorMessage, { variant: 'error' });
        console.error('Backend error:', error.response.data.message);
      } else {
        enqueueSnackbar('Failed to add follow-up date. Please try again.', { variant: 'error' });
        console.error('Error adding follow-up date:', error);
      }
    }
  };

  const handleOpen = () => {
    setContactId(id);
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setOpenViewAwardDialog(false);
    setAward('');
  };

  const handleAvatarClick = () => {
    navigate(paths.dashboard.user.companycontactdetailsedit(id));
  };

  const handleAwardClick = (awardDetailFromProps) => {
    setAwardDetail(awardDetailFromProps);
    setOpenViewAwardDialog(true);
  };

  const handleDetailClick = (detailFromProps) => {
    setDetailText(detailFromProps);
    setOpenDetailDialog(true);
  };

  const handleDeleteFile = async (fileId) => {
    logActivity('User delete a file', moduleName || 'COMPANY CONTACT DETAILS PAGE', {
      identification: contact[0]?.client_first_name,
    });
    try {
      if (window.confirm('Are you sure you want to delete this file?')) {
        const response = await axiosInstance.delete(`/api/files/${fileId}`);

        if (response.status === 200) {
          enqueueSnackbar(response.data.message || 'File deleted successfully', {
            variant: 'success',
          });

          const updatedFiles = files.filter((filee) => filee.id !== fileId);
          setFiles(updatedFiles);
        }
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      enqueueSnackbar(error.response?.data?.message || 'Failed to delete the file', {
        variant: 'error',
      });
    }
  };

  const companyAccountId = contact[0]?.company_account_id;
  const encodedCompanyId = companyAccountId ? btoa(companyAccountId.toString()) : null;

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
              fontSize: '14px',
              fontWeight: '500',
              textTransform: 'none',
              marginRight: '10px',
              borderRadius: '6px',
              padding: '8px 16px',
              '&:hover': {
                backgroundColor: '#cc0000',
              },
            }}
            onClick={handleMarkForDelete}
            disabled={isMarked}
          >
            {buttonText}
          </Button>
          <Button
            variant="contained"
            startIcon={
              <Box
                component="img"
                sx={{
                  width: 20,
                  height: 20,
                  filter: 'brightness(0) invert(1)',
                }}
                src={chart}
                alt="Organization Chart Icon"
              />
            }
            sx={{
              backgroundColor: 'primary.main',
              color: 'common.white',
              fontSize: '14px',
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              '&:hover': {
                backgroundColor: 'primary.dark',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              },
            }}
            component={Link}
            to={`/dashboard/user/orgchart?data=${encodedCompanyId}`}
            onClick={() => {
              logActivity(
                'User viewed the Organization Chart',
                moduleName || 'COMPANY CONTACT DETAILS PAGE',
                { identification: contact[0]?.client_first_name || 'Unknown' }
              );
            }}
          >
            View Organization Chart
          </Button>
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={12}>
              <Box
                sx={{
                  boxShadow: '0 4px 6px rgba(171, 180, 207, 0.12)',
                  paddingBottom: '10px',
                  borderRadius: '8px',
                }}
              >
                <Box
                  sx={{
                    backgroundColor: 'rgba(0, 166, 109, 1)',
                    padding: '10px 20px',
                    borderRadius: '10px 10px 0 0',
                  }}
                >
                  <Typography
                    variant="h6"
                    textAlign="center"
                    sx={{ fontSize: '5px', color: 'rgba(255, 255, 255, 1)' }}
                  >
                    {'Client Contact History & Details' || 'No Title'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box
                sx={{
                  boxShadow: '0 4px 6px rgba(171, 180, 207, 0.12)',
                  paddingBottom: '25px',
                  borderRadius: '8px',
                }}
              >
                <Box
                  sx={{
                    padding: '0 8px',
                    position: 'relative',
                    paddingTop: '14px',
                    textAlign: 'center',
                  }}
                >
                  <Box
                    component="img"
                    loading="lazy"
                    sx={{
                      // position: 'absolute',
                      top: '-22px',
                      right: '35px',
                      width: '75px',
                      height: '75px',
                      borderRadius: '50%', // Optional: round image for profile style
                      border: '2px solid rgba(243, 82, 130, 1)',
                    }}
                    src={contact[0]?.photo_url || 'No Photo'}
                    alt="Profile"
                  />
                  <Typography
                    variant="h6"
                    sx={{ fontSize: '22px', marginBottom: '0', color: 'rgba(24, 35, 61, 1)' }}
                  >
                    {`${contact[0]?.client_first_name} ${contact[0]?.client_last_name}` || 'N/A'}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontSize: '22px', marginBottom: '14px', color: 'rgba(24, 35, 61, 1)' }}
                  >
                    {`${contact[0]?.title}` || 'No Title'}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '13px',
                      color: 'rgba(171, 180, 207, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    Company:
                    <Typography
                      sx={{ color: 'rgba(107, 119, 154, 1)', fontSize: '14px', marginLeft: '3px' }}
                    >
                      {contact[0]?.company_name || 'No Company Name'}
                    </Typography>
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '13px',
                      color: 'rgba(171, 180, 207, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    First name:
                    <Typography
                      sx={{ color: 'rgba(107, 119, 154, 1)', fontSize: '14px', marginLeft: '3px' }}
                    >
                      {contact[0]?.client_first_name || 'No First Name'}
                    </Typography>
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '13px',
                      color: 'rgba(171, 180, 207, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    Last Name:
                    <Typography
                      sx={{ color: 'rgba(107, 119, 154, 1)', fontSize: '14px', marginLeft: '3px' }}
                    >
                      {contact[0]?.client_last_name || 'No Last Name '}
                    </Typography>
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '13px',
                      color: 'rgba(171, 180, 207, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    Job Title:
                    <Typography
                      sx={{ color: 'rgba(107, 119, 154, 1)', fontSize: '13px', marginLeft: '3px' }}
                    >
                      {contact[0]?.title || 'No Title'}
                    </Typography>
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '13px',
                      color: 'rgba(171, 180, 207, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    Business Email:
                    <Typography
                      component="a"
                      href={`mailto:${contact[0]?.office_email || ''}`}
                      sx={{
                        color: '#4B79F7',
                        fontSize: '14px',
                        marginLeft: '3px',
                        textDecoration: 'none',
                        transition: 'color 0.3s ease',
                        '&:hover': {
                          color: '#4B79F7',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {contact[0]?.office_email || 'No Business Email'}
                    </Typography>
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: '13px',
                      color: 'rgba(171, 180, 207, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    Personal Email:
                    <Typography
                      component="a"
                      href={`mailto:${contact[0]?.personal_email || ''}`}
                      sx={{
                        color: '#4B79F7',
                        fontSize: '13px',
                        marginLeft: '3px',
                        textDecoration: 'none',
                        transition: 'color 0.3s ease',
                        '&:hover': {
                          color: '#4B79F7',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      {contact[0]?.personal_email || 'No Personal Email'}
                    </Typography>
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '13px',
                      color: 'rgba(171, 180, 207, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    Mobile Phone:
                    <Typography
                      sx={{ color: 'rgba(107, 119, 154, 1)', fontSize: '14px', marginLeft: '3px' }}
                    >
                      {contact[0]?.cell_phone1 || 'Office Phone 1'}
                    </Typography>
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '13px',
                      color: 'rgba(171, 180, 207, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    Buisness Phone 1:
                    <Typography
                      sx={{ color: 'rgba(107, 119, 154, 1)', fontSize: '14px', marginLeft: '3px' }}
                    >
                      {contact[0]?.office_phone1 || 'Office Phone 1'}
                    </Typography>
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '13px',
                      color: 'rgba(171, 180, 207, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    Buisness Phone 2:
                    <Typography
                      sx={{ color: 'rgba(107, 119, 154, 1)', fontSize: '14px', marginLeft: '3px' }}
                    >
                      {contact[0]?.office_phone2 || 'Office Phone 2'}
                    </Typography>
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '13px',
                      color: 'rgba(171, 180, 207, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    Other Phone:
                    <Typography
                      sx={{ color: 'rgba(107, 119, 154, 1)', fontSize: '14px', marginLeft: '3px' }}
                    >
                      {contact[0]?.cell_phone1 || 'Other Phone 2'}
                    </Typography>
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '13px',
                      color: 'rgba(171, 180, 207, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    Business Fax:
                    <Typography
                      sx={{ color: 'rgba(107, 119, 154, 1)', fontSize: '14px', marginLeft: '3px' }}
                    >
                      {contact[0]?.business_fax || 'Business Fax'}
                    </Typography>
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '13px',
                      color: 'rgba(171, 180, 207, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '12px',
                      flexWrap: 'wrap', // Ensures content doesn't break oddly
                    }}
                  >
                    Special Notes:&nbsp;
                    <Typography
                      component="span" // Makes this behave like an inline element
                      sx={{
                        color: 'rgba(107, 119, 154, 1)',
                        fontSize: '14px',
                        marginLeft: '3px',
                        whiteSpace: 'normal', // Ensures proper text wrapping
                      }}
                    >
                      {contact[0]?.special_notes || 'No Special Notes'}
                    </Typography>
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: '13px',
                      color: 'rgba(171, 180, 207, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    Address:
                  </Typography>
                  <Typography
                    sx={{
                      color: 'rgba(107, 119, 154, 1)',
                      fontSize: '14px',
                      marginbottom: '15px',
                      textAlign: 'left',
                    }}
                  >
                    {`${contact[0]?.location_address1}, ${contact[0]?.location_address2}, ${contact[0]?.city}, ${contact[0]?.state}, ${contact[0]?.zip}, ${contact[0]?.country}` ||
                      'Office Phone 2'}
                  </Typography>
                </Box>
              </Box>
              <Grid item xs={12} mt={4}>
                <Grid container sx={{ marginTop: '10px' }} spacing={2} justifyContent="center">
                  <Card
                    sx={{
                      padding: '15px 15px 15px 15px',
                      marginBottom: '20px',
                      marginTop: '15px',
                      minHeight: '219px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      flexDirection: 'column',
                    }}
                  >
                    {selectedFileName && (
                      <Grid item>
                        <Typography
                          sx={{
                            fontSize: '14px',
                            color: '#333',
                            marginTop: '8px',
                          }}
                        >
                          Selected File: {selectedFileName}
                          <IconButton
                            onClick={handleRemoveFile}
                            sx={{
                              marginLeft: '8px',
                              padding: 0,
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="bi bi-x-circle"
                              viewBox="0 0 16 16"
                            >
                              <path d="M16 8a8 8 0 1 0-8 8 8 8 0 0 0 8-8ZM8 1a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm4.146 5.854a.5.5 0 0 0-.708-.708L8 9.293 4.854 6.146a.5.5 0 1 0-.708.708L7.293 10l-3.146 3.146a.5.5 0 0 0 .708.708L8 10.707l3.146 3.146a.5.5 0 0 0 .708-.708L8.707 10l3.146-3.146Z" />
                            </svg>
                          </IconButton>
                        </Typography>
                      </Grid>
                    )}
                    <Grid item>
                      <Button
                        sx={{
                          fontSize: '14px',
                          fontWeight: '400',
                          borderRadius: '3px',
                          backgroundColor: !canAddNote
                            ? 'rgba(0, 0, 0, 0.26)'
                            : 'rgba(0, 166, 109, 1)',
                          paddingInline: '25px',
                          textTransform: 'none',
                          width: '100%',
                        }}
                        variant="contained"
                        component="label"
                        disabled={!canAddNote} // Disable button if user lacks access
                      >
                        Upload File
                        <input type="file" hidden onChange={handleFileChange} />
                      </Button>
                      <Typography
                        sx={{
                          color: 'rgba(24, 35, 61, 0.6)', // Light color
                          fontSize: '12px',
                          fontWeight: '300',
                          mt: '6px',
                        }}
                        variant="body2"
                        gutterBottom
                      >
                        Upload File (Supported formats: JPG, JPEG, PNG, PDF, DOC, DOCX - Max size:
                        2MB)
                      </Typography>
                    </Grid>
                    <Grid item sx={{ textAlign: 'center', marginTop: '30px' }}>
                      <Button
                        sx={{
                          fontSize: '14px',
                          fontWeight: '400',
                          borderRadius: '3px',
                          backgroundColor: !canAddNote
                            ? 'rgba(0, 0, 0, 0.26)'
                            : 'rgba(75, 121, 247, 1)',
                          paddingInline: '25px',
                          color: !canAddNote ? '#a1a1a1' : '#fff',
                          left: '4px',
                        }}
                        variant="contained"
                        color="success"
                        onClick={handleFileUpload}
                        disabled={!canAddNote}
                      >
                        Save
                      </Button>
                    </Grid>
                  </Card>
                </Grid>
              </Grid>
              <Grid item xs={12} md={12} mb={4}>
                <Card sx={{ padding: '15px 15px 15px 15px' }}>
                  <Typography
                    sx={{ fontSize: '8px', color: 'rgba(24, 35, 61, 1)', marginBottom: '15px' }}
                    variant="h6"
                    gutterBottom
                  >
                    Files
                  </Typography>
                  <TableContainer
                    component={Paper}
                    sx={{
                      maxHeight: 200,
                      overflowY: 'auto',
                      width: '100%',
                      minWidth: '250px',
                    }}
                  >
                    <Table sx={{ borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                      <TableHead>
                        <TableRow>
                          <TableCell
                            sx={{
                              backgroundColor: 'rgba(224, 237, 250, 1)',
                              color: 'rgba(24, 35, 61, 1)',
                              fontSize: '14px', // Smaller font size
                              padding: '8px', // Reduced padding
                              borderRadius: '10px 0 0 10px',
                            }}
                          >
                            Rep Name
                          </TableCell>

                          <TableCell
                            sx={{
                              backgroundColor: 'rgba(224, 237, 250, 1)',
                              color: 'rgba(24, 35, 61, 1)',
                              fontSize: '14px', // Smaller font size
                              padding: '8px', // Reduced padding
                            }}
                          >
                            Date&Time
                          </TableCell>

                          <TableCell
                            sx={{
                              backgroundColor: 'rgba(224, 237, 250, 1)',
                              color: 'rgba(24, 35, 61, 1)',
                              fontSize: '14px',
                              padding: '8px',
                            }}
                          >
                            File
                          </TableCell>
                          <TableCell
                            sx={{
                              backgroundColor: 'rgba(224, 237, 250, 1)',
                              color: 'rgba(24, 35, 61, 1)',
                              fontSize: '14px',
                              padding: '8px',
                              borderRadius: '0 10px 10px 0',
                            }}
                          >
                            Delete
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody className="Table-custom">
                        {files.map((row, index) => (
                          <TableRow
                            sx={{
                              boxShadow: '0 4px 6px rgb(171 180 207 / 22%)',
                              borderRadius: '10px',
                              minHeight: '48px',
                            }}
                            key={index}
                          >
                            <TableCell sx={{ padding: '8px', fontSize: '14px' }}>
                              {contact[0]?.client_first_name}
                            </TableCell>
                            <TableCell sx={{ padding: '8px', fontSize: '14px' }}>
                              {row.created_at
                                ? new Intl.DateTimeFormat('en-US', {
                                    year: 'numeric',
                                    month: 'numeric',
                                    day: 'numeric',
                                  }).format(new Date(row.created_at))
                                : 'N/A'}
                            </TableCell>

                            <TableCell sx={{ padding: '8px', fontSize: '14px' }}>
                              {row.file_path ? (
                                <>
                                  {console.log('File Path:', row.file_path)}{' '}
                                  {/* Log the file path */}
                                  <a
                                    style={{
                                      color: '#007BFF',
                                      fontWeight: '700',
                                      fontSize: '14px',
                                      textDecoration: 'none',
                                      cursor: 'pointer',
                                    }}
                                    href={row.file_path}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                  >
                                    Download File
                                  </a>
                                </>
                              ) : (
                                'No file attached'
                              )}
                            </TableCell>
                            {/* Delete Button */}
                            <TableCell sx={{ padding: '8px', fontSize: '14px' }}>
                              <button
                                type="button" // Explicitly set the type to "button"
                                style={{
                                  backgroundColor: '#ff4444',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '5px',
                                  padding: '8px 12px',
                                  fontSize: '14px',
                                  cursor: 'pointer',
                                }}
                                onClick={() => handleDeleteFile(row.id)}
                              >
                                Delete
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Grid>
            </Grid>
            <Grid item xs={12} md={9}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={9}>
                  <Box
                    sx={{
                      boxShadow: '0 4px 6px rgba(171, 180, 207, 0.12)',
                      paddingBottom: '10px',
                      borderRadius: '8px',
                      minHeight: '180px',
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: 'rgba(0, 166, 109, 1)',
                        padding: '8px 22px',
                        borderRadius: '10px 10px 0 0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontSize: '15px', color: 'rgba(255, 255, 255, 1)' }}
                      >
                        Contact Details
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* "Edit" Button */}
                        {canEdit ? (
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
                            onClick={() => handleActionPermissionCheck('edit')}
                          >
                            <Typography variant="body2" sx={{ fontSize: '14px', color: '#fff' }}>
                              Edit
                            </Typography>
                          </ButtonBase>
                        ) : (
                          <Typography variant="body2" sx={{ fontSize: '14px', color: '#aaa' }}>
                            Edit (Permission Denied)
                          </Typography>
                        )}

                        {/* "Add New Contact" Button */}
                        {canAddContact ? (
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
                            onClick={() => handleActionPermissionCheck('addContact')}
                          >
                            <Typography variant="body2" sx={{ fontSize: '14px', color: '#fff' }}>
                              Add New Contact
                            </Typography>
                          </ButtonBase>
                        ) : (
                          <Typography variant="body2" sx={{ fontSize: '14px', color: '#aaa' }}>
                            Add New Contact (Permission Denied)
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box sx={{ padding: '0 22px', position: 'relative', paddingTop: '12px' }}>
                      <Grid container spacing={3}>
                        {/* First Row */}
                        <Grid item xs={6}>
                          <Typography
                            variant="span"
                            sx={{
                              fontSize: '14px',
                              display: 'block',
                              color: 'rgba(171, 180, 207, 1)',
                            }}
                          >
                            Region
                          </Typography>
                          <Typography
                            variant="p"
                            sx={{ fontSize: '14px', color: 'rgba(107, 119, 154, 1)' }}
                          >
                            {contact[0]?.region || 'No Region'}
                          </Typography>
                        </Grid>

                        <Grid item xs={6}>
                          <Typography
                            variant="span"
                            sx={{
                              fontSize: '14px',
                              display: 'block',
                              color: 'rgba(171, 180, 207, 1)',
                            }}
                          >
                            Department
                          </Typography>
                          <Typography
                            variant="p"
                            sx={{ fontSize: '14px', color: 'rgba(107, 119, 154, 1)' }}
                          >
                            {contact[0]?.department || 'No Department'}
                          </Typography>
                        </Grid>

                        {/* Second Row */}
                        <Grid item xs={6}>
                          <Typography
                            variant="span"
                            sx={{
                              fontSize: '14px',
                              display: 'block',
                              color: 'rgba(171, 180, 207, 1)',
                            }}
                          >
                            Responsibilities
                          </Typography>
                          <Typography
                            variant="p"
                            sx={{ fontSize: '14px', color: 'rgba(107, 119, 154, 1)' }}
                          >
                            {contact[0]?.responsibilities || 'No Responsibilities'}
                          </Typography>
                        </Grid>

                        <Grid item xs={6}>
                          <Typography
                            variant="span"
                            sx={{
                              fontSize: '14px',
                              display: 'block',
                              color: 'rgba(171, 180, 207, 1)',
                            }}
                          >
                            Reports To
                          </Typography>
                          <Typography
                            variant="p"
                            sx={{ fontSize: '14px', color: 'rgba(107, 119, 154, 1)' }}
                          >
                            {contact[0]?.reports_to || 'No Report'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={3} md={3}>
                  <Card
                    sx={{ padding: '5px 15px 15px 15px', marginBottom: '20px', minHeight: '180px' }}
                  >
                    <Grid item xs={12}>
                      <Typography
                        sx={{ color: 'rgba(24, 35, 61, 1)', fontSize: '14px' }}
                        variant="h6"
                        gutterBottom
                      >
                        Follow up Again
                      </Typography>
                      {/* <TextField
                    sx={{ backgroundColor: '#fff', outline: 'none' }}
                    fullWidth
                    multiline
                    rows={3}
                    label="Enter Follow-up Details"
                    value={followUpDetails}
                    onChange={(e) => setFollowUpDetails(e.target.value)}
                    margin="normal"
                    disabled={!canAddNote}
                  /> */}
                      <Grid
                        container
                        sx={{ marginTop: '10px' }}
                        spacing={2}
                        justifyContent="center"
                      >
                        <Grid item>
                          <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '-10px' }}>
                            <DatePicker
                              label="Follow-Up Date"
                              value={selectedDate}
                              onChange={(newValue) => setSelectedDate(newValue)}
                              renderInput={(params) => <TextField {...params} />}
                              disabled={!canAddNote} // Disable date picker if user lacks access
                            />
                          </Box>
                        </Grid>
                        <Grid item>
                          <Button
                            sx={{
                              fontSize: '14px',
                              fontWeight: '400',
                              borderRadius: '3px',
                              backgroundColor: !canAddNote
                                ? 'rgba(0, 0, 0, 0.26)'
                                : 'rgba(75, 121, 247, 1)',
                              paddingInline: '25px',
                              color: !canAddNote ? '#a1a1a1' : '#fff',
                            }}
                            variant="contained"
                            color="success"
                            onClick={handleFollowUpDate}
                            disabled={!canAddNote}
                          >
                            Save
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Card>

                  {/* Dialog for adding the award */}
                  <Dialog open={openDialog} onClose={handleClose}>
                    <DialogTitle>Add Award</DialogTitle>
                    <DialogContent>
                      {/* Manager Name  */}
                      <TextField
                        autoFocus
                        margin="dense"
                        label="Manager Name"
                        type="text"
                        fullWidth
                        value={manager}
                        onChange={(e) => setManager(e.target.value)}
                      />
                      {/* Award Title Field */}
                      <TextField
                        margin="dense"
                        label="Award Title"
                        type="text"
                        fullWidth
                        value={awardTitle}
                        onChange={(e) => setAwardTitle(e.target.value)}
                      />
                      {/* Award Field */}
                      <TextField
                        margin="dense"
                        label="Award"
                        type="text"
                        fullWidth
                        value={award}
                        onChange={handleAwardChange}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', mt: 1, fontSize: '10px' }}
                      >
                        Maximum 255 characters
                      </Typography>
                      {/* Sales Representative Name Field */}
                      <FormControl fullWidth sx={{ marginTop: '2px' }}>
                        <InputLabel id="sales-rep-label">Sales Representative</InputLabel>
                        <Select
                          labelId="sales-rep-label"
                          value={selectedSalesRep || ''}
                          onChange={(e) => setSelectedSalesRep(e.target.value)}
                          renderValue={(selected) => selected || 'Select Sales Representative'}
                        >
                          {salesReps.map((rep) => (
                            <MenuItem key={rep.id} value={rep.name}>
                              <Checkbox checked={selectedSalesRep === rep.name} />
                              <ListItemText primary={rep.name} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {/* Amount in Dollars Field */}
                      <TextField
                        margin="dense"
                        label="Amount (Dollars)"
                        type="number"
                        fullWidth
                        value={amountDollars}
                        onChange={(e) => setAmountDollars(e.target.value)}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', mt: 1, fontSize: '10px' }}
                      >
                        Enter a valid amount in dollars
                      </Typography>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={handleClose} color="secondary">
                        Cancel
                      </Button>
                      <Button onClick={handleSave} color="primary">
                        Save
                      </Button>
                    </DialogActions>
                  </Dialog>
                </Grid>
              </Grid>
              <Grid container sx={{ position: 'relative', height: 'calc(260px + 210px)' }}>
                <Typography
                  sx={{
                    fontSize: '8px',
                    color: 'rgba(24, 35, 61, 1)',
                    marginBottom: '15px',
                    mt: 5,
                  }}
                  variant="h6"
                  gutterBottom
                >
                  Contact History
                </Typography>
                <TableContainer
                  component={Paper}
                  sx={{
                    maxHeight: 400,
                    minHeight: 400,
                    overflowY: 'auto',
                    height: '100%',
                    width: '100%',
                  }}
                >
                  <Table
                    sx={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            backgroundColor: 'rgba(224, 237, 250, 1)',
                            color: 'rgba(24, 35, 61, 1)',
                            fontSize: '14px', // Smaller font size
                            padding: '8px', // Reduced padding
                            borderRadius: '10px 0 0 10px',
                          }}
                        >
                          Rep Name
                        </TableCell>
                        {/* <TableCell
                          sx={{
                            backgroundColor: 'rgba(224, 237, 250, 1)',
                            color: 'rgba(24, 35, 61, 1)',
                            fontSize: '14px', // Smaller font size
                            padding: '8px', // Reduced padding
                          }}
                        >
                          Follow_up Date&Time
                        </TableCell> */}
                        <TableCell
                          sx={{
                            backgroundColor: 'rgba(224, 237, 250, 1)',
                            color: 'rgba(24, 35, 61, 1)',
                            fontSize: '14px', // Smaller font size
                            padding: '8px', // Reduced padding
                          }}
                        >
                          Date&Time
                        </TableCell>
                        <TableCell
                          sx={{
                            backgroundColor: 'rgba(224, 237, 250, 1)',
                            color: 'rgba(24, 35, 61, 1)',
                            fontSize: '14px', // Smaller font size
                            width: '240px',
                            padding: '8px', // Reduced padding
                          }}
                        >
                          Description
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody className="Table-custom">
                      {followUps.map((row, index) => (
                        <TableRow
                          sx={{
                            boxShadow: '0 4px 6px rgb(171 180 207 / 22%)',
                            borderRadius: '10px',
                            minHeight: '48px', // Reduced minimum height
                          }}
                          key={index}
                        >
                          <TableCell sx={{ padding: '8px', fontSize: '14px' }}>
                            {contact[0]?.client_first_name}
                          </TableCell>
                          <TableCell sx={{ padding: '8px', fontSize: '14px' }}>
                            {row.created_at
                              ? new Intl.DateTimeFormat('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                  hour12: true, // For 12-hour format
                                }).format(new Date(row.created_at))
                              : 'N/A'}
                          </TableCell>

                          {/* Description/Details */}
                          <TableCell sx={{ padding: '8px', fontSize: '14px', lineHeight: '1.2' }}>
                            {row.details && row.details.length > 50 ? (
                              <>
                                {row.details.substring(0, 50)}...
                                <Link
                                  sx={{
                                    color: 'rgba(15, 160, 241, 1)',
                                    cursor: 'pointer',
                                    marginLeft: '5px',
                                  }}
                                  onClick={() => handleDetailClick(row.details)}
                                >
                                  Read More
                                </Link>
                              </>
                            ) : (
                              row.details || 'No details provided'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Card sx={{ padding: '5px 15px 15px 15px', marginBottom: '20px', marginTop: '30px' }}>
                <Grid item xs={12}>
                  <Typography
                    sx={{ color: 'rgba(24, 35, 61, 1)', fontSize: '14px' }}
                    variant="h6"
                    gutterBottom
                  >
                    Add New Note
                  </Typography>
                  <TextField
                    sx={{ backgroundColor: '#fff', outline: 'none' }}
                    fullWidth
                    multiline
                    rows={3}
                    label="Add Note"
                    value={followUpDetails}
                    onChange={(e) => setFollowUpDetails(e.target.value)}
                    margin="normal"
                    disabled={!canAddNote}
                  />
                  <Button
                    sx={{
                      fontSize: '14px',
                      fontWeight: '400',
                      borderRadius: '3px',
                      marginLeft: 'auto',
                      display: 'block',
                      backgroundColor: !canAddNote
                        ? 'rgba(0, 0, 0, 0.26)'
                        : 'rgba(75, 121, 247, 1)',
                      paddingInline: '25px',
                      color: !canAddNote ? '#a1a1a1' : '#fff',
                    }}
                    variant="contained"
                    color="success"
                    onClick={handleSubmit}
                    disabled={!canAddNote}
                  >
                    Save
                  </Button>
                </Grid>
              </Card>
              {/* Project Sales Award History */}
              <Card sx={{ padding: '5px 15px 15px 15px' }}>
                <Typography
                  sx={{
                    fontSize: '10px',
                    color: 'rgba(24, 35, 61, 1)',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  variant="h6"
                  gutterBottom
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      component="img"
                      sx={{ marginRight: '8px', width: '30px' }}
                      src={ActivityIcon}
                      alt="Profile"
                    />
                    Projects or Sales Award History
                  </Box>
                  <Box component="img" sx={{ width: '30px' }} src={filterIcon} alt="Profile" />
                </Typography>
                <CardContent sx={{ padding: '0' }}>
                  {awards?.map((awardItem, index) => (
                    <Box
                      key={index}
                      sx={{
                        marginBottom: 2,
                        padding: '10px',
                        border: '1px solid rgba(231, 241, 253, 1)',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(245, 248, 255, 1)',
                      }}
                    >
                      {/* Admin Name */}
                      {awardItem.admin_name && (
                        <Typography
                          sx={{
                            fontSize: '12px',
                            color: 'rgba(24, 35, 61, 1)',
                            marginBottom: '4px',
                          }}
                        >
                          <strong>Manager Name:</strong> {awardItem.admin_name}
                        </Typography>
                      )}

                      {/* Award Title */}
                      {awardItem.award_title && (
                        <Typography
                          sx={{
                            fontSize: '12px',
                            color: 'rgba(24, 35, 61, 1)',
                            marginBottom: '4px',
                          }}
                        >
                          <strong>Award Title:</strong> {awardItem.award_title}
                        </Typography>
                      )}

                      {/* Award */}
                      {awardItem.award && (
                        <Typography
                          sx={{
                            fontSize: '12px',
                            color: 'rgba(24, 35, 61, 1)',
                            marginBottom: '4px',
                          }}
                        >
                          <strong>Award:</strong>
                          {awardItem.award.length > 30
                            ? `${awardItem.award.substring(0, 30)}...`
                            : awardItem.award}
                          {/* Read More Link */}
                          <Link
                            sx={{ color: 'rgba(15, 160, 241, 1)', cursor: 'pointer' }}
                            onClick={() => handleAwardClick(awardItem.award)}
                          >
                            Read More
                          </Link>
                        </Typography>
                      )}
                      {/* Sales Rep Name */}
                      {awardItem.sales_rep_name && (
                        <Typography
                          sx={{
                            fontSize: '12px',
                            color: 'rgba(24, 35, 61, 1)',
                            marginBottom: '4px',
                          }}
                        >
                          <strong>Sales Rep Name:</strong> {awardItem.sales_rep_name}
                        </Typography>
                      )}

                      {/* Amount */}
                      {awardItem.amount_dollars && (
                        <Typography sx={{ fontSize: '12px', color: 'rgba(24, 35, 61, 1)' }}>
                          <strong>Amount:</strong> ${awardItem.amount_dollars}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </CardContent>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {(role === 'Sales Manager' || role === 'Admin') && (
                    <Button
                      sx={{
                        marginLeft: '75px',
                        marginTop: '10px',
                        borderRadius: '3px',
                        padding: '17px 10px',
                      }}
                      variant="contained"
                      size="small"
                      onClick={() => handleOpen(null)}
                    >
                      Add Awards
                    </Button>
                  )}
                </div>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>{' '}
      {/* Dialog to Show Award Details */}
      <Dialog open={openViewAwardDialog} onClose={handleClose}>
        <DialogTitle>Award Details</DialogTitle>
        <DialogContent>
          <Typography variant="body1">{awardDetail}</Typography>{' '}
          {/* Display the clicked award detail */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Details</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '14px', lineHeight: '1.5' }}>{detailText}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

const Backdrop = React.forwardRef((props, ref) => {
  const { open, ...other } = props;
  return (
    <Fade in={open}>
      <div ref={ref} {...other} />
    </Fade>
  );
});

Backdrop.propTypes = {
  open: PropTypes.bool,
};

CompanyContactDetails.propTypes = {
  moduleName: PropTypes.string,
};

const blue = {
  200: '#99CCFF',
  300: '#66B2FF',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E5',
  700: '#0066CC',
};

const grey = {
  50: '#F3F6F9',
  100: '#E5EAF2',
  200: '#DAE2ED',
  300: '#C7D0DD',
  400: '#B0B8C4',
  500: '#9DA8B7',
  600: '#6B7A90',
  700: '#434D5B',
  800: '#303740',
  900: '#1C2025',
};

const Modal2 = styled(BaseModal)`
  position: fixed;
  z-index: 1300;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledBackdrop = styled(Backdrop)`
  z-index: -1;
  position: fixed;
  inset: 0;
  background-color: rgb(0 0 0 / 0.5);
  -webkit-tap-highlight-color: transparent;
`;

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
};

const ModalContent = styled('div')(
  ({ theme }) => css`
    font-family: 'IBM Plex Sans', sans-serif;
    font-weight: 500;
    text-align: start;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
    background-color: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
    border-radius: 8px;
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    box-shadow: 0 4px 12px
      ${theme.palette.mode === 'dark' ? 'rgb(0 0 0 / 0.5)' : 'rgb(0 0 0 / 0.2)'};
    padding: 24px;
    color: ${theme.palette.mode === 'dark' ? grey[50] : grey[900]};

    & .modal-title {
      margin: 0;
      line-height: 1.5rem;
      margin-bottom: 8px;
    }

    & .modal-description {
      margin: 0;
      line-height: 1.5rem;
      font-weight: 400;
      color: ${theme.palette.mode === 'dark' ? grey[400] : grey[800]};
      margin-bottom: 4px;
    }
  `
);

const TriggerButton = styled(Button)(
  ({ theme }) => css`
    font-family: 'IBM Plex Sans', sans-serif;
    font-weight: 600;
    font-size: 0.875rem;
    line-height: 1.5;
    padding: 8px 16px;
    border-radius: 8px;
    transition: all 150ms ease;
    cursor: pointer;
    background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    color: ${theme.palette.mode === 'dark' ? grey[200] : grey[900]};
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);

    &:hover {
      background: ${theme.palette.mode === 'dark' ? grey[800] : grey[50]};
      border-color: ${theme.palette.mode === 'dark' ? grey[600] : grey[300]};
    }

    &:active {
      background: ${theme.palette.mode === 'dark' ? grey[700] : grey[100]};
    }

    &:focus-visible {
      box-shadow: 0 0 0 4px ${theme.palette.mode === 'dark' ? blue[300] : blue[200]};
      outline: none;
    }
  `
);
