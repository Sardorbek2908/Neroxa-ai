import { Router } from 'express';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import { imageService } from '../services/imageService';
import { db } from '../database/db';

const router = Router();

// Generate image
router.post('/generate/image', requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const { prompt, model, aspectRatio, resolution, style, referenceImageBase64, referenceMimeType } = req.body;

  if (!prompt) {
    res.status(400).json({ error: 'Validation Error', message: 'Prompt is required' });
    return;
  }

  const limitCheck = db.checkUserLimit(req.user.id, 'images');
  if (!limitCheck.allowed) {
    res.status(403).json({
      error: 'Limit Reached',
      message: "Bepul rasm yaratish limitingiz (3 ta) tugadi. Cheksiz yuqori sifatli rasmlar yaratish uchun PRO obunaga o'ting!",
      limitReached: true,
      limitType: 'images',
    });
    return;
  }

  try {
    const generation = await imageService.generateImage({
      userId: req.user.id,
      prompt,
      model,
      aspectRatio,
      resolution,
      style,
      referenceImageBase64,
      referenceMimeType,
    });

    res.status(201).json({ generation });
  } catch (err: any) {
    console.error('Image generation error:', err);
    res.status(500).json({ error: 'Generation Error', message: err.message || 'Image generation failed' });
  }
});

// Edit image
router.post('/edit/image', requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const { prompt, model, imageBase64, mimeType } = req.body;

  if (!prompt || !imageBase64) {
    res.status(400).json({ error: 'Validation Error', message: 'Prompt and source image are required' });
    return;
  }

  try {
    const generation = await imageService.editImage({
      userId: req.user.id,
      prompt,
      model,
      imageBase64,
      mimeType: mimeType || 'image/png',
    });

    res.status(201).json({ generation });
  } catch (err: any) {
    console.error('Image edit error:', err);
    res.status(500).json({ error: 'Edit Error', message: err.message || 'Image editing failed' });
  }
});

export default router;
