import axios from "axios";

// Create an axios instance with credentials
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Test adding an item to the cart with cookies
async function testCartWithCookies() {
  try {
    // First, get an alien ID
    console.log("Fetching aliens...");
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

    // Step 1: Get the cart (should be empty or create a new one)
    console.log("\nStep 1: Fetching initial cart...");
    const initialCartResponse = await api.get("/cart");

    console.log(
      "Initial cart response:",
      JSON.stringify(initialCartResponse.data, null, 2)
    );
    console.log("Cookies received:", initialCartResponse.headers["set-cookie"]);

    // Step 2: Add the alien to the cart
    console.log("\nStep 2: Adding alien to cart...");
    const addResponse = await api.post("/cart/add", {
      alienId: alien._id,
      quantity: 1,
    });

    console.log(
      "Add to cart response:",
      JSON.stringify(addResponse.data, null, 2)
    );

    // Step 3: Get the cart again (should have the item)
    console.log("\nStep 3: Fetching cart after adding item...");
    const updatedCartResponse = await api.get("/cart");

    console.log(
      "Updated cart response:",
      JSON.stringify(updatedCartResponse.data, null, 2)
    );
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
  }
}

// Run the test
testCartWithCookies();
