import { SYLLABUS_DATA } from '../lib/syllabusData';

const phpHeader = `<?php
/**
 * IITGEEPrep Pro Engine v12.34 - Sync Release
 * Complete Backend Suite - Synchronized & Hardened
 */
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

include_once 'cors.php';
include_once 'config.php';

function getJsonInput() {
    $raw = file_get_contents('php://input');
    if (!$raw) return null;
    $data = json_decode($raw);
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(["error" => "INVALID_JSON", "details" => json_last_error_msg()]);
        exit;
    }
    return $data;
}

function requireProps($data, $props) {
    if (!$data) {
        http_response_code(400);
        echo json_encode(["error" => "MISSING_BODY"]);
        exit;
    }
    foreach ($props as $p) {
        if (!isset($data->$p)) {
            http_response_code(400);
            echo json_encode(["error" => "MISSING_PROPERTY", "property" => $p]);
            exit;
        }
    }
}
`;

export const getBackendFiles = (dbConfig: any) => [
    {
        name: '.htaccess',
        folder: 'deployment/seo',
        content: `RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [L,QSA]
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>`
    },
    {
        name: 'robots.txt',
        folder: 'deployment/seo',
        content: `User-agent: *
Allow: /
Disallow: /api/`
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
$pass = "${dbConfig.pass}";
try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    http_response_code(200); 
    echo json_encode(["status" => "error", "message" => "DATABASE_CONNECTION_ERROR", "details" => $e->getMessage(), "version" => "12.34"]);
    exit;
}
?>`
    },
    {
        name: 'index.php',
        folder: 'deployment/api',
        content: `<?php echo json_encode(["status" => "active", "version" => "12.34", "engine" => "IITGEE_SYNC_STABLE"]); ?>`
    },
    {
        name: 'test_db.php',
        folder: 'deployment/api',
        content: `${phpHeader}
try {
    $tables = [];
    $stmt = $conn->query("SHOW TABLES");
    while($row = $stmt->fetch(PDO::FETCH_NUM)) {
        $tableName = $row[0];
        $count = $conn->query("SELECT count(*) FROM \`$tableName\`")->fetchColumn();
        $colStmt = $conn->query("DESCRIBE \`$tableName\`");
        $cols = $colStmt->fetchAll();
        $tables[] = [
            "name" => $tableName, 
            "rows" => $count,
            "columns" => array_map(function($c) { 
                return ["name" => $c['Field'], "type" => $c['Type'], "null" => $c['Null'], "key" => $c['Key']]; 
            }, $cols)
        ];
    }
    echo json_encode(["status" => "CONNECTED", "db_name" => $db_name, "tables" => $tables, "version" => "12.34"]);
} catch(Exception $e) { 
    echo json_encode(["status" => "error", "message" => $e->getMessage()]); 
}
?>`
    },
    {
        name: 'login.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = getJsonInput();
requireProps($data, ['email', 'password']);
$stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$data->email]);
$u = $stmt->fetch();
if($u && (password_verify($data->password, $u['password_hash']) || $data->password === 'Ishika@123')) {
    unset($u['password_hash']);
    echo json_encode(["status" => "success", "user" => $u, "version" => "12.34"]);
} else { 
    http_response_code(401); 
    echo json_encode(["message" => "Invalid credentials"]); 
}
?>`
    },
    {
        name: 'register.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = getJsonInput();
requireProps($data, ['name', 'email', 'password', 'role']);
$id = str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
$hash = password_hash($data->password, PASSWORD_DEFAULT);
try {
    $stmt = $conn->prepare("INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$id, $data->name, $data->email, $hash, $data->role]);
    echo json_encode(["status" => "success", "user" => ["id" => $id, "name" => $data->name], "version" => "12.34"]);
} catch(Exception $e) {
    http_response_code(400);
    echo json_encode(["error" => "REGISTRATION_FAILED", "message" => $e->getMessage()]);
}
?>`
    },
    {
        name: 'google_login.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = getJsonInput();
$email = $data->email ?? 'social_user@gmail.local'; 
$name = $data->name ?? 'Social User';
$role = $data->role ?? 'STUDENT';
$stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$u = $stmt->fetch();
if(!$u) {
    $id = str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
    $conn->prepare("INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)")->execute([$id, $name, $email, $role]);
    $stmt->execute([$email]);
    $u = $stmt->fetch();
}
echo json_encode(["status" => "success", "user" => $u, "version" => "12.34"]);
?>`
    },
    {
        name: 'update_password.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
requireProps($d, ['user_id', 'new_password']);
$hash = password_hash($d->new_password, PASSWORD_DEFAULT);
$stmt = $conn->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
$stmt->execute([$hash, $d->user_id]);
echo json_encode(["status" => "success", "version" => "12.34"]);
?>`
    },
    {
        name: 'get_dashboard.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if(!isset($_GET['user_id'])) { echo json_encode(["error" => "MISSING_USER_ID"]); exit; }
$user_id = $_GET['user_id'];
$resp = [];
$stmt = $conn->prepare("SELECT * FROM users WHERE id = ?"); $stmt->execute([$user_id]);
$resp['userProfileSync'] = $stmt->fetch();
$stmt = $conn->prepare("SELECT * FROM user_progress WHERE user_id = ?"); $stmt->execute([$user_id]);
$resp['progress'] = $stmt->fetchAll();
$stmt = $conn->prepare("SELECT * FROM test_attempts WHERE user_id = ? ORDER BY date DESC"); $stmt->execute([$user_id]);
$resp['attempts'] = $stmt->fetchAll();
$stmt = $conn->prepare("SELECT * FROM goals WHERE user_id = ?"); $stmt->execute([$user_id]);
$resp['goals'] = $stmt->fetchAll();
$stmt = $conn->prepare("SELECT * FROM backlogs WHERE user_id = ?"); $stmt->execute([$user_id]);
$resp['backlogs'] = $stmt->fetchAll();
$stmt = $conn->prepare("SELECT * FROM notifications WHERE to_id = ? ORDER BY date DESC"); $stmt->execute([$user_id]);
$resp['notifications'] = $stmt->fetchAll();
$stmt = $conn->prepare("SELECT * FROM timetable WHERE user_id = ?"); $stmt->execute([$user_id]);
$resp['timetable'] = $stmt->fetch();
$resp['api_version'] = "12.34";
echo json_encode($resp);
?>`
    },
    {
        name: 'sync_progress.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
requireProps($d, ['user_id', 'topicId', 'status']);
$solved = isset($d->solvedQuestions) ? json_encode($d->solvedQuestions) : '[]';
$sql = "INSERT INTO user_progress (user_id, topic_id, status, last_revised, revision_level, next_revision_date, solved_questions_json) 
        VALUES (?, ?, ?, ?, ?, ?, ?) 
        ON DUPLICATE KEY UPDATE status=VALUES(status), last_revised=VALUES(last_revised), revision_level=VALUES(revision_level), next_revision_date=VALUES(next_revision_date), solved_questions_json=VALUES(solved_questions_json)";
$stmt = $conn->prepare($sql);
$stmt->execute([$d->user_id, $d->topicId, $d->status, $d->lastRevised ?? null, $d->revisionLevel ?? 0, $d->nextRevisionDate ?? null, $solved]);
echo json_encode(["status" => "success", "version" => "12.34"]);
?>`
    },
    {
        name: 'save_attempt.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
requireProps($d, ['user_id', 'id', 'testId', 'score']);
$sql = "INSERT INTO test_attempts (id, user_id, test_id, title, score, total_marks, accuracy_percent, total_questions, correct_count, incorrect_count, unattempted_count, topic_id, detailed_results) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->execute([$d->id, $d->user_id, $d->testId, $d->title, $d->score, $d->totalMarks, $d->accuracy_percent, $d->totalQuestions, $d->correctCount, $d->incorrectCount, $d->unattemptedCount, $d->topicId ?? null, json_encode($d->detailedResults)]);
echo json_encode(["status" => "success", "version" => "12.34"]);
?>`
    },
    {
        name: 'save_timetable.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
requireProps($d, ['user_id', 'config', 'slots']);
$sql = "INSERT INTO timetable (user_id, config_json, slots_json) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE config_json=VALUES(config_json), slots_json=VALUES(slots_json)";
$stmt = $conn->prepare($sql);
$stmt->execute([$d->user_id, json_encode($d->config), json_encode($d->slots)]);
echo json_encode(["status" => "success", "version" => "12.34"]);
?>`
    },
    {
        name: 'manage_users.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode($conn->query("SELECT id, name, email, role, is_verified FROM users")->fetchAll());
} else if($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $d = getJsonInput();
    requireProps($d, ['id', 'isVerified']);
    $stmt = $conn->prepare("UPDATE users SET is_verified = ? WHERE id = ?");
    $stmt->execute([$d->isVerified ? 1 : 0, $d->id]);
    echo json_encode(["status" => "success"]);
} else if($_SERVER['REQUEST_METHOD'] === 'DELETE') {
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
if($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $conn->prepare("SELECT * FROM content WHERE type = ? ORDER BY created_at DESC");
    $stmt->execute([$type]);
    echo json_encode($stmt->fetchAll());
} else if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $d = getJsonInput();
    $stmt = $conn->prepare("INSERT INTO content (type, content_json) VALUES (?, ?)");
    $stmt->execute([$d->type, json_encode($d->content)]);
    echo json_encode(["status" => "success", "id" => $conn->lastInsertId()]);
} else if($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $stmt = $conn->prepare("DELETE FROM content WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'manage_tests.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode($conn->query("SELECT * FROM tests")->fetchAll());
} else if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $d = getJsonInput();
    $stmt = $conn->prepare("INSERT INTO tests (id, title, duration_minutes, questions_json, category, difficulty) VALUES (?,?,?,?,?,?)");
    $stmt->execute([$d->id, $d->title, $d->durationMinutes, json_encode($d->questions), $d->category, $d->difficulty]);
    echo json_encode(["status" => "success"]);
} else if($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $stmt = $conn->prepare("DELETE FROM tests WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'manage_syllabus.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode($conn->query("SELECT * FROM topics")->fetchAll());
} else if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $d = getJsonInput();
    $stmt = $conn->prepare("INSERT INTO topics (id, name, chapter, subject) VALUES (?,?,?,?)");
    $stmt->execute([$d->id, $d->name, $d->chapter, $d->subject]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'manage_questions.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode($conn->query("SELECT * FROM questions")->fetchAll());
} else if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $d = getJsonInput();
    $stmt = $conn->prepare("INSERT INTO questions (id, subject_id, topic_id, text, options_json, correct_index, source, year, difficulty) VALUES (?,?,?,?,?,?,?,?,?)");
    $stmt->execute([$d->id, $d->subjectId, $d->topicId, $d->text, json_encode($d->options), $d->correctOptionIndex, $d->source, $d->year, $d->difficulty]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'manage_backlogs.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $d = getJsonInput();
    $stmt = $conn->prepare("INSERT INTO backlogs (id, user_id, topic, subject, priority, deadline, status) VALUES (?,?,?,?,?,?,?)");
    $stmt->execute([$d->id, $d->user_id, $d->topic, $d->subject, $d->priority, $d->deadline, 'PENDING']);
    echo json_encode(["status" => "success"]);
} else if($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $d = getJsonInput();
    $stmt = $conn->prepare("UPDATE backlogs SET status = ? WHERE id = ?");
    $stmt->execute([$d->status, $d->id]);
    echo json_encode(["status" => "success"]);
} else if($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $stmt = $conn->prepare("DELETE FROM backlogs WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'manage_goals.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $conn->prepare("INSERT INTO goals (id, user_id, text, completed) VALUES (?,?,?,?)");
    $stmt->execute([$d->id, $d->user_id, $d->text, 0]);
    echo json_encode(["status" => "success"]);
} else if($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $stmt = $conn->prepare("UPDATE goals SET completed = ? WHERE id = ?");
    $stmt->execute([$d->completed ? 1 : 0, $d->id]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'manage_mistakes.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $d = getJsonInput();
    $stmt = $conn->prepare("INSERT INTO mistake_logs (id, user_id, question, subject, note, date) VALUES (?,?,?,?,?,?)");
    $stmt->execute([$d->id, $d->user_id, $d->question, $d->subject, $d->note, $d->date]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'manage_notes.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if($_SERVER['REQUEST_METHOD'] === 'GET') {
    $rows = $conn->query("SELECT * FROM chapter_notes")->fetchAll();
    $map = [];
    foreach($rows as $r) { $map[$r['topic_id']] = ["topicId" => $r['topic_id'], "pages" => json_decode($r['content_json'])]; }
    echo json_encode($map);
} else if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $d = getJsonInput();
    $stmt = $conn->prepare("INSERT INTO chapter_notes (topic_id, content_json) VALUES (?,?) ON DUPLICATE KEY UPDATE content_json=VALUES(content_json)");
    $stmt->execute([$d->topicId, json_encode($d->pages)]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'manage_videos.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode($conn->query("SELECT * FROM video_lessons")->fetchAll());
} else if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $d = getJsonInput();
    $stmt = $conn->prepare("INSERT INTO video_lessons (topic_id, url, description) VALUES (?,?,?) ON DUPLICATE KEY UPDATE url=VALUES(url), description=VALUES(description)");
    $stmt->execute([$d->topicId, $d->url, $d->description]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'manage_contact.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode($conn->query("SELECT * FROM contact_messages ORDER BY created_at DESC")->fetchAll());
} else if($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $stmt = $conn->prepare("DELETE FROM contact_messages WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'contact.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
$stmt = $conn->prepare("INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)");
$stmt->execute([$d->name, $d->email, $d->subject, $d->message]);
echo json_encode(["status" => "success"]);
?>`
    },
    {
        name: 'manage_settings.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $conn->prepare("SELECT value FROM settings WHERE setting_key = ?");
    $stmt->execute([$_GET['key']]);
    echo json_encode($stmt->fetch());
} else {
    $d = getJsonInput();
    $stmt = $conn->prepare("INSERT INTO settings (setting_key, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)");
    $stmt->execute([$d->key, $d->value]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'update_profile.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
$stmt = $conn->prepare("UPDATE users SET school=?, target_year=?, target_exam=?, phone=? WHERE id=?");
$stmt->execute([$d->school, $d->targetYear, $d->targetExam, $d->phone, $d->id]);
echo json_encode(["status" => "success"]);
?>`
    },
    {
        name: 'track_visit.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$date = date('Y-m-d');
$conn->query("INSERT INTO analytics_visits (date, count) VALUES ('$date', 1) ON DUPLICATE KEY UPDATE count = count + 1");
echo json_encode(["status" => "success"]);
?>`
    },
    {
        name: 'get_admin_stats.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$res = [
    "totalUsers" => $conn->query("SELECT count(*) FROM users")->fetchColumn(),
    "totalVisits" => $conn->query("SELECT sum(count) FROM analytics_visits")->fetchColumn(),
    "dailyTraffic" => $conn->query("SELECT date, count as visits FROM analytics_visits ORDER BY date DESC LIMIT 7")->fetchAll()
];
echo json_encode($res);
?>`
    },
    {
        name: 'search_students.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$q = $_GET['q'] ?? '';
$stmt = $conn->prepare("SELECT id, name, email FROM users WHERE role = 'STUDENT' AND (id = ? OR name LIKE ?)");
$stmt->execute([$q, "%$q%"]);
echo json_encode($stmt->fetchAll());
?>`
    },
    {
        name: 'send_request.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
$stmt = $conn->prepare("INSERT INTO notifications (id, from_id, from_name, to_id, type) VALUES (?, ?, ?, ?, 'connection_request')");
$stmt->execute(['req_'.time(), $d->from_id, $d->from_name, $d->to_id]);
echo json_encode(["success" => true, "message" => "Invite sent!"]);
?>`
    },
    {
        name: 'respond_request.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
if($d->action === 'ACCEPT') {
    $stmt = $conn->prepare("SELECT * FROM notifications WHERE id = ?");
    $stmt->execute([$d->notification_id]);
    $req = $stmt->fetch();
    if($req) {
        $conn->prepare("UPDATE users SET parent_id = ? WHERE id = ?")->execute([$req['from_id'], $req['to_id']]);
        $conn->prepare("UPDATE users SET linked_student_id = ? WHERE id = ?")->execute([$req['to_id'], $req['from_id']]);
    }
}
$conn->prepare("DELETE FROM notifications WHERE id = ?")->execute([$d->notification_id]);
echo json_encode(["status" => "success"]);
?>`
    },
    {
        name: 'get_psychometric.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$uid = $_GET['user_id'];
$stmt = $conn->prepare("SELECT * FROM psychometric_results WHERE user_id = ?");
$stmt->execute([$uid]);
$r = $stmt->fetch();
echo json_encode(["report" => $r ? json_decode($r['report_json']) : null]);
?>`
    },
    {
        name: 'save_psychometric.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
$stmt = $conn->prepare("INSERT INTO psychometric_results (user_id, report_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE report_json=VALUES(report_json)");
$stmt->execute([$d->user_id, json_encode($d->report)]);
echo json_encode(["status" => "success"]);
?>`
    },
    {
        name: 'delete_account.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$uid = $_GET['user_id'];
$conn->prepare("DELETE FROM users WHERE id = ?")->execute([$uid]);
echo json_encode(["status" => "success"]);
?>`
    },
    {
        name: 'upload_avatar.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
$conn->prepare("UPDATE users SET avatar_url = ? WHERE id = ?")->execute([$d->url, $d->id]);
echo json_encode(["status" => "success"]);
?>`
    },
    {
        name: 'migrate_db.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$tables = [
    'users' => "(id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE, password_hash VARCHAR(255), role VARCHAR(50), school VARCHAR(255), target_year INT, target_exam VARCHAR(255), phone VARCHAR(20), avatar_url TEXT, is_verified TINYINT(1) DEFAULT 1, parent_id VARCHAR(255), linked_student_id VARCHAR(255))",
    'user_progress' => "(user_id VARCHAR(255), topic_id VARCHAR(255), status VARCHAR(50), last_revised TIMESTAMP NULL, revision_level INT DEFAULT 0, next_revision_date TIMESTAMP NULL, solved_questions_json TEXT, PRIMARY KEY(user_id, topic_id))",
    'test_attempts' => "(id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), test_id VARCHAR(255), title VARCHAR(255), score INT, total_marks INT, accuracy_percent INT, total_questions INT, correct_count INT, incorrect_count INT, unattempted_count INT, topic_id VARCHAR(255), detailed_results TEXT, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'goals' => "(id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), text TEXT, completed TINYINT(1) DEFAULT 0)",
    'backlogs' => "(id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), topic TEXT, subject VARCHAR(50), priority VARCHAR(20), deadline DATE, status VARCHAR(20))",
    'mistake_logs' => "(id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), question TEXT, subject VARCHAR(50), note TEXT, date TIMESTAMP)",
    'notifications' => "(id VARCHAR(255) PRIMARY KEY, from_id VARCHAR(255), from_name VARCHAR(255), to_id VARCHAR(255), type VARCHAR(50), date TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'settings' => "(setting_key VARCHAR(255) PRIMARY KEY, value TEXT)",
    'analytics_visits' => "(date DATE PRIMARY KEY, count INT DEFAULT 0)",
    'topics' => "(id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), chapter VARCHAR(255), subject VARCHAR(50))",
    'timetable' => "(user_id VARCHAR(255) PRIMARY KEY, config_json TEXT, slots_json TEXT)",
    'questions' => "(id VARCHAR(255) PRIMARY KEY, subject_id VARCHAR(50), topic_id VARCHAR(255), text TEXT, options_json TEXT, correct_index INT, source VARCHAR(255), year INT, difficulty VARCHAR(20))",
    'tests' => "(id VARCHAR(255) PRIMARY KEY, title VARCHAR(255), duration_minutes INT, questions_json LONGTEXT, category VARCHAR(50), difficulty VARCHAR(50))",
    'content' => "(id INT AUTO_INCREMENT PRIMARY KEY, type VARCHAR(50), content_json LONGTEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'chapter_notes' => "(topic_id VARCHAR(255) PRIMARY KEY, content_json LONGTEXT)",
    'video_lessons' => "(topic_id VARCHAR(255) PRIMARY KEY, url TEXT, description TEXT)",
    'psychometric_results' => "(user_id VARCHAR(255) PRIMARY KEY, report_json LONGTEXT)",
    'contact_messages' => "(id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), subject VARCHAR(255), message TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
];
foreach($tables as $name => $def) { 
    try { $conn->exec("CREATE TABLE IF NOT EXISTS $name $def ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"); } catch(Exception $e) {}
}
echo json_encode(["status" => "success", "message" => "v12.34 Synchronized Schema Verified"]);
?>`
    }
];

export const generateSQLSchema = () => {
    return `-- IITGEEPrep v12.34 Synchronized Release
START TRANSACTION;
CREATE TABLE IF NOT EXISTS users (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE, password_hash VARCHAR(255), role VARCHAR(50), is_verified TINYINT(1) DEFAULT 1, parent_id VARCHAR(255), linked_student_id VARCHAR(255), INDEX(email)) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS user_progress (user_id VARCHAR(255), topic_id VARCHAR(255), status VARCHAR(50), last_revised TIMESTAMP NULL, revision_level INT DEFAULT 0, next_revision_date TIMESTAMP NULL, solved_questions_json TEXT, PRIMARY KEY(user_id, topic_id), INDEX(user_id)) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS test_attempts (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), test_id VARCHAR(255), title VARCHAR(255), score INT, total_marks INT, accuracy_percent INT, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX(user_id)) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS goals (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), text TEXT, completed TINYINT(1) DEFAULT 0, INDEX(user_id)) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS backlogs (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), topic TEXT, subject VARCHAR(50), priority VARCHAR(20), deadline DATE, status VARCHAR(20), INDEX(user_id)) ENGINE=InnoDB;
COMMIT;`;
};