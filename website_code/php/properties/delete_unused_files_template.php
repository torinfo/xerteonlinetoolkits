<?php
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.

 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 *
 * delete unused file template, allows the site to delete all unused files at once from the media folder
 *
 * @author Timo Boer
 * @version 1.0
 * @package
 */

include "../error_library.php";
include "../../../config.php";

if (!isset($_SESSION['toolkits_logon_id']))
{
    _debug("Session is invalid or expired");
    die("Session is invalid or expired");
}

$data = json_decode(stripslashes($_POST['data']));

foreach ($data as $d) {
    if(unlink(urldecode($d))){
        receive_message($_SESSION['toolkits_logon_username'], "FILE", "SUCCESS", "The file " . $d . "has been deleted", "User " . $_SESSION['toolkits_logon_username'] . " has deleted " . $d);
    } else{
        receive_message($_SESSION['toolkits_logon_username'], "FILE", "MAJOR", "The file " . $d . "hasn't been deleted", "User " . $_SESSION['toolkits_logon_username'] . " was not deleted " . $d);
    }

}