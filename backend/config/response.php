<?php
/**
 * API Response Handler
 * SmartFarm API - Standardized Response Format
 */

class Response {
    
    /**
     * Send success response
     * @param mixed $data
     * @param string $message
     * @param array $meta
     * @param int $statusCode
     */
    public static function success($data = null, $message = 'Success', $meta = null, $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        
        $response = [
            'success' => true,
            'message' => $message,
            'data' => $data
        ];

        if ($meta !== null) {
            $response['meta'] = $meta;
        }

        echo json_encode($response);
        exit;
    }

    /**
     * Send error response
     * @param string $message
     * @param array $errors
     * @param int $statusCode
     */
    public static function error($message = 'Error occurred', $errors = null, $statusCode = 400) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        
        $response = [
            'success' => false,
            'message' => $message
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        echo json_encode($response);
        exit;
    }

    /**
     * Send paginated response
     * @param array $data
     * @param int $currentPage
     * @param int $perPage
     * @param int $total
     * @param string $message
     */
    public static function paginated($data, $currentPage, $perPage, $total, $message = 'Success') {
        $lastPage = ceil($total / $perPage);
        
        $meta = [
            'current_page' => (int)$currentPage,
            'per_page' => (int)$perPage,
            'total' => (int)$total,
            'last_page' => (int)$lastPage
        ];

        // Add next/prev page URLs if applicable
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'];
        $uri = $_SERVER['REQUEST_URI'];
        $baseUrl = $protocol . '://' . $host . parse_url($uri, PHP_URL_PATH);
        
        if ($currentPage < $lastPage) {
            $meta['next_page_url'] = $baseUrl . '?page=' . ($currentPage + 1) . '&per_page=' . $perPage;
        }
        
        if ($currentPage > 1) {
            $meta['prev_page_url'] = $baseUrl . '?page=' . ($currentPage - 1) . '&per_page=' . $perPage;
        }

        self::success($data, $message, $meta);
    }

    /**
     * Send unauthorized response
     * @param string $message
     */
    public static function unauthorized($message = 'Unauthorized') {
        self::error($message, null, 401);
    }

    /**
     * Send forbidden response
     * @param string $message
     */
    public static function forbidden($message = 'Forbidden') {
        self::error($message, null, 403);
    }

    /**
     * Send not found response
     * @param string $message
     */
    public static function notFound($message = 'Resource not found') {
        self::error($message, null, 404);
    }

    /**
     * Send validation error response
     * @param array $errors
     * @param string $message
     */
    public static function validationError($errors, $message = 'Validation failed') {
        self::error($message, $errors, 422);
    }

    /**
     * Send server error response
     * @param string $message
     */
    public static function serverError($message = 'Internal server error') {
        self::error($message, null, 500);
    }
}
?>
