
<?php

header("Content-Type: application/json");

require_once "db.php";

// Only allow GET requests
if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
    ]);
    exit;
}

// Get user ID from URL
$userId = trim($_GET["userId"] ?? "");

// Validate user ID
if ($userId === "") {
    echo json_encode([
        "success" => false,
        "message" => "User ID is required."
    ]);
    exit;
}


// ================= USER INFORMATION =================

$userStmt = $conn->prepare(
    "SELECT id, name, email, last_login
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


// ================= SAVED PIZZAS =================

$pizzaStmt = $conn->prepare(
    "SELECT
        id,
        user_id,
        name,
        type,
        size,
        crust,
        sauce,
        toppings,
        city,
        flavor,
        description,
        price,
        likes,
        views,
        created_at
     FROM saved_pizzas
     WHERE user_id = ?
     ORDER BY created_at DESC"
);

$pizzaStmt->bind_param("s", $userId);
$pizzaStmt->execute();

$pizzaResult = $pizzaStmt->get_result();

$pizzas = [];

while ($row = $pizzaResult->fetch_assoc()) {

    // Convert JSON strings back into arrays
    $row["sauce"] = json_decode($row["sauce"] ?? "[]", true);

    if (!is_array($row["sauce"])) {
        $row["sauce"] = [];
    }

    $row["toppings"] = json_decode($row["toppings"] ?? "[]", true);

    if (!is_array($row["toppings"])) {
        $row["toppings"] = [];
    }

    // Add emoji for profile display
    $row["emoji"] = "🍕";

    $pizzas[] = $row;
}

$pizzaStmt->close();


// ================= FINAL RESPONSE =================

echo json_encode([
    "success" => true,

    "data" => [
        "user" => [
            "userId" => $user["id"],
            "name" => $user["name"],
            "email" => $user["email"],
            "lastLogin" => $user["last_login"]
        ],

        "pizzas" => $pizzas,

        "pizzaCount" => count($pizzas)
    ]
]);

$conn->close();

?>

