import { createContext, useContext, useState ,useMemo} from 'react';
import PropTypes from 'prop-types';

// ----------------------------------------------------------------------

export const AuthContext = createContext({});
export const AuthProvider = ({ children }) => {
    const [userRole, setUserRole] = useState(() => sessionStorage.getItem('userRole') || null);

    const logout = () => {
        try {
          sessionStorage.removeItem('userRole');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('userAccess');
          sessionStorage.removeItem('userid');
          localStorage.removeItem('user');
          setUserRole(null); 
        } catch (error) {
          console.error('Error during logout:', error);
          throw error;
        }
      };
    const value = useMemo(() => ({ userRole, setUserRole,logout }), [userRole]);  
    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    );
  };
  AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };

  export const useAuth = () => useContext(AuthContext);