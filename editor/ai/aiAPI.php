<?php

//todo add authentication!
//if (!isset($_SESSION['toolkits_logon_username']) && !is_user_admin()) {
//    _debug("Session is invalid or expired");
//    die('{"status": "error", "message": "Session is invalid or expired"}');
//}
//check if request has required attributes
//if (!isset($_POST['type'])) {
//    _debug("type is not set");
//    die('{"status": "error", "message": "type is not set, contact your system administrator"}');
//}elseif (!isset($_POST["prompt"]) && $_POST["prompt"] !== ""){
//    _debug("prompt is empty");
//    die('{"status": "error", "message": "prompt must not be empty"}');
//}

$prompt_params = $_POST["prompt"];
$type = $_POST["type"];
$ai_api = $_POST["api"] ?? 'openai';
$file_url = $_POST["url"] ?? 'None';
$context = $_POST["context"] ?? 'None';
$useContext = $_POST["useContext"] ?? 'false';
$baseUrl = $_POST["baseUrl"];

$allowed_apis = ['openai', 'anthropic'];
//todo combine with api check from admin page
if (!in_array($ai_api, $allowed_apis)){
    die(json_encode(["status" => "error", "message" => "api is not allowed"]));
}
//todo Alek convert api name to lowercase

//dynamically load needed api methods
require_once(dirname(__FILE__) . "/" . $ai_api ."Api.php");

//dynamically initiate correct api class
$api_type = $ai_api . 'Api';
$aiApi = new $api_type($ai_api);

$result = $aiApi->ai_request($prompt_params,$type, $file_url, $baseUrl, $useContext);

if ($result->status){
    echo json_encode($result);
} else {
    echo json_encode(["status" => "success", "result" => $result]);
}