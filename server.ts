import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import pg from "pg";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const { Pool } = pg;
const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "smartfarm_secret_key_2026";

// Database Pool
const pool = new Pool({
  connectionString: 'postgresql://smartfarm:ajvsGgtxm2LptR3vS5icL2pyLfy7GX0H@dpg-d798cv9r0fns73eccpe0-a.oregon-postgres.render.com/smartfarm_azmq',
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize Database
async function initDB() {
  try {
    const client = await pool.connect();
    const schema = `
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(20) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          location VARCHAR(100) NOT NULL,
          role VARCHAR(20) NOT NULL DEFAULT 'user',
          profile_image TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          is_suspended BOOLEAN DEFAULT FALSE
      );
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
          status VARCHAR(20) DEFAULT 'approved',
          is_featured BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS market_prices (
          id SERIAL PRIMARY KEY,
          crop_name VARCHAR(255) NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          unit VARCHAR(50) DEFAULT 'kg',
          trend VARCHAR(20),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS alerts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR(50) DEFAULT 'general',
          status VARCHAR(20) DEFAULT 'approved',
          image_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS guidance (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          category VARCHAR(50) NOT NULL,
          content TEXT NOT NULL,
          image_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS counties (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE
      );
      CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          message TEXT NOT NULL,
          reply TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          replied_at TIMESTAMP WITH TIME ZONE
      );
      CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          buyer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          crop_id INTEGER REFERENCES crops(id) ON DELETE CASCADE,
          quantity DECIMAL(10, 2) NOT NULL,
          total_price DECIMAL(10, 2) NOT NULL,
          status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, delivered, cancelled
          delivery_address TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS payments (
          id SERIAL PRIMARY KEY,
          order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
          amount DECIMAL(10, 2) NOT NULL,
          status VARCHAR(20) DEFAULT 'pending', -- pending, completed, refunded
          transaction_ref VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS events (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          location VARCHAR(255),
          event_date TIMESTAMP WITH TIME ZONE NOT NULL,
          image_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS admin_logs (
          id SERIAL PRIMARY KEY,
          admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          action_type VARCHAR(50) NOT NULL,
          target_type VARCHAR(50),
          target_id INTEGER,
          details JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS crop_problem_logs (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          image_url TEXT,
          diagnosis TEXT,
          solution TEXT,
          is_reviewed BOOLEAN DEFAULT FALSE,
          admin_correction TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await client.query(schema);

    // Ensure columns exist for existing tables
    await client.query("ALTER TABLE alerts ADD COLUMN IF NOT EXISTS image_url TEXT");
    await client.query("ALTER TABLE events ADD COLUMN IF NOT EXISTS image_url TEXT");

    // Seed counties
    const countyCheck = await client.query('SELECT COUNT(*) FROM counties');
    if (parseInt(countyCheck.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO counties (name) VALUES 
        ('Mombasa'), ('Kwale'), ('Kilifi'), ('Tana River'), ('Lamu'), ('Taita Taveta'),
        ('Garissa'), ('Wajir'), ('Mandera'), ('Marsabit'), ('Isiolo'), ('Meru'),
        ('Tharaka-Nithi'), ('Embu'), ('Kitui'), ('Machakos'), ('Makueni'), ('Nyandarua'),
        ('Nyeri'), ('Kirinyaga'), ('Murang''a'), ('Kiambu'), ('Turkana'), ('West Pokot'),
        ('Samburu'), ('Trans Nzoia'), ('Uasin Gishu'), ('Elgeyo Marakwet'), ('Nandi'), ('Baringo'),
        ('Laikipia'), ('Nakuru'), ('Narok'), ('Kajiado'), ('Kericho'), ('Bomet'),
        ('Kakamega'), ('Vihiga'), ('Bungoma'), ('Busia'), ('Siaya'), ('Kisumu'),
        ('Homa Bay'), ('Migori'), ('Kisii'), ('Nyamira'), ('Nairobi')
      `);
    }
    
    // Seed admin
    const adminEmail = 'abelmuturi04@gmail.com';
    const adminPassword = '@Muturi123#';
    console.log(`Checking for admin: ${adminEmail}`);
    const adminCheck = await client.query('SELECT * FROM users WHERE email = $1', [adminEmail]);
    
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    if (adminCheck.rows.length === 0) {
      console.log('Admin not found. Creating...');
      await client.query(
        'INSERT INTO users (name, phone, email, password, location, role, is_suspended) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        ['Abel Itotia', '0700000000', adminEmail, hashedPassword, 'Nairobi', 'admin', false]
      );
      console.log('Admin user created successfully.');
    } else {
      console.log('Admin found. Updating credentials and status...');
      // Update existing admin to ensure credentials match and account is active
      await client.query(
        'UPDATE users SET password = $1, role = $2, is_suspended = $3 WHERE email = $4',
        [hashedPassword, 'admin', false, adminEmail]
      );
      console.log('Admin user credentials and status updated successfully.');
    }

    // Seed sample market prices
    const priceCheck = await client.query('SELECT * FROM market_prices');
    if (priceCheck.rows.length === 0) {
      await client.query(`
        INSERT INTO market_prices (crop_name, price, unit, trend) VALUES 
        ('Maize', 4500, '90kg bag', 'up'),
        ('Beans', 12000, '90kg bag', 'down'),
        ('Tomatoes', 80, 'kg', 'up'),
        ('Potatoes', 3500, '50kg bag', 'stable')
      `);
    }

    // Seed sample guidance
    const guideCheck = await client.query('SELECT * FROM guidance');
    if (guideCheck.rows.length === 0) {
      await client.query(`
        INSERT INTO guidance (title, category, content) VALUES 
        ('Maize Planting Guide', 'crop', 'Plant maize at the onset of rains. Use certified seeds and space 75x25cm.'),
        ('Dairy Cow Management', 'livestock', 'Ensure clean water, quality silage, and regular vaccination for high milk yield.')
      `);
    }

    client.release();
    console.log('Database initialized successfully.');
  } catch (err) {
    console.error('Database initialization failed:', err);
  }
}

