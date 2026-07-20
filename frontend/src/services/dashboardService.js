
import api from "./api";

/**
 * Dashboard API calls.
 * Each function maps to one or more backend endpoints.
 */

export async function getProducts() {
  const response = await api.get("/products");
  return response.data;
}

export async function getSuppliers() {
  const response = await api.get("/suppliers");
  return response.data;
}

export async function getInventories() {
  const response = await api.get("/inventories");
  return response.data;
}

export async function getOrderAnalytics() {
  const response = await api.get("/order-list/analytics");
  return response.data;
}
export async function getOrders() {
  const response = await api.get("/order-list");
  return response.data;
}
export async function getRetailers() {
  const response = await api.get("/retailers");
  return response.data;
}

export async function getWeightConfigs() {
  const response = await api.get("/weight-configs");
  return response.data;
}
export async function generateRecommendation(productId, data) {
  const response = await api.post(
    `/reordering-engine/generate/${productId}`,
    data
  );
  return response.data;
}

export async function generateBatchRecommendations(data) {
  const response = await api.post(
    "/reordering-engine/generate/batch",
    data
  );
  return response.data;
}