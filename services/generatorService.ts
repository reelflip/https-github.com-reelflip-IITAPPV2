
import { SYLLABUS_DATA } from '../lib/syllabusData';

const phpHeader = `<?php
/**
 * IITGEEPrep Engine v13.0 - Ultimate Sync Core
 * Production Backend Deployment
 */
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

include_once 'cors.php';
include_once 'config.php';

function getJsonInput() {
    $raw = file_get_contents('php://input');
    if (!$raw || $raw === '{}') return null;
    $data = json_decode($raw);
    return (json_last_error() === JSON_ERROR_NONE) ? $data : null;
}

function getV($data, $p, $default = null) {
    if (!$data) return $default;
    if (isset($data->$p)) return $data->$p;
    $snake = strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $p));
    if (isset($data->$snake)) return $data->$snake;
    return $default;
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

export const getBackendFiles = (dbConfig: any) => [
    {
        name: 'cors.php',
        folder: 'deployment/api',
        content: `<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(0); }
header("Content-Type: application/json; charset=UTF-8");
?>`
    },
    {
        name: 'config.php',
        folder: 'deployment/api',
        content: `<?php
$host = "${dbConfig.host}";
$db_name = "${dbConfig.name}";
$user = "${dbConfig.user}";
$pass = "${dbConfig.pass.replace(/"/g, '\\"')}";
try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    http_response_code(500); 
    echo json_encode(["status" => "error", "message" => "DATABASE_CONNECTION_ERROR", "details" => $e.getMessage()]);
    exit;
}
?>`
    },
    {
        name: 'migrate_db.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$tables = [
    'users' => "(id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE, password_hash VARCHAR(255), role VARCHAR(50), institute VARCHAR(255), target_exam VARCHAR(255), target_year INT, dob DATE, gender VARCHAR(20), avatar_url TEXT, is_verified TINYINT(1) DEFAULT 1, security_question TEXT, security_answer TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'user_progress' => "(id INT AUTO_INCREMENT PRIMARY KEY, user_id VARCHAR(255), topic_id VARCHAR(255), status VARCHAR(50), last_revised TIMESTAMP NULL, revision_level INT DEFAULT 0, next_revision_date TIMESTAMP NULL, solved_questions_json TEXT, UNIQUE KEY user_topic (user_id, topic_id))",
    'test_attempts' => "(id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), test_id VARCHAR(255), title VARCHAR(255), score INT, total_marks INT, accuracy INT, total_questions INT, correct_count INT, incorrect_count INT, unattempted_count INT, topic_id VARCHAR(255), difficulty VARCHAR(50), detailed_results LONGTEXT, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'timetable' => "(user_id VARCHAR(255) PRIMARY KEY, config_json LONGTEXT, slots_json LONGTEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)",
    'goals' => "(id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), text TEXT, completed TINYINT(1) DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'backlogs' => "(id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), title VARCHAR(255), subject VARCHAR(50), priority VARCHAR(20), status VARCHAR(20) DEFAULT 'PENDING', deadline DATE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'mistake_logs' => "(id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), question TEXT, subject VARCHAR(50), note TEXT, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'notifications' => "(id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), from_id VARCHAR(255), from_name VARCHAR(255), to_id VARCHAR(255), type VARCHAR(50), message TEXT, is_read TINYINT(1) DEFAULT 0, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'settings' => "(setting_key VARCHAR(255) PRIMARY KEY, value TEXT)",
    'analytics_visits' => "(date DATE PRIMARY KEY, count INT DEFAULT 0)",
    'tests' => "(id VARCHAR(255) PRIMARY KEY, title VARCHAR(255), duration INT, questions_json LONGTEXT, category VARCHAR(50), difficulty VARCHAR(50))",
    'blog_posts' => "(id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), excerpt TEXT, content LONGTEXT, author VARCHAR(255), image_url TEXT, category VARCHAR(50), date TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'flashcards' => "(id INT AUTO_INCREMENT PRIMARY KEY, front TEXT, back TEXT, subject_id VARCHAR(50))",
    'memory_hacks' => "(id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), description TEXT, trick TEXT, tag VARCHAR(50))",
    'contact_messages' => "(id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), subject VARCHAR(255), message TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'psychometric_reports' => "(user_id VARCHAR(255) PRIMARY KEY, report_json LONGTEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)",
    'chapter_notes' => "(topic_id VARCHAR(255) PRIMARY KEY, pages_json LONGTEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)",
    'video_lessons' => "(topic_id VARCHAR(255) PRIMARY KEY, video_url TEXT, description TEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)"
];
try {
    foreach($tables as $name => $def) { $conn->exec("CREATE TABLE IF NOT EXISTS \`$name\` $def ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"); }
    echo json_encode(["status" => "success", "message" => "v13.0 Master Schema Synchronized"]);
} catch (Exception $e) { sendError($e->getMessage(), 500); }`
    },
    {
        name: 'save_attempt.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = getJsonInput();
if (!$data) sendError("Attempt data missing");
$userId = getV($data, 'userId');
if (!$userId) sendError("Unauthorized access denied");

try {
    $stmt = $conn->prepare("INSERT INTO test_attempts (id, user_id, test_id, title, score, total_marks, accuracy, total_questions, correct_count, incorrect_count, unattempted_count, topic_id, difficulty, detailed_results) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE score=VALUES(score), accuracy=VALUES(accuracy)");
    $stmt->execute([
        getV($data, 'id'), 
        $userId, 
        getV($data, 'testId'), 
        getV($data, 'title'), 
        getV($data, 'score'), 
        getV($data, 'totalMarks'), 
        getV($data, 'accuracy'), 
        getV($data, 'totalQuestions'), 
        getV($data, 'correctCount'), 
        getV($data, 'incorrectCount'), 
        getV($data, 'unattemptedCount'), 
        getV($data, 'topicId'), 
        getV($data, 'difficulty'), 
        json_encode(getV($data, 'detailedResults') ?? [])
    ]);
    sendSuccess();
} catch (Exception $e) { sendError($e->getMessage(), 500); }`
    },
    {
        name: 'get_dashboard.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$userId = $_GET['user_id'] ?? '';
if (!$userId) sendError("User verification required");

try {
    $res = [];
    
    $pStmt = $conn->prepare("SELECT * FROM user_progress WHERE user_id = ?");
    $pStmt->execute([$userId]);
    $res['progress'] = $pStmt->fetchAll();

    $aStmt = $conn->prepare("SELECT * FROM test_attempts WHERE user_id = ? ORDER BY date DESC");
    $aStmt->execute([$userId]);
    $res['attempts'] = $aStmt->fetchAll();

    $gStmt = $conn->prepare("SELECT * FROM goals WHERE user_id = ?");
    $gStmt->execute([$userId]);
    $res['goals'] = $gStmt->fetchAll();

    $bStmt = $conn->prepare("SELECT * FROM backlogs WHERE user_id = ? ORDER BY created_at DESC");
    $bStmt->execute([$userId]);
    $res['backlogs'] = $bStmt->fetchAll();

    $mStmt = $conn->prepare("SELECT * FROM mistake_logs WHERE user_id = ? ORDER BY date DESC");
    $mStmt->execute([$userId]);
    $res['mistakes'] = $mStmt->fetchAll();

    $tStmt = $conn->prepare("SELECT * FROM timetable WHERE user_id = ?");
    $tStmt->execute([$userId]);
    $res['timetable'] = $tStmt->fetch();

    $res['blogs'] = $conn->query("SELECT * FROM blog_posts ORDER BY date DESC LIMIT 10")->fetchAll();
    $res['flashcards'] = $conn->query("SELECT * FROM flashcards LIMIT 50")->fetchAll();
    $res['hacks'] = $conn->query("SELECT * FROM memory_hacks LIMIT 20")->fetchAll();
    
    $nStmt = $conn->prepare("SELECT * FROM notifications WHERE to_id = ? AND is_read = 0");
    $nStmt->execute([$userId]);
    $res['notifications'] = $nStmt->fetchAll();

    echo json_encode($res);
} catch (Exception $e) { sendError($e->getMessage(), 500); }`
    }
];

