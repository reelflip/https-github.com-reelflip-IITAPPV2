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
    'get_attempt_details.php', 'manage_chapter_test.php'
];

const phpHeader = `<?php
/**
 * IITGEEPrep Unified Sync Engine v19.0
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
    return [
    {
        name: '.htaccess',
        folder: 'deployment',
        content: `RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ api/index.php [L]`
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
    },
    {
        name: 'get_dashboard.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$user_id = $_GET['user_id'] ?? null;
if(!$user_id) sendError("MISSING_USER_ID");

try {
    $data = [
        'progress' => [],
        'attempts' => [],
        'goals' => [],
        'backlogs' => [],
        'timetable' => null,
        'psychometric' => null
    ];
    
    // Progress
    $stmt = $conn->prepare("SELECT * FROM user_progress WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $data['progress'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Attempts
    $stmt = $conn->prepare("SELECT * FROM test_attempts WHERE user_id = ? ORDER BY date DESC");
    $stmt->execute([$user_id]);
    $data['attempts'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Goals
    $stmt = $conn->prepare("SELECT * FROM goals WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $data['goals'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Backlogs
    $stmt = $conn->prepare("SELECT * FROM backlogs WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $data['backlogs'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Timetable
    $stmt = $conn->prepare("SELECT * FROM timetables WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $tt = $stmt->fetch(PDO::FETCH_ASSOC);
    if($tt) {
        $data['timetable'] = ["config" => json_decode($tt['config_json']), "slots" => json_decode($tt['slots_json'])];
    }

    // Psychometric
    $stmt = $conn->prepare("SELECT report_json FROM psychometric_reports WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $psych = $stmt->fetch(PDO::FETCH_ASSOC);
    if($psych) $data['psychometric'] = json_decode($psych['report_json']);

    sendSuccess($data);
} catch(Exception $e) { sendError("FETCH_FAILED: " . $e->getMessage()); }`
    },
    {
        name: 'manage_goals.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$method = $_SERVER['REQUEST_METHOD'];
$input = getJsonInput();

try {
    if ($method === 'POST') {
        $stmt = $conn->prepare("INSERT INTO goals (id, user_id, text, completed) VALUES (?, ?, ?, ?)");
        $stmt->execute([$input->id, $input->userId, $input->text, $input->completed ? 1 : 0]);
        sendSuccess();
    }
    if ($method === 'PUT') {
        $stmt = $conn->prepare("UPDATE goals SET completed = ? WHERE id = ? AND user_id = ?");
        $stmt->execute([$input->completed ? 1 : 0, $input->id, $input->userId]);
        sendSuccess();
    }
    if ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        $stmt = $conn->prepare("DELETE FROM goals WHERE id = ?");
        $stmt->execute([$id]);
        sendSuccess();
    }
} catch(Exception $e) { sendError($e->getMessage()); }`
    },
    {
        name: 'manage_users.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $group = $_GET['group'] ?? 'USERS';
        $roleFilter = ($group === 'ADMINS') ? "role LIKE 'ADMIN%'" : "role NOT LIKE 'ADMIN%'";
        $stmt = $conn->prepare("SELECT id, name, email, role, is_verified as isVerified, created_at FROM users WHERE $roleFilter");
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($results ?: []);
        exit;
    }

    if ($method === 'PUT') {
        $input = getJsonInput();
        if(!isset($input->id)) sendError("ID_REQUIRED");
        $stmt = $conn->prepare("UPDATE users SET is_verified = ? WHERE id = ?");
        $stmt->execute([$input->isVerified ? 1 : 0, $input->id]);
        sendSuccess();
    }

    if ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if(!$id) sendError("ID_REQUIRED");
        $stmt = $conn->prepare("DELETE FROM users WHERE id = ? AND role NOT LIKE 'ADMIN%'");
        $stmt->execute([$id]);
        sendSuccess();
    }
} catch (Exception $e) { sendError($e->getMessage()); }`
    },
    {
        name: 'sync_progress.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$input = getJsonInput();
if(!isset($input->userId) || !isset($input->topicId)) sendError("INVALID_PAYLOAD");
$sql = "INSERT INTO user_progress (user_id, topic_id, status, last_revised, revision_level, next_revision_date, solved_questions_json) 
        VALUES (?, ?, ?, ?, ?, ?, ?) 
        ON DUPLICATE KEY UPDATE status=VALUES(status), last_revised=VALUES(last_revised), revision_level=VALUES(revision_level), next_revision_date=VALUES(next_revision_date), solved_questions_json=VALUES(solved_questions_json)";
$stmt = $conn->prepare($sql);
$stmt->execute([
    $input->userId, $input->topicId, $input->status, 
    $input->lastRevised, $input->revisionLevel, $input->nextRevisionDate,
    json_encode($input->solvedQuestions ?? [])
]);
sendSuccess();`
    }
    ];
};

export const generateSQLSchema = () => {
    return `
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(50),
    is_verified TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE user_progress (
    user_id VARCHAR(255),
    topic_id VARCHAR(255),
    status VARCHAR(50),
    last_revised DATETIME,
    revision_level INT,
    next_revision_date DATETIME,
    solved_questions_json TEXT,
    PRIMARY KEY (user_id, topic_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE test_attempts (
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

CREATE TABLE timetables (
    user_id VARCHAR(255) PRIMARY KEY,
    config_json TEXT,
    slots_json TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE goals (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    text TEXT,
    completed TINYINT(1),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE backlogs (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    topic VARCHAR(255),
    subject VARCHAR(50),
    priority VARCHAR(20),
    deadline DATE,
    status VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE psychometric_reports (
    user_id VARCHAR(255) PRIMARY KEY,
    report_json TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
`;
};