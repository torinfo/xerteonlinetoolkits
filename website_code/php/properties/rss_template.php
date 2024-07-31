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
 
// Code to run the ajax query to show and allow the usert to change a templates notes

require_once("../../../config.php");

include "../url_library.php";

include "../template_status.php";

include "../user_library.php";

include "properties_library.php";

if (!isset($_POST['tutorial_id'])){
	die("Invalid paramaters");
}
$template_id = x_clean_input($_POST['tutorial_id'], 'numeric');

if(is_user_creator_or_coauthor($template_id)||is_user_permitted("projectadmin")){

	if(template_access_settings($template_id)=="Public"){

		rss_display($xerte_toolkits_site,$template_id,false);

	}else{

		rss_display_public();

	}

}else{

	rss_display_fail(true);

}

