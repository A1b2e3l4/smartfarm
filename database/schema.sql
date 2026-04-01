-- SmartFarm Database Schema
-- PostgreSQL Database for SmartFarm Mobile Application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    avatar VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'buyer' CHECK (role IN ('admin', 'farmer', 'buyer')),
    county VARCHAR(50) NOT NULL,
    sub_county VARCHAR(50),
    location TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_county ON users(county);

-- ============================================
-- CROPS TABLE
-- ============================================
CREATE TABLE crops (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    price_unit VARCHAR(20) DEFAULT 'kg',
    quantity DECIMAL(10, 2) NOT NULL,
    quantity_unit VARCHAR(20) DEFAULT 'kg',
    images JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'sold')),
    farmer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_organic BOOLEAN DEFAULT FALSE,
    is_negotiable BOOLEAN DEFAULT FALSE,
    harvest_date DATE,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_crops_farmer_id ON crops(farmer_id);
CREATE INDEX idx_crops_status ON crops(status);
CREATE INDEX idx_crops_category ON crops(category);
CREATE INDEX idx_crops_price ON crops(price);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    crop_id INTEGER NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
    buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farmer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quantity DECIMAL(10, 2) NOT NULL,
    quantity_unit VARCHAR(20) DEFAULT 'kg',
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    notes TEXT,
    delivery_date DATE,
    delivery_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_orders_crop_id ON orders(crop_id);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_farmer_id ON orders(farmer_id);
CREATE INDEX idx_orders_status ON orders(status);

-- ============================================
-- MARKET PRICES TABLE
-- ============================================
CREATE TABLE market_prices (
    id SERIAL PRIMARY KEY,
    crop_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    min_price DECIMAL(10, 2) NOT NULL,
    max_price DECIMAL(10, 2) NOT NULL,
    avg_price DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'kg',
    county VARCHAR(50),
    market VARCHAR(100),
    price_change DECIMAL(10, 2),
    price_change_percent DECIMAL(5, 2),
    price_date DATE DEFAULT CURRENT_DATE,
    updated_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_market_prices_crop_name ON market_prices(crop_name);
CREATE INDEX idx_market_prices_county ON market_prices(county);
CREATE INDEX idx_market_prices_price_date ON market_prices(price_date);

-- ============================================
-- ALERTS TABLE
-- ============================================
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'danger', 'success')),
    created_by INTEGER REFERENCES users(id),
    is_approved BOOLEAN DEFAULT FALSE,
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_is_approved ON alerts(is_approved);
CREATE INDEX idx_alerts_created_by ON alerts(created_by);

-- ============================================
-- ALERT READ STATUS TABLE
-- ============================================
CREATE TABLE alert_reads (
    id SERIAL PRIMARY KEY,
    alert_id INTEGER NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT TRUE,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(alert_id, user_id)
);

-- ============================================
-- EVENTS TABLE
-- ============================================
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(200),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    image VARCHAR(255),
    created_by INTEGER REFERENCES users(id),
    is_public BOOLEAN DEFAULT TRUE,
    max_attendees INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_created_by ON events(created_by);

-- ============================================
-- EVENT REGISTRATIONS TABLE
-- ============================================
CREATE TABLE event_registrations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
);

-- ============================================
-- GUIDANCE TABLE
-- ============================================
CREATE TABLE guidance (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('crop', 'livestock')),
    category VARCHAR(50),
    images JSONB DEFAULT '[]',
    video_url VARCHAR(255),
    document_url VARCHAR(255),
    created_by INTEGER REFERENCES users(id),
    view_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_guidance_type ON guidance(type);
CREATE INDEX idx_guidance_category ON guidance(category);
CREATE INDEX idx_guidance_is_featured ON guidance(is_featured);

-- ============================================
-- CROP PROBLEMS TABLE
-- ============================================
CREATE TABLE crop_problems (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    crop_name VARCHAR(100) NOT NULL,
    problem_type VARCHAR(50),
    description TEXT NOT NULL,
    images JSONB DEFAULT '[]',
    detected_issue VARCHAR(200),
    confidence VARCHAR(10),
    solution TEXT,
    prevention TEXT,
    treatment TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'analyzed', 'resolved')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_crop_problems_user_id ON crop_problems(user_id);
