<?php
/**
 * JWT Authentication Helper Class
 * 
 * Handles JWT token generation, validation, and decoding
 */

class JWT {
    private static $secret_key;
    private static $algorithm = 'HS256';
    
    public static function init() {
        self::$secret_key = getenv('JWT_SECRET') ?: 'your-super-secret-jwt-key-change-in-production';
    }
    
    /**
     * Generate JWT token
     * @param array $payload - Data to encode in token
     * @param int $expiry_hours - Token expiry time in hours
     * @return string
     */
    public static function generate($payload, $expiry_hours = 24) {
        self::init();
        
        $header = json_encode(['typ' => 'JWT', 'alg' => self::$algorithm]);
        
        $time = time();
        $payload['iat'] = $time;
        $payload['exp'] = $time + ($expiry_hours * 3600);
        
        $payload_json = json_encode($payload);
        
        $base64_header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64_payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload_json));
        
        $signature = hash_hmac('sha256', $base64_header . "." . $base64_payload, self::$secret_key, true);
        $base64_signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        return $base64_header . "." . $base64_payload . "." . $base64_signature;
    }
    
    /**
     * Validate and decode JWT token
     * @param string $token
     * @return array|false - Returns decoded payload or false if invalid
     */
    public static function validate($token) {
        self::init();
        
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return false;
        }
        
        list($base64_header, $base64_payload, $base64_signature) = $parts;
        
        // Verify signature
        $signature = hash_hmac('sha256', $base64_header . "." . $base64_payload, self::$secret_key, true);
        $expected_signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        if (!hash_equals($expected_signature, $base64_signature)) {
            return false;
        }
        
        // Decode payload
        $payload_json = base64_decode(str_replace(['-', '_'], ['+', '/'], $base64_payload));
        $payload = json_decode($payload_json, true);
        
        // Check expiration
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return false;
        }
        
        return $payload;
    }
    
    /**
     * Get token from Authorization header
     * @return string|null
     */
    public static function getBearerToken() {
        $headers = null;
        
        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER['Authorization']);
        } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
        } elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }
        
        if ($headers && preg_match('/Bearer\s+(.*)$/i', $headers, $matches)) {
            return $matches[1];
        }
        
        return null;
    }
    
    /**
     * Get authenticated user ID from token
     * @return string|false
     */
    public static function getUserId() {
        $token = self::getBearerToken();
        if (!$token) {
            return false;
        }
        
        $payload = self::validate($token);
        if (!$payload || !isset($payload['user_id'])) {
            return false;
        }
        
        return $payload['user_id'];
    }
}

/**
 * Response helper functions
 */
function successResponse($data, $message = 'Success', $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => true,
        'message' => $message,
        'data' => $data
    ]);
}

function errorResponse($message, $code = 400) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'message' => $message,
        'data' => null
    ]);
}

/**
 * Require authentication middleware
 * @return array|false - Returns user payload or false
 */
function requireAuth() {
    $token = JWT::getBearerToken();
    if (!$token) {
        errorResponse('Authorization token required', 401);
        return false;
    }
    
    $payload = JWT::validate($token);
    if (!$payload) {
        errorResponse('Invalid or expired token', 401);
        return false;
    }
    
    return $payload;
}

/**
 * Require specific role middleware
 * @param string|array $roles - Required role(s)
 * @return array|false
 */
function requireRole($roles) {
    $payload = requireAuth();
    if (!$payload) {
        return false;
    }
    
    if (is_string($roles)) {
        $roles = [$roles];
    }
    
    if (!in_array($payload['role'], $roles)) {
        errorResponse('Insufficient permissions', 403);
        return false;
    }
    
    return $payload;
}
