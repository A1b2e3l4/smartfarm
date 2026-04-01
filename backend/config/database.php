<?php
class Database {
    private $host;
    private $port;
    private $db_name;
    private $username;
    private $password;
    private $conn;

    public function __construct() {
        $this->host = getenv('DB_HOST') ?: 'db.euazwhbpkhsempaliopv.supabase.co';
        $this->port = getenv('DB_PORT') ?: '5432';
        $this->db_name = getenv('DB_NAME') ?: 'postgres';
        $this->username = getenv('DB_USER') ?: 'postgres';
        $this->password = getenv('DB_PASSWORD') ?: '@Muturi123#';
    }

    public function getConnection() {
        $this->conn = null;
        try {
            // SSL required for Supabase
            $dsn = "pgsql:host={$this->host};port={$this->port};dbname={$this->db_name};sslmode=require";
            $this->conn = new PDO($dsn, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $this->conn->exec("SET NAMES 'UTF8'");
        } catch (PDOException $e) {
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