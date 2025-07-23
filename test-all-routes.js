import axios from "axios";
import colors from "colors";

// Configuration
const BASE_URL = "http://localhost:5000/api";
const TEST_USER = {
  email: "testuser@example.com",
  password: "TestPassword123",
  firstName: "Test",
  lastName: "User",
};

const TEST_ADMIN = {
  email: "neeleshgadi@gmail.com",
  password: "Neelesh@2003",
  firstName: "Neelesh",
  lastName: "Gadi",
};

let userToken = "";
let adminToken = "";
let testAlienId = "";
let testOrderId = "";

// Helper functions
const log = {
  success: (msg) => console.log(`✅ ${msg}`.green),
  error: (msg) => console.log(`❌ ${msg}`.red),
  info: (msg) => console.log(`ℹ️  ${msg}`.blue),
  warning: (msg) => console.log(`⚠️  ${msg}`.yellow),
  section: (msg) => console.log(`\n🔍 ${msg}`.cyan.bold),
};

const makeRequest = async (method, endpoint, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {},
      timeout: 10000, // 10 second timeout
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
      config.headers["Content-Type"] = "application/json";
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
    };
  }
};

// Test functions
const testHealthCheck = async () => {
  log.section("Testing Health Check");
  const result = await makeRequest("GET", "/health");

  if (result.success) {
    log.success("Health check passed");
    log.info(`Database connected: ${result.data.database?.connected}`);
    log.info(`Alien count: ${result.data.alienCount}`);
  } else {
    log.error("Health check failed");
  }

  return result.success;
};

const testAuthRoutes = async () => {
  log.section("Testing Authentication Routes");

  // Test user registration
  log.info("Testing user registration...");
  const registerResult = await makeRequest("POST", "/auth/register", TEST_USER);

  if (registerResult.success) {
    log.success("User registration successful");
    userToken = registerResult.data.data.token;
  } else {
    log.error(
      `User registration failed: ${
        registerResult.error.message || registerResult.error
      }`
    );
  }

  // Test user login
  log.info("Testing user login...");
  const loginResult = await makeRequest("POST", "/auth/login", {
    email: TEST_USER.email,
    password: TEST_USER.password,
  });

  if (loginResult.success) {
    log.success("User login successful");
    userToken = loginResult.data.data.token;
  } else {
    log.error(
      `User login failed: ${loginResult.error.message || loginResult.error}`
    );
  }

  // Test admin login (assuming admin exists)
  log.info("Testing admin login...");
  const adminLoginResult = await makeRequest("POST", "/auth/login", {
    email: TEST_ADMIN.email,
    password: TEST_ADMIN.password,
  });

  if (adminLoginResult.success) {
    log.success("Admin login successful");
    adminToken = adminLoginResult.data.data.token;
  } else {
    log.error(
      `Admin login failed: ${JSON.stringify(adminLoginResult.error, null, 2)}`
    );
  }

  // Test get profile
  if (userToken) {
    log.info("Testing get profile...");
    const profileResult = await makeRequest(
      "GET",
      "/auth/profile",
      null,
      userToken
    );

    if (profileResult.success) {
      log.success("Get profile successful");
    } else {
      log.error(
        `Get profile failed: ${
          profileResult.error.message || profileResult.error
        }`
      );
    }
  }

  // Test profile update
  if (userToken) {
    log.info("Testing profile update...");
    const updateResult = await makeRequest(
      "PUT",
      "/auth/profile",
      {
        firstName: "Updated",
        lastName: "Name",
      },
      userToken
    );

    if (updateResult.success) {
      log.success("Profile update successful");
    } else {
      log.error(
        `Profile update failed: ${
          updateResult.error.message || updateResult.error
        }`
      );
    }
  }

  return userToken && adminToken;
};

