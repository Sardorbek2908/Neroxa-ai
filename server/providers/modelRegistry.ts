import { db } from '../database/db';
import { AIModelConfig } from '../database/types';
import { AIProvider } from './aiProvider';
import { geminiProvider } from './geminiProvider';

class ModelRegistry {
  private providers: Map<string, AIProvider> = new Map();

  constructor() {
    this.registerProvider('gemini', geminiProvider);
    this.registerProvider('veo', geminiProvider);
    this.registerProvider('imagen', geminiProvider);
  }

  registerProvider(id: string, provider: AIProvider): void {
    this.providers.set(id, provider);
  }

  getProvider(providerId: string): AIProvider {
    const p = this.providers.get(providerId);
    if (!p) {
      // Default to gemini provider
      return geminiProvider;
    }
    return p;
  }

  getModels(): AIModelConfig[] {
    return db.getModels();
  }

  getModel(modelId: string): AIModelConfig | undefined {
    return db.getModels().find(m => m.id === modelId);
  }

  getProviderForModel(modelId: string): AIProvider {
    const model = this.getModel(modelId);
    const providerKey = model?.provider || 'gemini';
    return this.getProvider(providerKey);
  }
}

export const modelRegistry = new ModelRegistry();
