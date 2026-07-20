import api from "./api";

export async function getProductSuppliers() {
  const response = await api.get("/product-suppliers");
  return response.data;
}

export async function getProductSupplier(id) {
  const response = await api.get(
    `/product-suppliers/${id}`
  );
  return response.data;
}

export async function createProductSupplier(data) {
  const response = await api.post(
    "/product-suppliers",
    data
  );
  return response.data;
}

export async function updateProductSupplier(
  id,
  data
) {
  const response = await api.put(
    `/product-suppliers/${id}`,
    data
  );

  return response.data;
}

export async function deleteProductSupplier(id) {
  const response = await api.delete(
    `/product-suppliers/${id}`
  );

  return response.data;
}