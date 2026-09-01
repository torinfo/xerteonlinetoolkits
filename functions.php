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
 * @param string $string - the message to write to the debug file.
 * @param int $up - how far up the call stack we go to; this affects the line number/file name given in logging
 */
function _debug($string, $up = 0) {
    global $development;
    if (isset($development) && $development) {
        if (!is_string($string)) {
            $string = print_r($string, true);
        }

        // yes, we really don't want to report file write errors if this doesn't work.

        $backtrace = debug_backtrace();
        if (isset($backtrace[$up]['file'])) {
            $string = $backtrace[$up]['file'] . $backtrace[$up]['line'] . $string;
        }
        $file = '/tmp/debug.log';
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            $file = 'c:\debug.log';
        }

        if (defined('XOT_DEBUG_LOGFILE')) {
            $file = XOT_DEBUG_LOGFILE;
        }
        if (!file_exists($file)) {
            @touch($file); // try and create it.
        }


        if (!_is_writable($file)) { // fall back to PHP's inbuilt log, which may go to the apache log file, syslog or somewhere else.
            error_log($string);
        } else {
            @file_put_contents($file, date('Y-m-d H:i:s ') . $string . "\n", FILE_APPEND);
        }
    }
}

/**
 * Try loading a language file. This will lead to the definition of multiple constants.
 *
 *  We try and choose the language based on:
 *
 * 1. If the user has $_GET['language'] set, then try to use the value of this and persist it in $_SESSION['toolkits_language']
 * 2. If the user does not have $_GET['lanauge'] but does have $_SESSION['toolkits_language'] then use this
 * 3. If none of the above, then check what their browser offers through $_SERVER['HTTP_ACCEPT_LANGUAGE'] and try and use the best one.
 * 4. If we can't find a language to match the user, then fall back to en_GB (language pack languages/en-GB)
 *
 * @param string $file_path
 * @return boolean true on success; else false.
 */
function _load_language_file($file_path) {
    global $development;
    Zend_Locale::setDefault('en_GB');

    $languages = dirname(__FILE__) . '/languages/';

    if (isset($_REQUEST['language']) && is_dir($languages . $_REQUEST['language'])) {
        $_SESSION['toolkits_language'] = $_REQUEST['language'];
    }

    if (isset($_SESSION['toolkits_language'])) {
        $language = $_SESSION['toolkits_language'];
    } else {
        // this does some magic interrogation of $_SERVER['HTTP_ACCEPT_LANGUAGE'];
        //$language = new Zend_Locale();
        if (isset($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
            if (function_exists("locale_accept_from_http")) {
                $language = locale_accept_from_http($_SERVER['HTTP_ACCEPT_LANGUAGE']);
            } else {
                $lang = explode(',', $_SERVER['HTTP_ACCEPT_LANGUAGE']);
                $language = $lang[0];
            }
        }
        if (isset($language)) {
            // xerte seems to use en-GB instead of the more standard en_GB. Assume this convention will persist....
            $language_name = str_replace('_', '-', $language);
            // Check that Xerte supports the required language.
            if (!is_dir($languages . $language_name)) {

                // try and catch e.g. getting back 'en' as our locale - so choose any english language pack
                $found = false;
                foreach (glob($languages . substr($language, 0, 2) . '*') as $dir) {
                    $found = true;
                    $language_name = basename($dir);
                    break;
                }
                if (!$found)
                    $language_name = "en-GB";
            }
            $language = $language_name;
        }
        else
        {
            $language = "en-GB";
        }
        $_SESSION['toolkits_language'] = $language;
    }


    $real_file_path = $languages . $language . $file_path;
    $en_gb_file_path = $languages . "en-GB" . $file_path;

    if ($language != "en-GB") {
        if (file_exists($real_file_path)) {
            require_once($real_file_path);
        } else {
            // stuff will break at this point.
            //die("Where was $real_file_path?");
            if ($development) {
                error_log("Failed to load language file for Xerte - $language/$file_path");
                //return false;
            }
        }
    }
    if (file_exists($en_gb_file_path)) {
        // prevent notices from redefines of other languages
        $prev_el = error_reporting(E_ALL ^ (E_NOTICE | E_WARNING));
        require_once($en_gb_file_path);
        error_reporting($prev_el);
    } else {
        // stuff will break at this point.
        //die("Where was $real_file_path?");
        error_log("Failed to load language file for Xerte - en-gb/$file_path");
        return false;
    }
    return true;
}

/**
 * Supported toolkits UI themes (files under theme/{name}/).
 */
function get_available_toolkits_ui_themes() {
    return array('nottingham', 'modern');
}

/**
 * Reload preferences JSON from the database into the session (when supported).
 */
function refresh_toolkits_user_preferences_session() {
    global $xerte_toolkits_site;

    if (empty($_SESSION['toolkits_logon_username'])) {
        return;
    }
    if (!function_exists('db_query_one')) {
        return;
    }
    try {
        $authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);
        if (!$authmech || !$authmech->hasUserPrefrences()) {
            return;
        }
    } catch (Exception $e) {
        return;
    }

    $row = db_query_one(
        "SELECT preference FROM {$xerte_toolkits_site->database_table_prefix}logindetails WHERE username = ?",
        array($_SESSION['toolkits_logon_username'])
    );
    if (!empty($row) && isset($row['preference']) && $row['preference'] !== '') {
        $decoded = json_decode($row['preference'], true);
        if (is_array($decoded)) {
            $_SESSION['toolkits_preferences'] = $decoded;
            return;
        }
    }
    if (!isset($_SESSION['toolkits_preferences']) || !is_array($_SESSION['toolkits_preferences'])) {
        $_SESSION['toolkits_preferences'] = array();
    }
    ensure_toolkits_ui_theme_preference(false);
}

/**
 * Ensure toolkits_ui_theme exists in session preferences (default: nottingham).
 *
 * @param bool $persist When true, write back to logindetails.preference if the key was missing or invalid.
 * @return string Active theme id
 */
function ensure_toolkits_ui_theme_preference($persist = false) {
    global $xerte_toolkits_site;

    $available = get_available_toolkits_ui_themes();
    if (!isset($_SESSION['toolkits_preferences']) || !is_array($_SESSION['toolkits_preferences'])) {
        $_SESSION['toolkits_preferences'] = array();
    }

    $needsDefault = true;
    if (array_key_exists('toolkits_ui_theme', $_SESSION['toolkits_preferences'])) {
        $candidate = preg_replace('/[^a-zA-Z0-9_-]/', '', (string) $_SESSION['toolkits_preferences']['toolkits_ui_theme']);
        if (in_array($candidate, $available, true)) {
            $_SESSION['toolkits_preferences']['toolkits_ui_theme'] = $candidate;
            $needsDefault = false;
        }
    }

    if ($needsDefault) {
        $_SESSION['toolkits_preferences']['toolkits_ui_theme'] = 'nottingham';
    }

    if ($persist && $needsDefault && !empty($_SESSION['toolkits_logon_username']) && function_exists('db_query')) {
        try {
            $authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);
            if ($authmech && $authmech->hasUserPrefrences()) {
                $preferences_json = json_encode($_SESSION['toolkits_preferences']);
                if ($preferences_json !== false) {
                    db_query(
                        "UPDATE {$xerte_toolkits_site->database_table_prefix}logindetails SET preference = ? WHERE username = ?",
                        array($preferences_json, $_SESSION['toolkits_logon_username'])
                    );
                }
            }
        } catch (Exception $e) {
            // Session default is enough if DB write fails
        }
    }

    return $_SESSION['toolkits_preferences']['toolkits_ui_theme'];
}

function get_toolkits_ui_theme() {
    return ensure_toolkits_ui_theme_preference(false);
}

function toolkits_ui_theme_body_class() {
    return 'toolkits-ui-theme-' . get_toolkits_ui_theme();
}

/**
 * Resolve a script path to theme override or core website_code path.
 *
 * @return array{path: string, url_param: string}
 */
function resolve_toolkits_script_path($file_path) {
    $root = dirname(__FILE__) . DIRECTORY_SEPARATOR;
    $url_param = '';
    $parpos = strpos($file_path, '?');
    if ($parpos !== false) {
        $url_param = substr($file_path, $parpos);
        $file_path = substr($file_path, 0, $parpos);
    }

    $theme = get_toolkits_ui_theme();
    $basename = basename($file_path);
    $candidates = array(
        'theme/' . $theme . '/' . $file_path,
        'theme/' . $theme . '/' . $basename,
    );

    foreach ($candidates as $candidate) {
        $fsPath = $root . str_replace('/', DIRECTORY_SEPARATOR, $candidate);
        if (file_exists($fsPath)) {
            return array('path' => $candidate, 'url_param' => $url_param);
        }
    }

    return array('path' => $file_path, 'url_param' => $url_param);
}

