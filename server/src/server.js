import dotenv from "dotenv";

dotenv.config();

const { default: app } = await import("./app.js");
const { connectDB } = await import("./config/db.js");

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
