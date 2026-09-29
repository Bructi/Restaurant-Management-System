import { PreprocessedImage, ProviderFormat, MultimodalMessage } from './types';

export interface FormattedProviderPayload {
  provider: ProviderFormat;
  payload: any;
  imageCount: number;
}

/**
 * Formats multimodal prompt & images into OpenAI / OpenRouter format
 */
export function formatForOpenAI(
  prompt: string,
  images: PreprocessedImage[],
  history: MultimodalMessage[] = [],
  detail: 'auto' | 'low' | 'high' = 'auto'
): FormattedProviderPayload {
  const messages: any[] = [];

  // Append history
  history.forEach((msg) => {
    if (typeof msg.content === 'string') {
      messages.push({ role: msg.role, content: msg.content });
    } else {
      messages.push({ role: msg.role, content: msg.content });
    }
  });

  // Build current user message with text + image_url blocks
  const contentParts: any[] = [];
  if (prompt) {
    contentParts.push({ type: 'text', text: prompt });
  }

  images.forEach((img) => {
    contentParts.push({
      type: 'image_url',
      image_url: {
        url: img.dataUrl,
        detail,
      },
    });
  });

  messages.push({
    role: 'user',
    content: contentParts.length > 0 ? contentParts : prompt,
  });

  return {
    provider: 'openai',
    payload: { messages },
    imageCount: images.length,
  };
}

/**
 * Formats multimodal prompt & images into Anthropic Claude format
 */
export function formatForAnthropic(
  prompt: string,
  images: PreprocessedImage[],
  history: MultimodalMessage[] = []
): FormattedProviderPayload {
  const messages: any[] = [];

  history.forEach((msg) => {
    messages.push({ role: msg.role === 'system' ? 'user' : msg.role, content: msg.content });
  });

  const contentParts: any[] = [];

  images.forEach((img) => {
    contentParts.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: img.mimeType,
        data: img.base64Data,
      },
    });
  });

  if (prompt) {
    contentParts.push({ type: 'text', text: prompt });
  }

  messages.push({
    role: 'user',
    content: contentParts,
  });

  return {
    provider: 'anthropic',
    payload: { messages },
    imageCount: images.length,
  };
}

/**
 * Formats multimodal prompt & images into Google Gemini Generative AI format
 */
export function formatForGemini(
  prompt: string,
  images: PreprocessedImage[],
  history: MultimodalMessage[] = []
): FormattedProviderPayload {
  const contents: any[] = [];

  history.forEach((msg) => {
    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: typeof msg.content === 'string' ? [{ text: msg.content }] : msg.content,
    });
  });

  const parts: any[] = [];

  images.forEach((img) => {
    parts.push({
      inlineData: {
        mimeType: img.mimeType,
        data: img.base64Data,
      },
    });
  });

  if (prompt) {
    parts.push({ text: prompt });
  }

  contents.push({
    role: 'user',
    parts,
  });

  return {
    provider: 'gemini',
    payload: { contents },
    imageCount: images.length,
  };
}

/**
 * Unified Provider Multimodal Payload Formatter
 */
export function formatMultimodalRequest(
  provider: ProviderFormat,
  prompt: string,
  images: PreprocessedImage[],
  history: MultimodalMessage[] = [],
  detail: 'auto' | 'low' | 'high' = 'auto'
): FormattedProviderPayload {
  switch (provider) {
    case 'anthropic':
      return formatForAnthropic(prompt, images, history);
    case 'gemini':
      return formatForGemini(prompt, images, history);
    case 'openrouter':
    case 'openai':
    default:
      return formatForOpenAI(prompt, images, history, detail);
  }
}
