import axios from 'axios';

const baseURL = process.env.API_URL || 'http://localhost:3333';
const apiKey = process.env.API_KEY

const ApiClient = () => {
  const defaultOptions = {
    baseURL,
  };

  const instance = axios.create(defaultOptions);

  instance.defaults.headers.common['X-API-KEY'] = apiKey;

  return instance;
};

export default ApiClient();
