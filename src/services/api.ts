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

  // KDS
  getKdsTickets: () => fetchJson<{ success: boolean; data: any[] }>('/kds/tickets'),
  toggleKdsItem: (ticketId: string, itemId: string) =>
    fetchJson<{ success: boolean; data: any }>(`/kds/tickets/${ticketId}/items/${itemId}`, {
      method: 'PATCH',
    }),
  bumpKdsTicket: (ticketId: string) =>
    fetchJson<{ success: boolean; data: any }>(`/kds/tickets/${ticketId}/bump`, {
      method: 'POST',
    }),

  // Tables
  getTables: () => fetchJson<{ success: boolean; data: any[] }>('/tables'),
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

  // Customers
  getCustomers: () => fetchJson<{ success: boolean; data: any[] }>('/customers'),
  createCustomer: (custData: any) =>
    fetchJson<{ success: boolean; data: any }>('/customers', {
      method: 'POST',
      body: JSON.stringify(custData),
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

  // Analytics
  getAnalyticsSummary: () => fetchJson<{ success: boolean; data: any }>('/analytics/summary'),
  getHourlyAnalytics: () => fetchJson<{ success: boolean; data: Array<{ hour: string; revenue: number; orders: number; isPeak?: boolean }> }>('/analytics/hourly'),
  getChannelAnalytics: () => fetchJson<{ success: boolean; data: { total: number; dineIn: { amount: number; pct: number }; takeaway: { amount: number; pct: number }; delivery: { amount: number; pct: number } } }>('/analytics/channels'),
  getPopularDishes: () => fetchJson<{ success: boolean; data: any[] }>('/analytics/dishes'),
  getPipelineAnalytics: () => fetchJson<{ success: boolean; data: Array<{ id: string; label: string; count: number; color: string; dotColor: string; width: string; textClass: string }> }>('/analytics/pipeline'),

  // Settings
  getSettings: () => fetchJson<{ success: boolean; data: { settings: any; peripherals: any[] } }>('/settings'),
  updateSettings: (settingsData: any) =>
    fetchJson<{ success: boolean; data: any }>('/settings', {
      method: 'POST',
      body: JSON.stringify(settingsData),
    }),
  pingDevices: () =>
    fetchJson<{ success: boolean; allResponsive: boolean; data: any[] }>('/settings/ping', {
      method: 'POST',
    }),

  // Checkout
  settleCheckout: (checkoutData: {
    orderId?: string;
    tableId?: string;
    paymentMethod: string;
    amountPaid: number;
    tipAmount?: number;
  }) =>
    fetchJson<{ success: boolean; message: string; receiptNumber: string }>('/checkout/settle', {
      method: 'POST',
      body: JSON.stringify(checkoutData),
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
};
