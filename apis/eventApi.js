import mydb from '../database/mydb';
import apiClient from './apiClient';
import { log, logError } from '../utils/logger';

export const fetchEventAndUsersData = async (eventId, token) => {
  const eventEndpoint = `https://435-tdp-284.mktorest.com/rest/asset/v1/program/${eventId}.json`;
  const usersEndpoint = `https://435-tdp-284.mktorest.com/rest/v1/leads/programs/${eventId}.json`;

  try {
    const [eventResponse, usersResponse] = await Promise.all([
      apiClient.get(eventEndpoint, { params: { access_token: token } }),
      apiClient.get(usersEndpoint, { params: { access_token: token, fields: 'FirstName,LastName,Email,Company,PostalCode,Phone,Country,Unsubscribed' } })
    ]);

    const eventData = eventResponse.data.result[0];
    const usersData = usersResponse.data.result;
    
    log('Event Data:', JSON.stringify(eventData));
    log('User Data:', JSON.stringify(usersData));

    await mydb.saveEventAndUser(eventData, usersData, eventId);

    const event = {
      id: eventData.id ?? '',
      name: eventData.name ?? '',
      description: eventData.description ?? '',
      createdAt: eventData.createdAt ?? '',
      updatedAt: eventData.updatedAt ?? '',
      url: eventData.url ?? '',
      type: eventData.type ?? '',
      channel: eventData.channel ?? '',
      workspace: eventData.workspace ?? '',
      startDate: eventData.startDate ?? '',
      endDate: eventData.endDate ?? '',
      users: usersData.map(user => ({
        id: user.id ?? '',
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        email: user.email ?? '',
        company: user.company ?? '',
        phone: user.phone ?? '',
        createdAt: user.createdAt ?? '',
        updatedAt: user.updatedAt ?? '',
        membership: {
          acquiredBy: user.membership?.acquiredBy ?? false,
          id: user.membership?.id ?? '',
          isExhausted: user.membership?.isExhausted ?? false,
          membershipDate: user.membership?.membershipDate ?? '',
          progressionStatus: user.membership?.progressionStatus ?? '',
          progressionStatusType: user.membership?.progressionStatusType ?? '',
          reachedSuccess: user.membership?.reachedSuccess ?? false,
          updatedAt: user.membership?.updatedAt ?? ''
        }
      }))
    };

    return event;
  } catch (error) {
    logError('Failed to fetch event and users data:', error);
    throw error;
  }
};
