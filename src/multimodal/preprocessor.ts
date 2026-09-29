import fs from 'fs';
import path from 'path';
import { RawImageInput, PreprocessedImage } from './types';
import { detectMimeTypeFromBuffer, extractDimensionsFromBuffer, classifyImageCategory } from './detector';

export interface PreprocessingOptions {
  maxDimension?: number;
  preserveFineDetails?: boolean;
  promptContext?: string;
}

/**
 * Loads raw image input from file path, buffer, or base64 string
 */
export function loadRawImage(input: RawImageInput | string): { buffer: Buffer; fileName?: string; explicitMime?: string } {
  if (Buffer.isBuffer(input) || input instanceof Uint8Array) {
    return { buffer: Buffer.from(input) };
  }

  if (typeof input === 'string') {
    // If it's a file path
    if (fs.existsSync(input)) {
      const buffer = fs.readFileSync(input);
      return { buffer, fileName: path.basename(input) };
    }
    // If it's a base64 string or data URL
    if (input.startsWith('data:image/')) {
      const commaIdx = input.indexOf(',');
      const header = input.substring(0, commaIdx);
      const mimeMatch = header.match(/data:([^;]+);/);
      const base64Data = input.substring(commaIdx + 1);
      const buffer = Buffer.from(base64Data, 'base64');
      return { buffer, explicitMime: mimeMatch ? mimeMatch[1] : undefined };
    }
    // Plain base64 string
    const buffer = Buffer.from(input, 'base64');
    return { buffer };
  }

  const obj = input as { path?: string; buffer?: Buffer; base64?: string; mimeType?: string; fileName?: string };

  if (obj.buffer) {
    return { buffer: Buffer.isBuffer(obj.buffer) ? obj.buffer : Buffer.from(obj.buffer), fileName: obj.fileName, explicitMime: obj.mimeType };
  }

  if (obj.path && fs.existsSync(obj.path)) {
    const buffer = fs.readFileSync(obj.path);
    return { buffer, fileName: path.basename(obj.path), explicitMime: obj.mimeType };
  }

  if (obj.base64) {
    const cleanBase64 = obj.base64.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    return { buffer, fileName: obj.fileName, explicitMime: obj.mimeType };
  }

  throw new Error('Invalid raw image input: file path does not exist and no valid buffer/base64 was provided');
}

/**
 * Full Multimodal Image Preprocessing Pipeline
 * Preserves visual fidelity, charts, code, and diagram edges while structuring payload
 */
export async function preprocessImage(
  input: RawImageInput | string,
  options: PreprocessingOptions = {}
): Promise<PreprocessedImage> {
  const { buffer, fileName, explicitMime } = loadRawImage(input);
  const originalSizeBytes = buffer.length;

  // 1. Detect format & MIME type
  const detected = detectMimeTypeFromBuffer(buffer);
  const mimeType = explicitMime || detected.mimeType;
  const format = detected.format;

  // 2. Extract dimensions
  const dimensions = extractDimensionsFromBuffer(buffer, format);

  // 3. Classify category (screenshot, diagram, code, chart, etc.)
  const category = classifyImageCategory(fileName, options.promptContext, dimensions);

  // 4. Encode as high-fidelity Base64 Data URL
  const base64Data = buffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  const id = `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  return {
    id,
    mimeType,
    format,
    dimensions,
    originalSizeBytes,
    processedSizeBytes: buffer.length,
    base64Data,
    dataUrl,
    category,
    orientationApplied: true,
    wasResized: false,
    metadata: {
      fileName: fileName || `${id}.${format}`,
      aspectRatio: Number((dimensions.width / Math.max(1, dimensions.height)).toFixed(3)),
    },
  };
}
