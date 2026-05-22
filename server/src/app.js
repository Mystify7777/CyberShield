import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import articleRoutes from "./routes/articleRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import forumRoutes from "./routes/forumRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import memeRoutes from "./routes/memeRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import systemRoutes from "./routes/systemRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import trustScanRoutes from "./routes/trustScanRoutes.js";
import { sanitizeMiddleware } from "./middlewares/sanitizeMiddleware.js";
import { xssMiddleware } from "./middlewares/xssMiddleware.js";
import { globalErrorHandler } from "./middlewares/errorMiddleware.js";
import { isDebugLogsEnabled, logInfo } from "./utils/logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.set("trust proxy", 1);
const isProduction = process.env.NODE_ENV === "production";

const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || "";
const allowedOrigins = allowedOriginsEnv
	.split(",")
	.map((origin) => origin.trim())
	.filter(Boolean);

const corsOptions = {
	origin: (origin, callback) => {
		if (!origin) {
			return callback(null, true);
		}

		let hostname;

		try {
			hostname = new URL(origin).hostname;
		} catch {
			// Malformed Origin header: deny without throwing to avoid 500 errors
			return callback(null, false);
		}

		const isLocalDevOrigin = !isProduction && (hostname === "localhost" || hostname === "127.0.0.1");

		const isAllowedByEnv = allowedOrigins.some((allowedOrigin) => {
			try {
				const allowedHostname = new URL(allowedOrigin).hostname;
				return allowedHostname === hostname;
			} catch {
				// If allowedOrigin is not a full URL, fall back to direct comparison
				return allowedOrigin === origin || allowedOrigin === hostname;
			}
		});

		if (isLocalDevOrigin || isAllowedByEnv) {
			return callback(null, true);
		}

		// Disallowed origin: cleanly deny without throwing
		return callback(null, false);
	},
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true
};

const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100
});

const shouldSkipGlobalRateLimit = (req) => {
	const urlPath = req.originalUrl || "";

	return (
		req.method === "GET" && (
			urlPath.startsWith("/api/system/health") ||
			urlPath.startsWith("/api/system/version") ||
			urlPath.startsWith("/api/system/uptime") ||
			urlPath.startsWith("/api/reports") ||
			urlPath.startsWith("/api/admin/reports") ||
			urlPath.startsWith("/api/notifications")
		)
	);
};

// Security Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// Body parsing MUST run before sanitizers so req.body is available to them
app.use(express.json());
app.use(xssMiddleware);
app.use(sanitizeMiddleware);

app.use((req, res, next) => {
	if (shouldSkipGlobalRateLimit(req)) {
		return next();
	}

	return apiLimiter(req, res, next);
});

// Standard Middleware
app.use(morgan("dev"));
if (isDebugLogsEnabled()) {
	app.use((req, res, next) => {
		const start = Date.now();
		res.on("finish", () => {
			logInfo("HTTP", `${req.method} ${req.originalUrl} -> ${res.statusCode}`, {
				durationMs: Date.now() - start
			});
		});
		next();
	});
}
// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/memes", memeRoutes);
app.use("/api/game", gameRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/system", systemRoutes);
app.use("/api/users", userRoutes);
app.use("/api/trustscan", trustScanRoutes);

app.get("/", (req, res) => {
	res.send("API is running...");
});

app.use(globalErrorHandler);

export default app;
