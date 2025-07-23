// CommonJS version: Print all carts with user/session info and items
const mongoose = require('mongoose');
const Cart = require('../models/Cart.js').default || require('../models/Cart.js');
const User = require('../models/User.js').default || require('../models/User.js');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/black_market';

async function main() {
  await mongoose.connect(MONGO_URI);
  const carts = await Cart.find({}).lean();
  const users = await User.find({}).lean();
  const userMap = Object.fromEntries(users.map(u => [String(u._id), u.email]));
  console.log('--- All Carts ---');
  for (const cart of carts) {
    console.log('----------------------');
    console.log('Cart ID:', cart._id);
    if (cart.user) {
      console.log('User:', cart.user, userMap[cart.user] || '(unknown)');
    }
    if (cart.sessionId) {
      console.log('SessionID:', cart.sessionId);
    }
    console.log('Items:', cart.items.map(i => ({ alien: i.alien, qty: i.quantity })));
    console.log('Total Items:', cart.items.reduce((a, b) => a + b.quantity, 0));
    console.log('UpdatedAt:', cart.updatedAt);
  }
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
