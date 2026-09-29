/**
 * RestoFlow / OpenCode Multimodal AI Vision Pipeline Types
 */

export type ModelCapability = 'TEXT_ONLY' | 'VISION' | 'VISION_REASONING';

export type ProviderFormat = 'openai' | 'anthropic' | 'gemini' | 'openrouter';

export type ImageCategory =
  | 'photograph'
  | 'screenshot'
  | 'scanned_document'
  | 'handwritten_notes'
  | 'printed_document'
  | 'diagram'
  | 'flowchart'
  | 'graph_chart'
  | 'table'
  | 'code_screenshot'
  | 'ui_screenshot'
  | 'mixed_content';

export interface ImageDimensions {
  width: number;
  height: number;
}

export type RawImageInput =
  | Buffer
  | Uint8Array
  | {
      path?: string;
      buffer?: Buffer;
      base64?: string;
      mimeType?: string;
      fileName?: string;
    };

export interface PreprocessedImage {
  id: string;
  mimeType: string;
  format: 'png' | 'jpeg' | 'webp' | 'gif' | 'svg';
  dimensions: ImageDimensions;
  originalSizeBytes: number;
  processedSizeBytes: number;
  base64Data: string;
  dataUrl: string;
  category: ImageCategory;
  orientationApplied?: boolean;
  wasResized?: boolean;
  metadata?: Record<string, any>;
}

export interface MultimodalContentPart {
  type: 'text' | 'image_url' | 'image_data';
  text?: string;
  image?: PreprocessedImage;
  imageUrl?: {
    url: string;
    detail?: 'auto' | 'low' | 'high';
  };
}

export interface MultimodalMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | MultimodalContentPart[];
  attachments?: PreprocessedImage[];
  timestamp?: string;
}

export interface VisionDebugDiagnostics {
  imageDetected: boolean;
  imageCount: number;
  format: string;
  dimensions: string;
  payloadSizeBytes: number;
  payloadSizeFormatted: string;
  preprocessingSummary: string;
  model: string;
  provider: ProviderFormat;
  visionCapability: ModelCapability;
  supportsVision: boolean;
  multimodalPayloadConstructed: boolean;
  requestAccepted: boolean;
  fallbackUsed?: string;
  durationMs?: number;
}

export interface MultimodalModelSpec {
  id: string;
  provider: ProviderFormat;
  capability: ModelCapability;
  maxResolution?: ImageDimensions;
  maxPayloadMb?: number;
  supportedMimeTypes: string[];
  supportsMultiImage: boolean;
}

export interface VisionReasoningOptions {
  model?: string;
  provider?: ProviderFormat;
  debug?: boolean;
  fallbackModel?: string;
  enableOcrSecondary?: boolean;
  detail?: 'auto' | 'low' | 'high';
  systemPromptOverride?: string;
}

export interface VisionAnalysisResult {
  text: string;
  modelUsed: string;
  providerUsed: ProviderFormat;
  categoryDetected: ImageCategory;
  diagnostics: VisionDebugDiagnostics;
  structuredObservations?: {
    visibleFacts: string[];
    inferences: string[];
    uncertainties: string[];
  };
}