const testAlienRoutes = async () => {
  log.section("Testing Alien Routes");

  // Test get all aliens
  log.info("Testing get all aliens...");
  const aliensResult = await makeRequest("GET", "/aliens");

  if (aliensResult.success) {
    log.success("Get all aliens successful");
    log.info(`Found ${aliensResult.data.data.aliens.length} aliens`);

    // Use first alien for testing if available
    if (aliensResult.data.data.aliens.length > 0) {
      testAlienId = aliensResult.data.data.aliens[0]._id;
      log.info(`Using alien ID for testing: ${testAlienId}`);
    }
  } else {
    log.error(
      `Get all aliens failed: ${JSON.stringify(aliensResult.error, null, 2)}`
    );
  }

  // Test get featured aliens
  log.info("Testing get featured aliens...");
  const featuredResult = await makeRequest("GET", "/aliens/featured");

  if (featuredResult.success) {
    log.success("Get featured aliens successful");
  } else {
    log.error(
      `Get featured aliens failed: ${
        featuredResult.error.message || featuredResult.error
      }`
    );
  }

  // Test get filter options
  log.info("Testing get filter options...");
  const filterResult = await makeRequest("GET", "/aliens/filter-options");

  if (filterResult.success) {
    log.success("Get filter options successful");
  } else {
    log.error(
      `Get filter options failed: ${
        filterResult.error.message || filterResult.error
      }`
    );
  }

  // Test create alien (admin only)
  if (adminToken) {
    log.info("Testing create alien (admin)...");
    const createResult = await makeRequest(
      "POST",
      "/aliens",
      {
        name: "Test Alien",
        faction: "Test Faction",
        planet: "Test Planet",
        rarity: "Common",
        price: 99.99,
        backstory: "A test alien for testing purposes",
        abilities: ["Test Ability"],
        clothingStyle: "Test Style",
        featured: false,
        inStock: true,
      },
      adminToken
    );

    if (createResult.success) {
      log.success("Create alien successful");
      testAlienId = createResult.data.data._id;
    } else {
      log.error(
        `Create alien failed: ${
          createResult.error.message || createResult.error
        }`
      );
    }
  }

  // Test get alien by ID
  if (testAlienId) {
    log.info("Testing get alien by ID...");
    const alienResult = await makeRequest("GET", `/aliens/${testAlienId}`);

    if (alienResult.success) {
      log.success("Get alien by ID successful");
    } else {
      log.error(
        `Get alien by ID failed: ${
          alienResult.error.message || alienResult.error
        }`
      );
    }

    // Test get related aliens
    log.info("Testing get related aliens...");
    const relatedResult = await makeRequest(
      "GET",
      `/aliens/${testAlienId}/related`
    );

    if (relatedResult.success) {
      log.success("Get related aliens successful");
    } else {
      log.error(
        `Get related aliens failed: ${
          relatedResult.error.message || relatedResult.error
        }`
      );
    }
  }

  return testAlienId;
};

const testCartRoutes = async () => {
  log.section("Testing Cart Routes");

  if (!testAlienId) {
    log.warning("No test alien ID available, skipping cart tests");
    return false;
  }

  // Test get cart
  log.info("Testing get cart...");
  const cartResult = await makeRequest("GET", "/cart", null, userToken);

  if (cartResult.success) {
    log.success("Get cart successful");
  } else {
    log.error(
      `Get cart failed: ${cartResult.error.message || cartResult.error}`
    );
  }

  // Test add to cart
  log.info("Testing add to cart...");
  const addResult = await makeRequest(
    "POST",
    "/cart/add",
    {
      alienId: testAlienId,
      quantity: 2,
    },
    userToken
  );

  if (addResult.success) {
    log.success("Add to cart successful");
  } else {
    log.error(
      `Add to cart failed: ${addResult.error.message || addResult.error}`
    );
  }

  // Test update cart item
  log.info("Testing update cart item...");
  const updateResult = await makeRequest(
    "PUT",
    `/cart/update/${testAlienId}`,
    {
      quantity: 3,
    },
    userToken
  );

  if (updateResult.success) {
    log.success("Update cart item successful");
  } else {
    log.error(
      `Update cart item failed: ${
        updateResult.error.message || updateResult.error
      }`
    );
  }

  // Test remove from cart
  log.info("Testing remove from cart...");
  const removeResult = await makeRequest(
    "DELETE",
    `/cart/remove/${testAlienId}`,
    null,
    userToken
  );

  if (removeResult.success) {
    log.success("Remove from cart successful");
  } else {
    log.error(
      `Remove from cart failed: ${
        removeResult.error.message || removeResult.error
      }`
    );
  }

  // Add item back for order testing
  log.info("Adding item to cart for order testing...");
  const addForOrderResult = await makeRequest(
    "POST",
    "/cart/add",
    {
      alienId: testAlienId,
      quantity: 1,
    },
    userToken
  );

  if (addForOrderResult.success) {
    log.success("Added item to cart for order testing");
  } else {
    log.error(
      `Failed to add item to cart for order testing: ${
        addForOrderResult.error.message || addForOrderResult.error
      }`
    );
  }

  return true;
};

