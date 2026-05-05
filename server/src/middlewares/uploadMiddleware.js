import multer from "multer";
import { randomUUID } from "crypto";
import path from "path";

const parsePositiveNumber = (rawValue, fallback) => {
  const parsed = Number(rawValue);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const maxUploadMb = parsePositiveNumber(process.env.UPLOAD_MAX_FILE_SIZE_MB, 50);
const maxUploadBytes = Math.floor(maxUploadMb * 1024 * 1024);

const reportAllowedMimes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf"
];

const imageAllowedMimes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp"
];

const createInvalidTypeError = (message) => {
  const error = new Error(message);
  error.code = "INVALID_FILE_TYPE";
  error.statusCode = 400;
  return error;
};

const safeExt = (originalName) => {
  const ext = path.extname(originalName || "").toLowerCase();
  const allowedExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf"];
  return allowedExts.includes(ext) ? ext : ".bin";
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Use a random UUID filename + validated extension to avoid path traversal and user-controlled names
    const ext = safeExt(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (reportAllowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(createInvalidTypeError("Invalid file type. Only image files and PDFs are allowed."));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxUploadBytes }
});

const imageOnlyFilter = (req, file, cb) => {
  if (imageAllowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(createInvalidTypeError("Invalid file type. Only image files are allowed."));
  }
};

export const uploadImageOnly = multer({
  storage,
  fileFilter: imageOnlyFilter,
  limits: { fileSize: maxUploadBytes }
});
