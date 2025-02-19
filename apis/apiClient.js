import axios from 'axios';
import { log, logError } from '../utils/logger';

function axiosToCurl(request) {
  let command = `curl -X ${request.method.toUpperCase()}`;
  for (const [key, value] of Object.entries(request.headers)) {
    command += ` -H "${key}: ${value}"`;
  }
  if (request.data) {
    command += ` -d '${JSON.stringify(request.data)}'`;
  }
  command += ` "${request.url}"`;

  return command;
}

const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(request => {
  const curlCommand = axiosToCurl(request);
  log('Request as cURL:', curlCommand);
  return request;
});

apiClient.interceptors.response.use(
  response => {
    log('Response JSON:', JSON.stringify(response.data, null, 2));
    return response;
  },
  error => {
    if (error.response) {
      logError('Error Response JSON:', JSON.stringify(error.response.data, null, 2));
    } else {
      logError('Error:', error.message);
    }
    throw error;
  }
);

export default apiClient;
