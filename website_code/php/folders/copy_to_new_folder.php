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
 * copy to new folder page, the sites moves some items from one folder to another
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once('../../../config.php');
include '../folder_library.php';
include '../template_status.php';

if (!isset($_SESSION['toolkits_logon_username']))
{
    _debug("Session is invalid or expired");
    die("Session is invalid or expired");
}

if (isset($_POST['folder_id']))
{
    if (is_user_creator_folder($_POST['folder_id'])){
        move_folder($_POST['folder_id'], $_POST['destination']);
    }
}
else
{
    if (is_user_creator($_POST['template_id'])){
        move_file($_POST['template_id'],$_POST['destination']);
    }
}

?>
