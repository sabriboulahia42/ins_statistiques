import axios from 'axios';

/**
 * Android emulator localhost alias: 10.0.2.2
 * iOS simulator localhost: localhost
 * Change this IP to your machine's local IP (e.g. 192.168.1.x) if testing on a physical device.
 */
const BASE_URL = 'http://10.0.2.2:4000/api';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export const fetchDatasets = async () => {
  try {
    const response = await client.get('/datasets');
    return response.data;
  } catch (error) {
    console.error('Error fetching datasets:', error.message);
    throw error;
  }
};
