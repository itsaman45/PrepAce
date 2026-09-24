import api from "./api";

export const getEvaluationMetrics = async (measuredData = false) => {
  try {
    const response = await api.get(`/evaluation/metrics?measuredData=${measuredData}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching evaluation metrics:", error);
    throw error;
  }
};

export const runBenchmarkTest = async () => {
  try {
    const response = await api.post("/evaluation/benchmark-run");
    return response.data;
  } catch (error) {
    console.error("Error running benchmark test:", error);
    throw error;
  }
};
