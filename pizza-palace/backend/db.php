<?php

$host = "sql210.infinityfree.com";
$username = "if0_42856274";
$password = "H9Qh0IINbf";
$database = "if0_42856274_pizza_palace";

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}

$conn->set_charset("utf8mb4");

?>