import dotenv from "dotenv";
import mongoose from "mongoose";
import Report from "../models/Report.js";
import { decrypt, encrypt } from "../utils/encryption.js";

dotenv.config();

const BATCH_SIZE = 100;

const migrate = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("Missing MONGO_URI in environment");
  }

  await mongoose.connect(process.env.MONGO_URI);

  let lastId = null;
  let totalScanned = 0;
  let totalUpdated = 0;
  let totalFailed = 0;

  while (true) {
    const query = { isSensitive: true };

    if (lastId) {
      query._id = { $gt: lastId };
    }

    const records = await Report.find(query)
      .sort({ _id: 1 })
      .limit(BATCH_SIZE)
      .select("_id description");

    if (!records.length) {
      break;
    }

    for (const record of records) {
      totalScanned += 1;
      lastId = record._id;

      try {
        const { data } = decrypt(record.description, {
          source: "scripts.migrateEncryption",
          recordId: String(record._id)
        });

        const reEncrypted = encrypt(data);

        if (record.description !== reEncrypted) {
          record.description = reEncrypted;
          await record.save();
          totalUpdated += 1;
        }
      } catch (error) {
        totalFailed += 1;
        console.error(`[ENCRYPTION] Migration failed for report=${record._id}:`, error.message);
      }
    }

    console.log(`[ENCRYPTION] Batch complete. scanned=${totalScanned} updated=${totalUpdated} failed=${totalFailed}`);
  }

  console.log(`[ENCRYPTION] Migration complete. scanned=${totalScanned} updated=${totalUpdated} failed=${totalFailed}`);
  await mongoose.connection.close();
};

migrate().catch(async (error) => {
  console.error("[ENCRYPTION] Migration aborted:", error.message);
  try {
    await mongoose.connection.close();
  } catch {
    // no-op
  }
  process.exit(1);
});
