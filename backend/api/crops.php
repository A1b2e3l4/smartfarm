<?php
/**
 * Crops API Endpoints
 * SmartFarm API - Crop Management
 */

require_once '../config/database.php';
require_once '../config/jwt.php';
require_once '../config/response.php';

class CropsAPI {
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
     * Check if current user is farmer
     */
    private function requireFarmer() {
        if ($this->currentUserRole !== 'farmer' && $this->currentUserRole !== 'admin') {
            Response::forbidden('Farmer access required');
        }
    }

    /**
     * Handle incoming request
     */
    public function handle() {
        $method = $_SERVER['REQUEST_METHOD'];
        $id = $_GET['id'] ?? null;
        $action = $_GET['action'] ?? null;

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
                    $this->getCrop($id);
                } elseif ($action === 'my-crops') {
                    $this->getMyCrops();
                } elseif ($action === 'pending') {
                    $this->getPendingCrops();
                } else {
                    $this->getCrops();
                }
                break;
            case 'POST':
                if ($id && $action === 'approve') {
                    $this->approveCrop($id);
                } else {
                    $this->createCrop();
                }
                break;
            case 'PUT':
                if ($id) {
                    $this->updateCrop($id);
                } else {
                    Response::error('Crop ID required');
                }
                break;
            case 'DELETE':
                if ($id) {
                    $this->deleteCrop($id);
                } else {
                    Response::error('Crop ID required');
                }
                break;
            default:
                Response::error('Method not allowed', null, 405);
        }
    }

    /**
     * Get all approved crops
     */
    private function getCrops() {
        $page = $_GET['page'] ?? 1;
        $perPage = $_GET['per_page'] ?? 20;
        $category = $_GET['category'] ?? null;
        $county = $_GET['county'] ?? null;
        $minPrice = $_GET['min_price'] ?? null;
        $maxPrice = $_GET['max_price'] ?? null;
        $isOrganic = $_GET['is_organic'] ?? null;
        $search = $_GET['search'] ?? null;

        $offset = ($page - 1) * $perPage;

        try {
            $whereConditions = ["c.status = 'approved'"];
            $params = [];

            if ($category) {
                $whereConditions[] = "c.category = :category";
                $params[':category'] = $category;
            }

            if ($county) {
                $whereConditions[] = "u.county = :county";
                $params[':county'] = $county;
            }

            if ($minPrice) {
                $whereConditions[] = "c.price >= :min_price";
                $params[':min_price'] = $minPrice;
            }

            if ($maxPrice) {
                $whereConditions[] = "c.price <= :max_price";
                $params[':max_price'] = $maxPrice;
            }

            if ($isOrganic !== null) {
                $whereConditions[] = "c.is_organic = :is_organic";
                $params[':is_organic'] = $isOrganic === 'true' || $isOrganic === '1';
            }

            if ($search) {
                $whereConditions[] = "(c.name ILIKE :search OR c.description ILIKE :search OR u.name ILIKE :search)";
                $params[':search'] = "%$search%";
            }

            $whereClause = "WHERE " . implode(" AND ", $whereConditions);

            // Get total count
            $countQuery = "SELECT COUNT(*) as total FROM crops c 
                          JOIN users u ON c.farmer_id = u.id 
                          $whereClause";
            $countStmt = $this->conn->prepare($countQuery);
            foreach ($params as $key => $value) {
                $countStmt->bindValue($key, $value);
            }
            $countStmt->execute();
            $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

            // Get crops with farmer info
            $query = "SELECT c.*, u.name as farmer_name, u.avatar as farmer_avatar, 
                             u.county as farmer_county, u.phone as farmer_phone
                      FROM crops c
                      JOIN users u ON c.farmer_id = u.id
                      $whereClause
                      ORDER BY c.created_at DESC
                      LIMIT :limit OFFSET :offset";

            $stmt = $this->conn->prepare($query);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            $crops = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Decode JSON images
            foreach ($crops as &$crop) {
                $crop['images'] = json_decode($crop['images'] ?? '[]', true);
            }

            Response::paginated($crops, $page, $perPage, $total);

        } catch (PDOException $e) {
            error_log("Get Crops Error: " . $e->getMessage());
            Response::serverError('Failed to fetch crops');
        }
    }

    /**
     * Get single crop
     */
    private function getCrop($id) {
        try {
            $stmt = $this->conn->prepare("
                SELECT c.*, u.name as farmer_name, u.avatar as farmer_avatar, 
                       u.county as farmer_county, u.phone as farmer_phone
                FROM crops c
                JOIN users u ON c.farmer_id = u.id
                WHERE c.id = :id
                LIMIT 1
            ");
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            $crop = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$crop) {
                Response::notFound('Crop not found');
            }

            // Only show pending crops to the farmer who created it or admins
            if ($crop['status'] === 'pending' && 
                $this->currentUserRole !== 'admin' && 
                $crop['farmer_id'] != $this->currentUserId) {
                Response::notFound('Crop not found');
            }

            $crop['images'] = json_decode($crop['images'] ?? '[]', true);
            Response::success($crop);

        } catch (PDOException $e) {
            error_log("Get Crop Error: " . $e->getMessage());
            Response::serverError('Failed to fetch crop');
        }
    }

    /**
     * Get current user's crops (for farmers)
     */
    private function getMyCrops() {
        $this->requireFarmer();

        $page = $_GET['page'] ?? 1;
        $perPage = $_GET['per_page'] ?? 20;
        $offset = ($page - 1) * $perPage;

        try {
            // Get total count
            $countStmt = $this->conn->prepare("SELECT COUNT(*) as total FROM crops WHERE farmer_id = :farmer_id");
            $countStmt->bindParam(':farmer_id', $this->currentUserId);
            $countStmt->execute();
            $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

            // Get crops
            $stmt = $this->conn->prepare("
                SELECT * FROM crops 
                WHERE farmer_id = :farmer_id 
                ORDER BY created_at DESC 
                LIMIT :limit OFFSET :offset
            ");
            $stmt->bindParam(':farmer_id', $this->currentUserId);
            $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            $crops = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($crops as &$crop) {
                $crop['images'] = json_decode($crop['images'] ?? '[]', true);
            }

            Response::paginated($crops, $page, $perPage, $total);

        } catch (PDOException $e) {
            error_log("Get My Crops Error: " . $e->getMessage());
            Response::serverError('Failed to fetch crops');
        }
    }

    /**
     * Get pending crops (admin only)
     */
    private function getPendingCrops() {
        $this->requireAdmin();

        $page = $_GET['page'] ?? 1;
        $perPage = $_GET['per_page'] ?? 20;
        $offset = ($page - 1) * $perPage;

        try {
            // Get total count
            $countStmt = $this->conn->prepare("SELECT COUNT(*) as total FROM crops WHERE status = 'pending'");
            $countStmt->execute();
            $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

            // Get pending crops with farmer info
            $stmt = $this->conn->prepare("
                SELECT c.*, u.name as farmer_name, u.avatar as farmer_avatar, 
                       u.county as farmer_county, u.phone as farmer_phone
                FROM crops c
                JOIN users u ON c.farmer_id = u.id
                WHERE c.status = 'pending'
                ORDER BY c.created_at DESC
                LIMIT :limit OFFSET :offset
            ");
            $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            $crops = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($crops as &$crop) {
                $crop['images'] = json_decode($crop['images'] ?? '[]', true);
            }

            Response::paginated($crops, $page, $perPage, $total);

        } catch (PDOException $e) {
            error_log("Get Pending Crops Error: " . $e->getMessage());
            Response::serverError('Failed to fetch pending crops');
        }
    }

    /**
     * Create new crop (farmers only)
     */
    private function createCrop() {
        $this->requireFarmer();

        $data = json_decode(file_get_contents('php://input'), true);

        // Validate required fields
        $required = ['name', 'description', 'category', 'price', 'quantity'];
        $errors = [];

        foreach ($required as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                $errors[$field] = ucfirst($field) . ' is required';
            }
        }

        if (!empty($errors)) {
            Response::validationError($errors);
        }

        try {
            $stmt = $this->conn->prepare("
                INSERT INTO crops (name, description, category, price, price_unit, quantity, quantity_unit, 
                                  images, farmer_id, is_organic, is_negotiable, harvest_date, expiry_date)
                VALUES (:name, :description, :category, :price, :price_unit, :quantity, :quantity_unit,
                        :images, :farmer_id, :is_organic, :is_negotiable, :harvest_date, :expiry_date)
                RETURNING *
            ");

            $images = json_encode($data['images'] ?? []);
            $priceUnit = $data['price_unit'] ?? 'kg';
            $quantityUnit = $data['quantity_unit'] ?? 'kg';
            $isOrganic = $data['is_organic'] ?? false;
            $isNegotiable = $data['is_negotiable'] ?? false;
            $harvestDate = $data['harvest_date'] ?? null;
            $expiryDate = $data['expiry_date'] ?? null;

            $stmt->bindParam(':name', $data['name']);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':category', $data['category']);
            $stmt->bindParam(':price', $data['price']);
            $stmt->bindParam(':price_unit', $priceUnit);
            $stmt->bindParam(':quantity', $data['quantity']);
            $stmt->bindParam(':quantity_unit', $quantityUnit);
            $stmt->bindParam(':images', $images);
            $stmt->bindParam(':farmer_id', $this->currentUserId);
            $stmt->bindParam(':is_organic', $isOrganic);
            $stmt->bindParam(':is_negotiable', $isNegotiable);
            $stmt->bindParam(':harvest_date', $harvestDate);
            $stmt->bindParam(':expiry_date', $expiryDate);
            $stmt->execute();

            $crop = $stmt->fetch(PDO::FETCH_ASSOC);
            $crop['images'] = json_decode($crop['images'] ?? '[]', true);

            Response::success($crop, 'Crop created successfully. Awaiting approval.', null, 201);

        } catch (PDOException $e) {
            error_log("Create Crop Error: " . $e->getMessage());
            Response::serverError('Failed to create crop');
        }
    }

    /**
     * Update crop
     */
    private function updateCrop($id) {
        $data = json_decode(file_get_contents('php://input'), true);

        try {
            // Check if crop exists and user has permission
            $checkStmt = $this->conn->prepare("SELECT farmer_id, status FROM crops WHERE id = :id LIMIT 1");
            $checkStmt->bindParam(':id', $id);
            $checkStmt->execute();
            $crop = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if (!$crop) {
                Response::notFound('Crop not found');
            }

            // Only farmer who created it or admin can update
            if ($this->currentUserRole !== 'admin' && $crop['farmer_id'] != $this->currentUserId) {
                Response::forbidden('Access denied');
            }

            // Non-admins cannot change status
            if ($this->currentUserRole !== 'admin') {
                unset($data['status']);
            }

            // Build update query
            $allowedFields = ['name', 'description', 'category', 'price', 'price_unit', 
                            'quantity', 'quantity_unit', 'images', 'is_organic', 
                            'is_negotiable', 'harvest_date', 'expiry_date', 'status'];
            $updates = [];
            $params = [':id' => $id];

            foreach ($data as $field => $value) {
                if (in_array($field, $allowedFields)) {
                    if ($field === 'images') {
                        $value = json_encode($value);
                    }
                    $updates[] = "$field = :$field";
                    $params[":$field"] = $value;
                }
            }

            if (empty($updates)) {
                Response::error('No valid fields to update');
            }

            $query = "UPDATE crops SET " . implode(', ', $updates) . " WHERE id = :id RETURNING *";
            $stmt = $this->conn->prepare($query);

            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }

            $stmt->execute();
            $updatedCrop = $stmt->fetch(PDO::FETCH_ASSOC);
            $updatedCrop['images'] = json_decode($updatedCrop['images'] ?? '[]', true);

            Response::success($updatedCrop, 'Crop updated successfully');

        } catch (PDOException $e) {
            error_log("Update Crop Error: " . $e->getMessage());
            Response::serverError('Failed to update crop');
        }
    }

    /**
     * Delete crop
     */
    private function deleteCrop($id) {
        try {
            // Check if crop exists and user has permission
            $checkStmt = $this->conn->prepare("SELECT farmer_id FROM crops WHERE id = :id LIMIT 1");
            $checkStmt->bindParam(':id', $id);
            $checkStmt->execute();
            $crop = $checkStmt->fetch(PDO::FETCH_ASSOC);

            if (!$crop) {
                Response::notFound('Crop not found');
            }

            // Only farmer who created it or admin can delete
            if ($this->currentUserRole !== 'admin' && $crop['farmer_id'] != $this->currentUserId) {
                Response::forbidden('Access denied');
            }

            $stmt = $this->conn->prepare("DELETE FROM crops WHERE id = :id");
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            Response::success(null, 'Crop deleted successfully');

        } catch (PDOException $e) {
            error_log("Delete Crop Error: " . $e->getMessage());
            Response::serverError('Failed to delete crop');
        }
    }

    /**
     * Approve crop (admin only)
     */
    private function approveCrop($id) {
        $this->requireAdmin();

        try {
            $stmt = $this->conn->prepare("
                UPDATE crops 
                SET status = 'approved' 
                WHERE id = :id 
                RETURNING *
            ");
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            $crop = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$crop) {
                Response::notFound('Crop not found');
            }

            $crop['images'] = json_decode($crop['images'] ?? '[]', true);
            Response::success($crop, 'Crop approved successfully');

        } catch (PDOException $e) {
            error_log("Approve Crop Error: " . $e->getMessage());
            Response::serverError('Failed to approve crop');
        }
    }
}

// Handle request
$api = new CropsAPI();
$api->handle();
?>
