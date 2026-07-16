import ClientErrorLog from "../models/ClientErrorLog.js";
import { validationResult } from "express-validator";
import { sendError, sendSuccess } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

const buildClientErrorQuery = ({ source, statusCode, q, fromDate, toDate, range, type }) => {
  const query = {};

  if (["UI", "API"].includes(source)) {
    query.source = source;
  }

  const parsedStatusCode = Number(statusCode);
  if (statusCode && !Number.isNaN(parsedStatusCode)) {
    query.statusCode = Number(statusCode);
  } else if (type === "5xx") {
    query.statusCode = { $gte: 500, $lte: 599 };
  }

  if (q) {
    query.$or = [
      { message: { $regex: q, $options: "i" } },
      { path: { $regex: q, $options: "i" } },
      { method: { $regex: q, $options: "i" } }
    ];
  }

  if (fromDate || toDate) {
    query.createdAt = {};

    if (fromDate) {
      query.createdAt.$gte = new Date(fromDate);
    }

    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  } else if (range === "24h" || range === "7d") {
    const now = Date.now();
    const durationMs = range === "24h"
      ? 24 * 60 * 60 * 1000
      : 7 * 24 * 60 * 60 * 1000;
    query.createdAt = {
      $gte: new Date(now - durationMs)
    };
  }

  return query;
};

const csvEscape = (value) => {
  if (value === undefined || value === null) return "";
  const text = String(value).replace(/\r?\n|\r/g, " ");
  return `"${text.replace(/"/g, '""')}"`;
};

export const logClientError = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, "Validation failed", errors.array());
  }

  const {
    message,
    stack,
    componentStack,
    source,
    path,
    method,
    statusCode,
    userAgent,
    userId
  } = req.body;

  if (!message || !String(message).trim()) {
    return sendError(res, 400, "Message is required");
  }

  const created = await ClientErrorLog.create({
    message: String(message).slice(0, 3000),
    stack: stack ? String(stack).slice(0, 12000) : undefined,
    componentStack: componentStack ? String(componentStack).slice(0, 12000) : undefined,
    source,
    path,
    method,
    statusCode,
    userAgent,
    userId
  });

  return sendSuccess(res, { id: created._id }, 201, "Client error logged");
});

export const getClientErrors = asyncHandler(async (req, res) => {
  const rawPage = Number(req.query.page) || 1;
  const rawLimit = Number(req.query.limit) || 20;
  // Cap limit to prevent resource exhaustion
  const page = Math.max(1, rawPage);
  const limit = Math.min(Math.max(1, rawLimit), 100);
  const source = req.query.source;
  const statusCode = req.query.statusCode;
  const q = req.query.q?.trim();
  const fromDate = req.query.fromDate;
  const toDate = req.query.toDate;
  const range = req.query.range;
  const type = req.query.type;
  const query = buildClientErrorQuery({ source, statusCode, q, fromDate, toDate, range, type });

  const [items, total] = await Promise.all([
    ClientErrorLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ClientErrorLog.countDocuments(query)
  ]);

  return sendSuccess(res, {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    }
  });
});

export const exportClientErrorsCsv = asyncHandler(async (req, res) => {
  const source = req.query.source;
  const statusCode = req.query.statusCode;
  const q = req.query.q?.trim();
  const fromDate = req.query.fromDate;
  const toDate = req.query.toDate;
  const range = req.query.range;
  const type = req.query.type;

  const query = buildClientErrorQuery({ source, statusCode, q, fromDate, toDate, range, type });

  const items = await ClientErrorLog.find(query)
    .sort({ createdAt: -1 })
    .lean();

  const headers = [
    "createdAt",
    "source",
    "statusCode",
    "method",
    "path",
    "message",
    "userAgent"
  ];

  const rows = items.map((item) => [
    item.createdAt ? new Date(item.createdAt).toISOString() : "",
    item.source || "",
    item.statusCode || "",
    item.method || "",
    item.path || "",
    item.message || "",
    item.userAgent || ""
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((row) => row.map(csvEscape).join(","))
  ].join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="client-error-logs-${Date.now()}.csv"`);

  return res.status(200).send(csv);
});