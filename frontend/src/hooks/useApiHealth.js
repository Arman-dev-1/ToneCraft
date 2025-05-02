import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getApiHealth } from '../utils/api';

/**
 * Custom hook to check API health and connectivity
 * 
 * @param {boolean} showToasts - Whether to display toast notifications for API status
 * @returns {Object} - API health status
 */
export const useApiHealth = (showToasts = true) => {
  const [status, setStatus] = useState({
    isConnected: false,
    isLoading: true,
    error: null,
    lastChecked: null
  });

  const checkHealth = async () => {
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const healthData = await getApiHealth();
      
      setStatus({
        isConnected: true,
        isLoading: false,
        error: null,
        lastChecked: new Date(),
        healthData
      });
      
      if (showToasts) {
        toast.success('Connected to API server', { autoClose: 2000 });
      }
      
      return true;
    } catch (error) {
      setStatus({
        isConnected: false,
        isLoading: false,
        error: error.message || 'Failed to connect to API server',
        lastChecked: new Date()
      });
      
      if (showToasts) {
        toast.error(
          'Failed to connect to API server. Tone adjustment features will not be available.',
          { autoClose: false }
        );
      }
      
      return false;
    }
  };

  useEffect(() => {
    // Check health on mount
    checkHealth();
    
    // Set up interval to periodically check health (every 5 minutes)
    const intervalId = setInterval(() => {
      checkHealth();
    }, 5 * 60 * 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  return {
    ...status,
    checkHealth
  };
};

export default useApiHealth; 