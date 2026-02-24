<?php
// Enable verbose errors in development (remove for production)
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  header('Access-Control-Allow-Methods: POST, OPTIONS');
  exit;
}

// Path to the project's SQLite DB (moodly.db in repo root)
// Try multiple strategies and log to api/register.log for debug
$logFile = __DIR__ . '/register.log';
function log_msg($msg) {
    global $logFile;
    @file_put_contents($logFile, date('[Y-m-d H:i:s] ') . $msg . "\n", FILE_APPEND);
}

// Candidate paths
$candidates = [
    __DIR__ . '/../moodly.db',            // repo root next to api/
    __DIR__ . '/moodly.db',               // inside api/ (fallback)
];
$dbFile = null;
foreach ($candidates as $c) {
    // normalize
    $path = str_replace('\\', '/', $c);
    if (file_exists($path) || !file_exists($path)) {
        // we'll attempt to use the first candidate; PDO will create the file if missing
        $dbFile = $path;
        break;
    }
}

if (!$dbFile) {
    log_msg('No DB path candidate available');
    http_response_code(500);
    echo json_encode(['error' => 'No database path available']);
    exit;
}

log_msg('Using DB path: ' . $dbFile);

$use_pdo = false;
// Try PDO first
try {
    $pdo = new PDO('sqlite:' . $dbFile);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Ensure users table exists (keeps schema compatible with existing code)
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    log_msg('PDO: ensured users table exists');
    $use_pdo = true;
} catch (Exception $e) {
    $err = $e->getMessage();
    log_msg('PDO error: ' . $err);
    // Fall back to native SQLite3 extension if available
    if (class_exists('SQLite3')) {
        try {
            $sqlite = new SQLite3($dbFile);
            $sqlite->exec("CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )");
            log_msg('SQLite3: ensured users table exists');
            $use_pdo = false;
        } catch (Exception $e2) {
            log_msg('SQLite3 error: ' . $e2->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Unable to open database', 'details' => $e2->getMessage()]);
            exit;
        }
    } else {
        log_msg('No PDO SQLite driver and SQLite3 extension not available');
        http_response_code(500);
        echo json_encode(['error' => 'No SQLite support in PHP (pdo_sqlite or sqlite3 required)', 'details' => $err]);
        exit;
    }
}

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') {
    // Simple HTML status page for developers visiting the endpoint
    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><html><head><meta charset="utf-8"><title>Register API</title></head><body style="font-family:system-ui,Segoe UI,Roboto,Arial;padding:24px">';
    echo '<h1>Register API</h1>';
    echo '<p>This endpoint accepts <code>POST</code> with JSON: <code>{"username":"...","email":"...","password":"..."}</code></p>';
    echo '<p>Check <code>api/register.log</code> for server logs.</p>';
    echo '</body></html>';
    exit;
} elseif ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed, use POST']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    // Also accept form-encoded POST
    $data = $_POST;
}

$username = isset($data['username']) ? trim($data['username']) : null;
$email = isset($data['email']) ? trim($data['email']) : null;
$password = isset($data['password']) ? $data['password'] : null;

if (!$username || !$email || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields: username, email, password']);
    exit;
}

// Basic validation
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['error' => 'Password must be at least 6 characters long']);
    exit;
}

try {
    // Check if user exists and insert using PDO or SQLite3 fallback
    if (isset($pdo) && ($use_pdo === true)) {
        $stmt = $pdo->prepare('SELECT id FROM users WHERE username = :username OR email = :email LIMIT 1');
        $stmt->execute([':username' => $username, ':email' => $email]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            http_response_code(409);
            echo json_encode(['error' => 'Username or email already exists']);
            exit;
        }

        // Hash password with PHP's password_hash
        $password_hash = password_hash($password, PASSWORD_DEFAULT);

        // Insert user
        $insert = $pdo->prepare('INSERT INTO users (username, email, password_hash) VALUES (:username, :email, :password_hash)');
        $insert->execute([
            ':username' => $username,
            ':email' => $email,
            ':password_hash' => $password_hash,
        ]);

        $userId = $pdo->lastInsertId();
    } else {
        // Using SQLite3 extension
        $res = $sqlite->prepare('SELECT id FROM users WHERE username = :username OR email = :email LIMIT 1');
        $res->bindValue(':username', $username, SQLITE3_TEXT);
        $res->bindValue(':email', $email, SQLITE3_TEXT);
        $row = $res->execute()->fetchArray(SQLITE3_ASSOC);
        if ($row) {
            http_response_code(409);
            echo json_encode(['error' => 'Username or email already exists']);
            exit;
        }

        $password_hash = password_hash($password, PASSWORD_DEFAULT);
        $ins = $sqlite->prepare('INSERT INTO users (username, email, password_hash) VALUES (:username, :email, :password_hash)');
        $ins->bindValue(':username', $username, SQLITE3_TEXT);
        $ins->bindValue(':email', $email, SQLITE3_TEXT);
        $ins->bindValue(':password_hash', $password_hash, SQLITE3_TEXT);
        $result = $ins->execute();
        $userId = $sqlite->lastInsertRowID();
    }

    http_response_code(201);
    echo json_encode([
        'message' => 'User created successfully',
        'user' => [
            'id' => (int)$userId,
            'username' => $username,
            'email' => $email
        ]
    ]);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error', 'details' => $e->getMessage()]);
    exit;
}
