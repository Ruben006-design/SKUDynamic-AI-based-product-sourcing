import api from "./api";

export const getOrders = async (params = {}) => {
  const response = await api.get("/order-list", {
    params,
  });

  return response.data;
};

export const getOrder = async (id) => {
  const response = await api.get(
    `/order-list/${id}`
  );

  return response.data;
};

export const createOrder = async (data) => {
  const response = await api.post(
    "/order-list",
    data
  );

  return response.data;
};

export const updateOrder = async (
  id,
  data
) => {
  const response = await api.put(
    `/order-list/${id}`,
    data
  );

  return response.data;
};

export const deleteOrder = async (id) => {
  await api.delete(
    `/order-list/${id}`
  );
};

export const approveOrder = async (
  id,
  approved_by
) => {
  const response = await api.put(
    `/order-list/${id}/approve`,
    {
      approved_by,
    }
  );

  return response.data;
};

export const rejectOrder = async (
  id,
  approved_by
) => {
  const response = await api.put(
    `/order-list/${id}/reject`,
    {
      approved_by,
    }
  );

  return response.data;
};

export const getOrderAnalytics =
  async () => {
    const response = await api.get(
      "/order-list/analytics"
    );

    return response.data;
  };

export const exportOrdersCSV =
  async () => {
    const response = await api.get(
      "/order-list/export/csv",
      {
        responseType: "blob",
      }
    );

    return response.data;
  };