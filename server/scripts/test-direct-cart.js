import axios from "axios";

// Create a consistent session ID
const sessionId = `test_direct_${Date.now()}`;
console.log("Using session ID:", sessionId);

// Create an axios instance with the session ID in headers
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
    "X-Session-ID": sessionId,
  },
});

// Test the direct cart approach
async function testDirectCart() {
  try {
    // Step 1: Get an alien to add to the cart
    console.log("\nStep 1: Fetching aliens...");
    const aliensResponse = await api.get("/aliens");
    if (
      !aliensResponse.data.success ||
      !aliensResponse.data.data.aliens.length
    ) {
      console.error("No aliens found");
      return;
    }

    const alien = aliensResponse.data.data.aliens[0];
    console.log(`Found alien: ${alien.name} (${alien._id})`);

    // Step 2: Get initial cart (should be empty)
    console.log("\nStep 2: Getting initial cart...");
    const initialCartResponse = await api.get("/cart");
    console.log(
      "Initial cart:",
      JSON.stringify(initialCartResponse.data, null, 2)
    );

    // Step 3: Add alien to cart
    console.log("\nStep 3: Adding alien to cart...");
    const addResponse = await api.post("/cart/add", {
      alienId: alien._id,
      quantity: 1,
    });
    console.log("Add response:", JSON.stringify(addResponse.data, null, 2));

    // Step 4: Get cart again to verify item was added
    console.log("\nStep 4: Getting cart after adding item...");
    const updatedCartResponse = await api.get("/cart");
    console.log(
      "Updated cart:",
      JSON.stringify(updatedCartResponse.data, null, 2)
    );

    // Step 5: Add another item or update quantity
    console.log("\nStep 5: Updating item quantity...");
    const updateResponse = await api.put(`/cart/update/${alien._id}`, {
      quantity: 2,
    });
    console.log(
      "Update response:",
      JSON.stringify(updateResponse.data, null, 2)
    );

    // Step 6: Get cart again to verify quantity was updated
    console.log("\nStep 6: Getting cart after updating quantity...");
    const finalCartResponse = await api.get("/cart");
    console.log("Final cart:", JSON.stringify(finalCartResponse.data, null, 2));

    // Check if the cart ID is consistent across requests
    const cartIds = [
      initialCartResponse.data.data?.cart?.id,
      addResponse.data.data?.cart?.id,
      updatedCartResponse.data.data?.cart?.id,
      updateResponse.data.data?.cart?.id,
      finalCartResponse.data.data?.cart?.id,
    ].filter(Boolean);

    console.log("\nCart IDs across requests:", cartIds);

    if (new Set(cartIds).size === 1) {
      console.log("SUCCESS: Cart ID is consistent across all requests!");
    } else {
      console.log("WARNING: Cart ID is not consistent across requests.");
    }
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
  }
}

// Run the test
testDirectCart();
