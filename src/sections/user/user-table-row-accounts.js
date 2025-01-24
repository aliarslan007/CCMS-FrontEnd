import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
// @mui
import { Box ,Typography} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import Iconify from 'src/components/iconify';
import { paths } from '../../routes/paths'; // Ensure you have routes set up for company

// ----------------------------------------------------------------------

export default function CompanyTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow,onCompanyClick }) {
  const navigate = useNavigate();
  const {
    company_name,
    company_type,
    avatarUrl,
    address1,
    phone_number,
    website,
    service,
    photo_url
  } = row;

  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const popover = usePopover();

  const handleCompanyClick = (uuid) => {
    navigate(paths.dashboard.user.companydetailsinfo(uuid)); 
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={() => onSelectRow(row)} />
        </TableCell>
        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ cursor: 'pointer', mr: 2 }} onClick={() => handleCompanyClick(row.uuid)}>
            <Avatar alt={company_name} src={photo_url} />
          </Box>

          <ListItemText
             primary={
              <Typography
                variant="body2"
                sx={{ cursor: 'pointer', color: 'primary.main' }}
                onClick={() => onCompanyClick(row.uuid)}
              >
                {company_name}
              </Typography>
            }
            secondary={`${website}`}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
          />
        </TableCell>
        
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{phone_number}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{company_type}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{service}</TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{address1}</TableCell>

        <TableCell
          align="right"
          sx={{
            px: 1,
            whiteSpace: 'nowrap',
            position: 'relative', 
            left: '-10px', 
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
  onCompanyClick: PropTypes.func, 
};
