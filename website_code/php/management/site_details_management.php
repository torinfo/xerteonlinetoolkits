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
require_once("../../../config.php");

_load_language_file("/website_code/php/management/site_details_management.inc");

require("../user_library.php");

if(is_user_admin()) {
	$database_id = database_connect("templates list connected", "template list failed");
	$postData = getPostDataForQuery();
	$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set " . $postData['query'];
	$data = $postData['data'];

	if(isset($_POST['ldap_host'], $_POST['ldap_port'], $_POST['bind_dn'], $_POST['bind_pwd'], $_POST['base_dn'], $_POST['LDAP_filter'], $_POST['LDAP_preference'])){
		
		$query = "UPDATE {$xerte_toolkits_site->database_table_prefix}ldap SET ldap_knownname = 'from_sitedetails', ldap_host = ?, ldap_port = ?, ldap_username = ?, ldap_password = ?, ldap_basedn = ?, ldap_filter = ?, ldap_filter_attr = ? where ldap_id=1";
		$numaffected = db_query($query, array($_POST['ldap_host'], $_POST['ldap_port'], $_POST['bind_dn'], $_POST['bind_pwd'], $_POST['base_dn'], $_POST['LDAP_filter'], $_POST['LDAP_preference']));

		// Extra code to make sure ldap is updated)
		if ($numaffected === false) {
			$res = false;
		} else {
			$res = true;
			_debug("Num affected: " . $numaffected);
			if ($numaffected == 0) {
				$query = "select * from {$xerte_toolkits_site->database_table_prefix}ldap";
				$res3 = db_query($query);
				if (empty($res3)) {
					$query = "insert {$xerte_toolkits_site->database_table_prefix}ldap SET ldap_knownname = 'from_sitedetails', ldap_host = ?, ldap_port = ?, ldap_username = ?, ldap_password = ?, ldap_basedn = ?, ldap_filter = ?, ldap_filter_attr = ?, ldap_id=1";
					$res3 = db_query($query, array($_POST['ldap_host'], $_POST['ldap_port'], $_POST['bind_dn'], $_POST['bind_pwd'], $_POST['base_dn'], $_POST['LDAP_filter'], $_POST['LDAP_preference']));
					_debug("Result of insert: " . $res3);
				}
			}
		}
		
		if($_SESSION['layout'] == "old"){
			$postData = getPostDataForQuery();
			$query = "update " . $xerte_toolkits_site->database_table_prefix . "sitedetails set " . $postData['query'];
			$data = $postData['data'];
			$res = db_query($query, $data);
		}
		
	}else {
		$res = db_query($query, $data);
	}

	if($res!==false){

		$msg = "Site changes saved by user from " . $_SERVER['REMOTE_ADDR'];
		receive_message("", "SYSTEM", "MGMT", "Changes saved", $msg);

		/* Clear the file cache because of the file check below. */
		clearstatcache();

		if ($enable_clamav_check === 'true' && (! is_file($clamav_cmd) || ! is_executable($clamav_cmd))) {
			echo MANAGEMENT_SITE_CHANGES_OK_NOT_AV;
		}
		else {
			echo MANAGEMENT_SITE_CHANGES_SUCCESS;
		}

	}else{

		echo MANAGEMENT_SITE_CHANGES_FAIL . " " . mysql_error($database_id);

    }
}