function toolkits_script_url($file_path) {
    global $xerte_toolkits_site;
    $resolved = resolve_toolkits_script_path($file_path);
    return $xerte_toolkits_site->site_url . $resolved['path'] . $resolved['url_param'];
}

/**
 * Resolve a theme asset (e.g. modern.css, nottingham.js) under theme/{name}/.
 *
 * @return array{path: string, url_param: string}
 */
function resolve_toolkits_theme_asset_path($filename) {
    $root = dirname(__FILE__) . DIRECTORY_SEPARATOR;
    $url_param = '';
    $parpos = strpos($filename, '?');
    if ($parpos !== false) {
        $url_param = substr($filename, $parpos);
        $filename = substr($filename, 0, $parpos);
    }

    $theme = get_toolkits_ui_theme();
    $candidate = 'theme/' . $theme . '/' . $filename;
    $fsPath = $root . str_replace('/', DIRECTORY_SEPARATOR, $candidate);
    if (file_exists($fsPath)) {
        return array('path' => $candidate, 'url_param' => $url_param);
    }

    return array('path' => $filename, 'url_param' => $url_param);
}

function toolkits_theme_asset_url($filename) {
    global $xerte_toolkits_site;
    $resolved = resolve_toolkits_theme_asset_path($filename);
    return $xerte_toolkits_site->site_url . $resolved['path'] . $resolved['url_param'];
}

function echo_toolkits_theme_stylesheet_link($version = '') {
    $theme = get_toolkits_ui_theme();
    $query = $version !== '' ? '?version=' . rawurlencode($version) : '';
    $href = htmlspecialchars(toolkits_theme_asset_url($theme . '.css' . $query), ENT_QUOTES, 'UTF-8');
    echo '<link href="' . $href . '" media="all" type="text/css" rel="stylesheet"/>' . "\n";
}

function echo_toolkits_theme_shell_script($version = '') {
    $theme = get_toolkits_ui_theme();
    $query = $version !== '' ? '?version=' . rawurlencode($version) : '';
    $src = htmlspecialchars(toolkits_theme_asset_url($theme . '.js' . $query), ENT_QUOTES, 'UTF-8');
    echo '<script type="text/javascript" src="' . $src . '"></script>' . "\n";
}

/**
 * Optional LO editor theme assets (only when theme/{name}/editor.css or editor-pages.js exist).
 * Nottingham has none — classic editor unchanged.
 */
function echo_toolkits_theme_editor_assets($version = '') {
    $theme = get_toolkits_ui_theme();
    $root = dirname(__FILE__) . DIRECTORY_SEPARATOR;
    $query = $version !== '' ? '?version=' . rawurlencode($version) : '';

    $cssRel = 'theme/' . $theme . '/editor.css';
    if (file_exists($root . str_replace('/', DIRECTORY_SEPARATOR, $cssRel))) {
        $href = htmlspecialchars(toolkits_theme_asset_url('editor.css' . $query), ENT_QUOTES, 'UTF-8');
        echo '<link rel="stylesheet" type="text/css" href="' . $href . '"/>' . "\n";
    }

    $jsRel = 'theme/' . $theme . '/editor-pages.js';
    if (file_exists($root . str_replace('/', DIRECTORY_SEPARATOR, $jsRel))) {
        // Loaded after tree.js from edithtml — this helper only used for the link when called late.
        $src = htmlspecialchars(toolkits_theme_asset_url('editor-pages.js' . $query), ENT_QUOTES, 'UTF-8');
        echo '<script type="text/javascript" src="' . $src . '"></script>' . "\n";
    }
}

/**
 * Body class list for the LO editor (elevated rights + toolkits UI theme).
 *
 * @param bool $elevated
 * @return string attribute including leading space, or empty string
 */
function toolkits_editor_body_class_attr($elevated = false) {
    $classes = array();
    if ($elevated) {
        $classes[] = 'elevated';
    }
    $classes[] = toolkits_ui_theme_body_class();
    return ' class="' . htmlspecialchars(implode(' ', $classes), ENT_QUOTES, 'UTF-8') . '"';
}

/**
 * Data passed to theme shell scripts (nottingham.js / modern.js) on index.php.
 *
 * @param object $authmech
 * @return array<string, mixed>
 */
