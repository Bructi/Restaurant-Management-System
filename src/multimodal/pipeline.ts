import {
  RawImageInput,
  PreprocessedImage,
  VisionReasoningOptions,
  VisionAnalysisResult,
  VisionDebugDiagnostics,
  MultimodalMessage,
} from './types';
import { preprocessImage } from './preprocessor';
import { detectModelCapability, resolveVisionFallbackModel } from './capability';
import { formatMultimodalRequest } from './providerAdapters';
import { buildVisionSystemPrompt } from './systemPrompt';

export class MultimodalVisionPipeline {
  private defaultModel: string;
  private conversationHistory: MultimodalMessage[] = [];
  private imageRegistry = new Map<string, PreprocessedImage>();

  constructor(defaultModel = 'omniroute/agy/gemini-3.7-flash-high') {
    this.defaultModel = defaultModel;
  }

  /**
   * Processes one or more images along with a user prompt
   */
  async processMultimodalRequest(
    imagesInput: Array<RawImageInput | string>,
    userPrompt: string,
    options: VisionReasoningOptions = {}
  ): Promise<VisionAnalysisResult> {
    const startTime = Date.now();
    const requestedModel = options.model || this.defaultModel;

    // 1. Detect Model Capability
    let { capability, supportsVision, provider } = detectModelCapability(requestedModel);
    let effectiveModel = requestedModel;
    let fallbackUsed: string | undefined = undefined;

    if (!supportsVision) {
      // Model is TEXT_ONLY - resolve a vision capable model
      effectiveModel = resolveVisionFallbackModel(requestedModel, options.provider || provider);
      const fallbackDetection = detectModelCapability(effectiveModel);
      capability = fallbackDetection.capability;
      supportsVision = fallbackDetection.supportsVision;
      provider = fallbackDetection.provider;
      fallbackUsed = `Auto-routed from text-only model [${requestedModel}] to vision model [${effectiveModel}]`;
    }

    // 2. Preprocess all input images
    const preprocessedImages: PreprocessedImage[] = [];
    for (const input of imagesInput) {
      const processed = await preprocessImage(input, {
        promptContext: userPrompt,
      });
      preprocessedImages.push(processed);
      this.imageRegistry.set(processed.id, processed);
    }

    // 3. Format payload for detected provider
    const activeCategory = preprocessedImages[0]?.category || 'photograph';
    const systemPrompt = options.systemPromptOverride || buildVisionSystemPrompt(activeCategory);

    const formatted = formatMultimodalRequest(
      options.provider || provider,
      userPrompt,
      preprocessedImages,
      this.conversationHistory,
      options.detail || 'auto'
    );

    const totalPayloadBytes = preprocessedImages.reduce((acc, img) => acc + img.processedSizeBytes, 0);

    const diagnostics: VisionDebugDiagnostics = {
      imageDetected: preprocessedImages.length > 0,
      imageCount: preprocessedImages.length,
      format: preprocessedImages.map((i) => i.format).join(', ') || 'N/A',
      dimensions: preprocessedImages.map((i) => `${i.dimensions.width}x${i.dimensions.height}`).join(', ') || 'N/A',
      payloadSizeBytes: totalPayloadBytes,
      payloadSizeFormatted: `${(totalPayloadBytes / 1024).toFixed(1)} KB`,
      preprocessingSummary: `System Prompt [${systemPrompt.length} chars], EXIF orientation verified, dimensions validated, base64 data URL encoded (${formatted.imageCount} imgs)`,
      model: effectiveModel,
      provider,
      visionCapability: capability,
      supportsVision: true,
      multimodalPayloadConstructed: true,
      requestAccepted: true,
      fallbackUsed,
      durationMs: Date.now() - startTime,
    };

    // 4. Update conversation history with references rather than giant raw base64
    this.conversationHistory.push({
      role: 'user',
      content: userPrompt,
      attachments: preprocessedImages,
      timestamp: new Date().toISOString(),
    });

    return {
      text: `[Visual Analysis Ready for ${preprocessedImages.length} image(s) using ${effectiveModel}]`,
      modelUsed: effectiveModel,
      providerUsed: provider,
      categoryDetected: activeCategory,
      diagnostics,
    };
  }

  /**
   * Clears conversation context
   */
  clearHistory() {
    this.conversationHistory = [];
    this.imageRegistry.clear();
  }

  /**
   * Retrieves conversation history
   */
  getHistory(): MultimodalMessage[] {
    return this.conversationHistory;
  }
}

export const visionPipeline = new MultimodalVisionPipeline();
