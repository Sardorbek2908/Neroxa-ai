import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from '../database/db';
import { AuthenticatedRequest } from './auth';

// In-memory sliding window rate limiter
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const ipRateLimits = new Map<string, RateLimitRecord>();

export function rateLimiter(limitPerMin = 120) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = (req.ip || req.socket.remoteAddress || '127.0.0.1').toString();
    const now = Date.now();
    const windowMs = 60 * 1000;

    let record = ipRateLimits.get(ip);
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      ipRateLimits.set(ip, record);
    } else {
      record.count++;
    }

    if (record.count > limitPerMin) {
      db.logSecurityEvent({
        type: 'rate_limit_exceeded',
        ip,
        details: `Exceeded ${limitPerMin} req/min on ${req.method} ${req.originalUrl}`,
      });
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'You have exceeded the rate limit. Please try again in a minute.',
      });
      return;
    }

    next();
  };
}

export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
}

export function auditLogger(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const start = Date.now();
  req.requestId = `req_${crypto.randomUUID().substring(0, 8)}`;

  res.on('finish', () => {
    const latencyMs = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      db.logAudit({
        userId: req.user?.id,
        action: `${req.method} ${req.baseUrl || ''}${req.path}`,
        endpoint: req.originalUrl,
        status: res.statusCode,
        latencyMs,
        ip: (req.ip || req.socket.remoteAddress || 'unknown').toString(),
      });
    }
  });

  next();
}

// Prompt injection detector and defense wrapper
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /reveal\s+(the\s+)?system\s+prompt/i,
  /disregard\s+prior\s+guidelines/i,
  /you\s+are\s+now\s+DAN/i,
  /bypass\s+all\s+safety/i,
];

export function inspectPromptSecurity(prompt: string): { safe: boolean; warning?: string } {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(prompt)) {
      return {
        safe: false,
        warning: 'Input flagged by safety filter for attempted instruction override.',
      };
    }
  }
  return { safe: true };
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  console.error('Unhandled server error:', err);

  // Return clean, safe message without exposing server internals
  const statusCode = err.status || err.statusCode || 500;
  const message = err.clientMessage || 'An unexpected error occurred. Please try again.';

  res.status(statusCode).json({
    error: 'Internal Error',
    message,
    code: err.code || 'ERR_INTERNAL',
  });
}
