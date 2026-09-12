import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { db } from '../database/db';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import { uploadMiddleware } from '../middleware/upload';
import { fileService } from '../services/fileService';

const router = Router();

// Upload file
router.post('/files/upload', requireAuth, uploadMiddleware.single('file'), (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  if (!req.file) {
    res.status(400).json({ error: 'Validation Error', message: 'No file uploaded' });
    return;
  }

  const ext = path.extname(req.file.originalname).toLowerCase();
  const fileRecord = db.addFile({
    userId: req.user.id,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    extension: ext,
    size: req.file.size,
    storagePath: req.file.path,
    url: `/api/files/${path.basename(req.file.path)}/content`,
  });

  db.incrementUsage(req.user.id, 'storageBytes', req.file.size);

  res.status(201).json({ file: fileRecord });
});

// List user files
router.get('/files', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const files = db.getFiles(req.user.id);
  res.json({ files });
});

// Get file metadata
router.get('/files/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const file = db.getFile(req.params.id, req.user.id);
  if (!file) {
    res.status(404).json({ error: 'Not Found', message: 'File not found' });
    return;
  }
  res.json({ file });
});

// Download/Stream file content
router.get('/files/:id/content', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  // Look up by id or by filename
  let file = db.getFile(req.params.id, req.user.id);
  if (!file) {
    const userFiles = db.getFiles(req.user.id);
    file = userFiles.find(f => path.basename(f.storagePath) === req.params.id);
  }

  if (!file || !fs.existsSync(file.storagePath)) {
    res.status(404).json({ error: 'Not Found', message: 'File content not found' });
    return;
  }

  res.setHeader('Content-Type', file.mimeType);
  res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
  fs.createReadStream(file.storagePath).pipe(res);
});

// Analyze file
router.post('/files/:id/analyze', requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const { prompt } = req.body;

  try {
    const analysis = await fileService.analyzeFile(req.params.id, req.user.id, prompt);
    res.json({ analysis });
  } catch (err: any) {
    res.status(500).json({ error: 'Analysis Error', message: err.message || 'File analysis failed' });
  }
});

// File to presentation
router.post('/files/:id/to-presentation', requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const { slideCount, language } = req.body;

  try {
    const presentation = await fileService.convertFileToPresentation(
      req.params.id,
      req.user.id,
      slideCount ? parseInt(slideCount, 10) : 10,
      language || req.user.preferredLanguage || 'English'
    );
    res.status(201).json({ presentation });
  } catch (err: any) {
    res.status(500).json({ error: 'Presentation Error', message: err.message || 'File-to-presentation failed' });
  }
});

// Delete file
router.delete('/files/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const file = db.getFile(req.params.id, req.user.id);
  if (!file) {
    res.status(404).json({ error: 'Not Found', message: 'File not found' });
    return;
  }

  if (fs.existsSync(file.storagePath)) {
    try {
      fs.unlinkSync(file.storagePath);
    } catch (e) {
      console.warn('Failed to delete file from disk:', e);
    }
  }

  db.deleteFile(req.params.id, req.user.id);
  res.json({ success: true });
});

export default router;
