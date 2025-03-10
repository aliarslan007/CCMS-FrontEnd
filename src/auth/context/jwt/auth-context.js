import PropTypes from 'prop-types';
import { createContext, useContext, useMemo, useState } from 'react';

// ----------------------------------------------------------------------

export const AuthContext = createContext({});
export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || null);

  const logout = () => {
    try {
      localStorage.removeItem('userRole');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userAccess');
      localStorage.removeItem('userid');
      localStorage.removeItem('user');
      setUserRole(null);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };
  const value = useMemo(() => ({ userRole, setUserRole, logout }), [userRole]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
