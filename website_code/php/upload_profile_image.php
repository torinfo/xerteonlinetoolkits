<?php

require_once(__DIR__ . "/../../config.php");
require_once("database_library.php");

session_start();

$user_query = "SELECT * FROM `logindetails` where username = ?";
$rows = db_query($user_query, array($_SESSION['toolkits_logon_username']));
$user = json_encode($rows[0]);

if (isset($_POST["submit"])) {
    $status = 'error';
    if (!empty($_FILES["fileToUpload"]["name"])) {
        // Get file info
        $fileName = basename($_FILES["fileToUpload"]["name"]);
        $fileType = pathinfo($fileName, PATHINFO_EXTENSION);

        // Allow certain file formats
        $allowTypes = array('jpg', 'png', 'jpeg', 'gif');
        if (in_array($fileType, $allowTypes)) {
            $image = $_FILES['fileToUpload']['tmp_name'];
            $imgContent = file_get_contents($image);

            $query = "update `logindetails` SET profileimage = ? WHERE username = ? ";
            $insert = db_query($query, array(base64_encode($imgContent), $_SESSION['toolkits_logon_username']));
            // Insert image content into database

            header('Location: ../../index.php');
            if ($insert) {
                $status = 'success';
                $statusMsg = "File uploaded successfully.";
            } else {
                $statusMsg = "File upload failed, please try again.";
            }
        } else {
            $statusMsg = 'Sorry, only JPG, JPEG, PNG, & GIF files are allowed to upload.';
        }
    } else {
        $statusMsg = 'Please select an image file to upload.';
    }
}