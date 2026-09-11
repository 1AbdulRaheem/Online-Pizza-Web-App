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
$orderNumber = trim($data["orderNumber"] ?? "");

if ($userId === "" || $orderNumber === "") {
    echo json_encode([
        "success" => false,
        "message" => "User ID and order number are required."
    ]);
    exit;
}

/*
 * First find the order.
 * We check BOTH user_id and order_number
 * so one user cannot delete another user's order.
 */

$findStmt = $conn->prepare(
    "SELECT id
     FROM orders
     WHERE user_id = ?
     AND order_number = ?
     LIMIT 1"
);

$findStmt->bind_param(
    "ss",
    $userId,
    $orderNumber
);

$findStmt->execute();

$result = $findStmt->get_result();

if ($result->num_rows === 0) {

    echo json_encode([
        "success" => false,
        "message" => "Order not found."
    ]);

    $findStmt->close();
    $conn->close();
    exit;
}

$order = $result->fetch_assoc();

$orderId = $order["id"];

$findStmt->close();


/*
 * Delete the order.
 */

$deleteStmt = $conn->prepare(
    "DELETE FROM orders
     WHERE user_id = ?
     AND order_number = ?"
);

$deleteStmt->bind_param(
    "ss",
    $userId,
    $orderNumber
);

if ($deleteStmt->execute()) {

    echo json_encode([
        "success" => true,
        "message" => "Order deleted successfully.",
        "data" => [
            "orderId" => $orderId,
            "orderNumber" => $orderNumber
        ]
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Failed to delete order: " . $deleteStmt->error
    ]);
}

$deleteStmt->close();
$conn->close();

?>