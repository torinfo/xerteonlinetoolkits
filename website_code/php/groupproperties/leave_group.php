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
 * removes user from group
 *
 */

require_once("../../../config.php");
include "../group_status.php";
include "../user_library.php";

if (!isset($_SESSION['toolkits_logon_username']))
{
    _debug("Session is invalid or expired");
    die("Session is invalid or expired");
}

$id = $_POST['id'];
$group_id = $_POST['group_id'];

if(is_numeric($_POST['group_id'])){

    if(is_user_member_group($group_id)){
        $prefix = $xerte_toolkits_site->database_table_prefix;

        $database_id = database_connect("Group sharing database connect failed", "Group sharing database connect failed");

        $query_to_remove_user_from_group = "delete from {$prefix}user_group_members where $group_id = ? AND login_id = ?";
        $params = array($group_id, $id);
        db_query($query_to_remove_user_from_group, $params);
    }
}
