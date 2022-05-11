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
 * folder properties template page, used by the site to display the default panel for the properties page
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../../../config.php");
include "../group_status.php";

_load_language_file("/website_code/php/groupproperties/groupproperties.inc");

include "../url_library.php";
include "../user_library.php";

if (!isset($_SESSION['toolkits_logon_username']))
{
    _debug("Session is invalid or expired");
    die("Session is invalid or expired");
}

//connect to the database
$group_id = $_POST['group_id'];
if(is_numeric($group_id) && (is_user_member_group($group_id) || is_user_admin())){

    $database_connect_id = database_connect("Group name database connect success", "Group name database connect failed");

    $prefix = $xerte_toolkits_site->database_table_prefix;
    
    $query_for_group_name = "select group_name from {$prefix}user_groups where group_id=?";
    $params = array($group_id);

    $row_template_name = db_query_one($query_for_group_name, $params);

    echo "<p class=\"header\"><span>" . GROUP_PROPERTIES_PROPERTIES . "</span></p>";

    echo "<p>" . GROUP_PROPERTIES_CALLED . " " . str_replace("_", " ", $row_template_name['group_name']) . "</p>";
}else{
    echo "<p>" . GROUP_PROPERTIES_FAIL . "</p>";
}
