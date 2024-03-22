<?php 

require_once("../../../config.php");

_load_language_file("/website_code/php/management/site.inc");
_load_language_file("/management.inc");
_load_language_file( "/website_code/php/properties/sharing_status_template.inc");

require_once("../user_library.php");
require_once("management_library.php");

class field{
	public $dbname;
	public $title;
	public $value;
	public $editor;
	public $disabled;
	public $validValues;
	public $multiSelect;
	public $size;

	private function __construct($dbname, $title, $value, $editor) {
		$this->dbname = $dbname;
		$this->title = $title;
		$this->value = $value;
		$this->editor = $editor;
	}

	public static function create($dbname, $title, $value, $editor = "normal"){
		return new self($dbname, $title, $value, $editor);
	}

	/**
	 * @param mixed $validValues is an array with the value as key and if it is disabled as value
	 * @param bool $multiSelect if you can select multiple values
     * @return field
	 **/
	public function setValidValues($validValues, $multiSelect = false){
		$this->validValues = $validValues;
		$this->multiSelect = $multiSelect;
		$this->editor = "multiValue";
		return $this;
	}

	/**
	 * useless with multiSelect because it disable the input element
     * @return field
	 **/
	public function disable(){
		if($this->multiSelect) return $this;
		$this->disabled = true;
		return $this;
	}

	public function size($size) {
		$this->size = $size;
		return $this;
	}
}

