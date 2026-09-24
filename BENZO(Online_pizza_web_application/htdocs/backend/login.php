<?php

header("Content-Type: application/json");

require_once "db.php";

// Only allow POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
    ]);
    exit;
} 

// Get JSON data from JavaScript
$data = json_decode(file_get_contents("php://input"), true);

$email = trim($data["email"] ?? "");
$password = $data["password"] ?? "";

// Validate
if ($email === "" || $password === "") {
    echo json_encode([
        "success" => false,
        "message" => "Email and password are required."
    ]);
    exit;
}

// Find user by email
$stmt = $conn->prepare(
    "SELECT id, name, email, password, role, level
     FROM users
     WHERE email = ?
     LIMIT 1"
);

$stmt->bind_param("s", $email);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "success" => false,
        "message" => "Incorrect email or password."
    ]);

    $stmt->close();
    $conn->close();
    exit;
}

$user = $result->fetch_assoc();

// Check password
if ($password !== $user["password"]) {
    echo json_encode([
        "success" => false,
        "message" => "Incorrect email or password."
    ]);

    $stmt->close();
    $conn->close();
    exit;
} 

// Update user's last login time
$updateLogin = $conn->prepare(
    "UPDATE users SET last_login = NOW() WHERE id = ?"
);

$updateLogin->bind_param("s", $user["id"]);
$updateLogin->execute();
$updateLogin->close();

// Login successful
echo json_encode([
    "success" => true,
    "message" => "Credentials valid.",
    "data" => [
        "userId" => $user["id"],
        "role" => $user["role"],
        "name" => $user["name"],
        "email" => $user["email"],
        "level" => $user["level"]
    ]
]);

$stmt->close();
$conn->close();

?>