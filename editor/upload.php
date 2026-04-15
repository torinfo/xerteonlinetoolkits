<?php
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 */

require_once(dirname(__FILE__) . "/../config.php");

require (dirname(__FILE__) . "/../" . $xerte_toolkits_site->php_library_path . "user_library.php");
require_once(dirname(__FILE__) . "/../website_code/php/services/LearningObjectSaveService.php");

if (!isset($_SESSION['toolkits_logon_username']) && !is_user_admin())
{
    _debug("Session is invalid or expired");
    die("Session is invalid or expired");
}

$result = learning_object_save_from_request($_POST);
if (!$result['ok']) {
    die($result['message']);
}

echo true;

function is_ajax_request() {
	return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
}
