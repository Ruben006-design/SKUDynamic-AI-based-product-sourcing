import axios from "axios";

/**
 * Central Axios instance for the SKUDynamic backend.
 * Every service should import this instead of creating
 * its own axios instance.
 *
 * Timeout is set to 2 minutes to accommodate batch AI operations
 * (weightage generation and reordering engine runs).
 */
const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
