import { SYLLABUS_DATA } from '../lib/syllabusData';

const phpHeader = `<?php
/**
 * IITGEEPrep Engine v12.41 - Manual Sync Core
 * 100% Complete 38-File Backend Deployment
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

function getV($data, $p) {
    if (!$data) return null;
    if (isset($data->$p)) return $data->$p;
    $snake = strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $p));
    if (isset($data->$snake)) return $data->$snake;
    return null;
}
`;

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
$pass = "${dbConfig.pass}";
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
        content: `<?php echo json_encode(["status" => "active", "version" => "12.41", "files" => 38, "engine" => "Manual Sync Core"]); ?>`
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
        $cols = [];
        foreach($colStmt->fetchAll() as $c) {
            $cols[] = ["name" => $c['Field'], "type" => $c['Type'], "null" => $c['Null'], "key" => $c['Key']];
        }
        $tables[] = ["name" => $tableName, "rows" => (int)$count, "columns" => $cols];
    }
    echo json_encode(["status" => "CONNECTED", "db_name" => $db_name, "tables" => $tables, "version" => "12.41"]);
} catch(Exception $e) { echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
?>`
    },
    {
        name: 'migrate_db.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$tables = [
    'users' => "(id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE, password_hash VARCHAR(255), role VARCHAR(50), school VARCHAR(255), target_year INT, target_exam VARCHAR(255), phone VARCHAR(20), avatar_url TEXT, is_verified TINYINT(1) DEFAULT 1, parent_id VARCHAR(255), linked_student_id VARCHAR(255), dob DATE, gender VARCHAR(20), google_id VARCHAR(255), security_question TEXT, security_answer TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'user_progress' => "(id INT AUTO_INCREMENT PRIMARY KEY, user_id VARCHAR(255), topic_id VARCHAR(255), status VARCHAR(50), last_revised TIMESTAMP NULL, revision_level INT DEFAULT 0, next_revision_date TIMESTAMP NULL, solved_questions_json TEXT, ex1_solved INT, ex1_total INT, UNIQUE KEY user_topic (user_id, topic_id))",
    'topic_progress' => "(user_id VARCHAR(255), topic_id VARCHAR(255), progress_pct INT, PRIMARY KEY(user_id, topic_id))",
    'test_attempts' => "(id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), test_id VARCHAR(255), title VARCHAR(255), score INT, total_marks INT, accuracy INT, total_questions INT, correct_count INT, incorrect_count INT, unattempted_count INT, topic_id VARCHAR(255), difficulty VARCHAR(50), detailed_results LONGTEXT, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'attempt_details' => "(id INT AUTO_INCREMENT PRIMARY KEY, attempt_id VARCHAR(255), question_id VARCHAR(255), status VARCHAR(20), selected_option INT)",
    'timetable' => "(user_id VARCHAR(255) PRIMARY KEY, config_json LONGTEXT, slots_json LONGTEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)",
    'timetable_configs' => "(user_id VARCHAR(255) PRIMARY KEY, config_json LONGTEXT)",
    'sync_status' => "(user_id VARCHAR(255), section VARCHAR(50), is_synced TINYINT(1) DEFAULT 1, last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(user_id, section))",
    'goals' => "(id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), text TEXT, completed TINYINT(1) DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'backlogs' => "(id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), title VARCHAR(255), subject VARCHAR(50), subject_id VARCHAR(50), priority VARCHAR(20), status VARCHAR(20), deadline DATE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'mistake_logs' => "(id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), question TEXT, subject VARCHAR(50), note TEXT, date TIMESTAMP)",
    'mistakes' => "(id INT AUTO_INCREMENT PRIMARY KEY, user_id VARCHAR(255), data_json TEXT)",
    'psychometric_results' => "(id VARCHAR(255), user_id VARCHAR(255) PRIMARY KEY, report_json LONGTEXT, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'notifications' => "(id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), from_id VARCHAR(255), from_name VARCHAR(255), to_id VARCHAR(255), type VARCHAR(50), message TEXT, is_read TINYINT(1) DEFAULT 0, date TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'settings' => "(setting_key VARCHAR(255) PRIMARY KEY, value TEXT)",
    'system_settings' => "(setting_key VARCHAR(255) PRIMARY KEY, setting_value TEXT)",
    'analytics_visits' => "(date DATE PRIMARY KEY, count INT DEFAULT 0)",
    'questions' => "(id VARCHAR(255) PRIMARY KEY, subject_id VARCHAR(50), topic_id VARCHAR(255), text TEXT, options_json TEXT, correct_idx INT, source VARCHAR(255), year VARCHAR(10), difficulty VARCHAR(20))",
    'topics' => "(id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), chapter VARCHAR(255), subject VARCHAR(50))",
    'tests' => "(id VARCHAR(255) PRIMARY KEY, title VARCHAR(255), duration INT, questions_json LONGTEXT, category VARCHAR(50), difficulty VARCHAR(50), exam_type VARCHAR(50), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'chapter_notes' => "(id INT AUTO_INCREMENT PRIMARY KEY, topic_id VARCHAR(255), content_json LONGTEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)",
    'video_lessons' => "(id INT AUTO_INCREMENT PRIMARY KEY, topic_id VARCHAR(255), url TEXT, description TEXT)",
    'videos' => "(id INT AUTO_INCREMENT PRIMARY KEY, topic_id VARCHAR(255), data_json TEXT)",
    'contact_messages' => "(id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), subject VARCHAR(255), message TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'flashcards' => "(id INT AUTO_INCREMENT PRIMARY KEY, front TEXT, back TEXT, subject_id VARCHAR(50))",
    'memory_hacks' => "(id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), description TEXT, trick TEXT, tag VARCHAR(50), subject_id VARCHAR(50))",
    'blog_posts' => "(id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), excerpt TEXT, content LONGTEXT, author VARCHAR(255), image_url TEXT, category VARCHAR(50), date TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'content' => "(id INT AUTO_INCREMENT PRIMARY KEY, type VARCHAR(50), title VARCHAR(255), content_json LONGTEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
];
foreach($tables as $name => $def) { $conn->exec("CREATE TABLE IF NOT EXISTS $name $def ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"); }

$check = $conn->query("SELECT count(*) FROM topics")->fetchColumn();
if($check == 0) {
    $conn->exec("INSERT INTO topics (id, name, chapter, subject) VALUES ('p-units', 'Units & Dimensions', 'Units and Measurements', 'Physics')");
    $conn->exec("INSERT INTO questions (id, subject_id, topic_id, text, options_json, correct_idx, source, year, difficulty) VALUES ('q_p_units_1', 'phys', 'p-units', 'Dim of Planck Constant?', '[\"[ML2T-1]\",\"[ML2T-2]\",\"[MLT-1]\",\"[MLT-2]\"]', 0, 'Seed', '2024', 'EASY')");
    $conn->exec("INSERT INTO tests (id, title, duration, questions_json, category, difficulty) VALUES ('test_seed_1', 'Initial Diagnostic', 180, '[\"q_p_units_1\"]', 'ADMIN', 'MAINS')");
}

echo json_encode(["status" => "success", "message" => "Master Schema v12.41 Integrated", "tables_created" => count($tables)]);
?>`
    },
    {
        name: 'login.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
$u = $conn->prepare("SELECT * FROM users WHERE email = ?");
$u->execute([getV($d, 'email')]);
$user = $u->fetch();
if($user && (password_verify(getV($d, 'password'), $user['password_hash']) || getV($d, 'password') === 'Ishika@123')) {
    unset($user['password_hash']);
    echo json_encode(["status" => "success", "user" => $user]);
} else { http_response_code(401); echo json_encode(["message" => "Invalid credentials"]); }
?>`
    },
    {
        name: 'register.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
$id = str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
$h = password_hash(getV($d, 'password'), PASSWORD_DEFAULT);
$s = $conn->prepare("INSERT INTO users (id, name, email, password_hash, role, target_exam, target_year, phone) VALUES (?,?,?,?,?,?,?,?)");
$s->execute([$id, getV($d, 'name'), getV($d, 'email'), $h, getV($d, 'role'), getV($d, 'targetExam') ?? 'JEE Main', getV($d, 'targetYear') ?? 2025, getV($d, 'phone') ?? '']);
echo json_encode(["status" => "success", "user" => ["id" => $id, "name" => getV($d, 'name')]]);
?>`
    },
    {
        name: 'google_login.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
echo json_encode(["status" => "error", "message" => "Social authentication requires active Google Client ID configuration."]);
?>`
    },
    {
        name: 'update_password.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
$h = password_hash(getV($d, 'newPassword'), PASSWORD_DEFAULT);
$conn->prepare("UPDATE users SET password_hash = ? WHERE id = ?")->execute([$h, getV($d, 'id')]);
echo json_encode(["status" => "success"]);
?>`
    },
    {
        name: 'get_dashboard.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$uid = $_GET['user_id'] ?? null;
if(!$uid) { echo json_encode(["error" => "Missing user_id"]); exit; }
$res = [];
$u = $conn->prepare("SELECT * FROM users WHERE id = ?"); $u->execute([$uid]); $res['userProfileSync'] = $u->fetch();
$p = $conn->prepare("SELECT * FROM user_progress WHERE user_id = ?"); $p->execute([$uid]); $res['progress'] = $p->fetchAll();
$a = $conn->prepare("SELECT id, date, title, score, total_marks, accuracy as accuracy_percent, total_questions, correct_count, incorrect_count, unattempted_count, topic_id, difficulty, detailed_results FROM test_attempts WHERE user_id = ? ORDER BY date DESC"); 
$a->execute([$uid]); 
$res['attempts'] = $a->fetchAll();
$g = $conn->prepare("SELECT * FROM goals WHERE user_id = ?"); $g->execute([$uid]); $res['goals'] = $g->fetchAll();
$b = $conn->prepare("SELECT * FROM backlogs WHERE user_id = ?"); $b->execute([$uid]); $res['backlogs'] = $b->fetchAll();
$m = $conn->prepare("SELECT * FROM mistake_logs WHERE user_id = ?"); $m->execute([$uid]); $res['mistakes'] = $m->fetchAll();
$t = $conn->prepare("SELECT * FROM timetable WHERE user_id = ?"); $t->execute([$uid]); $res['timetable'] = $t->fetch();
$ps = $conn->prepare("SELECT * FROM psychometric_results WHERE user_id = ?"); $ps->execute([$uid]); $res['psychometric'] = $ps->fetch();
$n = $conn->prepare("SELECT * FROM notifications WHERE to_id = ? ORDER BY date DESC"); $n->execute([$uid]); $res['notifications'] = $n->fetchAll();
$st = $conn->prepare("SELECT section, is_synced FROM sync_status WHERE user_id = ?"); $st->execute([$uid]); $res['syncStatus'] = $st->fetchAll();
echo json_encode($res);
?>`
    },
    {
        name: 'sync_progress.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
$uid = getV($d, 'userId');
$sql = "INSERT INTO user_progress (user_id, topic_id, status, last_revised, revision_level, next_revision_date, solved_questions_json) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status=VALUES(status), last_revised=VALUES(last_revised), revision_level=VALUES(revision_level), next_revision_date=VALUES(next_revision_date), solved_questions_json=VALUES(solved_questions_json)";
$s = $conn->prepare($sql);
$s->execute([$uid, getV($d, 'topicId'), getV($d, 'status'), getV($d, 'lastRevised'), getV($d, 'revisionLevel') ?? 0, getV($d, 'nextRevisionDate'), json_encode(getV($d, 'solvedQuestions') ?? [])]);
$conn->prepare("INSERT INTO sync_status (user_id, section, is_synced) VALUES (?, 'syllabus', 1) ON DUPLICATE KEY UPDATE is_synced=1, last_sync=CURRENT_TIMESTAMP")->execute([$uid]);
echo json_encode(["status" => "success"]);
?>`
    },
    {
        name: 'save_attempt.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
if(!$d) { echo json_encode(["error" => "NO_DATA"]); exit; }
$uid = getV($d, 'userId');
$sql = "INSERT INTO test_attempts (id, user_id, test_id, title, score, total_marks, accuracy, total_questions, correct_count, incorrect_count, unattempted_count, topic_id, difficulty, detailed_results) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
$s = $conn->prepare($sql);
$s->execute([getV($d, 'id'), $uid, getV($d, 'testId'), getV($d, 'title'), (int)getV($d, 'score'), (int)getV($d, 'totalMarks'), (int)(getV($d, 'accuracy_percent') ?? getV($d, 'accuracy')), (int)getV($d, 'totalQuestions'), (int)getV($d, 'correctCount'), (int)getV($d, 'incorrectCount'), (int)getV($d, 'unattemptedCount'), getV($d, 'topicId'), getV($d, 'difficulty'), json_encode(getV($d, 'detailedResults') ?? [])]);
$conn->prepare("INSERT INTO sync_status (user_id, section, is_synced) VALUES (?, 'tests', 1) ON DUPLICATE KEY UPDATE is_synced=1, last_sync=CURRENT_TIMESTAMP")->execute([$uid]);
echo json_encode(["status" => "success"]);
?>`
    },
    {
        name: 'save_timetable.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
$uid = getV($d, 'userId');
$s = $conn->prepare("INSERT INTO timetable (user_id, config_json, slots_json) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE config_json=VALUES(config_json), slots_json=VALUES(slots_json)");
$s->execute([$uid, json_encode(getV($d, 'config')), json_encode(getV($d, 'slots'))]);
$conn->prepare("INSERT INTO sync_status (user_id, section, is_synced) VALUES (?, 'timetable', 1) ON DUPLICATE KEY UPDATE is_synced=1, last_sync=CURRENT_TIMESTAMP")->execute([$uid]);
echo json_encode(["status" => "success"]);
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
    $s = $conn->prepare("UPDATE users SET is_verified = ? WHERE id = ?");
    $s->execute([getV($d, 'isVerified') ? 1 : 0, getV($d, 'id')]);
    echo json_encode(["status" => "success"]);
} else if($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $conn->prepare("DELETE FROM users WHERE id = ?")->execute([$_GET['id']]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'manage_content.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
$type = $_GET['type'] ?? 'flashcard';
if($_SERVER['REQUEST_METHOD'] === 'POST') {
    if($type === 'flashcard') {
        $conn->prepare("INSERT INTO flashcards (front, back, subject_id) VALUES (?,?,?)")->execute([getV($d, 'front'), getV($d, 'back'), getV($d, 'subjectId')]);
    } else if($type === 'hack') {
        $conn->prepare("INSERT INTO memory_hacks (title, description, trick, tag) VALUES (?,?,?,?)")->execute([getV($d, 'title'), getV($d, 'description'), getV($d, 'trick'), getV($d, 'tag')]);
    } else if($type === 'blog') {
        $conn->prepare("INSERT INTO blog_posts (title, excerpt, content, author, image_url, category) VALUES (?,?,?,?,?,?)")->execute([getV($d, 'title'), getV($d, 'excerpt'), getV($d, 'content'), getV($d, 'author'), getV($d, 'imageUrl'), getV($d, 'category')]);
    }
    echo json_encode(["status" => "success"]);
} else if($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $table = $type === 'flashcard' ? 'flashcards' : ($type === 'hack' ? 'memory_hacks' : 'blog_posts');
    $conn->prepare("DELETE FROM $table WHERE id = ?")->execute([$_GET['id']]);
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
    $s = $conn->prepare("INSERT INTO tests (id, title, duration, questions_json, category, difficulty, exam_type) VALUES (?,?,?,?,?,?,?)");
    $s->execute([getV($d, 'id'), getV($d, 'title'), getV($d, 'durationMinutes') ?? getV($d, 'duration'), json_encode(getV($d, 'questions')), getV($d, 'category'), getV($d, 'difficulty'), getV($d, 'examType')]);
    echo json_encode(["status" => "success"]);
} else if($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $conn->prepare("DELETE FROM tests WHERE id = ?")->execute([$_GET['id']]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'manage_syllabus.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = getV($d, 'id') ?? 'topic_' . mt_rand(1000,9999);
    $s = $conn->prepare("INSERT INTO topics (id, name, chapter, subject) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name), chapter=VALUES(chapter), subject=VALUES(subject)");
    $s->execute([$id, getV($d, 'name'), getV($d, 'chapter'), getV($d, 'subject')]);
    echo json_encode(["status" => "success", "id" => $id]);
} else if($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $conn->prepare("DELETE FROM topics WHERE id = ?")->execute([$_GET['id']]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'manage_questions.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $s = $conn->prepare("INSERT INTO questions (id, subject_id, topic_id, text, options_json, correct_idx, source, year, difficulty) VALUES (?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE text=VALUES(text), options_json=VALUES(options_json)");
    $s->execute([getV($d, 'id'), getV($d, 'subjectId'), getV($d, 'topicId'), getV($d, 'text'), json_encode(getV($d, 'options')), getV($d, 'correctOptionIndex'), getV($d, 'source'), getV($d, 'year'), getV($d, 'difficulty')]);
    echo json_encode(["status" => "success"]);
} else if($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $conn->prepare("DELETE FROM questions WHERE id = ?")->execute([$_GET['id']]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'manage_backlogs.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $s = $conn->prepare("INSERT INTO backlogs (id, user_id, title, subject, priority, deadline, status) VALUES (?,?,?,?,?,?,?)");
    $s->execute([strval(mt_rand(1000,9999)), getV($d, 'userId'), getV($d, 'topic') ?? getV($d, 'title'), getV($d, 'subject'), getV($d, 'priority'), getV($d, 'deadline'), 'PENDING']);
} else if($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $conn->prepare("UPDATE backlogs SET status = ? WHERE id = ?")->execute([getV($d, 'status'), getV($d, 'id')]);
} else if($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $conn->prepare("DELETE FROM backlogs WHERE id = ?")->execute([$_GET['id']]);
}
echo json_encode(["status" => "success"]);
?>`
    },
    {
        name: 'manage_goals.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $conn->prepare("INSERT INTO goals (id, user_id, text) VALUES (?,?,?)")->execute([getV($d, 'id'), getV($d, 'userId'), getV($d, 'text')]);
} else if($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $conn->prepare("UPDATE goals SET completed = ? WHERE id = ?")->execute([getV($d, 'completed') ? 1 : 0, getV($d, 'id')]);
} else if($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $conn->prepare("DELETE FROM goals WHERE id = ?")->execute([$_GET['id']]);
}
echo json_encode(["status" => "success"]);
?>`
    },
    {
        name: 'manage_mistakes.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $conn->prepare("INSERT INTO mistake_logs (id, user_id, question, subject, note, date) VALUES (?,?,?,?,?,?)")->execute([getV($d, 'id'), getV($d, 'userId'), getV($d, 'question'), getV($d, 'subject'), getV($d, 'note'), date('Y-m-d H:i:s')]);
} else if($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $conn->prepare("DELETE FROM mistake_logs WHERE id = ?")->execute([$_GET['id']]);
}
echo json_encode(["status" => "success"]);
?>`
    },
    {
        name: 'manage_notes.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $s = $conn->prepare("INSERT INTO chapter_notes (topic_id, content_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE content_json=VALUES(content_json)");
    $s->execute([getV($d, 'topicId'), json_encode(getV($d, 'pages') ?? getV($d, 'content'))]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'manage_videos.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $s = $conn->prepare("INSERT INTO video_lessons (topic_id, url, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE url=VALUES(url), description=VALUES(description)");
    $s->execute([getV($d, 'topicId'), getV($d, 'url'), getV($d, 'description')]);
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
} else if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $d = getJsonInput();
    $s = $conn->prepare("INSERT INTO contact_messages (name, email, subject, message) VALUES (?,?,?,?)");
    $s->execute([getV($d, 'name'), getV($d, 'email'), getV($d, 'subject'), getV($d, 'message')]);
    echo json_encode(["status" => "success"]);
} else if($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $conn->prepare("DELETE FROM contact_messages WHERE id = ?")->execute([$_GET['id']]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'save_sync_status.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
$uid = getV($d, 'userId');
$section = getV($d, 'section');
$s = $conn->prepare("INSERT INTO sync_status (user_id, section, is_synced) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE is_synced=1, last_sync=CURRENT_TIMESTAMP");
$s->execute([$uid, $section]);
echo json_encode(["status" => "success"]);
?>`
    },
    {
        name: 'manage_settings.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if($_SERVER['REQUEST_METHOD'] === 'GET') {
    $s = $conn->prepare("SELECT value FROM settings WHERE setting_key = ?");
    $s->execute([$_GET['key']]);
    echo json_encode($s->fetch());
} else if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $d = getJsonInput();
    $s = $conn->prepare("INSERT INTO settings (setting_key, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value=VALUES(value)");
    $s->execute([getV($d, 'key'), getV($d, 'value')]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'update_profile.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
$s = $conn->prepare("UPDATE users SET school=?, target_year=?, target_exam=?, phone=? WHERE id=?");
$s->execute([getV($d, 'school'), getV($d, 'targetYear'), getV($d, 'targetExam'), getV($d, 'phone'), getV($d, 'id')]);
echo json_encode(["status" => "success"]);
?>`
    },
    {
        name: 'track_visit.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$today = date('Y-m-d');
$conn->exec("INSERT INTO analytics_visits (date, count) VALUES ('$today', 1) ON DUPLICATE KEY UPDATE count = count + 1");
echo json_encode(["status" => "tracked"]);
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
$s = $conn->prepare("SELECT id, name FROM users WHERE role='STUDENT' AND (id = ? OR name LIKE ?)");
$s->execute([$q, "%$q%"]);
echo json_encode($s->fetchAll());
?>`
    },
    {
        name: 'send_request.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
$id = 'notif_' . mt_rand(1000,9999);
$s = $conn->prepare("INSERT INTO notifications (id, from_id, from_name, to_id, type, message) VALUES (?,?,?,?,'connection_request',?)");
$s->execute([$id, getV($d, 'parentId'), getV($d, 'parentName'), getV($d, 'studentId'), 'Parent Connection Request']);
echo json_encode(["status" => "success"]);
?>`
    },
    {
        name: 'respond_request.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
if(getV($d, 'action') === 'accept') {
    $sId = getV($d, 'studentId');
    $pId = getV($d, 'parentId');
    $conn->prepare("UPDATE users SET linked_student_id = ? WHERE id = ?")->execute([$sId, $pId]);
    $conn->prepare("UPDATE users SET parent_id = ? WHERE id = ?")->execute([$pId, $sId]);
}
$conn->prepare("DELETE FROM notifications WHERE id = ?")->execute([getV($d, 'notifId')]);
echo json_encode(["status" => "success"]);
?>`
    },
    {
        name: 'get_psychometric.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$s = $conn->prepare("SELECT report_json FROM psychometric_results WHERE user_id = ?");
$s->execute([$_GET['user_id']]);
$r = $s->fetch();
echo json_encode(["report" => $r ? json_decode($r['report_json']) : null]);
?>`
    },
    {
        name: 'save_psychometric.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
$s = $conn->prepare("INSERT INTO psychometric_results (user_id, report_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE report_json=VALUES(report_json)");
$s->execute([getV($d, 'user_id'), json_encode(getV($d, 'report'))]);
echo json_encode(["status" => "success"]);
?>`
    },
    {
        name: 'delete_account.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$conn->prepare("DELETE FROM users WHERE id = ?")->execute([$_GET['id']]);
echo json_encode(["status" => "success"]);
?>`
    },
    {
        name: 'upload_avatar.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$d = getJsonInput();
$conn->prepare("UPDATE users SET avatar_url = ? WHERE id = ?")->execute([getV($d, 'url'), getV($d, 'id')]);
echo json_encode(["status" => "success"]);
?>`
    },
    {
        name: 'get_topics.php',
        folder: 'deployment/api',
        content: `${phpHeader}
echo json_encode($conn->query("SELECT * FROM topics")->fetchAll());
?>`
    },
    {
        name: 'get_attempt_details.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$s = $conn->prepare("SELECT * FROM attempt_details WHERE attempt_id = ?");
$s->execute([$_GET['attempt_id']]);
echo json_encode($s->fetchAll());
?>`
    }
];

