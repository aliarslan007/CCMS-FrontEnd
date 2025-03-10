import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';

// ----------------------------------------------------------------------

const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
};

// ----------------------------------------------------------------------

export default function TableHeadCustom({
  order,
  orderBy,
  rowCount = 0,
  headLabel,
  numSelected = 0,
  onSort,
  onSelectAllRows,
  sx,
}) {
  return (
    <TableHead sx={sx}>
      <TableRow>
        {onSelectAllRows && (
          <TableCell padding="checkbox">
            <Checkbox
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
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ width: headCell.width, minWidth: headCell.minWidth }}
          >
            {onSort ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={() => {
                  const isAsc = orderBy === headCell.id && order === 'asc';
                  onSort(headCell.id, isAsc ? 'desc' : 'asc'); 
                }}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box sx={{ ...visuallyHidden }}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

TableHeadCustom.propTypes = {
  sx: PropTypes.object,
  onSort: PropTypes.func,
  orderBy: PropTypes.string,
  headLabel: PropTypes.array,
  rowCount: PropTypes.number,
  numSelected: PropTypes.number,
  onSelectAllRows: PropTypes.func,
  order: PropTypes.oneOf(['asc', 'desc']),
};
