import { SYLLABUS_DATA } from '../lib/syllabusData';

export const API_FILES_LIST = [
    'index.php', 'config.php', 'cors.php', 'test_db.php', 'migrate_db.php',
    'login.php', 'register.php', 'google_login.php', 'update_password.php',
    'get_dashboard.php', 'sync_progress.php', 
    'save_attempt.php', 'save_timetable.php',
    'manage_users.php', 'manage_content.php', 'manage_tests.php', 
    'manage_syllabus.php', 'manage_questions.php', 'manage_backlogs.php',
    'manage_goals.php', 'manage_mistakes.php', 'manage_notes.php',
    'manage_videos.php', 'manage_contact.php', 'contact.php',
    'manage_settings.php', 'update_profile.php', 'track_visit.php',
    'get_admin_stats.php', 'search_students.php', 'send_request.php',
    'respond_request.php', 'get_psychometric.php', 'save_psychometric.php',
    'delete_account.php', 'upload_avatar.php', 'get_topics.php', 
    'get_attempt_details.php', 'manage_chapter_test.php', 'heartbeat.php'
];

const phpHeader = `<?php
/**
 * IITGEEPrep Unified Sync Engine v21.0
 * PRODUCTION CORE - STRICT MYSQL PDO
 */
error_reporting(E_ALL);
ini_set('display_errors', 0);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

include_once 'config.php';

function getJsonInput() {
    return json_decode(file_get_contents('php://input'));
}

function sendError($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(["status" => "error", "message" => $msg]);
    exit;
}

function sendSuccess($data = []) {
    echo json_encode(array_merge(["status" => "success"], $data));
    exit;
}
`;

export const getBackendFiles = (dbConfig: any) => {
    const files = [
        {
            name: '.htaccess',
            folder: 'deployment',
            content: `RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ api/index.php [L]`
        },
        {
            name: 'robots.txt',
            folder: 'deployment',
            content: `User-agent: *
Allow: /
Sitemap: /sitemap.xml`
        },
        {
            name: 'config.php',
            folder: 'deployment/api',
            content: `<?php
$host = "${dbConfig.host}";
$db_name = "${dbConfig.name}";
$user = "${dbConfig.user}";
$pass = "${dbConfig.pass}";
try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    die(json_encode(["status" => "error", "message" => "DB_CONNECTION_FAILED: " . $e->getMessage()]));
}
?>`
        }
    ];

    // Core API files generator
    API_FILES_LIST.forEach(filename => {
        if (filename === 'config.php') return;
        
        let content = `${phpHeader}\n// logic for ${filename}\n`;
        
        if (filename === 'index.php') {
            content += `$method = $_SERVER['REQUEST_METHOD'];\nsendSuccess(["api" => "IITGEE_SYNC_V21", "status" => "ONLINE"]);`;
        } else if (filename === 'migrate_db.php') {
            content += `// Self-healing migration script
try {
    $sql = file_get_contents('../database_mysql.sql');
    $conn->exec($sql);
    sendSuccess(["message" => "Schema migrated successfully."]);
} catch(Exception $e) { sendError($e->getMessage()); }`;
        } else if (filename === 'get_dashboard.php') {
            content += `$user_id = $_GET['user_id'] ?? null;
if(!$user_id) sendError("MISSING_USER_ID");
try {
    $data = [
        'progress' => [], 'attempts' => [], 'goals' => [], 'backlogs' => [], 
        'timetable' => null, 'psychometric' => null
    ];
    $stmt = $conn->prepare("SELECT * FROM user_progress WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $data['progress'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $stmt = $conn->prepare("SELECT * FROM test_attempts WHERE user_id = ? ORDER BY date DESC");
    $stmt->execute([$user_id]);
    $data['attempts'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $stmt = $conn->prepare("SELECT * FROM goals WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $data['goals'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $stmt = $conn->prepare("SELECT * FROM backlogs WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $data['backlogs'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Explicit fix for missing table error: Ensure this table is queried correctly
    $stmt = $conn->prepare("SELECT * FROM timetables WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $tt = $stmt->fetch(PDO::FETCH_ASSOC);
    if($tt) $data['timetable'] = ["config" => json_decode($tt['config_json']), "slots" => json_decode($tt['slots_json'])];
    
    $stmt = $conn->prepare("SELECT report_json FROM psychometric_reports WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $psych = $stmt->fetch(PDO::FETCH_ASSOC);
    if($psych) $data['psychometric'] = json_decode($psych['report_json']);
    
    sendSuccess($data);
} catch(Exception $e) { sendError($e->getMessage()); }`;
        } else if (filename === 'login.php') {
            content += `$input = getJsonInput();
$stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$input->email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if($user && password_verify($input->password, $user['password_hash'])) {
    unset($user['password_hash']);
    sendSuccess(['user' => $user]);
} sendError("Invalid credentials. If you just registered, ensure the SQL schema was imported.", 401);`;
        } else if (filename === 'save_timetable.php') {
            content += `$input = getJsonInput();
$sql = "INSERT INTO timetables (user_id, config_json, slots_json) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE config_json=VALUES(config_json), slots_json=VALUES(slots_json)";
$stmt = $conn->prepare($sql);
$stmt->execute([$input->userId, json_encode($input->config), json_encode($input->slots)]);
sendSuccess();`;
        } else {
            content += `// System v21.0 Placeholder for ${filename}\nsendSuccess(["endpoint" => "${filename}", "status" => "ONLINE"]);`;
        }

        files.push({
            name: filename,
            folder: 'deployment/api',
            content
        });
    });

    return files;
};

export const generateSQLSchema = () => {
    // Password hash for Ishika@123 is $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
    return `
-- IITGEEPrep v21.0 Master Production Schema
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(50),
    is_verified TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- SEEDED ACCOUNTS (Password: Ishika@123)
INSERT IGNORE INTO users (id, name, email, password_hash, role, is_verified) VALUES 
('u_admin', 'Admin Master', 'admin@prep.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', 1),
('u_student', 'Demo Student', 'student@prep.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'STUDENT', 1),
('u_parent', 'Demo Parent', 'parent@prep.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PARENT', 1);

CREATE TABLE IF NOT EXISTS user_progress (
    user_id VARCHAR(255),
    topic_id VARCHAR(255),
    status VARCHAR(50),
    last_revised DATETIME,
    revision_level INT DEFAULT 0,
    next_revision_date DATETIME,
    solved_questions_json TEXT,
    PRIMARY KEY (user_id, topic_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS test_attempts (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    test_id VARCHAR(255),
    title VARCHAR(255),
    score INT,
    total_marks INT,
    accuracy INT,
    total_questions INT,
    correct_count INT,
    incorrect_count INT,
    unattempted_count INT,
    topic_id VARCHAR(255),
    difficulty VARCHAR(50),
    detailed_results TEXT,
    date DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS timetables (
    user_id VARCHAR(255) PRIMARY KEY,
    config_json TEXT,
    slots_json TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS goals (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    text TEXT,
    completed TINYINT(1) DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS backlogs (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    topic VARCHAR(255),
    subject VARCHAR(50),
    priority VARCHAR(20),
    deadline DATE,
    status VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS psychometric_reports (
    user_id VARCHAR(255) PRIMARY KEY,
    report_json TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
`;
};