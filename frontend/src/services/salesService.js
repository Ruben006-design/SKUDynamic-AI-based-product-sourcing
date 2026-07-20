import api from "./api";

export async function getSales(params = {}) {
  const response = await api.get("/sales", {
    params,
  });

  return response.data;
}

export async function getSale(id) {
  const response = await api.get(`/sales/${id}`);

  return response.data;
}

export async function createSale(data) {
  const response = await api.post(
    "/sales",
    data
  );

  return response.data;
}

export async function updateSale(
  id,
  data
) {
  const response = await api.put(
    `/sales/${id}`,
    data
  );

  return response.data;
}

export async function deleteSale(id) {
  const response = await api.delete(
    `/sales/${id}`
  );

  return response.data;
}