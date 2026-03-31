<?php
/**
 * SmartFarm Crops API
 * 
 * GET /crops - List all crops (with filters)
 * POST /crops - Create new crop (farmer only)
 * GET /crops/:id - Get single crop
 * PUT /crops/:id - Update crop (farmer only)
 * DELETE /crops/:id - Delete crop (farmer only)
 */

require_once '../config/database.php';
require_once '../config/jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_parts = explode('/', trim($path, '/'));
$crop_id = isset($path_parts[1]) ? $path_parts[1] : null;

// Database connection
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    errorResponse('Database connection failed', 500);
    exit();
}

// GET /crops - List crops
if ($method === 'GET' && empty($crop_id)) {
    // Get query parameters
    $search = isset($_GET['search']) ? $_GET['search'] : '';
    $category = isset($_GET['category']) ? $_GET['category'] : '';
    $farmer_id = isset($_GET['farmer_id']) ? $_GET['farmer_id'] : '';
    $status = isset($_GET['status']) ? $_GET['status'] : 'available';
    $min_price = isset($_GET['min_price']) ? floatval($_GET['min_price']) : null;
    $max_price = isset($_GET['max_price']) ? floatval($_GET['max_price']) : null;
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 20;
    $offset = ($page - 1) * $limit;
    
    try {
        // Build query
        $where_clauses = [];
        $params = [];
        
        if ($search) {
            $where_clauses[] = "(c.name ILIKE :search OR c.description ILIKE :search)";
            $params[':search'] = "%{$search}%";
        }
        
        if ($category) {
            $where_clauses[] = "c.category = :category";
            $params[':category'] = $category;
        }
        
        if ($farmer_id) {
            $where_clauses[] = "c.farmer_id = :farmer_id";
            $params[':farmer_id'] = $farmer_id;
        }
        
        if ($status) {
            $where_clauses[] = "c.status = :status";
            $params[':status'] = $status;
        }
        
        if ($min_price !== null) {
            $where_clauses[] = "c.price >= :min_price";
            $params[':min_price'] = $min_price;
        }
        
        if ($max_price !== null) {
            $where_clauses[] = "c.price <= :max_price";
            $params[':max_price'] = $max_price;
        }
        
        $where_sql = !empty($where_clauses) ? 'WHERE ' . implode(' AND ', $where_clauses) : '';
        
        // Get total count
        $count_query = "SELECT COUNT(*) as total FROM crops c {$where_sql}";
        $count_stmt = $db->prepare($count_query);
        foreach ($params as $key => $value) {
            $count_stmt->bindValue($key, $value);
        }
        $count_stmt->execute();
        $total = $count_stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Get crops with farmer info
        $query = "SELECT c.*, u.name as farmer_name, u.phone as farmer_phone 
                  FROM crops c 
                  JOIN users u ON c.farmer_id = u.id 
                  {$where_sql}
                  ORDER BY c.created_at DESC 
                  LIMIT :limit OFFSET :offset";
        
        $stmt = $db->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $crops = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        successResponse([
            'crops' => $crops,
            'pagination' => [
                'total' => intval($total),
                'page' => $page,
                'limit' => $limit,
                'total_pages' => ceil($total / $limit)
            ]
        ]);
        
    } catch (PDOException $e) {
        error_log("List crops error: " . $e->getMessage());
        errorResponse('Failed to fetch crops', 500);
    }
}

// POST /crops - Create new crop
elseif ($method === 'POST' && empty($crop_id)) {
    // Require farmer role
    $payload = requireRole('farmer');
    if (!$payload) {
        exit();
    }
    
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    // Validate required fields
    $required = ['name', 'price', 'quantity'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            errorResponse("{$field} is required");
            exit();
        }
    }
    
    $farmer_id = $payload['user_id'];
    $name = htmlspecialchars(strip_tags($data['name']));
    $category = isset($data['category']) ? htmlspecialchars(strip_tags($data['category'])) : 'Other';
    $price = floatval($data['price']);
    $quantity = floatval($data['quantity']);
    $unit = isset($data['unit']) ? htmlspecialchars(strip_tags($data['unit'])) : 'kg';
    $description = isset($data['description']) ? htmlspecialchars(strip_tags($data['description'])) : null;
    $image = isset($data['image']) ? $data['image'] : null;
    
    try {
        $query = "INSERT INTO crops (farmer_id, name, category, price, quantity, unit, description, image) 
                  VALUES (:farmer_id, :name, :category, :price, :quantity, :unit, :description, :image)
                  RETURNING *";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':farmer_id', $farmer_id);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':category', $category);
        $stmt->bindParam(':price', $price);
        $stmt->bindParam(':quantity', $quantity);
        $stmt->bindParam(':unit', $unit);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':image', $image);
        $stmt->execute();
        
        $crop = $stmt->fetch(PDO::FETCH_ASSOC);
        successResponse($crop, 'Crop created successfully', 201);
        
    } catch (PDOException $e) {
        error_log("Create crop error: " . $e->getMessage());
        errorResponse('Failed to create crop', 500);
    }
}

