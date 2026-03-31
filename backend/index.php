<?php
/**
 * SmartFarm API - Main Entry Point
 * 
 * This file routes all API requests to the appropriate endpoints.
 * 
 * API Structure:
 * - /auth/register - User registration
 * - /auth/login - User login
 * - /users/profile - User profile management
 * - /crops - Crop management
 * - /orders - Order management
 * - /dashboard - Dashboard statistics
 * - /admin/users - User management (admin only)
 * - /admin/stats - Platform statistics (admin only)
 */

require_once 'config/database.php';
require_once 'config/jwt.php';

// Get the request path
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path = trim($path, '/');
$path_parts = explode('/', $path);

// Remove 'api' prefix if present
if (isset($path_parts[0]) && $path_parts[0] === 'api') {
    array_shift($path_parts);
}

$endpoint = isset($path_parts[0]) ? $path_parts[0] : '';

// Route to appropriate endpoint
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
            'endpoints' => [
                'auth' => [
                    'POST /auth/register' => 'Register new user',
                    'POST /auth/login' => 'User login'
                ],
                'users' => [
                    'GET /users/profile' => 'Get user profile',
                    'PUT /users/profile' => 'Update user profile',
                    'POST /users/profile/image' => 'Upload profile image'
                ],
                'crops' => [
                    'GET /crops' => 'List crops',
                    'POST /crops' => 'Create new crop (farmer only)',
                    'GET /crops/:id' => 'Get crop details',
                    'PUT /crops/:id' => 'Update crop',
                    'DELETE /crops/:id' => 'Delete crop'
                ],
                'orders' => [
                    'GET /orders' => 'List orders',
                    'POST /orders' => 'Create new order (buyer only)',
                    'GET /orders/:id' => 'Get order details',
                    'PUT /orders/:id' => 'Update order status'
                ],
                'dashboard' => [
                    'GET /dashboard' => 'Get dashboard statistics',
                    'GET /dashboard/farmer' => 'Get farmer stats',
                    'GET /dashboard/buyer' => 'Get buyer stats'
                ],
                'admin' => [
                    'GET /admin/users' => 'List all users (admin only)',
                    'GET /admin/users/:id' => 'Get user details (admin only)',
                    'PUT /admin/users/:id' => 'Update user (admin only)',
                    'DELETE /admin/users/:id' => 'Delete user (admin only)',
                    'GET /admin/stats' => 'Get platform statistics (admin only)'
                ]
            ]
        ]);
        break;
        
    default:
        errorResponse('Endpoint not found', 404);
        break;
}
