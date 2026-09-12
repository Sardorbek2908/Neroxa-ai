import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.gif',
  '.mp4', '.webm',
  '.pdf', '.txt', '.csv', '.json', '.pptx', '.docx'
]);

const ALLOWED_MIMES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/webm',
  'application/pdf', 'text/plain', 'text/csv', 'application/json',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream' // fallback for raw binaries
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeKey = `${Date.now()}_${crypto.randomUUID()}${ext}`;
    cb(null, safeKey);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return cb(new Error(`File type ${ext} is not allowed. Supported: JPG, PNG, WEBP, GIF, MP4, WEBM, PDF, TXT, CSV, JSON, PPTX, DOCX`));
    }
    cb(null, true);
  },
});
