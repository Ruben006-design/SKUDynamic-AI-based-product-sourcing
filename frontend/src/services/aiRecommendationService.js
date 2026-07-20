import api from "./api";

export async function generatePrompt(payload) {
  const response = await api.post(
    "/weightage-engine/llm/prompt",
    payload
  );

  return response.data;
}


export async function generateWeightage(
  productId,
  payload
) {
  const response = await api.post(
    `/weightage-engine/generate/${productId}`,
    payload
  );

  return response.data;
}

export async function generateBatchWeightage(
  payload
) {
  const response = await api.post(
    "/weightage-engine/generate/batch",
    payload
  );

  return response.data;
}


export async function generateRecommendation(
  productId,
  payload
) {
  const response = await api.post(
    `/reordering-engine/generate/${productId}`,
    payload
  );

  return response.data;
}

export async function generateBatchRecommendation(
  payload
) {
  const response = await api.post(
    "/reordering-engine/generate/batch",
    payload
  );

  return response.data;
}