function build_toolkits_index_page_config($authmech) {
    global $xerte_toolkits_site;

    $root = $xerte_toolkits_site->root_file_path;
    $logoLeft = file_exists($root . 'branding/logo_left.png')
        ? 'branding/logo_left.png'
        : 'website_code/images/logo.png';
    $logoRight = file_exists($root . 'branding/logo_right.png')
        ? 'branding/logo_right.png'
        : 'website_code/images/apereoLogo.png';

    ob_start();
    display_language_selectionform('general', false);
    $languageFormHtml = ob_get_clean();

    ob_start();
    list_blank_templates();
    $blankTemplatesHtml = ob_get_clean();

    ob_start();
    echo apply_filters('editor_pod_one', $xerte_toolkits_site->pod_one);
    $podOne = ob_get_clean();

    ob_start();
    echo apply_filters('editor_pod_two', $xerte_toolkits_site->pod_two);
    $podTwo = ob_get_clean();

    $vtext = 'version.txt';
    $versionInfo = '';
    if (file_exists($root . $vtext)) {
        $lines = file($root . $vtext);
        $versionInfo = isset($lines[0]) ? trim($lines[0]) : '';
    }

    $firstName = isset($_SESSION['toolkits_firstname']) ? $_SESSION['toolkits_firstname'] : '';
    $surname = isset($_SESSION['toolkits_surname']) ? $_SESSION['toolkits_surname'] : '';
    $displayName = trim($firstName . ' ' . $surname);
    if ($displayName === '' && !empty($_SESSION['toolkits_logon_username'])) {
        $displayName = $_SESSION['toolkits_logon_username'];
    }

    $welcome = defined('INDEX_MODERN_WELCOME')
        ? sprintf(INDEX_MODERN_WELCOME, $firstName !== '' ? $firstName : $displayName)
        : $displayName . ', welcome to Xerte';

    $jsscript = '';
    $canManageUser = $authmech->canManageUser($jsscript);

    $strings = array(
        'folderPrompt' => INDEX_FOLDER_PROMPT,
        'folderName' => INDEX_FOLDER_NAME,
        'folderCreate' => INDEX_BUTTON_NEWFOLDER_CREATE,
        'folderCancel' => INDEX_BUTTON_CANCEL,
        'xapiShowNames' => INDEX_XAPI_DASHBOARD_SHOW_NAMES,
        'xapiFrom' => INDEX_XAPI_DASHBOARD_FROM,
        'xapiUntil' => INDEX_XAPI_DASHBOARD_UNTIL,
        'xapiGroupSelect' => INDEX_XAPI_DASHBOARD_GROUP_SELECT,
        'xapiGroupAll' => INDEX_XAPI_DASHBOARD_GROUP_ALL,
        'xapiClose' => INDEX_XAPI_DASHBOARD_CLOSE,
        'xapiDisplayOptions' => INDEX_XAPI_DASHBOARD_DISPLAY_OPTIONS,
        'xapiQuestionOverview' => INDEX_XAPI_DASHBOARD_QUESTION_OVERVIEW,
        'xapiPrint' => INDEX_XAPI_DASHBOARD_PRINT,
        'logoAlt' => INDEX_LOGO_ALT,
        'changePassword' => INDEX_CHANGE_PASSWORD,
        'modernPreferences' => defined('INDEX_MODERN_PREFERENCES') ? INDEX_MODERN_PREFERENCES : 'Preferences',
        'modernSettings' => defined('INDEX_MODERN_SETTINGS') ? INDEX_MODERN_SETTINGS : INDEX_SETTINGS_BUTTON,
        'modernMyDetails' => defined('INDEX_MODERN_USER_MENU_MY_DETAILS') ? INDEX_MODERN_USER_MENU_MY_DETAILS : 'My details',
        'modernFeedback' => defined('INDEX_MODERN_USER_MENU_FEEDBACK') ? INDEX_MODERN_USER_MENU_FEEDBACK : 'Give feedback',
        'modernFeedbackDesc' => defined('INDEX_MODERN_FEEDBACK_DESC') ? INDEX_MODERN_FEEDBACK_DESC : 'Share your thoughts about Xerte. Feedback is anonymous unless you leave your name or contact details.',
        'modernFeedbackName' => defined('INDEX_MODERN_FEEDBACK_NAME') ? INDEX_MODERN_FEEDBACK_NAME : 'Name (optional)',
        'modernFeedbackMessage' => defined('INDEX_MODERN_FEEDBACK_MESSAGE') ? INDEX_MODERN_FEEDBACK_MESSAGE : 'Your feedback',
        'modernFeedbackSend' => defined('INDEX_MODERN_FEEDBACK_SEND') ? INDEX_MODERN_FEEDBACK_SEND : 'Send feedback',
        'modernFeedbackThanks' => defined('INDEX_MODERN_FEEDBACK_THANKS') ? INDEX_MODERN_FEEDBACK_THANKS : 'Thank you for your feedback.',
        'modernFeedbackError' => defined('INDEX_MODERN_FEEDBACK_ERROR') ? INDEX_MODERN_FEEDBACK_ERROR : 'Could not send feedback. Please try again.',
        'modernDetailsLoading' => defined('INDEX_MODERN_DETAILS_LOADING') ? INDEX_MODERN_DETAILS_LOADING : 'Loading details…',
        'modernDetailsError' => defined('INDEX_MODERN_DETAILS_ERROR') ? INDEX_MODERN_DETAILS_ERROR : 'Could not load your details. Please try again.',
        'toManagement' => INDEX_TO_MANAGEMENT,
        'logout' => INDEX_BUTTON_LOGOUT,
        'details' => INDEX_DETAILS,
        'edit' => INDEX_BUTTON_EDIT,
        'properties' => INDEX_BUTTON_PROPERTIES,
        'preview' => INDEX_BUTTON_PREVIEW,
        'newFolder' => INDEX_BUTTON_NEWFOLDER,
        'delete' => INDEX_BUTTON_DELETE,
        'duplicate' => INDEX_BUTTON_DUPLICATE,
        'publish' => INDEX_BUTTON_PUBLISH,
        'sort' => INDEX_SORT,
        'sortA' => INDEX_SORT_A,
        'sortZ' => INDEX_SORT_Z,
        'sortNew' => INDEX_SORT_NEW,
        'sortOld' => INDEX_SORT_OLD,
        'search' => INDEX_SEARCH,
        'searchPlaceholder' => INDEX_SEARCH_PLACEHOLDER,
        'create' => INDEX_CREATE,
        'wcagAlt' => INDEX_WCAG_LOGO_ALT,
        'osiAlt' => INDEX_OSI_LOGO_ALT,
        'apereoAlt' => INDEX_APEREO_LOGO_ALT,
        'xerteAlt' => INDEX_XERTE_LOGO_ALT,
        'modernSearch' => defined('INDEX_MODERN_SEARCH_PLACEHOLDER') ? INDEX_MODERN_SEARCH_PLACEHOLDER : INDEX_SEARCH,
        'modernCreateLo' => defined('INDEX_MODERN_CREATE_LO') ? INDEX_MODERN_CREATE_LO : INDEX_CREATE,
        'modernCreateEmptyTitle' => defined('INDEX_MODERN_CREATE_EMPTY_TITLE') ? INDEX_MODERN_CREATE_EMPTY_TITLE : 'Empty learning object',
        'modernCreateEmptyDesc' => defined('INDEX_MODERN_CREATE_EMPTY_DESC') ? INDEX_MODERN_CREATE_EMPTY_DESC : 'Start with a blank learning object and build it yourself with pages.',
        'modernCreateTemplateTitle' => defined('INDEX_MODERN_CREATE_TEMPLATE_TITLE') ? INDEX_MODERN_CREATE_TEMPLATE_TITLE : 'From a template',
        'modernCreateTemplateDesc' => defined('INDEX_MODERN_CREATE_TEMPLATE_DESC') ? INDEX_MODERN_CREATE_TEMPLATE_DESC : 'Use a template that you can customise.',
        'modernCreateTemplatePlaceholder' => defined('INDEX_MODERN_CREATE_TEMPLATE_PLACEHOLDER') ? INDEX_MODERN_CREATE_TEMPLATE_PLACEHOLDER : 'Choose a template',
        'modernCreateProjectName' => defined('INDEX_MODERN_CREATE_PROJECT_NAME') ? INDEX_MODERN_CREATE_PROJECT_NAME : 'Project name',
        'modernNavAll' => defined('INDEX_MODERN_NAV_ALL') ? INDEX_MODERN_NAV_ALL : INDEX_WORKSPACE_TITLE,
        'modernEmptyTitle' => defined('INDEX_MODERN_EMPTY_TITLE') ? INDEX_MODERN_EMPTY_TITLE : 'You have no learning objects yet',
        'modernEmptyDesc' => defined('INDEX_MODERN_EMPTY_DESC') ? INDEX_MODERN_EMPTY_DESC : 'Learning objects appear here',
        'modernRecentEmptyTitle' => defined('INDEX_MODERN_RECENT_EMPTY_TITLE') ? INDEX_MODERN_RECENT_EMPTY_TITLE : 'You have no recent learning objects yet',
        'modernRecentEmptyDesc' => defined('INDEX_MODERN_RECENT_EMPTY_DESC') ? INDEX_MODERN_RECENT_EMPTY_DESC : 'Recent learning objects appear here',
        'modernLoTypeInteractive' => defined('INDEX_MODERN_LO_TYPE_INTERACTIVE') ? INDEX_MODERN_LO_TYPE_INTERACTIVE : 'Interactive learning object',
        'modernLoTypeSite' => defined('INDEX_MODERN_LO_TYPE_SITE') ? INDEX_MODERN_LO_TYPE_SITE : 'Mini-website learning object',
        'modernNavFolders' => defined('INDEX_MODERN_NAV_FOLDERS') ? INDEX_MODERN_NAV_FOLDERS : INDEX_BUTTON_NEWFOLDER,
        'modernNavRecent' => defined('INDEX_MODERN_NAV_RECENT') ? INDEX_MODERN_NAV_RECENT : 'Recent',
        'modernNavPublished' => defined('INDEX_MODERN_NAV_PUBLISHED') ? INDEX_MODERN_NAV_PUBLISHED : INDEX_BUTTON_PUBLISH,
        'modernNavFavourites' => defined('INDEX_MODERN_NAV_FAVOURITES') ? INDEX_MODERN_NAV_FAVOURITES : 'Favourites',
        'modernNavTrash' => defined('INDEX_MODERN_NAV_TRASH') ? INDEX_MODERN_NAV_TRASH : 'Trash',
        'modernNavGuides' => defined('INDEX_MODERN_NAV_GUIDES') ? INDEX_MODERN_NAV_GUIDES : INDEX_HELP_TITLE,
        'modernWelcome' => $welcome,
        'modernTagline' => defined('INDEX_MODERN_TAGLINE') ? INDEX_MODERN_TAGLINE : '',
        'modernStartSection' => defined('INDEX_MODERN_START_SECTION') ? INDEX_MODERN_START_SECTION : INDEX_CREATE,
        'modernCardInteractiveTitle' => defined('INDEX_MODERN_CARD_INTERACTIVE_TITLE') ? INDEX_MODERN_CARD_INTERACTIVE_TITLE : 'Interactive learning object',
        'modernCardInteractiveDesc' => defined('INDEX_MODERN_CARD_INTERACTIVE_DESC') ? INDEX_MODERN_CARD_INTERACTIVE_DESC : '',
        'modernCardInteractiveBtn' => defined('INDEX_MODERN_CARD_INTERACTIVE_BTN') ? INDEX_MODERN_CARD_INTERACTIVE_BTN : DISPLAY_CREATE,
        'modernCardSiteTitle' => defined('INDEX_MODERN_CARD_SITE_TITLE') ? INDEX_MODERN_CARD_SITE_TITLE : 'Mini-website learning object',
        'modernCardSiteDesc' => defined('INDEX_MODERN_CARD_SITE_DESC') ? INDEX_MODERN_CARD_SITE_DESC : '',
        'modernCardSiteBtn' => defined('INDEX_MODERN_CARD_SITE_BTN') ? INDEX_MODERN_CARD_SITE_BTN : DISPLAY_CREATE,
        'modernGetStarted' => defined('INDEX_MODERN_GET_STARTED') ? INDEX_MODERN_GET_STARTED : INDEX_HELP_TITLE,
        'modernGuide1Title' => defined('INDEX_MODERN_GUIDE_1_TITLE') ? INDEX_MODERN_GUIDE_1_TITLE : '',
        'modernGuide1Desc' => defined('INDEX_MODERN_GUIDE_1_DESC') ? INDEX_MODERN_GUIDE_1_DESC : '',
        'modernGuide2Title' => defined('INDEX_MODERN_GUIDE_2_TITLE') ? INDEX_MODERN_GUIDE_2_TITLE : '',
        'modernGuide2Desc' => defined('INDEX_MODERN_GUIDE_2_DESC') ? INDEX_MODERN_GUIDE_2_DESC : '',
        'modernGuide3Title' => defined('INDEX_MODERN_GUIDE_3_TITLE') ? INDEX_MODERN_GUIDE_3_TITLE : '',
        'modernGuide3Desc' => defined('INDEX_MODERN_GUIDE_3_DESC') ? INDEX_MODERN_GUIDE_3_DESC : '',
        'modernMoreGuides' => defined('INDEX_MODERN_MORE_GUIDES') ? INDEX_MODERN_MORE_GUIDES : INDEX_HELP_INTRO_LINK_TEXT,
        'modernGuidesSectionManuals' => defined('INDEX_MODERN_GUIDES_SECTION_MANUALS') ? INDEX_MODERN_GUIDES_SECTION_MANUALS : 'Manuals',
        'modernGuidesSectionDemos' => defined('INDEX_MODERN_GUIDES_SECTION_DEMOS') ? INDEX_MODERN_GUIDES_SECTION_DEMOS : 'Demos',
        'modernGuidesSectionFaq' => defined('INDEX_MODERN_GUIDES_SECTION_FAQ') ? INDEX_MODERN_GUIDES_SECTION_FAQ : 'Frequently asked questions',
        'modernDemo1Title' => defined('INDEX_MODERN_DEMO_1_TITLE') ? INDEX_MODERN_DEMO_1_TITLE : '',
        'modernDemo1Desc' => defined('INDEX_MODERN_DEMO_1_DESC') ? INDEX_MODERN_DEMO_1_DESC : '',
        'modernDemo2Title' => defined('INDEX_MODERN_DEMO_2_TITLE') ? INDEX_MODERN_DEMO_2_TITLE : '',
        'modernDemo2Desc' => defined('INDEX_MODERN_DEMO_2_DESC') ? INDEX_MODERN_DEMO_2_DESC : '',
        'modernDemo3Title' => defined('INDEX_MODERN_DEMO_3_TITLE') ? INDEX_MODERN_DEMO_3_TITLE : '',
        'modernDemo3Desc' => defined('INDEX_MODERN_DEMO_3_DESC') ? INDEX_MODERN_DEMO_3_DESC : '',
        'modernFaq1Question' => defined('INDEX_MODERN_FAQ_1_QUESTION') ? INDEX_MODERN_FAQ_1_QUESTION : '',
        'modernFaq1Answer' => defined('INDEX_MODERN_FAQ_1_ANSWER') ? INDEX_MODERN_FAQ_1_ANSWER : '',
        'modernFaq1Link' => defined('INDEX_MODERN_FAQ_1_LINK') ? INDEX_MODERN_FAQ_1_LINK : '',
        'modernFaq2Question' => defined('INDEX_MODERN_FAQ_2_QUESTION') ? INDEX_MODERN_FAQ_2_QUESTION : '',
        'modernFaq2Answer' => defined('INDEX_MODERN_FAQ_2_ANSWER') ? INDEX_MODERN_FAQ_2_ANSWER : '',
        'modernFaq3Question' => defined('INDEX_MODERN_FAQ_3_QUESTION') ? INDEX_MODERN_FAQ_3_QUESTION : '',
        'modernFaq3Answer' => defined('INDEX_MODERN_FAQ_3_ANSWER') ? INDEX_MODERN_FAQ_3_ANSWER : '',
        'modernLoPageTitle' => defined('INDEX_MODERN_LO_PAGE_TITLE') ? INDEX_MODERN_LO_PAGE_TITLE : 'Learning objects',
        'modernLoColPreview' => defined('INDEX_MODERN_LO_COL_PREVIEW') ? INDEX_MODERN_LO_COL_PREVIEW : 'Preview',
        'modernLoColName' => defined('INDEX_MODERN_LO_COL_NAME') ? INDEX_MODERN_LO_COL_NAME : 'Learning object name',
        'modernLoColId' => defined('INDEX_MODERN_LO_COL_ID') ? INDEX_MODERN_LO_COL_ID : 'ID',
        'modernLoColModified' => defined('INDEX_MODERN_LO_COL_MODIFIED') ? INDEX_MODERN_LO_COL_MODIFIED : 'Modified',
        'modernLoColTemplate' => defined('INDEX_MODERN_LO_COL_TEMPLATE') ? INDEX_MODERN_LO_COL_TEMPLATE : 'Template',
        'modernLoColAccess' => defined('INDEX_MODERN_LO_COL_ACCESS') ? INDEX_MODERN_LO_COL_ACCESS : 'Access',
        'modernLoColActions' => defined('INDEX_MODERN_LO_COL_ACTIONS') ? INDEX_MODERN_LO_COL_ACTIONS : 'Actions',
        'modernLoAccessPrivate' => defined('INDEX_MODERN_LO_ACCESS_PRIVATE') ? INDEX_MODERN_LO_ACCESS_PRIVATE : 'Private',
        'modernLoAccessPublic' => defined('INDEX_MODERN_LO_ACCESS_PUBLIC') ? INDEX_MODERN_LO_ACCESS_PUBLIC : 'Public',
        'modernLoAccessPassword' => defined('INDEX_MODERN_LO_ACCESS_PASSWORD') ? INDEX_MODERN_LO_ACCESS_PASSWORD : 'Password',
        'modernLoAccessDemo' => defined('INDEX_MODERN_LO_ACCESS_DEMO') ? INDEX_MODERN_LO_ACCESS_DEMO : 'Demo',
        'modernLoMenuEdit' => defined('INDEX_MODERN_LO_MENU_EDIT') ? INDEX_MODERN_LO_MENU_EDIT : INDEX_BUTTON_EDIT,
        'modernLoMenuCopy' => defined('INDEX_MODERN_LO_MENU_COPY') ? INDEX_MODERN_LO_MENU_COPY : INDEX_BUTTON_DUPLICATE,
        'modernLoMenuPreview' => defined('INDEX_MODERN_LO_MENU_PREVIEW') ? INDEX_MODERN_LO_MENU_PREVIEW : INDEX_BUTTON_PREVIEW,
        'modernLoPreviewClose' => defined('INDEX_MODERN_LO_PREVIEW_CLOSE') ? INDEX_MODERN_LO_PREVIEW_CLOSE : 'Close preview',
        'modernLoMenuShare' => defined('INDEX_MODERN_LO_MENU_SHARE') ? INDEX_MODERN_LO_MENU_SHARE : INDEX_BUTTON_PUBLISH,
        'modernLoMenuMove' => defined('INDEX_MODERN_LO_MENU_MOVE') ? INDEX_MODERN_LO_MENU_MOVE : 'Move',
        'modernLoMenuFavorite' => defined('INDEX_MODERN_LO_MENU_FAVORITE') ? INDEX_MODERN_LO_MENU_FAVORITE : 'Make favourite',
        'modernLoMenuUnfavorite' => defined('INDEX_MODERN_LO_MENU_UNFAVORITE') ? INDEX_MODERN_LO_MENU_UNFAVORITE : 'Remove favourite',
        'modernLoMenuProperties' => defined('INDEX_MODERN_LO_MENU_PROPERTIES') ? INDEX_MODERN_LO_MENU_PROPERTIES : INDEX_BUTTON_PROPERTIES,
        'modernLoMenuDelete' => defined('INDEX_MODERN_LO_MENU_DELETE') ? INDEX_MODERN_LO_MENU_DELETE : INDEX_BUTTON_DELETE,
        'modernLoEditBtn' => defined('INDEX_MODERN_LO_EDIT_BTN') ? INDEX_MODERN_LO_EDIT_BTN : INDEX_BUTTON_EDIT,
        'modernLoMenuBtn' => defined('INDEX_MODERN_LO_MENU_BTN') ? INDEX_MODERN_LO_MENU_BTN : 'More actions',
        'modernFavouritesEmptyTitle' => defined('INDEX_MODERN_FAVOURITES_EMPTY_TITLE') ? INDEX_MODERN_FAVOURITES_EMPTY_TITLE : 'You have no favourite learning objects yet',
        'modernFavouritesEmptyDesc' => defined('INDEX_MODERN_FAVOURITES_EMPTY_DESC') ? INDEX_MODERN_FAVOURITES_EMPTY_DESC : 'Favourite learning objects appear here',
        'modernPublishedEmptyTitle' => defined('INDEX_MODERN_PUBLISHED_EMPTY_TITLE') ? INDEX_MODERN_PUBLISHED_EMPTY_TITLE : 'You have no published learning objects yet',
        'modernPublishedEmptyDesc' => defined('INDEX_MODERN_PUBLISHED_EMPTY_DESC') ? INDEX_MODERN_PUBLISHED_EMPTY_DESC : 'Published learning objects appear here',
        'modernTrashEmptyTitle' => defined('INDEX_MODERN_TRASH_EMPTY_TITLE') ? INDEX_MODERN_TRASH_EMPTY_TITLE : 'Your trash is empty',
        'modernTrashEmptyDesc' => defined('INDEX_MODERN_TRASH_EMPTY_DESC') ? INDEX_MODERN_TRASH_EMPTY_DESC : 'Deleted learning objects appear here',
        'modernFolderCount' => defined('INDEX_MODERN_FOLDER_COUNT') ? INDEX_MODERN_FOLDER_COUNT : '%s learning objects',
        'modernFolderEmptyTitle' => defined('INDEX_MODERN_FOLDER_EMPTY_TITLE') ? INDEX_MODERN_FOLDER_EMPTY_TITLE : 'This folder is empty',
        'modernFolderEmptyDesc' => defined('INDEX_MODERN_FOLDER_EMPTY_DESC') ? INDEX_MODERN_FOLDER_EMPTY_DESC : 'Learning objects and folders appear here',
        'modernFolderMenuOpen' => defined('INDEX_MODERN_FOLDER_MENU_OPEN') ? INDEX_MODERN_FOLDER_MENU_OPEN : 'Open',
        'modernFolderMenuNew' => defined('INDEX_MODERN_FOLDER_MENU_NEW') ? INDEX_MODERN_FOLDER_MENU_NEW : INDEX_BUTTON_NEWFOLDER,
        'modernFolderDetailId' => defined('INDEX_MODERN_FOLDER_DETAIL_ID') ? INDEX_MODERN_FOLDER_DETAIL_ID : 'ID',
        'modernFolderDetailCreated' => defined('INDEX_MODERN_FOLDER_DETAIL_CREATED') ? INDEX_MODERN_FOLDER_DETAIL_CREATED : 'Created',
        'modernFolderDetailModified' => defined('INDEX_MODERN_FOLDER_DETAIL_MODIFIED') ? INDEX_MODERN_FOLDER_DETAIL_MODIFIED : 'Modified',
        'modernFolderDetailRights' => defined('INDEX_MODERN_FOLDER_DETAIL_RIGHTS') ? INDEX_MODERN_FOLDER_DETAIL_RIGHTS : 'Your rights',
        'modernFolderDetailCount' => defined('INDEX_MODERN_FOLDER_DETAIL_COUNT') ? INDEX_MODERN_FOLDER_DETAIL_COUNT : 'Learning objects',
        'modernFolderTypeLabel' => defined('INDEX_MODERN_FOLDER_TYPE_LABEL') ? INDEX_MODERN_FOLDER_TYPE_LABEL : 'Folder',
        'modernFolderOpenBtn' => defined('INDEX_MODERN_FOLDER_OPEN_BTN') ? INDEX_MODERN_FOLDER_OPEN_BTN : 'Open folder',
        'modernFolderPropertiesTitle' => defined('INDEX_MODERN_FOLDER_PROPERTIES_TITLE') ? INDEX_MODERN_FOLDER_PROPERTIES_TITLE : 'Folder properties',
        'modernFolderOrganise' => defined('INDEX_MODERN_FOLDER_ORGANISE') ? INDEX_MODERN_FOLDER_ORGANISE : 'Organise',
        'modernFolderOrganiseTitle' => defined('INDEX_MODERN_FOLDER_ORGANISE_TITLE') ? INDEX_MODERN_FOLDER_ORGANISE_TITLE : 'Organise folder',
        'modernFolderColour' => defined('INDEX_MODERN_FOLDER_COLOUR') ? INDEX_MODERN_FOLDER_COLOUR : 'Folder colour',
        'modernFolderNoColour' => defined('INDEX_MODERN_FOLDER_NO_COLOUR') ? INDEX_MODERN_FOLDER_NO_COLOUR : 'No colour',
        'modernFolderLabels' => defined('INDEX_MODERN_FOLDER_LABELS') ? INDEX_MODERN_FOLDER_LABELS : 'Personal labels',
        'modernFolderNewLabel' => defined('INDEX_MODERN_FOLDER_NEW_LABEL') ? INDEX_MODERN_FOLDER_NEW_LABEL : 'New label',
        'modernFolderRenameLabel' => defined('INDEX_MODERN_FOLDER_RENAME_LABEL') ? INDEX_MODERN_FOLDER_RENAME_LABEL : 'Rename label',
        'modernFolderDeleteLabel' => defined('INDEX_MODERN_FOLDER_DELETE_LABEL') ? INDEX_MODERN_FOLDER_DELETE_LABEL : 'Delete label',
        'modernFolderDeleteLabelConfirm' => defined('INDEX_MODERN_FOLDER_DELETE_LABEL_CONFIRM') ? INDEX_MODERN_FOLDER_DELETE_LABEL_CONFIRM : 'Delete this label from all folders?',
        'modernFolderLabelName' => defined('INDEX_MODERN_FOLDER_LABEL_NAME') ? INDEX_MODERN_FOLDER_LABEL_NAME : 'Label name',
        'modernFolderOrganisationSave' => defined('INDEX_MODERN_FOLDER_ORGANISATION_SAVE') ? INDEX_MODERN_FOLDER_ORGANISATION_SAVE : 'Save',
        'modernFolderOrganisationError' => defined('INDEX_MODERN_FOLDER_ORGANISATION_ERROR') ? INDEX_MODERN_FOLDER_ORGANISATION_ERROR : 'Could not save folder organisation.',
        'modernFolderFilter' => defined('INDEX_MODERN_FOLDER_FILTER') ? INDEX_MODERN_FOLDER_FILTER : 'Filter folders',
        'modernFolderFilterAll' => defined('INDEX_MODERN_FOLDER_FILTER_ALL') ? INDEX_MODERN_FOLDER_FILTER_ALL : 'All folders and learning objects',
        'modernFolderFilterCreated' => defined('INDEX_MODERN_FOLDER_FILTER_CREATED') ? INDEX_MODERN_FOLDER_FILTER_CREATED : 'Created by me',
        'modernFolderFilterShared' => defined('INDEX_MODERN_FOLDER_FILTER_SHARED') ? INDEX_MODERN_FOLDER_FILTER_SHARED : 'Shared with me',
        'modernAccessFilterAll' => defined('INDEX_MODERN_ACCESS_FILTER_ALL') ? INDEX_MODERN_ACCESS_FILTER_ALL : 'All',
        'modernNewFolder' => defined('INDEX_MODERN_NEW_FOLDER') ? INDEX_MODERN_NEW_FOLDER : INDEX_BUTTON_NEWFOLDER,
        'modernImport' => defined('INDEX_MODERN_IMPORT') ? INDEX_MODERN_IMPORT : (defined('WORKSPACE_PROPERTIES_TAB_IMPORT') ? WORKSPACE_PROPERTIES_TAB_IMPORT : 'Import'),
        'modernImportInstructions' => defined('INDEX_MODERN_IMPORT_INSTRUCTIONS') ? INDEX_MODERN_IMPORT_INSTRUCTIONS : 'Import a project that has been exported from another Xerte installation. Enter a name for the imported project, then choose a zip file to upload.',
        'modernImportProjectName' => defined('INDEX_MODERN_IMPORT_PROJECT_NAME') ? INDEX_MODERN_IMPORT_PROJECT_NAME : 'New project name',
        'modernImportFileLabel' => defined('INDEX_MODERN_IMPORT_FILE_LABEL') ? INDEX_MODERN_IMPORT_FILE_LABEL : 'Zip file',
        'modernImportUpload' => defined('INDEX_MODERN_IMPORT_UPLOAD') ? INDEX_MODERN_IMPORT_UPLOAD : 'Upload',
        'modernImportUploading' => defined('INDEX_MODERN_IMPORT_UPLOADING') ? INDEX_MODERN_IMPORT_UPLOADING : 'Uploading...',
        'modernImportNameFail' => defined('INDEX_MODERN_IMPORT_NAME_FAIL') ? INDEX_MODERN_IMPORT_NAME_FAIL : 'Sorry that is not a valid project name. Please use only letters and numbers.',
        'modernLoDetailSize' => defined('INDEX_MODERN_LO_DETAIL_SIZE') ? INDEX_MODERN_LO_DETAIL_SIZE : 'Learning object size',
        'modernLoDetailAccess' => defined('INDEX_MODERN_LO_DETAIL_ACCESS') ? INDEX_MODERN_LO_DETAIL_ACCESS : (defined('INDEX_MODERN_LO_COL_ACCESS') ? INDEX_MODERN_LO_COL_ACCESS : 'Access'),
        'modernLoDetailViews' => defined('INDEX_MODERN_LO_DETAIL_VIEWS') ? INDEX_MODERN_LO_DETAIL_VIEWS : 'Views',
        'modernLoDetailShared' => defined('INDEX_MODERN_LO_DETAIL_SHARED') ? INDEX_MODERN_LO_DETAIL_SHARED : 'Shared',
        'modernLoDetailSharedNone' => defined('INDEX_MODERN_LO_DETAIL_SHARED_NONE') ? INDEX_MODERN_LO_DETAIL_SHARED_NONE : 'Not shared',
        'modernLoDetailPublicLink' => defined('INDEX_MODERN_LO_DETAIL_PUBLIC_LINK') ? INDEX_MODERN_LO_DETAIL_PUBLIC_LINK : 'Public link',
        'modernLoDetailNoLink' => defined('INDEX_MODERN_LO_DETAIL_NO_LINK') ? INDEX_MODERN_LO_DETAIL_NO_LINK : 'No public link (private)',
        'modernLoDetailGraph' => defined('INDEX_MODERN_LO_DETAIL_GRAPH') ? INDEX_MODERN_LO_DETAIL_GRAPH : 'Number of launches',
        'modernLoDetailLoading' => defined('INDEX_MODERN_LO_DETAIL_LOADING') ? INDEX_MODERN_LO_DETAIL_LOADING : 'Loading details...',
        'modernLoDetailError' => defined('INDEX_MODERN_LO_DETAIL_ERROR') ? INDEX_MODERN_LO_DETAIL_ERROR : 'Could not load details.',
        'modernLoDetailExpand' => defined('INDEX_MODERN_LO_DETAIL_EXPAND') ? INDEX_MODERN_LO_DETAIL_EXPAND : 'Show details',
        'modernLoDetailCollapse' => defined('INDEX_MODERN_LO_DETAIL_COLLAPSE') ? INDEX_MODERN_LO_DETAIL_COLLAPSE : 'Hide details',
        'modernTourWelcomeTitle' => defined('INDEX_MODERN_TOUR_WELCOME_TITLE') ? INDEX_MODERN_TOUR_WELCOME_TITLE : 'Welcome to',
        'modernTourWelcomeBody' => defined('INDEX_MODERN_TOUR_WELCOME_BODY') ? INDEX_MODERN_TOUR_WELCOME_BODY : 'Develop interactive learning objects and create mini-websites as teaching materials. We\'d like to show you the most important parts.',
        'modernTourSkip' => defined('INDEX_MODERN_TOUR_SKIP') ? INDEX_MODERN_TOUR_SKIP : 'Skip',
        'modernTourStart' => defined('INDEX_MODERN_TOUR_START') ? INDEX_MODERN_TOUR_START : 'Start tour',
        'modernTourNext' => defined('INDEX_MODERN_TOUR_NEXT') ? INDEX_MODERN_TOUR_NEXT : 'Next step',
        'modernTourClose' => defined('INDEX_MODERN_TOUR_CLOSE') ? INDEX_MODERN_TOUR_CLOSE : 'Close tour',
        'modernTourStepCreateTitle' => defined('INDEX_MODERN_TOUR_STEP_CREATE_TITLE') ? INDEX_MODERN_TOUR_STEP_CREATE_TITLE : 'Create a new learning object',
        'modernTourStepCreateBody' => defined('INDEX_MODERN_TOUR_STEP_CREATE_BODY') ? INDEX_MODERN_TOUR_STEP_CREATE_BODY : 'Click \'+ Create new learning object\' in the menu.<br>Then choose:<ul class="toolkits-modern-tour__tip-list"><li>an <strong>interactive learning object</strong></li><li>or a <strong>mini-website</strong></li></ul>',
        'modernTourStepFilterTitle' => defined('INDEX_MODERN_TOUR_STEP_FILTER_TITLE') ? INDEX_MODERN_TOUR_STEP_FILTER_TITLE : 'Filtering',
        'modernTourStepFilterBody' => defined('INDEX_MODERN_TOUR_STEP_FILTER_BODY') ? INDEX_MODERN_TOUR_STEP_FILTER_BODY : 'Here you can sort and find your learning objects.<br>You can choose from:<ul class="toolkits-modern-tour__tip-list"><li><strong class="toolkits-modern-tour__tip-label">Recent</strong> – the last learning objects you created</li><li><strong class="toolkits-modern-tour__tip-label">Published</strong> – learning objects that are visible to others</li><li><strong class="toolkits-modern-tour__tip-label">Favourites</strong> – learning objects you have saved as favourites</li><li><strong class="toolkits-modern-tour__tip-label">Trash</strong> – deleted learning objects</li></ul>',
        'modernTourStepInteractiveTitle' => defined('INDEX_MODERN_TOUR_STEP_INTERACTIVE_TITLE') ? INDEX_MODERN_TOUR_STEP_INTERACTIVE_TITLE : 'Create an interactive learning object',
        'modernTourStepInteractiveBody' => defined('INDEX_MODERN_TOUR_STEP_INTERACTIVE_BODY') ? INDEX_MODERN_TOUR_STEP_INTERACTIVE_BODY : 'Here you can start an interactive learning object.<br>You have two choices:<ul class="toolkits-modern-tour__tip-list"><li><strong class="toolkits-modern-tour__tip-label">Empty learning object</strong> – you start building entirely yourself</li><li><strong class="toolkits-modern-tour__tip-label">A template</strong> – you use an example that you can customise</li></ul>',
        'modernTourProjectName' => defined('INDEX_MODERN_TOUR_PROJECT_NAME') ? INDEX_MODERN_TOUR_PROJECT_NAME : 'My first learning object',
        'modernTourOpeningEditor' => defined('INDEX_MODERN_TOUR_OPENING_EDITOR') ? INDEX_MODERN_TOUR_OPENING_EDITOR : 'Opening the editor…',
        'modernTourFinish' => defined('INDEX_MODERN_TOUR_FINISH') ? INDEX_MODERN_TOUR_FINISH : 'Finish',
        'modernTourEditorTopbarTitle' => defined('INDEX_MODERN_TOUR_EDITOR_TOPBAR_TITLE') ? INDEX_MODERN_TOUR_EDITOR_TOPBAR_TITLE : 'The editor top bar',
        'modernTourEditorTopbarBody' => defined('INDEX_MODERN_TOUR_EDITOR_TOPBAR_BODY') ? INDEX_MODERN_TOUR_EDITOR_TOPBAR_BODY : 'Use the top bar to preview your learning object, save your work, and open your account menu.',
        'modernTourEditorPagesTitle' => defined('INDEX_MODERN_TOUR_EDITOR_PAGES_TITLE') ? INDEX_MODERN_TOUR_EDITOR_PAGES_TITLE : 'Your pages',
        'modernTourEditorPagesBody' => defined('INDEX_MODERN_TOUR_EDITOR_PAGES_BODY') ? INDEX_MODERN_TOUR_EDITOR_PAGES_BODY : 'This list shows the pages in your learning object. Select a page to edit it, or add a new page.',
        'modernTourEditorContentTitle' => defined('INDEX_MODERN_TOUR_EDITOR_CONTENT_TITLE') ? INDEX_MODERN_TOUR_EDITOR_CONTENT_TITLE : 'Edit your content',
        'modernTourEditorContentBody' => defined('INDEX_MODERN_TOUR_EDITOR_CONTENT_BODY') ? INDEX_MODERN_TOUR_EDITOR_CONTENT_BODY : 'The centre panel is where you build each page. Change titles, text and settings, then save from the top bar.',
    );

    return array(
        'theme' => get_toolkits_ui_theme(),
        'strings' => $strings,
        'user' => array(
            'displayName' => $displayName,
            'firstName' => $firstName,
            'surname' => $surname,
            'canManageUser' => $canManageUser,
            'hasManagementRole' => (bool) getRolesFromUser($_SESSION['toolkits_logon_id']),
            'isGuest' => $xerte_toolkits_site->authentication_method === 'Guest',
            'samlLogout' => $xerte_toolkits_site->authentication_method === 'Saml2',
        ),
        'logos' => array(
            'left' => $logoLeft,
            'right' => $logoRight,
        ),
        'languageFormHtml' => $languageFormHtml,
        'blankTemplatesHtml' => $blankTemplatesHtml,
        'footer' => array(
            'copyright' => $xerte_toolkits_site->copyright,
            'versionInfo' => $versionInfo,
            'newsHtml' => $xerte_toolkits_site->news_text,
            'podOneHtml' => $podOne,
            'podTwoHtml' => $podTwo,
        ),
    );
}

