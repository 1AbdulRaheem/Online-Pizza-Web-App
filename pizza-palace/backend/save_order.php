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

$items = $data["items"] ?? [];

$subtotal = floatval($data["subtotal"] ?? 0);
$discountPercent = floatval($data["discountPercent"] ?? 0);
$discountAmount = floatval($data["discountAmount"] ?? 0);
$finalTotal = floatval($data["finalTotal"] ?? 0);

$complimentaryItem = $data["complimentaryItem"] ?? null;

$status = trim($data["status"] ?? "confirmed");
$deliveryType = trim($data["deliveryType"] ?? "pickup");
$phone = trim($data["phone"] ?? "");
$address = trim($data["address"] ?? "");
$paymentMethod = trim($data["paymentMethod"] ?? "cash");

$membership = trim($data["membership"] ?? "");
$level = intval($data["level"] ?? 1);
$xpEarned = intval($data["xpEarned"] ?? 0);

if ($userId === "" || $orderNumber === "") {
    echo json_encode([
        "success" => false,
        "message" => "User ID and order number are required."
    ]);
    exit;
}

$userStmt = $conn->prepare(
    "SELECT id FROM users WHERE id = ? LIMIT 1"
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

$itemsJson = json_encode($items);
$complimentaryJson = json_encode($complimentaryItem);

$stmt = $conn->prepare(
    "INSERT INTO orders
    (
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
        xp_earned
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
);

$stmt->bind_param(
    "sssddddsssssssii",
    $orderNumber,
    $userId,
    $itemsJson,
    $subtotal,
    $discountPercent,
    $discountAmount,
    $finalTotal,
    $complimentaryJson,
    $status,
    $deliveryType,
    $phone,
    $address,
    $paymentMethod,
    $membership,
    $level,
    $xpEarned
);

if ($stmt->execute()) {

    echo json_encode([
        "success" => true,
        "message" => "Order saved successfully.",
        "data" => [
            "orderId" => $conn->insert_id,
            "orderNumber" => $orderNumber
        ]
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Failed to save order: " . $stmt->error
    ]);
}

$stmt->close();
$conn->close();

?>