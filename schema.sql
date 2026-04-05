-- SmartFarm Database Schema (PostgreSQL)

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    location VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user', -- 'admin', 'farmer', 'buyer'
    profile_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_suspended BOOLEAN DEFAULT FALSE
);

-- Crops Table
CREATE TABLE IF NOT EXISTS crops (
    id SERIAL PRIMARY KEY,
    farmer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) DEFAULT 'kg',
    description TEXT,
    image_url TEXT,
    county VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    buyer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    crop_id INTEGER REFERENCES crops(id) ON DELETE CASCADE,
    quantity DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general', -- 'warning', 'info', 'market'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved'
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Events Table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Guidance Table (Best Practices)
CREATE TABLE IF NOT EXISTS guidance (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'crop', 'livestock'
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crop Problem Logs
CREATE TABLE IF NOT EXISTS crop_problem_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    symptoms TEXT,
    environment TEXT,
    diagnosis TEXT,
    solution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Market Prices Table
CREATE TABLE IF NOT EXISTS market_prices (
    id SERIAL PRIMARY KEY,
    crop_name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) DEFAULT 'kg',
    trend VARCHAR(20), -- 'up', 'down', 'stable'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin Logs (Audit Trail)
CREATE TABLE IF NOT EXISTS admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type VARCHAR(50),
    target_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sample Data for Counties in Kenya
-- (This is usually handled in the app, but we can store it if needed)
CREATE TABLE IF NOT EXISTS counties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

INSERT INTO counties (name) VALUES 
('Mombasa'), ('Kwale'), ('Kilifi'), ('Tana River'), ('Lamu'), ('Taita Taveta'),
('Garissa'), ('Wajir'), ('Mandera'), ('Marsabit'), ('Isiolo'), ('Meru'),
('Tharaka-Nithi'), ('Embu'), ('Kitui'), ('Machakos'), ('Makueni'), ('Nyandarua'),
('Nyeri'), ('Kirinyaga'), ('Murang''a'), ('Kiambu'), ('Turkana'), ('West Pokot'),
('Samburu'), ('Trans Nzoia'), ('Uasin Gishu'), ('Elgeyo Marakwet'), ('Nandi'), ('Baringo'),
('Laikipia'), ('Nakuru'), ('Narok'), ('Kajiado'), ('Kericho'), ('Bomet'),
('Kakamega'), ('Vihiga'), ('Bungoma'), ('Busia'), ('Siaya'), ('Kisumu'),
('Homa Bay'), ('Migori'), ('Kisii'), ('Nyamira'), ('Nairobi')
ON CONFLICT DO NOTHING;