function getPostDataForQuery(){
	$first = true;
	if(isset($_POST['site_url'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "site_url = ?";
		$data[] = $_POST['site_url'];
	}

	if(isset($_POST['site_title'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "site_title = ?";
		$data[] = $_POST['site_title'];
	}

	if(isset($_POST['site_name'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "site_name = ?";
		$data[] = $_POST['site_name'];
	}

	if(isset($_POST['site_logo'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "site_logo = ?";
		$data[] = $_POST['site_logo'];
	}

	if(isset($_POST['organisational_logo'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "organisational_logo = ?";
		$data[] = $_POST['organisational_logo'];
	}

	if(isset($_POST['welcome_message'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "welcome_message = ?";
		$data[] = $_POST['welcome_message'];
	}

	if(isset($_POST['site_text'], $_POST['tutorial_text'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$site_texts = $_POST['site_text'] . "~~~" . $_POST['tutorial_text'];
		$query .= "site_text = ?";
		$data[] = $site_texts;
	}

	if(isset($_POST['news_text'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "news_text = ?";
		$data[] = base64_encode(stripcslashes($_POST['news_text']));
	}

	if(isset($_POST['pod_one'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "pod_one = ?";
		$data[] = base64_encode(stripcslashes($_POST['pod_one']));
	}

	if(isset($_POST['pod_two'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "pod_two = ?";
		$data[] = base64_encode(stripcslashes($_POST['pod_two']));
	}

	if(isset($_POST['copyright'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$copyright = str_replace("AAA", "&copy;", $_POST['copyright']);
		$query .= "copyright = ?";
		$data[] = $copyright;
	}

	if(isset($_POST['demonstration_page'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "demonstration_page = ?";
		$data[] = $_POST['demonstration_page'];
	}

	if(isset($_POST['form_string'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "form_string = ?";
		$data[] = base64_encode(stripcslashes($_POST['form_string']));
	}

	if(isset($_POST['peer_form_string'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "peer_form_string = ?";
		$data[] = base64_encode(stripcslashes($_POST['peer_form_string']));
	}

	if(isset($_POST['feedback_list'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "feedback_list = ?";
		$data[] = $_POST['feedback_list'];
	}

	if(isset($_POST['rss_title'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "rss_title = ?";
		$data[] = $_POST['rss_title'];
	}

	if(isset($_POST['module_path'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "module_path = ?";
		$data[] = $_POST['module_path'];
	}

	if(isset($_POST['website_code_path'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "website_code_path = ?";
		$data[] = $_POST['website_code_path'];
	}

	if(isset($_POST['users_file_area_short'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "users_file_area_short = ?";
		$data[] = $_POST['users_file_area_short'];
	}

	if(isset($_POST['php_library_path'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "php_library_path = ?";
		$data[] = $_POST['php_library_path'];
	}

	if(isset($_POST['root_file_path'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "root_file_path = ?";
		$data[] = str_replace("\\", "/", $_POST['root_file_path']);
	}

	if(isset($_POST['play_edit_preview_query'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "play_edit_preview_query = ?";
		$data[] = base64_encode(stripcslashes($_POST['play_edit_preview_query']));
	}

	if(isset($_POST['email_error_list'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "email_error_list = ?";
		$data[] = $_POST['email_error_list'];
	}

	if(isset($_POST['error_log_message'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "error_log_message = ?";
		$data[] = $_POST['error_log_message'];
	}

	if(isset($_POST['max_error_size'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "max_error_size = ?";
		$data[] = $_POST['max_error_size'];
	}

	if(isset($_POST['authentication_method'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "authentication_method = ?";
		$data[] = $_POST['authentication_method'];
	}

	if(isset($_POST['flash_save_path'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "flash_save_path = ?";
		$data[] = $_POST['flash_save_path'];
	}

	if(isset($_POST['flash_upload_path'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "flash_upload_path = ?";
		$data[] = $_POST['flash_upload_path'];
	}

	if(isset($_POST['flash_preview_check_path'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "flash_preview_check_path = ?";
		$data[] = $_POST['flash_preview_check_path'];
	}

	if(isset($_POST['flash_flv_skin'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "flash_flv_skin = ?";
		$data[] = $_POST['flash_flv_skin'];
	}

	if(isset($_POST['site_email_account'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "site_email_account = ?";
		$data[] = $_POST['site_email_account'];
	}

	if(isset($_POST['headers'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "headers = ?";
		$data[] = $_POST['headers'];
	}

	if(isset($_POST['email_to_add_to_username'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "email_to_add_to_username = ?";
		$data[] = $_POST['email_to_add_to_username'];
	}

	if(isset($_POST['proxy1'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "proxy1 = ?";
		$data[] = $_POST['proxy1'];
	}

	if(isset($_POST['port1'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "port1 = ?";
		$data[] = $_POST['port1'];
	}

	if(isset($_POST['site_session_name'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "site_session_name = ?";
		$data[] = $_POST['site_session_name'];
	}

	if(isset($_POST['synd_publisher'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "synd_publisher = ?";
		$data[] = $_POST['synd_publisher'];
	}

	if(isset($_POST['synd_rights'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "synd_rights = ?";
		$data[] = $_POST['synd_rights'];
	}

	if(isset($_POST['synd_license'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "synd_license = ?";
		$data[] = $_POST['synd_license'];
	}

	if(isset($_POST['import_path'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "import_path = ?";
		$data[] = str_replace("\\", "/", $_POST['import_path']);
	}

	if(isset($_POST['apache'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "apache = ?";
		$data[] = $_POST['apache'];
	}

	if(isset($_POST['enable_mime_check'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$enable_mime_check = true_or_false($_POST['enable_mime_check']) ? 'true' : 'false';
		$query .= "enable_mime_check = ?";
		$data[] = $enable_mime_check;
	}

	if(isset($_POST['mimetypes'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "mimetypes = ?";
		$data[] = $_POST['mimetypes'];
	}

	if(isset($_POST['enable_file_ext_check'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$enable_file_ext_check = true_or_false($_POST['enable_file_ext_check']) ? 'true' : 'false';
		$query .= "enable_file_ext_check = ?";
		$data[] = $enable_file_ext_check;
	}

	if(isset($_POST['file_extensions'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "file_extensions = ?";
		$data[] = $_POST['file_extensions'];
	}

	if(isset($_POST['enable_clamav_check'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$enable_clamav_check = true_or_false($_POST['enable_clamav_check']) ? 'true' : 'false';
		$query .= "enable_clamav_check = ?";
		$data[] = $enable_clamav_check;
	}

	if(isset($_POST['clamav_cmd'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$clamav_cmd = trim($_POST['clamav_cmd']);
		$clamav_cmd = preg_replace('/[;&<>|]/', '', $clamav_cmd);
		$clam_cmd = strlen($clamav_cmd) > 0 ? realpath($clamav_cmd) : '';
		$clamav_cmd = ($clam_cmd === false) ? $clamav_cmd : $clam_cmd;

		$query .= "clamav_cmd = ?";
		$data[] = $clamav_cmd;
	}

	if(isset($_POST['clamav_opts'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$clamav_opts = trim($_POST['clamav_opts']);
		$clamav_opts = preg_replace('/[^a-zA-Z0-9\s_-]/', '', $clamav_opts);
		$clamav_opts = preg_replace('/(^|\s)[^-]\S*/', '', $clamav_opts);

		$query .= "clamav_opts = ?";
		$data[] = $clamav_opts;
	}

	if(isset($_POST['integration_config_path'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "integration_config_path = ?";
		$data[] = $_POST['integration_config_path'];
	}

	if(isset($_POST['admin_username'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "admin_username = ?";
		$data[] = $_POST['admin_username'];
	}

	if(isset($_POST['admin_password'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "admin_password = ?";
		$data[] = $_POST['admin_password'];
	}

	if(isset($_POST['site_xapi_Endpoint'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "LRS_Endpoint = ?";
		$data[] = $_POST['LRS_Endpoint'];
	}

	if(isset($_POST['site_xapi_Key'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "LRS_Key = ?";
		$data[] = $_POST['LRS_Key'];
	}

	if(isset($_POST['site_xapi_Secret'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "LRS_Secret = ?";
		$data[] = $_POST['LRS_Secret'];
	}

	if(isset($_POST['site_xapi_dashboard_enabled'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "dashboard_enabled = ?";
		$data[] = $_POST['dashboard_enabled'];
	}

	if(isset($_POST['site_xapi_dashboard_nonanonymous'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "dashboard_nonanonymous = ?";
		$data[] = $_POST['dashboard_nonanonymous'];
	}

	if(isset($_POST['xapi_dashboard_minrole'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "xapi_dashboard_minrole = ?";
		$data[] = $_POST['xapi_dashboard_minrole'];
	}

	if(isset($_POST['site_xapi_dashboard_period'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "dashboard_period = ?";
		$data[] = $_POST['site_xapi_dashboard_period'];
	}

	if(isset($_POST['xapi_dashboard_urls'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "dashboard_allowed_links = ?";
		$data[] = $_POST['xapi_dashboard_urls'];
	}

	if(isset($_POST['globalhidesocial'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "globalhidesocial = ?";
		$data[] = $_POST['globalhidesocial'];
	}

	if(isset($_POST['globalsocialauth'])) {
		if($first){
			$first = false;
		}else{
			$query .= ", ";
		}
		
		$query .= "globalsocialauth = ?";
		$data[] = $_POST['globalsocialauth'];
	}
	
	return ["query"=>$query,"data"=>$data];
}

?>
