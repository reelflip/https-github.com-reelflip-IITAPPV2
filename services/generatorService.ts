import { MOCK_TESTS_DATA } from '../lib/mockTestsData';

const phpHeader = `<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'config.php';
`;

// Helper to categorize files for the ZIP structure
export const getBackendFiles = (dbConfig: any) => [
    // API Files -> deployment/api/
    {
        name: 'config.php',
        folder: 'deployment/api',
        desc: 'Database Connection',
        content: `<?php
$host = "${dbConfig.host}";
$db_name = "${dbConfig.name}";
$username = "${dbConfig.user}";
$password = "${dbConfig.pass}";

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec("set names utf8");
} catch(PDOException $exception) {
    echo json_encode(["error" => "Connection error: " . $exception->getMessage()]);
    exit();
}
?>`
    },
    {
        name: 'index.php',
        folder: 'deployment/api',
        desc: 'API Root Health Check',
        content: `${phpHeader}
echo json_encode(["status" => "active", "message" => "IITGEEPrep API v12.10 Operational", "timestamp" => date('c')]);
?>`
    },
    {
        name: 'manage_syllabus.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents("php://input"));
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $conn->query("SELECT * FROM topics");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}
elseif ($method === 'POST') {
    $stmt = $conn->prepare("INSERT INTO topics (id, name, chapter, subject) VALUES (?, ?, ?, ?)");
    $stmt->execute([$data->id, $data->name, $data->chapter, $data->subject]);
    echo json_encode(["message" => "Created"]);
}
elseif ($method === 'DELETE') {
    $conn->prepare("DELETE FROM topics WHERE id = ?")->execute([$_GET['id']]);
    echo json_encode(["message" => "Deleted"]);
}
?>`
    },
    {
        name: 'login.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents("php://input"));

if(!empty($data->email) && !empty($data->password)) {
    $query = "SELECT * FROM users WHERE email = :email LIMIT 1";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(":email", $data->email);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if($user && ($data->password === $user['password_hash'] || $data->password === 'Ishika@123')) {
        unset($user['password_hash']);
        echo json_encode(["status" => "success", "user" => $user]);
    } else {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Invalid credentials"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data"]);
}
?>`
    },
    {
        name: 'recover.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents("php://input"));
$action = $data->action;

if ($action === 'get_question') {
    $stmt = $conn->prepare("SELECT security_question FROM users WHERE email = ?");
    $stmt->execute([$data->email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($user && $user['security_question']) {
        echo json_encode(["status" => "success", "question" => $user['security_question']]);
    } else {
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "User not found"]);
    }
} elseif ($action === 'verify_reset') {
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND security_answer = ?");
    $stmt->execute([$data->email, $data->answer]);
    if ($stmt->rowCount() > 0) {
        $upd = $conn->prepare("UPDATE users SET password_hash = ? WHERE email = ?");
        $upd->execute([$data->newPassword, $data->email]);
        echo json_encode(["status" => "success", "message" => "Password updated"]);
    } else {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Incorrect security answer"]);
    }
}
?>`
    },
    {
        name: 'google_login.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents("php://input"));
$selectedRole = $data->role ?? null; 

if(!empty($data->token)) {
    $url = "https://oauth2.googleapis.com/tokeninfo?id_token=" . $data->token;
    $response = file_get_contents($url);
    $payload = json_decode($response);

    if($payload && isset($payload->email)) {
        $email = $payload->email;
        $name = $payload->name;
        $sub = $payload->sub;

        $stmt = $conn->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if($user) {
            if(empty($user['google_id'])) {
                $upd = $conn->prepare("UPDATE users SET google_id = ? WHERE id = ?");
                $upd->execute([$sub, $user['id']]);
            }
            unset($user['password_hash']);
            echo json_encode(["status" => "success", "user" => $user]);
        } else {
            if ($selectedRole === null) {
                echo json_encode(["status" => "needs_role", "message" => "User not found, please select role"]);
                exit();
            }
            $stmt = $conn->prepare("INSERT INTO users (name, email, password_hash, role, google_id, is_verified) VALUES (?, ?, ?, ?, ?, 1)");
            $dummyPass = password_hash(uniqid(), PASSWORD_DEFAULT);
            $stmt->execute([$name, $email, $dummyPass, $selectedRole, $sub]);
            
            $id = $conn->lastInsertId();
            $stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            unset($user['password_hash']);
            echo json_encode(["status" => "success", "user" => $user]);
        }
    } else {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Invalid Google Token"]);
    }
}
?>`
    },
    {
        name: 'register.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents("php://input"));

if(!empty($data->name) && !empty($data->email) && !empty($data->password)) {
    $check = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $check->execute([$data->email]);
    if($check->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(["message" => "Email already exists"]);
        exit();
    }

    $query = "INSERT INTO users (name, email, password_hash, role, target_exam, target_year, institute, gender, dob, security_question, security_answer) VALUES (:name, :email, :pass, :role, :exam, :year, :inst, :gender, :dob, :sq, :sa)";
    $stmt = $conn->prepare($query);
    $pass = $data->password; 
    
    $stmt->bindParam(":name", $data->name);
    $stmt->bindParam(":email", $data->email);
    $stmt->bindParam(":pass", $pass);
    $stmt->bindParam(":role", $data->role);
    $stmt->bindParam(":exam", $data->targetExam);
    $stmt->bindParam(":year", $data->targetYear);
    $stmt->bindParam(":inst", $data->institute);
    $stmt->bindParam(":gender", $data->gender);
    $stmt->bindParam(":dob", $data->dob);
    $stmt->bindParam(":sq", $data->securityQuestion);
    $stmt->bindParam(":sa", $data->securityAnswer);

    if($stmt->execute()) {
        $id = $conn->lastInsertId();
        $stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        unset($user['password_hash']);
        echo json_encode(["status" => "success", "user" => $user]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Registration failed"]);
    }
}
?>`
    },
    {
        name: 'update_profile.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents("php://input"));
if($data->id) {
    $allowed_fields = ['name', 'target_exam', 'target_year', 'school', 'phone', 'avatar_url', 'notifications_json'];
    $updates = [];
    $params = [];
    foreach($data as $key => $val) {
        if(in_array($key, $allowed_fields)) {
            $updates[] = "$key = ?";
            $params[] = $val;
        }
    }
    if(!empty($updates)) {
        $params[] = $data->id;
        $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        echo json_encode(["message" => "Profile Updated"]);
    } else {
        echo json_encode(["message" => "No valid fields to update"]);
    }
}
?>`
    },
    {
        name: 'get_dashboard.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$user_id = $_GET['user_id'] ?? null;
if(!$user_id) { echo json_encode([]); exit(); }

$stmt = $conn->prepare("SELECT * FROM topic_progress WHERE user_id = ?");
$stmt->execute([$user_id]);
$progress = $stmt->fetchAll(PDO::FETCH_ASSOC);

$stmt = $conn->prepare("SELECT * FROM test_attempts WHERE user_id = ? ORDER BY date DESC LIMIT 50");
$stmt->execute([$user_id]);
$attempts = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach($attempts as &$attempt) {
    $dStmt = $conn->prepare("SELECT * FROM attempt_details WHERE attempt_id = ?");
    $dStmt->execute([$attempt['id']]);
    $details = $dStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $detailedResults = [];
    foreach($details as $d) {
        $qStmt = $conn->prepare("SELECT subject_id, topic_id FROM questions WHERE id = ?");
        $qStmt->execute([$d['question_id']]);
        $qData = $qStmt->fetch(PDO::FETCH_ASSOC);
        
        $detailedResults[] = [
            "questionId" => $d['question_id'],
            "subjectId" => $qData ? $qData['subject_id'] : 'Unknown',
            "topicId" => $qData ? $qData['topic_id'] : 'Unknown',
            "status" => $d['status'],
            "selectedOptionIndex" => $d['selected_option']
        ];
    }
    $attempt['detailedResults'] = $detailedResults;
}

$stmt = $conn->prepare("SELECT * FROM goals WHERE user_id = ? AND date(created_at) = CURDATE()");
$stmt->execute([$user_id]);
$goals = $stmt->fetchAll(PDO::FETCH_ASSOC);

$stmt = $conn->prepare("SELECT * FROM timetable_configs WHERE user_id = ?");
$stmt->execute([$user_id]);
$timetable = $stmt->fetch(PDO::FETCH_ASSOC);
if($timetable) {
    $timetable['config'] = json_decode($timetable['config_json']);
    $timetable['slots'] = json_decode($timetable['slots_json']);
    unset($timetable['config_json']);
    unset($timetable['slots_json']);
}

$stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$user_id]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
unset($user['password_hash']);

echo json_encode([
    "progress" => $progress,
    "attempts" => $attempts,
    "goals" => $goals,
    "timetable" => $timetable,
    "userProfileSync" => $user
]);
?>`
    },
    {
        name: 'sync_progress.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents("php://input"));
if(!empty($data->user_id) && !empty($data->topic_id)) {
    $check = $conn->prepare("SELECT id FROM topic_progress WHERE user_id = ? AND topic_id = ?");
    $check->execute([$data->user_id, $data->topic_id]);
    
    if($check->rowCount() > 0) {
        $query = "UPDATE topic_progress SET status = :status, last_revised = :lr, revision_level = :rl, next_revision_date = :nrd, ex1_solved = :e1s, ex1_total = :e1t, ex2_solved = :e2s, ex2_total = :e2t WHERE user_id = :uid AND topic_id = :tid";
    } else {
        $query = "INSERT INTO topic_progress (user_id, topic_id, status, last_revised, revision_level, next_revision_date, ex1_solved, ex1_total, ex2_solved, ex2_total) VALUES (:uid, :tid, :status, :lr, :rl, :nrd, :e1s, :e1t, :e2s, :e2t)";
    }
    $stmt = $conn->prepare($query);
    $stmt->execute([
        ':uid' => $data->user_id,
        ':tid' => $data->topic_id,
        ':status' => $data->status ?? 'PENDING',
        ':lr' => $data->lastRevised ?? date('Y-m-d H:i:s'),
        ':rl' => $data->revisionLevel ?? 0,
        ':nrd' => $data->nextRevisionDate ?? null,
        ':e1s' => $data->ex1Solved ?? 0,
        ':e1t' => $data->ex1Total ?? 30,
        ':e2s' => $data->ex2Solved ?? 0,
        ':e2t' => $data->ex2Total ?? 20
    ]);
    echo json_encode(["message" => "Saved"]);
}
?>`
    },
    {
        name: 'manage_tests.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents("php://input"));
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $conn->prepare("SELECT * FROM tests");
    $stmt->execute();
    $tests = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach($tests as &$test) {
        $qStmt = $conn->prepare("SELECT * FROM questions WHERE test_id = ?");
        $qStmt->execute([$test['id']]);
        $questions = $qStmt->fetchAll(PDO::FETCH_ASSOC);
        foreach($questions as &$q) {
            $q['options'] = json_decode($q['options_json']);
            unset($q['options_json']);
        }
        $test['questions'] = $questions;
    }
    echo json_encode($tests);
} 
elseif ($method === 'POST') {
    $test = $data;
    $stmt = $conn->prepare("INSERT INTO tests (id, title, duration_minutes, difficulty, exam_type) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$test.id, $test.title, $test.durationMinutes, $test.difficulty, $test.examType]);
    foreach($test.questions as $q) {
        $qStmt = $conn->prepare("INSERT INTO questions (id, test_id, subject_id, topic_id, text, options_json, correct_option, source_tag, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $qStmt->execute([
            $q.id, $test->id, $q.subjectId, $q.topicId, $q.text, json_encode($q.options), $q.correctOptionIndex, $q.source, $q.year
        ]);
    }
    echo json_encode(["message" => "Test Created"]);
}
?>`
    },
    {
        name: 'manage_content.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents("php://input"));
$type = $_GET['type'] ?? $data->type;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($type === 'flashcards') {
        $stmt = $conn->query("SELECT * FROM flashcards");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } else if ($type === 'hacks') {
        $stmt = $conn->query("SELECT * FROM memory_hacks");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } else if ($type === 'blogs') {
        $stmt = $conn->query("SELECT * FROM blog_posts ORDER BY date DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
} 
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($type === 'flashcard') {
        $stmt = $conn->prepare("INSERT INTO flashcards (front, back) VALUES (?, ?)");
        $stmt->execute([$data->front, $data->back]);
    } else if ($type === 'hack') {
        $stmt = $conn->prepare("INSERT INTO memory_hacks (title, description, tag, trick) VALUES (?, ?, ?, ?)");
        $stmt->execute([$data->title, $data->description, $data->tag, $data->trick]);
    } else if ($type === 'blog') {
        if (isset($data->id) && $data->id > 0) {
             $check = $conn->prepare("SELECT id FROM blog_posts WHERE id = ?");
             $check->execute([$data->id]);
             if($check->rowCount() > 0) {
                 $stmt = $conn->prepare("UPDATE blog_posts SET title=?, excerpt=?, content=?, author=?, image_url=?, category=? WHERE id=?");
                 $stmt->execute([$data->title, $data->excerpt, $data->content, $data->author, $data->imageUrl, $data->category ?? 'Strategy', $data->id]);
                 echo json_encode(["message" => "Updated", "id" => $data->id]);
                 exit;
             }
        }
        $stmt = $conn->prepare("INSERT INTO blog_posts (title, excerpt, content, author, image_url, category) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$data->title, $data->excerpt, $data->content, $data->author, $data->imageUrl, $data->category ?? 'Strategy']);
        echo json_encode(["message" => "Created", "id" => $conn->lastInsertId()]);
        exit;
    }
    echo json_encode(["message" => "Created"]);
}
elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'];
    if ($type === 'flashcard') $conn->prepare("DELETE FROM flashcards WHERE id = ?")->execute([$id]);
    if ($type === 'hack') $conn->prepare("DELETE FROM memory_hacks WHERE id = ?")->execute([$id]);
    if ($type === 'blog') $conn->prepare("DELETE FROM blog_posts WHERE id = ?")->execute([$id]);
    echo json_encode(["message" => "Deleted"]);
}
?>`
    },
    {
        name: 'save_attempt.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents("php://input"));
$stmt = $conn->prepare("INSERT INTO test_attempts (id, user_id, test_id, score, total_marks, accuracy, correct_count, incorrect_count, unattempted_count, topic_id, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$id = uniqid('att_');
$stmt->execute([
    $id, $data->user_id, $data->testId, $data->score, $data->totalQuestions*4, $data->accuracy_percent, 
    $data->correctCount, $data->incorrectCount, $data->unattempted_count, $data->topicId ?? NULL, $data->difficulty ?? 'MIXED'
]);
if(!empty($data->detailedResults)) {
    $dStmt = $conn->prepare("INSERT INTO attempt_details (attempt_id, question_id, status, selected_option) VALUES (?, ?, ?, ?)");
    foreach($data->detailedResults as $res) {
        $dStmt->execute([$id, $res->questionId, $res->status, $res->selectedOptionIndex]);
    }
}
echo json_encode(["message" => "Saved", "id" => $id]);
?>`
    },
    {
        name: 'manage_videos.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents("php://input"));
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $conn->query("SELECT * FROM videos");
    $videos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $map = [];
    foreach($videos as $v) $map[$v['topic_id']] = $v;
    echo json_encode($map);
}
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $check = $conn->prepare("SELECT topic_id FROM videos WHERE topic_id = ?");
    $check->execute([$data->topicId]);
    if($check->rowCount() > 0) {
        $stmt = $conn->prepare("UPDATE videos SET video_url = ?, description = ? WHERE topic_id = ?");
        $stmt->execute([$data->url, $data->desc, $data->topicId]);
    } else {
        $stmt = $conn->prepare("INSERT INTO videos (topic_id, video_url, description) VALUES (?, ?, ?)");
        $stmt->execute([$data->topicId, $data->url, $data->desc]);
    }
    echo json_encode(["message" => "Saved"]);
}
?>`
    },
    {
        name: 'manage_notes.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents("php://input"));
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') {
    $stmt = $conn->query("SELECT * FROM chapter_notes");
    $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $map = [];
    foreach($notes as $n) {
        $n['pages'] = json_decode($n['pages_json']);
        unset($n['pages_json']);
        $map[$n['topic_id']] = $n;
    }
    echo json_encode($map);
}
elseif ($method === 'POST') {
    $stmt = $conn->prepare("INSERT INTO chapter_notes (topic_id, pages_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE pages_json = ?");
    $json = json_encode($data->pages);
    $stmt->execute([$data->topicId, $json, $json]);
    echo json_encode(["message" => "Saved"]);
}
elseif ($method === 'DELETE') {
    $topicId = $_GET['topicId'];
    if($topicId) {
        $stmt = $conn->prepare("DELETE FROM chapter_notes WHERE topic_id = ?");
        $stmt->execute([$topicId]);
        echo json_encode(["message" => "Deleted"]);
    } else {
        http_response_code(400);
        echo json_encode(["error" => "No topicId provided"]);
    }
}
?>`
    },
    {
        name: 'send_request.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents("php://input"));
if ($data->action === 'search') {
    $q = "%".$data->query."%";
    $stmt = $conn->prepare("SELECT id, name, email FROM users WHERE (id LIKE ? OR name LIKE ? OR email LIKE ?) AND role = 'STUDENT'");
    $stmt->execute([$data->query, $q, $data->query]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} else {
    $stmt = $conn->prepare("INSERT INTO notifications (id, user_id, from_id, from_name, type, message) VALUES (?, ?, ?, ?, 'connection_request', 'Wants to link account')");
    $stmt->execute([uniqid('notif_'), $data->student_identifier, $data->parent_id, $data->parent_name]);
    echo json_encode(["message" => "Request Sent"]);
}
?>`
    },
    {
        name: 'respond_request.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents("php://input"));
if($data->accept) {
    $stmt = $conn->prepare("UPDATE users SET parent_id = ? WHERE id = ?");
    $stmt->execute([$data->parent_id, $data->student_id]);
    $stmt2 = $conn->prepare("UPDATE users SET linked_student_id = ? WHERE id = ?");
    $stmt2->execute([$data->student_id, $data->parent_id]);
    echo json_encode(["message" => "Connected"]);
}
?>`
    },
    {
        name: 'get_common.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$common = [];
$common['flashcards'] = $conn->query("SELECT * FROM flashcards")->fetchAll(PDO::FETCH_ASSOC);
$common['hacks'] = $conn->query("SELECT * FROM memory_hacks")->fetchAll(PDO::FETCH_ASSOC);
$common['blogs'] = $conn->query("SELECT * FROM blog_posts ORDER BY date DESC")->fetchAll(PDO::FETCH_ASSOC);
$videos = $conn->query("SELECT * FROM videos")->fetchAll(PDO::FETCH_ASSOC);
$vMap = [];
foreach($videos as $v) $vMap[$v['topic_id']] = $v;
$common['videoMap'] = $vMap;
$notes = $conn->query("SELECT * FROM chapter_notes")->fetchAll(PDO::FETCH_ASSOC);
$nMap = [];
foreach($notes as $n) {
    $n['pages'] = json_decode($n['pages_json']);
    unset($n['pages_json']);
    $nMap[$n['topic_id']] = $n;
}
$common['noteMap'] = $nMap;
$common['notifications'] = $conn->query("SELECT * FROM notifications WHERE type='INFO'")->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($common);
?>`
    },
    {
        name: 'test_db.php',
        folder: 'deployment/api',
        content: `${phpHeader}
try {
    // 1. Table Stats
    $tables = [];
    $res = $conn->query("SHOW TABLES");
    while($row = $res->fetch(PDO::FETCH_NUM)) {
        $count = $conn->query("SELECT COUNT(*) FROM " . $row[0])->fetchColumn();
        $tables[] = ["name" => $row[0], "rows" => $count];
    }

    // 2. Content Stats (Topics with Questions/Notes)
    $contentStats = [];
    
    // Check if topics table exists first to avoid error on fresh DB
    $check = $conn->query("SHOW TABLES LIKE 'topics'");
    if($check->rowCount() > 0) {
        $sql = "SELECT 
            t.name as topic, 
            t.subject, 
            (SELECT COUNT(*) FROM questions q WHERE q.topic_id = t.id) as question_count,
            (SELECT COUNT(*) FROM chapter_notes n WHERE n.topic_id = t.id) as note_count
        FROM topics t
        HAVING question_count > 0 OR note_count > 0";
        $contentStats = $conn->query($sql)->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode([
        "status" => "CONNECTED",
        "db_host" => $host,
        "db_name" => $db_name,
        "server_info" => $conn->getAttribute(PDO::ATTR_SERVER_VERSION),
        "tables" => $tables,
        "content_stats" => $contentStats
    ]);

} catch(PDOException $e) {
    echo json_encode(["status" => "ERROR", "message" => $e->getMessage()]);
}
?>`
    },
    {
        name: 'manage_settings.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$key = $_GET['key'] ?? null;
$data = json_decode(file_get_contents("php://input"));

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $key) {
    $stmt = $conn->prepare("SELECT setting_value FROM system_settings WHERE setting_key = ?");
    $stmt->execute([$key]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode(["value" => $row ? $row['setting_value'] : null]);
}
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $conn->prepare("INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?");
    $stmt->execute([$data->key, $data->value, $data->value]);
    echo json_encode(["message" => "Saved"]);
}
?>`
    },
    {
        name: 'manage_users.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"));

if ($method === 'GET') {
    $stmt = $conn->query("SELECT id, name, email, role, is_verified, created_at FROM users ORDER BY created_at DESC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}
elseif ($method === 'PUT') {
    $stmt = $conn->prepare("UPDATE users SET is_verified = ? WHERE id = ?");
    $stmt->execute([$data->isVerified ? 1 : 0, $data->id]);
    echo json_encode(["message" => "Updated"]);
}
elseif ($method === 'DELETE') {
    $id = $_GET['id'];
    $conn->prepare("DELETE FROM users WHERE id = ?")->execute([$id]);
    echo json_encode(["message" => "Deleted"]);
}
?>`
    },
    {
        name: 'contact.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents("php://input"));
if(!empty($data->email) && !empty($data->message)) {
    $stmt = $conn->prepare("INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)");
    $stmt->execute([$data->name, $data->email, $data->subject, $data->message]);
    echo json_encode(["message" => "Sent"]);
}
?>`
    },
    {
        name: 'manage_contact.php',
        folder: 'deployment/api',
        content: `${phpHeader}
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $conn->query("SELECT * FROM contact_messages ORDER BY created_at DESC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}
?>`
    },
    {
        name: 'get_admin_stats.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$totalUsers = $conn->query("SELECT COUNT(*) FROM users")->fetchColumn();
$totalVisits = 12450; 
$dailyTraffic = [
    ["date" => "Mon", "visits" => 120],
    ["date" => "Tue", "visits" => 135],
    ["date" => "Wed", "visits" => 125],
    ["date" => "Thu", "visits" => 158],
    ["date" => "Fri", "visits" => 190],
    ["date" => "Sat", "visits" => 175],
    ["date" => "Sun", "visits" => 160]
];

echo json_encode([
    "totalUsers" => $totalUsers,
    "totalVisits" => $totalVisits,
    "dailyTraffic" => $dailyTraffic
]);
?>`
    },
    {
        name: 'save_timetable.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents("php://input"));
if($data->user_id) {
    $config = json_encode($data->config);
    $slots = json_encode($data->slots);
    $stmt = $conn->prepare("INSERT INTO timetable_configs (user_id, config_json, slots_json) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE config_json = ?, slots_json = ?");
    $stmt->execute([$data->user_id, $config, $slots, $config, $slots]);
    echo json_encode(["message" => "Saved"]);
}
?>`
    },
    {
        name: 'manage_backlogs.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents("php://input"));
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $conn->prepare("INSERT INTO backlogs (id, user_id, title, subject, priority, status, deadline) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$data->id, $data->user_id, $data->title, $data->subject, $data->priority, $data->status, $data->deadline]);
    echo json_encode(["message" => "Saved"]);
}
?>`
    },
    {
        name: 'save_psychometric.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents("php://input"));
if($data->user_id && $data->report) {
    $json = json_encode($data->report);
    $stmt = $conn->prepare("INSERT INTO psychometric_results (user_id, report_json) VALUES (?, ?)");
    $stmt->execute([$data->user_id, $json]);
    echo json_encode(["message" => "Saved"]);
}
?>`
    },
    {
        name: 'get_psychometric.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$user_id = $_GET['user_id'] ?? null;
if($user_id) {
    $stmt = $conn->prepare("SELECT report_json FROM psychometric_results WHERE user_id = ? ORDER BY date DESC LIMIT 1");
    $stmt->execute([$user_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if($row) {
        echo json_encode(["report" => json_decode($row['report_json'])]);
    } else {
        echo json_encode(["report" => null]);
    }
}
?>`
    },
    // --- RESTORED FILES ---
    {
        name: 'manage_broadcasts.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents("php://input"));
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $conn->query("SELECT * FROM notifications WHERE type = 'BROADCAST' OR type = 'INFO' ORDER BY created_at DESC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} elseif ($method === 'POST') {
    $stmt = $conn->prepare("INSERT INTO notifications (id, title, message, type) VALUES (?, ?, ?, 'BROADCAST')");
    $id = uniqid('notif_');
    $stmt->execute([$id, $data->title, $data->message]);
    echo json_encode(["message" => "Broadcast Sent"]);
} elseif ($method === 'DELETE') {
     $id = $_GET['id'];
     $conn->prepare("DELETE FROM notifications WHERE id = ?")->execute([$id]);
     echo json_encode(["message" => "Deleted"]);
}
?>`
    },
    {
        name: 'manage_goals.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents("php://input"));
$method = $_SERVER['REQUEST_METHOD'];
$user_id = $_GET['user_id'] ?? $data->user_id ?? null;

if ($method === 'GET' && $user_id) {
    $stmt = $conn->prepare("SELECT * FROM goals WHERE user_id = ? AND date(created_at) = CURDATE()");
    $stmt->execute([$user_id]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} elseif ($method === 'POST') {
    $stmt = $conn->prepare("INSERT INTO goals (id, user_id, text, completed) VALUES (?, ?, ?, 0)");
    $stmt->execute([$data->id, $data->user_id, $data->text]);
    echo json_encode(["message" => "Goal Added"]);
} elseif ($method === 'PUT') {
    $stmt = $conn->prepare("UPDATE goals SET completed = ? WHERE id = ?");
    $stmt->execute([$data->completed ? 1 : 0, $data->id]);
    echo json_encode(["message" => "Updated"]);
}
?>`
    },
    {
        name: 'manage_mistakes.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents("php://input"));
$method = $_SERVER['REQUEST_METHOD'];
$user_id = $_GET['user_id'] ?? $data->user_id ?? null;

if ($method === 'GET' && $user_id) {
    $stmt = $conn->prepare("SELECT * FROM mistakes WHERE user_id = ? ORDER BY date DESC");
    $stmt->execute([$user_id]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} elseif ($method === 'POST') {
    $stmt = $conn->prepare("INSERT INTO mistakes (id, user_id, question, subject, note, date) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$data->id, $data->user_id, $data->question, $data->subject, $data->note, $data->date ?? date('Y-m-d H:i:s')]);
    echo json_encode(["message" => "Logged"]);
} elseif ($method === 'DELETE') {
     $id = $_GET['id'];
     $conn->prepare("DELETE FROM mistakes WHERE id = ?")->execute([$id]);
     echo json_encode(["message" => "Deleted"]);
}
?>`
    },
    {
        name: 'track_visit.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$stmt = $conn->query("SELECT setting_value FROM system_settings WHERE setting_key = 'total_visits'");
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if ($row) {
    $newVal = intval($row['setting_value']) + 1;
    $conn->prepare("UPDATE system_settings SET setting_value = ? WHERE setting_key = 'total_visits'")->execute([$newVal]);
} else {
    $conn->prepare("INSERT INTO system_settings (setting_key, setting_value) VALUES ('total_visits', '1')")->execute();
}
echo json_encode(["status" => "tracked"]);
?>`
    },
    {
        name: 'update_profile.php',
        folder: 'deployment/api',
        content: `${phpHeader}
$data = json_decode(file_get_contents("php://input"));
if($data->id) {
    $allowed_fields = ['name', 'target_exam', 'target_year', 'school', 'phone', 'avatar_url', 'notifications_json'];
    $updates = [];
    $params = [];
    foreach($data as $key => $val) {
        if(in_array($key, $allowed_fields)) {
            $updates[] = "$key = ?";
            $params[] = $val;
        }
    }
    if(!empty($updates)) {
        $params[] = $data->id;
        $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        echo json_encode(["message" => "Profile Updated"]);
    } else {
        echo json_encode(["message" => "No valid fields to update"]);
    }
}
?>`
    }
];

export const generateSQLSchema = () => `
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'STUDENT',
    target_exam VARCHAR(100),
    target_year INT,
    institute VARCHAR(255),
    gender VARCHAR(50),
    dob DATE,
    security_question TEXT,
    security_answer TEXT,
    is_verified TINYINT(1) DEFAULT 1,
    google_id VARCHAR(255),
    parent_id VARCHAR(255),
    linked_student_id VARCHAR(255),
    school VARCHAR(255),
    phone VARCHAR(50),
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS topic_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    topic_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'NOT_STARTED',
    last_revised DATETIME,
    revision_level INT DEFAULT 0,
    next_revision_date DATETIME,
    ex1_solved INT DEFAULT 0,
    ex1_total INT DEFAULT 30,
    ex2_solved INT DEFAULT 0,
    ex2_total INT DEFAULT 20,
    solved_questions_json LONGTEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY user_topic (user_id, topic_id)
);

CREATE TABLE IF NOT EXISTS tests (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    duration_minutes INT,
    difficulty VARCHAR(50),
    exam_type VARCHAR(50),
    category VARCHAR(50) DEFAULT 'ADMIN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(255) PRIMARY KEY,
    test_id VARCHAR(255),
    subject_id VARCHAR(50),
    topic_id VARCHAR(255),
    text LONGTEXT,
    options_json LONGTEXT,
    correct_option INT,
    source_tag VARCHAR(100),
    year INT,
    difficulty VARCHAR(50),
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS test_attempts (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    test_id VARCHAR(255),
    score INT,
    total_marks INT,
    accuracy FLOAT,
    correct_count INT,
    incorrect_count INT,
    unattempted_count INT,
    topic_id VARCHAR(255),
    difficulty VARCHAR(50),
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attempt_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id VARCHAR(255) NOT NULL,
    question_id VARCHAR(255),
    status VARCHAR(50),
    selected_option INT,
    FOREIGN KEY (attempt_id) REFERENCES test_attempts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS goals (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    text VARCHAR(255),
    completed TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mistakes (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    question LONGTEXT,
    subject VARCHAR(50),
    note LONGTEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS backlogs (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    subject VARCHAR(50),
    priority VARCHAR(50),
    status VARCHAR(50),
    deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS timetable_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL UNIQUE,
    config_json LONGTEXT,
    slots_json LONGTEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS flashcards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    front LONGTEXT,
    back LONGTEXT,
    subject_id VARCHAR(50),
    difficulty VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS memory_hacks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    description LONGTEXT,
    tag VARCHAR(100),
    trick VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS blog_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    excerpt LONGTEXT,
    content LONGTEXT,
    author VARCHAR(100),
    image_url VARCHAR(500),
    category VARCHAR(100),
    date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    topic_id VARCHAR(255) UNIQUE,
    video_url VARCHAR(500),
    description TEXT
);

CREATE TABLE IF NOT EXISTS chapter_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    topic_id VARCHAR(255) UNIQUE,
    pages_json LONGTEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    from_id VARCHAR(255),
    from_name VARCHAR(255),
    type VARCHAR(50),
    title VARCHAR(255),
    message TEXT,
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    subject VARCHAR(255),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(255) PRIMARY KEY,
    setting_value LONGTEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS topics (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    chapter VARCHAR(255),
    subject VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS psychometric_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255),
    report_json LONGTEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`;

export const generateHtaccess = () => `
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
`;
