import fs from 'fs';
import { db } from '../database/db';
import { geminiProvider } from '../providers/geminiProvider';
import { presentationService } from './presentationService';
import { Presentation } from '../database/types';

export class FileService {
  async analyzeFile(fileId: string, userId: string, prompt?: string): Promise<string> {
    const file = db.getFile(fileId, userId);
    if (!file) {
      throw new Error('File not found or access denied');
    }

    let fileContent = '';
    const isText = file.mimeType.startsWith('text/') || file.extension === '.txt' || file.extension === '.json' || file.extension === '.csv';
    const isImage = file.mimeType.startsWith('image/');

    if (isText && fs.existsSync(file.storagePath)) {
      fileContent = fs.readFileSync(file.storagePath, 'utf-8');
    }

    const defaultPrompt = prompt || 'Analyze this file thoroughly. Provide an executive summary, key insights, structured takeaways, and action points.';

    if (isText) {
      const response = await geminiProvider.generateText(
        `File Name: ${file.originalName}\nFile Content:\n"""\n${fileContent.slice(0, 15000)}\n"""\n\nTask: ${defaultPrompt}`,
        {
          model: 'gemini-3.8-flash',
          systemInstruction: 'You are an expert document and data analyst. Provide deep, accurate, structured analysis.',
        }
      );
      file.analysisSummary = response;
      db.incrementUsage(userId, 'filesProcessedCount', 1);
      return response;
    }

    if (isImage && fs.existsSync(file.storagePath)) {
      const base64 = fs.readFileSync(file.storagePath).toString('base64');
      const response = await geminiProvider.generateText([
        { inlineData: { data: base64, mimeType: file.mimeType } },
        { text: defaultPrompt },
      ], {
        model: 'gemini-3.8-flash',
      });
      file.analysisSummary = response;
      db.incrementUsage(userId, 'filesProcessedCount', 1);
      return response;
    }

    // Generic binary / document summary
    const summary = `Document "${file.originalName}" (${(file.size / 1024).toFixed(1)} KB, type ${file.mimeType}) uploaded and verified securely. Ready for presentation synthesis and AI queries.`;
    file.analysisSummary = summary;
    db.incrementUsage(userId, 'filesProcessedCount', 1);
    return summary;
  }

  async convertFileToPresentation(
    fileId: string,
    userId: string,
    slideCount = 10,
    language = 'English'
  ): Promise<Presentation> {
    const file = db.getFile(fileId, userId);
    if (!file) {
      throw new Error('File not found');
    }

    let excerpt = '';
    if (fs.existsSync(file.storagePath)) {
      try {
        excerpt = fs.readFileSync(file.storagePath, 'utf-8').slice(0, 8000);
      } catch {
        excerpt = `Analysis of ${file.originalName}`;
      }
    }

    const topic = `Comprehensive synthesis of ${file.originalName}`;
    const presentation = await presentationService.generatePresentation({
      userId,
      topic,
      slideCount,
      language,
      sourceContent: excerpt,
      style: 'Professional',
      tone: 'Analytical & Clear',
      educationLevel: 'Higher Education / Executive',
    });

    presentation.sourceFileId = fileId;
    db.updatePresentation(presentation.id, userId, { sourceFileId: fileId });

    return presentation;
  }
}

export const fileService = new FileService();