function _include_javascript_file($file_path) {

    global $xerte_toolkits_site;
    global $development;
    $languages = 'languages/';

    // Remove URI parameters
    $url_param = '';
    $parpos = strpos($file_path, "?");
    if ($parpos !== false)
    {
        $url_param=substr($file_path, $parpos);
        $file_path = substr($file_path, 0, $parpos);
    }
    if (isset($_GET['language']) && is_dir($languages . x_clean_input($_GET['language']))) {
        $_SESSION['toolkits_language'] = x_clean_input($_GET['language']);
    }

    if (isset($_SESSION['toolkits_language'])) {
        $language = x_clean_input($_SESSION['toolkits_language']);
    } else {
        // this does some magic interrogation of $_SERVER['HTTP_ACCEPT_LANGUAGE'];
        $language = new Zend_Locale();
        // xerte seems to use en-GB instead of the more standard en_GB. Assume this convention will persist....
        $language_name = str_replace('_', '-', $language);
        // Check that Xerte supports the required language.
        if (!is_dir($languages . $language_name)) {

            // try and catch e.g. getting back 'en' as our locale - so choose any english language pack
            foreach (glob($languages . $language->getLanguage() . '*') as $dir) {
                $language = basename($dir);
                break;
            }
            $language_name = "en-GB";
        }
        $language = $language_name;
        $_SESSION['toolkits_language'] = $language;
    }


    $real_file_path = $languages . $language . '/' . $file_path;
    $en_gb_file_path = $languages . "en-GB/" . $file_path;

    _debug($language);
    _debug($real_file_path);
    _debug($en_gb_file_path);
    if (file_exists(dirname(__FILE__) . "/" . $en_gb_file_path)) {
        echo "<script type=\"text/javascript\" language=\"javascript\" src=\"" . $xerte_toolkits_site->site_url . $en_gb_file_path . $url_param . "\"></script>";
    } else {
        // stuff will break at this point.
        //die("Where was $real_file_path?");
        error_log("Failed to load language file for Xerte - en-GB/$file_path");
        return false;
    }

    if ($language != "en-GB") {
        if (file_exists(dirname(__FILE__) . "/" . $real_file_path)) {
            echo "<script type=\"text/javascript\" language=\"javascript\" src=\"" . $xerte_toolkits_site->site_url . $real_file_path . $url_param . "\"></script>";
        } else {
            // stuff will break at this point.
            //die("Where was $real_file_path?");
            if ($development) {
                error_log("Failed to load language file for Xerte - $language/$file_path");
            }
        }
    }
    $resolved = resolve_toolkits_script_path($file_path . $url_param);
    echo "<script type=\"text/javascript\" language=\"javascript\" src=\"" . $xerte_toolkits_site->site_url . $resolved['path'] . $resolved['url_param'] . "\"></script>";
    return true;
}

