import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { insforgeAdmin } from './services/insforge';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Interface definitions
export interface DbSchema {
  orders: any[];
  kdsTickets: any[];
  menuItems: any[];
  floorTables: any[];
  reservations: any[];
  inventory: any[];
  wasteLogs: any[];
  purchaseOrders: any[];
  customers: any[];
  staff: any[];
  settings: any;
  peripherals: any[];
  analytics: any;
  coupons: any[];
  deliveryDrivers: any[];
  splitPayments: any[];
  tipPoolDistributions: any[];
  reservationDeposits: any[];
  tableSessions: any[];
  marketingCampaigns: any[];
  tillSessions: any[];
  kdsSlaLogs: any[];
}

const SEED_DATA: DbSchema = {
  orders: [
    {
      id: '#ORD-10482',
      terminal: 'POS Terminal 1',
      table: 'Table T-12',
      tableType: 'Dine-In · 4 Pax',
      customer: 'Ananya Verma',
      phone: '+91 98201 44821',
      itemsSummary: 'Butter Chicken, Paneer Tikka, 2 Naan, 2 Coke',
      itemsCount: 5,
      staff: 'Sunil R.',
      total: 1840,
      subtotal: 1540,
      taxes: 120,
      serviceCharge: 180,
      paymentStatus: 'paid',
      paymentMethod: 'UPI',
      kitchenStatus: 'prep',
      kitchenTime: 'Prep (14m)',
      time: '8:42 PM',
      createdAt: new Date().toISOString(),
      lineItems: [
        { id: 'li-1', name: 'Paneer Tikka', qty: 2, price: 580, station: 'Tandoor', status: 'Ready to Serve', notes: 'Extra mint dip' },
        { id: 'li-2', name: 'Butter Chicken', qty: 1, price: 380, station: 'Curry', status: 'Simmering in Karahi', notes: 'Medium gravy' },
        { id: 'li-3', name: 'Garlic Naan', qty: 2, price: 160, station: 'Tandoor', status: 'Firing on wall', notes: 'Well done' },
        { id: 'li-4', name: 'Coke (Zero Sugar 300ml)', qty: 2, price: 120, station: 'Bar', status: 'Dispensed', notes: 'Ice & lemon' },
      ],
    },
    {
      id: '#ORD-10481',
      terminal: 'POS Terminal 2',
      table: 'Table T-04',
      tableType: 'Dine-In · 2 Pax',
      customer: 'Vikram Malhotra',
      phone: '+91 98334 11204',
      itemsSummary: 'Tandoori Chicken, Dal Makhani, Roti',
      itemsCount: 3,
      staff: 'Floor Staff',
      total: 1260,
      subtotal: 1100,
      taxes: 80,
      serviceCharge: 80,
      paymentStatus: 'unpaid',
      paymentMethod: 'Unpaid',
      kitchenStatus: 'prep',
      kitchenTime: 'Prep (18m)',
      time: '8:38 PM',
      createdAt: new Date().toISOString(),
      lineItems: [
        { id: 'li-5', name: 'Tandoori Chicken', qty: 1, price: 420, station: 'Tandoor', status: 'In Skewer Oven', notes: 'Extra spicy' },
        { id: 'li-6', name: 'Dal Makhani SpiceRoute', qty: 1, price: 280, station: 'Curry', status: 'Plated', notes: 'Extra butter' },
        { id: 'li-7', name: 'Tandoori Roti (Butter)', qty: 4, price: 160, station: 'Tandoor', status: 'Firing', notes: 'Hot' },
      ],
    },
    {
      id: '#ORD-10480',
      terminal: 'Fast Counter',
      table: 'Takeaway #22',
      tableType: 'Counter Pickup',
      customer: 'Priya Singh',
      phone: '+91 97110 39201',
      itemsSummary: 'Veg Biryani, Raita',
      itemsCount: 2,
      staff: 'Meera K.',
      total: 680,
      subtotal: 600,
      taxes: 40,
      serviceCharge: 40,
      paymentStatus: 'paid',
      paymentMethod: 'Card',
      kitchenStatus: 'ready',
      kitchenTime: 'Ready (6m)',
      time: '8:35 PM',
      createdAt: new Date().toISOString(),
      lineItems: [
        { id: 'li-8', name: 'Chicken Dum Biryani', qty: 1, price: 340, station: 'Pantry', status: 'Packed in Box' },
        { id: 'li-9', name: 'Burani Raita & Salan', qty: 1, price: 100, station: 'Pantry', status: 'Sealed with cutlery' },
      ],
    },
    {
      id: '#ORD-10479',
      terminal: 'POS Terminal 1',
      table: 'Table T-08',
      tableType: 'Dine-In · 5 Pax',
      customer: 'Rahul Kapoor',
      phone: '+91 98450 77123',
      itemsSummary: 'Paneer Butter Masala, 4 Garlic Naan, Kulfi',
      itemsCount: 6,
      staff: 'Sunil R.',
      total: 2450,
      subtotal: 2150,
      taxes: 150,
      serviceCharge: 150,
      paymentStatus: 'paid',
      paymentMethod: 'Cash',
      kitchenStatus: 'completed',
      kitchenTime: 'Completed',
      time: '8:29 PM',
      createdAt: new Date().toISOString(),
      lineItems: [
        { id: 'li-10', name: 'Paneer Butter Masala', qty: 2, price: 640, station: 'Curry' },
        { id: 'li-11', name: 'Garlic Naan', qty: 4, price: 320, station: 'Tandoor' },
      ],
    },
    {
      id: '#ORD-10478',
      terminal: 'POS Terminal 3',
      table: 'Table T-16',
      tableType: 'Dine-In · 2 Pax',
      customer: 'Rohan Mehta',
      phone: '+91 99002 88419',
      itemsSummary: 'Chicken Dum Biryani, Mirchi Salan, Gulab Jamun',
      itemsCount: 4,
      staff: 'Rajesh P.',
      total: 1590,
      subtotal: 1390,
      taxes: 100,
      serviceCharge: 100,
      paymentStatus: 'unpaid',
      paymentMethod: 'Unpaid',
      kitchenStatus: 'new',
      kitchenTime: 'New (2m)',
      time: '8:21 PM',
      createdAt: new Date().toISOString(),
      lineItems: [
        { id: 'li-12', name: 'Chicken Dum Biryani', qty: 2, price: 680, station: 'Pantry' },
        { id: 'li-13', name: 'Gulab Jamun (2 pcs)', qty: 2, price: 220, station: 'Dessert' },
      ],
    },
    {
      id: '#ORD-10477',
      terminal: 'Aggregator Bridge',
      table: 'Delivery #Z-904',
      tableType: 'Swiggy Aggregator',
      customer: 'Amit Joshi',
      phone: '+91 98190 22100',
      itemsSummary: 'Butter Chicken, 2 Rumali Roti',
      itemsCount: 3,
      staff: 'Dispatch',
      total: 890,
      subtotal: 790,
      taxes: 50,
      serviceCharge: 50,
      paymentStatus: 'paid',
      paymentMethod: 'Online',
      kitchenStatus: 'completed',
      kitchenTime: 'Completed',
      time: '8:15 PM',
      createdAt: new Date().toISOString(),
      lineItems: [
        { id: 'li-14', name: 'Butter Chicken', qty: 1, price: 380, station: 'Curry' },
        { id: 'li-15', name: 'Garlic Naan', qty: 2, price: 160, station: 'Tandoor' },
      ],
    },
  ],

  kdsTickets: [
    {
      id: '#KOT-848',
      orderId: '#ORD-10482',
      table: 'Table T-12',
      orderType: 'Dine-In',
      pax: 4,
      server: 'Sunil R.',
      elapsedMinutes: 14,
      status: 'cooking',
      createdAt: new Date().toISOString(),
      items: [
        { id: 'k1', name: 'Paneer Tikka (Tandoor)', qty: 2, station: 'Tandoor', isDone: true, modifiers: 'Extra spicy, Mint dip' },
        { id: 'k2', name: 'Butter Chicken (Boneless)', qty: 1, station: 'Curry', isDone: false, modifiers: 'Medium rich gravy' },
        { id: 'k3', name: 'Garlic Naan (Crispy)', qty: 2, station: 'Tandoor', isDone: false, modifiers: 'Crispy butter brushed' },
        { id: 'k4', name: 'Coke (Zero Sugar 300ml)', qty: 2, station: 'Bar', isDone: true, modifiers: 'Chilled with ice' },
      ],
    },
    {
      id: '#KOT-847',
      orderId: '#ORD-10481',
      table: 'Table T-04',
      orderType: 'Dine-In',
      pax: 2,
      server: 'Floor Staff',
      elapsedMinutes: 19,
      isUrgent: true,
      status: 'cooking',
      createdAt: new Date().toISOString(),
      items: [
        { id: 'k5', name: 'Tandoori Chicken (Full)', qty: 1, station: 'Tandoor', isDone: false, modifiers: 'Extra degi mirch', specialNote: 'ALLERGY: No peanuts' },
        { id: 'k6', name: 'Dal Makhani SpiceRoute', qty: 1, station: 'Curry', isDone: true, modifiers: 'White butter dollop' },
        { id: 'k7', name: 'Tandoori Roti (Butter)', qty: 4, station: 'Tandoor', isDone: false },
      ],
    },
    {
      id: '#KOT-846',
      orderId: '#ORD-10480',
      table: 'Takeaway #22',
      orderType: 'Takeaway',
      pax: 1,
      server: 'Meera K.',
      elapsedMinutes: 6,
      status: 'ready',
      createdAt: new Date().toISOString(),
      items: [
        { id: 'k8', name: 'Chicken Dum Biryani', qty: 1, station: 'Pantry', isDone: true, modifiers: 'Pack with double salan' },
        { id: 'k9', name: 'Burani Garlic Raita', qty: 1, station: 'Pantry', isDone: true },
      ],
    },
    {
      id: '#KOT-845',
      orderId: '#ORD-10478',
      table: 'Table T-16',
      orderType: 'Dine-In',
      pax: 2,
      server: 'Rajesh P.',
      elapsedMinutes: 3,
      status: 'new',
      createdAt: new Date().toISOString(),
      items: [
        { id: 'k10', name: 'Chicken Dum Biryani', qty: 1, station: 'Pantry', isDone: false, modifiers: 'Boneless piece' },
        { id: 'k11', name: 'Mirchi Ka Salan', qty: 1, station: 'Curry', isDone: false },
        { id: 'k12', name: 'Gulab Jamun (2 pcs)', qty: 1, station: 'Pantry', isDone: false },
      ],
    },
  ],

  menuItems: [
    {
      id: 'm1',
      sku: 'SKU-102',
      name: 'Paneer Tikka',
      category: 'starters',
      price: 290,
      cost: 72,
      foodCostPct: 24.8,
      marginPct: 75.2,
      matrixTier: 'Star',
      isVeg: true,
      inStock: true,
      dineInActive: true,
      onlineActive: true,
      description: 'Charcoal-grilled cottage cheese cubes with peppers and mint dip.',
      recipeIngredients: [
        { ingredientId: 'ING-014', name: 'Fresh Paneer (Malai Block)', qty: 0.25, unit: 'kg' },
        { ingredientId: 'ING-091', name: 'Kashmiri Deggi Mirch Powder', qty: 0.03, unit: 'kg' },
        { ingredientId: 'ING-055', name: 'Amul Salted Butter (500g)', qty: 0.04, unit: 'blocks' },
      ],
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCp_6CFR3E-8f37S3fRDufLwRpCRWr4UmocpRyuHFSetsbzBmXbMkNSBtpShT6_Pft40jHQkyG2WrmcTizjo3WsSl_8Ng48_1mI1U_AplNCGFH1TfIccLd_xFA97TESR97G_CGhbuVeIaM22wXEw1Fi5pYJPRYZFYbz7CY_LeJrT7N06th1UTYmwhkuSXHlwcNED8ZQP3N7yy-MnLV_7Lnk-adRqs0-Q_E21-yTwQONnIY1dwVblzw6',
      altText: 'Paneer Tikka',
    },
    {
      id: 'm2',
      sku: 'SKU-101',
      name: 'Butter Chicken',
      category: 'main-course',
      price: 380,
      cost: 108,
      foodCostPct: 28.4,
      marginPct: 71.6,
      matrixTier: 'Star',
      isVeg: false,
      inStock: true,
      dineInActive: true,
      onlineActive: true,
      description: 'Tandoori chicken in rich velvety makhani tomato butter gravy.',
      recipeIngredients: [
        { ingredientId: 'ING-008', name: 'Spring Chicken (Skinless Cut)', qty: 0.35, unit: 'kg' },
        { ingredientId: 'ING-055', name: 'Amul Salted Butter (500g)', qty: 0.08, unit: 'blocks' },
        { ingredientId: 'ING-091', name: 'Kashmiri Deggi Mirch Powder', qty: 0.02, unit: 'kg' },
      ],
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDH8LH1fdiIdDAAuM87hOyrSr5o0N_k21tQrJ62lukG9qcewaJ3scqOfcOI8BTTj0kp5I7WxsdMEhkIDsgIddnzgGIkknVVFk4OPoTBnXY1zeyz7kFzDVa_s5BQFHdWy-zQchP8Jki9oFwlcj1REaKmgoXsiKRs4tHCJXUV93jNIH3eTbsjuyD33aqAqPsKcoEtlT-4EGRlxKbXUVTXIGci17x0zWNBxPLSV2-W6Lc90T-fxaV7E-Vq',
      altText: 'Butter Chicken',
    },
    {
      id: 'm3',
      sku: 'SKU-105',
      name: 'Paneer Butter Masala',
      category: 'main-course',
      price: 320,
      cost: 88,
      foodCostPct: 27.5,
      marginPct: 72.5,
      matrixTier: 'Star',
      isVeg: true,
      inStock: true,
      dineInActive: true,
      onlineActive: true,
      description: 'Velvety butter gravy with roasted whole spices, fresh cream, and tender soft paneer cubes.',
      recipeIngredients: [
        { ingredientId: 'ING-014', name: 'Fresh Paneer (Malai Block)', qty: 0.25, unit: 'kg' },
        { ingredientId: 'ING-055', name: 'Amul Salted Butter (500g)', qty: 0.08, unit: 'blocks' },
        { ingredientId: 'ING-091', name: 'Kashmiri Deggi Mirch Powder', qty: 0.02, unit: 'kg' },
      ],
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCt6tS1yZeVJXYs7xnTN1ccvHa2HW2saDI3CsZiEgyQpS9cf75gOQWe5gm_HVxvY5TfSP3mUaHKQ8UnRKrpZ9Dn8Fj0mZvYFKUwDhYqb81xz4RPZsnyXTofmCcDaPPmvH9yyKK0DwKET7UtFW7mdiCHDNaPenqqjyDVtmrNpWWhwtBoreECBuC21r4YOYhmEiNPc_4HE76B3ZKmgXlKMjbZKR5S4nshmDa2oQ4SO9jom5MsfNTDtFfF',
      altText: 'Paneer Butter Masala',
    },
    {
      id: 'm4',
      sku: 'SKU-106',
      name: 'Tandoori Chicken',
      category: 'starters',
      price: 420,
      cost: 130,
      foodCostPct: 30.9,
      marginPct: 69.1,
      matrixTier: 'Star',
      isVeg: false,
      inStock: true,
      dineInActive: true,
      onlineActive: true,
      description: 'Whole spring chicken marinated with Kashmiri deggi mirch and roasted over charcoal.',
      recipeIngredients: [
        { ingredientId: 'ING-008', name: 'Spring Chicken (Skinless Cut)', qty: 0.50, unit: 'kg' },
        { ingredientId: 'ING-091', name: 'Kashmiri Deggi Mirch Powder', qty: 0.04, unit: 'kg' },
        { ingredientId: 'ING-055', name: 'Amul Salted Butter (500g)', qty: 0.02, unit: 'blocks' },
      ],
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCufIW8nyrb93az0RcAMyVwzXqp6w-12rHazdtVueoPFXyz8rp8jtpKSkl6_Y7XOO2LqLrXxOK7EFIwcyNLiqcnbNCNeCw9YqR_wiUfxZt7JKF0PZapMkJelnsOJCMUE8_5Mqr_534FzXzFbyJJD8VdJuevYKcWKpqbEB7rfBCsbKa-mQhVCcgdOK7vTaI7K9DMaxIx5a_1Hdmvm_k6JdUaPc4lRe1zWAO5mEyWK4gsNrXLakk0GXxI',
      altText: 'Tandoori Chicken',
    },
    {
      id: 'm5',
      sku: 'SKU-107',
      name: 'Margherita Pizza',
      category: 'pizza',
      price: 310,
      cost: 70,
      foodCostPct: 22.5,
      marginPct: 77.5,
      matrixTier: 'Star',
      isVeg: true,
      inStock: true,
      dineInActive: true,
      onlineActive: true,
      description: '11-inch thin crust topped with San Marzano tomatoes, bocconcini cheese, and fresh basil.',
      recipeIngredients: [
        { ingredientId: 'ING-014', name: 'Fresh Paneer (Malai Block)', qty: 0.15, unit: 'kg' },
        { ingredientId: 'ING-055', name: 'Amul Salted Butter (500g)', qty: 0.04, unit: 'blocks' },
      ],
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAjvcVl0Dd0pb9eeX_hjPlmBqMLYPwwAHc8HtROmwfCNs7n_un5k2lA1ursr96DkhFGiAh8nT7grEk0acpZK5MByfvzNK5U-cYaNxl6aEmdlz4uuHaGrhSE7kZlKlKzmGFhV-KmQugsIRdjxH0clgEzsYx64b8zD_vnb9m6-6B1I2ItJfXVgnq4unxRydNIKkKvN0AZV5eC5hbE2cpnwXPvZExy1rMyr8N7kpG0fSdABO7AI8ySQBjw',
      altText: 'Margherita Pizza',
    },
    {
      id: 'm6',
      sku: 'SKU-108',
      name: 'Gulab Jamun (2 pcs)',
      category: 'desserts',
      price: 110,
      cost: 22,
      foodCostPct: 20.0,
      marginPct: 80.0,
      matrixTier: 'Plowhorse',
      isVeg: true,
      inStock: true,
      dineInActive: true,
      onlineActive: true,
      description: 'Warm fried milk dumplings soaked in green cardamom & saffron infused sugar syrup.',
      recipeIngredients: [
        { ingredientId: 'ING-055', name: 'Amul Salted Butter (500g)', qty: 0.03, unit: 'blocks' },
      ],
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCfS7MBQ6KXSlb_StqI-OQHKbrGZMaMnmGVAd_mGTltJEDQfNYGMgs4iNkbAzug13ZfQSncWAqDm2T_B7bMw9NiHomU3tpRMxttgnvPPnGAE5CiWrYRgXJm1wIT-728DD0m4Y-v7WDGgEAFIKfak7FxiOIGvAZc8bhPJBOAOLCJUzh9jlqW4qfZOSiqR-VBCOaBRBxjQ8ca4X_Dwy65cQOCtGf7eb2UaceqWryfPxBUZwIFuxK_aF33',
      altText: 'Gulab Jamun',
    },
    {
      id: 'm7',
      sku: 'SKU-109',
      name: 'Masala Chai',
      category: 'beverages',
      price: 60,
      cost: 12,
      foodCostPct: 20.0,
      marginPct: 80.0,
      matrixTier: 'Plowhorse',
      isVeg: true,
      inStock: true,
      dineInActive: true,
      onlineActive: true,
      description: 'Slow-brewed Assam CTC black tea with crushed ginger, cloves, cinnamon, and whole milk.',
      recipeIngredients: [
        { ingredientId: 'ING-091', name: 'Kashmiri Deggi Mirch Powder', qty: 0.005, unit: 'kg' },
      ],
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCPRzaZGbWKdYmTmXGIsIB2JzYXr4dtw9FVzIj2FHAYpFyb8fi_yvJsaY71lLvnPGYd_1_3PV8gEnAYzNBQKuWc-8Qw1Ey1UvuzZxpX6mZcyHwALj547f50_uFh8AZ4a0wL8BPknMRyJboOPHc3zX7Sfy1OZU0hHKYRvT_pTK8VA03yguKV4Jh2id0IE2j1ohAccEG9IRgCbpvQybTlN-8-p9Y2mQvyD6Re26YPBGeQOOvJ1fTPYeHq',
      altText: 'Masala Chai',
    },
    {
      id: 'm8',
      sku: 'SKU-103',
      name: 'Garlic Naan',
      category: 'breads',
      price: 80,
      cost: 14,
      foodCostPct: 17.5,
      marginPct: 82.5,
      matrixTier: 'Plowhorse',
      isVeg: true,
      inStock: true,
      dineInActive: true,
      onlineActive: true,
      description: 'Freshly baked tandoori bread brushed with butter and garlic.',
      recipeIngredients: [
        { ingredientId: 'ING-055', name: 'Amul Salted Butter (500g)', qty: 0.04, unit: 'blocks' },
      ],
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA9PrUCnLDZ8dc0ytNrGsbbI2GnDy44k38_XZUDxdNWj6hYxTUAbxylXQkaJ6q8c_ubW-v_m23TgSScf5uw19nZSsapsF1CuJCjvsePNavpa4tGCnXJJOnSQa-2JTpOd_jCbEAQxshoB4XKQQlMAjMYFGTdWtf7P6NXlc3abJIFwpAVFFjuTHtnV5K38xqHwsZrl8YtbE7nwBpISqsdl48c3bPD-VWW2Zwi0Fl2RZ0AtTaajBFh6EsK',
      altText: 'Garlic Naan',
    },
    {
      id: 'm9',
      sku: 'SKU-104',
      name: 'Chicken Dum Biryani',
      category: 'rice',
      price: 340,
      cost: 112,
      foodCostPct: 32.9,
      marginPct: 67.1,
      matrixTier: 'Star',
      isVeg: false,
      inStock: true,
      dineInActive: true,
      onlineActive: true,
      description: 'Fragrant basmati rice dum cooked with spiced chicken and caramelised onions.',
      recipeIngredients: [
        { ingredientId: 'ING-032', name: 'Basmati Rice (Daawat Royal)', qty: 0.20, unit: 'kg' },
        { ingredientId: 'ING-008', name: 'Spring Chicken (Skinless Cut)', qty: 0.25, unit: 'kg' },
        { ingredientId: 'ING-055', name: 'Amul Salted Butter (500g)', qty: 0.03, unit: 'blocks' },
      ],
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBENWDfx1-d0UWSah0Kgdyaer1PRWXCJeC4hQf9ZyVg2qPQoOixLFLTRdidHssPfL_tRyv6Qs5RAoV8JwV2UtPrDImdSZ-5WiTJKd1y1nuVM-saxxWYA1asa5zFqkALDG0ptHc9g-pwJXl5SkFc6A_Qszb8Tr6Y0qrg7odVsGF6f1LejRHiyTGqdtICtMH8lWeHky0LwakwaMT4-xJhiLDBh2LgTEtNOZbMwemeeAYzjJdEpJSBa6RK',
      altText: 'Chicken Dum Biryani',
    },
  ],

  floorTables: [
    { id: 'T01', name: 'T01', capacity: 4, section: 'main', status: 'occupied', guestsCount: 4, server: 'Sunil R.', orderInfo: 'Occupied (30m)', amount: 1540, timeSeated: '30m' },
    { id: 'T02', name: 'T02', capacity: 2, section: 'main', status: 'occupied', guestsCount: 2, server: 'Floor Staff', orderInfo: 'Occupied (15m)', amount: 840, timeSeated: '15m' },
    { id: 'T03', name: 'T03', capacity: 2, section: 'main', status: 'available', orderInfo: 'Available' },
    { id: 'T04', name: 'T04', capacity: 4, section: 'main', status: 'occupied', guestsCount: 2, server: 'Floor Staff', orderInfo: 'Occupied (ORD-10481)', amount: 1260, timeSeated: '18m' },
    { id: 'T05', name: 'T05', capacity: 6, section: 'main', status: 'reserved', orderInfo: 'Reserved (20:45 PM)', customerName: 'Dr. Alok Verma' },
    { id: 'T06', name: 'T06', capacity: 4, section: 'main', status: 'occupied', guestsCount: 4, server: 'Rajesh P.', orderInfo: 'Occupied (50m)', amount: 2890, timeSeated: '50m' },
    { id: 'T07', name: 'T07', capacity: 4, section: 'main', status: 'available', orderInfo: 'Available' },
    { id: 'T08', name: 'T08', capacity: 6, section: 'main', status: 'occupied', guestsCount: 5, server: 'Sunil R.', orderInfo: 'Occupied (Rahul K.)', amount: 2450, timeSeated: '44m' },
    { id: 'T09', name: 'T09', capacity: 2, section: 'main', status: 'cleaning', orderInfo: 'Cleaning' },
    { id: 'T10', name: 'T10', capacity: 4, section: 'main', status: 'occupied', guestsCount: 3, server: 'Meera K.', orderInfo: 'Occupied', amount: 1980, timeSeated: '26m' },
    { id: 'T11', name: 'T11', capacity: 2, section: 'main', status: 'occupied', guestsCount: 2, server: 'Floor Staff', orderInfo: 'Occupied', amount: 920, timeSeated: '15m' },
    {
      id: 'T12',
      name: 'T12',
      capacity: 4,
      section: 'main',
      status: 'occupied',
      guestsCount: 4,
      server: 'Sunil R.',
      customerName: 'Ananya Verma',
      orderInfo: 'Occupied • #ORD-10482',
      timeSeated: '42m',
      amount: 1840,
      activeTarget: true,
    },
    { id: 'T13', name: 'T13', capacity: 4, section: 'patio', status: 'available', orderInfo: 'Available' },
    { id: 'T14', name: 'T14', capacity: 8, section: 'patio', status: 'occupied', guestsCount: 6, server: 'Rajesh P.', orderInfo: 'Occupied', amount: 4120, timeSeated: '35m' },
    { id: 'T15', name: 'T15', capacity: 2, section: 'patio', status: 'reserved', orderInfo: 'Reserved', customerName: 'Rajiv Mehra' },
    { id: 'T16', name: 'T16', capacity: 4, section: 'patio', status: 'occupied', guestsCount: 2, server: 'Rajesh P.', orderInfo: 'Occupied (Rohan M.)', amount: 1590, timeSeated: '21m' },
    { id: 'T17', name: 'T17', capacity: 2, section: 'patio', status: 'occupied', guestsCount: 2, server: 'Sunil R.', orderInfo: 'Occupied', amount: 1100, timeSeated: '12m' },
    { id: 'T18', name: 'T18', capacity: 4, section: 'patio', status: 'cleaning', orderInfo: 'Cleaning' },
    { id: 'T19', name: 'T19', capacity: 2, section: 'vip', status: 'available', orderInfo: 'Available' },
    { id: 'T20', name: 'T20', capacity: 4, section: 'vip', status: 'occupied', guestsCount: 4, server: 'Sunil R.', orderInfo: 'Occupied', amount: 3200, timeSeated: '40m' },
    { id: 'T21', name: 'T21', capacity: 6, section: 'vip', status: 'occupied', guestsCount: 6, server: 'Floor Staff', orderInfo: 'Occupied', amount: 5600, timeSeated: '55m' },
    { id: 'T22', name: 'T22', capacity: 2, section: 'vip', status: 'reserved', orderInfo: 'Reserved', customerName: 'Karan Singhania' },
    { id: 'T23', name: 'T23', capacity: 4, section: 'bar', status: 'available', orderInfo: 'Available' },
    { id: 'T24', name: 'T24', capacity: 8, section: 'bar', status: 'occupied', guestsCount: 8, server: 'Rajesh P.', orderInfo: 'Occupied', amount: 6800, timeSeated: '48m' },
  ],

  reservations: [
    {
      id: 'RES-401',
      guestName: 'Dr. Alok Verma',
      phone: '+91 98201 44821',
      timeSlot: '20:45 PM',
      pax: 6,
      table: 'Table T-05 (Terrace)',
      status: 'confirmed',
      statusLabel: 'Confirmed',
      isVip: true,
      vipTier: 'VIP Platinum',
      occasion: 'Anniversary Dinner',
      notes: 'Prefers quiet corner table, strict gluten-free for 1 pax',
      depositAmount: 2000,
      date: '2026-09-16',
    },
    {
      id: 'RES-402',
      guestName: 'Sunita Rao',
      phone: '+91 98450 11992',
      timeSlot: '20:30 PM',
      pax: 4,
      table: 'Table T-12 (Main)',
      status: 'seated',
      statusLabel: 'Seated (42m)',
      isVip: true,
      vipTier: 'VIP Gold',
      occasion: 'Family Dinner',
      notes: 'High chair required for toddler',
      depositAmount: 1000,
      date: '2026-09-16',
    },
    {
      id: 'RES-403',
      guestName: 'Rajiv Mehra',
      phone: '+91 97110 88234',
      timeSlot: '21:00 PM',
      pax: 2,
      table: 'Table T-15 (VIP Alcove)',
      status: 'confirmed',
      statusLabel: 'Confirmed',
      occasion: 'Business Meeting',
      notes: 'Window side preferred',
      depositAmount: 1500,
      date: '2026-09-16',
    },
    {
      id: 'RES-404',
      guestName: 'Karan Singhania',
      phone: '+91 99881 22301',
      timeSlot: '21:15 PM',
      pax: 8,
      table: 'Table T-21 (Private)',
      status: 'waitlist',
      statusLabel: 'Waitlist #1',
      isVip: true,
      vipTier: 'VIP Gold',
      occasion: 'Birthday Party',
      notes: 'Pre-ordered custom cake delivery at 21:30',
      date: '2026-09-16',
    },
  ],

  inventory: [
    {
      id: 'ING-014',
      name: 'Fresh Paneer (Malai Block)',
      category: 'Dairy',
      currentStock: 4.5,
      unit: 'kg',
      parLevel: 25,
      reorderPoint: 8,
      unitCost: 320,
      valuation: 1440,
      status: 'low',
      supplier: 'Amul Dairy Dist. Bangalore',
    },
    {
      id: 'ING-008',
      name: 'Spring Chicken (Skinless Cut)',
      category: 'Meat',
      currentStock: 18.2,
      unit: 'kg',
      parLevel: 40,
      reorderPoint: 15,
      unitCost: 220,
      valuation: 4004,
      status: 'healthy',
      supplier: 'Suguna Fresh Meats',
    },
    {
      id: 'ING-032',
      name: 'Basmati Rice (Daawat Royal)',
      category: 'Staples',
      currentStock: 95.0,
      unit: 'kg',
      parLevel: 150,
      reorderPoint: 40,
      unitCost: 110,
      valuation: 10450,
      status: 'healthy',
      supplier: 'Metro Cash & Carry',
    },
    {
      id: 'ING-055',
      name: 'Amul Salted Butter (500g)',
      category: 'Dairy',
      currentStock: 2.0,
      unit: 'blocks',
      parLevel: 20,
      reorderPoint: 5,
      unitCost: 275,
      valuation: 550,
      status: 'critical',
      supplier: 'Amul Direct Depot',
    },
    {
      id: 'ING-091',
      name: 'Kashmiri Deggi Mirch Powder',
      category: 'Spices',
      currentStock: 12.5,
      unit: 'kg',
      parLevel: 15,
      reorderPoint: 4,
      unitCost: 550,
      valuation: 6875,
      status: 'healthy',
      supplier: 'MDH Wholesale Hub',
    },
  ],

  wasteLogs: [
    { id: 'W-01', item: 'Boiled Basmati Rice', qty: '1.2 kg', reason: 'Overcooked texture', cost: 132, loggedAt: new Date().toISOString() },
    { id: 'W-02', item: 'Chopped Onions', qty: '0.8 kg', reason: 'End of shift prep overflow', cost: 48, loggedAt: new Date().toISOString() },
  ],

  customers: [
    {
      id: 'CUST-801',
      name: 'Dr. Alok Verma',
      phone: '+91 98201 44821',
      tier: 'Platinum',
      visits: 28,
      totalSpend: 54200,
      points: 5420,
      preferredTable: 'Table T-05 (Terrace)',
      dietaryTags: ['Gluten-Free', 'High Spiced'],
      lastVisit: 'Today (Dinner)',
    },
    {
      id: 'CUST-802',
      name: 'Ananya Verma',
      phone: '+91 98201 44821',
      tier: 'Gold',
      visits: 19,
      totalSpend: 36400,
      points: 3640,
      preferredTable: 'Table T-12 (Main)',
      dietaryTags: ['Less Oil', 'Butter Chicken Fan'],
      lastVisit: 'Today (Dinner)',
    },
    {
      id: 'CUST-803',
      name: 'Vikram Malhotra',
      phone: '+91 98334 11204',
      tier: 'Gold',
      visits: 14,
      totalSpend: 28900,
      points: 2890,
      preferredTable: 'Table T-04',
      dietaryTags: ['Non-Veg', 'Craft Beer'],
      lastVisit: 'Today (Dinner)',
    },
    {
      id: 'CUST-804',
      name: 'Priya Singh',
      phone: '+91 97110 39201',
      tier: 'Silver',
      visits: 8,
      totalSpend: 14800,
      points: 1480,
      preferredTable: 'Takeaway Counter',
      dietaryTags: ['Vegetarian', 'Biryani Lover'],
      lastVisit: 'Today (Pickup)',
    },
    {
      id: 'CUST-805',
      name: 'Rahul Kapoor',
      phone: '+91 98450 77123',
      tier: 'Platinum',
      visits: 34,
      totalSpend: 68400,
      points: 6840,
      preferredTable: 'Table T-08',
      dietaryTags: ['Family Dining', 'Celebration Host'],
      lastVisit: 'Today (Dinner)',
    },
  ],

  staff: [
    {
      id: 'EMP-001',
      name: 'Operations Manager',
      role: 'General Manager',
      department: 'Management',
      clockInTime: '17:30 IST',
      status: 'active',
      station: 'Operations Dispatch Hub',
      pinAuthLevel: 'Master (L4)',
      tipsEarned: 0,
    },
    {
      id: 'EMP-004',
      name: 'Chef Harish Rawat',
      role: 'Executive Head Chef',
      department: 'Kitchen',
      clockInTime: '17:00 IST',
      status: 'active',
      station: 'Curry & Master Station',
      pinAuthLevel: 'Supervisor (L3)',
      tipsEarned: 640,
    },
    {
      id: 'EMP-012',
      name: 'Sunil Rathod',
      role: 'Lead Floor Captain',
      department: 'Service',
      clockInTime: '17:45 IST',
      status: 'active',
      station: 'Main Dining Hall (T01-T12)',
      pinAuthLevel: 'Supervisor (L3)',
      tipsEarned: 820,
    },
    {
      id: 'EMP-018',
      name: 'Meera Kumari',
      role: 'Cashier & POS Lead',
      department: 'Cashier',
      clockInTime: '18:00 IST',
      status: 'active',
      station: 'Billing Counter POS 01',
      pinAuthLevel: 'Floor (L2)',
      tipsEarned: 520,
    },
    {
      id: 'EMP-022',
      name: 'Rajesh Paswan',
      role: 'Senior Server',
      department: 'Service',
      clockInTime: '18:10 IST',
      status: 'active',
      station: 'Terrace & Lounge (T13-T24)',
      pinAuthLevel: 'Floor (L2)',
      tipsEarned: 740,
    },
  ],

  settings: {
    storeName: 'SpiceRoute Gourmet Hospitality LLP',
    brandName: 'SpiceRoute Kitchen #01 (MG Road)',
    gstin: '29AAAAA0000A1Z5',
    fssai: '11223344000192',
    address: '#42 MG Road, Brigade Junction, Bengaluru 560001',
    cgstRate: 2.5,
    sgstRate: 2.5,
    serviceChargeRate: 5.0,
    vatRate: 18.0,
    autoKdsSync: true,
    chimeSound: true,
  },

  peripherals: [
    {
      id: 'DEV-01',
      name: 'Billing Master Receipt Printer',
      deviceType: 'Thermal ESC/POS 80mm',
      model: 'Epson TM-T88VI',
      ipAddress: '192.168.1.120:9100',
      status: 'online',
      lastPing: 4,
    },
    {
      id: 'DEV-02',
      name: 'Tandoor & Starters KOT Printer',
      deviceType: 'Thermal Auto-Cutter',
      model: 'TVS RP-3200 Star',
      ipAddress: '192.168.1.121:9100',
      status: 'low_paper',
      lastPing: 8,
    },
    {
      id: 'DEV-03',
      name: 'Curry Station Kitchen Printer',
      deviceType: 'Dot-Matrix Impact Ribbon',
      model: 'Epson TM-U220B (Red/Black)',
      ipAddress: '192.168.1.122:9100',
      status: 'online',
      lastPing: 6,
    },
    {
      id: 'DEV-04',
      name: 'PineLabs Plutus EDC Terminal',
      deviceType: 'Android Cloud POS Terminal',
      model: 'PineLabs V200T',
      ipAddress: 'Cloud API Webhook (PL-882194)',
      status: 'online',
      lastPing: 12,
    },
  ],

  analytics: {
    todayRevenue: 48620,
    yesterdayRevenue: 41050,
    totalOrders: 127,
    aov: 383,
    occupancyPct: 78,
    activeTables: 19,
    totalTables: 24,
    pendingOrdersCount: 8,
    mtdRevenue: 486200,
    foodCostPct: 28.2,
    netMarginPct: 30.0,
    avgTurnaround: '16.4m',
  },

  coupons: [
    {
      code: 'SPICE10',
      description: '10% Off Happy Hour & Dining Special',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 300,
      maxDiscountAmount: 500,
      active: true,
      usageCount: 42,
      expiryDate: '2026-12-31',
    },
    {
      code: 'WELCOME20',
      description: '20% Off First-Time Guest Welcome',
      discountType: 'percentage',
      discountValue: 20,
      minOrderAmount: 500,
      maxDiscountAmount: 300,
      active: true,
      usageCount: 18,
      expiryDate: '2026-12-31',
    },
    {
      code: 'FESTIVE100',
      description: 'Flat ₹100 Off on orders above ₹800',
      discountType: 'fixed',
      discountValue: 100,
      minOrderAmount: 800,
      maxDiscountAmount: 100,
      active: true,
      usageCount: 29,
      expiryDate: '2026-10-31',
    },
    {
      code: 'HAPPYHOUR',
      description: '15% Off Afternoon Appetizers & Drinks (3PM - 7PM)',
      discountType: 'percentage',
      discountValue: 15,
      minOrderAmount: 400,
      maxDiscountAmount: 400,
      active: true,
      usageCount: 14,
      expiryDate: '2026-12-31',
    },
  ],

  deliveryDrivers: [
    {
      id: 'DRV-101',
      name: 'Ramesh Kumar',
      phone: '+91 98450 11992',
      vehicle: 'EV Bike (KA-01-EA-4921)',
      lat: 12.9352,
      lng: 77.6245,
      status: 'on_the_way',
      etaMinutes: 8,
      activeOrderId: '#ORD-10477',
      destination: 'Koramangala 4th Block',
      customerName: 'Amit Joshi',
      itemsSummary: '1x Butter Chicken, 2x Naan',
      lastPing: new Date().toISOString(),
    },
    {
      id: 'DRV-102',
      name: 'Suresh Gowda',
      phone: '+91 98220 44511',
      vehicle: 'Hero Splendor (KA-03-HJ-8812)',
      lat: 12.9784,
      lng: 77.6408,
      status: 'on_the_way',
      etaMinutes: 12,
      activeOrderId: '#ORD-10476',
      destination: 'Indiranagar 100ft Road',
      customerName: 'Sneha Roy',
      itemsSummary: '2x Chicken Dum Biryani, 1x Raita',
      lastPing: new Date().toISOString(),
    },
    {
      id: 'DRV-103',
      name: 'Vikas Patil',
      phone: '+91 98110 33420',
      vehicle: 'Ather 450X (KA-04-EK-9022)',
      lat: 12.9698,
      lng: 77.5998,
      status: 'picking_up',
      etaMinutes: 4,
      activeOrderId: '#ORD-10474',
      destination: 'Lavelle Road Residency',
      customerName: 'Rohan Deshmukh',
      itemsSummary: '1x Paneer Tikka, 1x Dal Makhani',
      lastPing: new Date().toISOString(),
    },
    {
      id: 'DRV-104',
      name: 'Manjunath R.',
      phone: '+91 98990 77112',
      vehicle: 'TVS iQube (KA-01-MP-1104)',
      lat: 12.9716,
      lng: 77.5946,
      status: 'idle',
      etaMinutes: 0,
      activeOrderId: null,
      destination: null,
      customerName: null,
      itemsSummary: null,
      lastPing: new Date().toISOString(),
    },
  ],

  splitPayments: [
    {
      id: 'SPLIT-1001',
      orderId: '#ORD-10482',
      tableId: 'Table T-12',
      totalAmount: 1840,
      splits: [
        { guestIndex: 1, guestName: 'Guest 1', amount: 460, method: 'UPI', refNumber: 'UPI-9821' },
        { guestIndex: 2, guestName: 'Guest 2', amount: 460, method: 'UPI', refNumber: 'UPI-9822' },
        { guestIndex: 3, guestName: 'Guest 3', amount: 460, method: 'Card', refNumber: 'EDC-8812' },
        { guestIndex: 4, guestName: 'Guest 4', amount: 460, method: 'Cash', refNumber: 'CSH-01' },
      ],
      tipAmount: 100,
      settledAt: new Date().toISOString(),
      status: 'completed',
    },
  ],

  tipPoolDistributions: [
    {
      id: 'TIP-881',
      date: '2026-09-15',
      shift: 'Dinner Shift',
      totalTipsCollected: 3840,
      staffCount: 5,
      sharePerStaff: 768,
      distributedBy: 'General Manager',
      distributedAt: new Date().toISOString(),
      recipients: [
        { staffId: 'EMP-004', name: 'Chef Harish Rawat', amount: 768 },
        { staffId: 'EMP-012', name: 'Sunil Rathod', amount: 768 },
        { staffId: 'EMP-018', name: 'Meera Kumari', amount: 768 },
        { staffId: 'EMP-022', name: 'Rajesh Paswan', amount: 768 },
        { staffId: 'EMP-001', name: 'Operations Lead', amount: 768 },
      ],
    },
  ],

  reservationDeposits: [
    {
      id: 'DEP-401',
      reservationId: 'RES-401',
      guestName: 'Dr. Alok Verma',
      amount: 2000,
      paymentMethod: 'UPI',
      status: 'secured',
      transactionRef: 'DEP-TXN-882194',
      date: '2026-09-16',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'DEP-402',
      reservationId: 'RES-402',
      guestName: 'Sunita Rao',
      amount: 1000,
      paymentMethod: 'Card',
      status: 'adjusted_in_bill',
      transactionRef: 'DEP-TXN-882195',
      date: '2026-09-16',
      createdAt: new Date().toISOString(),
    },
  ],

  tableSessions: [
    {
      id: 'SESS-101',
      tableId: 'T12',
      tableName: 'Table T-12',
      section: 'main',
      pax: 4,
      server: 'Sunil R.',
      customerName: 'Ananya Verma',
      seatedAt: new Date(Date.now() - 42 * 60000).toISOString(),
      releasedAt: null,
      durationMinutes: 42,
      totalBill: 1840,
      status: 'active',
    },
    {
      id: 'SESS-102',
      tableId: 'T04',
      tableName: 'Table T-04',
      section: 'main',
      pax: 2,
      server: 'Floor Staff',
      customerName: 'Vikram Malhotra',
      seatedAt: new Date(Date.now() - 18 * 60000).toISOString(),
      releasedAt: null,
      durationMinutes: 18,
      totalBill: 1260,
      status: 'active',
    },
    {
      id: 'SESS-100',
      tableId: 'T08',
      tableName: 'Table T-08',
      section: 'main',
      pax: 5,
      server: 'Sunil R.',
      customerName: 'Rahul Kapoor',
      seatedAt: new Date(Date.now() - 90 * 60000).toISOString(),
      releasedAt: new Date(Date.now() - 10 * 60000).toISOString(),
      durationMinutes: 80,
      totalBill: 2450,
      status: 'completed',
    },
  ],

  marketingCampaigns: [
    {
      id: 'CMP-801',
      title: 'Weekend Saffron Biryani Feast',
      channel: 'WhatsApp & SMS',
      targetTier: 'Platinum & Gold VIP',
      targetAudienceCount: 342,
      template: 'Namaste {{guest_name}}! ✨ Exclusive VIP invite for this weekend at SpiceRoute Kitchen. Enjoy a complimentary Chef Tasting Platter with your table booking. Use code SPICE10 for 10% off. Reserve now!',
      status: 'SENT',
      dispatchedAt: new Date(Date.now() - 3600000).toISOString(),
      deliveredCount: 338,
      readCount: 295,
      conversions: 24,
    },
  ],

  tillSessions: [
    {
      id: 'TILL-901',
      date: '2026-09-16',
      shift: 'Dinner Shift 02',
      cashierName: 'Meera Kumari',
      openingFloat: 5000,
      cashSalesCollected: 23450,
      cashPayouts: 0,
      expectedCash: 28450,
      actualCountedCash: 28450,
      discrepancy: 0,
      status: 'open',
      openedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
      closedAt: null,
    },
  ],

  kdsSlaLogs: [
    {
      id: 'SLA-101',
      ticketId: '#KOT-846',
      orderId: '#ORD-10480',
      station: 'Pantry',
      targetMinutes: 15,
      actualMinutes: 6,
      onTime: true,
      bumpedAt: new Date(Date.now() - 120000).toISOString(),
    },
    {
      id: 'SLA-102',
      ticketId: '#KOT-844',
      orderId: '#ORD-10477',
      station: 'Curry',
      targetMinutes: 15,
      actualMinutes: 13,
      onTime: true,
      bumpedAt: new Date(Date.now() - 600000).toISOString(),
    },
  ],
};

