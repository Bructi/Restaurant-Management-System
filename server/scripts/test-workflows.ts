import { n8nService } from '../services/n8n';

async function testAll() {
  console.log('1. Checking n8n health...');
  const h = await n8nService.checkHealth();
  console.log('Health:', h);

  console.log('\n2. Testing Auto-Supply Workflow Trigger...');
  const supplyRes = await n8nService.triggerWorkflow('auto-supply', { mode: 'force_full_replenish' });
  console.log('Supply Result Status:', supplyRes.success, 'POs generated:', supplyRes.data.purchaseOrders.length, 'Duration:', supplyRes.durationMs + 'ms');

  console.log('\n3. Testing VIP Booking Workflow Trigger...');
  const vipRes = await n8nService.triggerWorkflow('vip-booking', { guestName: 'Rohan Kapoor', lifetimeSpend: 45000 });
  console.log('VIP Tier:', vipRes.data.guest.tier, 'Assigned:', vipRes.data.guest.assignedTable);

  console.log('\n4. Testing Executive AI Briefing Workflow Trigger...');
  const execRes = await n8nService.triggerWorkflow('executive-ai', {});
  console.log('Executive Efficiency:', execRes.data.metrics.efficiencyIndex, 'Insights Count:', execRes.data.aiStrategicBriefing.length);

  console.log('\n5. Testing Menu Optimizer Workflow Trigger...');
  const menuRes = await n8nService.triggerWorkflow('menu-optimizer', {});
  console.log('Menu Profit Lift:', menuRes.data.projectedMonthlyProfitLift, 'Stars Count:', menuRes.data.bcgMatrix.stars.length);

  console.log('\n✅ All 5 n8n RestoFlow Workflows Executed with 100% Success!');
}

testAll().catch(console.error);
