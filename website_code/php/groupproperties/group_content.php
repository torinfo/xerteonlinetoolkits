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
 * folder content page, used by the site to display a folder's contents
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */


require_once("../../../config.php");
include "../group_status.php";
include "../user_library.php";

_load_language_file("/website_code/php/groupproperties/group_content.inc");


include "../display_library.php";

if (!isset($_SESSION['toolkits_logon_username']))
{
    _debug("Session is invalid or expired");
    die("Session is invalid or expired");
}

/**
 * connect to the database
 */

if(is_numeric($_POST['group_id']) && (is_user_member_group($_POST['group_id']) || is_user_admin())){

    $database_connect_id = database_connect("Group_content_template.php connect success","Group_content_template.php connect failed");

    echo "<p class=\"header\"><span>" . GROUP_CONTENT_TEMPLATE_CONTENTS . "</span></p>";
    list_folder_contents_event_free($_POST['group_id'],$path = '', $item = false, $input_method = 'link', $group=true);
    
}else{
    echo "<p>" . GROUP_PROPERTIES_FAIL . "</p>";
}

?>
