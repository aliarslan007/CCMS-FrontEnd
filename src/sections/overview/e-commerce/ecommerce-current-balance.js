import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
// utils
import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export default function EcommerceCurrentBalance({
  title,
  sentAmount,
  currentBalance,
  sx,
  ...other
}) {
  const totalAmount = currentBalance - sentAmount;

}

EcommerceCurrentBalance.propTypes = {
  currentBalance: PropTypes.number,
  sentAmount: PropTypes.number,
  sx: PropTypes.object,
  title: PropTypes.string,
};
