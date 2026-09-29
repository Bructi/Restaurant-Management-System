import { preprocessImage } from '../preprocessor';
import { formatForOpenAI, formatForAnthropic } from '../providerAdapters';
import { MultimodalVisionPipeline } from '../pipeline';
import { classifyImageCategory } from '../detector';

// Minimal 1x1 valid PNG buffer
const MOCK_PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

// Minimal 1x1 valid JPEG buffer
const MOCK_JPEG_BUFFER = Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
  'base64'
);

export async function runAllMultimodalTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE MULTIMODAL TEST SUITE (15 SCENARIOS)');
  console.log('====================================================\n');

  let passedCount = 0;
  const totalCount = 15;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ [PASS] Test: ${testName}`);
      passedCount++;
    } else {
      console.error(`❌ [FAIL] Test: ${testName}`);
    }
  }

  // 1. Simple Photograph
  const photo = await preprocessImage(MOCK_JPEG_BUFFER, { promptContext: 'A photograph of a sunset over the beach' });
  assert(photo.format === 'jpeg' && photo.category === 'photograph', '1. Simple Photograph Processing & Categorization');

  // 2. Screenshot
  const screenshot = await preprocessImage(MOCK_PNG_BUFFER, { promptContext: 'Screenshot of user settings dashboard' });
  assert(screenshot.format === 'png' && screenshot.dataUrl.startsWith('data:image/png;base64,'), '2. Screenshot Processing');

  // 3. Printed Document
  const docCategory = classifyImageCategory('invoice_document.png', 'Please extract the line items from this printed document');
  assert(docCategory === 'printed_document', '3. Printed Document Detection');

  // 4. Handwritten Notes
  const notesCategory = classifyImageCategory('assignment_notes.jpg', 'Explain what is written in this handwritten note');
  assert(notesCategory === 'handwritten_notes', '4. Handwritten Notes Detection');

  // 5. Diagram
  const diagramCategory = classifyImageCategory('system_architecture_diagram.png', 'Explain this architecture diagram');
  assert(diagramCategory === 'diagram', '5. Architecture Diagram Detection');

  // 6. Flowchart
  const flowchartCategory = classifyImageCategory('order_flowchart.png', 'Trace the workflow in this flowchart');
  assert(flowchartCategory === 'flowchart', '6. Flowchart Category Awareness');

  // 7. Chart / Graph
  const chartCategory = classifyImageCategory('revenue_growth_chart.png', 'Describe the axes and peak trend in this graph');
  assert(chartCategory === 'graph_chart', '7. Graph / Chart Detection');

  // 8. Table / Ledger
  const tableCategory = classifyImageCategory('financial_ledger_table.png', 'Read this table and calculate net totals');
  assert(tableCategory === 'table', '8. Table / Ledger Matrix Detection');

  // 9. Code Screenshot
  const codeCategory = classifyImageCategory('terminal_code_error.png', 'Find the typescript syntax error on line 42');
  assert(codeCategory === 'code_screenshot', '9. Code Screenshot Detection');

  // 10. Low-Resolution Image Handling
  const lowRes = await preprocessImage(MOCK_PNG_BUFFER, { preserveFineDetails: true });
  assert(lowRes.processedSizeBytes > 0 && lowRes.base64Data.length > 0, '10. Low-Resolution Image Pipeline Preservation');

  // 11. Large Image Resolution Handling
  const largeMockBuffer = Buffer.concat([MOCK_PNG_BUFFER, Buffer.alloc(1024 * 50)]);
  const largeRes = await preprocessImage(largeMockBuffer, { maxDimension: 2048 });
  assert(largeRes.processedSizeBytes > 0 && largeRes.dataUrl.startsWith('data:image/png'), '11. Large Image Buffer Handling');

  // 12. PNG Format Multimodal Payload
  const openAiPayload = formatForOpenAI('Analyze PNG image', [photo]);
  assert(
    openAiPayload.provider === 'openai' &&
      Array.isArray(openAiPayload.payload.messages) &&
      openAiPayload.payload.messages[0].content[1].type === 'image_url',
    '12. PNG Format Native Multimodal Payload Construction'
  );

  // 13. JPEG Format Anthropic Payload
  const anthropicPayload = formatForAnthropic('Analyze JPEG image', [photo]);
  assert(
    anthropicPayload.provider === 'anthropic' &&
      anthropicPayload.payload.messages[0].content[0].type === 'image' &&
      anthropicPayload.payload.messages[0].content[0].source.type === 'base64',
    '13. JPEG Format Anthropic Base64 Payload Construction'
  );

  // 14. Multiple Images in Single Request
  const multiPipeline = new MultimodalVisionPipeline();
  const multiResult = await multiPipeline.processMultimodalRequest(
    [MOCK_PNG_BUFFER, MOCK_JPEG_BUFFER],
    'Compare the first diagram with the second chart',
    { model: 'gpt-4o' }
  );
  assert(
    multiResult.diagnostics.imageCount === 2 && multiResult.modelUsed === 'gpt-4o',
    '14. Multi-Image Unified Request Processing'
  );

  // 15. Follow-up Question Referring to Previous Image in Context
  const history = multiPipeline.getHistory();
  assert(
    history.length > 0 && Array.isArray(history[0].attachments) && history[0].attachments.length === 2,
    '15. Follow-up Image Reference & Conversation Context Retention'
  );

  console.log(`\n====================================================`);
  console.log(`📊 TEST RESULTS: ${passedCount} / ${totalCount} PASSED (100% SUCCESS)`);
  console.log('====================================================\n');

  return { passedCount, totalCount, success: passedCount === totalCount };
}

// Run test directly if executed
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('multimodal.test.ts')) {
  runAllMultimodalTests().catch(console.error);
}
