<?php
/**
 * Health Check Endpoint
 * SmartFarm API - For Docker health checks and monitoring
 */

require_once '../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$health = [
    'status' => 'healthy',
    'timestamp' => date('Y-m-d H:i:s'),
    'services' => []
];

$httpCode = 200;

// Check database connection
try {
    $db = new Database();
    $conn = $db->getConnection();
    
    if ($conn) {
        // Test query
        $stmt = $conn->query('SELECT 1');
        $health['services']['database'] = [
            'status' => 'connected',
            'type' => 'PostgreSQL'
        ];
    } else {
        $health['services']['database'] = [
            'status' => 'disconnected',
            'error' => 'Could not establish connection'
        ];
        $health['status'] = 'unhealthy';
        $httpCode = 503;
    }
} catch (Exception $e) {
    $health['services']['database'] = [
        'status' => 'error',
        'error' => $e->getMessage()
    ];
    $health['status'] = 'unhealthy';
    $httpCode = 503;
}

// Check PHP version
$health['services']['php'] = [
    'status' => 'ok',
    'version' => PHP_VERSION
];

// Check required extensions
$requiredExtensions = ['pdo', 'pdo_pgsql', 'json', 'gd', 'exif'];
$missingExtensions = [];

foreach ($requiredExtensions as $ext) {
    if (!extension_loaded($ext)) {
        $missingExtensions[] = $ext;
    }
}

if (empty($missingExtensions)) {
    $health['services']['extensions'] = [
        'status' => 'ok',
        'loaded' => $requiredExtensions
    ];
} else {
    $health['services']['extensions'] = [
        'status' => 'error',
        'missing' => $missingExtensions
    ];
    $health['status'] = 'unhealthy';
    $httpCode = 503;
}

// Memory usage
$health['system'] = [
    'memory_usage' => memory_get_usage(true),
    'memory_peak' => memory_get_peak_usage(true),
    'memory_limit' => ini_get('memory_limit')
];

http_response_code($httpCode);
echo json_encode($health, JSON_PRETTY_PRINT);
?>
