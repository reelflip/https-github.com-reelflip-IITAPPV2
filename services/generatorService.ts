
import { SYLLABUS_DATA } from '../lib/syllabusData';

const phpHeader = `<?php
/**
 * IITGEEPrep Unified Sync Engine v17.1
 * PRODUCTION CORE - STRICT MYSQL PDO
 */
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once 'config.php';

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
    if (is_array($data) && !isset($data['status'])) {
        echo json_encode(array_merge(["status" => "success"], $data));
    } else {
        echo json_encode($data);
    }
    exit;
}
`;

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
    $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    $db_error = $e->getMessage();
}
?>`
    },
    {
        name: 'get_dashboard.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if(!$conn) sendError("DATABASE_OFFLINE", 500, $db_error);
$user_id = $_GET['user_id'] ?? null;
if(!$user_id) sendError("MISSING_USER_ID");

try {
    // 1. Progress
    $stmt = $conn->prepare("SELECT * FROM user_progress WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $progress = [];
    foreach($stmt->fetchAll() as $row) {
        $progress[] = [
            "topicId" => $row['topic_id'],
            "status" => $row['status'],
            "lastRevised" => $row['last_revised'],
            "revisionLevel" => (int)$row['revision_level'],
            "nextRevisionDate" => $row['next_revision_date'],
            "solvedQuestions" => $row['solved_questions_json'] ? json_decode($row['solved_questions_json']) : []
        ];
    }

    // 2. Attempts
    $stmt = $conn->prepare("SELECT * FROM test_attempts WHERE user_id = ? ORDER BY date DESC");
    $stmt->execute([$user_id]);
    $attempts = [];
    foreach($stmt->fetchAll() as $row) {
        $attempts[] = [
            "id" => $row['id'],
            "date" => $row['date'],
            "title" => $row['title'],
            "score" => (int)$row['score'],
            "totalMarks" => (int)$row['total_marks'],
            "accuracy" => (int)$row['accuracy'],
            "accuracy_percent" => (int)$row['accuracy'],
            "testId" => $row['test_id'],
            "totalQuestions" => (int)$row['total_questions'],
            "correctCount" => (int)$row['correct_count'],
            "incorrectCount" => (int)$row['incorrect_count'],
            "unattemptedCount" => (int)$row['unattempted_count'],
            "topicId" => $row['topic_id'],
            "difficulty" => $row['difficulty'],
            "detailedResults" => $row['detailed_results'] ? json_decode($row['detailed_results']) : []
        ];
    }

    // 3. Goals
    $stmt = $conn->prepare("SELECT id, text, completed FROM goals WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $goals = [];
    foreach($stmt->fetchAll() as $row) {
        $goals[] = ["id" => $row['id'], "text" => $row['text'], "completed" => (bool)$row['completed']];
    }

    // 4. Backlogs
    $stmt = $conn->prepare("SELECT * FROM backlogs WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $backlogs = $stmt->fetchAll();

    // 5. Timetable
    $stmt = $conn->prepare("SELECT config_json, slots_json FROM timetables WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $timetableRow = $stmt->fetch();

    // 6. Psychometric
    $stmt = $conn->prepare("SELECT report_json FROM psychometric_reports WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $psychRow = $stmt->fetch();

    sendSuccess([
        "progress" => $progress,
        "attempts" => $attempts,
        "goals" => $goals,
        "backlogs" => $backlogs,
        "timetable" => $timetableRow ? [
            "config" => json_decode($timetableRow['config_json']),
            "slots" => json_decode($timetableRow['slots_json'])
        ] : null,
        "psychometric" => $psychRow ? json_decode($psychRow['report_json']) : null
    ]);
} catch(Exception $e) { sendError($e->getMessage(), 500); }`
    },
    {
        name: 'save_attempt.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if(!$conn) sendError("DATABASE_OFFLINE", 500, $db_error);
$input = getJsonInput();
if(!$input || !isset($input->userId)) sendError("MISSING_DATA");

try {
    $sql = "INSERT INTO \`test_attempts\` (
        id, user_id, test_id, title, score, total_marks, accuracy, 
        total_questions, correct_count, incorrect_count, unattempted_count, 
        topic_id, difficulty, detailed_results, date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute([
        $input->id,
        $input->userId,
        $input->testId,
        $input->title,
        $input->score,
        $input->totalMarks,
        $input->accuracy_percent ?? ($input->accuracy ?? 0),
        $input->totalQuestions,
        $input->correctCount,
        $input->incorrectCount,
        $input->unattemptedCount,
        $input->topicId ?? null,
        $input->difficulty ?? null,
        isset($input->detailedResults) ? json_encode($input->detailedResults) : null,
        $input->date ?? date('Y-m-d H:i:s')
    ]);

    sendSuccess(["status" => "SAVED"]);
} catch(Exception $e) { sendError("PERSISTENCE_FAILURE", 500, $e->getMessage()); }`
    },
    {
        name: 'save_timetable.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if(!$conn) sendError("DATABASE_OFFLINE", 500, $db_error);
$input = getJsonInput();
if(!$input || !isset($input->userId)) sendError("MISSING_DATA");

try {
    $stmt = $conn->prepare("INSERT INTO timetables (user_id, config_json, slots_json) 
                            VALUES (?, ?, ?) 
                            ON DUPLICATE KEY UPDATE config_json = VALUES(config_json), slots_json = VALUES(slots_json)");
    $stmt->execute([
        $input->userId,
        json_encode($input->config),
        json_encode($input->slots)
    ]);
    sendSuccess();
} catch(Exception $e) { sendError($e->getMessage(), 500); }`
    },
    {
        name: 'save_psychometric.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if(!$conn) sendError("DATABASE_OFFLINE", 500, $db_error);
$input = getJsonInput();
if(!$input || !isset($input->user_id)) sendError("MISSING_DATA");

try {
    $stmt = $conn->prepare("INSERT INTO psychometric_reports (user_id, report_json) 
                            VALUES (?, ?) 
                            ON DUPLICATE KEY UPDATE report_json = VALUES(report_json)");
    $stmt->execute([ $input->user_id, json_encode($input->report) ]);
    sendSuccess();
} catch(Exception $e) { sendError($e->getMessage(), 500); }`
    },
    {
        name: 'manage_goals.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if(!$conn) sendError("DATABASE_OFFLINE", 500, $db_error);

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = getJsonInput();
        $stmt = $conn->prepare("INSERT INTO goals (id, user_id, text, completed) VALUES (?, ?, ?, ?) 
                                ON DUPLICATE KEY UPDATE completed = VALUES(completed)");
        $stmt->execute([$input->id, $input->userId, $input->text, $input->completed ? 1 : 0]);
        sendSuccess();
    }
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $id = $_GET['id'];
        $stmt = $conn->prepare("DELETE FROM goals WHERE id = ?");
        $stmt->execute([$id]);
        sendSuccess();
    }
} catch(Exception $e) { sendError($e->getMessage(), 500); }`
    }
];

    API_FILES_LIST.forEach(name => {
        if (!files.find(f => f.name === name)) {
            files.push({
                name,
                folder: 'deployment/api',
                content: `${phpHeader}\n// Standardized Handler for ${name}\nif(!$conn) sendError("DATABASE_OFFLINE", 500, $db_error);\n\n$input = getJsonInput();\nsendSuccess(["info" => "Endpoint Active", "method" => $_SERVER['REQUEST_METHOD']]);`
            });
        }
    });

    return files;
};

export const generateSQLSchema = () => {
    return `-- IITGEEPrep Master Schema v17.1
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) DEFAULT 'STUDENT',
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
    last_revised TIMESTAMP NULL,
    revision_level INT DEFAULT 0,
    next_revision_date TIMESTAMP NULL,
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

CREATE TABLE IF NOT EXISTS timetables (
    user_id VARCHAR(255) PRIMARY KEY,
    config_json LONGTEXT,
    slots_json LONGTEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS psychometric_reports (
    user_id VARCHAR(255) PRIMARY KEY,
    report_json LONGTEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS goals (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    text TEXT,
    completed TINYINT(1) DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS backlogs (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    topic VARCHAR(255),
    subject VARCHAR(50),
    priority VARCHAR(20),
    deadline DATE,
    status VARCHAR(20) DEFAULT 'PENDING',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;
};
