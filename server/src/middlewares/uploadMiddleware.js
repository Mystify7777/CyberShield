import multer from "multer";
import { fileTypeFromBuffer } from "file-type";
import { mkdir, writeFile, unlink } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";

const parsePositiveNumber = (rawValue, fallback) => {
  const parsed = Number(rawValue);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const maxUploadMb = parsePositiveNumber(process.env.UPLOAD_MAX_FILE_SIZE_MB, 50);
const maxUploadBytes = Math.floor(maxUploadMb * 1024 * 1024);
const uploadsDir = path.resolve("uploads");

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

const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (reportAllowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(createInvalidTypeError("Invalid file type. Only image files and PDFs are allowed."));
  }
};

const imageOnlyFilter = (req, file, cb) => {
  if (imageAllowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(createInvalidTypeError("Invalid file type. Only image files are allowed."));
  }
};

export const validateFile = async (file) => {
  if (!file?.buffer) {
    throw createInvalidTypeError("Invalid file type. File content is missing.");
  }

  const detectedType = await fileTypeFromBuffer(file.buffer);
  const allowedMime = file.mimetype && (reportAllowedMimes.includes(file.mimetype) || imageAllowedMimes.includes(file.mimetype));

  if (!detectedType || !allowedMime || ![...reportAllowedMimes, ...imageAllowedMimes].includes(detectedType.mime)) {
    throw createInvalidTypeError("Invalid file type. Only image files and PDFs are allowed.");
  }

  return detectedType;
};

export const persistUploadedFile = async (file) => {
  const detectedType = await validateFile(file);
  const filename = `${randomUUID()}.${detectedType.ext}`;
  const filePath = path.join(uploadsDir, filename);

  await mkdir(uploadsDir, { recursive: true });
  await writeFile(filePath, file.buffer);

  return {
    filename,
    path: `/uploads/${filename}`,
    filePath
  };
};

export const deleteUploadedFile = async (filename) => {
  if (!filename) return;

  const filePath = path.join(uploadsDir, filename);
  await unlink(filePath).catch(() => {});
};

export const upload = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: maxUploadBytes }
});

export const uploadImageOnly = multer({
  storage: memoryStorage,
  fileFilter: imageOnlyFilter,
  limits: { fileSize: maxUploadBytes }
});
