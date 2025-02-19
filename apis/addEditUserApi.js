import apiClient from './apiClient';
import strings from '../utils/strings';
import { log, logError} from '../utils/logger';


export const createOrUpdateUser = async (user, token, partitionName) => {
  const endpoint = `${strings.API_BASE_URL}/leads.json?access_token=${token}`;
  const payload = {
    action: "createOrUpdate",
    partitionName,
    lookupField: "email",
    input: [{
      firstName: user.firstName,
      lastName: user.lastName,
      title: user.title,
      company: user.company,
      email: user.email,
      phone: user.phone,
      unsubscribed: user.unsubscribed === 1
    }]
  };

  log(`User Data: ${JSON.stringify(user)}, Token: ${token}, Partition: ${partitionName}`);

  try {
    const response = await apiClient.post(endpoint, payload);
    return response.data;
  } catch (error) {
    logError('Failed to create or update user:', error);
    throw error;
  }
};
