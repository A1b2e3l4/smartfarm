<?php
/**
 * SmartFarm Admin Users API
 * 
 * GET /admin/users - List all users
 * GET /admin/users/:id - Get user details
 * PUT /admin/users/:id - Update user
 * DELETE /admin/users/:id - Delete user
 */

require_once '../config/database.php';
require_once '../config/jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_parts = explode('/', trim($path, '/'));
$user_id = isset($path_parts[2]) ? $path_parts[2] : null;

// Require admin role
$payload = requireRole('admin');
if (!$payload) {
    exit();
}

$admin_id = $payload['user_id'];

// Database connection
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    errorResponse('Database connection failed', 500);
    exit();
}

// GET /admin/users - List users
if ($method === 'GET' && empty($user_id)) {
    $role = isset($_GET['role']) ? $_GET['role'] : '';
    $status = isset($_GET['status']) ? $_GET['status'] : '';
    $search = isset($_GET['search']) ? $_GET['search'] : '';
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 20;
    $offset = ($page - 1) * $limit;
    
    try {
        $where_clauses = [];
        $params = [];
        
        if ($role) {
            $where_clauses[] = "role = :role";
            $params[':role'] = $role;
        }
        
        if ($status) {
            $where_clauses[] = "status = :status";
            $params[':status'] = $status;
        }
        
        if ($search) {
            $where_clauses[] = "(name ILIKE :search OR email ILIKE :search)";
            $params[':search'] = "%{$search}%";
        }
        
        $where_sql = !empty($where_clauses) ? 'WHERE ' . implode(' AND ', $where_clauses) : '';
        
        // Get total count
        $count_query = "SELECT COUNT(*) as total FROM users {$where_sql}";
        $count_stmt = $db->prepare($count_query);
        foreach ($params as $key => $value) {
            $count_stmt->bindValue($key, $value);
        }
        $count_stmt->execute();
        $total = $count_stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Get users
        $query = "SELECT id, name, email, role, phone, status, created_at, updated_at 
                  FROM users 
                  {$where_sql}
                  ORDER BY created_at DESC
                  LIMIT :limit OFFSET :offset";
        
        $stmt = $db->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        successResponse([
            'users' => $users,
            'pagination' => [
                'total' => intval($total),
                'page' => $page,
                'limit' => $limit,
                'total_pages' => ceil($total / $limit)
            ]
        ]);
        
    } catch (PDOException $e) {
        error_log("List users error: " . $e->getMessage());
        errorResponse('Failed to fetch users', 500);
    }
}

// GET /admin/users/:id - Get user details
elseif ($method === 'GET' && !empty($user_id)) {
    try {
        // Get user info
        $user_query = "SELECT id, name, email, role, phone, address, profile_image, status, created_at, updated_at 
                       FROM users WHERE id = :id";
        $user_stmt = $db->prepare($user_query);
        $user_stmt->bindParam(':id', $user_id);
        $user_stmt->execute();
        
        if ($user_stmt->rowCount() === 0) {
            errorResponse('User not found', 404);
            exit();
        }
        
        $user = $user_stmt->fetch(PDO::FETCH_ASSOC);
        
        // Get user's crops if farmer
        if ($user['role'] === 'farmer') {
            $crops_query = "SELECT * FROM crops WHERE farmer_id = :id ORDER BY created_at DESC";
            $crops_stmt = $db->prepare($crops_query);
            $crops_stmt->bindParam(':id', $user_id);
            $crops_stmt->execute();
            $user['crops'] = $crops_stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get farmer stats
            $stats_query = "SELECT 
                              COUNT(DISTINCT c.id) as total_crops,
                              COUNT(DISTINCT o.id) as total_orders,
                              COALESCE(SUM(o.total_price), 0) as total_earnings
                            FROM users u
                            LEFT JOIN crops c ON u.id = c.farmer_id
                            LEFT JOIN orders o ON u.id = o.farmer_id AND o.status = 'delivered'
                            WHERE u.id = :id
                            GROUP BY u.id";
            $stats_stmt = $db->prepare($stats_query);
            $stats_stmt->bindParam(':id', $user_id);
            $stats_stmt->execute();
            $user['stats'] = $stats_stmt->fetch(PDO::FETCH_ASSOC);
        }
        
        // Get user's orders
        $orders_query = "SELECT o.*, c.name as crop_name 
                         FROM orders o
                         JOIN crops c ON o.crop_id = c.id
                         WHERE o.buyer_id = :id OR o.farmer_id = :id
                         ORDER BY o.created_at DESC
                         LIMIT 10";
        $orders_stmt = $db->prepare($orders_query);
        $orders_stmt->bindParam(':id', $user_id);
        $orders_stmt->execute();
        $user['recent_orders'] = $orders_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        successResponse($user);
        
    } catch (PDOException $e) {
        error_log("Get user error: " . $e->getMessage());
        errorResponse('Failed to fetch user details', 500);
    }
}

