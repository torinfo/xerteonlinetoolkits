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
/*require_once(dirname(__FILE__) . "/plugins.php");*/

startup();

/*require_once(dirname(__FILE__) . "/config.php");*/

_load_language_file("/index.inc");

/**
 *
 * Login page, self posts to become management page
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */
/*include $xerte_toolkits_site->php_library_path . "display_library.php";*/


/*require_once(dirname(__FILE__) . "/website_code/php/login_library.php");*/

if ($xerte_toolkits_site->altauthentication != "" && isset($_GET['altauth']))
{
    $xerte_toolkits_site->authentication_method = $xerte_toolkits_site->altauthentication;
    $authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);
    $_SESSION['altauth'] = $xerte_toolkits_site->altauthentication;
}

login_processing();
login_processing2();

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
/*require_once(dirname(__FILE__) . "/moodle_restrictions.php");*/

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
    <link rel="stylesheet" href="workbench_themes/dlearning/theme.css" type="text/css"/>
    <link rel="stylesheet" href="editor/js/vendor/themes/default/style.css?version=<?php echo $version;?>" />
    <link rel="stylesheet" href="editor/js/vendor/themes/default-dark/style.css?version=<?php echo $version;?>" />

    <!-- <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script> -->
    <!-- <script>window.jQuery || document.write('<script src="editor/js/vendor/jquery-1.9.1.min.js"><\/script>')</script> -->
    <script src="editor/js/vendor/jquery-1.9.1.min.js"></script>
    <script type="text/javascript" src="editor/js/vendor/jquery.ui-1.10.4.js"></script>
    <script type="text/javascript" src="editor/js/vendor/jquery.layout-1.3.0-rc30.79.min.js"></script>
    <script type="text/javascript" src="editor/js/vendor/jquery.ui.touch-punch.min.js"></script>
    <script type="text/javascript" src="editor/js/vendor/modernizr-latest.js"></script>
    <script type="text/javascript" src="editor/js/vendor/jstree.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="website_code/scripts/plotly-latest.min.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="modules/xerte/parent_templates/Nottingham/common_html5/js/featherlight/featherlight.min.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="modules/xerte/parent_templates/Nottingham/common_html5/js/featherlight/featherlight.gallery.min.js?version=<?php echo $version;?>"></script>
    <link rel="icon" href="favicon.ico" type="image/x-icon"/>
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon"/>
    <link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/font-awesome/css/font-awesome.min.css?version=<?php echo $version;?>">
    <link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/font-awesome-4.3.0/css/font-awesome.min.css">
    <link href="website_code/styles/bootstrap.css?version=<?php echo $version;?>" media="all" type="text/css" rel="stylesheet"/>
    <link href="website_code/styles/nv.d3.css?version=<?php echo $version;?>" media="all" type="text/css" rel="stylesheet"/>
    <link href="website_code/styles/xapi_dashboard.css?version=<?php echo $version;?>" media="all" type="text/css" rel="stylesheet"/>
    <link href="website_code/styles/folder_popup.css?version=<?php echo $version;?>" media="screen" type="text/css" rel="stylesheet"/>
    <link href="website_code/styles/jquery-ui-layout.css?version=<?php echo $version;?>" media="all" type="text/css" rel="stylesheet"/>
    <link href="website_code/styles/xerte_buttons.css?version=<?php echo $version;?>" media="screen" type="text/css" rel="stylesheet"/>
    <!--<link href="website_code/styles/frontpage.css?version=<?php /*echo $version;*/?>" media="all" type="text/css" rel="stylesheet"/>-->
    <link rel="stylesheet" href="modules/xerte/parent_templates/Nottingham/common_html5/js/featherlight/featherlight.min.css?version=<?php echo $version;?>" />
    <link rel="stylesheet" href="modules/xerte/parent_templates/Nottingham/common_html5/js/featherlight/featherlight.gallery.min.css?version=<?php echo $version;?>" />


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
    echo "
        <script type=\"text/javascript\"> // JAVASCRIPT library for fixed variables\n // management of javascript is set up here\n // SITE SETTINGS
            var site_url = \"{$xerte_toolkits_site->site_url}\";
            var site_apache = \"{$xerte_toolkits_site->apache}\";
            var properties_ajax_php_path = \"website_code/php/properties/\";
            var management_ajax_php_path = \"website_code/php/management/\";
            var ajax_php_path = \"website_code/php/\";
            {$languagecodevar};
        </script>";
    ?>
    <script type="text/javascript" language="javascript" src="website_code/scripts/validation.js?version=<?php echo $version;?>"></script>
    <?php
    _include_javascript_file("website_code/scripts/file_system.js?version=" . $version);
    _include_javascript_file("website_code/scripts/screen_display.js?version=" . $version);
    _include_javascript_file("website_code/scripts/ajax_management.js?version=" . $version);
    _include_javascript_file("website_code/scripts/folders.js?version=" . $version);
    _include_javascript_file("website_code/scripts/template_management.js?version" . $version);
    _include_javascript_file("website_code/scripts/logout.js?version=" . $version);
    _include_javascript_file("website_code/scripts/import.js?version=" . $version);
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

    ?>
    <?php head_end(); ?></head>

