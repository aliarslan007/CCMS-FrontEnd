import React from 'react';
import { Navigate,useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../context/jwt/auth-context';
import { rolePermissions } from './rolePermissions';


  const ProtectedRoute = ({ children, allowedRoles }) => {
    const { userRole } = useAuth();

    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/not-authorized" replace />;
    }
  
    return children; // Allow access if the role is valid
  };
  
  // PropTypes validation
  ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  };
  
  export default ProtectedRoute;