// GET /crops/:id - Get single crop
elseif ($method === 'GET' && !empty($crop_id)) {
    try {
        $query = "SELECT c.*, u.name as farmer_name, u.phone as farmer_phone, u.email as farmer_email 
                  FROM crops c 
                  JOIN users u ON c.farmer_id = u.id 
                  WHERE c.id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $crop_id);
        $stmt->execute();
        
        if ($stmt->rowCount() === 0) {
            errorResponse('Crop not found', 404);
            exit();
        }
        
        $crop = $stmt->fetch(PDO::FETCH_ASSOC);
        successResponse($crop);
        
    } catch (PDOException $e) {
        error_log("Get crop error: " . $e->getMessage());
        errorResponse('Failed to fetch crop', 500);
    }
}

// PUT /crops/:id - Update crop
elseif ($method === 'PUT' && !empty($crop_id)) {
    // Require authentication
    $payload = requireAuth();
    if (!$payload) {
        exit();
    }
    
    // Check if user owns this crop or is admin
    try {
        $check_query = "SELECT farmer_id FROM crops WHERE id = :id";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bindParam(':id', $crop_id);
        $check_stmt->execute();
        
        if ($check_stmt->rowCount() === 0) {
            errorResponse('Crop not found', 404);
            exit();
        }
        
        $crop = $check_stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($crop['farmer_id'] !== $payload['user_id'] && $payload['role'] !== 'admin') {
            errorResponse('You can only update your own crops', 403);
            exit();
        }
        
    } catch (PDOException $e) {
        errorResponse('Failed to verify crop ownership', 500);
        exit();
    }
    
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    // Fields that can be updated
    $allowed_fields = ['name', 'category', 'price', 'quantity', 'unit', 'description', 'image', 'status'];
    $updates = [];
    $params = [':id' => $crop_id];
    
    foreach ($allowed_fields as $field) {
        if (isset($data[$field])) {
            $updates[] = "{$field} = :{$field}";
            if (in_array($field, ['price', 'quantity'])) {
                $params[":{$field}"] = floatval($data[$field]);
            } else {
                $params[":{$field}"] = htmlspecialchars(strip_tags($data[$field]));
            }
        }
    }
    
    if (empty($updates)) {
        errorResponse('No fields to update');
        exit();
    }
    
    try {
        $query = "UPDATE crops SET " . implode(', ', $updates) . ", updated_at = CURRENT_TIMESTAMP 
                  WHERE id = :id 
                  RETURNING *";
        
        $stmt = $db->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        
        $crop = $stmt->fetch(PDO::FETCH_ASSOC);
        successResponse($crop, 'Crop updated successfully');
        
    } catch (PDOException $e) {
        error_log("Update crop error: " . $e->getMessage());
        errorResponse('Failed to update crop', 500);
    }
}

// DELETE /crops/:id - Delete crop
elseif ($method === 'DELETE' && !empty($crop_id)) {
    // Require authentication
    $payload = requireAuth();
    if (!$payload) {
        exit();
    }
    
    // Check if user owns this crop or is admin
    try {
        $check_query = "SELECT farmer_id FROM crops WHERE id = :id";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bindParam(':id', $crop_id);
        $check_stmt->execute();
        
        if ($check_stmt->rowCount() === 0) {
            errorResponse('Crop not found', 404);
            exit();
        }
        
        $crop = $check_stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($crop['farmer_id'] !== $payload['user_id'] && $payload['role'] !== 'admin') {
            errorResponse('You can only delete your own crops', 403);
            exit();
        }
        
    } catch (PDOException $e) {
        errorResponse('Failed to verify crop ownership', 500);
        exit();
    }
    
    try {
        $query = "DELETE FROM crops WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $crop_id);
        $stmt->execute();
        
        successResponse(null, 'Crop deleted successfully');
        
    } catch (PDOException $e) {
        error_log("Delete crop error: " . $e->getMessage());
        errorResponse('Failed to delete crop', 500);
    }
}

else {
    errorResponse('Method not allowed', 405);
}
