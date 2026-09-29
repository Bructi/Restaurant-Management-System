import { VisionDebugDiagnostics } from './types';

/**
 * Generates a clean, sanitized debug report string for vision pipeline diagnostics
 */
export function formatVisionDebugOutput(diag: VisionDebugDiagnostics): string {
  const lines = [
    '========================================',
    '🔍 MULTIMODAL VISION PIPELINE DIAGNOSTICS',
    '========================================',
    `Image Detected:       ${diag.imageDetected ? 'YES' : 'NO'} (${diag.imageCount} image${diag.imageCount === 1 ? '' : 's'})`,
    `Format:               ${diag.format.toUpperCase()}`,
    `Dimensions:           ${diag.dimensions}`,
    `Payload Size:         ${diag.payloadSizeFormatted} (${diag.payloadSizeBytes.toLocaleString()} bytes)`,
    `Preprocessing:        ${diag.preprocessingSummary}`,
    `Model:                ${diag.model}`,
    `Provider:             ${diag.provider.toUpperCase()}`,
    `Vision Capability:    ${diag.visionCapability}`,
    `Vision Supported:     ${diag.supportsVision ? 'YES' : 'NO'}`,
    `Multimodal Payload:   ${diag.multimodalPayloadConstructed ? 'YES (Base64 data URL inline)' : 'NO'}`,
    `Request Status:       ${diag.requestAccepted ? 'ACCEPTED ✓' : 'REJECTED ✗'}`,
  ];

  if (diag.fallbackUsed) {
    lines.push(`Fallback Routing:     ${diag.fallbackUsed}`);
  }

  if (diag.durationMs !== undefined) {
    lines.push(`Pipeline Latency:     ${diag.durationMs}ms`);
  }

  lines.push('========================================');
  return lines.join('\n');
}

/**
 * Sanitizes headers or request objects so no API keys are ever leaked in diagnostics
 */
export function sanitizeDebugHeaders(headers: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('auth') || lowerKey.includes('key') || lowerKey.includes('token') || lowerKey.includes('secret')) {
      sanitized[key] = value.length > 8 ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}` : '***MASKED***';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
