import dotenv from "dotenv";
import { logStatus } from "./utils/logger.js";

dotenv.config();

const { default: app } = await import("./app.js");
const { connectDB } = await import("./config/db.js");

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
	logStatus("SERVER", `Server running on port ${PORT}`);
});