export const generateSQLSchema = () => {
    return `-- IITGEEPrep v13.0 Master SQL Schema
START TRANSACTION;
CREATE TABLE IF NOT EXISTS users (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE, password_hash VARCHAR(255), role VARCHAR(50), institute VARCHAR(255), target_exam VARCHAR(255), target_year INT, dob DATE, gender VARCHAR(20), avatar_url TEXT, is_verified TINYINT(1) DEFAULT 1, security_question TEXT, security_answer TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS user_progress (id INT AUTO_INCREMENT PRIMARY KEY, user_id VARCHAR(255), topic_id VARCHAR(255), status VARCHAR(50), last_revised TIMESTAMP NULL, revision_level INT DEFAULT 0, next_revision_date TIMESTAMP NULL, solved_questions_json TEXT, UNIQUE KEY user_topic (user_id, topic_id)) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS test_attempts (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), test_id VARCHAR(255), title VARCHAR(255), score INT, total_marks INT, accuracy INT, total_questions INT, correct_count INT, incorrect_count INT, unattempted_count INT, topic_id VARCHAR(255), difficulty VARCHAR(50), detailed_results LONGTEXT, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS timetable (user_id VARCHAR(255) PRIMARY KEY, config_json LONGTEXT, slots_json LONGTEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS goals (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), text TEXT, completed TINYINT(1) DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS backlogs (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), title VARCHAR(255), subject VARCHAR(50), priority VARCHAR(20), status VARCHAR(20) DEFAULT 'PENDING', deadline DATE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS mistake_logs (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), question TEXT, subject VARCHAR(50), note TEXT, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS settings (setting_key VARCHAR(255) PRIMARY KEY, value TEXT) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS tests (id VARCHAR(255) PRIMARY KEY, title VARCHAR(255), duration INT, questions_json LONGTEXT, category VARCHAR(50), difficulty VARCHAR(50)) ENGINE=InnoDB;
COMMIT;`;
};
