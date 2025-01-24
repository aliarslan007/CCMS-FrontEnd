import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
// @mui
import { Box, Typography } from '@mui/material';
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
//
import UserQuickEditForm from './user-quick-edit-form';

// ----------------------------------------------------------------------

export default function UserTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  onUserClick,
}) {
  const navigate = useNavigate();

  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const popover = usePopover();

  const handleAvatarClick = (uuid) => {
    navigate(paths.dashboard.user.accountuser(uuid));
  };
  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={() => onSelectRow(row)} />
        </TableCell>

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ cursor: 'pointer', mr: 2 }} onClick={() => handleAvatarClick(row.uuid)}>
            <Avatar alt={row.full_name} src={row.photo_url} />
          </Box>

          <ListItemText
            // primary={row.full_name}
            primary={
              <Typography
                variant="body2"
                sx={{ cursor: 'pointer', color: 'primary.main' }}
                onClick={() => onUserClick(row.uuid)}
              >
                {row.full_name}
              </Typography>
            }
            secondary={row.last_name}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
          />
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          {row.company_names && row.company_names.length > 0
            ? row.company_names.map((company, index) => (
                <span key={company.uuid}>
                  <Link
                    to={`/dashboard/user/companydetailsinfo/${company.uuid}`}
                    style={{ textDecoration: 'none', color: '#00A76F' }}
                  >
                    {company.company_name} 
                  </Link>
                  {index < row.company_names.length - 1 && ', '}
                </span>
              ))
            : ''}
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.main_phone_number}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.title}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.personal_email}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.role}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.access}</TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          {/* <Tooltip title="Quick Edit" placement="top" arrow>
            <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={quickEdit.onTrue}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip> */}
        </TableCell>
      </TableRow>

      <UserQuickEditForm currentUser={row} open={quickEdit.value} onClose={quickEdit.onFalse} />

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

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}

UserTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
  onUserClick: PropTypes.func,
};
