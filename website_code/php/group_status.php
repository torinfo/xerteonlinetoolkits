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
 * Function is_user_member_group
 *
 * @params number $group_id - the group ID
 * @return bool - is ID member of this group
 * @package
 */


function is_user_member_group($group_id){
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;

    $login_id = $_SESSION['toolkits_logon_id'];
    $query = db_query_one("select login_id from {$prefix}user_group_members where login_id = ? and group_id = ?", array($login_id, $group_id));
    return (!is_null($query));


}


