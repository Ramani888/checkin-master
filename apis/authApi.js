import apiClient from './apiClient';
import { log, logError } from '../utils/logger';

export const getToken = async (endPointUrl, clientId, clientSecret) => {
  const params = {
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  };

  try {
    log('Sending request to fetch token...');
    const response = await apiClient.get(`${endPointUrl}/identity/oauth/token`, { params });
    log('Token fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    logError('Failed to fetch token:', error);
    throw error;
  }
};
