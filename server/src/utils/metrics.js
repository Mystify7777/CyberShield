import AnalyticsMetric from "../models/AnalyticsMetric.js";

export const METRIC_KEYS = {
  REPORTS_SUBMITTED: "reportsSubmitted",
  AI_SCANS_RUN: "aiScansRun",
  THREATS_FLAGGED: "threatsFlagged",
  ARTICLE_VIEWS: "articleViews",
  MODERATION_ACTIONS: "moderationActions"
};

export const incrementMetric = async (key, delta = 1) => {
  if (!key || !Number.isFinite(delta) || delta === 0) {
    return;
  }

  await AnalyticsMetric.findOneAndUpdate(
    { key },
    { $inc: { value: delta } },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
  );
};

export const getMetricsSnapshot = async (keys = Object.values(METRIC_KEYS)) => {
  const records = await AnalyticsMetric.find({ key: { $in: keys } }).lean();
  const values = Object.fromEntries(keys.map((key) => [key, 0]));

  records.forEach((record) => {
    values[record.key] = Number(record.value || 0);
  });

  return values;
};
