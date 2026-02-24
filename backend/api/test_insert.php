<?php
// CLI test script to insert a user directly into moodly.db for debugging
$logFile = __DIR__ . '/register.log';
function log_msg($msg) {
    global $logFile;
    @file_put_contents($logFile, date('[Y-m-d H:i:s] ') . $msg . "\n", FILE_APPEND);
}

// DB path candidates (same logic as register.php)
$candidates = [
    __DIR__ . '/../moodly.db',
    __DIR__ . '/moodly.db',
];
$dbFile = $candidates[0];

try {
    $pdo = new PDO('sqlite:' . $dbFile);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    log_msg('test_insert: connected to ' . $dbFile);

    $username = 'cli_test_user_' . time();
    $email = $username . '@example.com';
    $password_hash = password_hash('cli_secret_123', PASSWORD_DEFAULT);

    $stmt = $pdo->prepare('INSERT INTO users (username, email, password_hash) VALUES (:username, :email, :password_hash)');
    $stmt->execute([':username' => $username, ':email' => $email, ':password_hash' => $password_hash]);
    $id = $pdo->lastInsertId();

    echo json_encode(['status' => 'ok', 'id' => (int)$id, 'username' => $username, 'email' => $email]) . PHP_EOL;
    log_msg('test_insert: inserted user ' . $email . ' id=' . $id);
} catch (Exception $e) {
    log_msg('test_insert error: ' . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]) . PHP_EOL;
    exit(1);
}
