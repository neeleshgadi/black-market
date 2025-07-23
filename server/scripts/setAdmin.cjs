// Set isAdmin true for user
const mongoose = require('mongoose');
const User = require('../models/User.js').default || require('../models/User.js');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/black_market';
const EMAIL = 'neeleshgadi@gmail.com';

async function main() {
  await mongoose.connect(MONGO_URI);
  const user = await User.findOneAndUpdate({ email: EMAIL }, { $set: { isAdmin: true } }, { new: true });
  if (user) {
    console.log('User updated:', user.email, 'isAdmin:', user.isAdmin);
  } else {
    console.error('User not found:', EMAIL);
  }
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
