import apiClient from '../apis/apiClient';
import { log, logError } from '../utils/logger';
import strings from '../utils/strings';

export const changeUserStatus = async (leadId, eventId, statusName, token) => {
  const endpoint = `${strings.API_BASE_URL}/programs/${eventId}/members/status.json?access_token=${token}`;
  log('Change User Status Endpoint:', endpoint);
  log('Payload:', { statusName, leadId });

  const payload = {
    statusName,
    input: [{ leadId }]
  };

  try {
    const response = await apiClient.post(endpoint, payload);
    log('Change User Status Response:', response.data);
    return response.data.success;
  } catch (error) {
    logError('Failed to update event status:', error);
    return false;
  }
};
