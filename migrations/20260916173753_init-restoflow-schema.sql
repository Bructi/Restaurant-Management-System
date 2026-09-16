-- RestoFlow Database Schema Migration for InsForge

-- 1. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    terminal TEXT,
    table_name TEXT,
    table_type TEXT,
    customer TEXT,
    phone TEXT,
    items_summary TEXT,
    items_count INTEGER DEFAULT 0,
    staff TEXT,
    total NUMERIC DEFAULT 0,
    subtotal NUMERIC DEFAULT 0,
    taxes NUMERIC DEFAULT 0,
    service_charge NUMERIC DEFAULT 0,
    payment_status TEXT DEFAULT 'unpaid',
    payment_method TEXT DEFAULT 'Unpaid',
    kitchen_status TEXT DEFAULT 'new',
    kitchen_time TEXT,
    time TEXT,
    line_items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. KDS Tickets Table
CREATE TABLE IF NOT EXISTS public.kds_tickets (
    id TEXT PRIMARY KEY,
    order_id TEXT,
    table_name TEXT,
    order_type TEXT DEFAULT 'Dine-In',
    pax INTEGER DEFAULT 2,
    server TEXT,
    elapsed_minutes INTEGER DEFAULT 0,
    is_urgent BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'new',
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Menu Items Table
CREATE TABLE IF NOT EXISTS public.menu_items (
    id TEXT PRIMARY KEY,
    sku TEXT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    cost NUMERIC DEFAULT 0,
    food_cost_pct NUMERIC DEFAULT 0,
    margin_pct NUMERIC DEFAULT 0,
    matrix_tier TEXT DEFAULT 'Star',
    is_veg BOOLEAN DEFAULT true,
    in_stock BOOLEAN DEFAULT true,
    dine_in_active BOOLEAN DEFAULT true,
    online_active BOOLEAN DEFAULT true,
    description TEXT,
    image_url TEXT,
    image_key TEXT,
    alt_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Floor Tables Table
CREATE TABLE IF NOT EXISTS public.floor_tables (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    capacity INTEGER DEFAULT 4,
    section TEXT DEFAULT 'main',
    status TEXT DEFAULT 'available',
    guests_count INTEGER,
    server TEXT,
    customer_name TEXT,
    order_info TEXT DEFAULT 'Available',
    amount NUMERIC,
    time_seated TEXT,
    time_active TEXT,
    ready_time TEXT,
    active_target BOOLEAN DEFAULT false,
    items JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Reservations Table
CREATE TABLE IF NOT EXISTS public.reservations (
    id TEXT PRIMARY KEY,
    guest_name TEXT NOT NULL,
    phone TEXT,
    time_slot TEXT,
    pax INTEGER DEFAULT 2,
    table_name TEXT,
    status TEXT DEFAULT 'confirmed',
    status_label TEXT DEFAULT 'Confirmed',
    is_vip BOOLEAN DEFAULT false,
    vip_tier TEXT,
    occasion TEXT,
    notes TEXT,
    deposit_amount NUMERIC DEFAULT 0,
    date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Inventory Table
CREATE TABLE IF NOT EXISTS public.inventory (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    current_stock NUMERIC DEFAULT 0,
    unit TEXT DEFAULT 'kg',
    par_level NUMERIC DEFAULT 0,
    reorder_point NUMERIC DEFAULT 0,
    unit_cost NUMERIC DEFAULT 0,
    valuation NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'healthy',
    supplier TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Waste Logs Table
CREATE TABLE IF NOT EXISTS public.waste_logs (
    id TEXT PRIMARY KEY,
    item TEXT NOT NULL,
    qty TEXT,
    reason TEXT,
    cost NUMERIC DEFAULT 0,
    logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    tier TEXT DEFAULT 'Standard',
    visits INTEGER DEFAULT 1,
    total_spend NUMERIC DEFAULT 0,
    points INTEGER DEFAULT 0,
    preferred_table TEXT,
    dietary_tags JSONB DEFAULT '[]'::jsonb,
    last_visit TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Staff Table
CREATE TABLE IF NOT EXISTS public.staff (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    department TEXT,
    clock_in_time TEXT,
    status TEXT DEFAULT 'active',
    station TEXT,
    pin_auth_level TEXT DEFAULT 'Floor (L2)',
    tips_earned NUMERIC DEFAULT 0,
    pin TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    store_name TEXT DEFAULT 'SpiceRoute Gourmet Hospitality LLP',
    brand_name TEXT DEFAULT 'SpiceRoute Kitchen #01 (MG Road)',
    gstin TEXT DEFAULT '29AAAAA0000A1Z5',
    fssai TEXT DEFAULT '11223344000192',
    address TEXT DEFAULT '#42 MG Road, Brigade Junction, Bengaluru 560001',
    cgst_rate NUMERIC DEFAULT 2.5,
    sgst_rate NUMERIC DEFAULT 2.5,
    service_charge_rate NUMERIC DEFAULT 5.0,
    vat_rate NUMERIC DEFAULT 18.0,
    auto_kds_sync BOOLEAN DEFAULT true,
    chime_sound BOOLEAN DEFAULT true,
    peripherals JSONB DEFAULT '[]'::jsonb,
    analytics JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS and Policies
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_orders" ON public.orders FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.kds_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_kds_tickets" ON public.kds_tickets FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_menu_items" ON public.menu_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.floor_tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_floor_tables" ON public.floor_tables FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_reservations" ON public.reservations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_inventory" ON public.inventory FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.waste_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_waste_logs" ON public.waste_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_customers" ON public.customers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_staff" ON public.staff FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_settings" ON public.settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Permissions Grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
