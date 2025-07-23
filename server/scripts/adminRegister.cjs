// Register a new admin user and print JWT token
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const ADMIN_USER = {
  email: 'admin@blackmarket.com',
  password: 'admin123',
  firstName: 'Admin',
  lastName: 'User'
};

async function main() {
  try {
    const res = await axios.post(`${BASE_URL}/auth/register`, ADMIN_USER);
    if (res.data && res.data.data && res.data.data.token) {
      console.log('ADMIN_JWT:', res.data.data.token);
    } else {
      console.error('No token in register response:', res.data);
    }
  } catch (err) {
    if (err.response && err.response.data && err.response.data.error && err.response.data.error.code === 'USER_EXISTS') {
      console.log('Admin user already exists. Try logging in instead.');
    } else {
      console.error('Admin registration failed:', err.message);
      if (err.response) {
        console.error('Response:', JSON.stringify(err.response.data, null, 2));
      }
    }
    process.exit(1);
  }
}

main();