// PUT /admin/users/:id - Update user
elseif ($method === 'PUT' && !empty($user_id)) {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    // Fields that can be updated by admin
    $allowed_fields = ['name', 'email', 'role', 'phone', 'address', 'status'];
    $updates = [];
    $params = [':id' => $user_id];
    
    foreach ($allowed_fields as $field) {
        if (isset($data[$field])) {
            $updates[] = "{$field} = :{$field}";
            $params[":{$field}"] = htmlspecialchars(strip_tags($data[$field]));
        }
    }
    
    if (empty($updates)) {
        errorResponse('No fields to update');
        exit();
    }
    
    try {
        // Prevent admin from deactivating themselves
        if ($user_id === $admin_id && isset($data['status']) && $data['status'] !== 'active') {
            errorResponse('You cannot deactivate your own account', 400);
            exit();
        }
        
        $query = "UPDATE users SET " . implode(', ', $updates) . ", updated_at = CURRENT_TIMESTAMP 
                  WHERE id = :id 
                  RETURNING id, name, email, role, phone, status, updated_at";
        
        $stmt = $db->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        
        if ($stmt->rowCount() === 0) {
            errorResponse('User not found', 404);
            exit();
        }
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Log admin action
        $log_query = "INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) 
                      VALUES (:admin_id, 'update_user', 'user', :target_id, :details)";
        $log_stmt = $db->prepare($log_query);
        $log_stmt->bindParam(':admin_id', $admin_id);
        $log_stmt->bindParam(':target_id', $user_id);
        $details = json_encode($data);
        $log_stmt->bindParam(':details', $details);
        $log_stmt->execute();
        
        successResponse($user, 'User updated successfully');
        
    } catch (PDOException $e) {
        error_log("Update user error: " . $e->getMessage());
        errorResponse('Failed to update user', 500);
    }
}

// DELETE /admin/users/:id - Delete user
elseif ($method === 'DELETE' && !empty($user_id)) {
    try {
        // Prevent admin from deleting themselves
        if ($user_id === $admin_id) {
            errorResponse('You cannot delete your own account', 400);
            exit();
        }
        
        $query = "DELETE FROM users WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $user_id);
        $stmt->execute();
        
        if ($stmt->rowCount() === 0) {
            errorResponse('User not found', 404);
            exit();
        }
        
        // Log admin action
        $log_query = "INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) 
                      VALUES (:admin_id, 'delete_user', 'user', :target_id, '{}')";
        $log_stmt = $db->prepare($log_query);
        $log_stmt->bindParam(':admin_id', $admin_id);
        $log_stmt->bindParam(':target_id', $user_id);
        $log_stmt->execute();
        
        successResponse(null, 'User deleted successfully');
        
    } catch (PDOException $e) {
        error_log("Delete user error: " . $e->getMessage());
        errorResponse('Failed to delete user', 500);
    }
}

else {
    errorResponse('Method not allowed', 405);
}
