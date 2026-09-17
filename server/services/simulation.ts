import { db } from '../db';
import { wsHub } from '../ws';
import { n8nService } from './n8n';

class LiveSimulationEngine {
  private isRunning = false;
  private intervalTimer: NodeJS.Timeout | null = null;

  public startSimulation(intervalSeconds = 45) {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log(`⚡ Live Demonstration Simulation Engine started (interval: ${intervalSeconds}s)`);

    this.intervalTimer = setInterval(() => {
      this.runSimulationStep();
    }, intervalSeconds * 1000);
  }

  public stopSimulation() {
    this.isRunning = false;
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
    console.log('⚡ Simulation Engine stopped');
  }

  public getStatus() {
    return {
      running: this.isRunning,
      activeOrders: db.getOrders().length,
      activeTables: db.getTables().filter((t) => t.status === 'occupied').length,
    };
  }

  public async runSimulationStep() {
    try {
      const tables = db.getTables();
      const availableTables = tables.filter((t) => t.status === 'available');
      const occupiedTables = tables.filter((t) => t.status === 'occupied');

      const actionChoice = Math.random();

      if (actionChoice < 0.6 && availableTables.length > 0) {
        // 1. Simulate a new walk-in guest and fast POS order!
        const tableToSeat = availableTables[Math.floor(Math.random() * availableTables.length)];
        const SAMPLE_CUSTOMERS = [
          { name: 'Dr. Radhika Sen', phone: '+91 98201 55670' },
          { name: 'Sameer Kulkarni', phone: '+91 98450 33211' },
          { name: 'Kavita Nair', phone: '+91 98110 77890' },
          { name: 'Aditya Oberoi', phone: '+91 98330 99443' },
          { name: 'Neha Chawla', phone: '+91 98990 11422' },
        ];
        const guest = SAMPLE_CUSTOMERS[Math.floor(Math.random() * SAMPLE_CUSTOMERS.length)];

        const SAMPLE_DISHES = [
          { name: 'Butter Chicken', price: 380, station: 'Curry' },
          { name: 'Paneer Tikka', price: 290, station: 'Tandoor' },
          { name: 'Garlic Naan', price: 80, station: 'Tandoor' },
          { name: 'Chicken Dum Biryani', price: 340, station: 'Pantry' },
          { name: 'Mango Lassi', price: 90, station: 'Bar' },
        ];

        const numItems = Math.floor(Math.random() * 3) + 2;
        const lineItems = [];
        let subtotal = 0;

        for (let i = 0; i < numItems; i++) {
          const dish = SAMPLE_DISHES[Math.floor(Math.random() * SAMPLE_DISHES.length)];
          const qty = Math.floor(Math.random() * 2) + 1;
          lineItems.push({
            name: dish.name,
            qty,
            price: dish.price * qty,
            station: dish.station,
            status: 'Fired to kitchen',
          });
          subtotal += dish.price * qty;
        }

        const taxes = Math.round(subtotal * 0.05);
        const serviceCharge = Math.round(subtotal * 0.05);
        const total = subtotal + taxes + serviceCharge;

        const orderPayload = {
          table: `Table ${tableToSeat.id}`,
          tableType: `Dine-In · ${tableToSeat.capacity} Pax`,
          customer: guest.name,
          phone: guest.phone,
          itemsSummary: lineItems.map((li) => `${li.qty}x ${li.name}`).join(', '),
          itemsCount: lineItems.reduce((acc, li) => acc + li.qty, 0),
          staff: 'Sunil R.',
          subtotal,
          taxes,
          serviceCharge,
          total,
          paymentStatus: 'unpaid',
          paymentMethod: 'Pending',
          lineItems,
        };

        const { order, kdsTicket } = db.addOrder(orderPayload);
        db.deductInventoryForOrder(lineItems);

        // Update table to occupied
        tableToSeat.status = 'occupied';
        tableToSeat.customerName = guest.name;
        tableToSeat.amount = total;
        tableToSeat.orderInfo = `Occupied · ${order.id}`;
        tableToSeat.timeSeated = 'Just now';
        db.saveData();

        wsHub.broadcast('ORDER_CREATED', { order, kdsTicket });
        wsHub.broadcast('TABLE_UPDATED', { tableId: tableToSeat.id });
        wsHub.broadcast('ANALYTICS_UPDATED', db.getAnalytics());

        // Trigger n8n async
        n8nService.triggerWorkflow('order-dispatch', {
          orderId: order.id,
          table: order.table,
          items: lineItems,
          total,
        }).catch(() => {});

        console.log(`[Simulation] Dynamic live order created: ${order.id} at ${order.table}`);
      } else if (occupiedTables.length > 3) {
        // 2. Simulate table turnover / bill settlement
        const tableToRelease = occupiedTables[Math.floor(Math.random() * occupiedTables.length)];
        tableToRelease.status = 'cleaning';
        tableToRelease.orderInfo = 'Cleaning / Turnover';
        tableToRelease.amount = undefined;
        tableToRelease.customerName = undefined;
        db.saveData();

        wsHub.broadcast('TABLE_UPDATED', { tableId: tableToRelease.id });
        wsHub.broadcast('ANALYTICS_UPDATED', db.getAnalytics());

        setTimeout(() => {
          tableToRelease.status = 'available';
          tableToRelease.orderInfo = 'Available';
          db.saveData();
          wsHub.broadcast('TABLE_UPDATED', { tableId: tableToRelease.id });
        }, 8000);

        console.log(`[Simulation] Table turnover: ${tableToRelease.id} released and cleaned`);
      }
    } catch (err: any) {
      console.warn('[Simulation] Step error:', err.message);
    }
  }
}

export const simulationEngine = new LiveSimulationEngine();
