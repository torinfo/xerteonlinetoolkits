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

_load_language_file("/website_code/php/management/site.inc");
_load_language_file("/management.inc");
_load_language_file( "/website_code/php/properties/sharing_status_template.inc");

require_once("../user_library.php");
require_once("management_library.php");

function old_fields($title, $data, $specificDisplay){
	echo "<div class=\"template\" id=\"$specificDisplay\"><p>" . $title . " <button type=\"button\" class=\"xerte_button\" id=\"" . $specificDisplay . "_btn\" onclick=\"javascript:templates_display('$specificDisplay')\">" . MANAGEMENT_VIEW . "</button></p></div><div class=\"template_details\" id=\"" . $specificDisplay . "_child\">";

	foreach($data[$specificDisplay] as $key => $field){
		$options = "";
			if(isset($field->size)) 
				$options .= "rows=\"" . strval($field->size) . "\"";

		if(gettype($field) == "string"){
			echo "<p>$field</p>";
		}else if(isset($field->html)){
			echo $field->html;
		}else if($key == "keys") {
			echo "<div class=\"template\" id=\"ltikeys\"><p>" . MANAGEMENT_SITE_LTI_KEYS . " <button type=\"button\" class=\"xerte_button\" id=\"ltikeys_btn\"onclick=\"javascript:templates_display('ltikeys')\">" . MANAGEMENT_VIEW . "</button></p></div><div class=\"template_details\" id=\"ltikeys_child\">";
			echo "<div id=\"ltikeys\">";

            foreach($field as $LTI_key){

                $buttonDelete = $LTI_key['buttonDelete']? "&nbsp;&nbsp;<a href=\"javascript:delete_LTI_key('" . $LTI_key['id'] . "')\">" . LTI_KEYS_DELETE . "</a>" : "";
                
                echo "<div class=\"template\" id=\"" . $LTI_key['id'] . "\" savevalue=\"" . $LTI_key['id'] . "\"><p>" . $LTI_key['name'] . " <a href=\"javascript:templates_display('" . $LTI_key['id'] . "')\">" . $LTI_key['button1'] . "</a>". $buttonDelete . "</p></div><div class=\"template_details\" id=\"" . $LTI_key['id'] . "_child\">";

				
				echo "<p>" . LTI_KEYS_NAME . "<form><textarea id=\"lti_keys_name" . $LTI_Key['id'] . "\">" . $LTI_key['name'] . "</textarea></form></p>";
				echo "<p>" . LTI_KEYS_KEY . "<form><textarea id=\"lti_keys_key" . $LTI_Key['id'] . "\">" . $LTI_key['key'] . "</textarea></form></p>";
				echo "<p>" . LTI_KEYS_SECRET . "<form><textarea id=\"lti_keys_secret" . $LTI_Key['id'] . "\">" . $LTI_key['secret'] . "</textarea></form></p>";
				echo "<p>" . LTI_KEYS_CONTEXT_ID . "<form><textarea id=\"lti_keys_context_id" . $LTI_Key['id'] . "\">" . $LTI_key['context_id'] . "</textarea></form></p>";

                if ($LTI_key['id'] == 'NEW') {
                    echo "<div><p><form action=\"javascript:new_LTI_key();\"><input class=\"xerte_button\" type=\"submit\" name=\"new-lti\" value=\"" . LTI_KEYS_ADD_SUBMIT . "\"></form></p></div>";
                } else {
                    echo "<div style=\"width:300px;\">";
                    echo "<div style=\"float:left;width:100px;\"><p><form action=\"javascript:edit_LTI_key(" . $LTI_key['id'] . ");\"><input class=\"xerte_button\" type=\"submit\" name=\"edit-lti\" value=\"" . LTI_KEYS_EDIT_SUBMIT . "\"></form></p></div>";
                    echo "<div style=\"float:right;width:100px;\"><p><form><input type=\"submit\" name=\"delete-lti\" value=\"" . LTI_KEYS_DELETE_SUBMIT . "\"></form></p></div>";
                    echo "</div>";		
                }
                echo "</div>";
            }
			echo "</div></div>";
        }else if($field->editor === "normal" || $field->editor === "wysiwyg" || $field->editor === "code"){
			echo "<p>" . $field->title . "<form><textarea $options id=\"" . $field->dbname . "\">" . $field->value . "</textarea></form></p>";
		}else if($field->editor === "multiValue") {
			echo "<p>" . $field->title . "<form>";
			echo "<select name=\"" . $field->dbname . "\" id=\"" . $field->dbname . "\" style=\"padding: 0.4em 0.15em\">";
			foreach($field->validValues as $value=>$disabled){
				$selected = $value == $field->value? "selected" : "";
				$disabled = $disabled? "disabled" : "";
				echo "<option value='". $value ."' ". $selected ." ". $disabled .">". $value ."</option>";
			}
			echo "</select></form></p>";
		}else {
			echo "unhandled \"" . $field->editor . "\"<br>";
		}
	}

    echo "</div>";
}


