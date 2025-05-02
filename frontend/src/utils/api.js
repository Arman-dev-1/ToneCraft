import { toast } from 'react-toastify';

/**
 * API base URL
 * Uses environment variable if available, otherwise defaults to localhost
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Make a request to the API with error handling
 * 
 * @param {string} endpoint - API endpoint to call (without base URL)
 * @param {Object} options - Fetch options
 * @param {boolean} showErrorToast - Whether to show error toast on failure
 * @returns {Promise<Object>} - Response data
 */
export const apiRequest = async (endpoint, options = {}, showErrorToast = true) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      const errorMessage = data.message || `Error: ${response.status} ${response.statusText}`;
      
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      
      throw new Error(errorMessage);
    }
    
    return data;
  } catch (error) {
    if (showErrorToast) {
      toast.error(error.message || 'An unexpected error occurred');
    }
    throw error;
  }
};

/**
 * Adjust text tone using the API
 * 
 * @param {string} text - The text to adjust
 * @param {number} toneLevel - The desired tone level (1-10)
 * @param {string} verbosityLevel - The desired verbosity ('concise', 'normal', 'detailed')
 * @returns {Promise<Object>} - Response with adjusted text
 */
export const adjustTone = async (text, toneLevel, verbosityLevel = 'normal') => {
  return apiRequest('/api/tone', {
    method: 'POST',
    body: JSON.stringify({ text, toneLevel, verbosityLevel }),
  });
};

/**
 * Get API health status
 * 
 * @returns {Promise<Object>} - Health status object
 */
export const getApiHealth = async () => {
  return apiRequest('/api/health');
};

/**
 * Get sample data from API
 * 
 * @returns {Promise<Object>} - Sample data
 */
export const getSampleData = async () => {
  return apiRequest('/api/data');
}; 