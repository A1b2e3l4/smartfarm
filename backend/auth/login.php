<?php
/**
 * SmartFarm User Login API
 * POST /auth/login
 * 
 * Request Body:
 * {
 *   "email": "john@example.com",
 *   "password": "securepassword"
 * }
 */

require_once '../config/database.php';
require_once '../config/jwt.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Method not allowed', 405);
    exit();
}

// Get JSON input
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate required fields
if (empty($data['email']) || empty($data['password'])) {
    errorResponse('Email and password are required');
    exit();
}

$email = htmlspecialchars(strip_tags($data['email']));
$password = $data['password'];

// Database connection
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    errorResponse('Database connection failed', 500);
    exit();
}

try {
    // Find user by email
    $query = "SELECT id, name, email, password_hash, role, phone, address, profile_image, status, created_at 
              FROM users 
              WHERE email = :email";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();
    
    if ($stmt->rowCount() === 0) {
        errorResponse('Invalid email or password', 401);
        exit();
    }
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Check if user is active
    if ($user['status'] !== 'active') {
        errorResponse('Account is ' . $user['status'] . '. Please contact support.', 403);
        exit();
    }
    
    // Verify password
    if (!password_verify($password, $user['password_hash'])) {
        errorResponse('Invalid email or password', 401);
        exit();
    }
    
    // Generate JWT token
    $token_payload = [
        'user_id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'name' => $user['name']
    ];
    
    $token = JWT::generate($token_payload, 24); // 24 hours expiry
    
    // Remove password_hash from response
    unset($user['password_hash']);
    
    // Return success response
    successResponse([
        'user' => $user,
        'token' => $token
    ], 'Login successful');
    
} catch (PDOException $e) {
    error_log("Login error: " . $e->getMessage());
    errorResponse('Login failed. Please try again.', 500);
}
