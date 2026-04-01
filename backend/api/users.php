<?php
/**
 * Users API Endpoints
 * SmartFarm API - User Management
 */

require_once '../config/database.php';
require_once '../config/jwt.php';
require_once '../config/response.php';

class UsersAPI {
    private $db;
    private $conn;
    private $currentUserId;
    private $currentUserRole;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
        $this->authenticate();
    }

    /**
     * Authenticate request
     */
    private function authenticate() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';

        if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            Response::unauthorized('Authorization token required');
        }

        $token = $matches[1];
        $payload = JWT::validate($token);

        if (!$payload) {
            Response::unauthorized('Invalid or expired token');
        }

        $this->currentUserId = $payload['sub'];
        $this->currentUserRole = $payload['role'];
    }

    /**
     * Check if current user is admin
     */
    private function requireAdmin() {
        if ($this->currentUserRole !== 'admin') {
            Response::forbidden('Admin access required');
        }
    }

    /**
     * Handle incoming request
     */
    public function handle() {
        $method = $_SERVER['REQUEST_METHOD'];
        $id = $_GET['id'] ?? null;

        // Enable CORS
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');

        if ($method === 'OPTIONS') {
            http_response_code(200);
            exit;
        }

        switch ($method) {
            case 'GET':
                if ($id) {
                    $this->getUser($id);
                } else {
                    $this->getUsers();
                }
                break;
            case 'PUT':
                if ($id) {
                    $this->updateUser($id);
                } else {
                    Response::error('User ID required');
                }
                break;
            case 'DELETE':
                if ($id) {
                    $this->deleteUser($id);
                } else {
                    Response::error('User ID required');
                }
                break;
            default:
                Response::error('Method not allowed', null, 405);
        }
    }

    /**
     * Get all users (admin only)
     */
    private function getUsers() {
        $this->requireAdmin();

        $page = $_GET['page'] ?? 1;
        $perPage = $_GET['per_page'] ?? 20;
        $role = $_GET['role'] ?? null;
        $search = $_GET['search'] ?? null;

        $offset = ($page - 1) * $perPage;

        try {
            $whereConditions = [];
            $params = [];

            if ($role) {
                $whereConditions[] = "role = :role";
                $params[':role'] = $role;
            }

            if ($search) {
                $whereConditions[] = "(name ILIKE :search OR email ILIKE :search OR phone ILIKE :search)";
                $params[':search'] = "%$search%";
            }

            $whereClause = !empty($whereConditions) ? "WHERE " . implode(" AND ", $whereConditions) : "";

            // Get total count
            $countStmt = $this->conn->prepare("SELECT COUNT(*) as total FROM users $whereClause");
            foreach ($params as $key => $value) {
                $countStmt->bindValue($key, $value);
            }
            $countStmt->execute();
            $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

            // Get users
            $query = "SELECT id, name, email, phone, avatar, role, county, sub_county, location, 
                             is_active, is_verified, created_at 
                      FROM users 
                      $whereClause 
                      ORDER BY created_at DESC 
                      LIMIT :limit OFFSET :offset";

            $stmt = $this->conn->prepare($query);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

            Response::paginated($users, $page, $perPage, $total);

        } catch (PDOException $e) {
            error_log("Get Users Error: " . $e->getMessage());
            Response::serverError('Failed to fetch users');
        }
    }

    /**
     * Get single user
     */
    private function getUser($id) {
        // Users can view their own profile, admins can view any
        if ($this->currentUserRole !== 'admin' && $this->currentUserId != $id) {
            Response::forbidden('Access denied');
        }

        try {
            $stmt = $this->conn->prepare("
                SELECT id, name, email, phone, avatar, role, county, sub_county, location, 
                       is_active, is_verified, created_at 
                FROM users 
                WHERE id = :id 
                LIMIT 1
            ");
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                Response::notFound('User not found');
            }

            Response::success($user);

        } catch (PDOException $e) {
            error_log("Get User Error: " . $e->getMessage());
            Response::serverError('Failed to fetch user');
        }
    }

    /**
     * Update user
     */
    private function updateUser($id) {
        // Users can update their own profile, admins can update any
        if ($this->currentUserRole !== 'admin' && $this->currentUserId != $id) {
            Response::forbidden('Access denied');
        }

        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data)) {
            Response::error('No data provided');
        }

        // Non-admins cannot change role or active status
        if ($this->currentUserRole !== 'admin') {
            unset($data['role']);
            unset($data['is_active']);
        }

        // Build update query dynamically
        $allowedFields = ['name', 'phone', 'avatar', 'county', 'sub_county', 'location', 'role', 'is_active'];
        $updates = [];
        $params = [':id' => $id];

        foreach ($data as $field => $value) {
            if (in_array($field, $allowedFields)) {
                $updates[] = "$field = :$field";
                $params[":$field"] = $value;
            }
        }

        if (empty($updates)) {
            Response::error('No valid fields to update');
        }

        try {
            $query = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = :id RETURNING *";
            $stmt = $this->conn->prepare($query);

            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }

            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // Log admin action
            if ($this->currentUserRole === 'admin' && $this->currentUserId != $id) {
                $this->logAction('update', 'user', $id, $user['name'], $data);
            }

            unset($user['password_hash']);
            Response::success($user, 'User updated successfully');

        } catch (PDOException $e) {
            error_log("Update User Error: " . $e->getMessage());
            Response::serverError('Failed to update user');
        }
    }

    /**
     * Delete user (admin only)
     */
    private function deleteUser($id) {
        $this->requireAdmin();

        // Prevent deleting yourself
        if ($this->currentUserId == $id) {
            Response::error('Cannot delete your own account');
        }

        try {
            // Get user info before deleting
            $getStmt = $this->conn->prepare("SELECT name FROM users WHERE id = :id LIMIT 1");
            $getStmt->bindParam(':id', $id);
            $getStmt->execute();
            $user = $getStmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                Response::notFound('User not found');
            }

            // Delete user
            $stmt = $this->conn->prepare("DELETE FROM users WHERE id = :id");
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            // Log admin action
            $this->logAction('delete', 'user', $id, $user['name']);

            Response::success(null, 'User deleted successfully');

        } catch (PDOException $e) {
            error_log("Delete User Error: " . $e->getMessage());
            Response::serverError('Failed to delete user');
        }
    }

    /**
     * Log admin action
     */
    private function logAction($action, $entityType, $entityId, $entityName, $newValues = null) {
        try {
            $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

            $stmt = $this->conn->prepare("
                INSERT INTO admin_logs (admin_id, action, entity_type, entity_id, entity_name, new_values, ip_address, user_agent)
                VALUES (:admin_id, :action, :entity_type, :entity_id, :entity_name, :new_values, :ip_address, :user_agent)
            ");

            $stmt->bindParam(':admin_id', $this->currentUserId);
            $stmt->bindParam(':action', $action);
            $stmt->bindParam(':entity_type', $entityType);
            $stmt->bindParam(':entity_id', $entityId);
            $stmt->bindParam(':entity_name', $entityName);
            $stmt->bindValue(':new_values', $newValues ? json_encode($newValues) : null);
            $stmt->bindParam(':ip_address', $ipAddress);
            $stmt->bindParam(':user_agent', $userAgent);
            $stmt->execute();

        } catch (PDOException $e) {
            error_log("Log Action Error: " . $e->getMessage());
        }
    }
}

// Handle request
$api = new UsersAPI();
$api->handle();
?>
