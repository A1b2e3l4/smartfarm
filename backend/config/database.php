<?php
/**
 * Database Configuration
 * SmartFarm API - PostgreSQL Database Connection
 */

class Database {
    private $host;
    private $port;
    private $db_name;
    private $username;
    private $password;
    private $conn;

    public function __construct() {
        // Load from environment variables (for production)
        $this->host = getenv('DB_HOST') ?: 'db.euazwhbpkhsempaliopv.supabase.co';
        $this->port = getenv('DB_PORT') ?: '5432';
        $this->db_name = getenv('DB_NAME') ?: 'smartfarm';
        $this->username = getenv('DB_USER') ?: 'postgres';
        $this->password = getenv('DB_PASSWORD') ?: '@Muturi123#';
    }

    /**
     * Get database connection
     * @return PDO|null
     */
        public function getConnection() {
            $this->conn = null;

            try {
                $dsn = "pgsql:host={$this->host};port={$this->port};dbname=postgres;sslmode=require";

                $this->conn = new PDO($dsn, $this->username, $this->password, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]);

                return $this->conn;

            } catch(PDOException $e) {
                error_log("Database Connection Error: " . $e->getMessage());
                return null;
            }
        }

    /**
     * Test database connection
     * @return bool
     */
    public function testConnection() {
        $conn = $this->getConnection();
        return $conn !== null;
    }
}
?>