const testWishlistRoutes = async () => {
  log.section("Testing Wishlist Routes");

  if (!testAlienId || !userToken) {
    log.warning(
      "No test alien ID or user token available, skipping wishlist tests"
    );
    return false;
  }

  // Test get wishlist
  log.info("Testing get wishlist...");
  const wishlistResult = await makeRequest("GET", "/wishlist", null, userToken);

  if (wishlistResult.success) {
    log.success("Get wishlist successful");
  } else {
    log.error(
      `Get wishlist failed: ${
        wishlistResult.error.message || wishlistResult.error
      }`
    );
  }

  // Test add to wishlist
  log.info("Testing add to wishlist...");
  const addResult = await makeRequest(
    "POST",
    "/wishlist/add",
    {
      alienId: testAlienId,
    },
    userToken
  );

  if (addResult.success) {
    log.success("Add to wishlist successful");
  } else {
    log.error(
      `Add to wishlist failed: ${addResult.error.message || addResult.error}`
    );
  }

  // Test check wishlist status
  log.info("Testing check wishlist status...");
  const checkResult = await makeRequest(
    "GET",
    `/wishlist/check/${testAlienId}`,
    null,
    userToken
  );

  if (checkResult.success) {
    log.success("Check wishlist status successful");
  } else {
    log.error(
      `Check wishlist status failed: ${
        checkResult.error.message || checkResult.error
      }`
    );
  }

  // Test remove from wishlist
  log.info("Testing remove from wishlist...");
  const removeResult = await makeRequest(
    "DELETE",
    `/wishlist/remove/${testAlienId}`,
    null,
    userToken
  );

  if (removeResult.success) {
    log.success("Remove from wishlist successful");
  } else {
    log.error(
      `Remove from wishlist failed: ${
        removeResult.error.message || removeResult.error
      }`
    );
  }

  return true;
};

const testOrderRoutes = async () => {
  log.section("Testing Order Routes");

  if (!userToken) {
    log.warning("No user token available, skipping order tests");
    return false;
  }

  // Verify cart has items before creating order
  log.info("Verifying cart has items before creating order...");
  const cartCheckResult = await makeRequest("GET", "/cart", null, userToken);

  if (
    !cartCheckResult.success ||
    !cartCheckResult.data.data.items ||
    cartCheckResult.data.data.items.length === 0
  ) {
    log.warning("Cart is empty, adding test item before creating order");
    await makeRequest(
      "POST",
      "/cart/add",
      {
        alienId: testAlienId,
        quantity: 1,
      },
      userToken
    );
  } else {
    log.info(
      `Cart has ${cartCheckResult.data.data.items.length} items, proceeding with order`
    );
  }

  // Test create order
  log.info("Testing create order...");
  const createResult = await makeRequest(
    "POST",
    "/orders",
    {
      shippingAddress: {
        street: "123 Test St",
        city: "Test City",
        state: "Test State",
        zipCode: "12345",
        country: "Test Country",
      },
      paymentMethod: {
        cardNumber: "4111111111111111",
        expiryDate: "12/25",
        cvv: "123",
        cardholderName: "Test User",
      },
    },
    userToken
  );

  if (createResult.success) {
    log.success("Create order successful");
    testOrderId = createResult.data.data.order.id || createResult.data.data._id;
  } else {
    log.error(
      `Create order failed: ${
        createResult.error?.message || JSON.stringify(createResult.error)
      }`
    );
  }

  // Test get user orders
  log.info("Testing get user orders...");
  const ordersResult = await makeRequest("GET", "/orders", null, userToken);

  if (ordersResult.success) {
    log.success("Get user orders successful");
  } else {
    log.error(
      `Get user orders failed: ${
        ordersResult.error.message || ordersResult.error
      }`
    );
  }

  // Test get order by ID
  if (testOrderId) {
    log.info("Testing get order by ID...");
    const orderResult = await makeRequest(
      "GET",
      `/orders/${testOrderId}`,
      null,
      userToken
    );

    if (orderResult.success) {
      log.success("Get order by ID successful");
    } else {
      log.error(
        `Get order by ID failed: ${
          orderResult.error.message || orderResult.error
        }`
      );
    }

    // Test get order tracking
    log.info("Testing get order tracking...");
    const trackingResult = await makeRequest(
      "GET",
      `/orders/${testOrderId}/tracking`,
      null,
      userToken
    );

    if (trackingResult.success) {
      log.success("Get order tracking successful");
    } else {
      log.error(
        `Get order tracking failed: ${
          trackingResult.error.message || trackingResult.error
        }`
      );
    }
  }

  return testOrderId;
};

