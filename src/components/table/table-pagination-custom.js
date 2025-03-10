import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TablePagination from '@mui/material/TablePagination';

// ----------------------------------------------------------------------

export default function TablePaginationCustom({
  dense,
  onChangeDense,
  rowsPerPageOptions = [5, 25, 50, 100, 150, 250, 300, 350, 400, 450, 500, 1000],
  sx,
  ...other
}) {
  return (
    <Box sx={{ position: 'relative', ...sx }}>
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        {...other}
        sx={{
          borderTopColor: 'transparent',
        }}
      />

      {onChangeDense && (
        <FormControlLabel
          label="Dense"
          control={<Switch checked={dense} onChange={onChangeDense} />}
          sx={{
            pl: 2,
            py: 1.5,
            top: 0,
            position: {
              sm: 'absolute',
            },
          }}
        />
      )}
    </Box>
  );
}

TablePaginationCustom.propTypes = {
  dense: PropTypes.bool,
  onChangeDense: PropTypes.func,
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
  sx: PropTypes.object,
};
