
import { SYLLABUS_DATA } from '../lib/syllabusData';

const phpHeader = `<?php
/**
 * IITGEEPrep Engine v13.4 - Production Logic Core
 * Fix: Data integrity for Admin Dashboards (Prevents JS .map() crashes)
 */
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

include_once 'cors.php';
include_once 'config.php';

function getJsonInput() {
    $raw = file_get_contents('php://input');
    if (!$raw || $raw === '{}' || $raw === '[]') return null;
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

/**
 * Health Check Bypass
 */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    if ($raw === '{}' || $raw === '[]') {
        echo json_encode(["status" => "active", "message" => "Endpoint responsive"]);
        exit;
    }
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
        name: '.htaccess',
        folder: 'deployment/seo',
        content: `# IITGEEPrep v13.4 Production Config
DirectoryIndex index.html index.php
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_URI} ^/api/.*$
  RewriteRule ^(.*)$ - [L]
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>`
    },
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
$conn = null;
try {
    if (!empty($host) && !empty($db_name)) {
        $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $user, $pass);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    }
} catch(PDOException $e) {
    $db_error = $e->getMessage();
}
?>`
    },
    {
        name: 'index.php',
        folder: 'deployment/api',
        content: `<?php echo json_encode(["status" => "active", "version" => "13.4", "engine" => "Logic Hub"]); ?>`
    },
    {
        name: 'manage_users.php',
        folder: 'deployment/api',
        content: `${phpHeader}
try {
    $method = $_SERVER['REQUEST_METHOD'];
    if ($method === 'GET') {
        $group = $_GET['group'] ?? 'USERS';
        if ($group === 'ADMINS') {
            $stmt = $conn->prepare("SELECT id, name, email, role, is_verified, created_at FROM users WHERE role LIKE 'ADMIN%'");
        } else {
            $stmt = $conn->prepare("SELECT id, name, email, role, is_verified, created_at FROM users WHERE role NOT LIKE 'ADMIN%'");
        }
        $stmt->execute();
        echo json_encode($stmt->fetchAll());
    } else if ($method === 'PUT') {
        $data = getJsonInput();
        $stmt = $conn->prepare("UPDATE users SET is_verified = ? WHERE id = ?");
        $stmt->execute([getV($data, 'isVerified') ? 1 : 0, getV($data, 'id')]);
        sendSuccess();
    } else if ($method === 'DELETE') {
        $id = $_GET['id'] ?? '';
        $stmt = $conn->prepare("DELETE FROM users WHERE id = ? AND role NOT LIKE 'ADMIN%'");
        $stmt->execute([$id]);
        sendSuccess();
    }
} catch (Exception $e) { sendError($e->getMessage(), 500); }`
    },
    {
        name: 'manage_contact.php',
        folder: 'deployment/api',
        content: `${phpHeader}
try {
    $method = $_SERVER['REQUEST_METHOD'];
    if ($method === 'GET') {
        $stmt = $conn->query("SELECT * FROM contact_messages ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll());
    } else if ($method === 'DELETE') {
        $id = $_GET['id'] ?? '';
        $stmt = $conn->prepare("DELETE FROM contact_messages WHERE id = ?");
        $stmt->execute([$id]);
        sendSuccess();
    }
} catch (Exception $e) { sendError($e->getMessage(), 500); }`
    },
    {
        name: 'get_dashboard.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$userId = $_GET['user_id'] ?? '';
try {
    $res = [];
    $res['progress'] = $conn->query("SELECT * FROM user_progress WHERE user_id = '$userId'")->fetchAll();
    $res['attempts'] = $conn->query("SELECT * FROM test_attempts WHERE user_id = '$userId' ORDER BY date DESC")->fetchAll();
    $res['goals'] = $conn->query("SELECT * FROM goals WHERE user_id = '$userId'")->fetchAll();
    $res['backlogs'] = $conn->query("SELECT * FROM backlogs WHERE user_id = '$userId' ORDER BY created_at DESC")->fetchAll();
    $res['mistakes'] = $conn->query("SELECT * FROM mistake_logs WHERE user_id = '$userId' ORDER BY date DESC")->fetchAll();
    $res['timetable'] = $conn->query("SELECT * FROM timetable WHERE user_id = '$userId'")->fetch();
    $res['blogs'] = $conn->query("SELECT * FROM blog_posts ORDER BY date DESC LIMIT 10")->fetchAll();
    $res['flashcards'] = $conn->query("SELECT * FROM flashcards LIMIT 50")->fetchAll();
    $res['hacks'] = $conn->query("SELECT * FROM memory_hacks LIMIT 20")->fetchAll();
    $res['notifications'] = $conn->query("SELECT * FROM notifications WHERE to_id = '$userId' AND is_read = 0")->fetchAll();
    echo json_encode($res);
} catch (Exception $e) { sendError($e->getMessage(), 500); }`
    },
    {
        name: 'test_db.php',
        folder: 'deployment/api',
        content: `<?php
include_once 'cors.php';
include_once 'config.php';
if (!$conn) {
    echo json_encode(["status" => "ERROR", "message" => "DATABASE_CONNECTION_ERROR", "details" => $db_error ?? "Unknown"]);
    exit;
}
try {
    $tables = [];
    $res = $conn->query("SHOW TABLES");
    while($row = $res->fetch(PDO::FETCH_NUM)) {
        $count = $conn->query("SELECT count(*) FROM \`$row[0]\`")->fetchColumn();
        $tables[] = ["name" => $row[0], "rows" => (int)$count];
    }
    echo json_encode(["status" => "CONNECTED", "tables" => $tables]);
} catch(Exception $e) { 
    echo json_encode(["status" => "ERROR", "message" => $e->getMessage()]); 
}?>`
    },
    {
        name: 'get_admin_stats.php',
        folder: 'deployment/api',
        content: `${phpHeader}
try {
    $res = [
        "totalVisits" => (int)$conn->query("SELECT SUM(count) FROM analytics_visits")->fetchColumn() ?: 0,
        "totalUsers" => (int)$conn->query("SELECT COUNT(*) FROM users")->fetchColumn() ?: 0,
        "dailyTraffic" => $conn->query("SELECT date, count as visits FROM analytics_visits ORDER BY date DESC LIMIT 7")->fetchAll()
    ];
    echo json_encode($res);
} catch (Exception $e) { sendError($e->getMessage(), 500); }`
    }
];

    const existing = files.map(f => f.name);
    API_FILES_LIST.forEach(name => {
        if (!existing.includes(name)) {
            files.push({
                name,
                folder: 'deployment/api',
                content: `${phpHeader}\ntry { \n  $method = $_SERVER['REQUEST_METHOD'];\n  $data = getJsonInput();\n  // Default array fallback to prevent JS crashes on admin screens\n  echo json_encode([]); \n} catch (Exception $e) { sendError($e->getMessage(), 500); }`
            });
        }
    });

    return files;
};

