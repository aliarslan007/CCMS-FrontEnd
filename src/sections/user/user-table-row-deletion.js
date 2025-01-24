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
import { paths } from '../../routes/paths';

// ----------------------------------------------------------------------

export default function CompanyTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  type,
  profile_id
}) {
  const { profile_type, id, created_at, name, last_name, title, company_name, sale_rep_name } = row;

  const navigate = useNavigate();
  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const popover = usePopover();

  const handleCompanyClick = () => {
    const path =
      profile_type === 'App\\Models\\CompanyAccount'
        ? `/dashboard/user/companydetailsinfo/${profile_id}`
        : `/dashboard/user/companycontactdetails/${profile_id}`;

    navigate(path);
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        {/* <TableCell sx={{ whiteSpace: 'nowrap' }}>{id}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{processedProfileType}</TableCell> */}
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{sale_rep_name}</TableCell>
        <TableCell
          sx={{
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            color: 'primary.main', 
          }}
          onClick={() => handleCompanyClick(profile_id)}
        >
          {company_name}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{`${name} ${last_name}`}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{title}</TableCell>
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
  type: PropTypes.object,
  profile_id: PropTypes.object,
  selected: PropTypes.bool,
};
