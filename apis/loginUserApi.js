import { Alert } from "react-native";
import apiClient from "./apiClient";
import { log, logError } from '../utils/logger';

const apiUrl = 'https://api.jsonbin.io/v3/b/668d3ed4e41b4d34e40f63ae/latest';
const apiUrlPut = 'https://api.jsonbin.io/v3/b/668d3ed4e41b4d34e40f63ae';
const masterKey = '$2a$10$EWi6HEInaymhw8RkSR10iul2OkjKPKT73E9zCKa55MGkqryaifnnK';
const accessKey = '$2a$10$iYP/yDg5Rif.IaEQxWitF.CvN9vc9miGkyOnDoRJuXq5HNdXXtrC.';

export async function authenticateUser(email, password) {
  try {
    const response = await apiClient.get(apiUrl, {
      headers: {
        'X-Master-Key': masterKey,
        'X-Access-Key': accessKey,
        'X-Bin-Meta': 'false'
      }
    });

    if (response.status < 200 || response.status >= 300) {
      return false;
    }

    log("Data:", response.data);
    const user = response.data[email];
    if (user && user.password === password) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    logError('There was a problem with the fetch operation:', error);
    return false;
  }
}

export async function registerUser(email, password, name) {
  try {
    const response = await apiClient.get(apiUrl, {
      headers: {
        'X-Master-Key': masterKey,
        'X-Access-Key': accessKey,
        'X-Bin-Meta': 'false'
      }
    });

    if (response.status < 200 || response.status >= 300) {
      return false;
    }

    const data = response.data;
    if (data[email]) {
      Alert.alert('Error', 'Email ID is already used.');
      return false;
    }
    data[email] = { password, name };

    const updateResponse = await apiClient.put(apiUrlPut, data, {
      headers: {
        'X-Master-Key': masterKey,
        'Content-Type': 'application/json'
      }
    });

    return updateResponse.status === 200;
  } catch (error) {
    logError('There was a problem with the registration operation:', error);
    return false;
  }
}
