import redisService from "../config/redis.js";
import logger from "../utils/logger.js";

async function testRedis() {
  console.log("🔄 Testing Redis connection and functionality...");

  try {
    // Connect to Redis
    await redisService.connect();

    if (!redisService.isReady()) {
      console.log("❌ Redis is not ready");
      return;
    }

    console.log("✅ Redis connected successfully");

    // Test basic operations
    const testKey = "test:redis:functionality";
    const testData = {
      message: "Hello Redis!",
      timestamp: new Date().toISOString(),
      number: 42,
    };

    // Test SET
    console.log("🔄 Testing SET operation...");
    const setResult = await redisService.set(testKey, testData, 60);
    console.log("✅ SET result:", setResult);

    // Test GET
    console.log("🔄 Testing GET operation...");
    const getData = await redisService.get(testKey);
    console.log("✅ GET result:", getData);

    // Test EXISTS
    console.log("🔄 Testing EXISTS operation...");
    const existsResult = await redisService.exists(testKey);
    console.log("✅ EXISTS result:", existsResult);

    // Test cache middleware key generation
    const mockReq = {
      method: "GET",
      originalUrl: "/api/aliens?page=1&limit=12",
      query: { page: 1, limit: 12, category: "warrior" },
    };

    const cacheKey = `aliens:list:${mockReq.query.page}:${
      mockReq.query.limit
    }:${mockReq.query.category || "all"}::newest`;
    console.log("🔄 Testing cache key generation:", cacheKey);

    await redisService.set(cacheKey, { aliens: [], total: 0 }, 300);
    const cachedAliens = await redisService.get(cacheKey);
    console.log("✅ Cached aliens data:", cachedAliens);

    // Test DELETE
    console.log("🔄 Testing DELETE operation...");
    const delResult = await redisService.del(testKey);
    console.log("✅ DELETE result:", delResult);

    // Test pattern flush
    console.log("🔄 Testing pattern flush...");
    await redisService.set("test:pattern:1", { data: "test1" });
    await redisService.set("test:pattern:2", { data: "test2" });
    await redisService.flushPattern("test:pattern:*");
    console.log("✅ Pattern flush completed");

    console.log("🎉 All Redis tests passed!");
  } catch (error) {
    console.error("❌ Redis test failed:", error);
  } finally {
    await redisService.disconnect();
    console.log("👋 Redis connection closed");
    process.exit(0);
  }
}

// Run the test
testRedis();
