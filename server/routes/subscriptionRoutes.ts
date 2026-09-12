import { Router } from 'express';
import { db } from '../database/db';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';

const router = Router();

// Public: Get global system config (toggles, ads, payment info)
router.get('/system/config', (req, res) => {
  const sys = db.getSystemSettings();
  res.json({
    isImageStudioEnabled: sys.isImageStudioEnabled,
    isVideoStudioEnabled: sys.isVideoStudioEnabled,
    isPresentationStudioEnabled: sys.isPresentationStudioEnabled ?? true,
    imageStudioConfig: sys.imageStudioConfig,
    videoStudioConfig: sys.videoStudioConfig,
    presentationStudioConfig: sys.presentationStudioConfig,
    branding: sys.branding,
    adBanner: sys.adBanner,
    paymentSettings: {
      proPriceMonthlyUzs: sys.proPriceMonthlyUzs,
      proPriceAnnualUzs: sys.proPriceAnnualUzs,
      proPriceStudentUzs: sys.proPriceStudentUzs,
      proPriceUzs: sys.proPriceMonthlyUzs,
      cardNumber: sys.cardNumber,
      cardHolder: sys.cardHolder,
      bankName: sys.bankName,
      telegramSupport: sys.telegramSupport,
      instructions: sys.paymentInstructions,
    },
    config: sys,
  });
});

// Public / User: Get current payment settings (Card number, price, instructions)
router.get('/subscription/settings', (req, res) => {
  const settings = db.getPaymentSettings();
  res.json({ settings });
});

// Authenticated: Get user's current limits and usage status
router.get('/subscription/my-limits', requireAuth, (req: AuthenticatedRequest, res) => {
  const status = db.getUserLimitStatus(req.user!.id);
  if (!status) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(status);
});

// Authenticated: Submit payment proof / request PRO subscription
router.post('/subscription/request-pro', requireAuth, (req: AuthenticatedRequest, res) => {
  try {
    const { note, receiptImage, receiptImageUrl } = req.body;
    const proofImg = receiptImage || receiptImageUrl;
    const request = db.createPaymentRequest(req.user!.id, note, proofImg);
    res.status(201).json({
      success: true,
      message: "To'lov so'rovi muvaffaqiyatli qabul qilindi. Administrator tez orada tekshirib, PRO rejasini faollashtiradi.",
      request,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || "Xatolik yuz berdi" });
  }
});

export default router;
