<?php
/**
 * SmartFarm User Profile API
 * 
 * GET /users/profile - Get user profile
 * PUT /users/profile - Update user profile
 * POST /users/profile/image - Upload profile image
 */

require_once '../config/database.php';
require_once '../config/jwt.php';

$method = $_SERVER['REQUEST_METHOD'];

// Authenticate user
$payload = requireAuth();
if (!$payload) {
    exit();
}

$user_id = $payload['user_id'];

// Database connection
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    errorResponse('Database connection failed', 500);
    exit();
}

// Handle GET request - Get profile
if ($method === 'GET') {
    try {
        $query = "SELECT id, name, email, role, phone, address, profile_image, status, created_at, updated_at 
                  FROM users 
                  WHERE id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $user_id);
        $stmt->execute();
        
        if ($stmt->rowCount() === 0) {
            errorResponse('User not found', 404);
            exit();
        }
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        successResponse($user);
        
    } catch (PDOException $e) {
        error_log("Get profile error: " . $e->getMessage());
        errorResponse('Failed to fetch profile', 500);
    }
}

// Handle PUT request - Update profile
elseif ($method === 'PUT') {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    // Fields that can be updated
    $allowed_fields = ['name', 'phone', 'address'];
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
        $query = "UPDATE users SET " . implode(', ', $updates) . ", updated_at = CURRENT_TIMESTAMP 
                  WHERE id = :id 
                  RETURNING id, name, email, role, phone, address, profile_image, status, updated_at";
        
        $stmt = $db->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        successResponse($user, 'Profile updated successfully');
        
    } catch (PDOException $e) {
        error_log("Update profile error: " . $e->getMessage());
        errorResponse('Failed to update profile', 500);
    }
}

// Handle POST request - Upload profile image
elseif ($method === 'POST') {
    // Check if file was uploaded
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        errorResponse('No image file uploaded or upload error');
        exit();
    }
    
    $file = $_FILES['image'];
    
    // Validate file type
    $allowed_types = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!in_array($file['type'], $allowed_types)) {
        errorResponse('Only JPEG and PNG images are allowed');
        exit();
    }
    
    // Validate file size (max 5MB)
    $max_size = 5 * 1024 * 1024;
    if ($file['size'] > $max_size) {
        errorResponse('Image size must be less than 5MB');
        exit();
    }
    
    // Create upload directory if not exists
    $upload_dir = '../uploads/profiles/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }
    
    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'profile_' . $user_id . '_' . time() . '.' . $extension;
    $filepath = $upload_dir . $filename;
    
    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        errorResponse('Failed to save image', 500);
        exit();
    }
    
    // Update database with image path
    try {
        $image_url = 'uploads/profiles/' . $filename;
        
        $query = "UPDATE users SET profile_image = :image, updated_at = CURRENT_TIMESTAMP 
                  WHERE id = :id 
                  RETURNING id, name, email, profile_image";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':image', $image_url);
        $stmt->bindParam(':id', $user_id);
        $stmt->execute();
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        successResponse($user, 'Profile image uploaded successfully');
        
    } catch (PDOException $e) {
        error_log("Upload image error: " . $e->getMessage());
        // Delete uploaded file if database update fails
        if (file_exists($filepath)) {
            unlink($filepath);
        }
        errorResponse('Failed to update profile image', 500);
    }
}

else {
    errorResponse('Method not allowed', 405);
}
