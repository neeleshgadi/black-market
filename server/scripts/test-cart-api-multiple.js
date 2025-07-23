import axios from "axios";

// Create a session ID
const sessionId = `test_${Date.now()}_${Math.random()
  .toString(36)
  .substr(2, 9)}`;
console.log("Using session ID:", sessionId);

// Base URL for API
const baseURL = "http://localhost:5000/api";

// Test adding an item to the cart
async function testCartOperations() {
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

    // Step 1: Get the cart (should be empty)
    console.log("\nStep 1: Fetching initial cart...");
    const initialCartResponse = await axios.get(`${baseURL}/cart`, {
      headers: {
        "X-Session-ID": sessionId,
      },
    });

    console.log(
      "Initial cart response:",
      JSON.stringify(initialCartResponse.data, null, 2)
    );

    // Step 2: Add the alien to the cart
    console.log("\nStep 2: Adding alien to cart...");
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

    // Step 3: Get the cart again (should have the item)
    console.log("\nStep 3: Fetching cart after adding item...");
    const updatedCartResponse = await axios.get(`${baseURL}/cart`, {
      headers: {
        "X-Session-ID": sessionId,
      },
    });

    console.log(
      "Updated cart response:",
      JSON.stringify(updatedCartResponse.data, null, 2)
    );

    // Step 4: Update the quantity
    console.log("\nStep 4: Updating item quantity...");
    const updateResponse = await axios.put(
      `${baseURL}/cart/update/${alien._id}`,
      { quantity: 2 },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Session-ID": sessionId,
        },
      }
    );

    console.log(
      "Update quantity response:",
      JSON.stringify(updateResponse.data, null, 2)
    );

    // Step 5: Get the cart again (should have updated quantity)
    console.log("\nStep 5: Fetching cart after updating quantity...");
    const finalCartResponse = await axios.get(`${baseURL}/cart`, {
      headers: {
        "X-Session-ID": sessionId,
      },
    });

    console.log(
      "Final cart response:",
      JSON.stringify(finalCartResponse.data, null, 2)
    );
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
  }
}

// Run the test
testCartOperations();
