export const API_CONFIG = {
  PRODUCTION: 'https://svekla.aksukant.kz/api',

  BASE_URL: 'http://localhost:8000/api',

  TIMEOUT: 30000,

  RETRY_ATTEMPTS: 3,
};

export const getApiUrl = () => {
  return API_CONFIG.PRODUCTION;
};

export const switchApiUrl = (isProduction: boolean = false) => {
  return isProduction ? API_CONFIG.PRODUCTION : API_CONFIG.PRODUCTION;
};