function get_email_headers() {
    global $xerte_toolkits_site;

    $from = $xerte_toolkits_site->site_email_account;
    $extraheaders = str_replace("*", "\n", $xerte_toolkits_site->headers);
    $headers = "";
    if (strpos($extraheaders, "From:") === false) {
        $headers .= "From: " . $from . "\n";
    }
    if (strpos($extraheaders, "Content-Type:") === false) {
        $headers .= "Content-Type: text/html; charset=\"UTF-8\"\n";
    }
    $headers .= $extraheaders;
    return $headers;
}

// Replacement function for the standard php is_writable because of bugs in Windows
//
// From comments on the manual page of is_writable
//
// Since looks like the Windows ACLs bug "wont fix" (see http://bugs.php.net/bug.php?id=27609) I propose this alternative function:
//
function _is_writable($path) {

    if (is_dir($path) || $path[strlen($path) - 1] == '/')
        return _is_writable($path . ($path[strlen($path) - 1] == '/' ? "" : "/") . uniqid(mt_rand()) . '.tmp');

    if (file_exists($path)) {
        if (!($f = @fopen($path, 'r+')))
            return false;
        fclose($f);
        return true;
    }

    if (!($f = @fopen($path, 'w')))
        return false;
    fclose($f);
    unlink($path);
    return true;
}

