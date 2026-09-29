const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.warn(`[API] Fallback/Offline error for ${url}:`, error);
    throw error;
  }
}

// Orders API
export const api = {
  // Orders
  getOrders: () => fetchJson<{ success: boolean; data: any[] }>('/orders'),
  getOrderById: (id: string) => fetchJson<{ success: boolean; data: any }>(`/orders/${id}`),
  createOrder: (orderData: any) =>
    fetchJson<{ success: boolean; data: { order: any; kdsTicket: any } }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),
  updateOrderStatus: (id: string, updates: any) =>
    fetchJson<{ success: boolean; data: any }>(`/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  voidOrderItem: (orderId: string, data: { itemId: string; reason?: string }) =>
    fetchJson<{ success: boolean; message: string; data: { order: any; voidedItem: any; refundedIngredients: any[]; newTotal: number } }>(`/orders/${orderId}/void-item`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  addItemsToOrder: (orderId: string, data: { items: any[] }) =>
    fetchJson<{ success: boolean; message: string; data: any }>(`/orders/${orderId}/add-items`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // KDS
  getKdsTickets: () => fetchJson<{ success: boolean; data: any[] }>('/kds/tickets'),
  getKdsExpoSummary: () =>
    fetchJson<{ success: boolean; data: { activeTicketsCount: number; urgentTicketsCount: number; oldestWaitMinutes: number; stations: any[]; aggregatedDishes: any[]; timestamp: string } }>('/kds/expo-summary'),
  getKdsSlaMetrics: () =>
    fetchJson<{ success: boolean; data: { totalCompletedTickets: number; onTimeTickets: number; overdueTickets: number; onTimePercentage: number; avgPrepMinutes: number; targetSlaMinutes: number; slaHistory: any[] } }>('/kds/sla-metrics'),
  toggleKdsItem: (ticketId: string, itemId: string) =>
    fetchJson<{ success: boolean; data: any }>(`/kds/tickets/${ticketId}/items/${itemId}`, {
      method: 'PATCH',
    }),
  bumpKdsTicket: (ticketId: string) =>
    fetchJson<{ success: boolean; data: any }>(`/kds/tickets/${ticketId}/bump`, {
      method: 'POST',
    }),
  reassignKdsItemStation: (ticketId: string, itemId: string, data: { newStation: string; priorityTag?: string }) =>
    fetchJson<{ success: boolean; message: string; data: any }>(`/kds/tickets/${ticketId}/items/${itemId}/reassign`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  setKdsTicketPriority: (ticketId: string, data: { isUrgent: boolean; specialNote?: string }) =>
    fetchJson<{ success: boolean; message: string; data: any }>(`/kds/tickets/${ticketId}/priority`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Tables
  getTables: () => fetchJson<{ success: boolean; data: any[] }>('/tables'),
  getTableSessions: () => fetchJson<{ success: boolean; data: { totalTurnoversToday: number; activeSessionsCount: number; avgTurnaroundMinutes: string; sectionTurnovers: any[]; recentSessions: any[] } }>('/tables/sessions'),
  getTableAnalytics: () => fetchJson<{ success: boolean; data: { totalTurnoversToday: number; activeSessionsCount: number; avgTurnaroundMinutes: string; sectionTurnovers: any[]; recentSessions: any[] } }>('/tables/analytics'),
  addTable: (tableData: any) =>
    fetchJson<{ success: boolean; data: any }>('/tables', {
      method: 'POST',
      body: JSON.stringify(tableData),
    }),
  transferTable: (sourceId: string, targetId: string) =>
    fetchJson<{ success: boolean; data: any }>('/tables/transfer', {
      method: 'POST',
      body: JSON.stringify({ sourceId, targetId }),
    }),
  mergeTables: (tableIds: string[]) =>
    fetchJson<{ success: boolean; data: any }>('/tables/merge', {
      method: 'POST',
      body: JSON.stringify({ tableIds }),
    }),
  updateTable: (id: string, updates: any) =>
    fetchJson<{ success: boolean; data: any }>(`/tables/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  seatTable: (id: string, data: { guestsCount: number; customerName?: string; server?: string }) =>
    fetchJson<{ success: boolean; data: any }>(`/tables/${id}/seat`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  releaseTable: (id: string) =>
    fetchJson<{ success: boolean; data: any }>(`/tables/${id}/release`, {
      method: 'POST',
    }),

  // Menu
  getMenu: () => fetchJson<{ success: boolean; data: any[] }>('/menu'),
  getDishRecipe: (dishId: string) =>
    fetchJson<{ success: boolean; data: { dishId: string; dishName: string; price: number; calculatedCost: number; foodCostPct: number; marginPct: number; matrixTier: string; ingredients: any[] } }>(`/menu/${dishId}/recipe`),
  updateDishRecipe: (dishId: string, recipeIngredients: Array<{ ingredientId: string; name: string; qty: number; unit: string }>) =>
    fetchJson<{ success: boolean; message: string; data: any }>(`/menu/${dishId}/recipe`, {
      method: 'PUT',
      body: JSON.stringify({ recipeIngredients }),
    }),
  toggleMenuStock: (id: string) =>
    fetchJson<{ success: boolean; data: any }>(`/menu/${id}/toggle-stock`, {
      method: 'PATCH',
    }),
  addMenuItem: (dish: any) =>
    fetchJson<{ success: boolean; data: any }>('/menu', {
      method: 'POST',
      body: JSON.stringify(dish),
    }),

  // Reservations
  getReservations: () => fetchJson<{ success: boolean; data: any[] }>('/reservations'),
  getReservationDeposits: () => fetchJson<{ success: boolean; count: number; data: any[] }>('/reservations/deposits'),
  checkTableAvailability: (data: { tableId: string; date: string; timeSlot: string; pax?: number }) =>
    fetchJson<{ success: boolean; data: { available: boolean; reason?: string; table?: any; suggestedDeposit?: number; conflictWith?: any } }>('/reservations/check-availability', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  recordReservationDeposit: (resId: string, data: { amount: number; paymentMethod?: string }) =>
    fetchJson<{ success: boolean; message: string; data: any }>(`/reservations/${resId}/deposit`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  createReservation: (resData: any) =>
    fetchJson<{ success: boolean; data: any }>('/reservations', {
      method: 'POST',
      body: JSON.stringify(resData),
    }),
  updateReservationStatus: (id: string, status: string, statusLabel: string) =>
    fetchJson<{ success: boolean; data: any }>(`/reservations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, statusLabel }),
    }),

  // Inventory
  getInventory: () => fetchJson<{ success: boolean; data: any[] }>('/inventory'),
  getPurchaseOrders: () => fetchJson<{ success: boolean; data: any[] }>('/inventory/purchase-orders'),
  receivePurchaseOrder: (poNumber: string, data?: { notes?: string }) =>
    fetchJson<{ success: boolean; message: string; data: { po: any; ingestedItems: any[] } }>(`/inventory/purchase-orders/${poNumber}/receive`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }),
  cancelPurchaseOrder: (poNumber: string, data?: { reason?: string }) =>
    fetchJson<{ success: boolean; message: string; data: any }>(`/inventory/purchase-orders/${poNumber}/cancel`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }),
  triggerAutoSupply: (mode = 'auto_replenish') =>
    fetchJson<{ success: boolean; message: string; data: any; inventory: any[]; purchaseOrders: any[] }>('/inventory/auto-supply', {
      method: 'POST',
      body: JSON.stringify({ mode }),
    }),
  updateStock: (id: string, currentStock: number) =>
    fetchJson<{ success: boolean; data: any }>(`/inventory/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ currentStock }),
    }),
  receiveStock: (id: string, qty: number) =>
    fetchJson<{ success: boolean; data: any }>('/inventory/receive', {
      method: 'POST',
      body: JSON.stringify({ id, qty }),
    }),
  logWastage: (wasteData: { item: string; qty: string; reason: string; cost: number }) =>
    fetchJson<{ success: boolean; data: any }>('/inventory/wastage', {
      method: 'POST',
      body: JSON.stringify(wasteData),
    }),
  getWasteLogs: (category?: string) =>
    fetchJson<{ success: boolean; count: number; data: any[] }>(`/inventory/waste-logs${category ? `?category=${category}` : ''}`),
  getWasteSummary: () =>
    fetchJson<{ success: boolean; data: { totalWasteCost: number; totalEntries: number; totalInventoryValuation: number; wastePercentage: number; reasonBreakdown: Array<{ reason: string; cost: number }>; recentLogs: any[] } }>('/inventory/waste-summary'),

  // Customers & Campaigns
  getCustomers: () => fetchJson<{ success: boolean; data: any[] }>('/customers'),
  getCustomerById: (id: string) => fetchJson<{ success: boolean; data: any }>(`/customers/${id}`),
  createCustomer: (custData: any) =>
    fetchJson<{ success: boolean; data: any }>('/customers', {
      method: 'POST',
      body: JSON.stringify(custData),
    }),
  creditLoyaltyPoints: (customerId: string, data: { points: number; reason?: string; orderId?: string }) =>
    fetchJson<{ success: boolean; message: string; data: any }>(`/customers/${customerId}/points/credit`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  redeemLoyaltyPoints: (customerId: string, points: number) =>
    fetchJson<{ success: boolean; redeemedPoints?: number; discountValue?: number; remainingPoints?: number; customer?: any; error?: string }>(`/customers/${customerId}/points/redeem`, {
      method: 'POST',
      body: JSON.stringify({ points }),
    }),
  getMarketingCampaigns: () =>
    fetchJson<{ success: boolean; count: number; data: any[] }>('/customers/campaigns/list'),
  broadcastCampaign: (campaignData: { title: string; targetTier: string; channel?: string; template: string }) =>
    fetchJson<{ success: boolean; message: string; data: { campaign: any; recipients: any[] } }>('/customers/campaigns/broadcast', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    }),
  checkAllergenConflict: (data: { customerIdentifier: string; dishNames: string[] }) =>
    fetchJson<{ success: boolean; data: { hasConflict: boolean; customerName: string; dietaryTags: string[]; warnings: Array<{ dish: string; allergen: string; severity: string }> } }>('/customers/check-allergens', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Staff
  getStaff: () => fetchJson<{ success: boolean; data: any[] }>('/staff'),
  addStaff: (staffData: any) =>
    fetchJson<{ success: boolean; data: any }>('/staff', {
      method: 'POST',
      body: JSON.stringify(staffData),
    }),
  updateStaffPin: (id: string, pin: string) =>
    fetchJson<{ success: boolean; data: any }>(`/staff/${id}/pin`, {
      method: 'PATCH',
      body: JSON.stringify({ pin }),
    }),
  clockInStaff: (id: string) =>
    fetchJson<{ success: boolean; data: any }>(`/staff/${id}/clock-in`, {
      method: 'POST',
    }),
  clockOutStaff: (id: string) =>
    fetchJson<{ success: boolean; message: string; data: any }>(`/staff/${id}/clock-out`, {
      method: 'POST',
    }),
  getTipPoolSummary: () =>
    fetchJson<{ success: boolean; data: { totalTipsCollected: number; activeStaffCount: number; sharePerStaff: number; activeStaff: any[]; recentDistributions: any[] } }>('/staff/tip-pool'),
  distributeTipPool: (data?: { distributedBy?: string }) =>
    fetchJson<{ success: boolean; message: string; data: any }>('/staff/tip-pool/distribute', {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }),

  // Coupons
  getCoupons: () => fetchJson<{ success: boolean; count: number; data: any[] }>('/coupons'),
  validateCoupon: (code: string, subtotal: number) =>
    fetchJson<{ success: boolean; message: string; data: { valid: boolean; code: string; discountAmount: number; netTotal: number; coupon: any } }>('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    }),
  createCoupon: (couponData: any) =>
    fetchJson<{ success: boolean; message: string; data: any }>('/coupons', {
      method: 'POST',
      body: JSON.stringify(couponData),
    }),
  toggleCoupon: (code: string) =>
    fetchJson<{ success: boolean; message: string; data: any }>(`/coupons/${code}/toggle`, {
      method: 'PATCH',
    }),

  // Delivery & Drivers
  getDeliveryDrivers: () => fetchJson<{ success: boolean; count: number; data: any[] }>('/delivery/drivers'),
  getDeliveryDriverById: (id: string) => fetchJson<{ success: boolean; data: any }>(`/delivery/drivers/${id}`),
  updateDriverLocation: (id: string, data: { lat?: number; lng?: number; status?: string; etaMinutes?: number; destination?: string }) =>
    fetchJson<{ success: boolean; message: string; data: any }>(`/delivery/drivers/${id}/location`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  assignDriverToOrder: (data: { driverId: string; orderId: string; destination?: string; customerName?: string }) =>
    fetchJson<{ success: boolean; message: string; data: { driver: any; order: any } }>('/delivery/assign', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Analytics
  getAnalyticsSummary: () => fetchJson<{ success: boolean; data: any }>('/analytics/summary'),
  getHourlyAnalytics: () => fetchJson<{ success: boolean; data: Array<{ hour: string; revenue: number; orders: number; isPeak?: boolean }> }>('/analytics/hourly'),
  getChannelAnalytics: () => fetchJson<{ success: boolean; data: { total: number; dineIn: { amount: number; pct: number }; takeaway: { amount: number; pct: number }; delivery: { amount: number; pct: number } } }>('/analytics/channels'),
  getPopularDishes: () => fetchJson<{ success: boolean; data: any[] }>('/analytics/dishes'),
  getPipelineAnalytics: () => fetchJson<{ success: boolean; data: Array<{ id: string; label: string; count: number; color: string; dotColor: string; width: string; textClass: string }> }>('/analytics/pipeline'),
  getWeatherPrepForecast: (temp?: number, code?: number) =>
    fetchJson<{ success: boolean; data: { temperature: number; weatherCode: number; forecastTitle: string; recommendations: Array<{ department: string; action: string }>; timestamp: string } }>(`/analytics/weather-insights?temp=${temp || 26}&code=${code || 0}`),

  // Search
  searchUniversal: (query: string) =>
    fetchJson<{ success: boolean; query: string; count: number; data: Array<{ type: string; id: string; title: string; subtitle: string; icon: string }> }>(`/search?q=${encodeURIComponent(query)}`),

  // Settings & Peripherals
  getSettings: () => fetchJson<{ success: boolean; data: { settings: any; peripherals: any[] } }>('/settings'),
  updateSettings: (settingsData: any) =>
    fetchJson<{ success: boolean; data: any }>('/settings', {
      method: 'POST',
      body: JSON.stringify(settingsData),
    }),
  getPeripherals: () => fetchJson<{ success: boolean; count: number; data: any[] }>('/settings/peripherals'),
  addPeripheral: (deviceData: any) =>
    fetchJson<{ success: boolean; message: string; data: any }>('/settings/peripherals', {
      method: 'POST',
      body: JSON.stringify(deviceData),
    }),
  updatePeripheral: (id: string, updates: any) =>
    fetchJson<{ success: boolean; message: string; data: any }>(`/settings/peripherals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
  testPrintPeripheral: (id: string, title?: string) =>
    fetchJson<{ success: boolean; deviceId: string; deviceName: string; jobId: string; title: string; status: string }>(`/settings/peripherals/${id}/test-print`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),
  pingDevices: () =>
    fetchJson<{ success: boolean; allResponsive: boolean; data: any[] }>('/settings/ping', {
      method: 'POST',
    }),

  // Checkout & Till
  settleCheckout: (checkoutData: {
    orderId?: string;
    tableId?: string;
    paymentMethod: string;
    amountPaid: number;
    tipAmount?: number;
    customerName?: string;
    customerPhone?: string;
  }) =>
    fetchJson<{ success: boolean; message: string; receiptNumber: string }>('/checkout/settle', {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    }),
  getSplitPayments: (orderId?: string) =>
    fetchJson<{ success: boolean; count: number; data: any[] }>(`/checkout/splits${orderId ? `?orderId=${orderId}` : ''}`),
  settleSplitCheckout: (splitData: {
    orderId: string;
    tableId?: string;
    splits: Array<{ guestIndex: number; guestName?: string; amount: number; method: string; refNumber?: string }>;
    tipAmount?: number;
  }) =>
    fetchJson<{ success: boolean; message: string; data: any; receiptNumber: string }>('/checkout/split', {
      method: 'POST',
      body: JSON.stringify(splitData),
    }),
  getTillStatus: () =>
    fetchJson<{ success: boolean; data: { activeTill: any; openingFloat: number; cashSalesCount: number; cashCollected: number; currentExpectedCash: number; tillStatus: string } }>('/checkout/till-status'),
  openTillSession: (data: { cashierName?: string; openingFloat?: number }) =>
    fetchJson<{ success: boolean; message: string; data: any }>('/checkout/till/open', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  closeTillSession: (data: { actualCountedCash: number; notes?: string }) =>
    fetchJson<{ success: boolean; message: string; data: any }>('/checkout/till/close', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // InsForge Cloud BaaS Integration
  getInsForgeStatus: () =>
    fetchJson<{
      success: boolean;
      connected: boolean;
      project: {
        projectId: string;
        projectName: string;
        region: string;
        host: string;
        apiKeyMasked: string;
        anonKeyMasked: string;
      };
      health: {
        connected: boolean;
        database: string;
        storage: string;
        bucketsCount: number;
        error?: string;
      };
      tables: Array<{ name: string; count: number; description: string }>;
      error?: string;
    }>('/insforge/status'),

  getInsForgeTables: () =>
    fetchJson<{ success: boolean; data: Array<{ name: string; count: number; description: string }>; total: number }>('/insforge/tables'),

  syncInsForgeDb: () =>
    fetchJson<{ success: boolean; message: string; tables: Array<{ name: string; count: number; description: string }> }>('/insforge/sync', {
      method: 'POST',
    }),

  getInsForgeBuckets: () =>
    fetchJson<{ success: boolean; data: Array<{ name: string; isPublic: boolean; description: string }> }>('/insforge/storage/buckets'),

  uploadToInsForgeStorage: (data: { bucket: string; fileName: string; content: string; contentType?: string }) =>
    fetchJson<{ success: boolean; data?: any; error?: string }>('/insforge/storage/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  insforgeSignIn: (credentials: { email: string; password: string }) =>
    fetchJson<{ success: boolean; user?: any; accessToken?: string; error?: string }>('/insforge/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  insforgeSignUp: (userData: { email: string; password: string; name?: string }) =>
    fetchJson<{ success: boolean; user?: any; requireEmailVerification?: boolean; error?: string }>('/insforge/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  // n8n AI Workflow & Autonomous Operations
  getN8nStatus: () =>
    fetchJson<{
      success: boolean;
      connected: boolean;
      n8nUrl: string;
      version: string;
      workflows: Array<{
        key: string;
        name: string;
        description: string;
        category: 'supply' | 'guest' | 'kds' | 'analytics' | 'menu';
        icon: string;
        webhookPath: string;
        webhookUrl: string;
        isProvisioned: boolean;
        workflowId: string | null;
        isActive: boolean;
        updatedAt: string | null;
      }>;
      recentExecutions: any[];
      error?: string;
    }>('/n8n/status'),

  provisionN8nWorkflows: () =>
    fetchJson<{
      success: boolean;
      message: string;
      workflows: Array<{ key: string; id: string; name: string; active: boolean; webhookUrl: string }>;
    }>('/n8n/provision', {
      method: 'POST',
    }),

  triggerN8nWorkflow: (key: string, payload?: any) =>
    fetchJson<{
      success: boolean;
      workflowKey: string;
      workflowName: string;
      durationMs: number;
      data: any;
    }>(`/n8n/trigger/${key}`, {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    }),

  getN8nExecutions: (limit = 10) =>
    fetchJson<{ success: boolean; data: any[] }>(`/n8n/executions?limit=${limit}`),

  toggleN8nWorkflow: (id: string, active: boolean) =>
    fetchJson<{ success: boolean; data: any }>(`/n8n/workflows/${id}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ active }),
    }),

  // Live Operations Simulator
  getSimulationStatus: () => fetchJson<{ success: boolean; data: { running: boolean; activeOrders: number; activeTables: number } }>('/simulation/status'),
  startSimulation: (intervalSeconds = 45) =>
    fetchJson<{ success: boolean; message: string; interval: number }>('/simulation/start', {
      method: 'POST',
      body: JSON.stringify({ intervalSeconds }),
    }),
  stopSimulation: () =>
    fetchJson<{ success: boolean; message: string }>('/simulation/stop', {
      method: 'POST',
    }),
  pulseSimulation: () =>
    fetchJson<{ success: boolean; message: string }>('/simulation/pulse', {
      method: 'POST',
    }),
};
