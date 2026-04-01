<?php
/**
 * SmartFarm API - PostgreSQL Connection for Supabase
 */
class Database {
    private $conn;

    public function getConnection() {
        $this->conn = null;

        // Load from environment variables if set, otherwise use defaults
        $host = getenv('DB_HOST') ?: 'db.euazwhbpkhsempaliopv.supabase.co';
        $port = getenv('DB_PORT') ?: 5432;
        $db   = getenv('DB_NAME') ?: 'postgres';
        $user = getenv('DB_USER') ?: 'postgres';
        $pass = getenv('DB_PASSWORD') ?: '@Muturi123#';

        try {
            $dsn = "pgsql:host=db.euazwhbpkhsempaliopv.supabase.co;port=5432;dbname=postgres;sslmode=require";

            $this->conn = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);

        } catch(PDOException $e) {
            error_log("Database Connection Error: " . $e->getMessage());
            return null;
        }

        return $this->conn;
    }

    public function testConnection() {
        $conn = $this->getConnection();
        return $conn !== null;
    }
}
?>