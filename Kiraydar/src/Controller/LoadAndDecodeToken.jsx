// LoadAndDecodeToken.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';
/**
 * Function to decode a JWT token.
 * @param {string} token - The JWT token to decode.
 * @returns {object|null} Decoded JWT token object or null if decoding fails.
 */
export const decodeToken = token => {
  console.log(token);
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};
/**
 * Function to load and decode a JWT token.
 * @param {string} tokenKey - The key to retrieve the token from storage (e.g., AsyncStorage).
 * @returns {object|null} Decoded JWT token object or null if loading/decoding fails.
 */
const loadAndDecodeToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token'); // Use tokenKey parameter instead of 'token'
    if (token) {
      return decodeToken(token);
    } else {
      console.error('Token not found in storage.');
      return null;
    }
  } catch (error) {
    console.error('Error loading/decoding token:', error);
    return null;
  }
};

export default loadAndDecodeToken;