// To prevent mistakes, also supply the alias
function __is_writable($path) {
    _is_writable($path);
}

function uid()
{
    mt_srand(crc32(microtime()));
    $prefix = sprintf("%05d", mt_rand(5,99999));

    return uniqid($prefix);
}

function getVersion()
{
    $version = file(dirname(__FILE__) . "/version.txt", FILE_IGNORE_NEW_LINES);
    return str_replace(' ', '_', $version[0]);
}

function true_or_false($var)
{
    // Return logical true for various values of a variable, anything else is false.

    $var = trim($var);

    if ($var === true || $var === 1 || strcasecmp($var, 'true') === 0 || strcasecmp($var, 'yes') === 0 || strcasecmp($var, '1') === 0) {
        return true;
    }

    return false;
}

// Function to prevent XSS vulnarabilities in arrays
// Do NOT use x_clean_input in the implementation, as Snyk does not understand that
function x_clean_input_array($input, $expected_type = null, $specialcharsflags = ENT_QUOTES|ENT_SUBSTITUTE)
{
    $array_type = null;
    if ($expected_type == 'array_numeric') {
        $array_type = 'numeric';
    } else if ($expected_type == 'array_string') {
        $array_type = 'string';
    }
    $sanitized = array();
    foreach ($input as $key => $value) {
        $sanitized[$key] = trim($input[$key]);
        $sanitized[$key] = stripslashes($sanitized[$key]);
        $sanitized[$key] = htmlentities($sanitized[$key], $specialcharsflags);
        if ($array_type != null) {
            if ($array_type == 'string') {
                if (!is_string($sanitized[$key])) {
                    die("Expected string, got " . htmlentities($sanitized[$key], $specialcharsflags));
                }
            } else if ($array_type == 'numeric') {
                if (!is_numeric($sanitized[$key])) {
                    die("Expected numeric value, got ". htmlentities($sanitized[$key],$specialcharsflags));
                }
            }
        }
    }
    if ($expected_type != null) {
        if ($expected_type == 'array_numeric') {
            if (!is_array($sanitized)) {
                die("Expected numeric array, got " . htmlentities($sanitized,$specialcharsflags));
            }
        } else if ($expected_type == 'array_string') {
            if (!is_array($sanitized)) {
                die("Expected string array, got " . htmlentities($sanitized,$specialcharsflags));
            }
        }
    }
    return $sanitized;
}


