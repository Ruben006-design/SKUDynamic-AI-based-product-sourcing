import api from "./api";

export const getEvaluations = async () => {
  const response = await api.get("/human-evaluations");
  return response.data;
};

export const getEvaluation = async (id) => {
  const response = await api.get(
    `/human-evaluations/${id}`
  );
  return response.data;
};

export const createEvaluation = async (
  data
) => {
  const response = await api.post(
    "/human-evaluations",
    data
  );
  return response.data;
};

export const updateEvaluation = async (
  id,
  data
) => {
  const response = await api.put(
    `/human-evaluations/${id}`,
    data
  );
  return response.data;
};

export const deleteEvaluation = async (
  id
) => {
  await api.delete(
    `/human-evaluations/${id}`
  );
};