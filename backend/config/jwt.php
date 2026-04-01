<?php
/**
 * JWT Authentication Handler
 * SmartFarm API - JSON Web Token Implementation
 */

class JWT {
    private static $secret_key;
    private static $encrypt_method = 'HS256';
    private static $access_token_expiry = 3600; // 1 hour
    private static $refresh_token_expiry = 604800; // 7 days

    public function __construct() {
        // Load secret key from environment variable
        self::$secret_key = getenv('JWT_SECRET') ?: 'your-secret-key-here-change-in-production';
    }

    /**
     * Generate JWT token
     * @param array $payload
     * @param string $type 'access' or 'refresh'
     * @return string
     */
    public static function generate($payload, $type = 'access') {
        $header = json_encode([
            'typ' => 'JWT',
            'alg' => self::$encrypt_method
        ]);

        $time = time();
        $expiry = $type === 'access' ? self::$access_token_expiry : self::$refresh_token_expiry;

        $payload['iat'] = $time;
        $payload['exp'] = $time + $expiry;
        $payload['type'] = $type;

        $payload_json = json_encode($payload);

        // Encode Header
        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));

        // Encode Payload
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload_json));

        // Create Signature
        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, self::$secret_key, true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        // Create JWT
        $jwt = $base64Header . "." . $base64Payload . "." . $base64Signature;

        return $jwt;
    }

    /**
     * Validate and decode JWT token
     * @param string $token
     * @return array|false
     */
    public static function validate($token) {
        // Split token
        $tokenParts = explode('.', $token);

        if (count($tokenParts) != 3) {
            return false;
        }

        $header = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[0]));
        $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[1]));
        $signatureProvided = $tokenParts[2];

        // Check expiration
        $payloadData = json_decode($payload, true);

        if (!isset($payloadData['exp']) || $payloadData['exp'] < time()) {
            return false;
        }

        // Verify signature
        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, self::$secret_key, true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        if (!hash_equals($base64Signature, $signatureProvided)) {
            return false;
        }

        return $payloadData;
    }

    /**
     * Get user ID from token
     * @param string $token
     * @return int|false
     */
    public static function getUserId($token) {
        $payload = self::validate($token);
        return $payload ? ($payload['sub'] ?? false) : false;
    }

    /**
     * Get user role from token
     * @param string $token
     * @return string|false
     */
    public static function getUserRole($token) {
        $payload = self::validate($token);
        return $payload ? ($payload['role'] ?? false) : false;
    }

    /**
     * Refresh access token using refresh token
     * @param string $refreshToken
     * @return array|false
     */
    public static function refresh($refreshToken) {
        $payload = self::validate($refreshToken);

        if (!$payload || ($payload['type'] ?? '') !== 'refresh') {
            return false;
        }

        // Generate new tokens
        $newPayload = [
            'sub' => $payload['sub'],
            'email' => $payload['email'],
            'role' => $payload['role']
        ];

        return [
            'token' => self::generate($newPayload, 'access'),
            'refresh_token' => self::generate($newPayload, 'refresh')
        ];
    }
}
?>
