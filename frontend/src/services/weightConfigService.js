import api from "./api";

export async function getWeightConfigs() {
  const response = await api.get("/weight-configs");
  return response.data;
}

export async function getWeightConfig(id) {
  const response = await api.get(`/weight-configs/${id}`);
  return response.data;
}

export async function createWeightConfig(data) {
  const response = await api.post("/weight-configs", data);
  return response.data;
}

export async function updateWeightConfig(id, data) {
  const response = await api.put(
    `/weight-configs/${id}`,
    data
  );

  return response.data;
}

export async function deleteWeightConfig(id) {
  const response = await api.delete(
    `/weight-configs/${id}`
  );

  return response.data;
}

export async function updateRetailerWeightProfile(
  retailerId,
  data
) {
  const response = await api.put(
    `/weight-configs/retailer/${retailerId}/profile`,
    data
  );

  return response.data;
}