// Function to prevent XSS vulnarabilities
function x_clean_input($input, $expected_type = null, $specialcharsflags = ENT_QUOTES|ENT_SUBSTITUTE)
{
    if (is_array($input)) {
        $sanitized =  x_clean_input_array($input, $expected_type, $specialcharsflags);
        return $sanitized;
    }
    $sanitized = trim($input);
    $sanitized = stripslashes($sanitized);
    $sanitized = htmlentities($sanitized, $specialcharsflags);
    if ($expected_type != null) {
        if ($expected_type == 'string') {
            if (!is_string($sanitized)) {
                die("Expected string, got " . htmlentities($sanitized, $specialcharsflags));
            }
        }
        else if ($expected_type == 'numeric') {
            if (!is_numeric($sanitized)) {
                die("Expected numeric value, got " . htmlentities($sanitized, $specialcharsflags));
            }
        }
    }
    return $sanitized;
}

function x_clean_input_json($input)
{
    $sanitized = trim($input);
    $sanitized = stripslashes($sanitized);
    $sanitized = htmlentities($sanitized,  ENT_NOQUOTES);
    if (!is_string($sanitized)) {
        die("Expected string, got " . htmlentities($sanitized,  ENT_NOQUOTES));
    }
    return $sanitized;
}

function x_check_blacklisted_extensions($filename)
{
    global $xerte_toolkits_site;
    $ext = pathinfo($filename, PATHINFO_EXTENSION);
    // Do not allow .php,.php[0-9],.phar,.inc and all other blacklisted extensions
    if (in_array(strtolower($ext), array('php', 'php1', 'php2', 'php3', 'php4', 'php5', 'php6', 'php7', 'php8', 'phar', 'inc'))) {
        die("File has invalid file extension: " . x_clean_input($filename));
    }
    if (in_array(strtolower($ext), $xerte_toolkits_site->file_extensions))
    {
        die("File has invalid file extension specified on management page: " . x_clean_input($filename));
    }
    // Take special care with .htaccess
    if (strtolower($ext) == 'htaccess') {
        die("File is .htaccess, which is not allowed: " . x_clean_input($filename));
    }
}

