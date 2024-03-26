<?php 
require_once(dirname(__FILE__) . "/../../../config.php");

require_once(dirname(__FILE__) . "/../language_library.php");
$layout = $_GET["theme"];

if(file_exists("./layout/" . $layout . ".php")){
	$_SESSION["layout"] = $layout;
	if(isset($_GET["change"]))
		require "./layout/" . $layout . ".php";
	return;
}

echo "false";
