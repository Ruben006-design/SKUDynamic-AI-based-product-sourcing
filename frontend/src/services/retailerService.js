import api from "./api";



export const getRetailers = async () => {
  const response = await api.get("/retailers");
  return response.data;
};

export const getRetailer = async (id) => {
  const response = await api.get(`/retailers/${id}`);
  return response.data;
};

export const createRetailer = async (data) => {
  const response = await api.post("/retailers", data);
  return response.data;
};

export const updateRetailer = async (id, data) => {
  const response = await api.put(`/retailers/${id}`, data);
  return response.data;
};

