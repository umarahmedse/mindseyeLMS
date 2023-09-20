import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

// Get the Redis URL from environment variables
let redisURL = process.env.REDIS_URL;

if (!redisURL) {
  console.error("REDIS_URL is not defined in the environment variables");
  redisURL = "redis://localhost:6379";
  // Handle the absence of REDIS_URL gracefully, e.g., by falling back to a default value or exiting the application.
  // Example: REDIS_URL = "redis://localhost:6379" (default Redis URL)
  // You can replace it with your default Redis URL or handle it as needed.
  // process.exit(1); // Optionally, exit the application if REDIS_URL is not defined.
}

// Create the Redis client instance
const redis = new Redis(redisURL);

// Event listener for successful connection
redis.on("connect", () => {
  console.log("Connected to Redis");
});

// Optionally, you can add an event listener for connection errors
redis.on("error", (error) => {
  console.error("Redis connection error:", error);
  // Handle the error gracefully, e.g., by retrying the connection or logging it.
});

export default redis;
