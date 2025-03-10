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
}) {
  const {
    profile_type,
    rep_id,
    representative_name,
    identification,
    record_name,
    company_name,
    created_at,
  } = row;

  const navigate = useNavigate();
  const confirm = useBoolean();
  const popover = usePopover();

  const handleRecordClick = (uuid, type) => {
    let path = '';

    if (type === 'App\\Models\\CompanyAccount') {
      path = `/dashboard/user/accountuser/${uuid}`;
    } else if (type === 'App\\Models\\CompanyContact') {
      path = `/dashboard/user/accountuser/${uuid}`;
    } else if (type === 'App\\Models\\Profile') {
      path = `/dashboard/user/accountuser/${uuid}`;
    } else if (type === 'App\\Models\\Inactive-Profile') {
      path = `/dashboard/user/accountuser/${uuid}?get_inactive=true`;
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
          onClick={() => handleRecordClick(rep_id, profile_type)}
        >
          {representative_name}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{record_name}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{company_name}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{identification}</TableCell>
        <TableCell>{new Date(created_at).toLocaleString()}</TableCell>
      </TableRow>

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
