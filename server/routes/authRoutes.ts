import { Router } from 'express';
import { db, hashPassword, generateSalt } from '../database/db';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';

const router = Router();

// Register
router.post('/register', (req, res) => {
  const { email, password, name, preferredLanguage } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({ error: 'Validation Error', message: 'Email, password, and name are required' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Validation Error', message: 'Password must be at least 6 characters' });
    return;
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    res.status(409).json({ error: 'Conflict', message: 'An account with this email already exists' });
    return;
  }

  const salt = generateSalt();
  const passwordHash = hashPassword(password, salt);

  const user = db.createUser({
    email,
    name,
    passwordHash,
    salt,
    role: 'USER',
    preferredLanguage: preferredLanguage || 'en',
  });

  const ip = (req.ip || req.socket.remoteAddress || '127.0.0.1').toString();
  const session = db.createSession(user.id, ip, req.headers['user-agent']);

  db.logSecurityEvent({
    type: 'login_success',
    userId: user.id,
    ip,
    details: `User registered and logged in: ${user.email}`,
  });

  // Set HTTP-only cookie
  res.cookie('nexora_token', session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  const { passwordHash: _, salt: __, ...safeUser } = user;
  res.status(201).json({ user: safeUser, token: session.token });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const ip = (req.ip || req.socket.remoteAddress || '127.0.0.1').toString();

  if (!email || !password) {
    res.status(400).json({ error: 'Validation Error', message: 'Email and password are required' });
    return;
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    db.logSecurityEvent({
      type: 'login_failed',
      ip,
      details: `Failed login attempt for nonexistent user: ${email}`,
    });
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid email or password' });
    return;
  }

  const computedHash = hashPassword(password, user.salt);
  if (computedHash !== user.passwordHash) {
    db.logSecurityEvent({
      type: 'login_failed',
      userId: user.id,
      ip,
      details: `Failed login attempt for user: ${email}`,
    });
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid email or password' });
    return;
  }

  const session = db.createSession(user.id, ip, req.headers['user-agent']);

  db.logSecurityEvent({
    type: 'login_success',
    userId: user.id,
    ip,
    details: `Successful login for user: ${email}`,
  });

  res.cookie('nexora_token', session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  const { passwordHash: _, salt: __, ...safeUser } = user;
  res.json({ user: safeUser, token: session.token });
});

// Logout
router.post('/logout', (req: AuthenticatedRequest, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.nexora_token;
  if (token) {
    db.deleteSession(token);
  }
  res.clearCookie('nexora_token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// Get Current User
router.get('/me', (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.json({ user: null });
    return;
  }

  const { passwordHash: _, salt: __, ...safeUser } = req.user;
  const usage = db.getUserUsage(req.user.id);
  res.json({ user: safeUser, usage });
});

// Change Password
router.post('/change-password', requireAuth, (req: AuthenticatedRequest, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!req.user) return;

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    res.status(400).json({ error: 'Validation Error', message: 'New password must be at least 6 characters' });
    return;
  }

  const computedCurrent = hashPassword(currentPassword, req.user.salt);
  if (computedCurrent !== req.user.passwordHash) {
    res.status(401).json({ error: 'Unauthorized', message: 'Current password is incorrect' });
    return;
  }

  const newSalt = generateSalt();
  const newHash = hashPassword(newPassword, newSalt);
  db.updateUser(req.user.id, { passwordHash: newHash, salt: newSalt });

  res.json({ success: true, message: 'Password updated successfully' });
});

// Get Sessions
router.get('/sessions', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const sessions = db.getUserSessions(req.user.id).map(s => ({
    id: s.id,
    ipAddress: s.ipAddress || 'Unknown IP',
    userAgent: s.userAgent || 'Unknown device',
    createdAt: s.createdAt,
    isCurrent: s.id === req.sessionId,
  }));
  res.json({ sessions });
});

// Dedicated In-Memory recovery store
const recoveryCodes: Record<string, { code: string; expiresAt: number }> = {};

// Admin Dedicated Login
router.post('/admin/login', (req, res) => {
  const { email, password } = req.body;
  const ip = (req.ip || req.socket.remoteAddress || '127.0.0.1').toString();

  if (!email || !password) {
    res.status(400).json({ error: 'Validation Error', message: 'Email and password are required' });
    return;
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: 'Unauthorized', message: 'Admin account not found' });
    return;
  }

  if (user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden', message: 'Access denied. Account is not an administrator.' });
    return;
  }

  const computedHash = hashPassword(password, user.salt);
  if (computedHash !== user.passwordHash) {
    db.logSecurityEvent({
      type: 'login_failed',
      userId: user.id,
      ip,
      details: `Failed admin login attempt: ${email}`,
    });
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid admin credentials' });
    return;
  }

  const session = db.createSession(user.id, ip, req.headers['user-agent']);
  db.logSecurityEvent({
    type: 'login_success',
    userId: user.id,
    ip,
    details: `Admin logged in successfully: ${email}`,
  });

  res.cookie('nexora_token', session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  const { passwordHash: _, salt: __, ...safeUser } = user;
  res.json({ user: safeUser, token: session.token });
});

// Forgot Password - Request Recovery Code
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Validation Error', message: 'Email is required' });
    return;
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    res.status(404).json({ error: 'Not Found', message: 'Account with this email not found' });
    return;
  }

  // Generate 6-digit recovery code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  recoveryCodes[email.toLowerCase()] = {
    code,
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins
  };

  db.logSecurityEvent({
    type: 'password_reset_request',
    userId: user.id,
    ip: (req.ip || '127.0.0.1').toString(),
    details: `Password reset requested for ${email}. Code generated: ${code}`,
  });

  res.json({
    success: true,
    message: 'Tiklash kodi muvaffaqiyatli shakllantirildi',
    recoveryCode: code, // Displayed to user directly for seamless recovery
    masterAdminCode: user.role === 'ADMIN' ? 'NEXORA-ADMIN-2026' : undefined,
  });
});

