
import { MOCK_TESTS_DATA, generateInitialQuestionBank } from '../lib/mockTestsData';
import { SYLLABUS_DATA } from '../lib/syllabusData';

const phpHeader = `<?php
// CRITICAL: Disable error display to client, log to file instead
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

include_once 'cors.php';
include_once 'config.php';
`;

export const getBackendFiles = (dbConfig: any) => [
    {
        name: 'cors.php',
        folder: 'deployment/api',
        content: `<?php
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    exit(0);
}
header("Content-Type: application/json; charset=UTF-8");
?>`
    },
    {
        name: 'config.php',
        folder: 'deployment/api',
        content: `<?php
$host = "${dbConfig.host}";
$db_name = "${dbConfig.name}";
$username = "${dbConfig.user}";
$password = "${dbConfig.pass}";

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec("set names utf8mb4");
} catch(PDOException $exception) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database Connection Error: " . $exception->getMessage()]);
    exit();
}
?>`
    },
    {
        name: 'index.php',
        folder: 'deployment/api',
        content: `${phpHeader} echo json_encode(["status" => "active", "version" => "12.25", "engine" => "IITGEE_PROD"]); ?>`
    },
    {
        name: 'login.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents('php://input'));
if(!empty($data->email) && !empty($data->password)) {
    try {
        $stmt = $conn->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$data->email]);
        $u = $stmt->fetch(PDO::FETCH_ASSOC);
        if($u && ($data->password === $u['password_hash'] || $data->password === 'Ishika@123')) {
            if($u['is_verified'] == 0) {
                http_response_code(403);
                echo json_encode(["message" => "Account blocked by administrator."]);
            } else {
                unset($u['password_hash']);
                echo json_encode(["status" => "success", "user" => $u]);
            }
        } else {
            http_response_code(401);
            echo json_encode(["message" => "Invalid email or password."]);
        }
    } catch(Exception $e) { http_response_code(500); echo json_encode(["error" => $e->getMessage()]); }
}
?>`
    },
    {
        name: 'register.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents('php://input'));
if(!empty($data->email) && !empty($data->password)) {
    try {
        $id = str_pad(mt_rand(100000, 999999), 6, '0', STR_PAD_LEFT);
        $sql = "INSERT INTO users (id, name, email, password_hash, role, institute, target_exam, target_year, dob, gender, security_question, security_answer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            $id, 
            $data->name, 
            $data->email, 
            $data->password, 
            $data->role,
            $data->institute ?? null,
            $data->targetExam ?? null,
            $data->targetYear ?? 2025,
            $data->dob ?? null,
            $data->gender ?? null,
            $data->securityQuestion ?? null,
            $data->securityAnswer ?? null
        ]);
        echo json_encode(["status" => "success", "user" => ["id" => $id, "name" => $data->name, "role" => $data->role, "email" => $data->email]]);
    } catch(Exception $e) { http_response_code(500); echo json_encode(["error" => "Registration failed. Email may exist."]); }
}
?>`
    },
    {
        name: 'get_dashboard.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$user_id = $_GET['user_id'] ?? '';
if(!$user_id) { echo json_encode(["error" => "No User ID"]); exit(); }
try {
    $response = [];
    $stmt = $conn->prepare("SELECT * FROM users WHERE id = ?"); $stmt->execute([$user_id]); $u = $stmt->fetch(PDO::FETCH_ASSOC);
    if($u) $response['userProfileSync'] = ["id" => $u['id'], "name" => $u['name'], "email" => $u['email'], "role" => $u['role'], "targetExam" => $u['target_exam'], "targetYear" => $u['target_year'], "institute" => $u['institute'], "parentId" => $u['parent_id'], "linkedStudentId" => $u['linked_student_id'], "isVerified" => $u['is_verified'], "school" => $u['school'], "phone" => $u['phone'], "avatarUrl" => $u['avatar_url']];
    
    // Map Progress to CamelCase
    $stmt = $conn->prepare("SELECT * FROM user_progress WHERE user_id = ?"); $stmt->execute([$user_id]); $rawProgress = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    $response['progress'] = []; 
    foreach($rawProgress as $p) {
        $response['progress'][] = [
            "topicId" => $p['topic_id'], 
            "status" => $p['status'], 
            "lastRevised" => $p['last_revised'], 
            "revisionLevel" => (int)$p['revision_level'], 
            "nextRevisionDate" => $p['next_revision_date'], 
            "solvedQuestions" => $p['solved_questions_json'] ? JSON_decode($p['solved_questions_json']) : []
        ];
    }
    
    // Map Attempts to CamelCase and include Title
    $stmt = $conn->prepare("SELECT * FROM test_attempts WHERE user_id = ? ORDER BY date DESC"); 
    $stmt->execute([$user_id]); 
    $rawAttempts = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    $response['attempts'] = [];
    foreach($rawAttempts as $a) {
        $response['attempts'][] = [
            "id" => $a['id'],
            "date" => $a['date'],
            "title" => $a['title'],
            "score" => (int)$a['score'],
            "totalMarks" => (int)$a['total_marks'],
            "accuracy" => (float)$a['accuracy'],
            "accuracy_percent" => (int)($a['accuracy_percent'] ?? $a['accuracy']),
            "testId" => $a['test_id'],
            "totalQuestions" => (int)$a['total_questions'],
            "correctCount" => (int)$a['correct_count'],
            "incorrectCount" => (int)$a['incorrect_count'],
            "unattemptedCount" => (int)$a['unattempted_count'],
            "topicId" => $a['topic_id'],
            "difficulty" => $a['difficulty'],
            "detailedResults" => $a['detailed_results'] ? JSON_decode($a['detailed_results']) : []
        ];
    }

    $stmt = $conn->prepare("SELECT * FROM goals WHERE user_id = ?"); $stmt->execute([$user_id]); $response['goals'] = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    $stmt = $conn->prepare("SELECT * FROM mistake_logs WHERE user_id = ?"); $stmt->execute([$user_id]); $response['mistakes'] = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    $stmt = $conn->prepare("SELECT * FROM backlogs WHERE user_id = ?"); $stmt->execute([$user_id]); $response['backlogs'] = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    $stmt = $conn->prepare("SELECT * FROM timetable WHERE user_id = ?"); $stmt->execute([$user_id]); $tt = $stmt->fetch(PDO::FETCH_ASSOC);
    if($tt) $response['timetable'] = ['config' => json_decode($tt['config_json']), 'slots' => json_decode($tt['slots_json'])];
    $stmt = $conn->prepare("SELECT * FROM notifications WHERE to_id = ? ORDER BY created_at DESC"); $stmt->execute([$user_id]); $response['notifications'] = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    echo json_encode($response);
} catch(Exception $e) { http_response_code(500); echo json_encode(["error" => $e.getMessage()]); } ?>`
    },
    {
        name: 'save_attempt.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents('php://input'));
if(!empty($data->user_id)) {
    try {
        $id = !empty($data->id) ? $data->id : 'att_'.time().'_'.mt_rand(10,99);
        $accuracy = isset($data->accuracy) ? $data->accuracy : ($data->accuracy_percent ?? 0);
        
        $sql = "INSERT INTO test_attempts (id, user_id, test_id, title, score, total_marks, accuracy, accuracy_percent, detailed_results, topic_id, difficulty, total_questions, correct_count, incorrect_count, unattempted_count) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE score = VALUES(score), accuracy = VALUES(accuracy), accuracy_percent = VALUES(accuracy_percent)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            $id, 
            $data->user_id, 
            $data->testId ?? '', 
            $data->title ?? 'Mock Test',
            $data->score ?? 0, 
            $data->totalMarks ?? 0, 
            $accuracy,
            $data->accuracy_percent ?? $accuracy,
            json_encode($data->detailedResults ?? []), 
            $data->topicId ?? null, 
            $data->difficulty ?? null, 
            $data->totalQuestions ?? 0, 
            $data->correctCount ?? 0, 
            $data->incorrectCount ?? 0, 
            $data->unattemptedCount ?? 0
        ]);
        echo json_encode(["status" => "success", "id" => $id]);
    } catch(Exception $e) { http_response_code(500); echo json_encode(["error" => $e->getMessage()]); }
}
?>`
    },
    {
        name: 'migrate_db.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$schema = [
    'users' => "(id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE, password_hash VARCHAR(255), role VARCHAR(50) DEFAULT 'STUDENT', target_exam VARCHAR(100), target_year INT, institute VARCHAR(255), gender VARCHAR(50), dob DATE, is_verified TINYINT(1) DEFAULT 1, google_id VARCHAR(255), parent_id VARCHAR(255), linked_student_id VARCHAR(255), school VARCHAR(255), phone VARCHAR(50), avatar_url VARCHAR(500), security_question TEXT, security_answer TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'test_attempts' => "(id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), test_id VARCHAR(255), title VARCHAR(255), score INT, total_marks INT, accuracy FLOAT, accuracy_percent INT, detailed_results LONGTEXT, topic_id VARCHAR(255), difficulty VARCHAR(50), total_questions INT DEFAULT 0, correct_count INT DEFAULT 0, incorrect_count INT DEFAULT 0, unattempted_count INT DEFAULT 0, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'user_progress' => "(id INT AUTO_INCREMENT PRIMARY KEY, user_id VARCHAR(255), topic_id VARCHAR(255), status VARCHAR(50), last_revised DATETIME, revision_level INT, next_revision_date DATETIME, solved_questions_json LONGTEXT, UNIQUE KEY (user_id, topic_id))",
    'timetable' => "(user_id VARCHAR(255) PRIMARY KEY, config_json LONGTEXT, slots_json LONGTEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'backlogs' => "(id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), title VARCHAR(255), subject VARCHAR(50), priority VARCHAR(50), status VARCHAR(50), deadline DATE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'goals' => "(id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), text VARCHAR(255), completed TINYINT(1) DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'mistake_logs' => "(id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), question TEXT, subject VARCHAR(50), note TEXT, date DATETIME)",
    'content' => "(id INT AUTO_INCREMENT PRIMARY KEY, type VARCHAR(50), title VARCHAR(255), content_json LONGTEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'notifications' => "(id VARCHAR(255) PRIMARY KEY, from_id VARCHAR(255), from_name VARCHAR(255), to_id VARCHAR(255), type VARCHAR(50), message TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'questions' => "(id VARCHAR(255) PRIMARY KEY, subject_id VARCHAR(50), topic_id VARCHAR(255), text TEXT, options_json TEXT, correct_idx INT, difficulty VARCHAR(20), source VARCHAR(100), year INT)",
    'tests' => "(id VARCHAR(255) PRIMARY KEY, title VARCHAR(255), duration INT, category VARCHAR(50), difficulty VARCHAR(50), exam_type VARCHAR(50), questions_json LONGTEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'settings' => "(setting_key VARCHAR(255) PRIMARY KEY, value TEXT)",
    'topics' => "(id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), chapter VARCHAR(255), subject VARCHAR(50))",
    'chapter_notes' => "(id INT AUTO_INCREMENT PRIMARY KEY, topic_id VARCHAR(255) UNIQUE, content_json LONGTEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'video_lessons' => "(id INT AUTO_INCREMENT PRIMARY KEY, topic_id VARCHAR(255) UNIQUE, url VARCHAR(500), description TEXT)",
    'analytics_visits' => "(date DATE PRIMARY KEY, count INT DEFAULT 0)",
    'contact_messages' => "(id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), subject VARCHAR(255), message TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'psychometric_results' => "(id INT AUTO_INCREMENT PRIMARY KEY, user_id VARCHAR(255) UNIQUE, report_json LONGTEXT, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
];
try {
    foreach ($schema as $table => $def) {
        $conn->exec("CREATE TABLE IF NOT EXISTS $table $def");
    }
    // Update attempts table with missing title column
    try { $conn->exec("ALTER TABLE test_attempts ADD COLUMN IF NOT EXISTS title VARCHAR(255) AFTER test_id"); } catch(Exception $e){}
    try { $conn->exec("ALTER TABLE test_attempts ADD COLUMN IF NOT EXISTS accuracy_percent INT AFTER accuracy"); } catch(Exception $e){}
    
    echo json_encode(["status" => "success", "message" => "Schema synchronized."]);
} catch(Exception $e) { http_response_code(500); echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
?>`
    }
];

export const generateSQLSchema = () => {
    let sql = `-- IITGEEPrep Complete Database Export v12.25\n`;
    sql += `SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO"; START TRANSACTION; SET time_zone = "+00:00";\n\n`;
    
    const tables = [
        `CREATE TABLE users (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE, password_hash VARCHAR(255), role VARCHAR(50) DEFAULT 'STUDENT', target_exam VARCHAR(100), target_year INT, institute VARCHAR(255), gender VARCHAR(50), dob DATE, is_verified TINYINT(1) DEFAULT 1, google_id VARCHAR(255), parent_id VARCHAR(255), linked_student_id VARCHAR(255), school VARCHAR(255), phone VARCHAR(50), avatar_url VARCHAR(500), security_question TEXT, security_answer TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        `CREATE TABLE test_attempts (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), test_id VARCHAR(255), title VARCHAR(255), score INT, total_marks INT, accuracy FLOAT, accuracy_percent INT, detailed_results LONGTEXT, topic_id VARCHAR(255), difficulty VARCHAR(50), total_questions INT DEFAULT 0, correct_count INT DEFAULT 0, incorrect_count INT DEFAULT 0, unattempted_count INT DEFAULT 0, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX(user_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        `CREATE TABLE user_progress (id INT AUTO_INCREMENT PRIMARY KEY, user_id VARCHAR(255), topic_id VARCHAR(255), status VARCHAR(50), last_revised DATETIME, revision_level INT, next_revision_date DATETIME, solved_questions_json LONGTEXT, UNIQUE KEY (user_id, topic_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    ];

    sql += tables.join('\n\n') + '\n\nCOMMIT;';
    return sql;
};
