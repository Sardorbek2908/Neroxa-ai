import { Router } from 'express';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import { videoService } from '../services/videoService';
import fs from 'fs';
import path from 'path';

const router = Router();

router.post('/generate/video', requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const { prompt, model, duration, aspectRatio, resolution, imageBase64, mimeType } = req.body;

  if (!prompt && !imageBase64) {
    res.status(400).json({ error: 'Validation Error', message: 'Prompt or image is required for video generation' });
    return;
  }

  try {
    const job = await videoService.startVideoJob({
      userId: req.user.id,
      prompt: prompt || 'Generate cinematic video motion',
      model,
      duration,
      aspectRatio,
      resolution,
      imageBase64,
      mimeType,
    });

    res.status(202).json({ jobId: job.id, job });
  } catch (err: any) {
    console.error('Video job start error:', err);
    res.status(500).json({ error: 'Generation Error', message: err.message || 'Failed to initialize video generation' });
  }
});

// Stream video file with partial range support
router.get('/videos/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(process.cwd(), 'server', 'public', 'videos', filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).send('Video not found');
    return;
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});

export default router;
