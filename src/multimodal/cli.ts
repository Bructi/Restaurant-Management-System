#!/usr/bin/env node

import { visionPipeline } from './pipeline';
import { formatVisionDebugOutput } from './diagnostics';

async function main() {
  const args = process.argv.slice(2);
  const images: string[] = [];
  let prompt = '';
  let model: string | undefined = undefined;
  let isDebug = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--image' || arg === '-i') {
      if (i + 1 < args.length) {
        images.push(args[++i]);
      }
    } else if (arg === '--prompt' || arg === '-p') {
      if (i + 1 < args.length) {
        prompt = args[++i];
      }
    } else if (arg === '--model' || arg === '-m') {
      if (i + 1 < args.length) {
        model = args[++i];
      }
    } else if (arg === '--debug-vision' || arg === '--debug') {
      isDebug = true;
    } else if (!arg.startsWith('-') && !prompt) {
      prompt = arg;
    }
  }

  if (images.length === 0 && !prompt) {
    console.log(`
Usage:
  npx tsx src/multimodal/cli.ts --image <path> --prompt "Explain this diagram"
  npx tsx src/multimodal/cli.ts -i image1.png -i image2.png -p "Compare these two"
  npx tsx src/multimodal/cli.ts --image <path> --debug-vision

Options:
  -i, --image <path>       Path to image file (can be repeated for multiple images)
  -p, --prompt <text>      Question or instruction for the visual AI
  -m, --model <id>         Specify model (e.g. gpt-4o, gemini-1.5-pro, claude-3-5-sonnet)
  --debug-vision           Display diagnostic pipeline inspection report
`);
    process.exit(0);
  }

  try {
    const defaultPrompt = prompt || 'Please analyze this image, understand its visual composition, and describe all key elements and relationships.';
    const result = await visionPipeline.processMultimodalRequest(images, defaultPrompt, {
      model,
      debug: isDebug,
    });

    if (isDebug) {
      console.log(formatVisionDebugOutput(result.diagnostics));
    }

    console.log(`\n🖼️ [Multimodal Visual Analysis]`);
    console.log(`Category: ${result.categoryDetected.toUpperCase()} | Model: ${result.modelUsed} (${result.providerUsed.toUpperCase()})`);
    console.log(`Images processed: ${result.diagnostics.imageCount}`);
    console.log(`Dimensions: ${result.diagnostics.dimensions} (${result.diagnostics.payloadSizeFormatted})\n`);
    console.log(result.text);
  } catch (err: any) {
    console.error(`❌ Multimodal Pipeline Error: ${err.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('cli.ts')) {
  main().catch(console.error);
}