<!--

code to sort out the javascript which prevents the text selection of the templates (allowing drag and drop to look nicer

body_scroll handles the calculation of the documents actual height in IE.

-->

<body >
<?php body_start(); ?>
<!--

Folder popup is the div that appears when creating a new folder

-->



<div class="ui-container">
    <nav class="navbar navbar-light bg-light dlearning-navbar">
        <a class="navbar-brand dlearning-brand" href="#">
            <img src="http://localhost/xot/website_code/images/logo.png" id="xerte-logo" alt="">
        </a>
        <div class="workspace_search_outer">
            <div class="workspace_search">
                <i class="fa  fa-search"></i>&nbsp;<label for="workspace_search"><?PHP echo INDEX_SEARCH; ?></label>
                <input type="text" id="workspace_search" placeholder="<?php echo INDEX_SEARCH_PLACEHOLDER?>">
            </div>
        </div>
        <div class="userbar">
            <?PHP //echo "&nbsp;&nbsp;&nbsp;" . INDEX_LOGGED_IN_AS . " " .;
            echo $_SESSION['toolkits_firstname'] . " " . $_SESSION['toolkits_surname'] ?>
            <?PHP
            // only on Db:
            if ($authmech->canManageUser($jsscript)){
                echo '
                    <div class="settingsDropdown">
                        <button onclick="changepasswordPopup()" title=" ' . INDEX_CHANGE_PASSWORD . ' " class="fa fa-cog xerte_workspace_button settingsButton"></button>
                        <!-- <div id="settings" class="settings-content">
                            <button class="xerte_button" onclick="changepasswordPopup()">' . INDEX_CHANGE_PASSWORD . '</button>
                            <button class="xerte_button">Placeholder</button>
                            <button class="xerte_button">Placeholder</button>
                            <button class="xerte_button">Placeholder</button>
                        </div> -->
                    </div>
                ';
            }
            ?>
            <div style="display: inline-block"><?php display_language_selectionform("general", false); ?></div>
            <?PHP if($xerte_toolkits_site->authentication_method != "Guest") {
                ?><button title="<?PHP echo INDEX_BUTTON_LOGOUT; ?>" type="button" class="xerte_button_c_no_width"
                          onclick="javascript:logout(<?php echo($xerte_toolkits_site->authentication_method == "Saml2" ? "true" : "false"); ?>)">
                <i class="fa fa-sign-out xerte-icon"></i><?PHP echo INDEX_BUTTON_LOGOUT; ?>
                </button><?PHP } ?>
        </div>
    </nav>
    <div class="ui-workbench">
        <div class="ui-tree">
            <div class="dlearning-filter" id="sortContainer">
                <div class="file_mgt_area_bottom">
                    <div class="sorter">
                        <form name="sorting input-prepend input-append" style="float:left;margin:7px 5px 5px 10px;">
                            <div class="btn-group">

                                <button class="btn dropdown-toggle dlearning-dropdown" name="recordinput" data-toggle="dropdown">
                                    <?PHP echo INDEX_SORT_A; ?>
                                    <span class="caret"></span>
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a href="#"><?PHP echo INDEX_SORT_Z; ?></a></li>
                                    <li><a href="#"><?PHP echo INDEX_SORT_NEW; ?></a></li>
                                    <li><a href="#"><?PHP echo INDEX_SORT_OLD; ?></a></li>
                                </ul>

                            </div>
                           <!-- <label for="sort-selector"><?PHP /*echo INDEX_SORT; */?></label>-->
                           <!-- <select id="sort-selector" name="type" onChange="refresh_workspace()">>
                                <option value="alpha_up"><?PHP /*echo INDEX_SORT_A; */?></option>
                                <option value="alpha_down"><?PHP /*echo INDEX_SORT_Z; */?></option>
                                <option value="date_down" selected><?PHP /*echo INDEX_SORT_NEW; */?></option>
                                <option value="date_up"><?PHP /*echo INDEX_SORT_OLD; */?></option>
                            </select>-->
                        </form>
                    </div>
                </div>
            </div>
            <div class="content">
                <div id="workspace"></div>
            </div>
        </div>
        <div class="ui-middle">
            <div class="card" id="ui-container-buttons">
                <div class="file_mgt_area_left">
                    <button title="<?php echo INDEX_BUTTON_EDIT; ?>" type="button" class="xerte_workspace_button disabled" disabled="disabled"
                            id="edit"><i class="fa fa-pencil-square-o xerte-icon"></i>Edit</button>
                    <button title="<?php echo INDEX_BUTTON_PROPERTIES; ?>" type="button" class="xerte_workspace_button disabled" disabled="disabled"
                            id="properties"><i class="fa fa-info-circle xerte-icon"></i>Properties</button>
                    <button title="<?php echo INDEX_BUTTON_PREVIEW; ?>" type="button" class="xerte_workspace_button disabled" disabled="disabled"
                            id="preview"><i class="fa fa-play xerte-icon"></i> Preview</button>
                </div>

                <div class="file_mgt_area_left">
                    <button title="<?php echo INDEX_BUTTON_NEWFOLDER; ?>" type="button" class="xerte_workspace_button" id="newfolder" onClick="javascript:make_new_folder()">
                        <i class="fa fa-folder xerte-icon"></i>New folder
                    </button>
                </div>

                <div class="file_mgt_area_right">
                    <button title="<?php echo INDEX_BUTTON_DELETE; ?>" type="button" class="xerte_workspace_button disabled" disabled="disabled"
                            id="delete"><i class="fa  fa-trash xerte-icon"></i>Delete</button>
                    <button title="<?php echo INDEX_BUTTON_DUPLICATE; ?>" type="button" class="xerte_workspace_button disabled" disabled="disabled"
                            id="duplicate"><i class="fa fa-copy xerte-icon"></i>Duplicate</button>
                    <button title="<?php echo INDEX_BUTTON_PUBLISH; ?>" type="button" class="xerte_workspace_button disabled" disabled="disabled"
                            id="publish"><i class="fa  fa-share xerte-icon"></i>Publish</button>
                </div>
            </div>

            <div class="ui-container-templates">
                <?php
                $templates = get_blank_templates();
                foreach ($templates as $template) {
                    echo "<div class=\"card ui-container-templates-item " . strtolower($template['parent_template']) . "\">"
                            . "<div class=\"template-info\">"
                                . "<h1 class=\"template-title\"><strong>".$template['display_name']."</strong></h1>"
                                . "<p class=\"template-desc\">".$template['description']."</p>"
                            . "</div>"
                            ."<div class=\"template-button-container\">"
                                ."<button id=\" ".$template['template_name']."_button\" type=\"button\" class=\"xerte_button_c_no_width template-plus-icon\""
                                ."onclick=\"javascript:template_toggle('" . $template['template_name']."')\">"
                                ."<i class=\"fa fa-plus\"></i><span class=\"sr-only\"> " . $template['display_name'] ."</span>"
                                ."</button>"
                            ."</div>"
                        ."</div>";
                }
                    ?>
            </div>
           <!-- <div class="card" id="ui-container-preview">

            </div>-->

            <div class="ui-container-information">
                <div class="card ui-container-general-information preview" id="ui-container-details">
                    <div class="card-header information-header">
                        <h5 class="information-title"><strong>Preview</strong></h5>
                    </div>
                    <div class="card-body">
                        <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                    </div>
                </div>
                <div class="card ui-container-general-information details" id="ui-container-shared">
                    <div class="card-header information-header">
                        <h5 class="information-title"><strong>Project details</strong></h5>
                    </div>
                    <div class="card-body">
                        <nav>
                            <div class="nav nav-tabs nav-fill" id="nav-tab" role="tablist">
                                <a class="nav-item nav-link active" id="nav-home-tab" data-toggle="tab" href="#general" role="tab" aria-controls="nav-home" aria-selected="true">General details</a>
                                <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#shared" role="tab" aria-controls="nav-profile" aria-selected="false">Project shared</a>
                            </div>
                        </nav>
                        <div class="tab-content py-3 px-3 px-sm-0" id="nav-tabContent">
                            <div class="tab-pane fade show active" id="general" role="tabpanel" aria-labelledby="nav-general-tab">
                                <div class="projectInformationContainer" id="project_information">

                                </div>
                            </div>
                            <div class="tab-pane fade" id="shared" role="tabpanel" aria-labelledby="nav-shared-tab">
                                Et et consectetur ipsum labore excepteur est proident excepteur ad velit occaecat qui minim occaecat veniam. Fugiat veniam incididunt anim aliqua enim pariatur veniam sunt est aute sit dolor anim. Velit non irure adipisicing aliqua ullamco irure incididunt irure non esse consectetur nostrud minim non minim occaecat. Amet duis do nisi duis veniam non est eiusmod tempor incididunt tempor dolor ipsum in qui sit. Exercitation mollit sit culpa nisi culpa non adipisicing reprehenderit do dolore. Duis reprehenderit occaecat anim ullamco ad duis occaecat ex.
                            </div>

                        </div>
                    </div>

                    </div>
                </div>

            <div class="ui-help">
                <div class="card ui-container-general-information preview flex1-1" id="ui-container-details">
                    <div class="card-body">
                        <?PHP echo apply_filters('editor_pod_one', $xerte_toolkits_site->pod_one); ?>
                    </div>
                </div>
                <div class="card ui-container-general-information preview flex1-1" id="ui-container-details">
                    <div class="card-body">
                        <?PHP echo apply_filters('editor_pod_two', $xerte_toolkits_site->pod_two); ?>
                    </div>
                </div>
                <div class="card ui-container-general-information flex1-1" id="ui-container-details">
                    <div class="card-body">
                        <?PHP echo $xerte_toolkits_site->news_text; ?>
                    </div>
                </div>
            </div>

            <footer class="dlearning-footer">
                <p class="copyright">
                    <?php echo $xerte_toolkits_site->copyright; ?> <i class="fa fa-info-circle" aria-hidden="true" style="color:#f86718; cursor: help;" title="<?PHP $vtext = "version.txt";$lines = file($vtext);echo $lines[0];?>"></i>
                </p>
                <div class="footerlogos">
                    <a href="https://xot.xerte.org.uk/play.php?template_id=214#home" target="_blank" title="Xerte accessibility statement https://xot.xerte.org.uk/play.php?template_id=214"><img src="website_code/images/wcag2.1AA-blue-v.png" border="0" alt="<?php echo INDEX_WCAG_LOGO_ALT; ?>"></a><a href="https://opensource.org/" target="_blank" title="Open Source Initiative: https://opensource.org/"><img src="website_code/images/osiFooterLogo.png" border="0" alt="<?php echo INDEX_OSI_LOGO_ALT; ?>"></a><a href="https://www.apereo.org" target="_blank" title="Apereo: https://www.apereo.org"><img src="website_code/images/apereoFooterLogo.png" border="0" alt="<?php echo INDEX_APEREO_LOGO_ALT; ?>"></a><a href="https://xerte.org.uk" target="_blank" title="Xerte: https://xerte.org.uk"><img src="website_code/images/xerteFooterLogo.png" border="0" alt="<?php echo INDEX_XERTE_LOGO_ALT; ?>"></a>
                </div>
            </footer>
            </div>
        </div>
    </div>
</div>

<script>
    $(document).ready(function () {
        setupMainLayout();
        refresh_workspace();
    });

    $(".dropdown-menu li a").click(function(){
        var selText = $(this).text();
        $(this).parents('.btn-group').find('.dropdown-toggle').html(selText+' <span class="caret"></span>');
    });
</script>
<?php body_end(); ?></body>
</html>
<?php shutdown(); ?>
