import { n8nService } from '../services/n8n';

async function main() {
  console.log('Connecting to n8n at http://localhost:5678...');
  const health = await n8nService.checkHealth();
  console.log('n8n Health:', health);

  if (!health.connected) {
    console.error('Could not connect to n8n:', health.error);
    process.exit(1);
  }

  console.log('Provisioning and activating RestoFlow workflows...');
  const result = await n8nService.provisionAllWorkflows();
  console.log(`Successfully provisioned ${result.provisionedCount} workflows:`);
  for (const wf of result.workflows) {
    console.log(` - [${wf.key}] ${wf.name} (ID: ${wf.id}) -> ${wf.webhookUrl}`);
  }
}

main().catch(console.error);
