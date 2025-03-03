// src/context/NotificationContext.js
import React, { createContext, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const contextValue = useMemo(
    () => ({ notifications, setNotifications }),
    [notifications]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
