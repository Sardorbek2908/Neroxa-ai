import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  UserPlan,
  Session,
  Chat,
  ChatMessage,
  Generation,
  Presentation,
  StoredFile,
  AIModelConfig,
  GenerationJob,
  UserUsage,
  AuditLog,
  SecurityEvent,
  PaymentSettings,
  PaymentRequest,
  PlanLimits,
  SystemSettings,
  AdBannerSettings,
} from './types';

interface DatabaseSchema {
  users: User[];
  sessions: Session[];
  chats: Chat[];
  messages: ChatMessage[];
  generations: Generation[];
  presentations: Presentation[];
  files: StoredFile[];
  models: AIModelConfig[];
  jobs: GenerationJob[];
  usage: Record<string, UserUsage>;
  auditLogs: AuditLog[];
  securityEvents: SecurityEvent[];
  paymentSettings?: PaymentSettings;
  paymentRequests?: PaymentRequest[];
  systemSettings?: SystemSettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'nexora-db.json');

export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

const defaultModels: AIModelConfig[] = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    provider: 'gemini',
    type: 'multimodal',
    capabilities: ['chat', 'reasoning', 'coding', 'file_analysis', 'presentation', 'multilingual'],
    enabled: true,
    limits: { maxTokens: 8192, rateLimitPerMin: 60 },
    priority: 1,
    description: 'Fast, state-of-the-art general intelligence & multimodal agent',
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    provider: 'gemini',
    type: 'text',
    capabilities: ['chat', 'advanced_reasoning', 'complex_coding', 'academic_research'],
    enabled: true,
    limits: { maxTokens: 8192, rateLimitPerMin: 30 },
    priority: 2,
    description: 'Premier reasoning and advanced programming problem solver',
  },
  {
    id: 'gemini-3.1-flash-lite-image',
    name: 'Gemini Flash Image (Imagen)',
    provider: 'gemini',
    type: 'image',
    capabilities: ['image_generation', 'image_editing', 'aspect_ratio_control'],
    enabled: true,
    limits: { rateLimitPerMin: 20 },
    priority: 3,
    description: 'Rapid, ultra-responsive image synthesis and contextual editing',
  },
  {
    id: 'gemini-3.1-flash-image',
    name: 'Gemini Flash Image HD (1K/2K/4K)',
    provider: 'gemini',
    type: 'image',
    capabilities: ['high_res_image_generation', 'image_editing', 'photorealism'],
    enabled: true,
    limits: { rateLimitPerMin: 15 },
    priority: 4,
    description: 'High-definition studio quality image generation & refinement',
  },
  {
    id: 'veo-3.1-lite-generate-preview',
    name: 'Veo 3.1 Lite Video',
    provider: 'veo',
    type: 'video',
    capabilities: ['text_to_video', 'image_to_video', 'cinematic_motion'],
    enabled: true,
    limits: { rateLimitPerMin: 5 },
    priority: 5,
    description: 'Asynchronous AI video generation with dynamic cinematic motions',
  },
  {
    id: 'veo-3.1-generate-preview',
    name: 'Veo 3.1 Pro Cinematic Video',
    provider: 'veo',
    type: 'video',
    capabilities: ['high_res_video', 'reference_to_video', 'storytelling'],
    enabled: true,
    limits: { rateLimitPerMin: 3 },
    priority: 6,
    description: 'Full cinematic production video model with reference image consistency',
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
    this.seedDefaults();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error loading DB file, initializing clean database:', e);
    }

    return {
      users: [],
      sessions: [],
      chats: [],
      messages: [],
      generations: [],
      presentations: [],
      files: [],
      models: defaultModels,
      jobs: [],
      usage: {},
      auditLogs: [],
      securityEvents: []
    };
  }

  private persist(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist database:', e);
    }
  }

  private seedDefaults(): void {
    let changed = false;

    // Seed default models if missing
    if (!this.data.models || this.data.models.length === 0) {
      this.data.models = defaultModels;
      changed = true;
    }

    // Default payment settings
    if (!this.data.paymentSettings) {
      this.data.paymentSettings = {
        proPriceUzs: 49000,
        cardNumber: '8600 0410 1234 5678',
        cardHolder: 'SARDORBEK M.',
        bankName: 'Uzcard / Humo',
        telegramSupport: '@sardorbek_admin',
        instructions: "Karta raqamiga to'lov qiling. To'lov izohiga o'zingizning User ID ingizni yozing. To'lovdan so'ng 'To'lov qildim' so'rovini yuboring yoki Telegram orqali chekni tashlang.",
        isActive: true,
        updatedAt: new Date().toISOString(),
      };
      changed = true;
    }

    if (!this.data.paymentRequests) {
      this.data.paymentRequests = [];
      changed = true;
    }

    // Ensure all users have userCode and plan
    for (const u of this.data.users) {
      if (!u.userCode) {
        u.userCode = u.role === 'ADMIN' ? 'NX-ADMIN' : `NX-${Math.floor(1000 + Math.random() * 9000)}`;
        changed = true;
      }
      if (!u.plan) {
        u.plan = u.role === 'ADMIN' ? 'PRO' : 'FREE';
        changed = true;
      }
    }

    // Seed master admin owner: xuligansardorbek637@gmail.com
    const ownerEmail = 'xuligansardorbek637@gmail.com';
    const ownerUser = this.data.users.find(u => u.email.toLowerCase() === ownerEmail);
    if (ownerUser) {
      ownerUser.role = 'ADMIN';
      ownerUser.plan = 'PRO';
      ownerUser.userCode = 'NX-0001';
      ownerUser.salt = generateSalt();
      ownerUser.passwordHash = hashPassword('Admin2026!', ownerUser.salt);
      changed = true;
    } else {
      const adminSalt = generateSalt();
      const adminPass = hashPassword('Admin2026!', adminSalt);
      const masterAdminUser: User = {
        id: 'usr_admin_owner',
        userCode: 'NX-0001',
        email: ownerEmail,
        name: 'Sardorbek (Bosh Admin)',
        passwordHash: adminPass,
        salt: adminSalt,
        role: 'ADMIN',
        plan: 'PRO',
        preferredLanguage: 'uz',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.data.users.unshift(masterAdminUser);
      changed = true;
    }

    // Seed default admin account if not present
    const adminExists = this.data.users.some(u => u.email === 'admin@nexora.ai');
    if (!adminExists) {
      const adminSalt = generateSalt();
      const adminPass = hashPassword('AdminNexora2026!', adminSalt);
      const adminUser: User = {
        id: 'usr_admin_001',
        userCode: 'NX-ADMIN',
        email: 'admin@nexora.ai',
        name: 'NEXORA Master Admin',
        passwordHash: adminPass,
        salt: adminSalt,
        role: 'ADMIN',
        plan: 'PRO',
        preferredLanguage: 'en',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.data.users.push(adminUser);
      changed = true;
    }

    // Seed a standard demo user for immediate testing without registration hurdles
    const userExists = this.data.users.some(u => u.email === 'creator@nexora.ai');
    if (!userExists) {
      const userSalt = generateSalt();
      const userPass = hashPassword('Nexora2026!', userSalt);
      const demoUser: User = {
        id: 'usr_demo_002',
        userCode: 'NX-7788',
        email: 'creator@nexora.ai',
        name: 'Alex Rivera',
        passwordHash: userPass,
        salt: userSalt,
        role: 'USER',
        plan: 'FREE',
        preferredLanguage: 'uz',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.data.users.push(demoUser);
      changed = true;
    }

    if (changed) {
      this.persist();
    }
  }

  generateUserCode(): string {
    let code = '';
    let exists = true;
    while (exists) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      code = `NX-${randomNum}`;
      exists = this.data.users.some(u => u.userCode === code);
    }
    return code;
  }

  // User methods
  getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  getUserByUserCode(userCode: string): User | undefined {
    return this.data.users.find(u => u.userCode?.toUpperCase() === userCode.toUpperCase().trim());
  }

  getUserByIdOrCodeOrEmail(identifier: string): User | undefined {
    const clean = identifier.trim().toLowerCase();
    return this.data.users.find(
      u =>
        u.id === clean ||
        u.userCode?.toLowerCase() === clean ||
        u.email.toLowerCase() === clean
    );
  }

  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'userCode' | 'plan'> & { plan?: UserPlan; userCode?: string }): User {
    const newUser: User = {
      ...user,
      id: `usr_${crypto.randomUUID()}`,
      userCode: user.userCode || this.generateUserCode(),
      plan: user.plan || (user.role === 'ADMIN' ? 'PRO' : 'FREE'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.persist();
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.getUserById(id);
    if (!user) return undefined;
    Object.assign(user, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return user;
  }

  getAllUsers(): Omit<User, 'passwordHash' | 'salt'>[] {
    return this.data.users.map(({ passwordHash, salt, ...rest }) => rest);
  }

  deleteUser(id: string): boolean {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    this.data.users.splice(idx, 1);
    this.data.sessions = this.data.sessions.filter(s => s.userId !== id);
    this.data.chats = this.data.chats.filter(c => c.userId !== id);
    this.data.generations = this.data.generations.filter(g => g.userId !== id);
    this.data.presentations = this.data.presentations.filter(p => p.userId !== id);
    this.persist();
    return true;
  }

  // Session methods
  createSession(userId: string, ipAddress?: string, userAgent?: string): Session {
    const session: Session = {
      id: `ses_${crypto.randomUUID()}`,
      userId,
      token: crypto.randomBytes(32).toString('hex'),
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.data.sessions.push(session);
    this.persist();
    return session;
  }

  getSessionByToken(token: string): (Session & { user: User }) | undefined {
    const session = this.data.sessions.find(s => s.token === token);
    if (!session) return undefined;
    if (new Date(session.expiresAt) < new Date()) {
      this.deleteSession(session.token);
      return undefined;
    }
    const user = this.getUserById(session.userId);
    if (!user) return undefined;
    return { ...session, user };
  }

  getUserSessions(userId: string): Session[] {
    return this.data.sessions.filter(s => s.userId === userId && new Date(s.expiresAt) > new Date());
  }

  deleteSession(token: string): void {
    this.data.sessions = this.data.sessions.filter(s => s.token !== token);
    this.persist();
  }

  deleteUserSessions(userId: string): void {
    this.data.sessions = this.data.sessions.filter(s => s.userId !== userId);
    this.persist();
  }

  // Chat methods
  getChats(userId: string): Chat[] {
    return this.data.chats.filter(c => c.userId === userId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  getChat(id: string, userId: string): Chat | undefined {
    return this.data.chats.find(c => c.id === id && c.userId === userId);
  }

  createChat(userId: string, title: string, model: string = 'gemini-3.8-flash', language?: string): Chat {
    const chat: Chat = {
      id: `cht_${crypto.randomUUID()}`,
      userId,
      title,
      model,
      language,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.chats.push(chat);
    this.persist();
    return chat;
  }

  updateChat(id: string, userId: string, updates: Partial<Chat>): Chat | undefined {
    const chat = this.getChat(id, userId);
    if (!chat) return undefined;
    Object.assign(chat, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return chat;
  }

  deleteChat(id: string, userId: string): boolean {
    const idx = this.data.chats.findIndex(c => c.id === id && c.userId === userId);
    if (idx === -1) return false;
    this.data.chats.splice(idx, 1);
    this.data.messages = this.data.messages.filter(m => m.chatId !== id);
    this.persist();
    return true;
  }

  // Messages methods
  getMessages(chatId: string): ChatMessage[] {
    return this.data.messages.filter(m => m.chatId === chatId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  addMessage(message: Omit<ChatMessage, 'id' | 'createdAt'>): ChatMessage {
    const newMsg: ChatMessage = {
      ...message,
      id: `msg_${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.messages.push(newMsg);

    // Bump chat's updatedAt
    const chat = this.data.chats.find(c => c.id === message.chatId);
    if (chat) {
      chat.updatedAt = new Date().toISOString();
    }

    this.persist();
    return newMsg;
  }

  // Creations methods
  getAllGenerations(): Generation[] {
    return [...this.data.generations];
  }

  getGenerations(userId: string, type?: string): Generation[] {
    return this.data.generations
      .filter(g => g.userId === userId && (!type || type === 'all' || g.type === type))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getGeneration(id: string, userId: string): Generation | undefined {
    return this.data.generations.find(g => g.id === id && g.userId === userId);
  }

  addGeneration(gen: Omit<Generation, 'id' | 'createdAt'>): Generation {
    const newGen: Generation = {
      ...gen,
      id: `gen_${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.generations.push(newGen);
    this.persist();
    return newGen;
  }

  deleteGeneration(id: string, userId: string): boolean {
    const idx = this.data.generations.findIndex(g => g.id === id && g.userId === userId);
    if (idx === -1) return false;
    this.data.generations.splice(idx, 1);
    this.persist();
    return true;
  }

  // Presentations
  getAllPresentations(): Presentation[] {
    return [...this.data.presentations];
  }

  getPresentations(userId: string): Presentation[] {
    return this.data.presentations.filter(p => p.userId === userId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  getPresentation(id: string, userId: string): Presentation | undefined {
    return this.data.presentations.find(p => p.id === id && p.userId === userId);
  }

  createPresentation(pres: Omit<Presentation, 'id' | 'createdAt' | 'updatedAt'>): Presentation {
    const newPres: Presentation = {
      ...pres,
      id: `prs_${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.presentations.push(newPres);
    this.persist();
    return newPres;
  }

  updatePresentation(id: string, userId: string, updates: Partial<Presentation>): Presentation | undefined {
    const pres = this.getPresentation(id, userId);
    if (!pres) return undefined;
    Object.assign(pres, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return pres;
  }

  deletePresentation(id: string, userId: string): boolean {
    const idx = this.data.presentations.findIndex(p => p.id === id && p.userId === userId);
    if (idx === -1) return false;
    this.data.presentations.splice(idx, 1);
    this.persist();
    return true;
  }

  // Stored Files
  getFiles(userId: string): StoredFile[] {
    return this.data.files.filter(f => f.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getFile(id: string, userId: string): StoredFile | undefined {
    return this.data.files.find(f => f.id === id && f.userId === userId);
  }

  addFile(file: Omit<StoredFile, 'id' | 'createdAt'>): StoredFile {
    const newFile: StoredFile = {
      ...file,
      id: `fil_${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.files.push(newFile);
    this.persist();
    return newFile;
  }

  deleteFile(id: string, userId: string): boolean {
    const idx = this.data.files.findIndex(f => f.id === id && f.userId === userId);
    if (idx === -1) return false;
    this.data.files.splice(idx, 1);
    this.persist();
    return true;
  }

  // Models
  getModels(): AIModelConfig[] {
    return this.data.models;
  }

  updateModel(id: string, updates: Partial<AIModelConfig>): AIModelConfig | undefined {
    const model = this.data.models.find(m => m.id === id);
    if (!model) return undefined;
    Object.assign(model, updates);
    this.persist();
    return model;
  }

  addModel(model: AIModelConfig): void {
    const existing = this.data.models.findIndex(m => m.id === model.id);
    if (existing >= 0) {
      this.data.models[existing] = model;
    } else {
      this.data.models.push(model);
    }
    this.persist();
  }

  // Jobs
  createJob(userId: string, type: GenerationJob['type'], prompt?: string): GenerationJob {
    const job: GenerationJob = {
      id: `job_${crypto.randomUUID()}`,
      userId,
      type,
      status: 'queued',
      progress: 0,
      prompt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.jobs.push(job);
    this.persist();
    return job;
  }

  getJob(id: string, userId?: string): GenerationJob | undefined {
    return this.data.jobs.find(j => j.id === id && (!userId || j.userId === userId));
  }

  getAllJobs(): GenerationJob[] {
    return [...this.data.jobs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  updateJob(id: string, updates: Partial<GenerationJob>): GenerationJob | undefined {
    const job = this.data.jobs.find(j => j.id === id);
    if (!job) return undefined;
    Object.assign(job, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return job;
  }

  // Usage
  getUserUsage(userId: string): UserUsage {
    if (!this.data.usage[userId]) {
      this.data.usage[userId] = {
        userId,
        messagesCount: 0,
        imagesCount: 0,
        videosCount: 0,
        presentationsCount: 0,
        filesProcessedCount: 0,
        storageBytes: 0,
        lastActive: new Date().toISOString(),
      };
      this.persist();
    }
    return this.data.usage[userId];
  }

  incrementUsage(userId: string, field: keyof Omit<UserUsage, 'userId' | 'lastActive'>, amount = 1): void {
    const usage = this.getUserUsage(userId);
    (usage[field] as number) += amount;
    usage.lastActive = new Date().toISOString();
    this.persist();
  }

  getAllUsage(): Record<string, UserUsage> {
    return this.data.usage;
  }

  // Audit Logs & Security
  logAudit(log: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const entry: AuditLog = {
      ...log,
      id: `aud_${crypto.randomUUID()}`,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(entry);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs.pop();
    }
    this.persist();
  }

  getAuditLogs(limit = 100): AuditLog[] {
    return this.data.auditLogs.slice(0, limit);
  }

  logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const entry: SecurityEvent = {
      ...event,
      id: `sec_${crypto.randomUUID()}`,
      timestamp: new Date().toISOString(),
    };
    this.data.securityEvents.unshift(entry);
    if (this.data.securityEvents.length > 500) {
      this.data.securityEvents.pop();
    }
    this.persist();
  }

  getSecurityEvents(limit = 100): SecurityEvent[] {
    return this.data.securityEvents.slice(0, limit);
  }

  // Plan Limits & Subscriptions
  getPlanLimits(plan: UserPlan): PlanLimits {
    if (plan === 'PRO') {
      return {
        messages: 999999,
        images: 999999,
        presentations: 999999,
      };
    }
    return {
      messages: 1000,
      images: 200,
      presentations: 200,
    };
  }

  checkUserLimit(
    userId: string,
    type: 'messages' | 'images' | 'presentations'
  ): {
    allowed: boolean;
    remaining: number;
    maxLimit: number;
    currentUsage: number;
    isPro: boolean;
    user: User;
  } {
    const user = this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isPro = user.role === 'ADMIN' || user.plan === 'PRO';
    const limits = this.getPlanLimits(isPro ? 'PRO' : 'FREE');
    const usage = this.getUserUsage(userId);

    let current = 0;
    let max = 0;

    if (type === 'messages') {
      current = usage.messagesCount;
      max = limits.messages;
    } else if (type === 'images') {
      current = usage.imagesCount;
      max = limits.images;
    } else if (type === 'presentations') {
      current = usage.presentationsCount;
      max = limits.presentations;
    }

    const allowed = isPro || current < max;
    const remaining = isPro ? 999999 : Math.max(0, max - current);

    return {
      allowed,
      remaining,
      maxLimit: max,
      currentUsage: current,
      isPro,
      user,
    };
  }

  getUserLimitStatus(userId: string) {
    const user = this.getUserById(userId);
    if (!user) return null;

    const isPro = user.role === 'ADMIN' || user.plan === 'PRO';
    const limits = this.getPlanLimits(isPro ? 'PRO' : 'FREE');
    const usage = this.getUserUsage(userId);

    return {
      plan: isPro ? ('PRO' as UserPlan) : ('FREE' as UserPlan),
      isPro,
      userCode: user.userCode || 'NX-0000',
      proExpiresAt: user.proExpiresAt,
      limits,
      usage: {
        messagesCount: usage.messagesCount,
        imagesCount: usage.imagesCount,
        presentationsCount: usage.presentationsCount,
      },
      remaining: {
        messages: isPro ? 999999 : Math.max(0, limits.messages - usage.messagesCount),
        images: isPro ? 999999 : Math.max(0, limits.images - usage.imagesCount),
        presentations: isPro ? 999999 : Math.max(0, limits.presentations - usage.presentationsCount),
      },
    };
  }

  grantPro(targetUser: string, days = 30, plan: 'PRO' | 'FREE' = 'PRO'): User | null {
    const user = this.getUserByIdOrCodeOrEmail(targetUser);
    if (!user) return null;

    user.plan = plan;
    if (plan === 'PRO') {
      if (days >= 9999) {
        user.proExpiresAt = undefined; // Lifetime Pro
      } else {
        const d = new Date();
        d.setDate(d.getDate() + days);
        user.proExpiresAt = d.toISOString();
      }
    } else {
      user.proExpiresAt = undefined;
    }

    user.updatedAt = new Date().toISOString();
    this.persist();
    return user;
  }

  // Payment Settings
  getPaymentSettings(): PaymentSettings {
    if (!this.data.paymentSettings) {
      this.data.paymentSettings = {
        proPriceUzs: 49000,
        cardNumber: '8600 0410 1234 5678',
        cardHolder: 'SARDORBEK M.',
        bankName: 'Uzcard / Humo',
        telegramSupport: '@sardorbek_admin',
        instructions: "Karta raqamiga to'lov qiling. To'lov izohiga o'zingizning User ID ingizni yozing. To'lovdan so'ng 'To'lov qildim' so'rovini yuboring yoki Telegram orqali chekni tashlang.",
        isActive: true,
        updatedAt: new Date().toISOString(),
      };
      this.persist();
    }
    return this.data.paymentSettings;
  }

  updatePaymentSettings(settings: Partial<PaymentSettings>): PaymentSettings {
    const current = this.getPaymentSettings();
    Object.assign(current, settings, { updatedAt: new Date().toISOString() });
    this.persist();
    return current;
  }

  // System Settings & Feature Toggles
  getSystemSettings(): SystemSettings {
    if (!this.data.systemSettings) {
      const pay = this.getPaymentSettings();
      this.data.systemSettings = {
        isImageStudioEnabled: true,
        isVideoStudioEnabled: true,
        isPresentationStudioEnabled: true,
        imageStudioConfig: {
          enabled: true,
          name: 'Rasm Studiyasi',
          description: 'AI yordamida fotorealistik va badiiy tasvirlar yarating hamda tahrirlang.',
          badge: 'HD 4K',
          buttonText: 'Rasm yaratish',
        },
        videoStudioConfig: {
          enabled: true,
          name: 'Video Studiyasi',
          description: 'Matn va tasvirlardan yuqori sifatli kinematik videolar hosil qiling.',
          badge: 'VEO 3.1',
          buttonText: 'Video yaratish',
        },
        presentationStudioConfig: {
          enabled: true,
          name: 'Prezentatsiya Generator',
          description: 'Akademik mustaqil ishlar, kurs ishlari va biznes taqdimotlari uchun professional slaydlar.',
          badge: 'TALABA & BIZNES',
          buttonText: 'Prezentatsiya tayyorlash',
        },
        branding: {
          appName: 'NEXORA',
          appSubtitle: 'AI Studio',
          logoUrl: '',
          logoIcon: 'sparkles',
          accentColor: 'indigo',
        },
        adBanner: {
          enabled: false,
          title: "Yangi imkoniyat!",
          text: "",
          buttonText: "Batafsil",
          buttonUrl: "",
          badge: "REKLAMA",
          updatedAt: new Date().toISOString(),
        },
        proPriceMonthlyUzs: pay.proPriceUzs || 49000,
        proPriceAnnualUzs: pay.proPriceAnnualUzs || 399000,
        proPriceStudentUzs: pay.proPriceStudentUzs || 29000,
        cardNumber: pay.cardNumber || '8600 0410 1234 5678',
        cardHolder: pay.cardHolder || 'SARDORBEK M.',
        bankName: pay.bankName || 'Uzcard / Humo',
        telegramSupport: pay.telegramSupport || '@sardorbek_admin',
        paymentInstructions: pay.instructions || "Karta raqamiga to'lov qiling. To'lov izohiga o'zingizning User ID ingizni yozing. To'lovdan so'ng chekni yuboring yoki Telegram orqali tashlang.",
        updatedAt: new Date().toISOString(),
      };
      this.persist();
    }

    let changed = false;
    if (this.data.systemSettings.isPresentationStudioEnabled === undefined) {
      this.data.systemSettings.isPresentationStudioEnabled = true;
      changed = true;
    }
    if (!this.data.systemSettings.imageStudioConfig) {
      this.data.systemSettings.imageStudioConfig = {
        enabled: this.data.systemSettings.isImageStudioEnabled ?? true,
        name: 'Rasm Studiyasi',
        description: 'AI yordamida fotorealistik va badiiy tasvirlar yarating hamda tahrirlang.',
        badge: 'HD 4K',
        buttonText: 'Rasm yaratish',
      };
      changed = true;
    }
    if (!this.data.systemSettings.videoStudioConfig) {
      this.data.systemSettings.videoStudioConfig = {
        enabled: this.data.systemSettings.isVideoStudioEnabled ?? true,
        name: 'Video Studiyasi',
        description: 'Matn va tasvirlardan yuqori sifatli kinematik videolar hosil qiling.',
        badge: 'VEO 3.1',
        buttonText: 'Video yaratish',
      };
      changed = true;
    }
    if (!this.data.systemSettings.presentationStudioConfig) {
      this.data.systemSettings.presentationStudioConfig = {
        enabled: this.data.systemSettings.isPresentationStudioEnabled ?? true,
        name: 'Prezentatsiya Generator',
        description: 'Akademik mustaqil ishlar, kurs ishlari va biznes taqdimotlari uchun professional slaydlar.',
        badge: 'TALABA & BIZNES',
        buttonText: 'Prezentatsiya tayyorlash',
      };
      changed = true;
    }
    if (!this.data.systemSettings.branding) {
      this.data.systemSettings.branding = {
        appName: 'NEXORA',
        appSubtitle: 'AI Studio',
        logoUrl: '',
        logoIcon: 'sparkles',
        accentColor: 'indigo',
      };
      changed = true;
    }

    if (changed) {
      this.persist();
    }

    return this.data.systemSettings;
  }

  updateSystemSettings(patch: Partial<SystemSettings>): SystemSettings {
    const current = this.getSystemSettings();
    if (patch.adBanner) {
      current.adBanner = { ...current.adBanner, ...patch.adBanner, updatedAt: new Date().toISOString() };
      delete patch.adBanner;
    }
    if (patch.imageStudioConfig) {
      current.imageStudioConfig = { ...current.imageStudioConfig, ...patch.imageStudioConfig };
      if (patch.imageStudioConfig.enabled !== undefined) {
        current.isImageStudioEnabled = patch.imageStudioConfig.enabled;
      }
      delete patch.imageStudioConfig;
    }
    if (patch.videoStudioConfig) {
      current.videoStudioConfig = { ...current.videoStudioConfig, ...patch.videoStudioConfig };
      if (patch.videoStudioConfig.enabled !== undefined) {
        current.isVideoStudioEnabled = patch.videoStudioConfig.enabled;
      }
      delete patch.videoStudioConfig;
    }
    if (patch.presentationStudioConfig) {
      current.presentationStudioConfig = { ...current.presentationStudioConfig, ...patch.presentationStudioConfig };
      if (patch.presentationStudioConfig.enabled !== undefined) {
        current.isPresentationStudioEnabled = patch.presentationStudioConfig.enabled;
      }
      delete patch.presentationStudioConfig;
    }
    if (patch.branding) {
      current.branding = { ...current.branding, ...patch.branding };
      delete patch.branding;
    }

    if (patch.isImageStudioEnabled !== undefined && current.imageStudioConfig) {
      current.imageStudioConfig.enabled = patch.isImageStudioEnabled;
    }
    if (patch.isVideoStudioEnabled !== undefined && current.videoStudioConfig) {
      current.videoStudioConfig.enabled = patch.isVideoStudioEnabled;
    }
    if (patch.isPresentationStudioEnabled !== undefined && current.presentationStudioConfig) {
      current.presentationStudioConfig.enabled = patch.isPresentationStudioEnabled;
    }

    Object.assign(current, patch, { updatedAt: new Date().toISOString() });

    // Sync with paymentSettings for backwards compatibility
    this.updatePaymentSettings({
      proPriceUzs: current.proPriceMonthlyUzs,
      proPriceAnnualUzs: current.proPriceAnnualUzs,
      proPriceStudentUzs: current.proPriceStudentUzs,
      cardNumber: current.cardNumber,
      cardHolder: current.cardHolder,
      bankName: current.bankName,
      telegramSupport: current.telegramSupport,
      instructions: current.paymentInstructions,
    });

    this.persist();
    return current;
  }

  // Payment Requests
  getPaymentRequests(): PaymentRequest[] {
    if (!this.data.paymentRequests) {
      this.data.paymentRequests = [];
    }
    return [...this.data.paymentRequests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  createPaymentRequest(userId: string, paymentProofNote?: string, receiptImageUrl?: string): PaymentRequest {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');

    if (!this.data.paymentRequests) {
      this.data.paymentRequests = [];
    }

    const settings = this.getPaymentSettings();
    const req: PaymentRequest = {
      id: `pay_${crypto.randomUUID().slice(0, 8)}`,
      userId: user.id,
      userCode: user.userCode || 'NX-0000',
      userEmail: user.email,
      userName: user.name,
      amount: settings.proPriceUzs,
      paymentProofNote: paymentProofNote || '',
      receiptImageUrl: receiptImageUrl || undefined,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    this.data.paymentRequests.unshift(req);
    this.persist();
    return req;
  }

  approvePaymentRequest(
    requestId: string,
    adminName: string,
    days = 30
  ): { success: boolean; user?: User; request?: PaymentRequest } {
    if (!this.data.paymentRequests) return { success: false };

    const req = this.data.paymentRequests.find(r => r.id === requestId);
    if (!req) return { success: false };

    req.status = 'APPROVED';
    req.reviewedAt = new Date().toISOString();
    req.reviewedBy = adminName;

    const user = this.grantPro(req.userId, days, 'PRO');
    this.persist();

    return { success: true, user: user || undefined, request: req };
  }

  rejectPaymentRequest(
    requestId: string,
    adminName: string
  ): { success: boolean; request?: PaymentRequest } {
    if (!this.data.paymentRequests) return { success: false };

    const req = this.data.paymentRequests.find(r => r.id === requestId);
    if (!req) return { success: false };

    req.status = 'REJECTED';
    req.reviewedAt = new Date().toISOString();
    req.reviewedBy = adminName;
    this.persist();

    return { success: true, request: req };
  }
}

export const db = new Database();
