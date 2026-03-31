<?php
/**
 * SmartFarm Orders API
 * 
 * GET /orders - List orders (for current user)
 * POST /orders - Create new order (buyer only)
 * GET /orders/:id - Get single order
 * PUT /orders/:id - Update order status (farmer or admin)
 * DELETE /orders/:id - Cancel order (buyer only)
 */

require_once '../config/database.php';
require_once '../config/jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_parts = explode('/', trim($path, '/'));
$order_id = isset($path_parts[1]) ? $path_parts[1] : null;

// Authenticate all requests
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

// GET /orders - List orders
if ($method === 'GET' && empty($order_id)) {
    $status = isset($_GET['status']) ? $_GET['status'] : '';
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 20;
    $offset = ($page - 1) * $limit;
    
    try {
        $where_clauses = [];
        $params = [];
        
        // Filter by user role
        if ($user_role === 'farmer') {
            $where_clauses[] = "o.farmer_id = :user_id";
        } elseif ($user_role === 'buyer') {
            $where_clauses[] = "o.buyer_id = :user_id";
        }
        // Admin can see all orders
        
        $params[':user_id'] = $user_id;
        
        if ($status) {
            $where_clauses[] = "o.status = :status";
            $params[':status'] = $status;
        }
        
        $where_sql = !empty($where_clauses) ? 'WHERE ' . implode(' AND ', $where_clauses) : '';
        
        // Get total count
        $count_query = "SELECT COUNT(*) as total FROM orders o {$where_sql}";
        $count_stmt = $db->prepare($count_query);
        foreach ($params as $key => $value) {
            $count_stmt->bindValue($key, $value);
        }
        $count_stmt->execute();
        $total = $count_stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Get orders with details
        $query = "SELECT o.*, 
                  c.name as crop_name, c.image as crop_image, c.unit,
                  buyer.name as buyer_name, buyer.phone as buyer_phone, buyer.email as buyer_email,
                  farmer.name as farmer_name, farmer.phone as farmer_phone, farmer.email as farmer_email
                  FROM orders o
                  JOIN crops c ON o.crop_id = c.id
                  JOIN users buyer ON o.buyer_id = buyer.id
                  JOIN users farmer ON o.farmer_id = farmer.id
                  {$where_sql}
                  ORDER BY o.created_at DESC
                  LIMIT :limit OFFSET :offset";
        
        $stmt = $db->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        successResponse([
            'orders' => $orders,
            'pagination' => [
                'total' => intval($total),
                'page' => $page,
                'limit' => $limit,
                'total_pages' => ceil($total / $limit)
            ]
        ]);
        
    } catch (PDOException $e) {
        error_log("List orders error: " . $e->getMessage());
        errorResponse('Failed to fetch orders', 500);
    }
}

// POST /orders - Create new order
elseif ($method === 'POST' && empty($order_id)) {
    // Require buyer role
    if ($user_role !== 'buyer' && $user_role !== 'admin') {
        errorResponse('Only buyers can place orders', 403);
        exit();
    }
    
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    // Validate required fields
    $required = ['crop_id', 'quantity'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            errorResponse("{$field} is required");
            exit();
        }
    }
    
    $crop_id = $data['crop_id'];
    $quantity = floatval($data['quantity']);
    $delivery_address = isset($data['delivery_address']) ? htmlspecialchars(strip_tags($data['delivery_address'])) : null;
    $notes = isset($data['notes']) ? htmlspecialchars(strip_tags($data['notes'])) : null;
    
    try {
        // Get crop details
        $crop_query = "SELECT * FROM crops WHERE id = :id AND status = 'available'";
        $crop_stmt = $db->prepare($crop_query);
        $crop_stmt->bindParam(':id', $crop_id);
        $crop_stmt->execute();
        
        if ($crop_stmt->rowCount() === 0) {
            errorResponse('Crop not found or not available', 404);
            exit();
        }
        
        $crop = $crop_stmt->fetch(PDO::FETCH_ASSOC);
        
        // Check if buyer is not the farmer
        if ($crop['farmer_id'] === $user_id) {
            errorResponse('You cannot order your own crop', 400);
            exit();
        }
        
        // Check quantity availability
        if ($quantity > $crop['quantity']) {
            errorResponse('Requested quantity exceeds available stock', 400);
            exit();
        }
        
        // Calculate total price
        $total_price = $quantity * $crop['price'];
        $farmer_id = $crop['farmer_id'];
        
        // Start transaction
        $db->beginTransaction();
        
        // Create order
        $order_query = "INSERT INTO orders (buyer_id, farmer_id, crop_id, quantity, total_price, delivery_address, notes) 
                        VALUES (:buyer_id, :farmer_id, :crop_id, :quantity, :total_price, :delivery_address, :notes)
                        RETURNING *";
        
        $order_stmt = $db->prepare($order_query);
        $order_stmt->bindParam(':buyer_id', $user_id);
        $order_stmt->bindParam(':farmer_id', $farmer_id);
        $order_stmt->bindParam(':crop_id', $crop_id);
        $order_stmt->bindParam(':quantity', $quantity);
        $order_stmt->bindParam(':total_price', $total_price);
        $order_stmt->bindParam(':delivery_address', $delivery_address);
        $order_stmt->bindParam(':notes', $notes);
        $order_stmt->execute();
        
        $order = $order_stmt->fetch(PDO::FETCH_ASSOC);
        
        // Update crop quantity
        $new_quantity = $crop['quantity'] - $quantity;
        $new_status = $new_quantity <= 0 ? 'sold' : 'available';
        
        $update_crop_query = "UPDATE crops SET quantity = :quantity, status = :status WHERE id = :id";
        $update_crop_stmt = $db->prepare($update_crop_query);
        $update_crop_stmt->bindParam(':quantity', $new_quantity);
        $update_crop_stmt->bindParam(':status', $new_status);
        $update_crop_stmt->bindParam(':id', $crop_id);
        $update_crop_stmt->execute();
        
        // Commit transaction
        $db->commit();
        
        // Add order details
        $order['crop_name'] = $crop['name'];
        $order['crop_image'] = $crop['image'];
        $order['unit'] = $crop['unit'];
        
        successResponse($order, 'Order placed successfully', 201);
        
    } catch (PDOException $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        error_log("Create order error: " . $e->getMessage());
        errorResponse('Failed to place order', 500);
    }
}

