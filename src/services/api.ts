import {
  User,
  UserUsage,
  Chat,
  ChatMessage,
  Generation,
  Presentation,
  PresentationSlide,
  StudentInfo,
  AIModelConfig,
  GenerationJob,
  StoredFile,
  SecurityEvent,
  AuditLog,
  PaymentSettings,
  PaymentRequest,
  UsageLimitStatus,
  SystemSettings
} from '../types';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('nexora_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('nexora_token', token);
    } else {
      localStorage.removeItem('nexora_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errData: any = {};
      try {
        errData = await response.json();
      } catch {
        errData = { message: response.statusText };
      }
      throw new Error(errData.message || 'Server request failed');
    }

    return response.json();
  }

  // Auth
  async getCurrentUser(): Promise<{ user: User | null; usage?: UserUsage }> {
    return this.request('/api/me');
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await this.request<{ user: User; token: string }>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.token);
    return res;
  }

  async register(data: { email: string; password: string; name: string; preferredLanguage?: string }): Promise<{ user: User; token: string }> {
    const res = await this.request<{ user: User; token: string }>('/api/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.token);
    return res;
  }

  async adminLogin(data: { email: string; password: string }): Promise<{ user: User; token: string }> {
    const res = await this.request<{ user: User; token: string }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.token);
    return res;
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; recoveryCode?: string; masterAdminCode?: string }> {
    return this.request('/api/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(data: { email: string; recoveryCode: string; newPassword: string }): Promise<{ success: boolean; message: string; user?: User; token?: string }> {
    const res = await this.request<{ success: boolean; message: string; user?: User; token?: string }>('/api/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return this.request('/api/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async getSessions(): Promise<{ sessions: any[] }> {
    return this.request('/api/sessions');
  }

  // Chats
  async getChats(): Promise<{ chats: Chat[] }> {
    return this.request('/api/chats');
  }

  async createChat(title?: string, model?: string, language?: string): Promise<{ chat: Chat }> {
    return this.request('/api/chats', {
      method: 'POST',
      body: JSON.stringify({ title, model, language }),
    });
  }

  async getChat(chatId: string): Promise<{ chat: Chat; messages: ChatMessage[] }> {
    return this.request(`/api/chats/${chatId}`);
  }

  async updateChat(chatId: string, title: string): Promise<{ chat: Chat }> {
    return this.request(`/api/chats/${chatId}`, {
      method: 'PUT',
      body: JSON.stringify({ title }),
    });
  }

  async deleteChat(chatId: string): Promise<{ success: boolean }> {
    return this.request(`/api/chats/${chatId}`, { method: 'DELETE' });
  }

  async sendMessage(data: {
    chatId?: string;
    message: string;
    model?: string;
    attachments?: any[];
  }): Promise<{
    chat: Chat;
    userMessage: ChatMessage;
    message: ChatMessage;
    classification: any;
  }> {
    return this.request('/api/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Images
  async generateImage(data: {
    prompt: string;
    model?: string;
    aspectRatio?: string;
    resolution?: string;
    style?: string;
    referenceImageBase64?: string;
    referenceMimeType?: string;
  }): Promise<{ generation: Generation }> {
    return this.request('/api/generate/image', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async editImage(data: {
    prompt: string;
    imageBase64: string;
    mimeType?: string;
    model?: string;
  }): Promise<{ generation: Generation }> {
    return this.request('/api/edit/image', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Video
  async generateVideo(data: {
    prompt: string;
    model?: string;
    duration?: number;
    aspectRatio?: string;
    resolution?: string;
    imageBase64?: string;
    mimeType?: string;
  }): Promise<{ jobId: string; job: GenerationJob }> {
    return this.request('/api/generate/video', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getJob(jobId: string): Promise<{ job: GenerationJob }> {
    return this.request(`/api/jobs/${jobId}`);
  }

  // Presentations
  async generatePresentation(options: {
    topic: string;
    slideCount?: number;
    language?: string;
    audience?: string;
    educationLevel?: string;
    style?: string;
    tone?: string;
    theme?: string;
    aspectRatio?: '16:9' | '4:3';
    includeImages?: boolean;
    includeCharts?: boolean;
    includeSpeakerNotes?: boolean;
    sourceContent?: string;
    studentInfo?: StudentInfo;
  }): Promise<{ presentation: Presentation }> {
    return this.request('/api/presentations/generate', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  async updateSlideImage(
    presentationId: string,
    slideId: string,
    data: { imageUrl?: string; prompt?: string }
  ): Promise<{ slide: PresentationSlide }> {
    return this.request(`/api/presentations/${presentationId}/slides/${slideId}/image`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPresentations(): Promise<{ presentations: Presentation[] }> {
    return this.request('/api/presentations');
  }

  async getPresentation(id: string): Promise<{ presentation: Presentation }> {
    return this.request(`/api/presentations/${id}`);
  }

  async updatePresentation(id: string, data: Partial<Presentation>): Promise<{ presentation: Presentation }> {
    return this.request(`/api/presentations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePresentation(id: string): Promise<{ success: boolean }> {
    return this.request(`/api/presentations/${id}`, { method: 'DELETE' });
  }

  async regenerateSlide(
    presentationId: string,
    slideId: string,
    action: string,
    customInstruction?: string
  ): Promise<{ slide: PresentationSlide }> {
    return this.request(`/api/presentations/${presentationId}/regenerate-slide`, {
      method: 'POST',
      body: JSON.stringify({ slideId, action, customInstruction }),
    });
  }

  async exportPptx(presentationId: string, filename: string): Promise<void> {
    const headers: Record<string, string> = {};
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const cleanFilename = filename.endsWith('.pptx') ? filename : `${filename}.pptx`;
    const token = this.token || '';
    const directDownloadUrl = `/api/presentations/${presentationId}/export/pptx-download?token=${encodeURIComponent(token)}`;

    // Detect iOS / iPhone / iPad Safari or mobile WebKit
    const isIOS = typeof navigator !== 'undefined' && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

    if (isIOS) {
      // Trigger native mobile browser file download directly
      const a = document.createElement('a');
      a.href = directDownloadUrl;
      a.download = cleanFilename;
      a.target = '_self';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
      }, 4000);
      return;
    }

    const res = await fetch(`/api/presentations/${presentationId}/export/pptx`, {
      method: 'POST',
      headers,
    });

    if (!res.ok) {
      // Fallback to direct download URL
      window.location.href = directDownloadUrl;
      return;
    }

    const rawBlob = await res.blob();
    const pptxBlob = new Blob([rawBlob], {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    });
    const url = window.URL.createObjectURL(pptxBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = cleanFilename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 20000);
  }

  getPdfExportUrl(presentationId: string): string {
    return `/api/presentations/${presentationId}/export/pdf`;
  }

  // Files
  async uploadFile(file: File): Promise<{ file: StoredFile }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.request('/api/files/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async getFiles(): Promise<{ files: StoredFile[] }> {
    return this.request('/api/files');
  }

  async analyzeFile(fileId: string, prompt?: string): Promise<{ analysis: string }> {
    return this.request(`/api/files/${fileId}/analyze`, {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }

  async convertFileToPresentation(fileId: string, slideCount?: number, language?: string): Promise<{ presentation: Presentation }> {
    return this.request(`/api/files/${fileId}/to-presentation`, {
      method: 'POST',
      body: JSON.stringify({ slideCount, language }),
    });
  }

  async deleteFile(fileId: string): Promise<{ success: boolean }> {
    return this.request(`/api/files/${fileId}`, { method: 'DELETE' });
  }

  // Creations
  async getCreations(type?: string): Promise<{ creations: Generation[] }> {
    const q = type ? `?type=${type}` : '';
    return this.request(`/api/creations${q}`);
  }

  async deleteCreation(id: string): Promise<{ success: boolean }> {
    return this.request(`/api/creations/${id}`, { method: 'DELETE' });
  }

  // Models
  async getModels(): Promise<{ models: AIModelConfig[] }> {
    return this.request('/api/models');
  }

  // Admin
  async getAdminStats(): Promise<{ stats: any }> {
    return this.request('/api/admin/stats');
  }

  async getAdminUsers(): Promise<{ users: User[] }> {
    return this.request('/api/admin/users');
  }

  async updateAdminUser(id: string, data: { role?: 'USER' | 'ADMIN' }): Promise<{ user: User }> {
    return this.request(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminUser(id: string): Promise<{ success: boolean }> {
    return this.request(`/api/admin/users/${id}`, { method: 'DELETE' });
  }

  async getAdminUsage(): Promise<{ usage: Record<string, UserUsage> }> {
    return this.request('/api/admin/usage');
  }

  async getAdminJobs(): Promise<{ jobs: GenerationJob[] }> {
    return this.request('/api/admin/jobs');
  }

  async getAdminSecurityEvents(): Promise<{ events: SecurityEvent[] }> {
    return this.request('/api/admin/security-events');
  }

  async getAdminAuditLogs(): Promise<{ logs: AuditLog[] }> {
    return this.request('/api/admin/audit-logs');
  }

  async updateAdminModel(id: string, data: Partial<AIModelConfig>): Promise<{ model: AIModelConfig }> {
    return this.request(`/api/admin/models/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // System Config (Feature toggles, ad banner, support telegram, branding, studio configs)
  async getSystemConfig(): Promise<{
    success?: boolean;
    config?: SystemSettings;
    isImageStudioEnabled?: boolean;
    isVideoStudioEnabled?: boolean;
    isPresentationStudioEnabled?: boolean;
    imageStudioConfig?: any;
    videoStudioConfig?: any;
    presentationStudioConfig?: any;
    branding?: any;
    adBanner?: any;
    paymentSettings?: any;
  }> {
    return this.request('/api/system/config');
  }

  // Subscription & PRO
  async getPaymentSettings(): Promise<{ settings: PaymentSettings }> {
    return this.request('/api/subscription/settings');
  }

  async getMyLimits(): Promise<UsageLimitStatus> {
    return this.request('/api/subscription/my-limits');
  }

  async requestPro(note?: string, receiptImage?: string): Promise<{ success: boolean; message: string; request: PaymentRequest }> {
    return this.request('/api/subscription/request-pro', {
      method: 'POST',
      body: JSON.stringify({ note, receiptImage }),
    });
  }

  // Admin System Settings (Image studio, Video studio toggles, Ad banner, Prices)
  async getAdminSystemSettings(): Promise<{ success: boolean; settings: SystemSettings }> {
    return this.request('/api/admin/system-settings');
  }

  async updateAdminSystemSettings(data: Partial<SystemSettings>): Promise<{ success: boolean; settings: SystemSettings }> {
    return this.request('/api/admin/system-settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Admin Subscription Management
  async getAdminPaymentSettings(): Promise<{ settings: PaymentSettings }> {
    return this.request('/api/admin/subscription/settings');
  }

  async updateAdminPaymentSettings(data: Partial<PaymentSettings>): Promise<{ success: boolean; settings: PaymentSettings }> {
    return this.request('/api/admin/subscription/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async grantProToUser(identifier: string, days = 30, plan: 'PRO' | 'FREE' = 'PRO'): Promise<{ success: boolean; message: string; user: any }> {
    return this.request('/api/admin/subscription/grant-pro', {
      method: 'POST',
      body: JSON.stringify({ identifier, days, plan }),
    });
  }

  async getAdminPaymentRequests(): Promise<{ requests: PaymentRequest[] }> {
    return this.request('/api/admin/subscription/requests');
  }

  async approvePaymentRequest(id: string, days = 30): Promise<{ success: boolean; request: PaymentRequest; user: any }> {
    return this.request(`/api/admin/subscription/requests/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ days }),
    });
  }

  async rejectPaymentRequest(id: string): Promise<{ success: boolean; request: PaymentRequest }> {
    return this.request(`/api/admin/subscription/requests/${id}/reject`, {
      method: 'POST',
    });
  }

  async getAdminSubscriptionUsers(): Promise<{ users: any[] }> {
    return this.request('/api/admin/subscription/users');
  }
}

export const api = new ApiClient();
