<?php
/**
 * SmartFarm Admin Statistics API
 * 
 * GET /admin/stats - Get platform statistics
 * GET /admin/stats/revenue - Get revenue statistics
 * GET /admin/stats/crops - Get crop statistics
 */

require_once '../config/database.php';
require_once '../config/jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_parts = explode('/', trim($path, '/'));
$type = isset($path_parts[2]) ? $path_parts[2] : null;

// Only accept GET requests
if ($method !== 'GET') {
    errorResponse('Method not allowed', 405);
    exit();
}

// Require admin role
$payload = requireRole('admin');
if (!$payload) {
    exit();
}

// Database connection
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    errorResponse('Database connection failed', 500);
    exit();
}

// GET /admin/stats - Platform statistics
if (empty($type)) {
    try {
        $stats = [];
        
        // Dashboard summary
        $summary_query = "SELECT * FROM dashboard_summary";
        $summary_stmt = $db->query($summary_query);
        $stats['summary'] = $summary_stmt->fetch(PDO::FETCH_ASSOC);
        
        // User growth by month
        $user_growth_query = "SELECT 
                                DATE_TRUNC('month', created_at) as month,
                                COUNT(*) as new_users,
                                SUM(CASE WHEN role = 'farmer' THEN 1 ELSE 0 END) as new_farmers,
                                SUM(CASE WHEN role = 'buyer' THEN 1 ELSE 0 END) as new_buyers
                              FROM users
                              GROUP BY DATE_TRUNC('month', created_at)
                              ORDER BY month DESC
                              LIMIT 12";
        $user_growth_stmt = $db->query($user_growth_query);
        $stats['user_growth'] = $user_growth_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Order trends
        $order_trends_query = "SELECT 
                                DATE_TRUNC('month', created_at) as month,
                                COUNT(*) as order_count,
                                SUM(total_price) as revenue,
                                SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
                                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                                SUM(CASE WHEN status = 'canceled' THEN 1 ELSE 0 END) as canceled
                              FROM orders
                              GROUP BY DATE_TRUNC('month', created_at)
                              ORDER BY month DESC
                              LIMIT 12";
        $order_trends_stmt = $db->query($order_trends_query);
        $stats['order_trends'] = $order_trends_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Top performing farmers
        $top_farmers_query = "SELECT 
                                u.name as farmer_name,
                                COUNT(o.id) as total_orders,
                                COALESCE(SUM(o.total_price), 0) as total_revenue
                              FROM users u
                              LEFT JOIN orders o ON u.id = o.farmer_id AND o.status = 'delivered'
                              WHERE u.role = 'farmer'
                              GROUP BY u.id, u.name
                              ORDER BY total_revenue DESC
                              LIMIT 10";
        $top_farmers_stmt = $db->query($top_farmers_query);
        $stats['top_farmers'] = $top_farmers_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Top buyers
        $top_buyers_query = "SELECT 
                                u.name as buyer_name,
                                COUNT(o.id) as total_orders,
                                COALESCE(SUM(o.total_price), 0) as total_spent
                              FROM users u
                              LEFT JOIN orders o ON u.id = o.buyer_id AND o.status = 'delivered'
                              WHERE u.role = 'buyer'
                              GROUP BY u.id, u.name
                              ORDER BY total_spent DESC
                              LIMIT 10";
        $top_buyers_stmt = $db->query($top_buyers_query);
        $stats['top_buyers'] = $top_buyers_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        successResponse($stats);
        
    } catch (PDOException $e) {
        error_log("Admin stats error: " . $e->getMessage());
        errorResponse('Failed to fetch statistics', 500);
    }
}

// GET /admin/stats/revenue - Revenue statistics
elseif ($type === 'revenue') {
    $period = isset($_GET['period']) ? $_GET['period'] : 'monthly';
    
    try {
        $revenue = [];
        
        if ($period === 'daily') {
            $query = "SELECT 
                        DATE(created_at) as date,
                        COUNT(*) as order_count,
                        SUM(total_price) as revenue
                      FROM orders
                      WHERE status = 'delivered'
                      GROUP BY DATE(created_at)
                      ORDER BY date DESC
                      LIMIT 30";
        } elseif ($period === 'yearly') {
            $query = "SELECT 
                        DATE_TRUNC('year', created_at) as year,
                        COUNT(*) as order_count,
                        SUM(total_price) as revenue
                      FROM orders
                      WHERE status = 'delivered'
                      GROUP BY DATE_TRUNC('year', created_at)
                      ORDER BY year DESC";
        } else {
            $query = "SELECT 
                        DATE_TRUNC('month', created_at) as month,
                        COUNT(*) as order_count,
                        SUM(total_price) as revenue
                      FROM orders
                      WHERE status = 'delivered'
                      GROUP BY DATE_TRUNC('month', created_at)
                      ORDER BY month DESC
                      LIMIT 24";
        }
        
        $stmt = $db->query($query);
        $revenue['data'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Total revenue
        $total_query = "SELECT COALESCE(SUM(total_price), 0) as total_revenue FROM orders WHERE status = 'delivered'";
        $total_stmt = $db->query($total_query);
        $revenue['total'] = $total_stmt->fetch(PDO::FETCH_ASSOC)['total_revenue'];
        
        // Revenue this month
        $month_query = "SELECT COALESCE(SUM(total_price), 0) as month_revenue 
                        FROM orders 
                        WHERE status = 'delivered' 
                        AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)";
        $month_stmt = $db->query($month_query);
        $revenue['this_month'] = $month_stmt->fetch(PDO::FETCH_ASSOC)['month_revenue'];
        
        successResponse($revenue);
        
    } catch (PDOException $e) {
        error_log("Revenue stats error: " . $e->getMessage());
        errorResponse('Failed to fetch revenue statistics', 500);
    }
}

// GET /admin/stats/crops - Crop statistics
elseif ($type === 'crops') {
    try {
        $stats = [];
        
        // Crops by category
        $category_query = "SELECT 
                            category,
                            COUNT(*) as crop_count,
                            SUM(quantity) as total_quantity,
                            AVG(price) as avg_price
                          FROM crops
                          GROUP BY category
                          ORDER BY crop_count DESC";
        $category_stmt = $db->query($category_query);
        $stats['by_category'] = $category_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Most popular crops
        $popular_query = "SELECT 
                            c.name,
                            c.category,
                            u.name as farmer_name,
                            COUNT(o.id) as order_count,
                            COALESCE(SUM(o.quantity), 0) as quantity_sold,
                            COALESCE(SUM(o.total_price), 0) as revenue
                          FROM crops c
                          JOIN users u ON c.farmer_id = u.id
                          LEFT JOIN orders o ON c.id = o.crop_id AND o.status = 'delivered'
                          GROUP BY c.id, c.name, c.category, u.name
                          ORDER BY order_count DESC
                          LIMIT 20";
        $popular_stmt = $db->query($popular_query);
        $stats['popular_crops'] = $popular_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Crop availability
        $availability_query = "SELECT 
                                status,
                                COUNT(*) as count
                              FROM crops
                              GROUP BY status";
        $availability_stmt = $db->query($availability_query);
        $stats['availability'] = $availability_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        successResponse($stats);
        
    } catch (PDOException $e) {
        error_log("Crop stats error: " . $e->getMessage());
        errorResponse('Failed to fetch crop statistics', 500);
    }
}

else {
    errorResponse('Invalid statistics endpoint', 404);
}
