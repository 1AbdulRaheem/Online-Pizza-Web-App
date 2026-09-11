<?php

header("Content-Type: application/json");

require_once "db.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
    ]);
    exit;
}

$userId = trim($_GET["userId"] ?? "");

if ($userId === "") {
    echo json_encode([
        "success" => false,
        "message" => "User ID is required."
    ]);
    exit;
}

$userStmt = $conn->prepare(
    "SELECT id, name, email
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

$user = $userResult->fetch_assoc();
$userStmt->close();

$orderStmt = $conn->prepare(
    "SELECT
        id,
        order_number,
        user_id,
        items,
        subtotal,
        discount_percent,
        discount_amount,
        final_total,
        complimentary_item,
        status,
        delivery_type,
        phone,
        address,
        payment_method,
        membership,
        level,
        xp_earned,
        created_at
     FROM orders
     WHERE user_id = ?
     ORDER BY created_at DESC"
);

$orderStmt->bind_param("s", $userId);
$orderStmt->execute();

$orderResult = $orderStmt->get_result();

$orders = [];

while ($row = $orderResult->fetch_assoc()) {

    $row["items"] = json_decode($row["items"] ?? "[]", true);

    if (!is_array($row["items"])) {
        $row["items"] = [];
    }

    $row["complimentary_item"] = json_decode(
        $row["complimentary_item"] ?? "null",
        true
    );

    $orders[] = $row;
}

$orderStmt->close();

echo json_encode([
    "success" => true,
    "data" => [
        "user" => [
            "userId" => $user["id"],
            "name" => $user["name"],
            "email" => $user["email"]
        ],
        "orders" => $orders,
        "orderCount" => count($orders)
    ]
]);

$conn->close();

?>