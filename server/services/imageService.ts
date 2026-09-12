import { db } from '../database/db';
import { geminiProvider } from '../providers/geminiProvider';
import { Generation } from '../database/types';

export interface GenerateImageRequest {
  userId: string;
  prompt: string;
  model?: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  resolution?: '512px' | '1K' | '2K';
  style?: string;
  referenceImageBase64?: string;
  referenceMimeType?: string;
}

export interface EditImageRequest {
  userId: string;
  prompt: string;
  model?: string;
  imageBase64: string;
  mimeType: string;
}

export class ImageService {
  async generateImage(req: GenerateImageRequest): Promise<Generation> {
    const styleModifier = req.style && req.style !== 'None' ? `, ${req.style} style, high aesthetic fidelity` : '';
    const fullPrompt = `${req.prompt}${styleModifier}`;

    const modelToUse = req.model || (req.resolution === '2K' || req.resolution === '1K'
      ? 'gemini-3.1-flash-image'
      : 'gemini-3.1-flash-lite-image');

    const result = await geminiProvider.generateImage({
      model: modelToUse,
      prompt: fullPrompt,
      aspectRatio: req.aspectRatio || '1:1',
      referenceImageBase64: req.referenceImageBase64,
      referenceMimeType: req.referenceMimeType,
    });

    const outputUrl = `data:${result.mimeType};base64,${result.base64}`;

    const generation = db.addGeneration({
      userId: req.userId,
      type: 'image',
      title: req.prompt.slice(0, 50),
      prompt: req.prompt,
      model: modelToUse,
      aspectRatio: req.aspectRatio || '1:1',
      outputUrl,
      parameters: {
        style: req.style,
        resolution: req.resolution,
      },
    });

    db.incrementUsage(req.userId, 'imagesCount', 1);

    return generation;
  }

  async editImage(req: EditImageRequest): Promise<Generation> {
    const result = await geminiProvider.editImage({
      model: req.model || 'gemini-3.1-flash-lite-image',
      prompt: req.prompt,
      imageBase64: req.imageBase64,
      mimeType: req.mimeType,
    });

    const outputUrl = `data:${result.mimeType};base64,${result.base64}`;

    const generation = db.addGeneration({
      userId: req.userId,
      type: 'edited_image',
      title: `Edit: ${req.prompt.slice(0, 45)}`,
      prompt: req.prompt,
      model: req.model || 'gemini-3.1-flash-lite-image',
      outputUrl,
      metadata: {
        originalMime: req.mimeType,
      },
    });

    db.incrementUsage(req.userId, 'imagesCount', 1);

    return generation;
  }
}

export const imageService = new ImageService();