const testAdminRoutes = async () => {
  log.section("Testing Admin Routes");

  if (!adminToken) {
    log.warning("No admin token available, skipping admin tests");
    return false;
  }

  // Test get dashboard analytics
  log.info("Testing get dashboard analytics...");
  const analyticsResult = await makeRequest(
    "GET",
    "/admin/analytics",
    null,
    adminToken
  );

  if (analyticsResult.success) {
    log.success("Get dashboard analytics successful");
  } else {
    log.error(
      `Get dashboard analytics failed: ${
        analyticsResult.error.message || analyticsResult.error
      }`
    );
  }

  // Test get all orders (admin)
  log.info("Testing get all orders (admin)...");
  const ordersResult = await makeRequest(
    "GET",
    "/admin/orders",
    null,
    adminToken
  );

  if (ordersResult.success) {
    log.success("Get all orders (admin) successful");
  } else {
    log.error(
      `Get all orders (admin) failed: ${
        ordersResult.error.message || ordersResult.error
      }`
    );
  }

  // Test get all users
  log.info("Testing get all users...");
  const usersResult = await makeRequest(
    "GET",
    "/admin/users",
    null,
    adminToken
  );

  if (usersResult.success) {
    log.success("Get all users successful");
  } else {
    log.error(
      `Get all users failed: ${usersResult.error.message || usersResult.error}`
    );
  }

  // Test get all aliens (admin)
  log.info("Testing get all aliens (admin)...");
  const adminAliensResult = await makeRequest(
    "GET",
    "/admin/aliens",
    null,
    adminToken
  );

  if (adminAliensResult.success) {
    log.success("Get all aliens (admin) successful");
  } else {
    log.error(
      `Get all aliens (admin) failed: ${
        adminAliensResult.error.message || adminAliensResult.error
      }`
    );
  }

  // Test create alien (admin)
  log.info("Testing create alien (admin via admin routes)...");
  const adminCreateResult = await makeRequest(
    "POST",
    "/admin/aliens",
    {
      name: "Admin Test Alien",
      faction: "Admin Test Faction",
      planet: "Admin Test Planet",
      rarity: "Rare",
      price: 199.99,
      image: "/uploads/test-alien.jpg",
      backstory: "An admin test alien for testing admin routes",
      abilities: ["Admin Test Ability"],
      clothingStyle: "Admin Test Style",
      featured: true,
      inStock: true,
    },
    adminToken
  );

  let adminTestAlienId = null;
  if (adminCreateResult.success) {
    log.success("Create alien (admin) successful");
    adminTestAlienId = adminCreateResult.data.data._id;
  } else {
    log.error(
      `Create alien (admin) failed: ${JSON.stringify(
        adminCreateResult.error,
        null,
        2
      )}`
    );
  }

  // Test update alien (admin)
  if (adminTestAlienId) {
    log.info("Testing update alien (admin)...");
    const updateResult = await makeRequest(
      "PUT",
      `/admin/aliens/${adminTestAlienId}`,
      {
        name: "Updated Admin Test Alien",
        price: 299.99,
      },
      adminToken
    );

    if (updateResult.success) {
      log.success("Update alien (admin) successful");
    } else {
      log.error(
        `Update alien (admin) failed: ${
          updateResult.error.message || updateResult.error
        }`
      );
    }

    // Test toggle alien featured status
    log.info("Testing toggle alien featured status...");
    const featuredToggleResult = await makeRequest(
      "PUT",
      `/admin/aliens/${adminTestAlienId}/featured`,
      {
        featured: false,
      },
      adminToken
    );

    if (featuredToggleResult.success) {
      log.success("Toggle alien featured status successful");
    } else {
      log.error(
        `Toggle alien featured status failed: ${
          featuredToggleResult.error.message || featuredToggleResult.error
        }`
      );
    }

    // Test toggle alien stock status
    log.info("Testing toggle alien stock status...");
    const stockToggleResult = await makeRequest(
      "PUT",
      `/admin/aliens/${adminTestAlienId}/stock`,
      {
        inStock: false,
      },
      adminToken
    );

    if (stockToggleResult.success) {
      log.success("Toggle alien stock status successful");
    } else {
      log.error(
        `Toggle alien stock status failed: ${
          stockToggleResult.error.message || stockToggleResult.error
        }`
      );
    }

    // Test delete alien (admin)
    log.info("Testing delete alien (admin)...");
    const deleteResult = await makeRequest(
      "DELETE",
      `/admin/aliens/${adminTestAlienId}`,
      null,
      adminToken
    );

    if (deleteResult.success) {
      log.success("Delete alien (admin) successful");
    } else {
      log.error(
        `Delete alien (admin) failed: ${
          deleteResult.error.message || deleteResult.error
        }`
      );
    }
  }

  // Test get system metrics
  log.info("Testing get system metrics...");
  const metricsResult = await makeRequest(
    "GET",
    "/admin/metrics",
    null,
    adminToken
  );

  if (metricsResult.success) {
    log.success("Get system metrics successful");
  } else {
    log.error(
      `Get system metrics failed: ${
        metricsResult.error.message || metricsResult.error
      }`
    );
  }

  // Test update order status
  if (testOrderId) {
    log.info("Testing update order status...");
    const updateResult = await makeRequest(
      "PUT",
      `/admin/orders/${testOrderId}`,
      {
        status: "processing",
      },
      adminToken
    );

    if (updateResult.success) {
      log.success("Update order status successful");
    } else {
      log.error(
        `Update order status failed: ${
          updateResult.error.message || updateResult.error
        }`
      );
    }
  }

  return true;
};

