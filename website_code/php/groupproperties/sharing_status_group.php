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
 * sharing folder template, shows who is sharing a folder
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../../../config.php");
include "../group_status.php";

_load_language_file("/website_code/php/groupproperties/sharing_status_group.inc");
_load_language_file("/groupproperties.inc");
include "../url_library.php";
include "../user_library.php";

if (!isset($_SESSION['toolkits_logon_username']))
{
    _debug("Session is invalid or expired");
    die("Session is invalid or expired");
}

echo "<p class=\"header\"><span>" . GROUPPROPERTIES_TAB_SHARED . "</span></p>";
$parameters = explode("_", $_POST['group_id']);

$group_id = $parameters[0];

if (!is_user_member_group($group_id) || !is_numeric($group_id) || !is_string($parameters[1])){
    echo "<p>" . SHARING_FAIL . "</p>";
    exit(0);
}

$prefix = $xerte_toolkits_site->database_table_prefix;

$sql = "SELECT login_id, firstname, surname, username FROM " .
    "{$prefix}logindetails WHERE login_id IN".
    "(SELECT login_id FROM {$prefix}user_group_members WHERE group_id = ?)";

$query_sharing_rows = db_query($sql, array($group_id));

if(sizeof($query_sharing_rows)==0){
    echo "<p class=\"share_files_paragraph\"><span>" . SHARING_NOT_SHARED . "</span></p>";
    exit(0);
}

echo "<p class=\"share_intro_p\"><span>" . SHARING_CURRENT . "</span></p>";

foreach($query_sharing_rows as $row) {

    echo "<p class=\"share_files_paragraph\"><span>" . $row['firstname'] . " " . $row['surname'] . " (" . $row['username'] .")</span></p>";
    echo "<p class=\"share_border\"></p>";

}
//
////Only show sharing_stop message if this folder is directly shared with this person
////stopping sharing via a group or via a higher up folder cannot be done on a folder by folder basis
//$role = get_explicit_folder_role($folder_id);
//if($role != 'creator' && !is_null($role) &&!is_user_admin()){
//
//    echo "<p><a href=\"javascript:delete_sharing_folder('" . $folder_id . "','" . $_SESSION['toolkits_logon_id'] . "',true)\">" . SHARING_STOP . "</a></p>";
//
//}



