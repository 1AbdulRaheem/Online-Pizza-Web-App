<?php

header("Content-Type: application/json");

require_once "db.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$userId = trim($data["userId"] ?? "");

if ($userId === "") {
    echo json_encode([
        "success" => false,
        "message" => "User ID is required."
    ]);
    exit;
}

/*
 * Make sure the user exists.
 */

$userStmt = $conn->prepare(
    "SELECT id
     FROM users
     WHERE id = ?
     LIMIT 1"
);

$userStmt->bind_param("s", $userId);
$userStmt->execute();

$userResult = $userStmt->get_result();

if ($userResult->num_rows === 0) {

    echo json_encode([
        "success" => false,
        "message" => "User not found."
    ]);

    $userStmt->close();
    $conn->close();
    exit;
}

$userStmt->close();


/*
 * Delete ALL orders belonging only to this user.
 */

$deleteStmt = $conn->prepare(
    "DELETE FROM orders
     WHERE user_id = ?"
);

$deleteStmt->bind_param("s", $userId);

if ($deleteStmt->execute()) {

    echo json_encode([
        "success" => true,
        "message" => "All orders deleted successfully.",
        "data" => [
            "deletedCount" => $deleteStmt->affected_rows
        ]
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Failed to delete orders: " . $deleteStmt->error
    ]);
}

$deleteStmt->close();
$conn->close();

?>