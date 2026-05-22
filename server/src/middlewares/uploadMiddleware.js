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

// ─────────────────────────────────────────────
// PRIORITY 2: Upload Memory Pressure Protection
// ─────────────────────────────────────────────
const ABSOLUTE_UPLOAD_MAX_BYTES = 25 * 1024 * 1024; // 25 MB Hard Cap
const safeUploadBytes = Math.min(maxUploadBytes, ABSOLUTE_UPLOAD_MAX_BYTES);

const uploadsDir = path.resolve("uploads");

// ─────────────────────────────────────────────
// PRIORITY 4: Freeze MIME Allowlists
// ─────────────────────────────────────────────
const reportAllowedMimes = Object.freeze([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf"
]);

const imageAllowedMimes = Object.freeze([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp"
]);

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

  // ─────────────────────────────────────────────
  // PRIORITY 1: Prevent MIME-Type Confusion Bug
  // ─────────────────────────────────────────────
  const allowedDetectedMime = [
    ...reportAllowedMimes,
    ...imageAllowedMimes
  ].includes(detectedType?.mime);

  const mimeMatches = detectedType?.mime === file.mimetype;

  if (
    !detectedType ||
    !allowedMime ||
    !allowedDetectedMime ||
    !mimeMatches
  ) {
    throw createInvalidTypeError("Invalid file type. Content does not match requested extension.");
  }

  return detectedType;
};

export const persistUploadedFile = async (file) => {
  const detectedType = await validateFile(file);
  const filename = `${randomUUID()}.${detectedType.ext}`;
  const filePath = path.join(uploadsDir, filename);

  await mkdir(uploadsDir, { recursive: true });
  
  // ─────────────────────────────────────────────
  // PRIORITY 5: Add File Persistence Write Flag
  // ─────────────────────────────────────────────
  await writeFile(filePath, file.buffer, {
    flag: "wx"
  });

  return {
    filename,
    path: `/uploads/${filename}`,
    filePath
  };
};

export const deleteUploadedFile = async (filename) => {
  if (!filename) return;

  const filePath = path.join(uploadsDir, filename);
  
  // ─────────────────────────────────────────────
  // PRIORITY 3: Improve Silent Delete Failure Visibility
  // ─────────────────────────────────────────────
  await unlink(filePath).catch((error) => {
    console.warn("[UPLOAD_CLEANUP_FAILED]", {
      filename,
      error: error.message
    });
  });
};

export const upload = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: safeUploadBytes } // Used safe bytes here
});

export const uploadImageOnly = multer({
  storage: memoryStorage,
  fileFilter: imageOnlyFilter,
  limits: { fileSize: safeUploadBytes } // Used safe bytes here
});
