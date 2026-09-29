import { ImageDimensions, ImageCategory } from './types';

/**
 * Image MIME type & format detector using magic bytes
 */
export function detectMimeTypeFromBuffer(rawBuffer: Buffer | Uint8Array): { mimeType: string; format: 'png' | 'jpeg' | 'webp' | 'gif' | 'svg' } {
  const buffer = Buffer.isBuffer(rawBuffer) ? rawBuffer : Buffer.from(rawBuffer);

  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return { mimeType: 'image/png', format: 'png' };
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mimeType: 'image/jpeg', format: 'jpeg' };
  }
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return { mimeType: 'image/webp', format: 'webp' };
  }
  if (buffer.length >= 6 && (buffer.toString('ascii', 0, 6) === 'GIF87a' || buffer.toString('ascii', 0, 6) === 'GIF89a')) {
    return { mimeType: 'image/gif', format: 'gif' };
  }
  const textHead = buffer.toString('utf-8', 0, Math.min(buffer.length, 512)).trim();
  if (textHead.includes('<svg') || (textHead.startsWith('<?xml') && textHead.includes('<svg'))) {
    return { mimeType: 'image/svg+xml', format: 'svg' };
  }

  // Default fallback to PNG
  return { mimeType: 'image/png', format: 'png' };
}

/**
 * Fast binary dimension reader from image header chunks
 */
export function extractDimensionsFromBuffer(rawBuffer: Buffer | Uint8Array, format: string): ImageDimensions {
  const buffer = Buffer.isBuffer(rawBuffer) ? rawBuffer : Buffer.from(rawBuffer);
  try {
    if (format === 'png' && buffer.length >= 24) {
      // PNG: IHDR chunk width at offset 16, height at offset 20 (big-endian 32-bit int)
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      if (width > 0 && height > 0) return { width, height };
    }

    if (format === 'gif' && buffer.length >= 10) {
      // GIF: Logical screen width at offset 6, height at offset 8 (little-endian 16-bit)
      const width = buffer.readUInt16LE(6);
      const height = buffer.readUInt16LE(8);
      if (width > 0 && height > 0) return { width, height };
    }

    if (format === 'webp' && buffer.length >= 30) {
      const type = buffer.toString('ascii', 12, 16);
      if (type === 'VP8 ') {
        // Lossy WebP
        const width = buffer.readUInt16LE(26) & 0x3fff;
        const height = buffer.readUInt16LE(28) & 0x3fff;
        if (width > 0 && height > 0) return { width, height };
      } else if (type === 'VP8L') {
        // Lossless WebP
        const b1 = buffer[21];
        const b2 = buffer[22];
        const b3 = buffer[23];
        const b4 = buffer[24];
        const width = 1 + (((b2 & 0x3f) << 8) | b1);
        const height = 1 + (((b4 & 0xf) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6));
        if (width > 0 && height > 0) return { width, height };
      }
    }

    if (format === 'jpeg') {
      // JPEG: Walk SOF markers (0xFFC0 - 0xFFC3)
      let offset = 2;
      while (offset < buffer.length) {
        if (buffer[offset] !== 0xff) break;
        const marker = buffer[offset + 1];
        if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          return { width, height };
        }
        const length = buffer.readUInt16BE(offset + 2);
        offset += 2 + length;
      }
    }
  } catch {
    // Graceful fallback
  }

  return { width: 1920, height: 1080 };
}

/**
 * Classifies image category using heuristics & metadata
 */
export function classifyImageCategory(fileName?: string, promptText?: string, dimensions?: ImageDimensions): ImageCategory {
  const name = (fileName || '').toLowerCase();
  const prompt = (promptText || '').toLowerCase();

  // Explicit photo check first to prevent 'photograph' from matching 'graph'
  if (name.includes('photo') || name.includes('camera') || name.includes('pic') || prompt.includes('photo') || prompt.includes('photograph') || prompt.includes('picture')) {
    return 'photograph';
  }

  if (name.includes('code') || prompt.includes('code') || prompt.includes('error') || prompt.includes('syntax') || prompt.includes('typescript') || prompt.includes('python')) {
    return 'code_screenshot';
  }
  if (name.includes('diagram') || prompt.includes('diagram') || prompt.includes('architecture') || prompt.includes('component')) {
    return 'diagram';
  }
  if (name.includes('flowchart') || prompt.includes('flowchart') || prompt.includes('workflow') || prompt.includes('process')) {
    return 'flowchart';
  }
  if (name.includes('chart') || name.includes('plot') || prompt.includes('chart') || prompt.includes('plot') || prompt.includes('trend') || /\bgraph\b/.test(prompt) || /\bgraph\b/.test(name)) {
    return 'graph_chart';
  }
  if (name.includes('table') || prompt.includes('table') || prompt.includes('row') || prompt.includes('column') || prompt.includes('ledger')) {
    return 'table';
  }
  if (name.includes('screen') || prompt.includes('ui') || prompt.includes('button') || prompt.includes('layout') || prompt.includes('interface')) {
    return 'ui_screenshot';
  }
  if (name.includes('doc') || name.includes('paper') || prompt.includes('document') || prompt.includes('page')) {
    return 'printed_document';
  }
  if (name.includes('note') || prompt.includes('handwriting') || prompt.includes('handwritten')) {
    return 'handwritten_notes';
  }

  // Aspect ratio check for typical desktop / mobile screenshots
  if (dimensions) {
    const ratio = dimensions.width / Math.max(1, dimensions.height);
    if (Math.abs(ratio - 16 / 9) < 0.1 || Math.abs(ratio - 16 / 10) < 0.1) {
      return 'screenshot';
    }
  }

  return 'photograph';
}