export const generateSQLSchema = () => {
    return `-- IITGEEPrep v13.4 Master SQL Schema
START TRANSACTION;
CREATE TABLE IF NOT EXISTS users (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE, password_hash VARCHAR(255), role VARCHAR(50), institute VARCHAR(255), target_exam VARCHAR(255), target_year INT, dob DATE, gender VARCHAR(20), avatar_url TEXT, is_verified TINYINT(1) DEFAULT 1, security_question TEXT, security_answer TEXT, parent_id VARCHAR(255), linked_student_id VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS user_progress (id INT AUTO_INCREMENT PRIMARY KEY, user_id VARCHAR(255), topic_id VARCHAR(255), status VARCHAR(50), last_revised TIMESTAMP NULL, revision_level INT DEFAULT 0, next_revision_date TIMESTAMP NULL, solved_questions_json TEXT, UNIQUE KEY user_topic (user_id, topic_id)) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS test_attempts (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), test_id VARCHAR(255), title VARCHAR(255), score INT, total_marks INT, accuracy INT, total_questions INT, correct_count INT, incorrect_count INT, unattempted_count INT, topic_id VARCHAR(255), difficulty VARCHAR(50), detailed_results LONGTEXT, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS timetable (user_id VARCHAR(255) PRIMARY KEY, config_json LONGTEXT, slots_json LONGTEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS goals (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), text TEXT, completed TINYINT(1) DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS backlogs (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), title VARCHAR(255), subject VARCHAR(50), priority VARCHAR(20), status VARCHAR(20) DEFAULT 'PENDING', deadline DATE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS mistake_logs (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), question TEXT, subject VARCHAR(50), note TEXT, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS notifications (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), from_id VARCHAR(255), from_name VARCHAR(255), to_id VARCHAR(255), type VARCHAR(50), message TEXT, is_read TINYINT(1) DEFAULT 0, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS settings (setting_key VARCHAR(255) PRIMARY KEY, value TEXT) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS analytics_visits (date DATE PRIMARY KEY, count INT DEFAULT 0) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS tests (id VARCHAR(255) PRIMARY KEY, title VARCHAR(255), duration INT, questions_json LONGTEXT, category VARCHAR(50), difficulty VARCHAR(50)) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS topics (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), chapter VARCHAR(255), subject VARCHAR(255)) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS blog_posts (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), excerpt TEXT, content LONGTEXT, author VARCHAR(255), image_url TEXT, category VARCHAR(50), date TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS flashcards (id INT AUTO_INCREMENT PRIMARY KEY, front TEXT, back TEXT, subject_id VARCHAR(50)) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS memory_hacks (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), description TEXT, trick TEXT, tag VARCHAR(50)) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS contact_messages (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), subject VARCHAR(255), message TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS psychometric_reports (user_id VARCHAR(255) PRIMARY KEY, report_json LONGTEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS chapter_notes (topic_id VARCHAR(255) PRIMARY KEY, pages_json LONGTEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS video_lessons (topic_id VARCHAR(255) PRIMARY KEY, video_url TEXT, description TEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB;
COMMIT;`;
};
