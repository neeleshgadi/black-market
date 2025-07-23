import axios from "axios";

// Create a session ID
const sessionId = `test_${Date.now()}_${Math.random()
  .toString(36)
  .substr(2, 9)}`;
console.log("Using session ID:", sessionId);

// Base URL for API
const baseURL = "http://localhost:5000/api";

// Test adding an item to the cart
async function testAddToCart() {
  try {
    // First, get an alien ID
    console.log("Fetching aliens...");
    const aliensResponse = await axios.get(`${baseURL}/aliens`);
    if (
      !aliensResponse.data.success ||
      !aliensResponse.data.data.aliens.length
    ) {
      console.error("No aliens found");
      return;
    }

    const alien = aliensResponse.data.data.aliens[0];
    console.log(`Found alien: ${alien.name} (${alien._id})`);

    // Add the alien to the cart
    console.log("Adding alien to cart...");
    const addResponse = await axios.post(
      `${baseURL}/cart/add`,
      { alienId: alien._id, quantity: 1 },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Session-ID": sessionId,
        },
      }
    );

    console.log(
      "Add to cart response:",
      JSON.stringify(addResponse.data, null, 2)
    );

    // Get the cart
    console.log("Fetching cart...");
    const cartResponse = await axios.get(`${baseURL}/cart`, {
      headers: {
        "X-Session-ID": sessionId,
      },
    });

    console.log("Cart response:", JSON.stringify(cartResponse.data, null, 2));
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
  }
}

// Run the test
testAddToCart();
