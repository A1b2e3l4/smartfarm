<?php
/**
 * SmartFarm Dashboard API
 * 
 * GET /dashboard - Get dashboard statistics
 * GET /dashboard/farmer - Get farmer-specific stats
 * GET /dashboard/buyer - Get buyer-specific stats
 */

require_once '../config/database.php';
require_once '../config/jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_parts = explode('/', trim($path, '/'));
$type = isset($path_parts[1]) ? $path_parts[1] : null;

// Only accept GET requests
if ($method !== 'GET') {
    errorResponse('Method not allowed', 405);
    exit();
}

// Authenticate user
$payload = requireAuth();
if (!$payload) {
    exit();
}

$user_id = $payload['user_id'];
$user_role = $payload['role'];

// Database connection
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    errorResponse('Database connection failed', 500);
    exit();
}

// GET /dashboard - General dashboard stats
if (empty($type)) {
    try {
        $stats = [];
        
        // Get summary stats based on role
        if ($user_role === 'admin') {
            // Admin sees platform-wide stats
            $query = "SELECT * FROM dashboard_summary";
            $stmt = $db->query($query);
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Get recent orders
            $recent_query = "SELECT o.*, c.name as crop_name, buyer.name as buyer_name, farmer.name as farmer_name
                            FROM orders o
                            JOIN crops c ON o.crop_id = c.id
                            JOIN users buyer ON o.buyer_id = buyer.id
                            JOIN users farmer ON o.farmer_id = farmer.id
                            ORDER BY o.created_at DESC LIMIT 10";
            $recent_stmt = $db->query($recent_query);
            $stats['recent_orders'] = $recent_stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get top crops
            $top_crops_query = "SELECT * FROM crop_sales_stats ORDER BY order_count DESC LIMIT 5";
            $top_crops_stmt = $db->query($top_crops_query);
            $stats['top_crops'] = $top_crops_stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } elseif ($user_role === 'farmer') {
            // Farmer sees their own stats
            
            // Total crops
            $crops_query = "SELECT COUNT(*) as total_crops FROM crops WHERE farmer_id = :user_id";
            $crops_stmt = $db->prepare($crops_query);
            $crops_stmt->bindParam(':user_id', $user_id);
            $crops_stmt->execute();
            $stats['total_crops'] = $crops_stmt->fetch(PDO::FETCH_ASSOC)['total_crops'];
            
            // Available crops
            $available_query = "SELECT COUNT(*) as available_crops FROM crops WHERE farmer_id = :user_id AND status = 'available'";
            $available_stmt = $db->prepare($available_query);
            $available_stmt->bindParam(':user_id', $user_id);
            $available_stmt->execute();
            $stats['available_crops'] = $available_stmt->fetch(PDO::FETCH_ASSOC)['available_crops'];
            
            // Total orders received
            $orders_query = "SELECT COUNT(*) as total_orders, 
                            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
                            SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders
                            FROM orders WHERE farmer_id = :user_id";
            $orders_stmt = $db->prepare($orders_query);
            $orders_stmt->bindParam(':user_id', $user_id);
            $orders_stmt->execute();
            $order_stats = $orders_stmt->fetch(PDO::FETCH_ASSOC);
            $stats['total_orders'] = $order_stats['total_orders'];
            $stats['pending_orders'] = $order_stats['pending_orders'];
            $stats['delivered_orders'] = $order_stats['delivered_orders'];
            
            // Total earnings
            $earnings_query = "SELECT COALESCE(SUM(total_price), 0) as total_earnings 
                              FROM orders WHERE farmer_id = :user_id AND status = 'delivered'";
            $earnings_stmt = $db->prepare($earnings_query);
            $earnings_stmt->bindParam(':user_id', $user_id);
            $earnings_stmt->execute();
            $stats['total_earnings'] = $earnings_stmt->fetch(PDO::FETCH_ASSOC)['total_earnings'];
            
            // Recent orders
            $recent_query = "SELECT o.*, c.name as crop_name, buyer.name as buyer_name
                            FROM orders o
                            JOIN crops c ON o.crop_id = c.id
                            JOIN users buyer ON o.buyer_id = buyer.id
                            WHERE o.farmer_id = :user_id
                            ORDER BY o.created_at DESC LIMIT 5";
            $recent_stmt = $db->prepare($recent_query);
            $recent_stmt->bindParam(':user_id', $user_id);
            $recent_stmt->execute();
            $stats['recent_orders'] = $recent_stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } else {
            // Buyer stats
            
            // Total orders placed
            $orders_query = "SELECT COUNT(*) as total_orders, 
                            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
                            SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders
                            FROM orders WHERE buyer_id = :user_id";
            $orders_stmt = $db->prepare($orders_query);
            $orders_stmt->bindParam(':user_id', $user_id);
            $orders_stmt->execute();
            $order_stats = $orders_stmt->fetch(PDO::FETCH_ASSOC);
            $stats['total_orders'] = $order_stats['total_orders'];
            $stats['pending_orders'] = $order_stats['pending_orders'];
            $stats['delivered_orders'] = $order_stats['delivered_orders'];
            
            // Total spent
            $spent_query = "SELECT COALESCE(SUM(total_price), 0) as total_spent 
                           FROM orders WHERE buyer_id = :user_id AND status = 'delivered'";
            $spent_stmt = $db->prepare($spent_query);
            $spent_stmt->bindParam(':user_id', $user_id);
            $spent_stmt->execute();
            $stats['total_spent'] = $spent_stmt->fetch(PDO::FETCH_ASSOC)['total_spent'];
            
            // Recent orders
            $recent_query = "SELECT o.*, c.name as crop_name, c.image as crop_image, farmer.name as farmer_name
                            FROM orders o
                            JOIN crops c ON o.crop_id = c.id
                            JOIN users farmer ON o.farmer_id = farmer.id
                            WHERE o.buyer_id = :user_id
                            ORDER BY o.created_at DESC LIMIT 5";
            $recent_stmt = $db->prepare($recent_query);
            $recent_stmt->bindParam(':user_id', $user_id);
            $recent_stmt->execute();
            $stats['recent_orders'] = $recent_stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        
        successResponse($stats);
        
    } catch (PDOException $e) {
        error_log("Dashboard error: " . $e->getMessage());
        errorResponse('Failed to fetch dashboard data', 500);
    }
}

// GET /dashboard/farmer - Farmer specific stats
elseif ($type === 'farmer' && $user_role === 'farmer') {
    try {
        // Monthly earnings
        $monthly_query = "SELECT 
                            DATE_TRUNC('month', created_at) as month,
                            COUNT(*) as order_count,
                            SUM(total_price) as earnings
                          FROM orders
                          WHERE farmer_id = :user_id AND status = 'delivered'
                          GROUP BY DATE_TRUNC('month', created_at)
                          ORDER BY month DESC
                          LIMIT 12";
        $monthly_stmt = $db->prepare($monthly_query);
        $monthly_stmt->bindParam(':user_id', $user_id);
        $monthly_stmt->execute();
        $monthly_earnings = $monthly_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Crop performance
        $crops_query = "SELECT 
                          c.name,
                          COUNT(o.id) as orders,
                          COALESCE(SUM(o.quantity), 0) as quantity_sold,
                          COALESCE(SUM(o.total_price), 0) as revenue
                        FROM crops c
                        LEFT JOIN orders o ON c.id = o.crop_id AND o.status = 'delivered'
                        WHERE c.farmer_id = :user_id
                        GROUP BY c.id, c.name
                        ORDER BY revenue DESC";
        $crops_stmt = $db->prepare($crops_query);
        $crops_stmt->bindParam(':user_id', $user_id);
        $crops_stmt->execute();
        $crop_performance = $crops_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        successResponse([
            'monthly_earnings' => $monthly_earnings,
            'crop_performance' => $crop_performance
        ]);
        
    } catch (PDOException $e) {
        error_log("Farmer dashboard error: " . $e->getMessage());
        errorResponse('Failed to fetch farmer dashboard data', 500);
    }
}

// GET /dashboard/buyer - Buyer specific stats
elseif ($type === 'buyer' && $user_role === 'buyer') {
    try {
        // Purchase history by category
        $category_query = "SELECT 
                            c.category,
                            COUNT(o.id) as orders,
                            SUM(o.total_price) as total_spent
                          FROM orders o
                          JOIN crops c ON o.crop_id = c.id
                          WHERE o.buyer_id = :user_id AND o.status = 'delivered'
                          GROUP BY c.category";
        $category_stmt = $db->prepare($category_query);
        $category_stmt->bindParam(':user_id', $user_id);
        $category_stmt->execute();
        $category_spending = $category_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Top farmers ordered from
        $farmers_query = "SELECT 
                            farmer.name as farmer_name,
                            COUNT(o.id) as orders,
                            SUM(o.total_price) as total_spent
                          FROM orders o
                          JOIN users farmer ON o.farmer_id = farmer.id
                          WHERE o.buyer_id = :user_id AND o.status = 'delivered'
                          GROUP BY farmer.id, farmer.name
                          ORDER BY total_spent DESC
                          LIMIT 5";
        $farmers_stmt = $db->prepare($farmers_query);
        $farmers_stmt->bindParam(':user_id', $user_id);
        $farmers_stmt->execute();
        $top_farmers = $farmers_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        successResponse([
            'category_spending' => $category_spending,
            'top_farmers' => $top_farmers
        ]);
        
    } catch (PDOException $e) {
        error_log("Buyer dashboard error: " . $e->getMessage());
        errorResponse('Failed to fetch buyer dashboard data', 500);
    }
}

else {
    errorResponse('Invalid dashboard endpoint', 404);
}
