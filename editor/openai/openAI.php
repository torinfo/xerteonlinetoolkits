<?php

require_once (dirname(__FILE__) . "/openAiApi.php");

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

$openAI = new OpenAi();
//$prompt = $_POST["prompt"];
//$type = $_POST["type"];
$prompt = 'gebruik de zelfde layout, gebruik tussen de 3 tot 5 antwoorden per vraag, genereer 3 nederlandse multiple choice vragen over basisschool rekenen ';
$type = 'quiz';
$result = $openAI->openAI_request($prompt,$type);

//TODO make good
if ($result->status){
    echo json_encode($result);
} else {
    //echo json_encode(["status" => "success", "result" => $result]);
    echo $result;
}