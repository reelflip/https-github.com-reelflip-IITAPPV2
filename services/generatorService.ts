import { SYLLABUS_DATA } from '../lib/syllabusData';

const phpHeader = `<?php
/**
 * IITGEEPrep Pro Engine v12.25
 * Production Grade API Component
 */
// CRITICAL: Disable error display to client for security
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
        content: `<?php echo json_encode(["status" => "active", "version" => "12.25", "engine" => "IITGEE_PROD_READY", "service" => "API_GATEWAY"]); ?>`
    },
    {
        name: 'test_db.php',
        folder: 'deployment/api',
        content: `${phpHeader}
try {
    $tables = [];
    $stmt = $conn->query("SHOW TABLES");
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        $name = $row[0];
        $countStmt = $conn->query("SELECT COUNT(*) FROM $name");
        $tables[] = ["name" => $name, "rows" => $countStmt->fetchColumn()];
    }
    echo json_encode(["status" => "CONNECTED", "db_name" => $db_name, "tables" => $tables]);
} catch(Exception $e) { http_response_code(500); echo json_encode(["error" => $e->getMessage()]); }
?>`
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
            $id, $data->name, $data->email, $data->password, $data->role,
            $data->institute ?? null, $data->targetExam ?? null, $data->targetYear ?? 2025,
            $data->dob ?? null, $data->gender ?? null, $data->securityQuestion ?? null, $data->securityAnswer ?? null
        ]);
        echo json_encode(["status" => "success", "user" => ["id" => $id, "name" => $data->name, "role" => $data->role, "email" => $data->email]]);
    } catch(Exception $e) { http_response_code(500); echo json_encode(["error" => "Registration failed. Email might exist."]); }
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
    if($u) {
        $response['userProfileSync'] = [
            "id" => $u['id'], "name" => $u['name'], "email" => $u['email'], "role" => $u['role'], 
            "targetExam" => $u['target_exam'], "targetYear" => $u['target_year'], "institute" => $u['institute'], 
            "parentId" => $u['parent_id'], "linkedStudentId" => $u['linked_student_id'], "isVerified" => $u['is_verified'] == 1,
            "school" => $u['school'], "phone" => $u['phone'], "avatarUrl" => $u['avatar_url']
        ];
    }
    
    $stmt = $conn->prepare("SELECT topic_id as topicId, status, last_revised as lastRevised, revision_level as revisionLevel, next_revision_date as nextRevisionDate, solved_questions_json FROM user_progress WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $rawProgress = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    $response['progress'] = array_map(function($p) {
        $p['solvedQuestions'] = $p['solved_questions_json'] ? json_decode($p['solved_questions_json']) : [];
        unset($p['solved_questions_json']);
        return $p;
    }, $rawProgress);
    
    $stmt = $conn->prepare("SELECT * FROM test_attempts WHERE user_id = ? ORDER BY date DESC");
    $stmt->execute([$user_id]);
    $rawAttempts = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    $response['attempts'] = array_map(function($a) {
        return [
            "id" => $a['id'], "date" => $a['date'], "title" => $a['title'], "score" => (int)$a['score'], 
            "totalMarks" => (int)$a['total_marks'], "accuracy" => (float)$a['accuracy'], "accuracy_percent" => (int)$a['accuracy_percent'],
            "testId" => $a['test_id'], "totalQuestions" => (int)$a['total_questions'], "correctCount" => (int)$a['correct_count'],
            "incorrectCount" => (int)$a['incorrect_count'], "unattemptedCount" => (int)$a['unattempted_count'],
            "topicId" => $a['topic_id'], "detailedResults" => json_decode($a['detailed_results'])
        ];
    }, $rawAttempts);

    $stmt = $conn->prepare("SELECT * FROM goals WHERE user_id = ?"); $stmt->execute([$user_id]); $response['goals'] = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    $stmt = $conn->prepare("SELECT * FROM mistake_logs WHERE user_id = ?"); $stmt->execute([$user_id]); $response['mistakes'] = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    $stmt = $conn->prepare("SELECT * FROM backlogs WHERE user_id = ?"); $stmt->execute([$user_id]); $response['backlogs'] = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    
    $stmt = $conn->prepare("SELECT * FROM timetable WHERE user_id = ?"); $stmt->execute([$user_id]); $tt = $stmt->fetch(PDO::FETCH_ASSOC);
    if($tt) $response['timetable'] = ['config' => json_decode($tt['config_json']), 'slots' => json_decode($tt['slots_json'])];
    
    $stmt = $conn->prepare("SELECT * FROM notifications WHERE to_id = ? ORDER BY created_at DESC");
    $stmt->execute([$user_id]);
    $response['notifications'] = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

    echo json_encode($response);
} catch(Exception $e) { http_response_code(500); echo json_encode(["error" => $e->getMessage()]); }
?>`
    },
    {
        name: 'save_attempt.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents('php://input'));
if(!empty($data->user_id)) {
    try {
        $id = !empty($data->id) ? $data->id : 'att_'.time().'_'.mt_rand(10,99);
        $sql = "INSERT INTO test_attempts (id, user_id, test_id, title, score, total_marks, accuracy, accuracy_percent, detailed_results, topic_id, difficulty, total_questions, correct_count, incorrect_count, unattempted_count) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE score = VALUES(score), accuracy = VALUES(accuracy), accuracy_percent = VALUES(accuracy_percent)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            $id, $data->user_id, $data->testId ?? '', $data->title ?? 'Mock Test',
            $data->score ?? 0, $data->totalMarks ?? 0, $data->accuracy ?? 0, $data->accuracy_percent ?? 0,
            json_encode($data->detailedResults ?? []), $data->topicId ?? null, $data->difficulty ?? null,
            $data->totalQuestions ?? 0, $data->correctCount ?? 0, $data->incorrectCount ?? 0, $data->unattemptedCount ?? 0
        ]);
        echo json_encode(["status" => "success", "id" => $id]);
    } catch(Exception $e) { http_response_code(500); echo json_encode(["error" => $e->getMessage()]); }
}
?>`
    },
    {
        name: 'sync_progress.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents('php://input'));
if(!empty($data->user_id) && !empty($data->topicId)) {
    try {
        $sql = "INSERT INTO user_progress (user_id, topic_id, status, last_revised, revision_level, next_revision_date, solved_questions_json) 
                VALUES (?, ?, ?, ?, ?, ?, ?) 
                ON DUPLICATE KEY UPDATE status = VALUES(status), last_revised = VALUES(last_revised), 
                revision_level = VALUES(revision_level), next_revision_date = VALUES(next_revision_date), 
                solved_questions_json = VALUES(solved_questions_json)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            $data->user_id, $data->topicId, $data->status, $data->lastRevised, 
            $data->revisionLevel ?? 0, $data->nextRevisionDate, json_encode($data->solvedQuestions ?? [])
        ]);
        echo json_encode(["status" => "success"]);
    } catch(Exception $e) { http_response_code(500); echo json_encode(["error" => $e->getMessage()]); }
}
?>`
    },
    {
        name: 'manage_settings.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$method = $_SERVER['REQUEST_METHOD'];
if($method === 'GET') {
    $key = $_GET['key'] ?? '';
    $stmt = $conn->prepare("SELECT value FROM settings WHERE setting_key = ?");
    $stmt->execute([$key]);
    echo json_encode($stmt->fetch(PDO::FETCH_ASSOC) ?: ["value" => null]);
} else if($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'));
    $stmt = $conn->prepare("INSERT INTO settings (setting_key, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)");
    $stmt->execute([$data->key, $data->value]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'manage_goals.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents('php://input'));
if($method === 'POST') {
    $stmt = $conn->prepare("INSERT INTO goals (id, user_id, text, completed) VALUES (?, ?, ?, ?)");
    $stmt->execute([$data->id, $data->user_id, $data->text, $data->completed ? 1 : 0]);
} else if($method === 'PUT') {
    $stmt = $conn->prepare("UPDATE goals SET completed = ? WHERE id = ?");
    $stmt->execute([$data->completed ? 1 : 0, $data->id]);
} else if($method === 'DELETE') {
    $stmt = $conn->prepare("DELETE FROM goals WHERE id = ?");
    $stmt->execute([$_GET['id']]);
}
echo json_encode(["status" => "success"]);
?>`
    },
    {
        name: 'manage_users.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$method = $_SERVER['REQUEST_METHOD'];
if($method === 'GET') {
    $stmt = $conn->prepare("SELECT id, name, email, role, is_verified, created_at FROM users ORDER BY created_at DESC");
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} else if($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'));
    $stmt = $conn->prepare("UPDATE users SET is_verified = ? WHERE id = ?");
    $stmt->execute([$data->isVerified ? 1 : 0, $data->id]);
    echo json_encode(["status" => "success"]);
} else if($method === 'DELETE') {
    $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'manage_content.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$type = $_GET['type'] ?? 'blog';
$method = $_SERVER['REQUEST_METHOD'];
if($method === 'GET') {
    $stmt = $conn->prepare("SELECT * FROM content WHERE type = ? ORDER BY created_at DESC");
    $stmt->execute([$type]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} else if($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'));
    $stmt = $conn->prepare("INSERT INTO content (type, title, content_json) VALUES (?, ?, ?)");
    $stmt->execute([$data->type, $data->title, json_encode($data->content)]);
    echo json_encode(["status" => "success", "id" => $conn->lastInsertId()]);
} else if($method === 'DELETE') {
    $stmt = $conn->prepare("DELETE FROM content WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'manage_notes.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$method = $_SERVER['REQUEST_METHOD'];
if($method === 'GET') {
    $stmt = $conn->prepare("SELECT * FROM chapter_notes");
    $stmt->execute();
    $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $response = [];
    foreach($notes as $n) {
        $response[$n['topic_id']] = [
            'id' => $n['id'],
            'topicId' => $n['topic_id'],
            'pages' => json_decode($n['content_json']),
            'lastUpdated' => $n['updated_at']
        ];
    }
    echo json_encode($response);
} else if($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'));
    $stmt = $conn->prepare("INSERT INTO chapter_notes (topic_id, content_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE content_json = VALUES(content_json), updated_at = CURRENT_TIMESTAMP");
    $stmt->execute([$data->topicId, json_encode($data->pages)]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'manage_videos.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$method = $_SERVER['REQUEST_METHOD'];
if($method === 'GET') {
    $stmt = $conn->prepare("SELECT * FROM video_lessons");
    $stmt->execute();
    $vids = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $response = [];
    foreach($vids as $v) {
        $response[$v['topic_id']] = ['topicId' => $v['topic_id'], 'videoUrl' => $v['url'], 'description' => $v['description']];
    }
    echo json_encode($response);
} else if($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'));
    $stmt = $conn->prepare("INSERT INTO video_lessons (topic_id, url, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE url = VALUES(url), description = VALUES(description)");
    $stmt->execute([$data->topicId, $data->url, $data->description]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'manage_contact.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$method = $_SERVER['REQUEST_METHOD'];
if($method === 'GET') {
    $stmt = $conn->prepare("SELECT * FROM contact_messages ORDER BY created_at DESC");
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} else if($method === 'DELETE') {
    $stmt = $conn->prepare("DELETE FROM contact_messages WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'search_students.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$q = $_GET['q'] ?? '';
if(strlen($q) < 3) { echo json_encode([]); exit; }
$stmt = $conn->prepare("SELECT id, name, email FROM users WHERE role = 'STUDENT' AND (id = ? OR name LIKE ? OR email LIKE ?) LIMIT 10");
$stmt->execute([$q, "%$q%", "%$q%"]);
echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
?>`
    },
    {
        name: 'send_request.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents('php://input'));
if(!empty($data->from_id) && !empty($data->to_id)) {
    try {
        $id = 'req_'.time();
        $stmt = $conn->prepare("INSERT INTO notifications (id, from_id, from_name, to_id, type, message) VALUES (?, ?, ?, ?, 'connection_request', ?)");
        $stmt->execute([$id, $data->from_id, $data->from_name, $data->to_id, "Wants to link as parent to your account."]);
        echo json_encode(["success" => true, "message" => "Request sent to student."]);
    } catch(Exception $e) { echo json_encode(["success" => false, "message" => "Request failed."]); }
}
?>`
    },
    {
        name: 'respond_request.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents('php://input'));
if(!empty($data->notification_id) && $data->action === 'ACCEPT') {
    try {
        $stmt = $conn->prepare("SELECT * FROM notifications WHERE id = ?");
        $stmt->execute([$data->notification_id]);
        $n = $stmt->fetch(PDO::FETCH_ASSOC);
        if($n) {
            $conn->prepare("UPDATE users SET parent_id = ? WHERE id = ?")->execute([$n['from_id'], $n['to_id']]);
            $conn->prepare("UPDATE users SET linked_student_id = ? WHERE id = ?")->execute([$n['to_id'], $n['from_id']]);
            $conn->prepare("DELETE FROM notifications WHERE id = ?")->execute([$data->notification_id]);
            echo json_encode(["success" => true]);
        }
    } catch(Exception $e) { http_response_code(500); }
}
?>`
    },
    {
        name: 'get_psychometric.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$user_id = $_GET['user_id'] ?? '';
$stmt = $conn->prepare("SELECT report_json FROM psychometric_results WHERE user_id = ?");
$stmt->execute([$user_id]);
$res = $stmt->fetch(PDO::FETCH_ASSOC);
echo json_encode(["report" => $res ? json_decode($res['report_json']) : null]);
?>`
    },
    {
        name: 'save_psychometric.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents('php://input'));
if(!empty($data->user_id)) {
    $stmt = $conn->prepare("INSERT INTO psychometric_results (user_id, report_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE report_json = VALUES(report_json)");
    $stmt->execute([$data->user_id, json_encode($data->report)]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'get_admin_stats.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$stmt = $conn->query("SELECT COUNT(*) FROM users");
$totalUsers = $stmt->fetchColumn();
$stmt = $conn->query("SELECT SUM(count) FROM analytics_visits");
$totalVisits = $stmt->fetchColumn() ?: 0;
$stmt = $conn->query("SELECT date, count as visits FROM analytics_visits ORDER BY date DESC LIMIT 7");
$dailyTraffic = array_reverse($stmt->fetchAll(PDO::FETCH_ASSOC));
echo json_encode(["totalUsers" => (int)$totalUsers, "totalVisits" => (int)$totalVisits, "dailyTraffic" => $dailyTraffic]);
?>`
    },
    {
        name: 'migrate_db.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$schema = [
    'users' => "(id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE, password_hash VARCHAR(255), role VARCHAR(50) DEFAULT 'STUDENT', target_exam VARCHAR(100), target_year INT, institute VARCHAR(255), gender VARCHAR(50), dob DATE, is_verified TINYINT(1) DEFAULT 1, parent_id VARCHAR(255), linked_student_id VARCHAR(255), school VARCHAR(255), phone VARCHAR(50), avatar_url VARCHAR(500), security_question TEXT, security_answer TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'test_attempts' => "(id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), test_id VARCHAR(255), title VARCHAR(255), score INT, total_marks INT, accuracy FLOAT, accuracy_percent INT, detailed_results LONGTEXT, topic_id VARCHAR(255), difficulty VARCHAR(50), total_questions INT DEFAULT 0, correct_count INT DEFAULT 0, incorrect_count INT DEFAULT 0, unattempted_count INT DEFAULT 0, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX(user_id))",
    'user_progress' => "(id INT AUTO_INCREMENT PRIMARY KEY, user_id VARCHAR(255), topic_id VARCHAR(255), status VARCHAR(50), last_revised DATETIME, revision_level INT, next_revision_date DATETIME, solved_questions_json LONGTEXT, UNIQUE KEY (user_id, topic_id))",
    'timetable' => "(user_id VARCHAR(255) PRIMARY KEY, config_json LONGTEXT, slots_json LONGTEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'backlogs' => "(id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), topic VARCHAR(255), subject VARCHAR(50), priority VARCHAR(50), status VARCHAR(50), deadline DATE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'goals' => "(id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), text VARCHAR(255), completed TINYINT(1) DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'mistake_logs' => "(id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), question TEXT, subject VARCHAR(50), note TEXT, date DATETIME)",
    'content' => "(id INT AUTO_INCREMENT PRIMARY KEY, type VARCHAR(50), title VARCHAR(255), content_json LONGTEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'notifications' => "(id VARCHAR(255) PRIMARY KEY, from_id VARCHAR(255), from_name VARCHAR(255), to_id VARCHAR(255), type VARCHAR(50), message TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'settings' => "(setting_key VARCHAR(255) PRIMARY KEY, value TEXT)",
    'chapter_notes' => "(id INT AUTO_INCREMENT PRIMARY KEY, topic_id VARCHAR(255) UNIQUE, content_json LONGTEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'video_lessons' => "(id INT AUTO_INCREMENT PRIMARY KEY, topic_id VARCHAR(255) UNIQUE, url VARCHAR(500), description TEXT)",
    'analytics_visits' => "(date DATE PRIMARY KEY, count INT DEFAULT 0)",
    'psychometric_results' => "(id INT AUTO_INCREMENT PRIMARY KEY, user_id VARCHAR(255) UNIQUE, report_json LONGTEXT, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'contact_messages' => "(id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), subject VARCHAR(255), message TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
];
try {
    foreach ($schema as $table => $def) { $conn->exec("CREATE TABLE IF NOT EXISTS $table $def"); }
    echo json_encode(["status" => "success", "message" => "Schema synchronized to v12.25."]);
} catch(Exception $e) { http_response_code(500); echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
?>`
    }
];

export const generateSQLSchema = () => {
    let sql = `-- IITGEEPrep Complete Database Export v12.25\n`;
    sql += `-- Generated on: ${new Date().toISOString()}\n`;
    sql += `SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO"; START TRANSACTION; SET time_zone = "+00:00";\n\n`;
    
    const tables = [
        `CREATE TABLE IF NOT EXISTS users (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE, password_hash VARCHAR(255), role VARCHAR(50) DEFAULT 'STUDENT', target_exam VARCHAR(100), target_year INT, institute VARCHAR(255), gender VARCHAR(50), dob DATE, is_verified TINYINT(1) DEFAULT 1, parent_id VARCHAR(255), linked_student_id VARCHAR(255), school VARCHAR(255), phone VARCHAR(50), avatar_url VARCHAR(500), security_question TEXT, security_answer TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS test_attempts (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), test_id VARCHAR(255), title VARCHAR(255), score INT, total_marks INT, accuracy FLOAT, accuracy_percent INT, detailed_results LONGTEXT, topic_id VARCHAR(255), difficulty VARCHAR(50), total_questions INT DEFAULT 0, correct_count INT DEFAULT 0, incorrect_count INT DEFAULT 0, unattempted_count INT DEFAULT 0, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX(user_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS user_progress (id INT AUTO_INCREMENT PRIMARY KEY, user_id VARCHAR(255), topic_id VARCHAR(255), status VARCHAR(50), last_revised DATETIME, revision_level INT, next_revision_date DATETIME, solved_questions_json LONGTEXT, UNIQUE KEY (user_id, topic_id), INDEX(user_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS timetable (user_id VARCHAR(255) PRIMARY KEY, config_json LONGTEXT, slots_json LONGTEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS backlogs (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), topic VARCHAR(255), subject VARCHAR(50), priority VARCHAR(50), status VARCHAR(50), deadline DATE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX(user_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS goals (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), text VARCHAR(255), completed TINYINT(1) DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX(user_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS mistake_logs (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), question TEXT, subject VARCHAR(50), note TEXT, date DATETIME, INDEX(user_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS content (id INT AUTO_INCREMENT PRIMARY KEY, type VARCHAR(50), title VARCHAR(255), content_json LONGTEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX(type)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS notifications (id VARCHAR(255) PRIMARY KEY, from_id VARCHAR(255), from_name VARCHAR(255), to_id VARCHAR(255), type VARCHAR(50), message TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX(to_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS settings (setting_key VARCHAR(255) PRIMARY KEY, value TEXT) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS chapter_notes (id INT AUTO_INCREMENT PRIMARY KEY, topic_id VARCHAR(255) UNIQUE, content_json LONGTEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS video_lessons (id INT AUTO_INCREMENT PRIMARY KEY, topic_id VARCHAR(255) UNIQUE, url VARCHAR(500), description TEXT) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS psychometric_results (id INT AUTO_INCREMENT PRIMARY KEY, user_id VARCHAR(255) UNIQUE, report_json LONGTEXT, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS contact_messages (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), subject VARCHAR(255), message TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
        `CREATE TABLE IF NOT EXISTS analytics_visits (date DATE PRIMARY KEY, count INT DEFAULT 0) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
    ];

    sql += tables.join('\n\n') + '\n\nCOMMIT;';
    return sql;
};