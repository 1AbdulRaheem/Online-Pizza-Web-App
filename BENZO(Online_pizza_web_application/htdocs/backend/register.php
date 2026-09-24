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

// Get JSON data sent by JavaScript
$data = json_decode(file_get_contents("php://input"), true);

$name = trim($data["name"] ?? "");
$email = trim($data["email"] ?? "");
$password = $data["password"] ?? "";
$phone = trim($data["phone"] ?? "");

// Validate required fields
if ($name === "" || $email === "" || $password === "") {
    echo json_encode([
        "success" => false,
        "message" => "Name, email and password are required."
    ]);
    exit;
}

// Check if email already exists
$check = $conn->prepare("SELECT id FROM users WHERE email = ?");
$check->bind_param("s", $email);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    echo json_encode([
        "success" => false,
        "message" => "This email is already registered."
    ]);
    $check->close();
    $conn->close();
    exit;
}

$check->close();

// Default values from your existing api.js
$role = "nonvip";
$level = 1;

// Generate user ID similar to your existing system
$id = "u_" . time() . "_" . rand(1000, 9999);

// Save user
$stmt = $conn->prepare(
    "INSERT INTO users (id, name, email, phone, password, role, level)
     VALUES (?, ?, ?, ?, ?, ?, ?)"
);

$stmt->bind_param(
    "ssssssi",
    $id,
    $name,
    $email,
    $phone,
    $password,
    $role,
    $level
);

if ($stmt->execute()) {

    echo json_encode([ 
        "success" => true,
        "message" => "Account created successfully.",
        "data" => [
            "userId" => $id
        ]
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Database insert failed: " . $stmt->error
    ]);
}