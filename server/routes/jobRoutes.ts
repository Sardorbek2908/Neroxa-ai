import { Router } from 'express';
import { db } from '../database/db';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';

const router = Router();

router.get('/jobs/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const job = db.getJob(req.params.id, req.user.id);
  if (!job) {
    res.status(404).json({ error: 'Not Found', message: 'Job not found' });
    return;
  }
  res.json({ job });
});

export default router;
