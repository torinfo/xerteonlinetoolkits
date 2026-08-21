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

// Load the plugin files and fire a startup action
require_once(dirname(__FILE__) . "/plugins.php");

startup();

require_once(dirname(__FILE__) . "/config.php");
// Switch off elevated permissions
unset($_SESSION['elevated']);
unset($xerte_toolkits_site->rights);

_load_language_file("/index.inc");

/**
 *
 * Login page, self posts to become management page
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */
include $xerte_toolkits_site->php_library_path . "display_library.php";


require_once(dirname(__FILE__) . "/website_code/php/login_library.php");

if ($xerte_toolkits_site->altauthentication != "" && (isset($_GET['altauth']) || $xerte_toolkits_site->altauthentication == $_SESSION['altauth']))
{
    $xerte_toolkits_site->authentication_method = $xerte_toolkits_site->altauthentication;
    $authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);
    $_SESSION['altauth'] = $xerte_toolkits_site->altauthentication;
}
$adminlogin = false;
if (isset($_GET['login']))
{
    if (x_clean_input($_GET['login']) == "admin")
    {
        if ($_SESSION['toolkits_logon_id'] !== 'site_administrator')
        {
            $adminlogin = true;
            $xerte_toolkits_site->authentication_method = "Db";
            $authmech = Xerte_Authentication_Factory::create('Db');
            unset($_SESSION['toolkits_logon_id']);
            unset($_SESSION['toolkits_logon_username']);
        }
    }
}
login_processing();
login_processing2();

if(isset($_SESSION["toManagement"]) || $_SESSION['toolkits_logon_id'] === 'site_administrator' || $adminlogin){
    unset($_SESSION["toManagement"]);
    header("location: management.php");
    exit();
}
if(isset($_SESSION["adminTo"]) || $_SESSION['toolkits_logon_id'] === 'site_administrator' || $adminlogin){
    $url = $_SESSION["adminTo"];
    unset($_SESSION["adminTo"]);
    header("location: {$url}");
    exit();
}

// Check if any redirection needs to take place for Password protected files...
if (isset($_SESSION['pwprotected_url']))
{
    _debug(" Redirection found: " . $_SESSION['pwprotected_url']);
    $redirect=$_SESSION['pwprotected_url'];
    unset($_SESSION['pwprotected_url']);
    header("Location: " . $redirect);
}


/*If the authentication method isn't set to Moodle
* the code in the required file below is simply skipped
*/
require_once(dirname(__FILE__) . "/moodle_restrictions.php");

recycle_bin();

$version = getVersion();

/*
 * Output the main page, including the user's and blank templates
 */
