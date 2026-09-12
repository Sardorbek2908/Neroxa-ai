import { Router } from 'express';
import { db } from '../database/db';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';

const router = Router();

router.get('/creations', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const type = req.query.type as string | undefined;
  const creations = db.getGenerations(req.user.id, type);
  res.json({ creations });
});

router.delete('/creations/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const success = db.deleteGeneration(req.params.id, req.user.id);
  if (!success) {
    res.status(404).json({ error: 'Not Found', message: 'Creation not found' });
    return;
  }
  res.json({ success: true });
});

export default router;
