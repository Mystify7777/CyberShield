import axios from "axios";

const AI_SERVICE_TIMEOUT_MS = 10_000;

const getAiServiceUrl = () => {
	const rawUrl = String(process.env.AI_SERVICE_URL || "").trim();

	if (!rawUrl) {
		throw new Error("AI service is not configured");
	}

	return rawUrl.replace(/\\/+$/, "");
};

export const analyzeText = async (text) => {
	try {
		const response = await axios.post(
			`${getAiServiceUrl()}/api/predict`,
			{ text },
			{ timeout: AI_SERVICE_TIMEOUT_MS }
		);

		return response.data;
	} catch (error) {
		console.error("AI Service Error:", error.message);
		throw new Error("AI service failed");
	}
};
