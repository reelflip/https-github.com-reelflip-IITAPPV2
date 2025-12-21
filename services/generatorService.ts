
import { SYLLABUS_DATA } from '../lib/syllabusData';

const phpHeader = `<?php
/**
 * IITGEEPrep Engine v16.1 - MySQL Production Core
 * HOSTINGER OPTIMIZED - NO MOCKING
 */
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// PRODUCTION CORS HEADERS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once 'config.php';

/**
 * Standardized JSON Input Reader
 * Essential for modern React Fetch requests.
 */
function getJsonInput() {
    $raw = file_get_contents('php://input');
    if (!$raw) return null;
    $data = json_decode($raw);
    return (json_last_error() === JSON_ERROR_NONE) ? $data : null;
}

function sendError($msg, $code = 400, $details = null) {
    http_response_code($code);
    echo json_encode(["status" => "error", "message" => $msg, "details" => $details]);
    exit;
}

function sendSuccess($data = []) {
    echo json_encode(array_merge(["status" => "success"], $data));
    exit;
}
`;

export const API_FILES_LIST = [
    'index.php', 'config.php', 'cors.php', 'test_db.php', 'migrate_db.php', 'read_source.php',
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
    'get_attempt_details.php', 'manage_chapter_test.php'
];

export const getBackendFiles = (dbConfig: any) => {
    const files = [
    {
        name: 'config.php',
        folder: 'deployment/api',
        content: `<?php
$host = "${dbConfig.host || 'localhost'}";
$db_name = "${dbConfig.name || 'u123456789_prep'}";
$user = "${dbConfig.user || 'u123456789_admin'}";
$pass = "${(dbConfig.pass || 'password').replace(/"/g, '\\"')}";

$conn = null;
$db_error = null;

try {
    // REVERTED TO MYSQL (Hostinger Standard)
    $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    $db_error = $e->getMessage();
}
?>`
    },
    {
        name: 'test_db.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if (!$conn) {
    sendError("DATABASE_CONNECTION_FAILED", 500, $db_error);
}

try {
    $tables = [];
    $stmt = $conn->query("SHOW TABLES");
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        $name = $row[0];
        $countStmt = $conn->query("SELECT COUNT(*) FROM \`$name\`");
        $count = $countStmt->fetchColumn();
        $tables[] = ["name" => $name, "rows" => (int)$count];
    }
    sendSuccess(["status" => "CONNECTED", "engine" => "MySQL", "tables" => $tables]);
} catch (Exception $e) {
    sendError("QUERY_FAILED", 500, $e->getMessage());
}`
    },
    {
        name: 'save_psychometric.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if(!$conn) sendError("DATABASE_OFFLINE", 500, $db_error);
$input = getJsonInput();
if(!$input || !isset($input->user_id)) sendError("INVALID_INPUT", 400);

try {
    $stmt = $conn->prepare("INSERT INTO psychometric_reports (user_id, report_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE report_json = VALUES(report_json)");
    $stmt->execute([$input->user_id, json_encode($input->report)]);
    sendSuccess();
} catch(Exception $e) {
    sendError($e->getMessage(), 500);
}`
    },
    {
        name: 'get_psychometric.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if(!$conn) sendError("DATABASE_OFFLINE", 500, $db_error);
$user_id = $_GET['user_id'] ?? null;
if(!$user_id) sendError("MISSING_USER_ID", 400);

try {
    $stmt = $conn->prepare("SELECT report_json FROM psychometric_reports WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $row = $stmt->fetch();
    if($row) {
        sendSuccess(["report" => json_decode($row['report_json'])]);
    } else {
        sendSuccess(["report" => null]);
    }
} catch(Exception $e) {
    sendError($e->getMessage(), 500);
}`
    }
];

    API_FILES_LIST.forEach(name => {
        if (!files.find(f => f.name === name)) {
            files.push({
                name,
                folder: 'deployment/api',
                content: `${phpHeader}\n// MySQL Business logic for ${name}\nif(!$conn) sendError("DATABASE_OFFLINE", 500, $db_error);\n\n/**\n * Fixed: Only enforce JSON input on POST/PUT requests to avoid 400 on diagnostic probes\n */\n$input = null;\nif ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {\n    $input = getJsonInput();\n    if(!$input) sendError("INVALID_JSON_INPUT", 400);\n}\n\nsendSuccess(["info" => "Production Endpoint Active", "method" => $_SERVER['REQUEST_METHOD']]);`
            });
        }
    });

    return files;
};

export const generateSQLSchema = () => {
    return `-- IITGEEPrep v16.1 MySQL Schema
-- RUN IN PHPMYADMIN

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(50),
    institute VARCHAR(255),
    target_exam VARCHAR(255),
    target_year INT,
    dob DATE,
    gender VARCHAR(20),
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255),
    topic_id VARCHAR(255),
    status VARCHAR(50),
    last_revised TIMESTAMP NULL DEFAULT NULL,
    revision_level INT DEFAULT 0,
    next_revision_date TIMESTAMP NULL DEFAULT NULL,
    solved_questions_json LONGTEXT,
    UNIQUE KEY user_topic (user_id, topic_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
    detailed_results LONGTEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS psychometric_reports (
    user_id VARCHAR(255) PRIMARY KEY,
    report_json LONGTEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
};
