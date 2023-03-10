<?php
require_once("database_library.php");

function get_user_image($toolkits_logon_id){
    $image_query = "SELECT profileimage from `logindetails` where login_id = ?";
    return db_query($image_query, array($toolkits_logon_id));
}