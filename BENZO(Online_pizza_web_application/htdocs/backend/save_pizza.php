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

// Get values
$userId = trim($data["userId"] ?? "");
$name = trim($data["name"] ?? "");
$type = trim($data["type"] ?? "custom");
$size = trim($data["size"] ?? "");
$crust = trim($data["crust"] ?? "");
$sauce = $data["sauce"] ?? [];
$toppings = $data["toppings"] ?? [];
$city = trim($data["city"] ?? "");
$flavor = trim($data["flavor"] ?? "");
$description = trim($data["description"] ?? "");
$price = floatval($data["price"] ?? 0);
$likes = intval($data["likes"] ?? 0);
$views = intval($data["views"] ?? 0);

// Validate required fields
if ($userId === "" || $name === "") {
    echo json_encode([
        "success" => false,
        "message" => "User ID and pizza name are required."
    ]);
    exit;
}

// Convert arrays to JSON for database
$sauceJson = json_encode($sauce);
$toppingsJson = json_encode($toppings);

// Save pizza
$stmt = $conn->prepare(
    "INSERT INTO saved_pizzas
    (user_id, name, type, size, crust, sauce, toppings, city, flavor, description, price, likes, views)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
);

$stmt->bind_param(
    "ssssssssssdii",
    $userId,
    $name,
    $type,
    $size,
    $crust,
    $sauceJson,
    $toppingsJson,
    $city,
    $flavor,
    $description,
    $price,
    $likes,
    $views
);

if ($stmt->execute()) {

    echo json_encode([
        "success" => true,
        "message" => "Pizza saved successfully.",
        "data" => [
            "pizzaId" => $conn->insert_id
        ]
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => "Failed to save pizza: " . $stmt->error
    ]);
}

$stmt->close();
$conn->close();

?>