CREATE INDEX idx_crop_problems_status ON crop_problems(status);

-- ============================================
-- ADMIN LOGS TABLE (AUDIT TRAIL)
-- ============================================
CREATE TABLE admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    entity_name VARCHAR(200),
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);
CREATE INDEX idx_admin_logs_entity ON admin_logs(entity_type, entity_id);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at);

-- ============================================
-- COUNTIES TABLE (Kenya Counties)
-- ============================================
CREATE TABLE counties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    code VARCHAR(10),
    region VARCHAR(50)
);

-- ============================================
-- SUB-COUNTIES TABLE
-- ============================================
CREATE TABLE sub_counties (
    id SERIAL PRIMARY KEY,
    county_id INTEGER NOT NULL REFERENCES counties(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    UNIQUE(county_id, name)
);

-- ============================================
-- INSERT KENYA COUNTIES DATA
-- ============================================
INSERT INTO counties (name, code, region) VALUES
('Mombasa', '001', 'Coast'),
('Kwale', '002', 'Coast'),
('Kilifi', '003', 'Coast'),
('Tana River', '004', 'Coast'),
('Lamu', '005', 'Coast'),
('Taita-Taveta', '006', 'Coast'),
('Garissa', '007', 'North Eastern'),
('Wajir', '008', 'North Eastern'),
('Mandera', '009', 'North Eastern'),
('Marsabit', '010', 'Eastern'),
('Isiolo', '011', 'Eastern'),
('Meru', '012', 'Eastern'),
('Tharaka-Nithi', '013', 'Eastern'),
('Embu', '014', 'Eastern'),
('Kitui', '015', 'Eastern'),
('Machakos', '016', 'Eastern'),
('Makueni', '017', 'Eastern'),
('Nyandarua', '018', 'Central'),
('Nyeri', '019', 'Central'),
('Kirinyaga', '020', 'Central'),
('Murang''a', '021', 'Central'),
('Kiambu', '022', 'Central'),
('Turkana', '023', 'Rift Valley'),
('West Pokot', '024', 'Rift Valley'),
('Samburu', '025', 'Rift Valley'),
('Trans Nzoia', '026', 'Rift Valley'),
('Uasin Gishu', '027', 'Rift Valley'),
('Elgeyo-Marakwet', '028', 'Rift Valley'),
('Nandi', '029', 'Rift Valley'),
('Baringo', '030', 'Rift Valley'),
('Laikipia', '031', 'Rift Valley'),
('Nakuru', '032', 'Rift Valley'),
('Narok', '033', 'Rift Valley'),
('Kajiado', '034', 'Rift Valley'),
('Kericho', '035', 'Rift Valley'),
('Bomet', '036', 'Rift Valley'),
('Kakamega', '037', 'Western'),
('Vihiga', '038', 'Western'),
('Bungoma', '039', 'Western'),
('Busia', '040', 'Western'),
('Siaya', '041', 'Nyanza'),
('Kisumu', '042', 'Nyanza'),
('Homa Bay', '043', 'Nyanza'),
('Migori', '044', 'Nyanza'),
('Kisii', '045', 'Nyanza'),
('Nyamira', '046', 'Nyanza'),
('Nairobi', '047', 'Nairobi');

-- ============================================
-- CREATE UPDATE TRIGGER FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crops_updated_at BEFORE UPDATE ON crops
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_market_prices_updated_at BEFORE UPDATE ON market_prices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guidance_updated_at BEFORE UPDATE ON guidance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crop_problems_updated_at BEFORE UPDATE ON crop_problems
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CREATE DEFAULT ADMIN USER
-- Password: admin123 (change in production!)
-- ============================================
INSERT INTO users (name, email, phone, password_hash, role, county, is_active, is_verified)
VALUES (
    'System Admin',
    'admin@smartfarm.com',
    '+254700000000',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
    'admin',
    'Nairobi',
    TRUE,
    TRUE
);