function x_check_zip($zip, $type="")
{
    // Iterate over files in ZipArchive object to check for any files that are not allowed
    for ($i = 0; $i < $zip->numFiles; $i++) {
        $filename = $zip->getNameIndex($i);
        if (strpos($filename, '..') !== false) {
            die("Zip archive contains path names with path traversal: " .  x_clean_input($filename));
        }
        if (strpos($filename, '/') === 0) {
            die("Zip archive contains files with absolute paths: " . x_clean_input($filename));
        }
        if ($type == "language_pack")
        {
            // Check whether the file is a valid language pack file
            if (strpos($filename, 'languages/') !== 0
                && strpos($filename, 'Nottingham/') !== 0
                && strpos($filename, 'site/') !== 0
                && strpos($filename, 'wizards/') !== 0)
            {
                die("Zip archive contains files that are not in one of the expected language pack folders or an invalid folder is encountered: " . x_clean_input($filename));
            }
            // If it is one of those folders, continue
            if ($filename === 'languages/' || $filename === 'Nottingham/' || $filename === 'site/' || $filename === 'wizards/') {
                continue;
            }
            // Only allow .js or .inc files
            $ext = pathinfo($filename, PATHINFO_EXTENSION);
            if ($ext != 'js' && $ext != 'inc' && $ext != 'xwd' && $ext != 'xml') {
                die("Zip archive contains files with invalid file extension: " . x_clean_input($filename));
            }
        }
        else if ($type == "template" || $type == "theme_package")
        {
            global $xerte_toolkits_site;
            // Check whether the file is a valid template file
            //Do not allow .php,.php[0-9],.phar,.inc and all other blacklisted extensions
            $ext = pathinfo($filename, PATHINFO_EXTENSION);
            if (in_array(strtolower($ext), array('php', 'php1', 'php2', 'php3', 'php4', 'php5', 'php6', 'php7', 'php8', 'phar', 'inc'))) {
                die("Zip archive contains files with invalid file extension: " . x_clean_input($filename));
            }
            if (in_array(strtolower($ext), $xerte_toolkits_site->file_extensions))
            {
                die("Zip archive contains files with invalid file extension specified on management page: " . x_clean_input($filename));
            }
            // Take special care with .htaccess
            if (strtolower($ext) == 'htaccess') {
                die("Zip archive contains .htaccess file, which is not allowed: " . x_clean_input($filename));
            }
        }
        else
        {
            global $xerte_toolkits_site;
            // Check whether the file is a valid theme file
            //Do not allow .php,.php[0-9],.phar,.inc and all other blacklisted extensions
            $ext = pathinfo($filename, PATHINFO_EXTENSION);
            if (in_array(strtolower($ext), array('php', 'php1', 'php2', 'php3', 'php4', 'php5', 'php6', 'php7', 'php8', 'phar', 'inc'))) {
                die("Zip archive contains files with invalid file extension: " . x_clean_input($filename));
            }
            if (in_array(strtolower($ext), $xerte_toolkits_site->file_extensions))
            {
                die("Zip archive contains files with invalid file extension specified on management page: " . x_clean_input($filename));
            }
            // Take special care with .htaccess
            if (strtolower($ext) == 'htaccess') {
                die("Zip archive contains .htaccess file, which is not allowed: " . x_clean_input($filename));
            }
        }
    }
}

function x_check_zip_file($file){
    $zip = new ZipArchive();
    $x = $zip->open($file);

    x_check_zip($zip);
}

function x_check_path_traversal($path, $expected_path=null, $message=null, $soft_fail=false)
{
    global $xerte_toolkits_site;
    $mesg = ($message != null ? $message : "Path traversal detected!");
    // Account for Windows, because realpath changes / to \
    if(DIRECTORY_SEPARATOR !== '/') {
        $rpath = str_replace('/', DIRECTORY_SEPARATOR, $path);
        if ($expected_path != null) {
            $rexpected_path = str_replace('/', DIRECTORY_SEPARATOR, $expected_path);
        }
    }
    else
    {
        $rpath = $path;
        $rexpected_path = $expected_path;
    }
    // Trim dangling DIRECTORY_SEPARATOR
    $rpath = rtrim($rpath, '/\\');
    // Check path and check for path traversal
    $realpath = realpath($rpath);
    if ($realpath === false || $realpath !== $rpath)
    {
        _debug($mesg);
        if ($soft_fail) {
            return false;
        }
        die($mesg);
    }
    if ($expected_path != null) {
        // Check whether path is as expected
        if (strpos($rpath, $rexpected_path) !== 0) {
            _debug($mesg);
            if ($soft_fail) {
                return false;
            }
            die($mesg);
        }
        if ($expected_path == $xerte_toolkits_site->users_file_area_full) {
            // Check whether the path is inside a folder of the users_file_area_full
            // First determine whether rpath is a folder
            if (is_dir($rpath))
            {
                // It must be different from the users_file_area_full
                if ($rpath === $xerte_toolkits_site->users_file_area_full) {
                    _debug($mesg);
                    if ($soft_fail) {
                        return false;
                    }
                    die($mesg);
                }
            }
            else
            {
                // Remove the users_file_area_full from the path
                $rpath = substr($rpath, strlen($rexpected_path));
                if (strpos($rpath, DIRECTORY_SEPARATOR) === false) {
                    _debug($mesg);
                    if ($soft_fail) {
                        return false;
                    }
                    die($mesg);
                }
            }
        }
    }
    if ($soft_fail) {
        return true;
    }
}

function x_check_path_traversal_newpath($path, $expected_path=null, $message=null)
{
    $mesg = ($message != null ? $message : "Path traversal detected!");
    // Account for Windows, because realpath changes / to \
    if(DIRECTORY_SEPARATOR !== '/') {
        $rpath = str_replace('/', DIRECTORY_SEPARATOR, $path);
        if ($expected_path != null) {
            $expected_path = str_replace('/', DIRECTORY_SEPARATOR, $expected_path);
        }
    }
    else
    {
        $rpath = $path;
    }
    // Trim dangling DIRECTORY_SEPARATOR
    $rpath = rtrim($rpath, '/\\');
    // path is new, so realpath does not work, check for ../ and encoded variations
    if (strpos($rpath, '..') !== false || stripos($rpath, '%2e%2e') !== false)
    {
        _debug($mesg);
        die($mesg);
    }
    if ($expected_path != null) {
        // Check whether path is as expected
        if (strpos($rpath, $expected_path) !== 0) {
            _debug($mesg);
            die($mesg);
        }
    }
}


function x_convert_user_area_url_to_path($url)
{
    global $xerte_toolkits_site;
    $path = $url;
    // Check whether this is an absolute path, strip the root path and convert to a relative path
    if (stripos($path, 'http') === 0)
    {
        // Check whether the path is actually an url starting with site_url
        if (stripos($path, $xerte_toolkits_site->site_url) === 0)
        {
            $path = substr($path, strlen($xerte_toolkits_site->site_url));
        }
        else
        {
            _debug("URL to user area to convert to path is not a valid url: " . x_clean_input($url));
            die("URL to user area to convert to path is not a valid url: " . x_clean_input($url));
        }
    }
    // Check whether the path is a relative path that starts with users_file_area_short, if so strip the users_file_area_short
    if (stripos($path, $xerte_toolkits_site->users_file_area_short) === 0)
    {
        $path = substr($path, strlen($xerte_toolkits_site->users_file_area_short));
    }
    else
    {
        _debug("URL to user area to convert to path is not a valid url: " . x_clean_input($url));
        die("URL to user area to convert to path is not a valid url: " . x_clean_input($url));
    }
    // Prepend with users_file_area_full
    $path = $xerte_toolkits_site->users_file_area_full . $path;

    return $path;
}

function set_token()
{
    if (!isset($_SESSION['token'])) {
        $_SESSION['token'] = uid();
    }
}

function x_set_session_name()
{
    global $xerte_toolkits_site;
    $hash = hash('sha256', $xerte_toolkits_site->site_url);
    $hash = substr($hash, -6);
    $hash = str_replace('=', '', $hash);
    $current_session_name = session_name();
    session_name($current_session_name . "_" . $hash);
}

//
//Function that ensures a folder exists in the learning object
function verify_LO_folder($LO, $folder): void
{
    global $xerte_toolkits_site;

    $user_files_dir = $xerte_toolkits_site->users_file_area_full . $LO . $folder;

    if (!is_dir($user_files_dir)) {
        mkdir($user_files_dir, 0777, true);
    }
}
