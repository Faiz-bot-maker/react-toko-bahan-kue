// API Configuration
export const API_CONFIG = {
  // BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  LOGIN_ENDPOINT: process.env.REACT_APP_LOGIN_ENDPOINT + '/auth/login',
  TIMEOUT: 10000,
};

// API Headers
export const getHeaders = (token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// API Response Handler
export const handleApiResponse = (response) => {
  if (response.data.success) {
    return { success: true, data: response.data };
  } else {
    return { success: false, message: response.data.message || 'Request failed' };
  }
};

// API Error Handler
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server responded with error status
    return { 
      success: false, 
      message: error.response.data.data.message || 'Server error occurred' 
    };
  } else if (error.request) {
    // Network error
    return { 
      success: false, 
      message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.' 
    };
  } else {
    // Other error
    return { 
      success: false, 
      message: 'Terjadi kesalahan. Silakan coba lagi.' 
    };
  }
};

// Debug: Log environment variables
// console.log('API Configuration:', {
//   BASE_URL: process.env.REACT_APP_API_URL,
//   LOGIN_ENDPOINT: process.env.REACT_APP_LOGIN_ENDPOINT,
//   FULL_LOGIN_URL: `${process.env.REACT_APP_API_URL || 'http://localhost:3000/api'}${process.env.REACT_APP_LOGIN_ENDPOINT || '/auth/login'}`
// }); 