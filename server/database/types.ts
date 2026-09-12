export type UserRole = 'USER' | 'ADMIN';
export type UserPlan = 'FREE' | 'PRO';

export interface User {
  id: string;
  userCode: string;
  email: string;
  name: string;
  passwordHash: string;
  salt: string;
  role: UserRole;
  plan: UserPlan;
  proExpiresAt?: string;
  avatarUrl?: string;
  preferredLanguage: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSettings {
  proPriceUzs: number;
  proPriceAnnualUzs?: number;
  proPriceStudentUzs?: number;
  cardNumber: string;
  cardHolder: string;
  bankName: string;
  telegramSupport?: string;
  instructions?: string;
  isActive: boolean;
  updatedAt: string;
}

export interface AdBannerSettings {
  enabled: boolean;
  title: string;
  text: string;
  buttonText?: string;
  buttonUrl?: string;
  badge?: string;
  updatedAt: string;
}

export interface StudioSectionConfig {
  enabled: boolean;
  name: string;
  description: string;
  badge?: string;
  buttonText?: string;
}

export interface BrandingSettings {
  appName: string;
  appSubtitle: string;
  logoUrl?: string;
  logoIcon?: string;
  accentColor?: string;
}

export interface SystemSettings {
  isImageStudioEnabled: boolean;
  isVideoStudioEnabled: boolean;
  isPresentationStudioEnabled: boolean;
  imageStudioConfig: StudioSectionConfig;
  videoStudioConfig: StudioSectionConfig;
  presentationStudioConfig: StudioSectionConfig;
  branding: BrandingSettings;
  adBanner: AdBannerSettings;
  proPriceMonthlyUzs: number;
  proPriceAnnualUzs: number;
  proPriceStudentUzs: number;
  cardNumber: string;
  cardHolder: string;
  bankName: string;
  telegramSupport: string;
  paymentInstructions: string;
  updatedAt: string;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userCode: string;
  userEmail: string;
  userName: string;
  amount: number;
  paymentProofNote?: string;
  receiptImageUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface PlanLimits {
  messages: number;
  images: number;
  presentations: number;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: string;
  createdAt: string;
}

export interface StudentInfo {
  studentName?: string;
  institution?: string;
  group?: string;
  fieldOfStudy?: string;
  advisor?: string;
  workType?: string; // e.g. "Mustaqil ish", "Kurs ishi", "Prezentatsiya", "BMI"
  cityAndYear?: string; // e.g. "Toshkent - 2026"
}

export interface ChatMessage {
  id: string;
  chatId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  modelUsed?: string;
  toolUsed?: string;
  attachments?: {
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
  }[];
  generatedImage?: Generation;
  generatedPresentation?: Presentation;
  createdAt: string;
}

export interface Chat {
  id: string;
  userId: string;
  title: string;
  model: string;
  language?: string;
  systemPrompt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Generation {
  id: string;
  userId: string;
  type: 'image' | 'video' | 'presentation' | 'edited_image';
  title: string;
  prompt: string;
  model: string;
  aspectRatio?: string;
  outputUrl: string;
  thumbnailUrl?: string;
  parameters?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface SlideChartData {
  type: 'bar' | 'line' | 'pie';
  title: string;
  labels: string[];
  data: number[];
}

export interface SlideTableData {
  headers: string[];
  rows: string[][];
}

export interface PresentationSlide {
  id: string;
  order: number;
  title: string;
  subtitle?: string;
  layout: 'title' | 'content' | 'split' | 'quote' | 'stats' | 'chart' | 'table' | 'conclusion';
  bulletPoints: string[];
  bodyText?: string;
  speakerNotes?: string;
  imageUrl?: string;
  imagePrompt?: string;
  chart?: SlideChartData;
  table?: SlideTableData;
  themeCustomization?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
  };
}

export interface Presentation {
  id: string;
  userId: string;
  title: string;
  description?: string;
  topic: string;
  language: string;
  audience: string;
  educationLevel: string;
  style: string;
  tone: string;
  theme: string;
  aspectRatio: '16:9' | '4:3';
  slides: PresentationSlide[];
  studentInfo?: StudentInfo;
  sourceFileId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredFile {
  id: string;
  userId: string;
  originalName: string;
  mimeType: string;
  extension: string;
  size: number;
  storagePath: string;
  url: string;
  analysisSummary?: string;
  createdAt: string;
}

export interface AIModelConfig {
  id: string;
  name: string;
  provider: 'gemini' | 'veo' | 'imagen' | 'other';
  type: 'text' | 'image' | 'video' | 'multimodal';
  capabilities: string[];
  enabled: boolean;
  limits: {
    maxTokens?: number;
    rateLimitPerMin?: number;
  };
  priority: number;
  description: string;
}

export interface GenerationJob {
  id: string;
  userId: string;
  type: 'video' | 'image' | 'presentation' | 'export_pdf' | 'export_pptx';
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  prompt?: string;
  result?: any;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserUsage {
  userId: string;
  messagesCount: number;
  imagesCount: number;
  videosCount: number;
  presentationsCount: number;
  filesProcessedCount: number;
  storageBytes: number;
  lastActive: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  endpoint: string;
  status: number;
  latencyMs: number;
  ip: string;
  details?: string;
  timestamp: string;
}

export interface SecurityEvent {
  id: string;
  type:
    | 'login_failed'
    | 'login_success'
    | 'rate_limit_exceeded'
    | 'invalid_token'
    | 'unauthorized_access'
    | 'suspicious_input'
    | 'password_reset_request'
    | 'password_reset_success';
  userId?: string;
  ip: string;
  details: string;
  timestamp: string;
}
