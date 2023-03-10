<?php

require_once(__DIR__ . "/../../config.php");
require_once("database_library.php");

session_start();

$user_query = "SELECT * FROM `logindetails` where username = ?";
$rows = db_query($user_query, array($_SESSION['toolkits_logon_username']));
$user = json_encode($rows[0]);

$query = "update `logindetails` SET theme = ? WHERE username = ? ";
$insert = db_query($query, array($_POST["theme"], $_SESSION['toolkits_logon_username']));
$_SESSION["theme"] = $_POST["theme"];
header('Location: ../../index.php');