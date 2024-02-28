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
 * xml template, shows the xml sharing status for this template
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../../../config.php");

include "../template_status.php";

include "../url_library.php";

include "../user_library.php";

include "properties_library.php";

$database_id = database_connect("peer template database connect success","peer template change database connect failed");

if(is_numeric($_POST['template_id'])){

    if(is_user_creator_or_coauthor($_POST['template_id'])|| is_user_permitted("projectadmin")){

        xml_template_display($xerte_toolkits_site,false);

    }else{

        xml_template_display_fail(true);

    }

} else{
	
    xml_template_display_fail(false);
	
}
