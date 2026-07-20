import axios from "axios";

/**
 * Central Axios instance for the SKUDynamic backend.
 * Every service should import this instead of creating
 * its own axios instance.
 */
const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;