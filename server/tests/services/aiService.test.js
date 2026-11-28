import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const postMock = vi.fn();

vi.mock("axios", () => ({
	default: {
		post: postMock
	}
}));

import { analyzeText } from "../../src/services/aiService.js";

describe("AI service integration", () => {
	const originalUrl = process.env.AI_SERVICE_URL;

	beforeEach(() => {
		postMock.mockReset();
		process.env.AI_SERVICE_URL = "https://cybershield-ai-sm3o.onrender.com/";
	});

	afterEach(() => {
		if (originalUrl === undefined) {
			delete process.env.AI_SERVICE_URL;
		} else {
			process.env.AI_SERVICE_URL = originalUrl;
		}
	});

	it("calls the FastAPI prediction endpoint through the configured server-side URL", async () => {
		postMock.mockResolvedValue({
			data: { label: "SUSPICIOUS", confidence: 0.6 }
		});

		await expect(analyzeText("urgent verify your account")).resolves.toEqual({
			label: "SUSPICIOUS",
			confidence: 0.6
		});

		expect(postMock).toHaveBeenCalledWith(
			"https://cybershield-ai-sm3o.onrender.com/api/predict",
			{ text: "urgent verify your account" },
			{ timeout: 10_000 }
		);
	});

	it("bounds requests when the AI service is unavailable", async () => {
		postMock.mockRejectedValue(new Error("timeout"));

		await expect(analyzeText("test")).rejects.toThrow("AI service failed");
		expect(postMock).toHaveBeenCalledWith(
			"https://cybershield-ai-sm3o.onrender.com/api/predict",
			{ text: "test" },
			{ timeout: 10_000 }
		);
	});

	it("fails clearly when the AI service URL is missing", async () => {
		delete process.env.AI_SERVICE_URL;

		await expect(analyzeText("test")).rejects.toThrow("AI service failed");
		expect(postMock).not.toHaveBeenCalled();
	});
});
