<?php
/**
 * Authentication API Endpoints
 * SmartFarm API - Login, Register, Logout, Token Refresh
 */

require_once '../config/database.php';
require_once '../config/jwt.php';
require_once '../config/response.php';

class AuthAPI {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    /**
     * Handle incoming request
     */
    public function handle() {
        $method = $_SERVER['REQUEST_METHOD'];
        $action = $_GET['action'] ?? '';

        // Enable CORS
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');

        if ($method === 'OPTIONS') {
            http_response_code(200);
            exit;
        }

        switch ($action) {
            case 'login':
                $this->login();
                break;
            case 'register':
                $this->register();
                break;
            case 'logout':
                $this->logout();
                break;
            case 'refresh':
                $this->refresh();
                break;
            case 'forgot-password':
                $this->forgotPassword();
                break;
            case 'reset-password':
                $this->resetPassword();
                break;
            case 'change-password':
                $this->changePassword();
                break;
            default:
                Response::notFound('Action not found');
        }
    }

    /**
     * User Login
     */
    private function login() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['email']) || !isset($data['password'])) {
            Response::validationError(['email' => 'Email and password are required']);
        }

        $email = strtolower(trim($data['email']));
        $password = $data['password'];

        try {
            $stmt = $this->conn->prepare("
                SELECT id, name, email, phone, avatar, role, county, sub_county, 
                       location, is_active, is_verified, password_hash 
                FROM users 
                WHERE email = :email 
                LIMIT 1
            ");
            $stmt->bindParam(':email', $email);
            $stmt->execute();

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user || !password_verify($password, $user['password_hash'])) {
                Response::error('Invalid email or password', null, 401);
            }

            if (!$user['is_active']) {
                Response::error('Account has been suspended. Please contact support.', null, 403);
            }

            // Generate tokens
            $payload = [
                'sub' => $user['id'],
                'email' => $user['email'],
                'role' => $user['role']
            ];

            $token = JWT::generate($payload, 'access');
            $refreshToken = JWT::generate($payload, 'refresh');

            // Remove password hash from response
            unset($user['password_hash']);
            $user['token'] = $token;

            Response::success($user, 'Login successful');

        } catch (PDOException $e) {
            error_log("Login Error: " . $e->getMessage());
            Response::serverError('Login failed. Please try again.');
        }
    }

    /**
     * User Registration
     */
    private function register() {
        $data = json_decode(file_get_contents('php://input'), true);

        // Validate required fields
        $required = ['name', 'email', 'phone', 'password', 'county'];
        $errors = [];

        foreach ($required as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                $errors[$field] = ucfirst($field) . ' is required';
            }
        }

        if (!empty($errors)) {
            Response::validationError($errors);
        }

        // Validate email format
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            Response::validationError(['email' => 'Invalid email format']);
        }

        // Validate password length
        if (strlen($data['password']) < 6) {
            Response::validationError(['password' => 'Password must be at least 6 characters']);
        }

        // Validate role
        $validRoles = ['farmer', 'buyer'];
        $role = $data['role'] ?? 'buyer';
        if (!in_array($role, $validRoles)) {
            $role = 'buyer';
        }

        $email = strtolower(trim($data['email']));
        $name = trim($data['name']);
        $phone = trim($data['phone']);
        $county = trim($data['county']);
        $subCounty = isset($data['sub_county']) ? trim($data['sub_county']) : null;
        $location = isset($data['location']) ? trim($data['location']) : null;
        $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT);

        try {
            // Check if email already exists
            $checkStmt = $this->conn->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
            $checkStmt->bindParam(':email', $email);
            $checkStmt->execute();

            if ($checkStmt->fetch()) {
                Response::validationError(['email' => 'Email already registered']);
            }

            // Insert new user
            $stmt = $this->conn->prepare("
                INSERT INTO users (name, email, phone, password_hash, role, county, sub_county, location)
                VALUES (:name, :email, :phone, :password_hash, :role, :county, :sub_county, :location)
                RETURNING id, name, email, phone, avatar, role, county, sub_county, location, is_active, is_verified, created_at
            ");

            $stmt->bindParam(':name', $name);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':phone', $phone);
            $stmt->bindParam(':password_hash', $passwordHash);
            $stmt->bindParam(':role', $role);
            $stmt->bindParam(':county', $county);
            $stmt->bindParam(':sub_county', $subCounty);
            $stmt->bindParam(':location', $location);
            $stmt->execute();

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // Generate tokens
            $payload = [
                'sub' => $user['id'],
                'email' => $user['email'],
                'role' => $user['role']
            ];

            $token = JWT::generate($payload, 'access');
            $user['token'] = $token;

            Response::success($user, 'Registration successful', null, 201);

        } catch (PDOException $e) {
            error_log("Registration Error: " . $e->getMessage());
            Response::serverError('Registration failed. Please try again.');
        }
    }

    /**
     * User Logout
     */
    private function logout() {
        // In a more advanced implementation, you might want to blacklist the token
        // For now, we just return success as the client will remove the token
        Response::success(null, 'Logout successful');
    }

    /**
     * Refresh Token
     */
    private function refresh() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['refresh_token'])) {
            Response::validationError(['refresh_token' => 'Refresh token is required']);
        }

        $refreshToken = $data['refresh_token'];
        $newTokens = JWT::refresh($refreshToken);

        if (!$newTokens) {
            Response::unauthorized('Invalid or expired refresh token');
        }

        Response::success($newTokens, 'Token refreshed successfully');
    }

    /**
     * Forgot Password
     */
    private function forgotPassword() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['email']) || empty($data['email'])) {
            Response::validationError(['email' => 'Email is required']);
        }

        $email = strtolower(trim($data['email']));

        // TODO: Implement password reset email sending
        // For now, just return success to prevent email enumeration
        Response::success(null, 'If the email exists, a password reset link has been sent');
    }

    /**
     * Reset Password
     */
    private function resetPassword() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['token']) || !isset($data['password'])) {
            Response::validationError(['token' => 'Token and new password are required']);
        }

        // TODO: Validate reset token and update password
        Response::success(null, 'Password reset successfully');
    }

    /**
     * Change Password
     */
    private function changePassword() {
        // Verify authentication
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';

        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            Response::unauthorized('Authorization token required');
        }

        $token = $matches[1];
        $userId = JWT::getUserId($token);

        if (!$userId) {
            Response::unauthorized('Invalid token');
        }

        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['current_password']) || !isset($data['new_password'])) {
            Response::validationError([
                'current_password' => 'Current password is required',
                'new_password' => 'New password is required'
            ]);
        }

        if (strlen($data['new_password']) < 6) {
            Response::validationError(['new_password' => 'New password must be at least 6 characters']);
        }

        try {
            // Verify current password
            $stmt = $this->conn->prepare("SELECT password_hash FROM users WHERE id = :id LIMIT 1");
            $stmt->bindParam(':id', $userId);
            $stmt->execute();

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user || !password_verify($data['current_password'], $user['password_hash'])) {
                Response::validationError(['current_password' => 'Current password is incorrect']);
            }

            // Update password
            $newPasswordHash = password_hash($data['new_password'], PASSWORD_BCRYPT);
            $updateStmt = $this->conn->prepare("UPDATE users SET password_hash = :password_hash WHERE id = :id");
            $updateStmt->bindParam(':password_hash', $newPasswordHash);
            $updateStmt->bindParam(':id', $userId);
            $updateStmt->execute();

            Response::success(null, 'Password changed successfully');

        } catch (PDOException $e) {
            error_log("Change Password Error: " . $e->getMessage());
            Response::serverError('Password change failed. Please try again.');
        }
    }
}

// Handle request
$api = new AuthAPI();
$api->handle();
?>