class Database {
  private data: DbSchema;

  constructor() {
    this.data = this.loadData();
    this.recalculateAnalytics();
  }

  private loadData(): DbSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        // Ensure new collections exist even on legacy db.json
        if (!parsed.coupons) parsed.coupons = SEED_DATA.coupons;
        if (!parsed.deliveryDrivers) parsed.deliveryDrivers = SEED_DATA.deliveryDrivers;
        if (!parsed.splitPayments) parsed.splitPayments = SEED_DATA.splitPayments;
        if (!parsed.tipPoolDistributions) parsed.tipPoolDistributions = SEED_DATA.tipPoolDistributions;
        if (!parsed.reservationDeposits) parsed.reservationDeposits = SEED_DATA.reservationDeposits;
        if (!parsed.tableSessions) parsed.tableSessions = SEED_DATA.tableSessions;
        if (!parsed.marketingCampaigns) parsed.marketingCampaigns = SEED_DATA.marketingCampaigns;
        if (!parsed.tillSessions) parsed.tillSessions = SEED_DATA.tillSessions;
        if (!parsed.kdsSlaLogs) parsed.kdsSlaLogs = SEED_DATA.kdsSlaLogs;

        // Ensure menu items have recipe BOMs
        if (Array.isArray(parsed.menuItems)) {
          parsed.menuItems.forEach((m: any) => {
            if (!m.recipeIngredients) {
              const seedDish = SEED_DATA.menuItems.find((sm) => sm.id === m.id || sm.name === m.name);
              if (seedDish?.recipeIngredients) {
                m.recipeIngredients = seedDish.recipeIngredients;
              }
            }
          });
        }
        return parsed;
      }
    } catch (err) {
      console.error('Error reading db.json, falling back to seed data:', err);
    }
    this.saveData(SEED_DATA);
    return JSON.parse(JSON.stringify(SEED_DATA));
  }

  public saveData(customData?: DbSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(customData || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving db.json:', err);
    }
  }

  // Dynamic Telemetry & Analytics calculation
  public recalculateAnalytics() {
    const orders = this.data.orders || [];
    const tables = this.data.floorTables || [];

    // Base figures plus real order sum
    const baseRevenue = 40000;
    const liveOrdersRevenue = orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
    const todayRevenue = baseRevenue + liveOrdersRevenue;
    const totalOrders = 120 + orders.length;
    const aov = totalOrders > 0 ? Math.round(todayRevenue / totalOrders) : 0;

    const totalTables = tables.length || 24;
    const occupiedTables = tables.filter((t) => t.status === 'occupied').length;
    const occupancyPct = totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0;

    const pendingOrdersCount = orders.filter((o) => o.kitchenStatus !== 'completed').length + 2;

    this.data.analytics = {
      ...this.data.analytics,
      todayRevenue,
      yesterdayRevenue: 41050,
      totalOrders,
      aov,
      occupancyPct,
      activeTables: occupiedTables,
      totalTables,
      pendingOrdersCount,
      mtdRevenue: todayRevenue * 10,
      foodCostPct: 28.2,
      netMarginPct: 30.0,
      avgTurnaround: '16.4m',
    };

    return this.data.analytics;
  }

  // Dynamic Hourly Analytics
  public getHourlyAnalytics() {
    const orders = this.data.orders || [];
    const base = [
      { hour: '12 PM', revenue: 2400, orders: 8 },
      { hour: '2 PM', revenue: 4200, orders: 14 },
      { hour: '4 PM', revenue: 1800, orders: 6 },
      { hour: '6 PM', revenue: 5600, orders: 18 },
      { hour: '7 PM', revenue: 7800, orders: 22 },
      { hour: '8:30 PM', revenue: 9400, orders: 24 },
      { hour: '10 PM', revenue: 6200, orders: 16 },
      { hour: '11 PM', revenue: 3100, orders: 9 },
    ];

    // Add live orders dynamically to the closest peak hour (8:30 PM & 10 PM)
    const recentRevenue = orders.slice(0, 5).reduce((acc, o) => acc + (Number(o.total) || 0), 0);
    const recentCount = orders.slice(0, 5).length;

    base[5].revenue += recentRevenue;
    base[5].orders += recentCount;

    // Find peak hour
    let maxRev = 0;
    let peakIndex = 5;
    base.forEach((b, idx) => {
      if (b.revenue > maxRev) {
        maxRev = b.revenue;
        peakIndex = idx;
      }
    });

    return base.map((b, idx) => ({
      ...b,
      isPeak: idx === peakIndex,
    }));
  }

  // Dynamic Channel Analytics
  public getChannelAnalytics() {
    const orders = this.data.orders || [];
    let dineInRev = 0;
    let takeawayRev = 0;
    let deliveryRev = 0;

    orders.forEach((o) => {
      const type = (o.tableType || o.table || '').toLowerCase();
      const total = Number(o.total) || 0;
      if (type.includes('takeaway') || type.includes('counter')) {
        takeawayRev += total;
      } else if (type.includes('swiggy') || type.includes('zomato') || type.includes('delivery')) {
        deliveryRev += total;
      } else {
        dineInRev += total;
      }
    });

    const baseDine = 311168 + dineInRev;
    const baseTake = 106964 + takeawayRev;
    const baseDel = 68068 + deliveryRev;
    const total = baseDine + baseTake + baseDel;

    return {
      total,
      dineIn: { amount: baseDine, pct: Math.round((baseDine / total) * 100) },
      takeaway: { amount: baseTake, pct: Math.round((baseTake / total) * 100) },
      delivery: { amount: baseDel, pct: Math.round((baseDel / total) * 100) },
    };
  }

  // Dynamic Popular Dishes
  public getPopularDishes() {
    const menu = this.data.menuItems || [];
    const orders = this.data.orders || [];

    const countMap: Record<string, { count: number; revenue: number }> = {};
    orders.forEach((o) => {
      if (Array.isArray(o.lineItems)) {
        o.lineItems.forEach((li: any) => {
          const name = li.name?.replace(/\s*\([^)]*\)/g, '').trim() || 'Dish';
          if (!countMap[name]) countMap[name] = { count: 0, revenue: 0 };
          const qty = Number(li.qty) || 1;
          const price = Number(li.price) || 200;
          countMap[name].count += qty;
          countMap[name].revenue += qty * price;
        });
      }
    });

    return menu.slice(0, 5).map((m) => {
      const extra = countMap[m.name] || { count: 0, revenue: 0 };
      const baseOrders = m.id === 'm2' ? 142 : m.id === 'm1' ? 118 : m.id === 'm9' ? 84 : m.id === 'm8' ? 195 : 97;
      const totalCount = baseOrders + extra.count;
      const totalRevenue = totalCount * m.price;
      return {
        id: m.id,
        name: m.name,
        isVeg: m.isVeg,
        ordersCount: totalCount,
        revenue: totalRevenue,
        growth: '+18%',
        isPositiveGrowth: true,
        imageUrl: m.imageUrl,
        altText: m.name,
      };
    });
  }

  // Dynamic Pipeline Segments
  public getPipelineSegments() {
    const orders = this.data.orders || [];
    let newCount = 0;
    let prepCount = 0;
    let readyCount = 0;
    let compCount = 100;
    let cancelCount = 0;

    orders.forEach((o) => {
      const status = (o.kitchenStatus || '').toLowerCase();
      if (status === 'new') newCount += 1;
      else if (status === 'prep' || status === 'cooking' || status === 'preparing') prepCount += 1;
      else if (status === 'ready') readyCount += 1;
      else if (status === 'completed' || o.paymentStatus === 'paid') compCount += 1;
      else if (status === 'cancelled') cancelCount += 1;
      else newCount += 1;
    });

    const total = newCount + prepCount + readyCount + compCount + cancelCount || 1;

    return [
      {
        id: 'new',
        label: 'New Queue',
        count: newCount,
        color: 'bg-primary-container',
        dotColor: 'bg-primary-container',
        width: `${Math.max(5, Math.round((newCount / total) * 100))}%`,
        textClass: 'text-on-surface',
      },
      {
        id: 'preparing',
        label: 'Preparing',
        count: prepCount,
        color: 'bg-tertiary-container',
        dotColor: 'bg-tertiary',
        width: `${Math.max(5, Math.round((prepCount / total) * 100))}%`,
        textClass: 'text-tertiary',
      },
      {
        id: 'ready',
        label: 'Ready',
        count: readyCount,
        color: 'bg-secondary',
        dotColor: 'bg-secondary',
        width: `${Math.max(4, Math.round((readyCount / total) * 100))}%`,
        textClass: 'text-secondary',
      },
      {
        id: 'completed',
        label: 'Completed',
        count: compCount,
        color: 'bg-surface-bright',
        dotColor: 'bg-surface-variant',
        width: `${Math.max(40, Math.round((compCount / total) * 100))}%`,
        textClass: 'text-on-surface',
      },
      {
        id: 'cancelled',
        label: 'Cancelled',
        count: cancelCount,
        color: 'bg-error',
        dotColor: 'bg-error',
        width: cancelCount > 0 ? `${Math.round((cancelCount / total) * 100)}%` : '0%',
        textClass: 'text-on-surface-variant',
      },
    ];
  }

  // Getters
  public getDb(): DbSchema {
    return this.data;
  }

  // Orders
  public getOrders() {
    return this.data.orders;
  }

  public getOrderById(id: string) {
    return this.data.orders.find((o) => o.id === id);
  }

  public addOrder(order: any) {
    const id = `#ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const lineItems = order.lineItems || [];
    const subtotal = order.subtotal || lineItems.reduce((acc: number, li: any) => acc + (li.price * (li.qty || 1)), 0);
    const taxes = order.taxes || Math.round(subtotal * 0.05);
    const serviceCharge = order.serviceCharge || Math.round(subtotal * 0.05);
    const total = order.total || (subtotal + taxes + serviceCharge);

    const newOrder = {
      id,
      createdAt: new Date().toISOString(),
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      kitchenStatus: 'new',
      kitchenTime: 'New (1m)',
      itemsCount: lineItems.length || order.itemsCount || 1,
      itemsSummary: lineItems.map((li: any) => li.name).join(', ') || order.itemsSummary || 'Special Order',
      subtotal,
      taxes,
      serviceCharge,
      total,
      ...order,
    };
    this.data.orders.unshift(newOrder);

    // Also auto-generate KDS ticket
    const kotId = `#KOT-${Math.floor(800 + Math.random() * 200)}`;
    const newTicket = {
      id: kotId,
      orderId: id,
      table: order.table || 'Table T-01',
      orderType: order.tableType?.includes('Dine') ? 'Dine-In' : 'Takeaway',
      pax: order.pax || 2,
      server: order.staff || 'Floor Staff',
      elapsedMinutes: 1,
      status: 'new',
      createdAt: new Date().toISOString(),
      items: lineItems.map((li: any, idx: number) => ({
        id: `k-${Date.now()}-${idx}`,
        name: li.name,
        qty: li.qty || 1,
        station: li.station || 'Curry',
        isDone: false,
        modifiers: li.modifiers,
      })),
    };
    this.data.kdsTickets.unshift(newTicket);

    // Update table status if table order
    const tableId = (order.table || '').replace('Table ', '').trim();
    if (tableId) {
      const targetTable = this.data.floorTables.find((t) => t.id === tableId || t.name === tableId);
      if (targetTable) {
        targetTable.status = 'occupied';
        targetTable.amount = total;
        targetTable.timeSeated = 'Just Seated';
        targetTable.orderInfo = `Occupied • ${id}`;
        // Async cloud update for table
        insforgeAdmin.database.from('floor_tables').update({
          status: 'occupied',
          amount: total,
          order_info: `Occupied • ${id}`,
        }).eq('id', targetTable.id).then().catch(() => {});
      }
    }

    // Deduct stock if ingredients matched
    lineItems.forEach((li: any) => {
      const name = (li.name || '').toLowerCase();
      if (name.includes('paneer')) {
        this.updateStock('ING-014', Math.max(0, (this.data.inventory.find((i) => i.id === 'ING-014')?.currentStock || 4.5) - 0.25));
      }
      if (name.includes('chicken')) {
        this.updateStock('ING-008', Math.max(0, (this.data.inventory.find((i) => i.id === 'ING-008')?.currentStock || 18.2) - 0.35));
      }
      if (name.includes('biryani') || name.includes('rice')) {
        this.updateStock('ING-032', Math.max(0, (this.data.inventory.find((i) => i.id === 'ING-032')?.currentStock || 95.0) - 0.30));
      }
    });

    this.recalculateAnalytics();
    this.saveData();

    // Async sync to InsForge PostgreSQL
    insforgeAdmin.database.from('orders').insert([{
      id: newOrder.id,
      terminal: newOrder.terminal,
      table_name: newOrder.table,
      table_type: newOrder.tableType,
      customer: newOrder.customer,
      phone: newOrder.phone,
      items_summary: newOrder.itemsSummary,
      items_count: newOrder.itemsCount,
      staff: newOrder.staff,
      total: newOrder.total,
      subtotal: newOrder.subtotal,
      taxes: newOrder.taxes,
      service_charge: newOrder.serviceCharge,
      payment_status: newOrder.paymentStatus,
      payment_method: newOrder.paymentMethod,
      kitchen_status: newOrder.kitchenStatus,
      kitchen_time: newOrder.kitchenTime,
      time: newOrder.time,
      line_items: newOrder.lineItems,
      created_at: newOrder.createdAt,
    }]).then().catch((err) => console.warn('InsForge async insert order error:', err.message));

    insforgeAdmin.database.from('kds_tickets').insert([{
      id: newTicket.id,
      order_id: newTicket.orderId,
      table_name: newTicket.table,
      order_type: newTicket.orderType,
      pax: newTicket.pax,
      server: newTicket.server,
      elapsed_minutes: newTicket.elapsedMinutes,
      is_urgent: newTicket.isUrgent || false,
      status: newTicket.status,
      items: newTicket.items,
      created_at: newTicket.createdAt,
    }]).then().catch((err) => console.warn('InsForge async insert kds error:', err.message));

    return { order: newOrder, kdsTicket: newTicket };
  }

  public updateOrderStatus(id: string, updates: Partial<any>) {
    const order = this.data.orders.find((o) => o.id === id);
    if (order) {
      Object.assign(order, updates);
      this.recalculateAnalytics();
      this.saveData();

      // Async update in InsForge
      insforgeAdmin.database.from('orders').update({
        payment_status: order.paymentStatus,
        payment_method: order.paymentMethod,
        kitchen_status: order.kitchenStatus,
        kitchen_time: order.kitchenTime,
      }).eq('id', id).then().catch(() => {});
    }
    return order;
  }

  // KDS Tickets
  public getKdsTickets() {
    return this.data.kdsTickets;
  }

  public updateKdsItemDone(ticketId: string, itemId: string) {
    const ticket = this.data.kdsTickets.find((t) => t.id === ticketId);
    if (ticket) {
      const item = ticket.items.find((i: any) => i.id === itemId);
      if (item) {
        item.isDone = !item.isDone;
      }
      const allDone = ticket.items.every((i: any) => i.isDone);
      ticket.status = allDone ? 'ready' : 'cooking';
      this.recalculateAnalytics();
      this.saveData();

      // Async update in InsForge
      insforgeAdmin.database.from('kds_tickets').update({
        status: ticket.status,
        items: ticket.items,
      }).eq('id', ticketId).then().catch(() => {});
    }
    return ticket;
  }

  public bumpKdsTicket(ticketId: string) {
    const index = this.data.kdsTickets.findIndex((t) => t.id === ticketId);
    if (index !== -1) {
      const ticket = this.data.kdsTickets[index];
      ticket.status = 'ready';

      // Record SLA prep duration
      const createdAtTime = ticket.createdAt ? new Date(ticket.createdAt).getTime() : Date.now() - 10 * 60000;
      const actualPrepMinutes = Math.max(1, Math.round((Date.now() - createdAtTime) / 60000));

      if (!this.data.kdsSlaLogs) this.data.kdsSlaLogs = [];
      this.data.kdsSlaLogs.unshift({
        id: `SLA-${Date.now().toString().slice(-4)}`,
        ticketId: ticket.id,
        orderId: ticket.orderId,
        station: ticket.items?.[0]?.station || 'Kitchen',
        targetMinutes: 15,
        actualMinutes: actualPrepMinutes,
        onTime: actualPrepMinutes <= 15,
        bumpedAt: new Date().toISOString(),
      });

      // Also update parent order if exists
      const order = this.data.orders.find((o) => o.id === ticket.orderId);
      if (order) {
        order.kitchenStatus = 'ready';
        order.kitchenTime = `Ready (${actualPrepMinutes}m prep)`;
        order.actualPrepMinutes = actualPrepMinutes;
        insforgeAdmin.database.from('orders').update({
          kitchen_status: 'ready',
          kitchen_time: order.kitchenTime,
        }).eq('id', order.id).then().catch(() => {});
      }
      this.data.kdsTickets.splice(index, 1);
      this.recalculateAnalytics();
      this.saveData();

      insforgeAdmin.database.from('kds_tickets').update({
        status: 'ready',
      }).eq('id', ticketId).then().catch(() => {});

      return { ...ticket, actualPrepMinutes, onTime: actualPrepMinutes <= 15 };
    }
    return null;
  }

  // Floor Tables
  public getTables() {
    return this.data.floorTables;
  }

  public getTableById(id: string) {
    const cleanId = id.replace('Table ', '').trim();
    return this.data.floorTables.find((t) => t.id === cleanId || t.name === cleanId);
  }

  public addTable(table: any) {
    const count = this.data.floorTables.length + 1;
    const id = table.id || `T${count < 10 ? '0' + count : count}`;
    const newTable = {
      id,
      name: id,
      capacity: Number(table.capacity) || 4,
      section: table.section || 'main',
      status: 'available',
      orderInfo: 'Available',
      readyTime: 'Just Added',
      ...table,
    };
    this.data.floorTables.push(newTable);
    this.recalculateAnalytics();
    this.saveData();

    insforgeAdmin.database.from('floor_tables').insert([{
      id: newTable.id,
      name: newTable.name,
      capacity: newTable.capacity,
      section: newTable.section,
      status: newTable.status,
      order_info: newTable.orderInfo,
    }]).then().catch(() => {});

    return newTable;
  }

  public transferTable(sourceId: string, targetId: string) {
    const src = this.getTableById(sourceId);
    const tgt = this.getTableById(targetId);
    if (!src || !tgt) return null;

    tgt.status = src.status;
    tgt.guestsCount = src.guestsCount;
    tgt.server = src.server;
    tgt.customerName = src.customerName;
    tgt.amount = src.amount;
    tgt.timeSeated = src.timeSeated;
    tgt.timeActive = src.timeActive;
    tgt.orderInfo = src.orderInfo;
    tgt.items = src.items;

    // Reset source
    src.status = 'cleaning';
    src.guestsCount = undefined;
    src.server = undefined;
    src.customerName = undefined;
    src.amount = undefined;
    src.timeSeated = undefined;
    src.timeActive = undefined;
    src.orderInfo = 'Cleaning / Turnover';
    src.items = undefined;

    // Update any live orders pointing to source
    this.data.orders.forEach((o) => {
      if (o.table && o.table.includes(src.id)) {
        o.table = `Table ${tgt.id}`;
      }
    });

    this.recalculateAnalytics();
    this.saveData();

    insforgeAdmin.database.from('floor_tables').update({
      status: tgt.status,
      guests_count: tgt.guestsCount,
      server: tgt.server,
      customer_name: tgt.customerName,
      amount: tgt.amount,
      order_info: tgt.orderInfo,
    }).eq('id', tgt.id).then().catch(() => {});

    insforgeAdmin.database.from('floor_tables').update({
      status: 'cleaning',
      order_info: 'Cleaning / Turnover',
    }).eq('id', src.id).then().catch(() => {});

    return { source: src, target: tgt };
  }

  public mergeTables(tableIds: string[]) {
    if (!tableIds || tableIds.length < 2) return null;
    const primary = this.getTableById(tableIds[0]);
    if (!primary) return null;

    let totalCapacity = primary.capacity;
    let totalAmount = primary.amount || 0;
    let totalGuests = primary.guestsCount || 0;

    for (let i = 1; i < tableIds.length; i++) {
      const other = this.getTableById(tableIds[i]);
      if (other) {
        totalCapacity += other.capacity;
        totalAmount += other.amount || 0;
        totalGuests += other.guestsCount || 0;
        other.status = 'occupied';
        other.orderInfo = `Merged with ${primary.name}`;
      }
    }

    primary.capacity = totalCapacity;
    primary.amount = totalAmount > 0 ? totalAmount : undefined;
    primary.guestsCount = totalGuests > 0 ? totalGuests : undefined;
    primary.status = 'occupied';
    primary.orderInfo = `Merged Table (${tableIds.join('+')})`;

    this.recalculateAnalytics();
    this.saveData();
    return primary;
  }

  public updateTable(id: string, updates: Partial<any>) {
    const table = this.data.floorTables.find((t) => t.id === id || t.name === id);
    if (table) {
      Object.assign(table, updates);
      this.recalculateAnalytics();
      this.saveData();

      insforgeAdmin.database.from('floor_tables').update({
        status: table.status,
        guests_count: table.guestsCount,
        server: table.server,
        customer_name: table.customerName,
        amount: table.amount,
        order_info: table.orderInfo,
      }).eq('id', table.id).then().catch(() => {});
    }
    return table;
  }

  // Menu
  public getMenu() {
    return this.data.menuItems;
  }

  public toggleMenuItemStock(id: string) {
    const item = this.data.menuItems.find((m) => m.id === id || m.sku === id);
    if (item) {
      item.inStock = !item.inStock;
      this.saveData();

      insforgeAdmin.database.from('menu_items').update({
        in_stock: item.inStock,
      }).eq('id', item.id).then().catch(() => {});
    }
    return item;
  }

  public addMenuItem(dish: any) {
    const id = `m-${Date.now()}`;
    const newDish = { id, inStock: true, dineInActive: true, onlineActive: true, ...dish };
    this.data.menuItems.push(newDish);
    this.saveData();

    insforgeAdmin.database.from('menu_items').insert([{
      id: newDish.id,
      sku: newDish.sku || `SKU-${Date.now()}`,
      name: newDish.name,
      category: newDish.category || 'starters',
      price: newDish.price,
      cost: newDish.cost || Math.round(newDish.price * 0.3),
      food_cost_pct: newDish.foodCostPct || 30,
      margin_pct: newDish.marginPct || 70,
      matrix_tier: newDish.matrixTier || 'Star',
      is_veg: newDish.isVeg ?? true,
      in_stock: newDish.inStock ?? true,
      dine_in_active: newDish.dineInActive ?? true,
      online_active: newDish.onlineActive ?? true,
      description: newDish.description || '',
      image_url: newDish.imageUrl || '',
      alt_text: newDish.name,
    }]).then().catch(() => {});

    return newDish;
  }

  // Reservations
  public getReservations() {
    return this.data.reservations;
  }

  public addReservation(res: any) {
    const id = `RES-${Math.floor(400 + Math.random() * 600)}`;
    const newRes = { id, status: 'confirmed', statusLabel: 'Confirmed', ...res };
    this.data.reservations.unshift(newRes);
    this.saveData();

    insforgeAdmin.database.from('reservations').insert([{
      id: newRes.id,
      guest_name: newRes.guestName,
      phone: newRes.phone,
      time_slot: newRes.timeSlot,
      pax: newRes.pax,
      table_name: newRes.table,
      status: newRes.status,
      status_label: newRes.statusLabel,
      is_vip: newRes.isVip || false,
      vip_tier: newRes.vipTier,
      occasion: newRes.occasion,
      notes: newRes.notes,
      deposit_amount: newRes.depositAmount || 0,
      date: newRes.date || '2026-09-16',
    }]).then().catch(() => {});

    return newRes;
  }

  public updateReservationStatus(id: string, status: string, statusLabel: string) {
    const res = this.data.reservations.find((r) => r.id === id);
    if (res) {
      res.status = status;
      res.statusLabel = statusLabel;
      this.saveData();

      insforgeAdmin.database.from('reservations').update({
        status,
        status_label: statusLabel,
      }).eq('id', id).then().catch(() => {});
    }
    return res;
  }

  // Inventory
  public getInventory() {
    return this.data.inventory;
  }

  public updateStock(id: string, currentStock: number) {
    const item = this.data.inventory.find((i) => i.id === id);
    if (item) {
      item.currentStock = Math.round(currentStock * 10) / 10;
      item.valuation = Math.round(item.currentStock * item.unitCost);
      item.status = item.currentStock <= item.reorderPoint ? (item.currentStock <= 2 ? 'critical' : 'low') : 'healthy';
      this.saveData();

      insforgeAdmin.database.from('inventory').update({
        current_stock: item.currentStock,
        valuation: item.valuation,
        status: item.status,
      }).eq('id', id).then().catch(() => {});
    }
    return item;
  }

  public receiveStock(id: string, qty: number) {
    const item = this.data.inventory.find((i) => i.id === id);
    if (item) {
      item.currentStock += qty;
      item.valuation = Math.round(item.currentStock * item.unitCost);
      item.status = item.currentStock <= item.reorderPoint ? (item.currentStock <= 2 ? 'critical' : 'low') : 'healthy';
      this.saveData();

      insforgeAdmin.database.from('inventory').update({
        current_stock: item.currentStock,
        valuation: item.valuation,
        status: item.status,
      }).eq('id', id).then().catch(() => {});
    }
    return item;
  }

  public logWastage(item: string, qty: string, reason: string, cost: number) {
    const waste = {
      id: `W-${Date.now()}`,
      item,
      qty,
      reason,
      cost,
      loggedAt: new Date().toISOString(),
    };
    this.data.wasteLogs.unshift(waste);
    this.saveData();

    insforgeAdmin.database.from('waste_logs').insert([{
      id: waste.id,
      item: waste.item,
      qty: waste.qty,
      reason: waste.reason,
      cost: waste.cost,
      logged_at: waste.loggedAt,
    }]).then().catch(() => {});

    return waste;
  }

  // Purchase Orders & Autonomous Supply Ledgers
  public getPurchaseOrders() {
    if (!this.data.purchaseOrders) this.data.purchaseOrders = [];
    return this.data.purchaseOrders;
  }

  public addPurchaseOrders(pos: any[]) {
    if (!this.data.purchaseOrders) this.data.purchaseOrders = [];
    for (const po of pos) {
      const existing = this.data.purchaseOrders.find((p) => p.poNumber === po.poNumber);
      if (!existing) {
        this.data.purchaseOrders.unshift({
          ...po,
          createdAt: new Date().toISOString(),
          status: po.status || 'DISPATCHED',
        });
      }
    }
    this.saveData();
    return this.data.purchaseOrders;
  }

  // Deduct ingredient inventory on order creation
  public deductInventoryForOrder(lineItems: any[]) {
    if (!Array.isArray(lineItems)) return [];
    const updatedItems = [];

    const INGREDIENT_RECIPE_MAP: Record<string, Array<{ searchKey: string; usage: number }>> = {
      'butter chicken': [
        { searchKey: 'Chicken', usage: 0.3 },
        { searchKey: 'Butter', usage: 0.08 },
        { searchKey: 'Deggi Mirch', usage: 0.02 },
      ],
      'paneer tikka': [
        { searchKey: 'Paneer', usage: 0.25 },
        { searchKey: 'Deggi Mirch', usage: 0.03 },
      ],
      'biryani': [
        { searchKey: 'Basmati Rice', usage: 0.2 },
        { searchKey: 'Chicken', usage: 0.25 },
        { searchKey: 'Ghee', usage: 0.05 },
      ],
      'naan': [
        { searchKey: 'Butter', usage: 0.04 },
      ],
      'dal makhani': [
        { searchKey: 'Butter', usage: 0.06 },
        { searchKey: 'Deggi Mirch', usage: 0.02 },
      ],
    };

    for (const line of lineItems) {
      const lineName = (line.name || '').toLowerCase();
      const qty = Number(line.qty) || 1;

      // 1. Check exact dish recipe BOM first
      const dish = (this.data.menuItems || []).find((m) =>
        lineName.includes(m.name.toLowerCase()) || m.name.toLowerCase().includes(lineName)
      );

      if (dish && Array.isArray(dish.recipeIngredients) && dish.recipeIngredients.length > 0) {
        for (const recipeItem of dish.recipeIngredients) {
          const match = this.data.inventory.find(
            (item) => item.id === recipeItem.ingredientId || item.name.toLowerCase().includes(recipeItem.name.toLowerCase())
          );
          if (match && match.currentStock > 0) {
            const deduction = Math.round((recipeItem.qty || 0.1) * qty * 10) / 10;
            match.currentStock = Math.max(0, Math.round((match.currentStock - deduction) * 10) / 10);
            match.valuation = Math.round(match.currentStock * match.unitCost);
            match.status =
              match.currentStock <= match.reorderPoint
                ? match.currentStock <= 2
                  ? 'critical'
                  : 'low'
                : 'healthy';
            if (!updatedItems.find((u) => u.id === match.id)) {
              updatedItems.push(match);
            }
          }
        }
        continue;
      }

      // 2. Fallback to ingredient mapping
      for (const [dishKey, ingredients] of Object.entries(INGREDIENT_RECIPE_MAP)) {
        if (lineName.includes(dishKey)) {
          for (const ing of ingredients) {
            const match = this.data.inventory.find((item) =>
              item.name.toLowerCase().includes(ing.searchKey.toLowerCase())
            );
            if (match && match.currentStock > 0) {
              const deduction = Math.round(ing.usage * qty * 10) / 10;
              match.currentStock = Math.max(0, Math.round((match.currentStock - deduction) * 10) / 10);
              match.valuation = Math.round(match.currentStock * match.unitCost);
              match.status =
                match.currentStock <= match.reorderPoint
                  ? match.currentStock <= 2
                    ? 'critical'
                    : 'low'
                  : 'healthy';
              if (!updatedItems.find((u) => u.id === match.id)) {
                updatedItems.push(match);
              }
            }
          }
        }
      }
    }

    if (updatedItems.length > 0) {
      this.saveData();
    }
    return updatedItems;
  }

  // Customers
  public getCustomers() {
    return this.data.customers;
  }

  public addCustomer(cust: any) {
    const id = `CUST-${Math.floor(800 + Math.random() * 200)}`;
    const newCust = { id, visits: 1, totalSpend: 0, points: 0, tier: 'Standard', ...cust };
    this.data.customers.unshift(newCust);
    this.saveData();

    insforgeAdmin.database.from('customers').insert([{
      id: newCust.id,
      name: newCust.name,
      phone: newCust.phone,
      tier: newCust.tier,
      visits: newCust.visits,
      total_spend: newCust.totalSpend,
      points: newCust.points,
      preferred_table: newCust.preferredTable,
      dietary_tags: newCust.dietaryTags,
      last_visit: newCust.lastVisit,
    }]).then().catch(() => {});

    return newCust;
  }

  // Staff
  public getStaff() {
    return this.data.staff;
  }

  public addStaff(staff: any) {
    const count = this.data.staff.length + 1;
    const id = `EMP-0${count < 10 ? '0' + count : count}`;
    const newStaff = {
      id,
      status: 'active',
      clockInTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      tipsEarned: 0,
      pinAuthLevel: 'Floor (L2)',
      ...staff,
    };
    this.data.staff.push(newStaff);
    this.saveData();

    insforgeAdmin.database.from('staff').insert([{
      id: newStaff.id,
      name: newStaff.name,
      role: newStaff.role,
      department: newStaff.department,
      clock_in_time: newStaff.clockInTime,
      status: newStaff.status,
      station: newStaff.station,
      pin_auth_level: newStaff.pinAuthLevel,
      tips_earned: newStaff.tipsEarned,
      pin: newStaff.pin,
    }]).then().catch(() => {});

    return newStaff;
  }

  public updateStaffPin(id: string, pin: string) {
    const staff = this.data.staff.find((s) => s.id === id);
    if (staff) {
      staff.pin = pin;
      this.saveData();

      insforgeAdmin.database.from('staff').update({
        pin,
      }).eq('id', id).then().catch(() => {});
    }
    return staff;
  }

  public clockInStaff(id: string) {
    const staff = this.data.staff.find((s) => s.id === id);
    if (staff) {
      staff.status = 'active';
      staff.clockInTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST';
      this.saveData();

      insforgeAdmin.database.from('staff').update({
        status: 'active',
        clock_in_time: staff.clockInTime,
      }).eq('id', id).then().catch(() => {});
    }
    return staff;
  }

  public clockOutStaff(id: string) {
    const staff = this.data.staff.find((s) => s.id === id);
    if (staff) {
      staff.status = 'off';
      staff.clockOutTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST';
      this.saveData();

      insforgeAdmin.database.from('staff').update({
        status: 'off',
        clock_out_time: staff.clockOutTime,
      }).eq('id', id).then().catch(() => {});
    }
    return staff;
  }

  // ==========================================
  // 1. DELIVERY FLEET & DRIVER METHODS
  // ==========================================
  public getDeliveryDrivers() {
    if (!this.data.deliveryDrivers) this.data.deliveryDrivers = [];
    return this.data.deliveryDrivers;
  }

  public getDeliveryDriverById(id: string) {
    return (this.data.deliveryDrivers || []).find((d) => d.id === id);
  }

  public updateDriverLocation(id: string, updates: { lat?: number; lng?: number; status?: string; etaMinutes?: number; destination?: string; customerName?: string; activeOrderId?: string }) {
    const driver = this.getDeliveryDriverById(id);
    if (driver) {
      Object.assign(driver, updates);
      driver.lastPing = new Date().toISOString();
      this.saveData();
    }
    return driver;
  }

  public assignOrderToDriver(driverId: string, orderId: string, destination: string, customerName: string) {
    const driver = this.getDeliveryDriverById(driverId);
    if (driver) {
      driver.activeOrderId = orderId;
      driver.destination = destination;
      driver.customerName = customerName;
      driver.status = 'on_the_way';
      driver.etaMinutes = 15;
      driver.lastPing = new Date().toISOString();

      // Update order status
      const order = this.getOrderById(orderId);
      if (order) {
        order.driverId = driverId;
        order.driverName = driver.name;
        order.driverPhone = driver.phone;
        order.kitchenStatus = 'out_for_delivery';
        order.kitchenTime = 'Out for Delivery';
      }

      this.saveData();
    }
    return driver;
  }

  // ==========================================
  // 2. COUPON & PROMOTION ENGINE METHODS
  // ==========================================
  public getCoupons() {
    if (!this.data.coupons) this.data.coupons = [];
    return this.data.coupons;
  }

  public validateCoupon(code: string, subtotal: number) {
    const cleanCode = (code || '').trim().toUpperCase();
    const coupon = (this.data.coupons || []).find((c) => c.code.toUpperCase() === cleanCode && c.active);

    if (!coupon) {
      return { valid: false, message: `Coupon code '${code}' is invalid or inactive` };
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return { valid: false, message: `Coupon '${cleanCode}' has expired` };
    }

    if (subtotal < (coupon.minOrderAmount || 0)) {
      return { valid: false, message: `Minimum order amount of ₹${coupon.minOrderAmount} required for coupon '${cleanCode}'` };
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round(subtotal * (coupon.discountValue / 100));
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }

    return {
      valid: true,
      code: coupon.code,
      discountAmount,
      netTotal: Math.max(0, subtotal - discountAmount),
      coupon,
    };
  }

  public addCoupon(coupon: any) {
    const newCoupon = {
      code: (coupon.code || `PROMO${Math.floor(10 + Math.random() * 90)}`).toUpperCase(),
      description: coupon.description || 'Special Promotion',
      discountType: coupon.discountType || 'percentage',
      discountValue: Number(coupon.discountValue) || 10,
      minOrderAmount: Number(coupon.minOrderAmount) || 0,
      maxDiscountAmount: Number(coupon.maxDiscountAmount) || 500,
      active: coupon.active ?? true,
      usageCount: 0,
      expiryDate: coupon.expiryDate || '2026-12-31',
    };
    if (!this.data.coupons) this.data.coupons = [];
    this.data.coupons.unshift(newCoupon);
    this.saveData();
    return newCoupon;
  }

  public toggleCouponActive(code: string) {
    const coupon = (this.data.coupons || []).find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (coupon) {
      coupon.active = !coupon.active;
      this.saveData();
    }
    return coupon;
  }

  // ==========================================
  // 3. SPLIT PAYMENT & TENDER SETTLEMENT
  // ==========================================
  public getSplitPayments(orderId?: string) {
    if (!this.data.splitPayments) this.data.splitPayments = [];
    if (orderId) {
      return this.data.splitPayments.filter((p) => p.orderId === orderId);
    }
    return this.data.splitPayments;
  }

  public recordSplitPayment(orderId: string, tableId: string, splits: Array<{ guestIndex: number; guestName?: string; amount: number; method: string; refNumber?: string }>, tipAmount = 0) {
    const totalPaid = splits.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
    const id = `SPLIT-${Math.floor(1000 + Math.random() * 9000)}`;

    const record = {
      id,
      orderId,
      tableId,
      totalAmount: totalPaid,
      splits: splits.map((s, idx) => ({
        guestIndex: s.guestIndex || idx + 1,
        guestName: s.guestName || `Guest ${idx + 1}`,
        amount: Number(s.amount) || 0,
        method: s.method || 'UPI',
        refNumber: s.refNumber || `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      })),
      tipAmount: Number(tipAmount) || 0,
      settledAt: new Date().toISOString(),
      status: 'completed',
    };

    if (!this.data.splitPayments) this.data.splitPayments = [];
    this.data.splitPayments.unshift(record);

    // Update parent order
    if (orderId) {
      this.updateOrderStatus(orderId, {
        paymentStatus: 'paid',
        paymentMethod: `Split (${splits.map((s) => s.method).join(', ')})`,
        splitPaymentId: id,
      });
    }

    // Release table
    if (tableId) {
      const cleanId = tableId.replace('Table ', '').trim();
      this.updateTable(cleanId, {
        status: 'available',
        amount: undefined,
        guestsCount: undefined,
        customerName: undefined,
        server: undefined,
        timeSeated: undefined,
        orderInfo: 'Available',
      });
    }

    this.recalculateAnalytics();
    this.saveData();
    return record;
  }

  // ==========================================
  // 4. LOYALTY POINTS & VIP ENGINE
  // ==========================================
  public creditLoyaltyPoints(customerIdOrPhone: string, points: number, reason: string, orderId?: string) {
    const cust = (this.data.customers || []).find(
      (c) => c.id === customerIdOrPhone || c.phone === customerIdOrPhone || c.name.toLowerCase() === customerIdOrPhone.toLowerCase()
    );

    if (cust) {
      cust.points = (cust.points || 0) + points;
      if (!cust.pointsHistory) cust.pointsHistory = [];
      cust.pointsHistory.unshift({
        type: 'credit',
        points,
        reason,
        orderId,
        date: new Date().toISOString(),
      });

      // Check for tier upgrade
      if (cust.totalSpend >= 50000 || cust.points >= 5000) {
        cust.tier = 'Platinum';
      } else if (cust.totalSpend >= 25000 || cust.points >= 2500) {
        cust.tier = 'Gold';
      } else if (cust.totalSpend >= 10000 || cust.points >= 1000) {
        cust.tier = 'Silver';
      }

      this.saveData();

      insforgeAdmin.database.from('customers').update({
        points: cust.points,
        tier: cust.tier,
      }).eq('id', cust.id).then().catch(() => {});

      return cust;
    }
    return null;
  }

  public redeemLoyaltyPoints(customerIdOrPhone: string, pointsToRedeem: number) {
    const cust = (this.data.customers || []).find(
      (c) => c.id === customerIdOrPhone || c.phone === customerIdOrPhone || c.name.toLowerCase() === customerIdOrPhone.toLowerCase()
    );

    if (!cust) {
      return { success: false, error: 'Customer not found' };
    }

    if ((cust.points || 0) < pointsToRedeem) {
      return { success: false, error: `Insufficient points. Balance: ${cust.points || 0}` };
    }

    cust.points = cust.points - pointsToRedeem;
    if (!cust.pointsHistory) cust.pointsHistory = [];
    cust.pointsHistory.unshift({
      type: 'debit',
      points: pointsToRedeem,
      reason: 'Redeemed for order discount',
      date: new Date().toISOString(),
    });

    this.saveData();

    insforgeAdmin.database.from('customers').update({
      points: cust.points,
    }).eq('id', cust.id).then().catch(() => {});

    return {
      success: true,
      redeemedPoints: pointsToRedeem,
      discountValue: pointsToRedeem, // 1 point = ₹1
      remainingPoints: cust.points,
      customer: cust,
    };
  }

  public updateCustomerSpendAndVisits(customerNameOrPhone: string, amount: number) {
    const cust = (this.data.customers || []).find(
      (c) => c.phone === customerNameOrPhone || c.name.toLowerCase() === customerNameOrPhone.toLowerCase()
    );

    if (cust) {
      cust.visits = (cust.visits || 0) + 1;
      cust.totalSpend = (cust.totalSpend || 0) + amount;
      const pointsEarned = Math.round(amount * 0.1);
      cust.points = (cust.points || 0) + pointsEarned;
      cust.lastVisit = 'Today';

      if (cust.totalSpend >= 50000) cust.tier = 'Platinum';
      else if (cust.totalSpend >= 25000) cust.tier = 'Gold';
      else if (cust.totalSpend >= 10000) cust.tier = 'Silver';

      this.saveData();

      insforgeAdmin.database.from('customers').update({
        visits: cust.visits,
        total_spend: cust.totalSpend,
        points: cust.points,
        tier: cust.tier,
        last_visit: cust.lastVisit,
      }).eq('id', cust.id).then().catch(() => {});

      return cust;
    }
    return null;
  }

  // ==========================================
  // 5. RECIPE BOM & DYNAMIC COGS ENGINE
  // ==========================================
  public getRecipeForDish(menuItemId: string) {
    const dish = (this.data.menuItems || []).find((m) => m.id === menuItemId || m.sku === menuItemId);
    if (!dish) return null;

    const recipe = dish.recipeIngredients || [];
    let calculatedCost = 0;

    const enriched = recipe.map((item: any) => {
      const ing = (this.data.inventory || []).find((i) => i.id === item.ingredientId || i.name.toLowerCase().includes(item.name.toLowerCase()));
      const unitCost = ing ? ing.unitCost : 100;
      const lineCost = Math.round(unitCost * (item.qty || 1) * 10) / 10;
      calculatedCost += lineCost;
      return {
        ...item,
        unitCost,
        lineCost,
        currentInventoryStock: ing ? ing.currentStock : 'N/A',
      };
    });

    const foodCostPct = dish.price > 0 ? Number(((calculatedCost / dish.price) * 100).toFixed(1)) : 30;
    const marginPct = Number((100 - foodCostPct).toFixed(1));

    return {
      dishId: dish.id,
      dishName: dish.name,
      price: dish.price,
      calculatedCost: Math.round(calculatedCost),
      foodCostPct,
      marginPct,
      matrixTier: marginPct >= 70 ? 'Star' : marginPct >= 50 ? 'Plowhorse' : 'Puzzle',
      ingredients: enriched,
    };
  }

  public updateDishRecipe(menuItemId: string, recipeIngredients: Array<{ ingredientId: string; name: string; qty: number; unit: string }>) {
    const dish = (this.data.menuItems || []).find((m) => m.id === menuItemId || m.sku === menuItemId);
    if (!dish) return null;

    dish.recipeIngredients = recipeIngredients;

    // Recalculate cost
    let calculatedCost = 0;
    for (const item of recipeIngredients) {
      const ing = (this.data.inventory || []).find((i) => i.id === item.ingredientId);
      const unitCost = ing ? ing.unitCost : 100;
      calculatedCost += unitCost * item.qty;
    }

    dish.cost = Math.round(calculatedCost);
    dish.foodCostPct = dish.price > 0 ? Number(((dish.cost / dish.price) * 100).toFixed(1)) : 30;
    dish.marginPct = Number((100 - dish.foodCostPct).toFixed(1));
    dish.matrixTier = dish.marginPct >= 70 ? 'Star' : 'Plowhorse';

    this.saveData();
    return dish;
  }

  // ==========================================
  // 6. KDS LINE-ITEM STATION REASSIGNMENT & PRIORITY
  // ==========================================
  public reassignKdsItemStation(ticketId: string, itemId: string, newStation: string, priorityTag?: string) {
    const ticket = (this.data.kdsTickets || []).find((t) => t.id === ticketId);
    if (ticket) {
      const item = ticket.items.find((i: any) => i.id === itemId);
      if (item) {
        item.station = newStation;
        if (priorityTag) item.priorityTag = priorityTag;
      }
      this.saveData();
      return { ticket, item };
    }
    return null;
  }

  public setKdsTicketPriority(ticketId: string, isUrgent: boolean, specialNote?: string) {
    const ticket = (this.data.kdsTickets || []).find((t) => t.id === ticketId);
    if (ticket) {
      ticket.isUrgent = isUrgent;
      if (specialNote) ticket.specialNote = specialNote;
      this.saveData();
    }
    return ticket;
  }

  // ==========================================
  // 7. HARDWARE PERIPHERALS & SOCKET DIAGNOSTICS
  // ==========================================
  public getPeripherals() {
    if (!this.data.peripherals) this.data.peripherals = [];
    return this.data.peripherals;
  }

  public addPeripheral(device: any) {
    const count = (this.data.peripherals || []).length + 1;
    const id = device.id || `DEV-0${count < 10 ? '0' + count : count}`;
    const newDev = {
      id,
      name: device.name || 'Thermal KOT Printer',
      deviceType: device.deviceType || 'Thermal ESC/POS 80mm',
      model: device.model || 'Epson TM-T88VI',
      ipAddress: device.ipAddress || '192.168.1.125:9100',
      status: device.status || 'online',
      lastPing: 5,
      ...device,
    };
    if (!this.data.peripherals) this.data.peripherals = [];
    this.data.peripherals.push(newDev);
    this.saveData();
    return newDev;
  }

  public updatePeripheral(id: string, updates: any) {
    const dev = (this.data.peripherals || []).find((p) => p.id === id);
    if (dev) {
      Object.assign(dev, updates);
      this.saveData();
    }
    return dev;
  }

  public pingAllPeripherals() {
    const devices = this.data.peripherals || [];
    const results = devices.map((d) => {
      // Simulate live network ping with random jitter (3-12ms)
      const latencyMs = Math.floor(3 + Math.random() * 8);
      d.lastPing = latencyMs;
      return {
        id: d.id,
        name: d.name,
        ip: d.ipAddress,
        latencyMs,
        status: d.status,
        timestamp: new Date().toISOString(),
      };
    });
    this.saveData();
    return results;
  }

  public logTestPrint(deviceId: string, title: string) {
    const dev = (this.data.peripherals || []).find((p) => p.id === deviceId);
    return {
      success: true,
      deviceId,
      deviceName: dev ? dev.name : 'Printer Device',
      jobId: `PRINT-${Date.now()}`,
      title,
      timestamp: new Date().toISOString(),
      status: 'SENT_TO_SPOOLER',
    };
  }

  // ==========================================
  // 8. WASTE LOGS & SPOILAGE ANALYTICS
  // ==========================================
  public getWasteLogs(category?: string) {
    const logs = this.data.wasteLogs || [];
    if (category && category !== 'all') {
      return logs.filter((l) => (l.category || '').toLowerCase() === category.toLowerCase());
    }
    return logs;
  }

  public getWasteSummary() {
    const logs = this.data.wasteLogs || [];
    const totalWasteCost = logs.reduce((acc, l) => acc + (Number(l.cost) || 0), 0);
    const totalInventoryValuation = (this.data.inventory || []).reduce((acc, i) => acc + (Number(i.valuation) || 0), 0);
    const wastePercentage = totalInventoryValuation > 0 ? Number(((totalWasteCost / totalInventoryValuation) * 100).toFixed(2)) : 0.74;

    const reasonMap: Record<string, number> = {};
    logs.forEach((l) => {
      const r = l.reason || 'General Spoilage';
      reasonMap[r] = (reasonMap[r] || 0) + (Number(l.cost) || 0);
    });

    return {
      totalWasteCost,
      totalEntries: logs.length,
      totalInventoryValuation,
      wastePercentage,
      reasonBreakdown: Object.entries(reasonMap).map(([reason, cost]) => ({ reason, cost })),
      recentLogs: logs.slice(0, 10),
    };
  }

  // ==========================================
  // 9. TIP POOL DISTRIBUTION & SHIFT HOURS
  // ==========================================
  public getTipPoolSummary() {
    const orders = this.data.orders || [];
    const activeStaff = (this.data.staff || []).filter((s) => s.status === 'active');
    
    // Calculate total tips from orders (service charge + tips)
    const totalTipsCollected = orders.reduce((acc, o) => acc + (Number(o.serviceCharge) || 0), 0);
    const staffCount = activeStaff.length || 1;
    const sharePerStaff = Math.round(totalTipsCollected / staffCount);

    return {
      totalTipsCollected,
      activeStaffCount: staffCount,
      sharePerStaff,
      activeStaff: activeStaff.map((s) => ({
        id: s.id,
        name: s.name,
        role: s.role,
        department: s.department,
        currentTipsEarned: s.tipsEarned || 0,
        projectedShare: sharePerStaff,
      })),
      recentDistributions: this.data.tipPoolDistributions || [],
    };
  }

  public distributeTipPool(distributedBy = 'General Manager') {
    const summary = this.getTipPoolSummary();
    const id = `TIP-${Date.now().toString().slice(-4)}`;

    const recipients = summary.activeStaff.map((s) => {
      const staffMember = (this.data.staff || []).find((st) => st.id === s.id);
      if (staffMember) {
        staffMember.tipsEarned = (staffMember.tipsEarned || 0) + summary.sharePerStaff;
      }
      return {
        staffId: s.id,
        name: s.name,
        amount: summary.sharePerStaff,
      };
    });

    const record = {
      id,
      date: new Date().toISOString().split('T')[0],
      shift: 'Dinner Shift Live',
      totalTipsCollected: summary.totalTipsCollected,
      staffCount: summary.activeStaffCount,
      sharePerStaff: summary.sharePerStaff,
      distributedBy,
      distributedAt: new Date().toISOString(),
      recipients,
    };

    if (!this.data.tipPoolDistributions) this.data.tipPoolDistributions = [];
    this.data.tipPoolDistributions.unshift(record);

    this.saveData();
    return record;
  }

  // ==========================================
  // 10. TABLE AVAILABILITY & DEPOSIT METHODS
  // ==========================================
  public checkTableAvailability(tableId: string, date: string, timeSlot: string, pax = 2) {
    const cleanTable = tableId.replace('Table ', '').trim();
    const reservations = this.data.reservations || [];
    const floorTables = this.data.floorTables || [];

    const tableObj = floorTables.find((t) => t.id === cleanTable || t.name === cleanTable);
    if (!tableObj) {
      return { available: false, reason: `Table ${cleanTable} does not exist on the floor` };
    }

    if (pax > tableObj.capacity) {
      return { available: false, reason: `Table ${cleanTable} has capacity of ${tableObj.capacity} Pax, but party size is ${pax}` };
    }

    // Check for conflicting reservation at same date & timeSlot
    const conflict = reservations.find(
      (r) => (r.table && r.table.includes(cleanTable)) && r.date === date && r.timeSlot.includes(timeSlot.split(' ')[0]) && r.status !== 'cancelled'
    );

    if (conflict) {
      return {
        available: false,
        reason: `Table ${cleanTable} is already reserved by ${conflict.guestName} at ${conflict.timeSlot}`,
        conflictWith: conflict,
      };
    }

    return {
      available: true,
      table: tableObj,
      suggestedDeposit: pax >= 6 ? 2000 : 1000,
    };
  }

  public recordReservationDeposit(reservationId: string, amount: number, paymentMethod = 'UPI') {
    const res = (this.data.reservations || []).find((r) => r.id === reservationId);
    const id = `DEP-${Math.floor(400 + Math.random() * 600)}`;

    const deposit = {
      id,
      reservationId,
      guestName: res ? res.guestName : 'Guest',
      amount: Number(amount) || 1000,
      paymentMethod,
      status: 'secured',
      transactionRef: `DEP-TXN-${Date.now().toString().slice(-6)}`,
      date: res ? res.date : new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    if (!this.data.reservationDeposits) this.data.reservationDeposits = [];
    this.data.reservationDeposits.unshift(deposit);

    if (res) {
      res.depositAmount = amount;
      res.depositStatus = 'secured';
      res.status = 'confirmed';
    }

    this.saveData();
    return deposit;
  }

  public getReservationDeposits() {
    if (!this.data.reservationDeposits) this.data.reservationDeposits = [];
    return this.data.reservationDeposits;
  }

  // ==========================================
  // 11. KDS EXPO AGGREGATOR ENGINE
  // ==========================================
  public getKdsExpoSummary() {
    const activeTickets = (this.data.kdsTickets || []).filter((t) => t.status !== 'ready' && t.status !== 'completed');
    const stationMap: Record<string, { station: string; pendingItemsCount: number; dishes: Record<string, number> }> = {
      Tandoor: { station: 'Tandoor', pendingItemsCount: 0, dishes: {} },
      Curry: { station: 'Curry', pendingItemsCount: 0, dishes: {} },
      Bar: { station: 'Bar', pendingItemsCount: 0, dishes: {} },
      Pantry: { station: 'Pantry', pendingItemsCount: 0, dishes: {} },
      Dessert: { station: 'Dessert', pendingItemsCount: 0, dishes: {} },
    };

    const overallDishes: Record<string, { name: string; station: string; totalQty: number; ticketCount: number }> = {};
    let oldestWaitMinutes = 0;
    let urgentTicketsCount = 0;

    activeTickets.forEach((t) => {
      if (t.isUrgent) urgentTicketsCount += 1;
      const elapsed = Number(t.elapsedMinutes) || 1;
      if (elapsed > oldestWaitMinutes) oldestWaitMinutes = elapsed;

      (t.items || []).forEach((it: any) => {
        if (!it.isDone) {
          const st = it.station || 'Curry';
          if (!stationMap[st]) {
            stationMap[st] = { station: st, pendingItemsCount: 0, dishes: {} };
          }
          stationMap[st].pendingItemsCount += (it.qty || 1);
          stationMap[st].dishes[it.name] = (stationMap[st].dishes[it.name] || 0) + (it.qty || 1);

          if (!overallDishes[it.name]) {
            overallDishes[it.name] = { name: it.name, station: st, totalQty: 0, ticketCount: 0 };
          }
          overallDishes[it.name].totalQty += (it.qty || 1);
          overallDishes[it.name].ticketCount += 1;
        }
      });
    });

    return {
      activeTicketsCount: activeTickets.length,
      urgentTicketsCount,
      oldestWaitMinutes,
      stations: Object.values(stationMap),
      aggregatedDishes: Object.values(overallDishes).sort((a, b) => b.totalQty - a.totalQty),
      timestamp: new Date().toISOString(),
    };
  }

  // ==========================================
  // 12. ORDER ITEM VOIDING & INVENTORY REFUND
  // ==========================================
  public voidOrderItem(orderId: string, itemId: string, reason = 'Customer cancelled item') {
    const order = this.getOrderById(orderId);
    if (!order || !Array.isArray(order.lineItems)) return null;

    const itemIndex = order.lineItems.findIndex((li: any) => li.id === itemId || li.name === itemId);
    if (itemIndex === -1) return null;

    const itemToVoid = order.lineItems[itemIndex];
    order.lineItems.splice(itemIndex, 1);

    // Recalculate order financial totals
    const subtotal = order.lineItems.reduce((acc: number, li: any) => acc + (li.price * (li.qty || 1)), 0);
    const taxes = Math.round(subtotal * 0.05);
    const serviceCharge = Math.round(subtotal * 0.05);
    const total = subtotal + taxes + serviceCharge;

    order.subtotal = subtotal;
    order.taxes = taxes;
    order.serviceCharge = serviceCharge;
    order.total = total;
    order.itemsCount = order.lineItems.length;
    order.itemsSummary = order.lineItems.map((li: any) => `${li.qty}x ${li.name}`).join(', ') || 'No active items';

    // Refund raw inventory ingredients back into stock!
    const dish = (this.data.menuItems || []).find((m) => m.name.toLowerCase() === itemToVoid.name.toLowerCase());
    const refundedIngredients: any[] = [];

    if (dish && Array.isArray(dish.recipeIngredients)) {
      dish.recipeIngredients.forEach((ri: any) => {
        const ing = this.data.inventory.find((i) => i.id === ri.ingredientId);
        if (ing) {
          const refundQty = (ri.qty || 0.1) * (itemToVoid.qty || 1);
          this.receiveStock(ing.id, refundQty);
          refundedIngredients.push({ name: ing.name, refundedQty });
        }
      });
    }

    // Log wastage / cancellation record
    this.logWastage(itemToVoid.name, `${itemToVoid.qty || 1} portions`, `Voided from ${orderId}: ${reason}`, Math.round(itemToVoid.price * 0.3));

    // Update corresponding KDS ticket item if exists
    const kds = (this.data.kdsTickets || []).find((t) => t.orderId === orderId);
    if (kds && Array.isArray(kds.items)) {
      const kIndex = kds.items.findIndex((ki: any) => ki.name === itemToVoid.name);
      if (kIndex !== -1) {
        kds.items.splice(kIndex, 1);
      }
    }

    this.recalculateAnalytics();
    this.saveData();

    return {
      order,
      voidedItem: itemToVoid,
      refundedIngredients,
      newTotal: total,
    };
  }

  public addItemsToOrder(orderId: string, newItems: any[]) {
    const order = this.getOrderById(orderId);
    if (!order) return null;

    if (!Array.isArray(order.lineItems)) order.lineItems = [];

    newItems.forEach((it: any, idx: number) => {
      order.lineItems.push({
        id: `li-${Date.now()}-${idx}`,
        name: it.name,
        qty: Number(it.qty) || 1,
        price: Number(it.price) || 200,
        station: it.station || 'Curry',
        status: 'Fired to line',
        modifiers: it.modifiers,
      });
    });

    // Deduct stock for new items
    this.deductInventoryForOrder(newItems);

    // Recalculate totals
    const subtotal = order.lineItems.reduce((acc: number, li: any) => acc + (li.price * (li.qty || 1)), 0);
    const taxes = Math.round(subtotal * 0.05);
    const serviceCharge = Math.round(subtotal * 0.05);
    const total = subtotal + taxes + serviceCharge;

    order.subtotal = subtotal;
    order.taxes = taxes;
    order.serviceCharge = serviceCharge;
    order.total = total;
    order.itemsCount = order.lineItems.length;
    order.itemsSummary = order.lineItems.map((li: any) => `${li.qty}x ${li.name}`).join(', ');

    // Append to KDS ticket
    const kds = (this.data.kdsTickets || []).find((t) => t.orderId === orderId);
    if (kds) {
      newItems.forEach((it: any, idx: number) => {
        kds.items.push({
          id: `k-${Date.now()}-${idx}`,
          name: it.name,
          qty: it.qty || 1,
          station: it.station || 'Curry',
          isDone: false,
          modifiers: it.modifiers,
        });
      });
    }

    this.recalculateAnalytics();
    this.saveData();
    return order;
  }

  // ==========================================
  // 13. TABLE SEATING SESSIONS & ANALYTICS
  // ==========================================
  public startTableSession(tableId: string, pax = 2, server = 'Floor Staff', customerName = 'Walk-in Guests') {
    const cleanId = tableId.replace('Table ', '').trim();
    if (!this.data.tableSessions) this.data.tableSessions = [];

    const id = `SESS-${Date.now().toString().slice(-4)}`;
    const session = {
      id,
      tableId: cleanId,
      tableName: `Table ${cleanId}`,
      section: (this.getTableById(cleanId)?.section) || 'main',
      pax: Number(pax) || 2,
      server,
      customerName,
      seatedAt: new Date().toISOString(),
      releasedAt: null,
      durationMinutes: 1,
      totalBill: 0,
      status: 'active',
    };

    this.data.tableSessions.unshift(session);
    this.saveData();
    return session;
  }

  public endTableSession(tableId: string, totalBill = 0) {
    const cleanId = tableId.replace('Table ', '').trim();
    const session = (this.data.tableSessions || []).find((s) => s.tableId === cleanId && s.status === 'active');

    if (session) {
      session.releasedAt = new Date().toISOString();
      session.status = 'completed';
      session.totalBill = Number(totalBill) || session.totalBill || 0;
      const seatedTime = new Date(session.seatedAt).getTime();
      session.durationMinutes = Math.max(1, Math.round((Date.now() - seatedTime) / 60000));
      this.saveData();
      return session;
    }
    return null;
  }

  public getTableAnalytics() {
    const sessions = this.data.tableSessions || [];
    const completedSessions = sessions.filter((s) => s.status === 'completed');
    const totalTurnoversToday = sessions.length;

    let totalDuration = 0;
    completedSessions.forEach((s) => {
      totalDuration += (s.durationMinutes || 45);
    });

    const avgTurnaroundMinutes = completedSessions.length > 0 ? Math.round(totalDuration / completedSessions.length) : 42;

    const sectionDurationMap: Record<string, { count: number; totalDuration: number }> = {};
    sessions.forEach((s) => {
      const sec = s.section || 'main';
      if (!sectionDurationMap[sec]) sectionDurationMap[sec] = { count: 0, totalDuration: 0 };
      sectionDurationMap[sec].count += 1;
      sectionDurationMap[sec].totalDuration += (s.durationMinutes || 30);
    });

    return {
      totalTurnoversToday,
      activeSessionsCount: sessions.filter((s) => s.status === 'active').length,
      avgTurnaroundMinutes: `${avgTurnaroundMinutes}m`,
      sectionTurnovers: Object.entries(sectionDurationMap).map(([section, data]) => ({
        section,
        turnovers: data.count,
        avgMinutes: data.count > 0 ? Math.round(data.totalDuration / data.count) : 0,
      })),
      recentSessions: sessions.slice(0, 10),
    };
  }

  // ==========================================
  // 14. KDS SLA BREACH LOGS & TIMING
  // ==========================================
  public getKdsSlaMetrics() {
    const logs = this.data.kdsSlaLogs || [];
    const totalCompletedTickets = logs.length;
    const onTimeTickets = logs.filter((l) => l.onTime).length;
    const onTimePercentage = totalCompletedTickets > 0 ? Number(((onTimeTickets / totalCompletedTickets) * 100).toFixed(1)) : 94.2;

    const totalPrepTime = logs.reduce((acc, l) => acc + (Number(l.actualMinutes) || 12), 0);
    const avgPrepMinutes = totalCompletedTickets > 0 ? Number((totalPrepTime / totalCompletedTickets).toFixed(1)) : 11.8;

    return {
      totalCompletedTickets,
      onTimeTickets,
      overdueTickets: totalCompletedTickets - onTimeTickets,
      onTimePercentage,
      avgPrepMinutes,
      targetSlaMinutes: 15,
      slaHistory: logs.slice(0, 15),
    };
  }

  // ==========================================
  // 15. PURCHASE ORDER RECEIVING & STOCK INGESTION
  // ==========================================
  public receivePurchaseOrder(poNumber: string, notes = 'Supplier shipment inspected and received') {
    const pos = this.data.purchaseOrders || [];
    const po = pos.find((p) => p.poNumber === poNumber);
    if (!po) return null;

    po.status = 'RECEIVED';
    po.receivedAt = new Date().toISOString();
    po.receiverNotes = notes;

    const ingestedItems: any[] = [];

    // Automatically ingest each line item into raw inventory!
    if (Array.isArray(po.lineItems)) {
      po.lineItems.forEach((item: any) => {
        const rawName = item.name.replace(/\+/, '').trim();
        const ing = this.data.inventory.find((i) => rawName.toLowerCase().includes(i.name.toLowerCase()) || i.name.toLowerCase().includes(rawName.toLowerCase()));

        if (ing) {
          const qtyNumber = parseFloat(item.quantity?.replace(/[^0-9.]/g, '') || '10');
          this.receiveStock(ing.id, qtyNumber);
          ingestedItems.push({ ingredientId: ing.id, name: ing.name, qtyAdded: qtyNumber, newStock: ing.currentStock });
        }
      });
    }

    this.saveData();
    return { po, ingestedItems };
  }

  public cancelPurchaseOrder(poNumber: string, reason = 'Cancelled by purchase manager') {
    const pos = this.data.purchaseOrders || [];
    const po = pos.find((p) => p.poNumber === poNumber);
    if (!po) return null;

    po.status = 'CANCELLED';
    po.cancelledAt = new Date().toISOString();
    po.cancelReason = reason;

    this.saveData();
    return po;
  }

  // ==========================================
  // 16. MARKETING CAMPAIGNS & BROADCAST
  // ==========================================
  public createAndSendCampaign(campaignData: any) {
    const customers = this.data.customers || [];
    const targetTier = campaignData.targetTier || 'All';

    const targetedGuests = customers.filter((c) => {
      if (targetTier === 'All' || targetTier === 'all') return true;
      if (targetTier.includes('Platinum') && c.tier === 'Platinum') return true;
      if (targetTier.includes('Gold') && (c.tier === 'Gold' || c.tier === 'Platinum')) return true;
      return c.tier?.toLowerCase() === targetTier.toLowerCase();
    });

    const id = `CMP-${Math.floor(800 + Math.random() * 200)}`;
    const newCampaign = {
      id,
      title: campaignData.title || 'Special Dining Invitation',
      channel: campaignData.channel || 'WhatsApp & SMS',
      targetTier,
      targetAudienceCount: targetedGuests.length,
      template: campaignData.template || 'Namaste {{guest_name}}! Join us at SpiceRoute Kitchen for signature dining specials!',
      status: 'SENT',
      dispatchedAt: new Date().toISOString(),
      deliveredCount: targetedGuests.length,
      readCount: Math.round(targetedGuests.length * 0.86),
      conversions: Math.round(targetedGuests.length * 0.12),
    };

    if (!this.data.marketingCampaigns) this.data.marketingCampaigns = [];
    this.data.marketingCampaigns.unshift(newCampaign);
    this.saveData();

    return {
      campaign: newCampaign,
      recipients: targetedGuests.map((g) => ({ name: g.name, phone: g.phone, tier: g.tier })),
    };
  }

  public getCampaigns() {
    if (!this.data.marketingCampaigns) this.data.marketingCampaigns = [];
    return this.data.marketingCampaigns;
  }

  // ==========================================
  // 17. CASH DRAWER TILL SESSIONS & RECONCILIATION
  // ==========================================
  public getTillStatus() {
    if (!this.data.tillSessions) this.data.tillSessions = [];
    const activeTill = this.data.tillSessions.find((t) => t.status === 'open') || this.data.tillSessions[0];

    const orders = this.data.orders || [];
    const cashOrders = orders.filter((o) => (o.paymentMethod || '').toLowerCase().includes('cash') && o.paymentStatus === 'paid');
    const cashCollected = cashOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);

    const openingFloat = activeTill ? (activeTill.openingFloat || 5000) : 5000;
    const currentExpectedCash = openingFloat + cashCollected;

    return {
      activeTill,
      openingFloat,
      cashSalesCount: cashOrders.length,
      cashCollected,
      currentExpectedCash,
      tillStatus: activeTill?.status || 'open',
    };
  }

  public openTillSession(cashierName = 'Counter Cashier', openingFloat = 5000) {
    if (!this.data.tillSessions) this.data.tillSessions = [];
    const id = `TILL-${Math.floor(900 + Math.random() * 100)}`;

    const session = {
      id,
      date: new Date().toISOString().split('T')[0],
      shift: 'Live Counter Shift',
      cashierName,
      openingFloat: Number(openingFloat) || 5000,
      cashSalesCollected: 0,
      cashPayouts: 0,
      expectedCash: Number(openingFloat) || 5000,
      actualCountedCash: Number(openingFloat) || 5000,
      discrepancy: 0,
      status: 'open',
      openedAt: new Date().toISOString(),
      closedAt: null,
    };

    this.data.tillSessions.unshift(session);
    this.saveData();
    return session;
  }

  public closeTillSession(actualCountedCash: number, notes = 'End of shift drawer balancing') {
    const tillInfo = this.getTillStatus();
    const session = tillInfo.activeTill;
    if (!session) return null;

    session.status = 'closed';
    session.closedAt = new Date().toISOString();
    session.actualCountedCash = Number(actualCountedCash);
    session.expectedCash = tillInfo.currentExpectedCash;
    session.discrepancy = Number((actualCountedCash - tillInfo.currentExpectedCash).toFixed(2));
    session.closingNotes = notes;

    this.saveData();
    return session;
  }

  // ==========================================
  // 18. CUSTOMER ALLERGENS & DIETARY WARNINGS
  // ==========================================
  public checkAllergenConflict(customerIdentifier: string, dishNames: string[]) {
    const cust = (this.data.customers || []).find(
      (c) => c.id === customerIdentifier || c.phone === customerIdentifier || c.name.toLowerCase() === customerIdentifier.toLowerCase()
    );

    const warnings: Array<{ dish: string; allergen: string; severity: 'HIGH_ALERT' | 'PREFERENCE' }> = [];
    const tags = cust?.dietaryTags || [];

    for (const dishName of dishNames) {
      const lowerDish = dishName.toLowerCase();
      const menuDish = (this.data.menuItems || []).find((m) => m.name.toLowerCase().includes(lowerDish));

      for (const tag of tags) {
        const lowerTag = tag.toLowerCase();
        if (lowerTag.includes('gluten') && (lowerDish.includes('naan') || lowerDish.includes('roti') || lowerDish.includes('pizza'))) {
          warnings.push({ dish: dishName, allergen: 'Gluten / Wheat Flour in Tandoor Dough', severity: 'HIGH_ALERT' });
        }
        if (lowerTag.includes('veg') && menuDish && !menuDish.isVeg) {
          warnings.push({ dish: dishName, allergen: 'Non-Vegetarian Ingredient for Vegetarian Guest', severity: 'HIGH_ALERT' });
        }
        if (lowerTag.includes('peanut') || lowerTag.includes('nut')) {
          if (lowerDish.includes('butter chicken') || lowerDish.includes('korma')) {
            warnings.push({ dish: dishName, allergen: 'Nut / Cashew paste in gravy base', severity: 'HIGH_ALERT' });
          }
        }
      }
    }

    return {
      hasConflict: warnings.length > 0,
      customerName: cust?.name || 'Guest',
      dietaryTags: tags,
      warnings,
    };
  }

  // ==========================================
  // 19. WEATHER PREP FORECASTER
  // ==========================================
  public getWeatherPrepForecast(temperature = 26, weatherCode = 0) {
    let forecastTitle = 'Standard Fair Weather Shift';
    let beverageAdjustment = 'Normal PAR levels';
    let tandoorAdjustment = 'Normal PAR levels';
    let soupAndStarterDemand = 'Standard volume';
    let seatingRecommendation = '100% Outdoor & Indoor operational';

    if (weatherCode >= 51 && weatherCode <= 67) {
      forecastTitle = 'Rainy Evening Dining Surge';
      tandoorAdjustment = '+35% Tandoori Tikka & Hot Karahi demand';
      soupAndStarterDemand = '+40% Hot Soups & Kebabs';
      beverageAdjustment = '-20% Cold Beverages / Shift to Hot Masala Chai';
      seatingRecommendation = 'Move all outdoor patio reservations to indoor hall';
    } else if (temperature > 32) {
      forecastTitle = 'Hot Summer Afternoon Wave';
      beverageAdjustment = '+45% Cold Mocktail & Lassi pre-batching recommended';
      soupAndStarterDemand = 'Higher Salad & Cold Appetizer orders';
      seatingRecommendation = 'Activate indoor AC zones & mist cooling';
    }

    return {
      temperature,
      weatherCode,
      forecastTitle,
      recommendations: [
        { department: 'Tandoor Station', action: tandoorAdjustment },
        { department: 'Pantry & Bar', action: beverageAdjustment },
        { department: 'Curry Station', action: soupAndStarterDemand },
        { department: 'Floor Seating', action: seatingRecommendation },
      ],
      timestamp: new Date().toISOString(),
    };
  }

  // ==========================================
  // 20. UNIVERSAL FULL-TEXT SEARCH
  // ==========================================
  public universalSearch(query: string) {
    const raw = (query || '').trim().toLowerCase();
    if (!raw) return [];
    // Normalize: allow "#10482" to match "ORD-10482", strip leading #/ord- noise variants
    const q = raw.replace(/^#/, '');
    const str = (v: any) => String(v ?? '').toLowerCase();

    const results: Array<{ type: string; title: string; subtitle: string; icon: string; id: string }> = [];

    // 1. Tables
    (this.data.floorTables || []).forEach((t) => {
      if (str(t.name).includes(q) || str(t.customerName).includes(q) || str(t.section).includes(q) || str(t.id).includes(q)) {
        results.push({
          type: 'table',
          id: String(t.id ?? t.name ?? ''),
          title: `Table ${t.name || t.id}`,
          subtitle: `${String(t.status || 'unknown').toUpperCase()} · ${t.capacity ?? '?'} Pax · Section: ${t.section || 'main'}${t.customerName ? ` · ${t.customerName}` : ''}`,
          icon: 'table_restaurant',
        });
      }
    });

    // 2. Orders
    (this.data.orders || []).forEach((o) => {
      if (str(o.id).includes(q) || str(o.customer).includes(q) || str(o.table).includes(q) || str(o.itemsSummary).includes(q) || str(o.phone).includes(q)) {
        results.push({
          type: 'order',
          id: String(o.id ?? ''),
          title: String(o.id ?? 'Order'),
          subtitle: `${o.customer || 'Walk-in'} · ${o.table || 'Takeaway'} · ₹${o.total || 0} (${o.kitchenStatus || 'new'})`,
          icon: 'receipt_long',
        });
      }
    });

    // 3. Menu Items
    (this.data.menuItems || []).forEach((m) => {
      if (str(m.name).includes(q) || str(m.category).includes(q) || str(m.description).includes(q)) {
        results.push({
          type: 'dish',
          id: String(m.id ?? m.name ?? ''),
          title: String(m.name ?? 'Dish'),
          subtitle: `₹${m.price ?? 0} · ${m.category || 'menu'} · ${m.isVeg ? 'Veg' : 'Non-Veg'} · Margin ${m.marginPct || 70}%`,
          icon: 'restaurant_menu',
        });
      }
    });

    // 4. Customers
    (this.data.customers || []).forEach((c) => {
      if (str(c.name).includes(q) || str(c.phone).includes(q) || str(c.tier).includes(q)) {
        results.push({
          type: 'guest',
          id: String(c.id ?? c.phone ?? c.name ?? ''),
          title: String(c.name ?? 'Guest'),
          subtitle: `${c.tier || 'Standard'} Member · ${c.phone || 'no phone'} · ${c.points || 0} pts`,
          icon: 'person',
        });
      }
    });

    // 5. Staff
    (this.data.staff || []).forEach((s) => {
      if (str(s.name).includes(q) || str(s.role).includes(q) || str(s.department).includes(q)) {
        results.push({
          type: 'staff',
          id: String(s.id ?? s.name ?? ''),
          title: String(s.name ?? 'Staff'),
          subtitle: `${s.role || 'Staff'} · ${s.department || ''} · ${s.station || ''}`.trim(),
          icon: 'badge',
        });
      }
    });

    return results.slice(0, 15);
  }

  // Settings
  public getSettings() {
    return {
      settings: this.data.settings,
      peripherals: this.data.peripherals,
    };
  }

  public updateSettings(updates: any) {
    Object.assign(this.data.settings, updates);
    this.saveData();

    insforgeAdmin.database.from('settings').update({
      store_name: this.data.settings.storeName,
      brand_name: this.data.settings.brandName,
      gstin: this.data.settings.gstin,
      fssai: this.data.settings.fssai,
      address: this.data.settings.address,
    }).eq('id', 'default').then().catch(() => {});

    return this.data.settings;
  }

  // Analytics
  public getAnalytics() {
    return this.recalculateAnalytics();
  }

  // Reset to seed
  public resetToSeed() {
    this.data = JSON.parse(JSON.stringify(SEED_DATA));
    this.recalculateAnalytics();
    this.saveData();
    return this.data;
  }
}

export const db = new Database();