app.use(express.json({ limit: '50mb' }));

// Middleware: Auth
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    (req as any).user = user;
    next();
  });
};

// Middleware: Admin Only
const isAdmin = (req: any, res: any, next: any) => {
  if ((req as any).user.role !== 'admin') return res.status(403).json({ error: "Admin access required" });
  next();
};

// Helper: Log Admin Action
const logAdminAction = async (adminId: number, actionType: string, targetType: string, targetId: number | null, details: any) => {
  try {
    await pool.query(
      "INSERT INTO admin_logs (admin_id, action_type, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5)",
      [adminId, actionType, targetType, targetId, JSON.stringify(details)]
    );
  } catch (err) {
    console.error("Failed to log admin action:", err);
  }
};

// --- API ROUTES ---

// Auth: Register
app.post("/api/auth/register", async (req, res) => {
  const { name, phone, email, password, location, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, phone, email, password, location, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role",
      [name, phone, email, hashedPassword, location, role || 'farmer']
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/debug/reset-admin", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash('@Muturi123#', 10);
    await pool.query(
      "UPDATE users SET password = $1, is_suspended = false, role = 'admin' WHERE email = 'abelmuturi04@gmail.com'",
      [hashedPassword]
    );
    res.json({ success: true, message: "Admin password reset to @Muturi123#" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/debug/admin", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, role, is_suspended FROM users WHERE email = 'abelmuturi04@gmail.com'");
    res.json(result.rows[0] || { error: "Admin not found" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Auth: Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    console.log(`Login attempt for: ${email}, User found: ${!!user}, Suspended: ${user?.is_suspended}`);

    if (!user || user.is_suspended) {
      console.log(`Login failed: User not found or suspended. Email: ${email}`);
      return res.status(401).json({ error: "Invalid credentials or account suspended" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    console.log(`Password comparison for ${email}: ${validPassword}`);
    
    if (!validPassword) {
      console.log(`Login failed: Invalid password for ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, location: user.location } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Market Prices
app.get("/api/market-prices", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM market_prices ORDER BY updated_at DESC");
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Counties
app.get("/api/counties", async (req, res) => {
  try {
    const result = await pool.query("SELECT name FROM counties ORDER BY name ASC");
    res.json(result.rows.map(r => r.name));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Crops Marketplace
app.get("/api/crops", async (req, res) => {
  const { search, county, category } = req.query;
  let query = "SELECT c.*, u.name as farmer_name FROM crops c JOIN users u ON c.farmer_id = u.id WHERE c.status = 'approved'";
  const params: any[] = [];

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (c.name ILIKE $${params.length} OR u.name ILIKE $${params.length})`;
  }
  if (county) {
    params.push(county);
    query += ` AND c.county = $${params.length}`;
  }
  if (category) {
    params.push(category);
    query += ` AND c.category = $${params.length}`;
  }

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/crops", authenticateToken, async (req, res) => {
  const { name, category, price, unit, description, image_url, county } = req.body;
  const user = (req as any).user;
  
  if (user.role !== 'farmer' && user.role !== 'admin') {
    return res.status(403).json({ error: "Only farmers and admins can list crops" });
  }

  try {
    const status = user.role === 'admin' ? 'approved' : 'pending';
    const result = await pool.query(
      "INSERT INTO crops (farmer_id, name, category, price, unit, description, image_url, county, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [user.id, name, category, price, unit, description, image_url, county, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Alerts
app.get("/api/alerts", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM alerts WHERE status = 'approved' OR user_id = $1 ORDER BY created_at DESC", [(req as any).user.id]);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Events
app.get("/api/events", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM events ORDER BY event_date ASC");
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Guidance
app.get("/api/guidance", async (req, res) => {
  const { category } = req.query;
  try {
    let query = "SELECT * FROM guidance";
    const params = [];
    if (category) {
      query += " WHERE category = $1";
      params.push(category);
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Crop Problem Detection (Gemini)
app.post("/api/detect-problem", authenticateToken, async (req, res) => {
  const { image, symptoms, environment } = req.body; // base64
  if (!image) return res.status(400).json({ error: "Image required" });

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    
    let prompt = "Analyze this crop image and identify any diseases or pests. Provide a diagnosis and a recommended solution/treatment. Format as JSON with 'diagnosis' and 'solution' fields.";
    if (symptoms) prompt += `\nUser reported symptoms: ${symptoms}`;
    if (environment) prompt += `\nEnvironmental conditions: ${environment}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: image } }
        ]
      },
      config: { responseMimeType: "application/json" }
    });

    const result = JSON.parse(response.text || "{}");
    
    // Log the problem
    const fullImageUrl = `data:image/jpeg;base64,${image}`;
    await pool.query(
      "INSERT INTO crop_problem_logs (user_id, image_url, symptoms, environment, diagnosis, solution) VALUES ($1, $2, $3, $4, $5, $6)",
      [(req as any).user.id, fullImageUrl, symptoms, environment, result.diagnosis, result.solution]
    );

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Orders
app.get("/api/orders", authenticateToken, async (req, res) => {
  const user = (req as any).user;
  try {
    const result = await pool.query(
      "SELECT o.*, c.name as crop_name, c.image_url, u.name as farmer_name FROM orders o JOIN crops c ON o.crop_id = c.id JOIN users u ON c.farmer_id = u.id WHERE o.buyer_id = $1 ORDER BY o.created_at DESC",
      [user.id]
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/orders", authenticateToken, async (req, res) => {
  const { crop_id, quantity, total_price } = req.body;
  const user = (req as any).user;
  try {
    const result = await pool.query(
      "INSERT INTO orders (buyer_id, crop_id, quantity, total_price, status) VALUES ($1, $2, $3, $4, 'pending') RETURNING *",
      [user.id, crop_id, quantity, total_price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Messages
app.get("/api/messages", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT m.*, u.name as sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.sender_id = $1 OR m.receiver_id = $1 ORDER BY m.created_at DESC",
      [(req as any).user.id]
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/messages", authenticateToken, async (req, res) => {
  const { message } = req.body;
  try {
    // Find an admin to receive the message
    const adminResult = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if (adminResult.rows.length === 0) return res.status(404).json({ error: "No admin found" });
    
    const result = await pool.query(
      "INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3) RETURNING *",
      [(req as any).user.id, adminResult.rows[0].id, message]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN ROUTES ---

// Dashboard Stats
app.get("/api/admin/stats", authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await pool.query("SELECT COUNT(*) as total, role, is_suspended FROM users GROUP BY role, is_suspended");
    const crops = await pool.query("SELECT COUNT(*) as total, status FROM crops GROUP BY status");
    const orders = await pool.query("SELECT COUNT(*) as total, status FROM orders GROUP BY status");
    const revenue = await pool.query("SELECT SUM(amount) as total FROM payments WHERE status = 'completed'");
    
    // Graphs data (mocking some for now, but structure is there)
    const ordersByTime = await pool.query("SELECT DATE_TRUNC('day', created_at) as date, COUNT(*) as count FROM orders GROUP BY date ORDER BY date DESC LIMIT 7");
    const revenueByTime = await pool.query("SELECT DATE_TRUNC('day', created_at) as date, SUM(amount) as total FROM payments WHERE status = 'completed' GROUP BY date ORDER BY date DESC LIMIT 7");
    const usersByCounty = await pool.query("SELECT location as county, COUNT(*) as count FROM users GROUP BY location");

    res.json({
      users: users.rows,
      crops: crops.rows,
      orders: orders.rows,
      revenue: revenue.rows[0].total || 0,
      graphs: {
        ordersByTime: ordersByTime.rows,
        revenueByTime: revenueByTime.rows,
        usersByCounty: usersByCounty.rows
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// User Management
app.get("/api/admin/users", authenticateToken, isAdmin, async (req, res) => {
  const { search, role, county } = req.query;
  let query = "SELECT id, name, email, phone, location, role, is_suspended, created_at FROM users WHERE 1=1";
  const params: any[] = [];

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (name ILIKE $${params.length} OR email ILIKE $${params.length} OR phone ILIKE $${params.length})`;
  }
  if (role) {
    params.push(role);
    query += ` AND role = $${params.length}`;
  }
  if (county) {
    params.push(county);
    query += ` AND location = $${params.length}`;
  }

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/users/:id/suspend", authenticateToken, isAdmin, async (req, res) => {
  const { suspend } = req.body;
  try {
    await pool.query("UPDATE users SET is_suspended = $1 WHERE id = $2", [suspend, req.params.id]);
    await logAdminAction((req as any).user.id, suspend ? 'SUSPEND_USER' : 'ACTIVATE_USER', 'user', parseInt(req.params.id), { suspend });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/admin/users/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [req.params.id]);
    await logAdminAction((req as any).user.id, 'DELETE_USER', 'user', parseInt(req.params.id), {});
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Crop Moderation
app.get("/api/admin/crops", authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT c.*, u.name as farmer_name FROM crops c JOIN users u ON c.farmer_id = u.id ORDER BY c.created_at DESC");
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/crops/:id/status", authenticateToken, isAdmin, async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query("UPDATE crops SET status = $1 WHERE id = $2", [status, req.params.id]);
    await logAdminAction((req as any).user.id, 'UPDATE_CROP_STATUS', 'crop', parseInt(req.params.id), { status });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Order Management
app.get("/api/admin/orders", authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, b.name as buyer_name, c.name as crop_name, f.name as farmer_name 
      FROM orders o 
      JOIN users b ON o.buyer_id = b.id 
      JOIN crops c ON o.crop_id = c.id 
      JOIN users f ON c.farmer_id = f.id 
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Market Price Management
app.post("/api/admin/market-prices", authenticateToken, isAdmin, async (req, res) => {
  const { crop_name, price, unit, trend } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO market_prices (crop_name, price, unit, trend) VALUES ($1, $2, $3, $4) RETURNING *",
      [crop_name, price, unit, trend]
    );
    await logAdminAction((req as any).user.id, 'UPDATE_MARKET_PRICE', 'market_price', result.rows[0].id, { crop_name, price });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Logs
app.get("/api/admin/logs", authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT l.*, u.name as admin_name FROM admin_logs l LEFT JOIN users u ON l.admin_id = u.id ORDER BY l.created_at DESC LIMIT 100");
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Payments tracking
app.get("/api/admin/payments", authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM payments ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// AI Logs
app.get("/api/admin/ai-logs", authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM crop_problem_logs ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Events Management
app.post("/api/admin/events", authenticateToken, isAdmin, async (req, res) => {
  const { title, description, location, event_date } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO events (title, description, location, event_date) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, description, location, event_date]
    );
    await logAdminAction((req as any).user.id, 'CREATE_EVENT', 'event', result.rows[0].id, { title });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Guidance Management
app.post("/api/admin/guidance", authenticateToken, isAdmin, async (req, res) => {
  const { title, category, content, image_url } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO guidance (title, category, content, image_url) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, category, content, image_url]
    );
    await logAdminAction((req as any).user.id, 'CREATE_GUIDE', 'guidance', result.rows[0].id, { title });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// County Management
app.post("/api/admin/counties", authenticateToken, isAdmin, async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query("INSERT INTO counties (name) VALUES ($1) RETURNING *", [name]);
    await logAdminAction((req as any).user.id, 'CREATE_COUNTY', 'county', result.rows[0].id, { name });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/messages", authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT m.*, u.name as sender_name, u.email as sender_email FROM messages m JOIN users u ON m.sender_id = u.id ORDER BY m.created_at DESC"
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/messages/:id/reply", authenticateToken, isAdmin, async (req, res) => {
  const { reply } = req.body;
  try {
    await pool.query(
      "UPDATE messages SET reply = $1, replied_at = CURRENT_TIMESTAMP WHERE id = $2",
      [reply, req.params.id]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/stats", authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await pool.query("SELECT COUNT(*) FROM users");
    const crops = await pool.query("SELECT COUNT(*) FROM crops");
    const orders = await pool.query("SELECT COUNT(*) FROM orders");
    const alerts = await pool.query("SELECT COUNT(*) FROM alerts WHERE status = 'pending'");
    
    res.json({
      totalUsers: parseInt(users.rows[0].count),
      totalCrops: parseInt(crops.rows[0].count),
      totalOrders: parseInt(orders.rows[0].count),
      pendingAlerts: parseInt(alerts.rows[0].count)
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/admin/users", authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, phone, role, location, is_suspended FROM users ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/users/:id/suspend", authenticateToken, isAdmin, async (req, res) => {
  const { suspend } = req.body;
  try {
    await pool.query("UPDATE users SET is_suspended = $1 WHERE id = $2", [suspend, req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/alerts", authenticateToken, isAdmin, async (req, res) => {
  const { title, message, type, image_url } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO alerts (user_id, title, message, type, status, image_url) VALUES ($1, $2, $3, $4, 'approved', $5) RETURNING *",
      [(req as any).user.id, title, message, type || 'general', image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/events", authenticateToken, isAdmin, async (req, res) => {
  const { title, description, event_date, location, image_url } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO events (title, description, event_date, location, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, description, event_date, location, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/admin/crops/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM crops WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/admin/alerts/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM alerts WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/admin/events/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM events WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/admin/guidance/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM guidance WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/admin/market-prices/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM market_prices WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite Setup
async function startServer() {
  await initDB();
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
