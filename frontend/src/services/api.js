import axios from "axios";

/**
 * Central Axios instance for the SKUDynamic backend.
 * Automatically injects the default procurement bearer key for seamless
 * authenticated order approvals and reorder requests.
 */
const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer sk-procurement-dev-key",
  },
});

export default api;
