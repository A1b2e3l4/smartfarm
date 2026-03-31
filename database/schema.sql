CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (Farmers and Buyers)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('farmer', 'buyer', 'admin')),
    phone VARCHAR(20),
    address TEXT,
    profile_image VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster login queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Crops Table
CREATE TABLE crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    quantity DECIMAL(10, 2) NOT NULL CHECK (quantity >= 0),
    unit VARCHAR(20) NOT NULL DEFAULT 'kg',
    description TEXT,
    image VARCHAR(500),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'out_of_stock', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for crops
CREATE INDEX idx_crops_farmer_id ON crops(farmer_id);
CREATE INDEX idx_crops_category ON crops(category);
CREATE INDEX idx_crops_status ON crops(status);
CREATE INDEX idx_crops_name ON crops(name);

-- Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop_id UUID NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
    quantity DECIMAL(10, 2) NOT NULL CHECK (quantity > 0),
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'delivered', 'canceled')),
    delivery_address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for orders
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_farmer_id ON orders(farmer_id);
CREATE INDEX idx_orders_crop_id ON orders(crop_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Categories Table (for crop categories management)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO categories (name, description) VALUES
('Vegetables', 'Fresh vegetables'),
('Fruits', 'Fresh fruits'),
('Grains', 'Rice, wheat, corn, and other grains'),
('Legumes', 'Beans, lentils, and peas'),
('Dairy', 'Milk, cheese, and dairy products'),
('Meat', 'Poultry, beef, pork, and other meats'),
('Herbs', 'Fresh and dried herbs'),
('Nuts', 'Various nuts and seeds'),
('Other', 'Other agricultural products');

-- Admin Activity Logs
CREATE TABLE admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Platform Settings Table
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
('commission_percentage', '5.00'),
('platform_name', 'SmartFarm'),
('contact_email', 'support@smartfarm.com'),
('terms_url', 'https://smartfarm.com/terms'),
('privacy_url', 'https://smartfarm.com/privacy');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crops_updated_at BEFORE UPDATE ON crops
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for Dashboard Statistics

-- View: Total counts summary
CREATE VIEW dashboard_summary AS
SELECT
    (SELECT COUNT(*) FROM users WHERE role = 'farmer') as total_farmers,
    (SELECT COUNT(*) FROM users WHERE role = 'buyer') as total_buyers,
    (SELECT COUNT(*) FROM crops) as total_crops,
    (SELECT COUNT(*) FROM orders) as total_orders,
    (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
    (SELECT COUNT(*) FROM orders WHERE status = 'delivered') as delivered_orders,
    (SELECT COALESCE(SUM(total_price), 0) FROM orders WHERE status = 'delivered') as total_revenue;

-- View: Farmer statistics
CREATE VIEW farmer_stats AS
SELECT
    u.id as farmer_id,
    u.name as farmer_name,
    u.email as farmer_email,
    COUNT(DISTINCT c.id) as total_crops,
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(o.total_price), 0) as total_earnings
FROM users u
LEFT JOIN crops c ON u.id = c.farmer_id
LEFT JOIN orders o ON u.id = o.farmer_id
WHERE u.role = 'farmer'
GROUP BY u.id, u.name, u.email;

-- View: Crop sales statistics
CREATE VIEW crop_sales_stats AS
SELECT
    c.id as crop_id,
    c.name as crop_name,
    c.category,
    u.name as farmer_name,
    COUNT(o.id) as order_count,
    COALESCE(SUM(o.quantity), 0) as total_quantity_sold,
    COALESCE(SUM(o.total_price), 0) as total_revenue
FROM crops c
JOIN users u ON c.farmer_id = u.id
LEFT JOIN orders o ON c.id = o.crop_id AND o.status = 'delivered'
GROUP BY c.id, c.name, c.category, u.name;

-- View: Monthly revenue
CREATE VIEW monthly_revenue AS
SELECT
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as order_count,
    SUM(total_price) as revenue
FROM orders
WHERE status = 'delivered'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Comments for documentation
COMMENT ON TABLE users IS 'Stores all users: farmers, buyers, and admins';
COMMENT ON TABLE crops IS 'Stores crop listings created by farmers';
COMMENT ON TABLE orders IS 'Stores orders placed by buyers for crops';
COMMENT ON TABLE categories IS 'Stores crop categories';
COMMENT ON TABLE admin_logs IS 'Tracks admin actions for accountability';
COMMENT ON TABLE notifications IS 'Stores user notifications';
COMMENT ON TABLE settings IS 'Stores platform-wide settings';