?>


<?php
if(is_user_admin()) {
    $specificDisplay = $_REQUEST["row"];
    $datadddbase_id = database_connect("templates list connected", "template list failed");

    $query = "select * from " . $xerte_toolkits_site->database_table_prefix . "sitedetails";

    $row = db_query_one($query);

    $site_texts = explode("~~~", $row['site_text']);
    if (count($site_texts) > 1) {
        $site_text = $site_texts[0];
        $tutorial_text = $site_texts[1];
    } else {
        $site_text = $site_texts[0];
        $tutorial_text = "";
    }
	
	function beginSection($title, $id){
		if($_SESSION['layout'] === "old"){
			echo "<div class=\"template\" id=\"$id\"><p>" . $title . " <button type=\"button\" class=\"xerte_button\" id=\"" . $id . "_btn\" onclick=\"javascript:templates_display('$id')\">" . MANAGEMENT_VIEW . "</button></p></div><div class=\"template_details\" id=\"" . $id . "_child\">";
		}
	}
	
	function endSection(){
		if($_SESSION['layout'] === "old"){
			echo "</div>";
		}else{
		//	die();
		}
	}

    $isOldTheme = $_SESSION['layout'] === "old";
	if ($specificDisplay === "siteSettings" | $isOldTheme) {

	    beginSection(MANAGEMENT_SITE_TITLE, "siteSettings");
		
		echo inputField("site_url", MANAGEMENT_SITE_URL, $row['site_url'], "");
		
		echo inputField("site_url", MANAGEMENT_SITE_TITLE_HTML, $row['site_url'], "");

		echo wysiwygField("site_name", MANAGEMENT_SITE_NAME, $row['site_name'], "");

		echo inputField("site_logo", MANAGEMENT_SITE_LOGO, $row['site_logo'], "");

		echo inputField("organisational_logo", MANAGEMENT_SITE_LOGO_ORG, $row['organisational_logo'], "");

		echo wysiwygField("welcome_message", MANAGEMENT_SITE_WELCOME, $row['welcome_message'], "");

		echo wysiwygField("site_text", MANAGEMENT_SITE_TEXT, $site_text, "");

		echo wysiwygField("tutorial_text", MANAGEMENT_TUTORIAL_TEXT, $tutorial_text, "");

		echo wysiwygField("news_text", MANAGEMENT_SITE_NEWS, base64_decode($row['news_text']), "rows='10'");

		echo wysiwygField("pod_one", MANAGEMENT_SITE_POD_ONE, base64_decode($row['pod_one']), "");

		echo wysiwygField("pod_two", MANAGEMENT_SITE_POD_TWO, base64_decode($row['pod_two']), "");

		echo inputField("copyright", MANAGEMENT_SITE_COPYRIGHT, htmlspecialchars($row['copyright']), "");

		echo inputField("demonstration_page", MANAGEMENT_SITE_DEMONSTRATION, $row['demonstration_page'], "");

		echo codeField("form_string", MANAGEMENT_SITE_LOGIN_FORM, base64_decode($row['form_string']), "");

		echo codeField("peer_form_string", MANAGEMENT_SITE_PEER_FORM, base64_decode($row['peer_form_string']), "");

		echo inputField("feedback_list", MANAGEMENT_SITE_FEEDBACK, $row['feedback_list'], "");

		endSection();

    }

	if ($specificDisplay === "serverdetails" | $isOldTheme) {
		beginSection(MANAGEMENT_SITE_SERVER, "serverdetails");

		echo inputField("apache", MANAGEMENT_SITE_HTACCESS, $row['apache'], "");
		
		echo inputField("site_session_name", MANAGEMENT_SITE_SESSION_NAME, $row['site_session_name'], "");

        if (Xerte_Validate_FileMimeType::canRun()) {
			echo inputField("enable_mime_check", MANAGEMENT_SITE_ENABLE_MIME, $row['enable_mime_check'], "");

        } else {
			echo inputField("enable_mime_check", MANAGEMENT_SITE_ENABLE_MIME, "False. The MIME check requires the PHP 'mine_content_type' function.", "disabled=\"disabled\"");
        }

		echo inputField("mimetypes", MANAGEMENT_SITE_MIME, $row['mimetypes'], "");

        if (Xerte_Validate_FileExtension::canRun()) {
			echo inputField("enable_file_ext_check", MANAGEMENT_SITE_ENABLE_FILE_EXT, $row['enable_file_ext_check'], "");
        } else {
			echo inputField("enable_file_ext_check", MANAGEMENT_SITE_ENABLE_FILE_EXT, "False. The file extension check requires the PHP 'pathinfo' function.", "disabled=\"disabled\"");
        }
		
		echo inputField("file_extensions", MANAGEMENT_SITE_FILE_EXTENSIONS, $row['file_extensions'], "");

        // Clear the file cache because of the file check below.
        clearstatcache();

        if ($xerte_toolkits_site->enable_clamav_check && (!is_file($xerte_toolkits_site->clamav_cmd) || !is_executable($xerte_toolkits_site->clamav_cmd))) {
			echo inputField("enable_clamav_check", MANAGEMENT_SITE_ENABLE_CLAMAV_CHK, "False. The ClamAV antivirus check requires a valid command pathname.", "disabled=\"disabled\"");
        } else {
			echo inputField("enable_clamav_check", MANAGEMENT_SITE_ENABLE_CLAMAV_CHK, $row['enable_clamav_check'], "");
        }
		echo inputField("clamav_cmd", MANAGEMENT_SITE_CLAMAV_CMD, $row['clamav_cmd'], "");

		echo inputField("clamav_opts", MANAGEMENT_SITE_CLAMAV_OPTS, $row['clamav_opts'], "");

		echo inputField("integration_config_path", MANAGEMENT_SITE_INTEGRATION, $row['integration_config_path'], "");
		
		echo inputField("admin_username", MANAGEMENT_SITE_ADMIN_USER, $row['admin_username'], "");
		
		echo inputField("admin_password", MANAGEMENT_SITE_ADMIN_PASSWORD, $row['admin_password'], "");
		
		endSection();

    } 

	if ($specificDisplay === "rssdetails" | $isOldTheme) {
		beginSection(MANAGEMENT_SITE_RSS, "rssdetails");
		echo inputField("rss_title", MANAGEMENT_SITE_RSS_TITLE, $row['rss_title'], "");

		echo inputField("synd_publisher", MANAGEMENT_SITE_RSS_PUBLISHER, $row['synd_publisher'], "");

		echo inputField("synd_rights", MANAGEMENT_SITE_RSS_RIGHTS, $row['synd_rights'], "");

		echo inputField("synd_license", MANAGEMENT_SITE_RSS_LICENCE, $row['synd_license'], "");

		endSection();

    } 

	if ($specificDisplay === "pathdetails" | $isOldTheme) {
		beginSection(MANAGEMENT_SITE_PATH, "pathdetails");

		echo inputField("module_path", MANAGEMENT_SITE_PATH_MODULE, $row['module_path'], "");

		echo inputField("website_code_path", MANAGEMENT_SITE_PATH_WEBSITE, $row['website_code_path'], "");

		echo inputField("users_file_area_short", MANAGEMENT_SITE_PATH_SHORT, $row['users_file_area_short'], "");

		echo inputField("php_library_path", MANAGEMENT_SITE_PATH_LIBRARY, $row['php_library_path'], "");

		echo inputField("root_file_path", MANAGEMENT_SITE_PATH_ROOT, $row['root_file_path'], "");

		endSection();

    } 

	if ($specificDisplay === "sqldetails" | $isOldTheme) {
		
		beginSection(MANAGEMENT_SITE_SQL, "sqldetails");

		echo inputField("play_edit_preview_query", MANAGEMENT_SITE_QUERY, str_replace("$", "\$", str_replace("\\", "", base64_decode($row['play_edit_preview_query']))), "rows=\"20\"");

		endSection();
		
    }
	
	if ($specificDisplay === "errordetails" | $isOldTheme) {

		beginSection(MANAGEMENT_SITE_ERROR_HANDLING, "errordetails");

		echo inputField("error_email_message", MANAGEMENT_SITE_ERROR_EMAIL_ACCOUNT, $row['error_log_message'], "");

		echo inputField("error_email_list", MANAGEMENT_SITE_ERROR_EMAIL, $row['error_log_list'], "");

		echo inputField("max_error_size", MANAGEMENT_SITE_ERROR_MAX, $row['max_error_size'], "");

		endSection();

    } 

	if ($specificDisplay === "authdetails" | $isOldTheme) {

		beginSection(MANAGEMENT_SITE_AUTH_DETAILS, "authdetails");

		echo dropDowm("authentication_method", MANAGEMENT_SITE_AUTH_METHOD, $row['authentication_method'], ["Guest", "Ldap", "Db", "Static", "Moodle", "Saml2", "OAuth2"]);

		endSection();
		
    } 
	
	if ($specificDisplay === "ldapdetails" | $isOldTheme) {

		beginSection(MANAGEMENT_SITE_LDAP, "ldapdetails");

        echo "<p>" . MANAGEMENT_SITE_LDAP_DELIMIT . "</p>";

		echo inputField("ldap_host", MANAGEMENT_SITE_LDAP_HOST, $row['ldap_host'], "");

		echo inputField("ldap_port", MANAGEMENT_SITE_LDAP_PORT, $row['ldap_port'], "");

		echo inputField("bind_pwd", MANAGEMENT_SITE_LDAP_PASSWORD, $row['bind_pwd'], "");

		echo inputField("basedn", MANAGEMENT_SITE_LDAP_BASE, $row['basedn'], "");

		echo inputField("bind_dn", MANAGEMENT_SITE_LDAP_BIND, $row['bind_dn'], "");

		echo inputField("LDAP_preference", MANAGEMENT_SITE_LDAP_FILTER_ONE, $row['LDAP_prefrence'], "");

		echo inputField("LDAP_filter", MANAGEMENT_SITE_LDAP_FILTER_TWO, $row['LDAP_filter'], "");

		endSection();

    } 
	if ($specificDisplay === "xertedetails" | $isOldTheme) {

		beginSection(MANAGEMENT_SITE_XERTE, "xertedetails");

		echo inputField("flash_save_path", MANAGEMENT_SITE_XERTE_SAVE, $row['flash_save_apth'], "");

		echo inputField("flash_upload_path", MANAGEMENT_SITE_XERTE_UPLOAD, $row['flash_upload_path'], "");

		echo inputField("flash_preview_check_path", MANAGEMENT_SITE_XERTE_PREVIEW, $row['flash_preview_check_path'], "");

		echo inputField("flash_flv_skin", MANAGEMENT_SITE_XERTE_SKIN, $row['flash_flv_skin'], "");

		endSection();

    } 
	if ($specificDisplay === "emaildetails" | $isOldTheme) {

		beginSection(MANAGEMENT_SITE_EMAIL, "emaildetails");

		echo inputField("site_email_account", MANAGEMENT_SITE_EMAIL_ACCOUNT, $row['site_email_account'], "");

		echo inputField("headers", MANAGEMENT_SITE_EMAIL_HEADERS, $row['headers'], "");

		echo inputField("email_to_add_to_username", MANAGEMENT_SITE_EMAIL_SUFFIX, $row['email_to_add_to_username'], "");

		echo inputField("proxy1", MANAGEMENT_SITE_PROXY, $row['proxy1'], "");

		echo inputField("port1", MANAGEMENT_SITE_PROXY_PORT, $row['port1'], "");

		echo MANAGEMENT_SITE_PROXY_EXPLAINED;

		endSection();

    } 

	if ($specificDisplay === "languagedetails" | $isOldTheme) {

		beginSection(MANAGEMENT_LIBRARY_LANGUAGES, "languagedetails");

        language_details(false);

		endSection();

    } 

	if ($specificDisplay === "xapidetails" | $isOldTheme) {

		beginSection(MANAGEMENT_SITE_XAPI, "xapidetails");

		echo inputField("LRS_Endpoint", MANAGEMENT_SITE_XAPI_ENDPOINT, $row['LRS_Endpoint']);
		
		echo inputField("LRS_Key", MANAGEMENT_SITE_XAPI_KEY, $row['LRS_Key']);
		
		echo inputField("LRS_Secret", MANAGEMENT_SITE_XAPI_SECRET, $row['LRS_Secret']);
		
		echo inputField("dashboard_enabled", MANAGEMENT_SITE_XAPI_DASHBOARD_ENABLE, $row['dashboard_enabled']);
		
		echo inputField("dashboard_nonanonymous", MANAGEMENT_SITE_XAPI_DASHBOARD_NONANONYMOUS_VIEW, $row['dashboard_nonanonymous']);

		echo dropDowm("xapi_dashboard_minrole", MANAGEMENT_SITE_XAPI_DASHBOARD_MINIMUM_ROLE, $row['xapi_dashboard_minrole'], ["creator"=>SHARING_CREATOR, "co-autor"=>SHARING_COAUTHOR, "editor"=>SHARING_EDITOR, "read-only"=>SHARING_READONLY]);
        

		echo inputField("site_xapi_dashboard_period", MANAGEMENT_SITE_XAPI_DASHBOARD_DEFAULT_PERIOD, $row['dashboard_period'], "");

		echo inputField("xapi_dashboard_urls", MANAGEMENT_SITE_XAPI_DASHBOARD_ALLOWED_URLS, $row['dashboard_allowed_links'], "");

		endSection();

    } 

	if ($specificDisplay === "socialicondetails" | $isOldTheme) {
		
		beginSection(MANAGEMENT_SITE_SOCIALICONS, "socialicondetails");

		echo inputField("site_socialicon_globaldisable", MANAGEMENT_SITE_SOCIALICONS_GLOBALDISABLE, $row['site_socialicon_globaldisable'], "");

		echo inputField("site_socialicon_globalauthorauth", MANAGEMENT_SITE_SOCIALICONS_ALLOWOVERRIDE, $row['site_socialicon_globalauthorauth'], "");

		endSection();

    } 
	
	if ($specificDisplay === "ltidetails" | $isOldTheme) {

		beginSection(MANAGEMENT_SITE_LTI, "ltidetails");

        if (!isset($mysqli)) {

            $mysqli = new mysqli($xerte_toolkits_site->database_host, $xerte_toolkits_site->database_username, $xerte_toolkits_site->database_password, $xerte_toolkits_site->database_name);
            if ($mysqli->error) {
                try {
                    throw new Exception("0MySQL error $mysqli->error <br> Query:<br> $query", $mysqli->errno);
                } catch (Exception $e) {
                    echo "Error No: " . $e->getCode() . " - " . $e->getMessage() . "<br />";
                    echo nl2br($e->getTraceAsString());
                }
            }
        }
        if (!isset($lti)) {
            require_once('../../../LTI/ims-lti/UoN_LTI.php');
            $lti = new UoN_LTI($mysqli);
        }

        $dataret = $lti->get_lti_keys();

        $dataret['NEW'] = array('lti_keys_id' => 'NEW', 'lti_keys_key' => '', 'lti_keys_secret' => '', 'lti_keys_name' => LTI_KEYS_NEW, 'lti_keys_context_id' => '', 'lti_keys_deleted' => '', 'lti_keys_updated_on' => '');

        foreach ($dataret as $lti_key_id => $row) {
			//array('lti_keys_id'=>$lti_keys_id, 'lti_keys_key'=>$lti_keys_key, 'lti_keys_secret'=>$lti_keys_secret, 'lti_keys_name'=>$lti_keys_name, 'lti_keys_context_id'=>$lti_keys_context_id, 'lti_keys_deleted'=>$lti_keys_deleted, 'lti_keys_updated_on'=>$lti_keys_updated_on);

            $click = LTI_TOGGLE;
            $click2 = "&nbsp;&nbsp;<a href=\"javascript:delete_LTI_key('" . $row['lti_keys_id'] . "')\">" . LTI_KEYS_DELETE . "</a>";
            if ($row['lti_keys_id'] == 'NEW') {
                $click = LTI_KEYS_ADD;
                $click2 = '';
            }

            echo "<div class=\"template\" id=\"" . $row['lti_keys_id'] . "\" savevalue=\"" . $row['lti_keys_id'] . "\"><p>" . $row['lti_keys_name'] . " <a href=\"javascript:templates_display('" . $row['lti_keys_id'] . "')\">" . $click . "</a>$click2</p></div><div class=\"template_details\" id=\"" . $row['lti_keys_id'] . "_child\">";

            /* echo "<p>" . LTI_KEYS_NAME . "<form><textarea id=\"lti_keys_name" . $row['lti_keys_id'] . "\">" . $row['lti_keys_name'] . "</textarea></form></p>";
			 * echo "<p>" . LTI_KEYS_KEY . "<form><textarea id=\"lti_keys_key" . $row['lti_keys_id'] . "\">" . $row['lti_keys_key'] . "</textarea></form></p>";
			 * echo "<p>" . LTI_KEYS_SECRET . "<form><textarea id=\"lti_keys_secret" . $row['lti_keys_id'] . "\">" . $row['lti_keys_secret'] . "</textarea></form></p>";
			 * echo "<p>" . LTI_KEYS_CONTEXT_ID . "<form><textarea id=\"lti_keys_context_id" . $row['lti_keys_id'] . "\">" . $row['lti_keys_context_id'] . "</textarea></form></p>"; */

			echo inputField("lti_keys_name" . $row['lti_keys_id'], LTI_KEYS_NAME, $row['lti_keys_name'], "");
			echo inputField("lti_keys_key" . $row['lti_keys_id'], LTI_KEYS_KEY, $row['lti_keys_key'], "");
			echo inputField("lti_keys_secret" . $row['lti_keys_id'], LTI_KEYS_SECRET, $row['lti_keys_secret'], "");
			echo inputField("lti_keys_context_id" . $row['lti_keys_id'], LTI_KEYS_CONTEXT_ID, $row['lti_keys_context_id'], "");

            if ($row['lti_keys_id'] == 'NEW') {
                echo "<div><p><form action=\"javascript:new_LTI_key();\"><input class=\"xerte_button\" type=\"submit\" name=\"new-lti\" value=\"" . LTI_KEYS_ADD_SUBMIT . "\"></form></p></div>";
            } else {
                echo "<div style=\"width:300px;\">";
                echo "<div style=\"float:left;width:100px;\"><p><form action=\"javascript:edit_LTI_key(" . $row['lti_keys_id'] . ");\"><input class=\"xerte_button\" type=\"submit\" name=\"edit-lti\" value=\"" . LTI_KEYS_EDIT_SUBMIT . "\"></form></p></div>";
                echo "<div style=\"float:right;width:100px;\"><p><form><input type=\"submit\" name=\"delete-lti\" value=\"" . LTI_KEYS_DELETE_SUBMIT . "\"></form></p></div>";
                echo "</div>";

            }
			echo "</div>";
			
        }

		endSection();
    }

}



?>
