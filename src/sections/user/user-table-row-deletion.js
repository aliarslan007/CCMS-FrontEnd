import PropTypes from 'prop-types';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function CompanyTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  profile_id,
}) {
  const {
    profile_uuid,
    profile_type,
    created_at,
    name,
    last_name,
    title,
    company_name,
    marked_by_user_id,
    marked_by_uuid,
    reason,
  } = row;

  const navigate = useNavigate();
  const confirm = useBoolean();
  const popover = usePopover();

  // State for "See More" Modal
  const [openModal, setOpenModal] = useState(false);

  const handleCompanyClick = (id, type) => {
    let path = '';

    if (type === 'App\\Models\\CompanyAccount') {
      path = `/dashboard/user/companydetailsinfo/${id}`;
    } else if (type === 'App\\Models\\CompanyContact') {
      path = `/dashboard/user/companycontactdetails/${id}`;
    } else {
      path = `/dashboard/user/accountuser/${id}`;
    }

    navigate(path);
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>
        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            color: 'primary.main',
          }}
          onClick={() => handleCompanyClick(marked_by_uuid, 'App\\Models\\Profile')}
        >
          {marked_by_user_id}
        </TableCell>
        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            color: 'primary.main',
          }}
          onClick={() => handleCompanyClick(profile_uuid, profile_type)}
        >
          {company_name}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{`${name} ${last_name}`}</TableCell>

        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
          onClick={() => setOpenModal(true)}
        >
          {reason ? (
            <>
              <Iconify icon="eva:eye-fill" sx={{ color: 'primary.main', width: 20, height: 20 }} />
            </>
          ) : (
            'N/A'
          )}
        </TableCell>

        <TableCell>{new Date(created_at).toLocaleString()}</TableCell>
      </TableRow>

      {/* SEE MORE MODAL */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reason Details</DialogTitle>
        <DialogContent>
          <Typography variant="body1">{reason}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} color="primary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Custom Popover Actions */}
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
  profile_id: PropTypes.object,
  selected: PropTypes.bool,
};