function get($specificDisplay){
	global $xerte_toolkits_site;

    database_connect();

	$data = array();
	
    $query = "select * from " . $xerte_toolkits_site->database_table_prefix . "sitedetails";

    $row = db_query_one($query);

    $site_texts = explode("~~~", $row['site_text']);

    $row['site_text'] = $site_texts[0];
    $row['tutorial_text'] = "";

    if (count($site_texts) > 1) {
        $row['tutorial_text'] = $site_texts[1];
    }
	
	//consider moving $specificDisplay to $data as key and make $data two dimentional
	if ($specificDisplay === "siteSettings") {

		$data[] = field::create("site_url", MANAGEMENT_SITE_URL, $row['site_url'], "normal");

		$data[] = field::create("site_title", MANAGEMENT_SITE_TITLE_HTML, $row['site_title'], "normal");

		$data[] = field::create("site_name", MANAGEMENT_SITE_NAME, $row['site_name'], "wysiwyg");

		$data[] = field::create("site_logo", MANAGEMENT_SITE_LOGO, $row['site_logo'], "normal");

		$data[] = field::create("organisation_logo", MANAGEMENT_SITE_LOGO_ORG, $row['organisational_logo'], "normal");

		$data[] = field::create("welcome_message", MANAGEMENT_SITE_WELCOME, $row['welcome_message'], "wysiwyg");

		$data[] = field::create("site_text", MANAGEMENT_SITE_TEXT, $row['site_text'], "wysiwyg");

		$data[] = field::create("tutorial_text", MANAGEMENT_TUTORIAL_TEXT, $row['tutorial_text'], "wysiwyg");

		$data[] = field::create("news_text", MANAGEMENT_SITE_NEWS, base64_decode($row['news_text']), "wysiwyg");

		$data[] = field::create("pod_one", MANAGEMENT_SITE_POD_ONE, base64_decode($row['pod_one']), "wysiwyg");

		$data[] = field::create("pod_two", MANAGEMENT_SITE_POD_TWO, base64_decode($row['pod_two']), "wysiwyg");

		$data[] = field::create("copyright", MANAGEMENT_SITE_COPYRIGHT, htmlspecialchars($row['copyright']), "normal");

		$data[] = field::create("demonstration_page", MANAGEMENT_SITE_DEMONSTRATION, $row['demonstration_page'], "normal");

		$data[] = field::create("form_string", MANAGEMENT_SITE_LOGIN_FORM, base64_decode($row['form_string']), "code");

		$data[] = field::create("peer_form_string", MANAGEMENT_SITE_PEER_FORM, base64_decode($row['peer_form_string']), "code");

		$data[] = field::create("feedback_list", MANAGEMENT_SITE_FEEDBACK, $row['feedback_list'], "normal");

    } elseif ($specificDisplay === "serverdetails") {
		$data[] = field::create("apache", MANAGEMENT_SITE_HTACCESS, $row['apache']);

		$data[] = field::create("site_session_name", MANAGEMENT_SITE_SESSION_NAME, $row['site_session_name']);
        if (Xerte_Validate_FileMimeType::canRun()) {
			$data[] = field::create("enable_mime_check", MANAGEMENT_SITE_ENABLE_MIME, $row['enable_mime_check']);
        } else {
			$data[] = field::create("enable_mime_check", MANAGEMENT_SITE_ENABLE_MIME, "False. The MIME check requires the PHP 'mime_content_type' function.")->disable();
        }

		$data[] = field::create("mimetypes", MANAGEMENT_SITE_MIME, $row['mimetypes']);

        if (Xerte_Validate_FileExtension::canRun()) {
			$data[] = field::create("enable_file_ext_check", MANAGEMENT_SITE_ENABLE_FILE_EXT, $row['enable_file_ext_check']);
        } else {
			$data[] = field::create("enable_file_ext_check", MANAGEMENT_SITE_ENABLE_FILE_EXT, "False. The file extension check requires the PHP 'pathinfo' function.")->disable();
        }

		$data[] = field::create("file_extensions", MANAGEMENT_SITE_FILE_EXTENSIONS, $row['file_extensions']);

        // Clear the file cache because of the file check below.
        clearstatcache();
        if ($xerte_toolkits_site->enable_clamav_check && (!is_file($xerte_toolkits_site->clamav_cmd) || !is_executable($xerte_toolkits_site->clamav_cmd))) {
			$data[] = field::create("enable_clamav_check", MANAGEMENT_SITE_ENABLE_CLAMAV_CHK, "False. The ClamAV antivirus check requires a valid command pathname.")->disable();
        } else {
			$data[] = field::create("enable_clamav_check", MANAGEMENT_SITE_ENABLE_CLAMAV_CHK, $row['enable_clamav_check']);
        }

		$data[] = field::create("clamav_cmd", MANAGEMENT_SITE_CLAMAV_CMD, str_replace('//', '/', $row['clamav_cmd']));

		$data[] = field::create("clamav_opts", MANAGEMENT_SITE_CLAMAV_OPTS, $row['clamav_opts']);

		$data[] = field::create("integration_config_path", MANAGEMENT_SITE_INTEGRATION, $row['integration_config_path']);

		$data[] = field::create("admin_username", MANAGEMENT_SITE_ADMIN_USER, $row['admin_username']);

		$data[] = field::create("admin_password", MANAGEMENT_SITE_ADMIN_PASSWORD, htmlspecialchars($row['admin_password']));

    } elseif ($specificDisplay === "rssdetails") {

		$data[] = field::create("rss_title", MANAGEMENT_SITE_RSS_TITLE, $row['rss_title']);

		$data[] = field::create("synd_publisher", MANAGEMENT_SITE_RSS_PUBLISHER, $row['synd_publisher']);

		$data[] = field::create("synd_rights", MANAGEMENT_SITE_RSS_RIGHTS, $row['synd_rights']);

		$data[] = field::create("synd_license", MANAGEMENT_SITE_RSS_LICENCE, $row['synd_license']);

    } elseif ($specificDisplay === "pathdetails") {

		$data[] = field::create("module_path", MANAGEMENT_SITE_PATH_MODULE, $row['module_path']);

		$data[] = field::create("website_code_path", MANAGEMENT_SITE_PATH_WEBSITE, $row['website_code_path']);

		$data[] = field::create("users_file_area_short", MANAGEMENT_SITE_PATH_SHORT, $row['users_file_area_short']);

		$data[] = field::create("php_library_path", MANAGEMENT_SITE_PATH_LIBRARY, $row['php_library_path']);

		$data[] = field::create("root_file_path", MANAGEMENT_SITE_PATH_ROOT, str_replace("\\", "/", $row['root_file_path']));

		$data[] = field::create("import_path", MANAGEMENT_SITE_PATH_IMPORT, str_replace("\\", "/", $row['import_path']));

    } elseif ($specificDisplay === "sqldetails") {

		$data[] = field::create("play_edit_preview_query", MANAGEMENT_SITE_QUERY, base64_decode($row['play_edit_preview_query']))->size(20);

    } elseif ($specificDisplay === "errordetails") {

		$data[] = field::create("error_log_message", MANAGEMENT_SITE_ERROR_EMAIL_ACCOUNT, $row['error_log_message']);

		$data[] = field::create("email_error_list", MANAGEMENT_SITE_ERROR_EMAIL, $row['email_error_list']);

		$data[] = field::create("max_error_size", MANAGEMENT_SITE_ERROR_MAX, $row['max_error_size']);

    } elseif ($specificDisplay === "authdetails") {

		$data[] = field::create("authentication_method", MANAGEMENT_SITE_AUTH_METHOD, $row['authentication_method'])
					   ->setValidValues(["Guest"=>false, "Ldap"=>false, "Db"=>false, "Static"=>false, "Moodle"=>false, "Saml2"=>false, "OAuth2"=>false]);

    } elseif ($specificDisplay === "ldapdetails") {

        $data[] = MANAGEMENT_SITE_LDAP_DELIMIT;

		$data[] = field::create("ldap_host", MANAGEMENT_SITE_LDAP_HOST, $row['ldap_host']);

		$data[] = field::create("ldap_port", MANAGEMENT_SITE_LDAP_PORT, $row['ldap_port']);

		$data[] = field::create("bind_pwd", MANAGEMENT_SITE_LDAP_PASSWORD, htmlspecialchars($row['bind_pwd']));

		$data[] = field::create("basedn", MANAGEMENT_SITE_LDAP_BASE, $row['basedn']);

		$data[] = field::create("bind_dn", MANAGEMENT_SITE_LDAP_BIND, $row['bind_dn']);

		$data[] = field::create("LDAP_preference", MANAGEMENT_SITE_LDAP_FILTER_ONE, $row['LDAP_preference']);

		$data[] = field::create("LDAP_filter", MANAGEMENT_SITE_LDAP_FILTER_TWO, $row['LDAP_filter']);
		
    } elseif ($specificDisplay === "xertedetails") {

		$data[] = field::create("flash_save_path", MANAGEMENT_SITE_XERTE_SAVE, $row['flash_save_path']);

		$data[] = field::create("flash_upload_path", MANAGEMENT_SITE_XERTE_UPLOAD, $row['flash_upload_path']);

		$data[] = field::create("flash_preview_check_path", MANAGEMENT_SITE_XERTE_PREVIEW, $row['flash_preview_check_path']);

		$data[] = field::create("flash_flv_skin", MANAGEMENT_SITE_XERTE_SKIN, $row['flash_flv_skin']);

    } elseif ($specificDisplay === "emaildetails") {

		$data[] = field::create("site_email_account", MANAGEMENT_SITE_EMAIL_ACCOUNT, $row['site_email_account']);

		$data[] = field::create("header", MANAGEMENT_SITE_EMAIL_HEADERS, $row['header']);

		$data[] = field::create("email_to_add_to_username", MANAGEMENT_SITE_EMAIL_SUFFIX, $row['email_to_add_to_username']);

		$data[] = field::create("proxy1", MANAGEMENT_SITE_PROXY, $row['proxy1']);

		$data[] = field::create("port1", MANAGEMENT_SITE_PROXY_PORT, $row['port1']);

		$data[] = MANAGEMENT_SITE_PROXY_EXPLAINED;

    } elseif ($specificDisplay === "languagedetails") {
        language_details(false);

    } elseif ($specificDisplay === "xapidetails") {

		$data[] = field::create("LRS_Endpoint", MANAGEMENT_SITE_XAPI_ENDPOINT, $row['LRS_Endpoint']);

		$data[] = field::create("LRS_Key", MANAGEMENT_SITE_XAPI_KEY, $row['LRS_Key']);

		$data[] = field::create("LRS_Secret", MANAGEMENT_SITE_XAPI_SECRET, $row['LRS_Secret']);

		$data[] = field::create("dashboard_enable", MANAGEMENT_SITE_XAPI_DASHBOARD_ENABLE, $row['dashboard_enable']);

		$data[] = field::create("dashboard_nonanonymous", MANAGEMENT_SITE_XAPI_DASHBOARD_NONANONYMOUS_VIEW, $row['dashboard_nonanonymous']);

		$data[] = field::create("xapi_dashboard_minrole", MANAGEMENT_SITE_XAPI_DASHBOARD_MINIMUM_ROLE, $row['xapi_dashboard_minrole'])
					   ->setValidValues([SHARING_CREATOR=>false, SHARING_COAUTHOR=>false, SHARING_EDITOR=>false, SHARING_READONLY=>false]);

		$data[] = field::create("dashboard_period", MANAGEMENT_SITE_XAPI_DASHBOARD_DEFAULT_PERIOD, $row['dashboard_period']);

		$data[] = field::create("dashboard_allowed_links", MANAGEMENT_SITE_XAPI_DASHBOARD_ALLOWED_URLS, $row['dashboard_allow_links']);

    } elseif ($specificDisplay === "socialicondetails") {

		$data[] = field::create("globalhidesocial", MANAGEMENT_SITE_SOCIALICONS_GLOBALDISABLE, $row['globalhidesocial']);

		$data[] = field::create("globalsocialauth", MANAGEMENT_SITE_SOCIALICONS_ALLOWOVERRIDE, $row['globalsocialauth']);

    } elseif ($specificDisplay === "ltidetails") {
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

		//$data['ltidetails'] = array("keys" => array());

        foreach ($dataret as $lti_key_id => $row) {
//array('lti_keys_id'=>$lti_keys_id, 'lti_keys_key'=>$lti_keys_key, 'lti_keys_secret'=>$lti_keys_secret, 'lti_keys_name'=>$lti_keys_name, 'lti_keys_context_id'=>$lti_keys_context_id, 'lti_keys_deleted'=>$lti_keys_deleted, 'lti_keys_updated_on'=>$lti_keys_updated_on);

            //$click = LTI_TOGGLE;
            //$click2 = "&nbsp;&nbsp;<a href=\"javascript:delete_LTI_key('" . $row['lti_keys_id'] . "')\">" . LTI_KEYS_DELETE . "</a>";
			
			
			$key = array("id" => $row['lti_keys_id'], "name" => $row['lti_keys_name'], "key" => $row['lti_keys_key'], "secret" => $row['lti_keys_secret'], "context_id" => $row['lti_keys_context_id'], "button1" => LTI_TOGGLE, "buttonDelete"=>true);
	
            if ($row['lti_keys_id'] == 'NEW') {
                $key['button1'] = LTI_KEYS_ADD;
                $key['buttonDelete'] = false;
            }

			//$data['ltidetails']['keys'][] = $key;
			$data['keys'][] = $key;
/*
            echo "<div class=\"template\" id=\"" . $row['lti_keys_id'] . "\" savevalue=\"" . $row['lti_keys_id'] . "\"><p>" . $row['lti_keys_name'] . " <a href=\"javascript:templates_display('" . $row['lti_keys_id'] . "')\">" . $click . "</a>$click2</p></div><div class=\"template_details\" id=\"" . $row['lti_keys_id'] . "_child\">";

            echo "<p>" . LTI_KEYS_NAME . "<form><textarea id=\"lti_keys_name" . $row['lti_keys_id'] . "\">" . $row['lti_keys_name'] . "</textarea></form></p>";
            echo "<p>" . LTI_KEYS_KEY . "<form><textarea id=\"lti_keys_key" . $row['lti_keys_id'] . "\">" . $row['lti_keys_key'] . "</textarea></form></p>";
            echo "<p>" . LTI_KEYS_SECRET . "<form><textarea id=\"lti_keys_secret" . $row['lti_keys_id'] . "\">" . $row['lti_keys_secret'] . "</textarea></form></p>";
            echo "<p>" . LTI_KEYS_CONTEXT_ID . "<form><textarea id=\"lti_keys_context_id" . $row['lti_keys_id'] . "\">" . $row['lti_keys_context_id'] . "</textarea></form></p>";

            if ($row['lti_keys_id'] == 'NEW') {
                echo "<div><p><form action=\"javascript:new_LTI_key();\"><input class=\"xerte_button\" type=\"submit\" name=\"new-lti\" value=\"" . LTI_KEYS_ADD_SUBMIT . "\"></form></p></div>";
            } else {
                echo "<div style=\"width:300px;\">";
                echo "<div style=\"float:left;width:100px;\"><p><form action=\"javascript:edit_LTI_key(" . $row['lti_keys_id'] . ");\"><input class=\"xerte_button\" type=\"submit\" name=\"edit-lti\" value=\"" . LTI_KEYS_EDIT_SUBMIT . "\"></form></p></div>";
                echo "<div style=\"float:right;width:100px;\"><p><form><input type=\"submit\" name=\"delete-lti\" value=\"" . LTI_KEYS_DELETE_SUBMIT . "\"></form></p></div>";
                echo "</div>";

            }
			echo "</div>";
  */
		}
	}
	return $data;
};
