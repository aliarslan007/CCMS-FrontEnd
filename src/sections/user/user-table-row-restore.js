import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
// @mui
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
  const { profile_type, id, representative_name, identification, record_name, created_at } = row;

  const processedProfileType = profile_type?.replace('App\\Models\\', '');

  const navigate = useNavigate();
  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const popover = usePopover();

  const handleRecordClick = () => {
    let path = '';

    // Determine the correct path based on profile_type
    if (profile_type === 'App\\Models\\CompanyAccount') {
      path = `/dashboard/user/companydetailsinfo/${profile_id}`;
    } else if (profile_type === 'App\\Models\\CompanyContact') {
      path = `/dashboard/user/companycontactdetails/${profile_id}`;
    } else if (profile_type === 'App\\Models\\Profile') {
      path = `/dashboard/user/accountuser/${profile_id}`;
    }

    // Navigate to the determined path
    navigate(path);
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>{id}</TableCell> */}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{representative_name}</TableCell>
        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            // cursor: 'pointer',
            // color: 'primary.main', 
          }}
          // onClick={() => handleRecordClick(profile_id, profile_type)}
        >
          {record_name}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{identification}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{processedProfileType}</TableCell>
        {/* <TableCell>{new Date(created_at).toLocaleString()}</TableCell> */}
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
  profile_id: PropTypes.object,
  selected: PropTypes.bool,
};