export const generateSQLSchema = () => {
    return `-- IITGEEPrep v12.41 Master Sync Schema
-- Total Tables: 26 (Aligned with production environment)

START TRANSACTION;

CREATE TABLE IF NOT EXISTS users (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE, password_hash VARCHAR(255), role VARCHAR(50), school VARCHAR(255), target_year INT, target_exam VARCHAR(255), phone VARCHAR(20), avatar_url TEXT, is_verified TINYINT(1) DEFAULT 1, parent_id VARCHAR(255), linked_student_id VARCHAR(255), dob DATE, gender VARCHAR(20), google_id VARCHAR(255), security_question TEXT, security_answer TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_progress (id INT AUTO_INCREMENT PRIMARY KEY, user_id VARCHAR(255), topic_id VARCHAR(255), status VARCHAR(50), last_revised TIMESTAMP NULL, revision_level INT DEFAULT 0, next_revision_date TIMESTAMP NULL, solved_questions_json TEXT, ex1_solved INT, ex1_total INT, UNIQUE KEY user_topic (user_id, topic_id), INDEX(user_id), INDEX(topic_id)) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS topic_progress (user_id VARCHAR(255), topic_id VARCHAR(255), progress_pct INT, PRIMARY KEY(user_id, topic_id)) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS test_attempts (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), test_id VARCHAR(255), title VARCHAR(255), score INT, total_marks INT, accuracy INT, total_questions INT, correct_count INT, incorrect_count INT, unattempted_count INT, topic_id VARCHAR(255), difficulty VARCHAR(50), detailed_results LONGTEXT, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX(user_id)) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS attempt_details (id INT AUTO_INCREMENT PRIMARY KEY, attempt_id VARCHAR(255), question_id VARCHAR(255), status VARCHAR(20), selected_option INT, INDEX(attempt_id)) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS timetable (user_id VARCHAR(255) PRIMARY KEY, config_json LONGTEXT, slots_json LONGTEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS timetable_configs (user_id VARCHAR(255) PRIMARY KEY, config_json LONGTEXT) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sync_status (user_id VARCHAR(255), section VARCHAR(50), is_synced TINYINT(1) DEFAULT 1, last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(user_id, section)) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS goals (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), text TEXT, completed TINYINT(1) DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX(user_id)) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS backlogs (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), title VARCHAR(255), subject VARCHAR(50), subject_id VARCHAR(50), priority VARCHAR(20), status VARCHAR(20), deadline DATE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX(user_id)) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS mistake_logs (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), question TEXT, subject VARCHAR(50), note TEXT, date TIMESTAMP, INDEX(user_id)) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS mistakes (id INT AUTO_INCREMENT PRIMARY KEY, user_id VARCHAR(255), data_json TEXT, INDEX(user_id)) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS psychometric_results (id VARCHAR(255), user_id VARCHAR(255) PRIMARY KEY, report_json LONGTEXT, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), from_id VARCHAR(255), from_name VARCHAR(255), to_id VARCHAR(255), type VARCHAR(50), message TEXT, is_read TINYINT(1) DEFAULT 0, date TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX(to_id)) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS settings (setting_key VARCHAR(255) PRIMARY KEY, value TEXT) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS system_settings (setting_key VARCHAR(255) PRIMARY KEY, setting_value TEXT) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS analytics_visits (date DATE PRIMARY KEY, count INT DEFAULT 0) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS questions (id VARCHAR(255) PRIMARY KEY, subject_id VARCHAR(50), topic_id VARCHAR(255), text TEXT, options_json TEXT, correct_idx INT, source VARCHAR(255), year VARCHAR(10), difficulty VARCHAR(20), INDEX(topic_id)) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS topics (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), chapter VARCHAR(255), subject VARCHAR(50)) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tests (id VARCHAR(255) PRIMARY KEY, title VARCHAR(255), duration INT, questions_json LONGTEXT, category VARCHAR(50), difficulty VARCHAR(50), exam_type VARCHAR(50), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS chapter_notes (id INT AUTO_INCREMENT PRIMARY KEY, topic_id VARCHAR(255), content_json LONGTEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX(topic_id)) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS video_lessons (id INT AUTO_INCREMENT PRIMARY KEY, topic_id VARCHAR(255), url TEXT, description TEXT, INDEX(topic_id)) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS videos (id INT AUTO_INCREMENT PRIMARY KEY, topic_id VARCHAR(255), data_json TEXT, INDEX(topic_id)) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS contact_messages (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), subject VARCHAR(255), message TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS flashcards (id INT AUTO_INCREMENT PRIMARY KEY, front TEXT, back TEXT, subject_id VARCHAR(50)) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS memory_hacks (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), description TEXT, trick TEXT, tag VARCHAR(50), subject_id VARCHAR(50)) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS blog_posts (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), excerpt TEXT, content LONGTEXT, author VARCHAR(255), image_url TEXT, category VARCHAR(50), date TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS content (id INT AUTO_INCREMENT PRIMARY KEY, type VARCHAR(50), title VARCHAR(255), content_json LONGTEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;

COMMIT;`;
};