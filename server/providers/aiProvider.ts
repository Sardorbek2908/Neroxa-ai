export interface GenerateTextOptions {
  model?: string;
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  responseMimeType?: string;
  responseSchema?: any;
}

export interface GenerateImageOptions {
  model?: string;
  prompt: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '1:4' | '4:1';
  imageSize?: '512px' | '1K' | '2K' | '4K';
  referenceImageBase64?: string;
  referenceMimeType?: string;
}

export interface EditImageOptions {
  model?: string;
  prompt: string;
  imageBase64: string;
  mimeType: string;
}

export interface GenerateVideoOptions {
  model?: string;
  prompt: string;
  aspectRatio?: '16:9' | '9:16';
  resolution?: '720p' | '1080p';
  durationSeconds?: number;
  imageBase64?: string;
  mimeType?: string;
}

export interface AIProvider {
  name: string;
  generateText(prompt: string | any[], options?: GenerateTextOptions): Promise<string>;
  generateTextStream(prompt: string | any[], options?: GenerateTextOptions, onChunk?: (chunk: string) => void): Promise<string>;
  generateImage(options: GenerateImageOptions): Promise<{ base64: string; mimeType: string }>;
  editImage(options: EditImageOptions): Promise<{ base64: string; mimeType: string }>;
  generateVideo(options: GenerateVideoOptions): Promise<{ operationName: string }>;
  checkVideoStatus(operationName: string): Promise<{ done: boolean; videoUrl?: string; error?: string }>;
}
