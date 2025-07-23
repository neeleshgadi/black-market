// Script to log in as admin and print JWT token
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
const ADMIN_USER = {
  email: 'admin@blackmarket.com', // <-- update if your admin email is different
  password: 'admin123'           // <-- update if your admin password is different
};

async function main() {
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, ADMIN_USER);
    if (res.data && res.data.data && res.data.data.token) {
      console.log('ADMIN_JWT:', res.data.data.token);
    } else {
      console.error('No token in login response:', res.data);
    }
  } catch (err) {
    console.error('Admin login failed:', err.message);
    if (err.response) {
      console.error('Response:', JSON.stringify(err.response.data, null, 2));
    }
    process.exit(1);
  }
}

main();
