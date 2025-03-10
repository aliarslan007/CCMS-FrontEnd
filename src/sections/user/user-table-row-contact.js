import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
// @mui
import { Box } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import Iconify from 'src/components/iconify';
import { paths } from '../../routes/paths';

// ----------------------------------------------------------------------

export default function CompanyTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow }) {
  const navigate = useNavigate();
  const {
    title,
    client_first_name,
    client_last_name,
    personal_email,
    cell_phone1,
    photo_url,
    company_name,
    follow_up_date,
    office_phone1,
    details,
  } = row;

  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const popover = usePopover();
  const handleCompanyClick = (uuid, contactData) => {
    navigate(paths.dashboard.user.companycontactdetails(uuid), { state: { contact: contactData } });
  };
  const role = localStorage.getItem('userRole');

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          {role === 'Admin' ? (
            <Checkbox checked={selected} onClick={() => onSelectRow(row)} />
          ) : (
            <div style={{ width: '24px', height: '24px' }} />
          )}
        </TableCell>

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ cursor: 'pointer', mr: 2 }} onClick={() => handleCompanyClick(row.uuid, row)}>
            <Avatar alt={company_name} src={photo_url} />
          </Box>

          <ListItemText
            primary={company_name}
            secondary=""
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
          />
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{title}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Box
            sx={{
              cursor: 'pointer',
              mr: 2,
              color: 'primary.main',
            }}
            onClick={() => handleCompanyClick(row.uuid, row)}
          >
            {client_first_name}
          </Box>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{client_last_name}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{personal_email}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {localStorage.getItem('userRole') === 'Admin' ? cell_phone1 : details}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {localStorage.getItem('userRole') === 'Admin' ? office_phone1 : follow_up_date}
        </TableCell>

        <TableCell
          align="right"
          sx={{
            px: 1,
            whiteSpace: 'nowrap',
            position: 'relative',
            left: '-50px',
          }}
        >
          {/* <Tooltip title="Quick Edit" placement="top" arrow>
            <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={quickEdit.onTrue}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip> */}
        </TableCell>
      </TableRow>

      {/* Quick Edit Form for the company */}
      {/* <UserQuickEditForm currentUser={row} open={quickEdit.value} onClose={quickEdit.onFalse} /> */}

      {/* Custom Popover for actions */}
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>

        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>
      </CustomPopover>

      {/* Confirm Dialog for delete action */}
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure you want to delete this company?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}

CompanyTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
