
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
    if (!$raw) return null;
    $data = json_decode($raw);
    return (json_last_error() === JSON_ERROR_NONE) ? $data : null;
}

function getV($data, $p) {
    if (!$data) return null;
    if (isset($data->$p)) return $data->$p;
    $snake = strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $p));
    if (isset($data->$snake)) return $data->$snake;
    return null;
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
    http_response_code(200); 
    echo json_encode(["status" => "error", "message" => "DATABASE_CONNECTION_ERROR", "details" => $e->getMessage()]);
    exit;
}
?>`
    },
    {
        name: 'index.php',
        folder: 'deployment/api',
        content: `<?php echo json_encode(["status" => "active", "version" => "13.0", "engine" => "Ultimate Sync Core"]); ?>`
    },
    {
        name: 'test_db.php',
        folder: 'deployment/api',
        content: `${phpHeader}
try {
    $tables = [];
    $res = $conn->query("SHOW TABLES");
    while($row = $res->fetch(PDO::FETCH_NUM)) {
        $count = $conn->query("SELECT count(*) FROM \`$row[0]\`")->fetchColumn();
        $tables[] = ["name" => $row[0], "rows" => (int)$count];
    }
    echo json_encode(["status" => "CONNECTED", "tables" => $tables]);
} catch(Exception $e) { echo json_encode(["status" => "ERROR", "message" => $e->getMessage()]); }`
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
foreach($tables as $name => $def) { $conn->exec("CREATE TABLE IF NOT EXISTS \`$name\` $def ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"); }
echo json_encode(["status" => "success", "message" => "v13.0 Full Master Schema Verified"]);`
    },
    {
        name: 'read_source.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$file = $_GET['file'] ?? '';
if (file_exists($file)) { echo json_encode(["source" => file_get_contents($file)]); } 
else { echo json_encode(["error" => "Not found"]); }`
    },
    {
        name: 'login.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = getJsonInput();
$stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([getV($data, 'email')]);
$user = $stmt->fetch();
if ($user && password_verify(getV($data, 'password'), $user['password_hash'])) {
    unset($user['password_hash']);
    echo json_encode(["status" => "success", "user" => $user]);
} else { http_response_code(401); echo json_encode(["status" => "error", "message" => "Invalid credentials"]); }`
    },
    {
        name: 'register.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = getJsonInput();
$id = 'std_' . uniqid();
$hash = password_hash(getV($data, 'password'), PASSWORD_BCRYPT);
$stmt = $conn->prepare("INSERT INTO users (id, name, email, password_hash, role, institute, target_exam, target_year, dob, gender, security_question, security_answer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
try {
    $stmt->execute([$id, getV($data, 'name'), getV($data, 'email'), $hash, getV($data, 'role'), getV($data, 'institute'), getV($data, 'targetExam'), getV($data, 'targetYear'), getV($data, 'dob'), getV($data, 'gender'), getV($data, 'securityQuestion'), getV($data, 'securityAnswer')]);
    echo json_encode(["status" => "success", "user_id" => $id]);
} catch(Exception $e) { http_response_code(400); echo json_encode(["status" => "error", "message" => $e->getMessage()]); }`
    },
    {
        name: 'get_dashboard.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$userId = $_GET['user_id'] ?? '';
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
echo json_encode($res);`
    },
    {
        name: 'sync_progress.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = getJsonInput();
$userId = getV($data, 'userId');
$stmt = $conn->prepare("INSERT INTO user_progress (user_id, topic_id, status, last_revised, revision_level, next_revision_date, solved_questions_json) 
    VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status=VALUES(status), last_revised=VALUES(last_revised), 
    revision_level=VALUES(revision_level), next_revision_date=VALUES(next_revision_date), solved_questions_json=VALUES(solved_questions_json)");
$stmt->execute([$userId, getV($data, 'topicId'), getV($data, 'status'), getV($data, 'lastRevised'), getV($data, 'revisionLevel'), getV($data, 'nextRevisionDate'), json_encode(getV($data, 'solvedQuestions') ?? [])]);
echo json_encode(["status" => "success"]);`
    },
    {
        name: 'save_attempt.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = getJsonInput();
$stmt = $conn->prepare("INSERT INTO test_attempts (id, user_id, test_id, title, score, total_marks, accuracy, total_questions, correct_count, incorrect_count, unattempted_count, topic_id, difficulty, detailed_results) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->execute([getV($data, 'id'), getV($data, 'userId'), getV($data, 'testId'), getV($data, 'title'), getV($data, 'score'), getV($data, 'totalMarks'), getV($data, 'accuracy'), getV($data, 'totalQuestions'), getV($data, 'correctCount'), getV($data, 'incorrectCount'), getV($data, 'unattemptedCount'), getV($data, 'topicId'), getV($data, 'difficulty'), json_encode(getV($data, 'detailedResults') ?? [])]);
echo json_encode(["status" => "success"]);`
    },
    {
        name: 'save_timetable.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = getJsonInput();
$stmt = $conn->prepare("INSERT INTO timetable (user_id, config_json, slots_json) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE config_json = VALUES(config_json), slots_json = VALUES(slots_json)");
$stmt->execute([getV($data, 'userId'), json_encode(getV($data, 'config')), json_encode(getV($data, 'slots'))]);
echo json_encode(["status" => "success"]);`
    },
    {
        name: 'manage_users.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') {
    $group = $_GET['group'] ?? 'USERS';
    $sql = $group === 'ADMINS' ? "SELECT * FROM users WHERE role LIKE 'ADMIN%'" : "SELECT * FROM users WHERE role NOT LIKE 'ADMIN%'";
    echo json_encode($conn->query($sql)->fetchAll());
} else if ($method === 'PUT') {
    $data = getJsonInput();
    $conn->prepare("UPDATE users SET is_verified = ? WHERE id = ?")->execute([getV($data, 'isVerified') ? 1 : 0, getV($data, 'id')]);
    echo json_encode(["status" => "success"]);
} else if ($method === 'DELETE') {
    $conn->prepare("DELETE FROM users WHERE id = ?")->execute([$_GET['id']]);
    echo json_encode(["status" => "success"]);
}`
    },
    {
        name: 'manage_content.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$method = $_SERVER['REQUEST_METHOD'];
$data = getJsonInput();
if ($method === 'POST') {
    $type = $_GET['type'] ?? '';
    if ($type === 'flashcard') { $conn->prepare("INSERT INTO flashcards (front, back, subject_id) VALUES (?, ?, ?)")->execute([getV($data, 'front'), getV($data, 'back'), getV($data, 'subjectId')]); }
    else if ($type === 'hack') { $conn->prepare("INSERT INTO memory_hacks (title, description, trick, tag) VALUES (?, ?, ?, ?)")->execute([getV($data, 'title'), getV($data, 'description'), getV($data, 'trick'), getV($data, 'tag')]); }
    else if ($type === 'blog') { $conn->prepare("INSERT INTO blog_posts (title, excerpt, content, author, image_url, category) VALUES (?, ?, ?, ?, ?, ?)")->execute([getV($data, 'title'), getV($data, 'excerpt'), getV($data, 'content'), getV($data, 'author'), getV($data, 'imageUrl'), getV($data, 'category')]); }
    echo json_encode(["status" => "success"]);
} else if ($method === 'DELETE') {
    $type = $_GET['type']; $id = $_GET['id'];
    $table = $type === 'flashcard' ? 'flashcards' : ($type === 'hack' ? 'memory_hacks' : 'blog_posts');
    $conn->prepare("DELETE FROM $table WHERE id = ?")->execute([$id]);
    echo json_encode(["status" => "success"]);
}`
    },
    {
        name: 'manage_tests.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') {
    $tests = $conn->query("SELECT * FROM tests")->fetchAll();
    foreach($tests as &$t) { $t['questions'] = json_decode($t['questions_json']); }
    echo json_encode($tests);
} else if ($method === 'POST') {
    $data = getJsonInput();
    $stmt = $conn->prepare("INSERT INTO tests (id, title, duration, questions_json, category, difficulty) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE title=VALUES(title), duration=VALUES(duration), questions_json=VALUES(questions_json)");
    $stmt->execute([getV($data, 'id'), getV($data, 'title'), getV($data, 'durationMinutes'), json_encode(getV($data, 'questions')), getV($data, 'category'), getV($data, 'difficulty')]);
    echo json_encode(["status" => "success"]);
} else if ($method === 'DELETE') {
    $conn->prepare("DELETE FROM tests WHERE id = ?")->execute([$_GET['id']]);
    echo json_encode(["status" => "success"]);
}`
    },
    {
        name: 'manage_syllabus.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$method = $_SERVER['REQUEST_METHOD'];
$data = getJsonInput();
if ($method === 'GET') { echo json_encode($conn->query("SELECT * FROM topics")->fetchAll()); }
else if ($method === 'POST') {
    $id = 'top_' . uniqid();
    $conn->prepare("INSERT INTO topics (id, name, chapter, subject) VALUES (?, ?, ?, ?)")->execute([$id, getV($data, 'name'), getV($data, 'chapter'), getV($data, 'subject')]);
    echo json_encode(["status" => "success", "id" => $id]);
} else if ($method === 'DELETE') {
    $conn->prepare("DELETE FROM topics WHERE id = ?")->execute([$_GET['id']]);
    echo json_encode(["status" => "success"]);
}`
    },
    {
        name: 'manage_questions.php',
        folder: 'deployment/api',
        content: `${phpHeader}
echo json_encode(["status" => "active", "msg" => "Question Bank Integrated via Tests JSON"]);`
    },
    {
        name: 'manage_backlogs.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$method = $_SERVER['REQUEST_METHOD'];
$data = getJsonInput();
if ($method === 'POST') {
    $id = 'bl_' . uniqid();
    $stmt = $conn->prepare("INSERT INTO backlogs (id, user_id, title, subject, priority, status, deadline) VALUES (?, ?, ?, ?, ?, 'PENDING', ?)");
    $stmt->execute([$id, getV($data, 'userId'), getV($data, 'topic'), getV($data, 'subject'), getV($data, 'priority'), getV($data, 'deadline')]);
    echo json_encode(["status" => "success", "id" => $id]);
} else if ($method === 'PUT') {
    $conn->prepare("UPDATE backlogs SET status = 'COMPLETED' WHERE id = ?")->execute([getV($data, 'id')]);
    echo json_encode(["status" => "success"]);
} else if ($method === 'DELETE') {
    $conn->prepare("DELETE FROM backlogs WHERE id = ?")->execute([$_GET['id']]);
    echo json_encode(["status" => "success"]);
}`
    },
    {
        name: 'manage_goals.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$method = $_SERVER['REQUEST_METHOD'];
$data = getJsonInput();
if ($method === 'POST') {
    $id = 'goal_' . uniqid();
    $conn->prepare("INSERT INTO goals (id, user_id, text, completed) VALUES (?, ?, ?, 0)")->execute([$id, getV($data, 'userId'), getV($data, 'text')]);
    echo json_encode(["status" => "success", "id" => $id]);
} else if ($method === 'PUT') {
    $conn->prepare("UPDATE goals SET completed = 1 - completed WHERE id = ?")->execute([getV($data, 'id')]);
    echo json_encode(["status" => "success"]);
}`
    },
    {
        name: 'manage_mistakes.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$method = $_SERVER['REQUEST_METHOD'];
$data = getJsonInput();
if ($method === 'POST') {
    $id = 'err_' . uniqid();
    $conn->prepare("INSERT INTO mistake_logs (id, user_id, question, subject, note) VALUES (?, ?, ?, ?, ?)")->execute([$id, getV($data, 'userId'), getV($data, 'question'), getV($data, 'subject'), getV($data, 'note')]);
    echo json_encode(["status" => "success", "id" => $id]);
} else if ($method === 'GET') {
    echo json_encode($conn->query("SELECT * FROM mistake_logs WHERE user_id = '".$_GET['user_id']."'")->fetchAll());
}`
    },
    {
        name: 'manage_notes.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$method = $_SERVER['REQUEST_METHOD'];
$data = getJsonInput();
if ($method === 'GET') {
    $row = $conn->prepare("SELECT pages_json FROM chapter_notes WHERE topic_id = ?");
    $row->execute([$_GET['topic_id']]);
    echo json_encode(["pages" => json_decode($row->fetchColumn())]);
} else if ($method === 'POST') {
    $stmt = $conn->prepare("INSERT INTO chapter_notes (topic_id, pages_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE pages_json = VALUES(pages_json)");
    $stmt->execute([getV($data, 'topicId'), json_encode(getV($data, 'pages'))]);
    echo json_encode(["status" => "success"]);
}`
    },
    {
        name: 'manage_videos.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$method = $_SERVER['REQUEST_METHOD'];
$data = getJsonInput();
if ($method === 'POST') {
    $stmt = $conn->prepare("INSERT INTO video_lessons (topic_id, video_url, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE video_url=VALUES(video_url), description=VALUES(description)");
    $stmt->execute([getV($data, 'topicId'), getV($data, 'url'), getV($data, 'description')]);
    echo json_encode(["status" => "success"]);
} else if ($method === 'GET') {
    echo json_encode($conn->query("SELECT * FROM video_lessons")->fetchAll());
}`
    },
    {
        name: 'manage_contact.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') { echo json_encode($conn->query("SELECT * FROM contact_messages ORDER BY created_at DESC")->fetchAll()); }
else if ($method === 'DELETE') { $conn->prepare("DELETE FROM contact_messages WHERE id = ?")->execute([$_GET['id']]); echo json_encode(["status" => "success"]); }`
    },
    {
        name: 'contact.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = getJsonInput();
$stmt = $conn->prepare("INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)");
$stmt->execute([getV($data, 'name'), getV($data, 'email'), getV($data, 'subject'), getV($data, 'message')]);
echo json_encode(["status" => "success"]);`
    },
    {
        name: 'manage_settings.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') {
    $stmt = $conn->prepare("SELECT value FROM settings WHERE setting_key = ?");
    $stmt->execute([$_GET['key']]);
    echo json_encode(["value" => $stmt->fetchColumn()]);
} else if ($method === 'POST') {
    $data = getJsonInput();
    $stmt = $conn->prepare("INSERT INTO settings (setting_key, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)");
    $stmt->execute([getV($data, 'key'), getV($data, 'value')]);
    echo json_encode(["status" => "success"]);
}`
    },
    {
        name: 'update_profile.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = getJsonInput();
$stmt = $conn->prepare("UPDATE users SET school=?, target_year=?, target_exam=?, phone=? WHERE id=?");
$stmt->execute([getV($data, 'school'), getV($data, 'targetYear'), getV($data, 'targetExam'), getV($data, 'phone'), getV($data, 'id')]);
echo json_encode(["status" => "success"]);`
    },
    {
        name: 'track_visit.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$today = date('Y-m-d');
$conn->exec("INSERT INTO analytics_visits (date, count) VALUES ('$today', 1) ON DUPLICATE KEY UPDATE count = count + 1");
echo json_encode(["status" => "tracked"]);`
    },
    {
        name: 'get_admin_stats.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$res = [];
$res['totalVisits'] = $conn->query("SELECT SUM(count) FROM analytics_visits")->fetchColumn();
$res['totalUsers'] = $conn->query("SELECT count(*) FROM users")->fetchColumn();
$res['dailyTraffic'] = $conn->query("SELECT date, count as visits FROM analytics_visits ORDER BY date DESC LIMIT 7")->fetchAll();
echo json_encode($res);`
    },
    {
        name: 'search_students.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$q = $_GET['q'] ?? '';
$stmt = $conn->prepare("SELECT id, name FROM users WHERE role='STUDENT' AND (id = ? OR name LIKE ?)");
$stmt->execute([$q, "%$q%"]);
echo json_encode($stmt->fetchAll());`
    },
    {
        name: 'send_request.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = getJsonInput();
$id = 'not_' . uniqid();
$stmt = $conn->prepare("INSERT INTO notifications (id, from_id, from_name, to_id, type, message) VALUES (?, ?, ?, ?, 'connection_request', ?)");
$stmt->execute([$id, getV($data, 'parentId'), getV($data, 'parentName'), getV($data, 'studentId'), "wants to link as your guardian."]);
echo json_encode(["status" => "success"]);`
    },
    {
        name: 'respond_request.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = getJsonInput();
$notId = getV($data, 'notificationId');
$action = getV($data, 'action');
if ($action === 'ACCEPT') {
    $not = $conn->query("SELECT from_id, to_id FROM notifications WHERE id='$notId'")->fetch();
    $conn->prepare("UPDATE users SET parent_id=? WHERE id=?")->execute([$not['from_id'], $not['to_id']]);
    $conn->prepare("UPDATE users SET linked_student_id=? WHERE id=?")->execute([$not['to_id'], $not['from_id']]);
}
$conn->prepare("DELETE FROM notifications WHERE id=?")->execute([$notId]);
echo json_encode(["status" => "success"]);`
    },
    {
        name: 'get_psychometric.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$stmt = $conn->prepare("SELECT report_json FROM psychometric_reports WHERE user_id = ?");
$stmt->execute([$_GET['user_id']]);
echo json_encode(["report" => json_decode($stmt->fetchColumn())]);`
    },
    {
        name: 'save_psychometric.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = getJsonInput();
$stmt = $conn->prepare("INSERT INTO psychometric_reports (user_id, report_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE report_json = VALUES(report_json)");
$stmt->execute([getV($data, 'user_id'), json_encode(getV($data, 'report'))]);
echo json_encode(["status" => "success"]);`
    },
    {
        name: 'delete_account.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$conn->prepare("DELETE FROM users WHERE id = ?")->execute([$_GET['id']]);
echo json_encode(["status" => "success"]);`
    },
    {
        name: 'upload_avatar.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = getJsonInput();
$conn->prepare("UPDATE users SET avatar_url = ? WHERE id = ?")->execute([getV($data, 'url'), getV($data, 'id')]);
echo json_encode(["status" => "success"]);`
    },
    {
        name: 'get_topics.php',
        folder: 'deployment/api',
        content: `${phpHeader}
echo json_encode($conn->query("SELECT * FROM topics")->fetchAll());`
    },
    {
        name: 'get_attempt_details.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$stmt = $conn->prepare("SELECT * FROM test_attempts WHERE id = ?");
$stmt->execute([$_GET['id']]);
$row = $stmt->fetch();
if($row) { $row['detailed_results'] = json_decode($row['detailed_results']); }
echo json_encode($row);`
    },
    {
        name: 'manage_chapter_test.php',
        folder: 'deployment/api',
        content: `${phpHeader}
echo json_encode(["status" => "success", "msg" => "Endpoint mapped to save_attempt.php"]);`
    },
    {
        name: 'google_login.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = getJsonInput();
$stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([getV($data, 'email')]);
$user = $stmt->fetch();
if ($user) { echo json_encode(["status" => "success", "user" => $user]); }
else { echo json_encode(["status" => "error", "msg" => "Create account first"]); }`
    },
    {
        name: 'update_password.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = getJsonInput();
$hash = password_hash(getV($data, 'newPassword'), PASSWORD_BCRYPT);
$conn->prepare("UPDATE users SET password_hash=? WHERE id=?")->execute([$hash, getV($data, 'userId')]);
echo json_encode(["status" => "success"]);`
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
CREATE TABLE IF NOT EXISTS notifications (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), from_id VARCHAR(255), from_name VARCHAR(255), to_id VARCHAR(255), type VARCHAR(50), message TEXT, is_read TINYINT(1) DEFAULT 0, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS settings (setting_key VARCHAR(255) PRIMARY KEY, value TEXT) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS analytics_visits (date DATE PRIMARY KEY, count INT DEFAULT 0) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS tests (id VARCHAR(255) PRIMARY KEY, title VARCHAR(255), duration INT, questions_json LONGTEXT, category VARCHAR(50), difficulty VARCHAR(50)) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS blog_posts (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), excerpt TEXT, content LONGTEXT, author VARCHAR(255), image_url TEXT, category VARCHAR(50), date TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS flashcards (id INT AUTO_INCREMENT PRIMARY KEY, front TEXT, back TEXT, subject_id VARCHAR(50)) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS memory_hacks (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), description TEXT, trick TEXT, tag VARCHAR(50)) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS contact_messages (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), subject VARCHAR(255), message TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS psychometric_reports (user_id VARCHAR(255) PRIMARY KEY, report_json LONGTEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS chapter_notes (topic_id VARCHAR(255) PRIMARY KEY, pages_json LONGTEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS video_lessons (topic_id VARCHAR(255) PRIMARY KEY, video_url TEXT, description TEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB;
COMMIT;`;
};
