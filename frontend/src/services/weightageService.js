import api from "./api";

export async function getWeightages() {
  const response = await api.get("/weightages");
  return response.data;
}

export async function getWeightage(id) {
  const response = await api.get(`/weightages/${id}`);
  return response.data;
}

export async function createWeightage(data) {
  const response = await api.post("/weightages", data);
  return response.data;
}

export async function updateWeightage(id, data) {
  const response = await api.put(
    `/weightages/${id}`,
    data
  );

  return response.data;
}

export async function deleteWeightage(id) {
  const response = await api.delete(
    `/weightages/${id}`
  );

  return response.data;
}

export async function getLatestWeightage(productId) {
  const response = await api.get(
    `/weightages/product/${productId}`
  );

  return response.data;
}

export async function getWeightageHistory(productId) {
  const response = await api.get(
    `/weightages/history/${productId}`
  );

  return response.data;
}

export async function validateWeightage(weightageId) {
  const response = await api.post(
    `/weightages/validate/${weightageId}`
  );

  return response.data;
}

export async function getRetailerWeightProfile(
  retailerId
) {
  const response = await api.get(
    `/weightages/retailer/${retailerId}/profile`
  );

  return response.data;
}