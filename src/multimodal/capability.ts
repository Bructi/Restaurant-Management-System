import { ModelCapability, MultimodalModelSpec, ProviderFormat } from './types';

export const KNOWN_MODELS_REGISTRY: Record<string, MultimodalModelSpec> = {
  // Google Gemini
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    provider: 'gemini',
    capability: 'VISION_REASONING',
    supportedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    supportsMultiImage: true,
    maxPayloadMb: 20,
  },
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    provider: 'gemini',
    capability: 'VISION',
    supportedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    supportsMultiImage: true,
    maxPayloadMb: 20,
  },
  'gemini-2.0-flash': {
    id: 'gemini-2.0-flash',
    provider: 'gemini',
    capability: 'VISION_REASONING',
    supportedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    supportsMultiImage: true,
    maxPayloadMb: 20,
  },
  'gemini-3.7-flash': {
    id: 'gemini-3.7-flash',
    provider: 'gemini',
    capability: 'VISION_REASONING',
    supportedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    supportsMultiImage: true,
    maxPayloadMb: 20,
  },
  'omniroute/agy/gemini-3.7-flash-high': {
    id: 'omniroute/agy/gemini-3.7-flash-high',
    provider: 'openrouter',
    capability: 'VISION_REASONING',
    supportedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    supportsMultiImage: true,
    maxPayloadMb: 20,
  },

  // OpenAI
  'gpt-4o': {
    id: 'gpt-4o',
    provider: 'openai',
    capability: 'VISION_REASONING',
    supportedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    supportsMultiImage: true,
    maxPayloadMb: 20,
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    provider: 'openai',
    capability: 'VISION',
    supportedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    supportsMultiImage: true,
    maxPayloadMb: 20,
  },
  'o1': {
    id: 'o1',
    provider: 'openai',
    capability: 'VISION_REASONING',
    supportedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    supportsMultiImage: true,
    maxPayloadMb: 20,
  },

  // Anthropic Claude
  'claude-3-5-sonnet-20241022': {
    id: 'claude-3-5-sonnet-20241022',
    provider: 'anthropic',
    capability: 'VISION_REASONING',
    supportedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    supportsMultiImage: true,
    maxPayloadMb: 20,
  },
  'claude-3-opus-20240229': {
    id: 'claude-3-opus-20240229',
    provider: 'anthropic',
    capability: 'VISION_REASONING',
    supportedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    supportsMultiImage: true,
    maxPayloadMb: 20,
  },
  'claude-3-haiku-20240307': {
    id: 'claude-3-haiku-20240307',
    provider: 'anthropic',
    capability: 'VISION',
    supportedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    supportsMultiImage: true,
    maxPayloadMb: 20,
  },

  // Known Text-Only Models
  'gpt-3.5-turbo': {
    id: 'gpt-3.5-turbo',
    provider: 'openai',
    capability: 'TEXT_ONLY',
    supportedMimeTypes: [],
    supportsMultiImage: false,
  },
  'llama-3.1-8b': {
    id: 'llama-3.1-8b',
    provider: 'openrouter',
    capability: 'TEXT_ONLY',
    supportedMimeTypes: [],
    supportsMultiImage: false,
  },
  'deepseek-chat': {
    id: 'deepseek-chat',
    provider: 'openrouter',
    capability: 'TEXT_ONLY',
    supportedMimeTypes: [],
    supportsMultiImage: false,
  },
};

/**
 * Detects model capability from model ID string
 */
export function detectModelCapability(modelId: string): {
  capability: ModelCapability;
  supportsVision: boolean;
  provider: ProviderFormat;
} {
  const cleanId = modelId.toLowerCase();

  // 1. Direct registry lookup
  if (KNOWN_MODELS_REGISTRY[modelId]) {
    const spec = KNOWN_MODELS_REGISTRY[modelId];
    return {
      capability: spec.capability,
      supportsVision: spec.capability !== 'TEXT_ONLY',
      provider: spec.provider,
    };
  }

  // 2. Pattern matching heuristics
  if (
    cleanId.includes('gpt-4o') ||
    cleanId.includes('gemini-1.5') ||
    cleanId.includes('gemini-2.0') ||
    cleanId.includes('gemini-3.7') ||
    cleanId.includes('claude-3-5') ||
    cleanId.includes('claude-3-opus') ||
    cleanId.includes('vision') ||
    cleanId.includes('vl-') ||
    cleanId.includes('pixtral') ||
    cleanId.includes('llava')
  ) {
    const provider: ProviderFormat = cleanId.includes('claude')
      ? 'anthropic'
      : cleanId.includes('gemini')
      ? 'gemini'
      : cleanId.includes('omniroute') || cleanId.includes('openrouter')
      ? 'openrouter'
      : 'openai';

    return {
      capability: 'VISION_REASONING',
      supportsVision: true,
      provider,
    };
  }

  if (cleanId.includes('claude-3-haiku') || cleanId.includes('flash-lite')) {
    return {
      capability: 'VISION',
      supportsVision: true,
      provider: cleanId.includes('claude') ? 'anthropic' : 'gemini',
    };
  }

  // Default assumption for unknown models without vision keywords
  return {
    capability: 'TEXT_ONLY',
    supportsVision: false,
    provider: cleanId.includes('claude')
      ? 'anthropic'
      : cleanId.includes('gemini')
      ? 'gemini'
      : 'openai',
  };
}

/**
 * Resolves a suitable vision fallback model if the current model is TEXT_ONLY
 */
export function resolveVisionFallbackModel(currentModel: string, preferredProvider?: ProviderFormat): string {
  const { supportsVision } = detectModelCapability(currentModel);
  if (supportsVision) return currentModel;

  if (preferredProvider === 'anthropic') {
    return 'claude-3-5-sonnet-20241022';
  }
  if (preferredProvider === 'gemini') {
    return 'gemini-1.5-pro';
  }
  if (preferredProvider === 'openrouter') {
    return 'omniroute/agy/gemini-3.7-flash-high';
  }
  return 'gpt-4o';
}
