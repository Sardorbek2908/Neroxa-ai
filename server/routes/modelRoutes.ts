import { Router } from 'express';
import { modelRegistry } from '../providers/modelRegistry';

const router = Router();

router.get('/models', (req, res) => {
  const models = modelRegistry.getModels();
  res.json({ models });
});

export default router;
