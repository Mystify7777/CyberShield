import axios from "axios";

export const analyzeText = async (text) => {
  try {
    const response = await axios.post(
      `${process.env.AI_SERVICE_URL}/api/predict`,
      { text }
    );

    return response.data;
  } catch (error) {
    console.error("AI Service Error:", error.message);
    throw new Error("AI service failed");
  }
};