// GET /orders/:id - Get single order
elseif ($method === 'GET' && !empty($order_id)) {
    try {
        $query = "SELECT o.*, 
                  c.name as crop_name, c.image as crop_image, c.unit,
                  buyer.name as buyer_name, buyer.phone as buyer_phone, buyer.email as buyer_email,
                  farmer.name as farmer_name, farmer.phone as farmer_phone, farmer.email as farmer_email
                  FROM orders o
                  JOIN crops c ON o.crop_id = c.id
                  JOIN users buyer ON o.buyer_id = buyer.id
                  JOIN users farmer ON o.farmer_id = farmer.id
                  WHERE o.id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $order_id);
        $stmt->execute();
        
        if ($stmt->rowCount() === 0) {
            errorResponse('Order not found', 404);
            exit();
        }
        
        $order = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Check if user has permission to view this order
        if ($user_role !== 'admin' && 
            $order['buyer_id'] !== $user_id && 
            $order['farmer_id'] !== $user_id) {
            errorResponse('You do not have permission to view this order', 403);
            exit();
        }
        
        successResponse($order);
        
    } catch (PDOException $e) {
        error_log("Get order error: " . $e->getMessage());
        errorResponse('Failed to fetch order', 500);
    }
}

// PUT /orders/:id - Update order status
elseif ($method === 'PUT' && !empty($order_id)) {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (empty($data['status'])) {
        errorResponse('Status is required');
        exit();
    }
    
    $new_status = $data['status'];
    $valid_statuses = ['pending', 'accepted', 'delivered', 'canceled'];
    
    if (!in_array($new_status, $valid_statuses)) {
        errorResponse('Invalid status');
        exit();
    }
    
    try {
        // Get order details
        $order_query = "SELECT * FROM orders WHERE id = :id";
        $order_stmt = $db->prepare($order_query);
        $order_stmt->bindParam(':id', $order_id);
        $order_stmt->execute();
        
        if ($order_stmt->rowCount() === 0) {
            errorResponse('Order not found', 404);
            exit();
        }
        
        $order = $order_stmt->fetch(PDO::FETCH_ASSOC);
        
        // Check permissions based on status change
        if ($new_status === 'canceled') {
            // Only buyer or admin can cancel
            if ($user_role !== 'admin' && $order['buyer_id'] !== $user_id) {
                errorResponse('Only the buyer can cancel this order', 403);
                exit();
            }
        } else {
            // Only farmer or admin can update status (accept/deliver)
            if ($user_role !== 'admin' && $order['farmer_id'] !== $user_id) {
                errorResponse('Only the farmer can update this order status', 403);
                exit();
            }
        }
        
        // Validate status transitions
        $current_status = $order['status'];
        $valid_transitions = [
            'pending' => ['accepted', 'canceled'],
            'accepted' => ['delivered', 'canceled'],
            'delivered' => [],
            'canceled' => []
        ];
        
        if ($new_status !== $current_status && 
            !in_array($new_status, $valid_transitions[$current_status])) {
            errorResponse("Cannot change status from {$current_status} to {$new_status}", 400);
            exit();
        }
        
        // Start transaction for cancellation
        if ($new_status === 'canceled' && $current_status !== 'canceled') {
            $db->beginTransaction();
            
            // Restore crop quantity
            $crop_query = "SELECT quantity FROM crops WHERE id = :crop_id";
            $crop_stmt = $db->prepare($crop_query);
            $crop_stmt->bindParam(':crop_id', $order['crop_id']);
            $crop_stmt->execute();
            $crop = $crop_stmt->fetch(PDO::FETCH_ASSOC);
            
            $new_quantity = $crop['quantity'] + $order['quantity'];
            
            $update_crop_query = "UPDATE crops SET quantity = :quantity, status = 'available' WHERE id = :id";
            $update_crop_stmt = $db->prepare($update_crop_query);
            $update_crop_stmt->bindParam(':quantity', $new_quantity);
            $update_crop_stmt->bindParam(':id', $order['crop_id']);
            $update_crop_stmt->execute();
        }
        
        // Update order status
        $update_query = "UPDATE orders SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE id = :id RETURNING *";
        $update_stmt = $db->prepare($update_query);
        $update_stmt->bindParam(':status', $new_status);
        $update_stmt->bindParam(':id', $order_id);
        $update_stmt->execute();
        
        $updated_order = $update_stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($new_status === 'canceled' && $current_status !== 'canceled') {
            $db->commit();
        }
        
        successResponse($updated_order, 'Order status updated successfully');
        
    } catch (PDOException $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        error_log("Update order error: " . $e->getMessage());
        errorResponse('Failed to update order', 500);
    }
}

// DELETE /orders/:id - Cancel order (alias for PUT with status=canceled)
elseif ($method === 'DELETE' && !empty($order_id)) {
    // Redirect to PUT with canceled status
    $_SERVER['REQUEST_METHOD'] = 'PUT';
    $data = ['status' => 'canceled'];
    $json = json_encode($data);
    // This would need proper handling in a real implementation
    errorResponse('Use PUT /orders/:id with status=canceled to cancel order', 405);
}

else {
    errorResponse('Method not allowed', 405);
}