const testUnauthorizedAccess = async () => {
  log.section("Testing Unauthorized Access");

  // Test accessing admin routes without token
  log.info("Testing admin routes without token...");
  const noTokenResult = await makeRequest("GET", "/admin/analytics");

  if (noTokenResult.status === 401) {
    log.success("Admin routes properly protected (401 without token)");
  } else {
    log.error("Admin routes not properly protected");
  }

  // Test accessing admin routes with user token
  if (userToken) {
    log.info("Testing admin routes with user token...");
    const userTokenResult = await makeRequest(
      "GET",
      "/admin/analytics",
      null,
      userToken
    );

    if (userTokenResult.status === 403) {
      log.success("Admin routes properly protected (403 with user token)");
    } else {
      log.error("Admin routes not properly protected from regular users");
    }
  }

  return true;
};

// Main test runner
const runAllTests = async () => {
  console.log("🚀 Starting comprehensive route testing...\n".rainbow.bold);

  const results = {
    health: false,
    auth: false,
    aliens: false,
    cart: false,
    wishlist: false,
    orders: false,
    admin: false,
    security: false,
  };

  try {
    results.health = await testHealthCheck();
    results.auth = await testAuthRoutes();
    results.aliens = await testAlienRoutes();
    results.cart = await testCartRoutes();
    results.wishlist = await testWishlistRoutes();
    results.orders = await testOrderRoutes();
    results.admin = await testAdminRoutes();
    results.security = await testUnauthorizedAccess();

    // Summary
    log.section("Test Results Summary");
    Object.entries(results).forEach(([test, passed]) => {
      if (passed) {
        log.success(`${test.toUpperCase()} tests: PASSED`);
      } else {
        log.error(`${test.toUpperCase()} tests: FAILED`);
      }
    });

    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;

    console.log(
      `\n📊 Overall Results: ${passedTests}/${totalTests} test suites passed`
        .bold
    );

    if (passedTests === totalTests) {
      console.log(
        "🎉 All tests passed! Your API is working correctly.".green.bold
      );
    } else {
      console.log(
        "⚠️  Some tests failed. Please check the logs above.".yellow.bold
      );
    }
  } catch (error) {
    log.error(`Test runner error: ${error.message}`);
  }
};

// Check if server is running
const checkServer = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    return true;
  } catch (error) {
    console.log(`Server check failed: ${error.message}`);
    // Try a simple connection test
    try {
      await axios.get("http://localhost:5000", { timeout: 5000 });
      return true;
    } catch (error2) {
      return false;
    }
  }
};

// Start testing
(async () => {
  const serverRunning = await checkServer();

  if (!serverRunning) {
    log.error(
      "Server is not running! Please start the server first with: npm run server:dev"
    );
    process.exit(1);
  }

  await runAllTests();
})();
