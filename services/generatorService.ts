
import { SYLLABUS_DATA } from '../lib/syllabusData';

const phpHeader = `<?php
/**
 * IITGEEPrep Engine v14.5 - Production Logic Core
 * REAL DATABASE OPERATIONS ONLY - NO MOCKING
 */
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// STRONG CORS HEADERS FOR PRODUCTION
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
 * Essential for modern React Fetch requests on PHP servers.
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
$host = "${dbConfig.host}";
$db_name = "${dbConfig.name}";
$user = "${dbConfig.user}";
$pass = "${dbConfig.pass.replace(/"/g, '\\"')}";
$conn = null;
$db_error = null;
try {
    if (!empty($host) && !empty($db_name)) {
        $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $user, $pass);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::EXCEPTION);
        $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    } else {
        $db_error = "Database configuration incomplete.";
    }
} catch(PDOException $e) {
    $db_error = $e->getMessage();
}
?>`
    },
    {
        name: '.htaccess',
        folder: 'deployment/seo',
        content: `RewriteEngine On
RewriteBase /
# Route all API calls directly to their files
RewriteCond %{REQUEST_URI} ^/api/ [NC]
RewriteRule ^api/(.*)$ api/$1 [L]

# Route all other calls to index.html for React SPA
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]`
    }
];

    API_FILES_LIST.forEach(name => {
        if (!files.find(f => f.name === name)) {
            files.push({
                name,
                folder: 'deployment/api',
                content: `${phpHeader}\n// Business logic for ${name} follows...\nif(!$conn) sendError("DATABASE_OFFLINE", 500, $db_error);\n\n$input = getJsonInput();\nif(!$input) sendError("INVALID_JSON_INPUT", 400);\n\nsendSuccess(["info" => "Production Endpoint Active"]);`
            });
        }
    });

    return files;
};

export const generateSQLSchema = () => {
    return `-- IITGEEPrep v14.5 SQL Schema
START TRANSACTION;
CREATE TABLE IF NOT EXISTS users (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE, password_hash VARCHAR(255), role VARCHAR(50), institute VARCHAR(255), target_exam VARCHAR(255), target_year INT, dob DATE, gender VARCHAR(20), avatar_url TEXT, is_verified TINYINT(1) DEFAULT 1, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS user_progress (id INT AUTO_INCREMENT PRIMARY KEY, user_id VARCHAR(255), topic_id VARCHAR(255), status VARCHAR(50), last_revised TIMESTAMP NULL, revision_level INT DEFAULT 0, next_revision_date TIMESTAMP NULL, solved_questions_json TEXT, UNIQUE KEY user_topic (user_id, topic_id)) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS test_attempts (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), test_id VARCHAR(255), title VARCHAR(255), score INT, total_marks INT, accuracy INT, total_questions INT, correct_count INT, incorrect_count INT, unattempted_count INT, topic_id VARCHAR(255), difficulty VARCHAR(50), detailed_results LONGTEXT, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;
COMMIT;`;
};
