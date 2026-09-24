<?php

header("Content-Type: application/json");

require_once "db.php";

$result = $conn->query(
    "SELECT id, name, category, description, image,
            small_price, medium_price, large_price, is_new
     FROM pizzas
     ORDER BY id ASC"
);

$pizzas = []; 

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $pizzas[] = $row;
    }
}

echo json_encode([
    "success" => true,
    "data" => $pizzas
]);

$conn->close();

?>