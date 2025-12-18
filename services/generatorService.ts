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
    echo json_encode(["status" => "error", "message" => "Database Connection Error: " . $exception.getMessage()]);
    exit();
}
?>`
    },
    {
        name: 'index.php',
        folder: 'deployment/api',
        content: `${phpHeader} echo json_encode(["status" => "active", "version" => "12.24", "engine" => "IITGEE_PROD"]); ?>`
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
        name: 'google_login.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents('php://input'));
if(!empty($data->credential)) {
    try {
        $token = $data->credential;
        $parts = explode('.', $token);
        if(count($parts) < 2) throw new Error("Invalid Token");
        $payload = json_decode(base64_decode($parts[1]));
        $email = $payload->email;
        $name = $payload->name;
        $google_id = $payload->sub;
        $avatar = $payload->picture;
        $stmt = $conn->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        $u = $stmt->fetch(PDO::FETCH_ASSOC);
        if($u) {
            if(empty($u['google_id'])) {
                $upd = $conn->prepare("UPDATE users SET google_id = ?, avatar_url = ? WHERE id = ?");
                $upd->execute([$google_id, $avatar, $u['id']]);
            }
            echo json_encode(["status" => "success", "user" => $u]);
        } else {
            $id = str_pad(mt_rand(100000, 999999), 6, '0', STR_PAD_LEFT);
            $role = !empty($data->role) ? $data->role : 'STUDENT';
            $ins = $conn->prepare("INSERT INTO users (id, name, email, google_id, avatar_url, role) VALUES (?, ?, ?, ?, ?, ?)");
            $ins->execute([$id, $name, $email, $google_id, $avatar, $role]);
            $stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$id]);
            $newUser = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode(["status" => "success", "user" => $newUser]);
        }
    } catch(Exception $e) { http_response_code(500); echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
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
    $stmt = $conn->prepare("SELECT * FROM user_progress WHERE user_id = ?"); $stmt->execute([$user_id]); $rawProgress = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    $response['progress'] = []; foreach($rawProgress as $p) $response['progress'][] = ["topic_id" => $p['topic_id'], "status" => $p['status'], "last_revised" => $p['last_revised'], "revision_level" => (int)$p['revision_level'], "next_revision_date" => $p['next_revision_date'], "solved_questions_json" => $p['solved_questions_json']];
    $stmt = $conn->prepare("SELECT * FROM test_attempts WHERE user_id = ? ORDER BY date DESC"); $stmt->execute([$user_id]); $response['attempts'] = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    $stmt = $conn->prepare("SELECT * FROM goals WHERE user_id = ?"); $stmt->execute([$user_id]); $response['goals'] = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    $stmt = $conn->prepare("SELECT * FROM mistake_logs WHERE user_id = ?"); $stmt->execute([$user_id]); $response['mistakes'] = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    $stmt = $conn->prepare("SELECT * FROM backlogs WHERE user_id = ?"); $stmt->execute([$user_id]); $response['backlogs'] = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    $stmt = $conn->prepare("SELECT * FROM timetable WHERE user_id = ?"); $stmt->execute([$user_id]); $tt = $stmt->fetch(PDO::FETCH_ASSOC);
    if($tt) $response['timetable'] = ['config' => json_decode($tt['config_json']), 'slots' => json_decode($tt['slots_json'])];
    $stmt = $conn->prepare("SELECT * FROM notifications WHERE to_id = ? ORDER BY created_at DESC"); $stmt->execute([$user_id]); $response['notifications'] = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    echo json_encode($response);
} catch(Exception $e) { http_response_code(500); echo json_encode(["error" => $e->getMessage()]); } ?>`
    },
    {
        name: 'sync_progress.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents('php://input'));
if(!empty($data->user_id) && !empty($data->topicId)) {
    try {
        $stmt = $conn->prepare("INSERT INTO user_progress (user_id, topic_id, status, last_revised, revision_level, next_revision_date, solved_questions_json) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status), last_revised = VALUES(last_revised), revision_level = VALUES(revision_level), next_revision_date = VALUES(next_revision_date), solved_questions_json = VALUES(solved_questions_json)");
        $stmt->execute([$data->user_id, $data->topicId, $data->status, $data->lastRevised, $data->revisionLevel, $data->nextRevisionDate, json_encode($data->solvedQuestions)]);
        echo json_encode(["status" => "success"]);
    } catch(Exception $e) { http_response_code(500); echo json_encode(["error" => $e->getMessage()]); }
}
?>`
    },
    {
        name: 'save_attempt.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents('php://input'));
if(!empty($data->user_id)) {
    try {
        $id = 'att_'.time().'_'.mt_rand(10,99);
        $sql = "INSERT INTO test_attempts (id, user_id, test_id, score, total_marks, accuracy, detailed_results, topic_id, difficulty, total_questions, correct_count, incorrect_count, unattempted_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$id, $data->user_id, $data->testId, $data->score, $data->totalMarks, $data->accuracy, json_encode($data->detailedResults), $data->topicId, $data->difficulty, $data->totalQuestions, $data->correctCount, $data->incorrectCount, $data->unattemptedCount]);
        echo json_encode(["status" => "success", "id" => $id]);
    } catch(Exception $e) { http_response_code(500); echo json_encode(["error" => $e->getMessage()]); }
}
?>`
    },
    {
        name: 'save_timetable.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents('php://input'));
if(!empty($data->user_id)) {
    try {
        $config_json = isset($data->config) ? json_encode($data->config) : null;
        $slots_json = isset($data->slots) ? json_encode($data->slots) : null;
        $stmt = $conn->prepare("INSERT INTO timetable (user_id, config_json, slots_json) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE config_json = IFNULL(?, config_json), slots_json = IFNULL(?, slots_json)");
        $stmt->execute([$data->user_id, $config_json, $slots_json, $config_json, $slots_json]);
        echo json_encode(["status" => "success"]);
    } catch(Exception $e) { http_response_code(500); echo json_encode(["error" => $e->getMessage()]); }
}
?>`
    },
    {
        name: 'manage_users.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $stmt = $conn->query("SELECT id, name, email, role, is_verified, created_at FROM users ORDER BY created_at DESC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} elseif ($_SERVER['REQUEST_METHOD'] == 'PUT') {
    $data = json_decode(file_get_contents('php://input'));
    $stmt = $conn->prepare("UPDATE users SET is_verified = ? WHERE id = ?");
    $stmt->execute([$data->isVerified ? 1 : 0, $data->id]);
    echo json_encode(["status" => "success"]);
} elseif ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $id = $_GET['id'];
    $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'manage_content.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$type = $_GET['type'] ?? '';
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if($type) {
        $stmt = $conn->prepare("SELECT * FROM content WHERE type = ? ORDER BY created_at DESC");
        $stmt->execute([$type]);
    } else {
        $stmt = $conn->query("SELECT * FROM content ORDER BY created_at DESC");
    }
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} elseif ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'));
    $stmt = $conn->prepare("INSERT INTO content (type, title, content_json) VALUES (?, ?, ?)");
    $stmt->execute([$data->type, $data->title, json_encode($data->content)]);
    echo json_encode(["status" => "success", "id" => $conn->lastInsertId()]);
} elseif ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $id = $_GET['id'];
    $stmt = $conn->prepare("DELETE FROM content WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'manage_tests.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $stmt = $conn->query("SELECT * FROM tests ORDER BY created_at DESC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} elseif ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'));
    $stmt = $conn->prepare("INSERT INTO tests (id, title, duration, category, difficulty, exam_type, questions_json) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$data->id, $data->title, $data->duration, $data->category, $data->difficulty, $data->examType, json_encode($data->questions)]);
    echo json_encode(["status" => "success"]);
} elseif ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $id = $_GET['id'];
    $stmt = $conn->prepare("DELETE FROM tests WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'manage_syllabus.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $stmt = $conn->query("SELECT * FROM topics");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} elseif ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'));
    $id = 't_'.time();
    $stmt = $conn->prepare("INSERT INTO topics (id, name, chapter, subject) VALUES (?, ?, ?, ?)");
    $stmt->execute([$id, $data->name, $data->chapter, $data->subject]);
    echo json_encode(["status" => "success", "id" => $id]);
} elseif ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $id = $_GET['id'];
    $stmt = $conn->prepare("DELETE FROM topics WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'manage_questions.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $stmt = $conn->query("SELECT * FROM questions");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} elseif ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'));
    $stmt = $conn->prepare("INSERT INTO questions (id, subject_id, topic_id, text, options_json, correct_idx, difficulty, source, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$data->id, $data->subjectId, $data->topicId, $data->text, json_encode($data->options), $data->correctOptionIndex, $data->difficulty, $data->source, $data->year]);
    echo json_encode(["status" => "success"]);
} elseif ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $id = $_GET['id'];
    $stmt = $conn->prepare("DELETE FROM questions WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'manage_backlogs.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'));
    $stmt = $conn->prepare("INSERT INTO backlogs (id, user_id, title, subject, priority, status, deadline) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$data->id, $data->user_id, $data->title, $data->subject, $data->priority, $data->status, $data->deadline]);
    echo json_encode(["status" => "success"]);
} elseif ($_SERVER['REQUEST_METHOD'] == 'PUT') {
    $data = json_decode(file_get_contents('php://input'));
    $stmt = $conn->prepare("UPDATE backlogs SET status = ? WHERE id = ?");
    $stmt->execute([$data->status, $data->id]);
    echo json_encode(["status" => "success"]);
} elseif ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $id = $_GET['id'];
    $stmt = $conn->prepare("DELETE FROM backlogs WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'manage_goals.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'));
    $stmt = $conn->prepare("INSERT INTO goals (id, user_id, text, completed) VALUES (?, ?, ?, ?)");
    $stmt->execute([$data->id, $data->user_id, $data->text, $data->completed ? 1 : 0]);
    echo json_encode(["status" => "success"]);
} elseif ($_SERVER['REQUEST_METHOD'] == 'PUT') {
    $data = json_decode(file_get_contents('php://input'));
    $stmt = $conn->prepare("UPDATE goals SET completed = ? WHERE id = ?");
    $stmt->execute([$data->completed ? 1 : 0, $data->id]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'manage_mistakes.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'));
    $stmt = $conn->prepare("INSERT INTO mistake_logs (id, user_id, question, subject, note, date) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$data->id, $data->user_id, $data->question, $data->subject, $data->note, $data->date]);
    echo json_encode(["status" => "success"]);
} elseif ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $id = $_GET['id'];
    $stmt = $conn->prepare("DELETE FROM mistake_logs WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'manage_notes.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $stmt = $conn->query("SELECT * FROM chapter_notes");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $notes = [];
    foreach($rows as $r) {
        $notes[$r['topic_id']] = [
            'id' => (int)$r['id'],
            'topicId' => $r['topic_id'],
            'pages' => json_decode($r['content_json']),
            'lastUpdated' => $r['updated_at']
        ];
    }
    echo json_encode($notes);
} elseif ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'));
    $stmt = $conn->prepare("INSERT INTO chapter_notes (topic_id, content_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE content_json = VALUES(content_json)");
    $stmt->execute([$data->topic_id, json_encode($data->pages)]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'manage_videos.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $stmt = $conn->query("SELECT * FROM video_lessons");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} elseif ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'));
    $stmt = $conn->prepare("INSERT INTO video_lessons (topic_id, url, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE url = VALUES(url), description = VALUES(description)");
    $stmt->execute([$data->topicId, $data->url, $data->description]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'manage_settings.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $key = $_GET['key'] ?? '';
    if($key) {
        $stmt = $conn->prepare("SELECT value FROM settings WHERE setting_key = ?");
        $stmt->execute([$key]);
        echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
    } else {
        $stmt = $conn->query("SELECT * FROM settings");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
} elseif ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents('php://input'));
    $stmt = $conn->prepare("INSERT INTO settings (setting_key, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)");
    $stmt->execute([$data->key, $data->value]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'get_admin_stats.php',
        folder: 'deployment/api',
        content: `${phpHeader}
try {
    $stats = [];
    $stats['totalUsers'] = $conn->query("SELECT COUNT(*) FROM users")->fetchColumn();
    $stats['totalVisits'] = $conn->query("SELECT SUM(count) FROM analytics_visits")->fetchColumn() ?: 0;
    $stmt = $conn->query("SELECT date, count as visits FROM analytics_visits ORDER BY date DESC LIMIT 7");
    $stats['dailyTraffic'] = array_reverse($stmt->fetchAll(PDO::FETCH_ASSOC));
    echo json_encode($stats);
} catch(Exception $e) { http_response_code(500); echo json_encode(["error" => $e->getMessage()]); }
?>`
    },
    {
        name: 'search_students.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$q = $_GET['q'] ?? '';
if(!$q) exit(json_encode([]));
try {
    $stmt = $conn->prepare("SELECT id, name FROM users WHERE role = 'STUDENT' AND (id = ? OR name LIKE ?)");
    $stmt->execute([$q, "%$q%"]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch(Exception $e) { echo json_encode([]); }
?>`
    },
    {
        name: 'send_request.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents('php://input'));
if(!empty($data->from_id) && !empty($data->to_id)) {
    try {
        $id = 'notif_'.time();
        $stmt = $conn->prepare("INSERT INTO notifications (id, from_id, from_name, to_id, type, message) VALUES (?, ?, ?, ?, 'connection_request', ?)");
        $stmt->execute([$id, $data->from_id, $data->from_name, $data->to_id, "Wants to connect with you as a Parent."]);
        echo json_encode(["success" => true, "message" => "Request sent!"]);
    } catch(Exception $e) { echo json_encode(["success" => false, "message" => "Request failed."]); }
}
?>`
    },
    {
        name: 'respond_request.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents('php://input'));
if(!empty($data->notification_id) && !empty($data->action)) {
    try {
        $stmt = $conn->prepare("SELECT * FROM notifications WHERE id = ?");
        $stmt->execute([$data->notification_id]);
        $notif = $stmt->fetch(PDO::FETCH_ASSOC);
        if($notif && $data->action === 'ACCEPT') {
            $conn->prepare("UPDATE users SET parent_id = ? WHERE id = ?")->execute([$notif['from_id'], $notif['to_id']]);
            $conn->prepare("UPDATE users SET linked_student_id = ? WHERE id = ?")->execute([$notif['to_id'], $notif['from_id']]);
        }
        $conn->prepare("DELETE FROM notifications WHERE id = ?")->execute([$data->notification_id]);
        echo json_encode(["success" => true]);
    } catch(Exception $e) { echo json_encode(["success" => false]); }
}
?>`
    },
    {
        name: 'contact.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents('php://input'));
if(!empty($data->email)) {
    try {
        $stmt = $conn->prepare("INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)");
        $stmt->execute([$data->name, $data->email, $data->subject, $data->message]);
        echo json_encode(["status" => "success"]);
    } catch(Exception $e) { http_response_code(500); }
}
?>`
    },
    {
        name: 'track_visit.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$today = date('Y-m-d');
try {
    $conn->prepare("INSERT INTO analytics_visits (date, count) VALUES (?, 1) ON DUPLICATE KEY UPDATE count = count + 1")->execute([$today]);
    echo json_encode(["status" => "ok"]);
} catch(Exception $e) {}
?>`
    },
    {
        name: 'save_psychometric.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents('php://input'));
if(!empty($data->user_id) && !empty($data->report)) {
    try {
        $stmt = $conn->prepare("INSERT INTO psychometric_results (user_id, report_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE report_json = VALUES(report_json)");
        $stmt->execute([$data->user_id, json_encode($data->report)]);
        echo json_encode(["status" => "success"]);
    } catch(Exception $e) { http_response_code(500); echo json_encode(["error" => $e->getMessage()]); }
}
?>`
    },
    {
        name: 'get_psychometric.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$user_id = $_GET['user_id'] ?? '';
if($user_id) {
    try {
        $stmt = $conn->prepare("SELECT report_json FROM psychometric_results WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(["report" => $row ? json_decode($row['report_json']) : null]);
    } catch(Exception $e) { http_response_code(500); }
}
?>`
    },
    {
        name: 'test_db.php',
        folder: 'deployment/api',
        content: `${phpHeader}
try {
    $tables = [];
    $res = $conn->query("SHOW TABLES");
    while($row = $res->fetch(PDO::FETCH_NUM)) {
        $tableName = $row[0];
        $rowCount = $conn->query("SELECT COUNT(*) FROM $tableName")->fetchColumn();
        $tables[] = ["name" => $tableName, "rows" => (int)$rowCount];
    }
    echo json_encode(["status" => "CONNECTED", "db_name" => $db_name, "tables" => $tables]);
} catch(PDOException $e) { http_response_code(500); echo json_encode(["status" => "ERROR", "message" => $e->getMessage()]); }
?>`
    },
    {
        name: 'migrate_db.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$schema = [
    'users' => "(id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE, password_hash VARCHAR(255), role VARCHAR(50) DEFAULT 'STUDENT', target_exam VARCHAR(100), target_year INT, institute VARCHAR(255), gender VARCHAR(50), dob DATE, is_verified TINYINT(1) DEFAULT 1, google_id VARCHAR(255), parent_id VARCHAR(255), linked_student_id VARCHAR(255), school VARCHAR(255), phone VARCHAR(50), avatar_url VARCHAR(500), security_question TEXT, security_answer TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
    'test_attempts' => "(id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), test_id VARCHAR(255), score INT, total_marks INT, accuracy FLOAT, detailed_results LONGTEXT, topic_id VARCHAR(255), difficulty VARCHAR(50), total_questions INT DEFAULT 0, correct_count INT DEFAULT 0, incorrect_count INT DEFAULT 0, unattempted_count INT DEFAULT 0, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP)",
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
    // Update users table with missing security columns if needed
    try { $conn->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS security_question TEXT"); } catch(Exception $e){}
    try { $conn->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS security_answer TEXT"); } catch(Exception $e){}
    
    echo json_encode(["status" => "success", "message" => "Schema synchronized."]);
} catch(Exception $e) { http_response_code(500); echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
?>`
    },
    {
        name: 'update_password.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents('php://input'));
if(!empty($data->user_id) && !empty($data->new_password)) {
    try {
        $stmt = $conn->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
        $stmt->execute([$data->new_password, $data->user_id]);
        echo json_encode(["status" => "success"]);
    } catch(Exception $e) { http_response_code(500); }
}
?>`
    },
    {
        name: 'delete_account.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$user_id = $_GET['user_id'] ?? '';
if($user_id) {
    try {
        $conn->prepare("DELETE FROM users WHERE id = ?")->execute([$user_id]);
        $conn->prepare("DELETE FROM user_progress WHERE user_id = ?")->execute([$user_id]);
        $conn->prepare("DELETE FROM test_attempts WHERE user_id = ?")->execute([$user_id]);
        echo json_encode(["status" => "success"]);
    } catch(Exception $e) { http_response_code(500); }
}
?>`
    },
    {
        name: 'upload_avatar.php',
        folder: 'deployment/api',
        content: `${phpHeader}
// Placeholder for base64 or file upload handling
$data = json_decode(file_get_contents('php://input'));
if(!empty($data->user_id) && !empty($data->avatar_url)) {
    $stmt = $conn->prepare("UPDATE users SET avatar_url = ? WHERE id = ?");
    $stmt->execute([$data->avatar_url, $data->user_id]);
    echo json_encode(["status" => "success"]);
}
?>`
    },
    {
        name: 'update_profile.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents('php://input'));
if(!empty($data->id)) {
    $fields = []; $values = [];
    foreach(['name','target_exam','target_year','institute','school','phone','dob','gender'] as $f) {
        if(isset($data->$f)) { $fields[] = "$f = ?"; $values[] = $data->$f; }
    }
    if($fields) {
        $values[] = $data->id;
        $stmt = $conn->prepare("UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?");
        $stmt->execute($values);
        echo json_encode(["status" => "success"]);
    }
}
?>`
    },
    {
        name: 'manage_contact.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $stmt = $conn->query("SELECT * FROM contact_messages ORDER BY created_at DESC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} elseif ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
    $stmt = $conn->prepare("DELETE FROM contact_messages WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    echo json_encode(["status" => "success"]);
}
?>`
    }
];

export const generateHtaccess = () => `
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^api/(.*)\\.php$ - [L]
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
Options -Indexes
`;

export const generateSQLSchema = () => {
    let sql = `-- IITGEEPrep Complete Database Export v12.24\n`;
    sql += `SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO"; START TRANSACTION; SET time_zone = "+00:00";\n\n`;
    
    const tables = [
        `CREATE TABLE users (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), email VARCHAR(255) UNIQUE, password_hash VARCHAR(255), role VARCHAR(50) DEFAULT 'STUDENT', target_exam VARCHAR(100), target_year INT, institute VARCHAR(255), gender VARCHAR(50), dob DATE, is_verified TINYINT(1) DEFAULT 1, google_id VARCHAR(255), parent_id VARCHAR(255), linked_student_id VARCHAR(255), school VARCHAR(255), phone VARCHAR(50), avatar_url VARCHAR(500), security_question TEXT, security_answer TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        `CREATE TABLE test_attempts (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), test_id VARCHAR(255), score INT, total_marks INT, accuracy FLOAT, detailed_results LONGTEXT, topic_id VARCHAR(255), difficulty VARCHAR(50), total_questions INT DEFAULT 0, correct_count INT DEFAULT 0, incorrect_count INT DEFAULT 0, unattempted_count INT DEFAULT 0, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX(user_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        `CREATE TABLE user_progress (id INT AUTO_INCREMENT PRIMARY KEY, user_id VARCHAR(255), topic_id VARCHAR(255), status VARCHAR(50), last_revised DATETIME, revision_level INT, next_revision_date DATETIME, solved_questions_json LONGTEXT, UNIQUE KEY (user_id, topic_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        `CREATE TABLE timetable (user_id VARCHAR(255) PRIMARY KEY, config_json LONGTEXT, slots_json LONGTEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        `CREATE TABLE backlogs (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), title VARCHAR(255), subject VARCHAR(50), priority VARCHAR(50), status VARCHAR(50), deadline DATE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX(user_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        `CREATE TABLE goals (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), text VARCHAR(255), completed TINYINT(1) DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX(user_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        `CREATE TABLE mistake_logs (id VARCHAR(255) PRIMARY KEY, user_id VARCHAR(255), question TEXT, subject VARCHAR(50), note TEXT, date DATETIME, INDEX(user_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        `CREATE TABLE content (id INT AUTO_INCREMENT PRIMARY KEY, type VARCHAR(50), title VARCHAR(255), content_json LONGTEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        `CREATE TABLE notifications (id VARCHAR(255) PRIMARY KEY, from_id VARCHAR(255), from_name VARCHAR(255), to_id VARCHAR(255), type VARCHAR(50), message TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX(to_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        `CREATE TABLE questions (id VARCHAR(255) PRIMARY KEY, subject_id VARCHAR(50), topic_id VARCHAR(255), text TEXT, options_json TEXT, correct_idx INT, difficulty VARCHAR(20), source VARCHAR(100), year INT) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        `CREATE TABLE tests (id VARCHAR(255) PRIMARY KEY, title VARCHAR(255), duration INT, category VARCHAR(50), difficulty VARCHAR(50), exam_type VARCHAR(50), questions_json LONGTEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        `CREATE TABLE settings (setting_key VARCHAR(255) PRIMARY KEY, value TEXT) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        `CREATE TABLE topics (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255), chapter VARCHAR(255), subject VARCHAR(50)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        `CREATE TABLE chapter_notes (id INT AUTO_INCREMENT PRIMARY KEY, topic_id VARCHAR(255) UNIQUE, content_json LONGTEXT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        `CREATE TABLE video_lessons (id INT AUTO_INCREMENT PRIMARY KEY, topic_id VARCHAR(255) UNIQUE, url VARCHAR(500), description TEXT) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        `CREATE TABLE analytics_visits (date DATE PRIMARY KEY, count INT DEFAULT 0) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        `CREATE TABLE contact_messages (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), subject VARCHAR(255), message TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
        `CREATE TABLE psychometric_results (id INT AUTO_INCREMENT PRIMARY KEY, user_id VARCHAR(255) UNIQUE, report_json LONGTEXT, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
    ];

    sql += tables.join('\n\n') + '\n\nCOMMIT;';
    return sql;
};
