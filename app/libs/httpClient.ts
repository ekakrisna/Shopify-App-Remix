import axios, { AxiosInstance } from 'axios';

interface HttpClient extends AxiosInstance { }

const httpClient: HttpClient = axios.create({
  baseURL: `https://hub-on-api--hub-on-gardeneur.sandboxes.run/api/v1`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional interceptors for request and response handling
httpClient.interceptors.request.use(
  (config) => {
    // Modify the request config here (e.g., add authentication headers)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

httpClient.interceptors.response.use(
  (response) => {
    // Modify the response data or perform error handling here
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default httpClient;