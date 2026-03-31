<?php
/**
 * SmartFarm API - Main Entry Point (Fixed with CORS & Preflight Support)
 */

// --- 1. CORS CONFIGURATION ---
// Allow requests from your Vercel frontend
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// --- 2. HANDLE PREFLIGHT REQUESTS ---
// Browsers send an OPTIONS request before POST/PUT for security. 
// We must return a 200 OK immediately for these.
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- 3. ERROR HELPER ---
// Defining this early so the router can use it
function errorResponse($message, $code = 404) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => $message
    ]);
    exit();
}

// --- 4. INITIALIZE ---
require_once 'config/database.php';
require_once 'config/jwt.php';

// Get the request path
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path = trim($path, '/');
$path_parts = explode('/', $path);

// Remove 'api' prefix if present (e.g., /api/auth/login -> /auth/login)
if (isset($path_parts[0]) && $path_parts[0] === 'api') {
    array_shift($path_parts);
}

$endpoint = isset($path_parts[0]) ? $path_parts[0] : '';

// --- 5. ROUTING LOGIC ---
switch ($endpoint) {
    case 'auth':
        $action = isset($path_parts[1]) ? $path_parts[1] : '';
        if ($action === 'register') {
            require_once 'auth/register.php';
        } elseif ($action === 'login') {
            require_once 'auth/login.php';
        } else {
            errorResponse('Invalid auth endpoint', 404);
        }
        break;
        
    case 'users':
        $action = isset($path_parts[1]) ? $path_parts[1] : '';
        if ($action === 'profile') {
            require_once 'users/profile.php';
        } else {
            errorResponse('Invalid users endpoint', 404);
        }
        break;
        
    case 'crops':
        require_once 'crops/index.php';
        break;
        
    case 'orders':
        require_once 'orders/index.php';
        break;
        
    case 'dashboard':
        require_once 'dashboard/index.php';
        break;
        
    case 'admin':
        $resource = isset($path_parts[1]) ? $path_parts[1] : '';
        if ($resource === 'users') {
            require_once 'admin/users.php';
        } elseif ($resource === 'stats') {
            require_once 'admin/stats.php';
        } else {
            errorResponse('Invalid admin endpoint', 404);
        }
        break;
        
    case '':
        // API root - return info
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => 'Welcome to SmartFarm API',
            'version' => '1.0.0',
            'status' => 'Online',
            'endpoints' => [
                'auth' => ['POST /auth/register', 'POST /auth/login'],
                'admin' => ['GET /admin/users', 'GET /admin/stats']
            ]
        ]);
        break;
        
    default:
        errorResponse('Endpoint not found: ' . $endpoint, 404);
        break;
}