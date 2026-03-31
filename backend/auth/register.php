<?php
/**
 * SmartFarm User Registration API
 * POST /auth/register
 * 
 * Request Body:
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "password": "securepassword",
 *   "role": "farmer" | "buyer",
 *   "phone": "+1234567890" (optional),
 *   "address": "123 Farm Road" (optional)
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
$required = ['name', 'email', 'password', 'role'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        errorResponse("{$field} is required");
        exit();
    }
}

// Validate role
if (!in_array($data['role'], ['farmer', 'buyer'])) {
    errorResponse('Role must be either farmer or buyer');
    exit();
}

// Validate email format
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    errorResponse('Invalid email format');
    exit();
}

// Validate password length
if (strlen($data['password']) < 6) {
    errorResponse('Password must be at least 6 characters');
    exit();
}

// Sanitize inputs
$name = htmlspecialchars(strip_tags($data['name']));
$email = htmlspecialchars(strip_tags($data['email']));
$password = $data['password'];
$role = $data['role'];
$phone = isset($data['phone']) ? htmlspecialchars(strip_tags($data['phone'])) : null;
$address = isset($data['address']) ? htmlspecialchars(strip_tags($data['address'])) : null;

// Hash password
$password_hash = password_hash($password, PASSWORD_BCRYPT);

// Database connection
$database = new Database();
$db = $database->getConnection();

if (!$db) {
    errorResponse('Database connection failed', 500);
    exit();
}

try {
    // Check if email already exists
    $check_query = "SELECT id FROM users WHERE email = :email";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(':email', $email);
    $check_stmt->execute();
    
    if ($check_stmt->rowCount() > 0) {
        errorResponse('Email already registered', 409);
        exit();
    }
    
    // Insert new user
    $query = "INSERT INTO users (name, email, password_hash, role, phone, address) 
              VALUES (:name, :email, :password_hash, :role, :phone, :address)
              RETURNING id, name, email, role, created_at";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':password_hash', $password_hash);
    $stmt->bindParam(':role', $role);
    $stmt->bindParam(':phone', $phone);
    $stmt->bindParam(':address', $address);
    
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Generate JWT token
    $token_payload = [
        'user_id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'name' => $user['name']
    ];
    
    $token = JWT::generate($token_payload, 24); // 24 hours expiry
    
    // Return success response
    successResponse([
        'user' => [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'created_at' => $user['created_at']
        ],
        'token' => $token
    ], 'Registration successful', 201);
    
} catch (PDOException $e) {
    error_log("Registration error: " . $e->getMessage());
    errorResponse('Registration failed. Please try again.', 500);
}