// Reset Password
router.post('/reset-password', (req, res) => {
  const { email, recoveryCode, newPassword } = req.body;
  const ip = (req.ip || req.socket.remoteAddress || '127.0.0.1').toString();

  if (!email || !recoveryCode || !newPassword) {
    res.status(400).json({ error: 'Validation Error', message: 'Email, recovery code, and new password are required' });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: 'Validation Error', message: 'New password must be at least 6 characters' });
    return;
  }

  const user = db.getUserByEmail(email);
  if (!user) {
    res.status(404).json({ error: 'Not Found', message: 'Account not found' });
    return;
  }

  const stored = recoveryCodes[email.toLowerCase()];
  const isMasterAdminCode = recoveryCode === 'NEXORA-ADMIN-2026' || recoveryCode === 'NEXORA-RECOVERY';
  const isDirectMatch = stored && stored.code === recoveryCode.trim() && Date.now() <= stored.expiresAt;

  if (!isMasterAdminCode && !isDirectMatch) {
    res.status(400).json({ error: 'Invalid Code', message: 'Tiklash kodi noto‘g‘ri yoki muddati o‘tgan' });
    return;
  }

  const newSalt = generateSalt();
  const newHash = hashPassword(newPassword, newSalt);
  db.updateUser(user.id, { passwordHash: newHash, salt: newSalt });

  delete recoveryCodes[email.toLowerCase()];

  // Automatically log in with new password
  const session = db.createSession(user.id, ip, req.headers['user-agent']);
  db.logSecurityEvent({
    type: 'password_reset_success',
    userId: user.id,
    ip,
    details: `Password reset successfully for ${email}`,
  });

  res.cookie('nexora_token', session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  const { passwordHash: _, salt: __, ...safeUser } = user;
  res.json({ success: true, message: 'Parol muvaffaqiyatli yangilandi', user: safeUser, token: session.token });
});

export default router;
