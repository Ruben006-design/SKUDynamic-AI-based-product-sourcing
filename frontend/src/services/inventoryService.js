import api from "./api";

export async function getInventories() {
  const response = await api.get("/inventories");
  return response.data;
}

export async function getInventory(id) {
  const response = await api.get(`/inventories/${id}`);
  return response.data;
}

export async function createInventory(data) {
  const response = await api.post("/inventories", data);
  return response.data;
}

export async function updateInventory(id, data) {
  const response = await api.put(
    `/inventories/${id}`,
    data
  );

  return response.data;
}

export async function deleteInventory(id) {
  const response = await api.delete(
    `/inventories/${id}`
  );

  return response.data;
}

export async function getInventoryByProduct(
  productId
) {
  const response = await api.get(
    `/inventories/product/${productId}`
  );

  return response.data;
}