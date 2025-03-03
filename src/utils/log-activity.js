// src/utils/logActivity.js
import axiosInstance, { endpoints } from 'src/utils/axios'; 

export const logActivity = async (activity,moduleName, extraData = {}) => {
    try {
      const token = sessionStorage.getItem('authToken');
      const payload = {
        activity,
        url: moduleName,
        ...extraData,
      };
        
      await axiosInstance.post(
        endpoints.activity.user,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  };
  