?><!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />

    <?php head_start(); ?>
    <!--

    HTML to use to set up the template management page

    Version 1.0

    -->
    <title><?PHP echo apply_filters("head_title", $xerte_toolkits_site->site_title); ?></title>
    <link rel="stylesheet" href="editor/css/jquery-ui.css">
    <link rel="stylesheet" href="editor/js/vendor/themes/default/style.css?version=<?php echo $version;?>" />
    <!-- <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script> -->
    <!-- <script>window.jQuery || document.write('<script src="editor/js/vendor/jquery-1.9.1.min.js"><\/script>')</script> -->
    <script src="editor/js/vendor/jquery-1.9.1.min.js"></script>
    <script type="text/javascript" src="editor/js/vendor/jquery.ui-1.10.4.js"></script>
    <script type="text/javascript" src="editor/js/vendor/jquery.layout-1.3.0-rc30.79.min.js"></script>
    <script type="text/javascript" src="editor/js/vendor/jquery.ui.touch-punch.min.js"></script>
    <script type="text/javascript" src="editor/js/vendor/modernizr-latest.js"></script>
    <script type="text/javascript" src="editor/js/vendor/jstree.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="website_code/scripts/plotly-latest.min.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="modules/common/js/featherlight/featherlight.min.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="modules/common/js/featherlight/featherlight.gallery.min.js?version=<?php echo $version;?>"></script>
    <link rel="icon" href="favicon.ico" type="image/x-icon"/>
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon"/>
    <!-- link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common/font-awesome/css/font-awesome.min.css?version=<?php echo $version;?>" -->
    <link rel="stylesheet" type="text/css" href="modules/common/fontawesome-6.6.0/css/all.min.css">
    <link rel="stylesheet" type="text/css" href="modules/common/fontawesome-6.6.0/css/v4-shims.min.css">
    <link rel="stylesheet" type="text/css" href="modules/common/fontawesome-6.6.0/css/v5-font-face.min.css">

    <link href="website_code/styles/bootstrap.css?version=<?php echo $version;?>" media="all" type="text/css" rel="stylesheet"/>
    <link href="website_code/styles/nv.d3.css?version=<?php echo $version;?>" media="all" type="text/css" rel="stylesheet"/>
    <link href="website_code/styles/xapi_dashboard.css?version=<?php echo $version;?>" media="all" type="text/css" rel="stylesheet"/>
    <link href="website_code/styles/folder_popup.css?version=<?php echo $version;?>" media="screen" type="text/css" rel="stylesheet"/>
    <link href="website_code/styles/jquery-ui-layout.css?version=<?php echo $version;?>" media="all" type="text/css" rel="stylesheet"/>
    <link href="website_code/styles/xerte_buttons.css?version=<?php echo $version;?>" media="screen" type="text/css" rel="stylesheet"/>
    <link href="website_code/styles/frontpage.css?version=<?php echo $version;?>" media="all" type="text/css" rel="stylesheet"/>
    <?php
    if (function_exists('echo_toolkits_theme_stylesheet_link')) {
        echo_toolkits_theme_stylesheet_link($version);
    }
    ?>
    <link rel="stylesheet" href="modules/common/js/featherlight/featherlight.min.css?version=<?php echo $version;?>" />
    <link rel="stylesheet" href="modules/common/js/featherlight/featherlight.gallery.min.css?version=<?php echo $version;?>" />

    <?php
    if (file_exists($xerte_toolkits_site->root_file_path . "branding/branding.css"))
    {
        ?>
        <link href='branding/branding.css' rel='stylesheet' type='text/css'>
        <?php
    }
    if (isset($_SESSION['toolkits_language']))
    {
        $languagecodevar = "var language_code = \"" . $_SESSION['toolkits_language'] . "\"";
    }
    else
    {
        $languagecodevar = "var language_code = \"en-GB\"";
    }
    // Check if authmech exists, if not create it
    if (!isset($authmech)) {
        $authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);
    }

    // Prepare user preferences for JavaScript
    $user_preferences_json = "{}";
    $user_has_preferences = "false";

    if (function_exists('refresh_toolkits_user_preferences_session')) {
        refresh_toolkits_user_preferences_session();
    }
    if (function_exists('ensure_toolkits_ui_theme_preference')) {
        ensure_toolkits_ui_theme_preference(true);
    }

    if (isset($_SESSION['toolkits_preferences']) && is_array($_SESSION['toolkits_preferences'])) {
        $user_preferences_json = json_encode($_SESSION['toolkits_preferences']);
        if ($authmech->hasUserPrefrences()) {
            $user_has_preferences = "true";
        }
    } else {
        if (isset($authmech) && $authmech->hasUserPrefrences()) {
            $user_has_preferences = "true";
        }
    }

    echo "
        <script type=\"text/javascript\"> // JAVASCRIPT library for fixed variables\n // management of javascript is set up here\n // SITE SETTINGS
            var site_url = \"{$xerte_toolkits_site->site_url}\";
            var rest_api_url = \"{$xerte_toolkits_site->site_url}website_code/api/v1/index.php\";
            var site_apache = \"{$xerte_toolkits_site->apache}\";
            var properties_ajax_php_path = \"website_code/php/properties/\";
            var management_ajax_php_path = \"website_code/php/management/\";
            var ajax_php_path = \"website_code/php/\";
            {$languagecodevar};
            var user_preferences = {$user_preferences_json};
            var user_has_preferences = {$user_has_preferences};
        </script>";
    ?>
    <script type="text/javascript" language="javascript" src="website_code/scripts/validation.js?version=<?php echo $version;?>"></script>
    <?php
    _include_javascript_file("website_code/scripts/file_system.js?version=" . $version);
    _include_javascript_file("website_code/scripts/screen_display.js?version=" . $version);
    _include_javascript_file("website_code/scripts/ajax_management.js?version=" . $version);
    _include_javascript_file("website_code/scripts/folders.js?version=" . $version);
    _include_javascript_file("website_code/scripts/template_management.js?version=" . $version);
    _include_javascript_file("website_code/scripts/logout.js?version=" . $version);
    _include_javascript_file("website_code/scripts/import.js?version=" . $version);
    _include_javascript_file("website_code/scripts/functions.js?version=" . $version);
    ?>
    <script type="text/javascript" src="website_code/scripts/tooltip.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="website_code/scripts/popper.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="website_code/scripts/bootstrap.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="modules/xerte/xAPI/xapicollection.min.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="modules/xerte/xAPI/xapidashboard.min.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="modules/xerte/xAPI/xapiwrapper.min.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="website_code/scripts/moment.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="website_code/scripts/jquery-ui-i18n.min.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="website_code/scripts/result.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="website_code/scripts/user_settings.js?version=<?php echo $version;?>"></script>

    <?php
    _include_javascript_file("website_code/scripts/xapi_dashboard_data.js?version=" . $version);
    _include_javascript_file("website_code/scripts/xapi_dashboard.js?version=" . $version);

    if (function_exists('echo_toolkits_theme_shell_script')) {
        echo_toolkits_theme_shell_script($version);
    }
    ?>
    <?php head_end(); ?></head>

<!--

code to sort out the javascript which prevents the text selection of the templates (allowing drag and drop to look nicer

body_scroll handles the calculation of the documents actual height in IE.

-->

<body class="<?php echo htmlspecialchars(toolkits_ui_theme_body_class(), ENT_QUOTES, 'UTF-8'); ?>">
<?php body_start(); ?>

<div id="toolkits-index-mount"></div>

<script type="text/javascript">
    var toolkits_index_config = <?php
            echo json_encode(
                    build_toolkits_index_page_config($authmech),
                    JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT
            );
            ?>;
</script>

<script>
    $(document).ready(function () {
        if (typeof renderToolkitsIndexShell === 'function') {
            renderToolkitsIndexShell();
        }
        if (typeof toolkitsIndexAfterShell === 'function') {
            toolkitsIndexAfterShell();
        } else {
            if (typeof setupMainLayout === 'function') {
                setupMainLayout();
            }
            if (typeof load_user_preferences === 'function') {
                load_user_preferences();
            }
            if (typeof refresh_workspace === 'function') {
                refresh_workspace();
            }
        }
    });
</script>
<?php body_end(); ?></body>
</html>
<?php shutdown(); ?>
