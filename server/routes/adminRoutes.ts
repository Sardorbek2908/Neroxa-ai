import { Router } from 'express';
import { db } from '../database/db';
import { AuthenticatedRequest, requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// All routes here require ADMIN
router.use('/admin', requireAuth, requireAdmin);

// Users list
router.get('/admin/users', (req: AuthenticatedRequest, res) => {
  const users = db.getAllUsers();
  res.json({ users });
});

// Delete user
router.delete('/admin/users/:id', (req: AuthenticatedRequest, res) => {
  const success = db.deleteUser(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Not Found', message: 'User not found' });
    return;
  }
  res.json({ success: true });
});

// Update user role
router.put('/admin/users/:id', (req: AuthenticatedRequest, res) => {
  const user = db.getUserById(req.params.id);
  if (!user) {
    res.status(404).json({ error: 'Not Found', message: 'User not found' });
    return;
  }
  if (req.body.role) {
    db.updateUser(user.id, { role: req.body.role });
    user.role = req.body.role;
  }
  res.json({ user });
});

// Stats summary
router.get('/admin/stats', (req: AuthenticatedRequest, res) => {
  const users = db.getAllUsers();
  const jobs = db.getAllJobs();
  const secEvents = db.getSecurityEvents(100);
  const presentations = db.getAllPresentations();
  const creations = db.getAllGenerations();

  res.json({
    stats: {
      totalUsers: users.length,
      totalGenerations: creations.length,
      totalPresentations: presentations.length,
      totalSecurityEvents: secEvents.length,
      totalJobs: jobs.length,
    },
  });
});

// Usage statistics
router.get('/admin/usage', (req: AuthenticatedRequest, res) => {
  const usage = db.getAllUsage();
  res.json({ usage });
});

// Jobs list
router.get('/admin/jobs', (req: AuthenticatedRequest, res) => {
  const jobs = db.getAllJobs();
  res.json({ jobs });
});

// Security events
router.get('/admin/security-events', (req: AuthenticatedRequest, res) => {
  const events = db.getSecurityEvents(100);
  res.json({ events });
});

// Audit logs
router.get('/admin/audit-logs', (req: AuthenticatedRequest, res) => {
  const logs = db.getAuditLogs(100);
  res.json({ logs });
});

// Add Model
router.post('/admin/models', (req: AuthenticatedRequest, res) => {
  const { id, name, provider, type, capabilities, limits, description, priority } = req.body;
  if (!id || !name || !provider) {
    res.status(400).json({ error: 'Validation Error', message: 'id, name, and provider are required' });
    return;
  }

  db.addModel({
    id,
    name,
    provider,
    type: type || 'multimodal',
    capabilities: capabilities || ['chat'],
    enabled: true,
    limits: limits || { rateLimitPerMin: 30 },
    priority: priority || 10,
    description: description || '',
  });

  res.status(201).json({ success: true, models: db.getModels() });
});

// Update Model
router.put('/admin/models/:id', (req: AuthenticatedRequest, res) => {
  const updated = db.updateModel(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Not Found', message: 'Model not found' });
    return;
  }
  res.json({ model: updated });
});

// Comprehensive System Settings (Toggles, Ads, Pricing, Cards)
router.get('/admin/system-settings', (req: AuthenticatedRequest, res) => {
  const settings = db.getSystemSettings();
  res.json({ settings });
});

router.put('/admin/system-settings', (req: AuthenticatedRequest, res) => {
  const patch = req.body;
  const updated = db.updateSystemSettings(patch);

  db.logAudit({
    userId: req.user!.id,
    action: 'update_system_settings',
    endpoint: '/api/admin/system-settings',
    status: 200,
    latencyMs: 1,
    ip: req.ip || '',
    details: `Updated system settings (Image: ${updated.isImageStudioEnabled}, Video: ${updated.isVideoStudioEnabled}, AdEnabled: ${updated.adBanner?.enabled})`,
  });

  res.json({ success: true, settings: updated });
});

// Subscription & Payment Settings Management
router.get('/admin/subscription/settings', (req: AuthenticatedRequest, res) => {
  const settings = db.getPaymentSettings();
  res.json({ settings });
});

router.put('/admin/subscription/settings', (req: AuthenticatedRequest, res) => {
  const { proPriceUzs, cardNumber, cardHolder, bankName, telegramSupport, instructions, isActive } = req.body;
  const updated = db.updatePaymentSettings({
    ...(proPriceUzs !== undefined && { proPriceUzs: Number(proPriceUzs) }),
    ...(cardNumber !== undefined && { cardNumber: String(cardNumber).trim() }),
    ...(cardHolder !== undefined && { cardHolder: String(cardHolder).trim() }),
    ...(bankName !== undefined && { bankName: String(bankName).trim() }),
    ...(telegramSupport !== undefined && { telegramSupport: String(telegramSupport).trim() }),
    ...(instructions !== undefined && { instructions: String(instructions).trim() }),
    ...(isActive !== undefined && { isActive: Boolean(isActive) }),
  });

  db.logAudit({
    userId: req.user!.id,
    action: 'update_payment_settings',
    endpoint: '/api/admin/subscription/settings',
    status: 200,
    latencyMs: 1,
    ip: req.ip || '',
    details: `Updated PRO price: ${updated.proPriceUzs} UZS, Card: ${updated.cardNumber}`,
  });

  res.json({ success: true, settings: updated });
});

// Grant PRO directly by userCode, email, or userId
router.post('/admin/subscription/grant-pro', (req: AuthenticatedRequest, res) => {
  const { identifier, days, plan } = req.body;
  if (!identifier) {
    res.status(400).json({ error: 'Foydalanuvchi ID si yoki emaili kiritilmadi' });
    return;
  }

  const durationDays = Number(days) || 30;
  const targetPlan = plan === 'FREE' ? 'FREE' : 'PRO';
  const updatedUser = db.grantPro(identifier, durationDays, targetPlan);

  if (!updatedUser) {
    res.status(404).json({ error: `Foydalanuvchi topilmadi: "${identifier}"` });
    return;
  }

  db.logAudit({
    userId: req.user!.id,
    action: 'grant_pro_plan',
    endpoint: '/api/admin/subscription/grant-pro',
    status: 200,
    latencyMs: 1,
    ip: req.ip || '',
    details: `${targetPlan} plan berildi (${durationDays} kun): ${updatedUser.email} (ID: ${updatedUser.userCode})`,
  });

  res.json({
    success: true,
    message: `${updatedUser.name} (${updatedUser.userCode}) hisobiga ${targetPlan} rejasi muvaffaqiyatli berildi!`,
    user: {
      id: updatedUser.id,
      userCode: updatedUser.userCode,
      email: updatedUser.email,
      name: updatedUser.name,
      plan: updatedUser.plan,
      proExpiresAt: updatedUser.proExpiresAt,
    },
  });
});

// List all payment requests
router.get('/admin/subscription/requests', (req: AuthenticatedRequest, res) => {
  const requests = db.getPaymentRequests();
  res.json({ requests });
});

// Approve payment request
router.post('/admin/subscription/requests/:id/approve', (req: AuthenticatedRequest, res) => {
  const { days } = req.body;
  const result = db.approvePaymentRequest(req.params.id, req.user!.name, Number(days) || 30);
  if (!result.success) {
    res.status(404).json({ error: "To'lov so'rovi topilmadi" });
    return;
  }
  res.json({ success: true, request: result.request, user: result.user });
});

// Reject payment request
router.post('/admin/subscription/requests/:id/reject', (req: AuthenticatedRequest, res) => {
  const result = db.rejectPaymentRequest(req.params.id, req.user!.name);
  if (!result.success) {
    res.status(404).json({ error: "To'lov so'rovi topilmadi" });
    return;
  }
  res.json({ success: true, request: result.request });
});

// Get user list with codes and plans for admin
router.get('/admin/subscription/users', (req: AuthenticatedRequest, res) => {
  const users = db.getAllUsers().map(u => {
    const usage = db.getUserUsage(u.id);
    return {
      id: u.id,
      userCode: u.userCode || 'NX-0000',
      email: u.email,
      name: u.name,
      role: u.role,
      plan: u.plan || 'FREE',
      proExpiresAt: u.proExpiresAt,
      createdAt: u.createdAt,
      usage: {
        messages: usage.messagesCount,
        images: usage.imagesCount,
        presentations: usage.presentationsCount,
      },
    };
  });
  res.json({ users });
});

export default router;
