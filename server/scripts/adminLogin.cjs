// CommonJS version: log in as admin and print JWT token
process.env.JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const ADMIN_USER = {
  email: 'admin@example.com',
  password: 'Admin123456'
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
