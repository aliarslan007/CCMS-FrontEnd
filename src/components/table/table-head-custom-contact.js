import PropTypes from 'prop-types';
// @mui
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

// ----------------------------------------------------------------------

export default function TableHeadSimple({
  rowCount = 0,
  headLabel,
  numSelected = 0,
  onSelectAllRows,
  sx,
}) {
  return (
    <TableHead sx={sx}>
      <TableRow>
        {onSelectAllRows && (
          <TableCell padding="checkbox">
            <Checkbox
              style={{ opacity: 0, pointerEvents: 'none' }} // Make it transparent and disable interactions
              indeterminate={!!numSelected && numSelected < rowCount}
              checked={!!rowCount && numSelected === rowCount}
              onChange={(event) => onSelectAllRows(event.target.checked)}
            />
          </TableCell>
        )}

        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || 'left'}
            sx={{ width: headCell.width, minWidth: headCell.minWidth }}
          >
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

TableHeadSimple.propTypes = {
  sx: PropTypes.object,
  headLabel: PropTypes.array.isRequired,
  rowCount: PropTypes.number,
  numSelected: PropTypes.number,
  onSelectAllRows: PropTypes.func,
};
