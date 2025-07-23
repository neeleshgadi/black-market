import axios from "axios";

// --- CONFIG ---
const BASE_URL = "http://localhost:5000/api";
const TEST_USER = {
  email: "admin@example.com",
  password: "Admin123456",
};

async function main() {
  // 0. Health check to verify server and logs
  const healthRes = await axios.get(`${BASE_URL}/health`).catch(e => e.response || e);
  console.log('HEALTH_CHECK:', JSON.stringify(healthRes.data || healthRes, null, 2));
  // 1. Create guest session and add item to guest cart
  const sessionId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  console.log("Using guest session ID:", sessionId);

  // 2. Fetch an alien to add
  const aliensRes = await axios.get(`${BASE_URL}/aliens`);
  if (!aliensRes.data.success || !aliensRes.data.data.aliens.length) {
    throw new Error("No aliens found");
  }
  const alien = aliensRes.data.data.aliens[0];
  console.log(`Adding alien to guest cart: ${alien.name} (${alien._id})`);

  // 3. Add alien to guest cart
  await axios.post(
    `${BASE_URL}/cart/add`,
    { alienId: alien._id, quantity: 1 },
    { headers: { "X-Session-ID": sessionId, "Content-Type": "application/json" } }
  );

  // 4. Verify item is in guest cart
  const guestCart = await axios.get(`${BASE_URL}/cart`, { headers: { "X-Session-ID": sessionId } });
  if (!guestCart.data.data.cart.items.length) throw new Error("Guest cart is empty after add!");
  console.log("Guest cart after add:", JSON.stringify(guestCart.data.data.cart));

  // 5. Login as user, get JWT
  const loginRes = await axios.post(`${BASE_URL}/auth/login`, TEST_USER);
  const token = loginRes.data.data.token;
  if (!token) throw new Error("Login failed: No token returned");
  console.log("Logged in, got JWT token.");

  // 6. Merge guest cart into user cart
  const mergeRes = await axios.post(
    `${BASE_URL}/cart/merge`,
    { sessionId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!mergeRes.data.success) throw new Error("Cart merge failed: " + JSON.stringify(mergeRes.data));
  console.log("Cart merge result:", JSON.stringify(mergeRes.data));

  // 7. Fetch user cart and verify item is present (NO session header, ONLY JWT)
  const userCartRes = await axios.get(`${BASE_URL}/cart`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log("User cart fetch response:", JSON.stringify(userCartRes.data, null, 2));
  console.log("User cart fetch headers:", JSON.stringify(userCartRes.headers, null, 2));
  if (!userCartRes.data.data.cart.items.length) throw new Error("User cart is empty after merge!");
  console.log("User cart after merge:", JSON.stringify(userCartRes.data.data.cart));

  // 8. Attempt to create order
  const orderRes = await axios.post(
    `${BASE_URL}/orders`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!orderRes.data.success) throw new Error("Order creation failed: " + JSON.stringify(orderRes.data));
  console.log("Order creation result:", JSON.stringify(orderRes.data));

  console.log("\n✅ Automated cart merge and checkout flow succeeded!");
}

main().catch((err) => {
  console.error("\n❌ TEST FAILED:", err.message);
  if (err.response) {
    console.error("Response:", JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
});
