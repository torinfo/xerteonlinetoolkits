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
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>

        window.jQuery || document.write('<script src="editor/js/vendor/jquery-1.9.1.min.js"><\/script>')</script>
    <script type="text/javascript" src="editor/js/vendor/jquery.ui-1.10.4.js"></script>
    <script type="text/javascript" src="editor/js/vendor/jquery.layout-1.3.0-rc30.79.min.js"></script>
    <script type="text/javascript" src="editor/js/vendor/jquery.ui.touch-punch.min.js"></script>
    <script type="text/javascript" src="editor/js/vendor/modernizr-latest.js"></script>
    <script type="text/javascript" src="editor/js/vendor/jstree.js?version=<?php echo $version;?>"></script>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <script type="text/javascript" src="modules/xerte/parent_templates/Nottingham/common_html5/js/featherlight/featherlight.min.js?version=<?php echo $version;?>"></script>
    <script type="text/javascript" src="modules/xerte/parent_templates/Nottingham/common_html5/js/featherlight/featherlight.gallery.min.js?version=<?php echo $version;?>"></script>
    <link rel="icon" href="favicon.ico" type="image/x-icon"/>
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon"/>
    <link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/font-awesome/css/font-awesome.min.css?version=<?php echo $version;?>">
    <link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/font-awesome-4.3.0/css/font-awesome.min.css">
    <link href="website_code/styles/bootstrap.css?version=<?php echo $version;?>" media="all" type="text/css" rel="stylesheet"/>
    <link href="website_code/styles/nv.d3.css?version=<?php echo $version;?>" media="all" type="text/css" rel="stylesheet"/>
    <link href="website_code/styles/xapi_dashboard.css?version=<?php echo $version;?>" media="all" type="text/css" rel="stylesheet"/>
    <link href='https://fonts.googleapis.com/css?family=Cabin' rel='stylesheet' type='text/css'>
    <link href="website_code/styles/folder_popup.css?version=<?php echo $version;?>" media="screen" type="text/css" rel="stylesheet"/>
    <link href="website_code/styles/jquery-ui-layout.css?version=<?php echo $version;?>" media="all" type="text/css" rel="stylesheet"/>
    <link href="website_code/styles/xerte_buttons.css?version=<?php echo $version;?>" media="screen" type="text/css" rel="stylesheet"/>
    <link href="website_code/styles/frontpage.css?version=<?php echo $version;?>" media="all" type="text/css" rel="stylesheet"/>
    <link href='https://fonts.googleapis.com/css?family=Open+Sans' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="modules/xerte/parent_templates/Nottingham/common_html5/js/featherlight/featherlight.min.css?version=<?php echo $version;?>" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css">
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

<div class="folder_popup" id="message_box">
    <div class="main_area" id="dynamic_section">
        <p style="color:white"><?PHP echo INDEX_FOLDER_PROMPT; ?></p>

        <form id="foldernamepopup" action="javascript:create_folder()" method="post" enctype="text/plain">
            <input type="text" width="200" id="foldername" name="foldername"
                   style="margin:0px; margin-right:5px; padding:3px"/>
            <button type="submit" class="xerte_button_c">
                <img src="website_code/images/Icon_Folder_15x12.gif"/>
                <?php echo INDEX_BUTTON_NEWFOLDER_CREATE; ?>
            </button>
            <button type="button" class="xerte_button_c"
                    onclick="javascript:popup_close()"><?php echo INDEX_BUTTON_CANCEL; ?>
            </button>
        </form>
        <p><span id="folder_feedback"></span></p>
    </div>
</div>

<div class="dashboard-wrapper" id="dashboard-wrapper">

    <div class="dashboard" id="dashboard">
        <div id="options-div">
            <div class="row dash-row">
                <div class="dash-col unanonymous-view" >
                    <label for="dp-unanonymous-view">
                        <?php echo INDEX_XAPI_DASHBOARD_SHOW_NAMES; ?>
                    </label>
                    <input type="checkbox" id="dp-unanonymous-view" >
                </div>

                <div class="dash-col">
                    <label for="dp-start">
                        <?php echo INDEX_XAPI_DASHBOARD_FROM; ?>
                    </label>
                    <input type="text" id="dp-start" value="2018/03/24 21:23" data-test="2018/03/24 21:23">
                </div>
                <div class="dash-col-1">
                    <label for="dp-end">
                        <?php echo INDEX_XAPI_DASHBOARD_UNTIL; ?>
                    </label>
                    <input type="text" id="dp-end">
                </div>
                <div class="dash-col-1">
                    <label for="dp-end">
                        <?php echo INDEX_XAPI_DASHBOARD_GROUP_SELECT; ?>
                    </label>
                    <select type="text" id="group-select">
                        <option value="all-groups"><?php echo INDEX_XAPI_DASHBOARD_GROUP_ALL; ?></option>
                    </select>
                </div>
                <div class="close-button">
                    <button type="button" class="xerte_button_c_no_width"
                            onclick="javascript:close_dashboard()"><?php echo INDEX_XAPI_DASHBOARD_CLOSE; ?>
                    </button>
                </div>
                <div class="show-display-options-button">
                    <button type="button" class="xerte_button_c_no_width"><?php echo INDEX_XAPI_DASHBOARD_DISPLAY_OPTIONS; ?>
                    </button>
                </div>
                <div class="show-question-overview-button">
                    <button type="button" class="xerte_button_c_no_width"><?php echo INDEX_XAPI_DASHBOARD_QUESTION_OVERVIEW; ?>
                    </button>
                </div>
                <div class="dashboard-print-button">
                    <button type="button" class="xerte_button_c_no_width"><?php echo INDEX_XAPI_DASHBOARD_PRINT; ?>
                    </button>
                </div>
            </div>
        </div>
        <div id="dashboard-title"></div>
        <div class="jorneyData-container">
            <div id="journeyData" class="journeyData journey-container"></div>
        </div>
    </div>
</div>

<!---->
<!--

    Main part of the page

-->

<!--div gemaakt-->

<div class="ui-layout-center" id="pagecontainer">
    <div id="hetpuntje">
        <div class="ui-layout-north">
            <div class="content" id="mainHeader">

                <div class="topbar">
                    <?php
                    if (file_exists($xerte_toolkits_site->root_file_path . "branding/logo_right.png"))
                    {
                        ?>
                        <div
                                style="width:50%; height:100%; float:right; position:relative; background-image:url(branding/logo_right.png); background-repeat:no-repeat; background-position:right; margin-right:10px; float:right">
                        </div>
                        <?php
                    }
                    else {
                        ?>
                        <div
                                style="width:50%; height:100%; float:right; position:relative; background-image:url(website_code/images/apereoLogo.png); background-repeat:no-repeat; background-position:right; margin-right:10px; float:right">
                        </div>
                        <?php
                    }
                    if (file_exists($xerte_toolkits_site->root_file_path . "branding/logo_left.png"))
                    {
                        ?>
                        <img src="branding/logo_left.png" style="margin-left:10px; float:left"/>
                        <?php
                    }
                    else {
                        ?>
                        <img src="website_code/images/logo.png" style="margin-left:10px; float:left"/>
                        <?php
                    }
                    ?>
                </div>

                <div class="ui-layout-east">

                    <div class="header" id="inner_right_header">
                        <p class="heading"><i class="fa  icon-wrench xerte-icon"></i>&nbsp;<?PHP echo INDEX_CREATE; ?></p>
                    </div>

                    <div class="content">
                        <div class="new_template_area_middle">
                            <div id="new_template_area_middle_ajax" class="new_template_area_middle_scroll"><?PHP
                                list_blank_templates();
                                ?>
                            </div>
                        </div>
                    </div>
                    <div class="footer" id="inner_right_footer"></div>
                </div>

                <div class="buttonbar">
                    <div class="file_mgt_area_top">
                        <div class="file_mgt_area_buttons">
                            <!--Workspace buttons-->

                            <div class="file_mgt_area_middle_button_left">
                                <button title="<?php echo INDEX_BUTTON_EDIT; ?>" type="button" class="xerte_workspace_button disabled" disabled="disabled"
                                        id="edit"><i class="fa fa-pencil-square-o xerte-icon" style="color: white"></i></button>
                                <button title="<?php echo INDEX_BUTTON_PROPERTIES; ?>" type="button" class="xerte_workspace_button disabled" disabled="disabled"
                                        id="properties"><i class="fa fa-info-circle xerte-icon" style="color: white"></i></button>
                                <button title="<?php echo INDEX_BUTTON_PREVIEW; ?>" type="button" class="xerte_workspace_button disabled" disabled="disabled"
                                        id="preview"><i class="fa fa-folder fa-play" style="color: white"></i></button>
                            </div>

                            <div class="file_mgt_area_middle_button_left">
                                <button title="<?php echo INDEX_BUTTON_NEWFOLDER; ?>" type="button" class="xerte_workspace_button" id="newfolder" onClick="javascript:make_new_folder()">
                                    <i class="fa fa-folder xerte-icon" style="color: white"></i>
                                </button>
                            </div>

                            <div class="file_mgt_area_middle_button_right">
                                <button title="<?php echo INDEX_BUTTON_DELETE; ?>" type="button" class="xerte_workspace_button disabled" disabled="disabled"
                                        id="delete"><i class="fa  fa-trash xerte-icon" style="color: white"></i></button>
                                <button title="<?php echo INDEX_BUTTON_DUPLICATE; ?>" type="button" class="xerte_workspace_button disabled" disabled="disabled"
                                        id="duplicate"><i class="fa fa-copy xerte-icon" style="color: white"></i></button>
                                <button title="<?php echo INDEX_BUTTON_PUBLISH; ?>" type="button" class="xerte_workspace_button disabled" disabled="disabled"
                                        id="publish"><i class="fa  fa-share xerte-icon" style="color: white"></i></button>
                            </div>
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
                        <div style="display: inline-block"><?php display_language_selectionform("general"); ?></div>
                        <?PHP if($xerte_toolkits_site->authentication_method != "Guest") {
                            ?><button title="<?PHP echo INDEX_BUTTON_LOGOUT; ?>" type="button" class="xerte_button_c_no_width"
                                      onclick="javascript:logout(<?php echo($xerte_toolkits_site->authentication_method == "Saml2" ? "true" : "false"); ?>)">
                            <i class="fa fa-sign-out xerte-icon"></i><?PHP echo INDEX_BUTTON_LOGOUT; ?>
                            </button><?PHP } ?>
                    </div>

                </div>
            </div>
        </div>
    </div>



<!--                <div class="userbar">-->
<!--                    --><?PHP ////echo "&nbsp;&nbsp;&nbsp;" . INDEX_LOGGED_IN_AS . " " .;
//                    echo $_SESSION['toolkits_firstname'] . " " . $_SESSION['toolkits_surname'] ?>
<!--                    --><?PHP
//                    // only on Db:
//                    if ($authmech->canManageUser($jsscript)){
//                        echo '
//                    <div class="settingsDropdown">
//                        <button onclick="changepasswordPopup()" title=" ' . INDEX_CHANGE_PASSWORD . ' " class="fa fa-cog xerte_workspace_button settingsButton"></button>
//                        <!-- <div id="settings" class="settings-content">
//                            <button class="xerte_button" onclick="changepasswordPopup()">' . INDEX_CHANGE_PASSWORD . '</button>
//                            <button class="xerte_button">Placeholder</button>
//                            <button class="xerte_button">Placeholder</button>
//                            <button class="xerte_button">Placeholder</button>
//                        </div> -->
//                    </div>
//                ';
//                    }
//                    ?>
<!--                    <div style="display: inline-block">--><?php //display_language_selectionform("general"); ?><!--</div>-->
<!--                    --><?PHP //if($xerte_toolkits_site->authentication_method != "Guest") {
//                        ?><!--<button title="--><?PHP //echo INDEX_BUTTON_LOGOUT; ?><!--" type="button" class="xerte_button_c_no_width"-->
<!--                                  onclick="javascript:logout(--><?php //echo($xerte_toolkits_site->authentication_method == "Saml2" ? "true" : "false"); ?>
<!--                        <i class="fa fa-sign-out xerte-icon"></i>--><?PHP ////echo INDEX_BUTTON_LOGOUT; ?>
<!--                        </button>--><?PHP //} ?>
<!--                </div>-->
                <div style="clear:both;"></div>
                <div class="separator"></div>




    <div id="west-center">
        <div class="ui-layout-west" id="workspace_layout">

            <div class="content">
              <div id="workspace"></div>
            </div>
            <div id="footer-ui-layout-west">
                <div class="footer" id="sortContainer">
                    <div class="file_mgt_area_bottom">
                        <div class="sorter">
                            <form name="sorting" style="float:left;margin:7px 5px 5px 10px;">
                                <i class="fa  fa-sort xerte-icon"></i>&nbsp;<?PHP echo INDEX_SORT; ?>
                                <select id="sort-selector" name="type" onChange="refresh_workspace()">>
                                    <option value="alpha_up"><?PHP echo INDEX_SORT_A; ?></option>
                                    <option value="alpha_down"><?PHP echo INDEX_SORT_Z; ?></option>
                                    <option value="date_down" selected><?PHP echo INDEX_SORT_NEW; ?></option>
                                    <option value="date_up"><?PHP echo INDEX_SORT_OLD; ?></option>
                                </select>
                            </form>
                        </div>
                        <div class="workspace_search_outer">
                            <div class="workspace_search">
                                <i class="fa  fa-search"></i>&nbsp;<?PHP echo INDEX_SEARCH; ?>
                                <input type="text" id="workspace_search" label="Search" placeholder="<?php echo INDEX_SEARCH_PLACEHOLDER?>">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="ui-layout-center">
            <!--<div class="header" id="inner_center_header">
                <p class="heading"><i class="fa  icon-info-sign xerte-icon"></i>&nbsp;<?PHP echo INDEX_DETAILS; ?></p>
            </div>-->

            <div class="content">
                <!-- Slideshow container -->
                <div id="btns">
                    <button type="submit" class="buttontje" onclick="myFunction()">Preview</button>
                    <button type="submit" class="buttontje"  id="info" onclick="myFunction1()">Info</button>
                </div>
                <!-- Full-width images with number and caption text -->
                <div id="previewbtn" style="display: block" >
                    <h3 id="preview/info" style="text-align: center">Preview</h3>
                    <iframe src="http://localhost/xot/preview.php?template_id=18#page1" style=" margin-left:10%;  width: 600px; height: 305px; top: 160px" title="test"></iframe>
                </div>

                <?php

                require_once(dirname(__FILE__) . "/config.php");

                global $xerte_toolkits_site;

                $extraparams = "&LinkID=";
                if (isset($_REQUEST['LinkID']))
                {
                    $extraparams .= "&LinkID=" . $_REQUEST['LinkID'];
                }

                if (isset($_REQUEST['Page']))
                {
                    $extraparams .= "&Page=" . $_REQUEST['Page'];
                }

                header('Location: ' . $xerte_toolkits_site->site_url . 'preview.php?engine=html5&template_id= '. $_REQUEST['template_id'] . $extraparams);


                ?>


                <div id="previewbtn1" style="display: none" >
                    <h3 style="text-align: center">Info</h3>
                    <div class="projectInformationContainer" id="project_information" style="margin-left: 30%;"></div>
                </div>



                <!-- Next and previous buttons -->

                <br>

                <div class="footer" id="inner_center_footer"></div>
            </div>
        </div>
    </div>
<!--    <div id="ui-layout-info">-->
<!---->
<!--        <div class="help-layout">-->
<!--            <section class="info-layout">-->
<!--                <p class="news_title">Hoe werkt het?</p>-->
<!--                <p class="demo">-->
<!--                    <a data-featherlight="iframe" href="https://xot.xerte.org.uk/play.php?template_id=102">Demo</a>-->
<!--                    <br> Een korte screenvideo waarin een eenvoudig leerobject wordt opgestart, pagina's worden toegevoegd en gepubliceerd voor het web.-->
<!--                </p>-->
<!---->
<!--                <p class="demo">-->
<!--                    <a data-featherlight="iframe" href="https://xot.xerte.org.uk/play_164">Leerobject Demo</a>-->
<!--                    <br> Een eenvoudige demo van een leerobject geschikt voor HTML5 waarin diverse paginatypes getoond worden.-->
<!--                </p>-->
<!--            </section>-->
<!--        </div>-->
<!---->
<!--        <div class="help-layout">-->
<!--            <section class="info-layout">-->
<!--                <p class="news_title">Graag een bijdrage leveren?</p>-->
<!---->
<!--                <p class="general">-->
<!--                    Wanneer u opmerkingen heeft, verzoek om support, ideeen voor nieuwe projecten of problemen te rapporteren, neem dan contact met ons op.-->
<!--                </p>-->
<!---->
<!--                <p class="general">-->
<!--                    Gebruikt u hiervoor alstublieft het forum van de-->
<!--                    <a target="_blank&quot;" href="http://www.xerte.org.uk"> Xerte Community Website</a>-->
<!--                </p>-->
<!--            </section>-->
<!--        </div>-->
<!---->
<!--        <div class="help-layout">-->
<!--            <section class="highlightbox">-->
<!--                <p class="news_title">Handleidingen</p>-->
<!--                <p class="news_story"><a target="_blank" href="https://toll-net.be/moodle/xertetoolkits/play.php?template_id=34554">De eerste stappen</a></p>-->
<!--                <p class="news_story"><a target="_blank" href="https://toll-net.be/moodle/xertetoolkits/play.php?template_id=34555">Op weg naar een interactieve module</a></p>-->
<!--                <p class="news_story"><a target="_blank" href="https://toll-net.be/moodle/xertetoolkits/play.php?template_id=36265">Voor wie bijna alles wil weten</a></p>-->
<!--                <p class="news_story"><a target="_blank" href="http://www.xerte.org.uk/images/Tutorials/NL/Handleiding_Xerte.pdf">Handleiding Xerte</a></p>-->
<!--                <p class="news_story"><a target="_blank" href="http://www.xerte.org.uk/images/Tutorials/NL/Snelgids_Xerte.pdf">Snelgids pagina's</a></p>-->
<!--                <p class="news_story"><a href="https://www.dlearning.nl/index.php/trainingen-events" target="_blank">Trainingen Xerte</a></p>-->
<!--                <p class="news_story"><a data-featherlight="iframe" href="https://creativecommons.org/choose/">Licentievorm kiezen?</a></p>-->
<!--            </section>-->
<!--        </div>-->
<!--        <span id="south-closer" class="button-close button-close-south" title="Sluit dit paneel"></span>-->
<!--        <span class="pin-button button-pin button-pin-south button-pin-down button-pin-south-down" pin="down" title="Los maken"></span>-->
<!--    </div>-->
<!---->
<!--</div>-->
<!--information-->



    <script>



        function myFunction() {
            var x = document.getElementById("previewbtn");
            var y = document.getElementById("previewbtn1");
            if (x.style.display === "none") {
                x.style.display = "block";
                y.style.display = "none";
            }
            else {
                x.style.display = "block";
            }
        }

            function myFunction1() {
                var y = document.getElementById("previewbtn1");
                var x = document.getElementById("previewbtn");
                if (y.style.display === "none") {
                    y.style.display = "block";
                    x.style.display = "none";

                } else {
                    y.style.display = "block";
                }
            }

    </script>
<!--    <div class="ui-layout-center">-->
<!--        <!-<div class="header" id="inner_center_header">-->
<!--            <p class="heading"><i class="fa  icon-info-sign xerte-icon"></i>&nbsp;--><?PHP //echo INDEX_DETAILS; ?><!--</p>-->
<!--        </div>-->
<!---->
<!--        <div class="content">-->
<!--            < Slideshow container -->
<!--<div id="btns">-->
<!--        <button type="submit" class="buttontje" onclick="myFunction()">Preview</button>-->
<!--        <button type="submit" class="buttontje"  id="info" onclick="myFunction1()">Info</button>-->
<!--</div>-->
<!--                <Full-width images with number and caption text -->
<!--            <div id="previewbtn" style="display: block" >-->
<!--                    <h3 id="preview/info" style="text-align: center">Preview</h3>-->
<!--                    <iframe  src="http://localhost:8081/xot/preview.php?template_id= header"  style=" margin-left:10%;  width: 600px; height: 380px; top: 160px" title="test"></iframe>-->
<!--            </div>-->
<!---->
<!--            --><?php
//
//
//require_once(dirname(__FILE__) . "/config.php");
//
//global $xerte_toolkits_site;
//
//$extraparams = "";
//if (isset($_REQUEST['LinkID']))
//{
//    $extraparams .= "&LinkID=" . $_REQUEST['LinkID'];
//}
//
//if (isset($_REQUEST['Page']))
//{
//    $extraparams .= "&Page=" . $_REQUEST['Page'];
//}
//
//header("Location: " . $xerte_toolkits_site->site_url . "preview.php?engine=html5&template_id=" . $_REQUEST['template_id'] . $extraparas);
//
//            ?>
<!---->
<!---->
<!--<div id="previewbtn1" style="display: none" >-->
<!--                    <h3 style="text-align: center">Info</h3>-->
<!--                    <div class="projectInformationContainer" id="project_information" style="margin-left: 30%;"></div>-->
<!--</div>-->
<!---->
<!---->
<!---->
<!--                 Next and previous buttons -->
<!---->
<!--            <br>-->
<!---->
<!--        <div class="footer" id="inner_center_footer"></div>-->
<!--        </div>-->
<!--</div>-->

<!--    <div class="ui-layout-east">-->
<!---->
<!--        <div class="header" id="inner_right_header">-->
<!--            <p class="heading"><i class="fa  icon-wrench xerte-icon"></i>&nbsp;--><?PHP //echo INDEX_CREATE; ?><!--</p>-->
<!--        </div>-->
<!---->
<!--         <div class="content">-->
<!--            <div class="new_template_area_middle">-->
<!--                <div id="new_template_area_middle_ajax" class="new_template_area_middle_scroll">--><?PHP
//                    list_blank_templates();
//                    ?>
<!--                </div>-->
<!--            </div>-->
<!--        </div>-->
<!--        <div class="footer" id="inner_right_footer"></div>-->
<!--    </div>-->
</div>
<!--gesloten-->


<div  class="ui-layout-south">
    <div id="ui-layout-info">

        <div class="help-layout">
            <section class="info-layout">
                <p class="news_title">Hoe werkt het?</p>
                <p class="demo">
                    <a data-featherlight="iframe" href="https://xot.xerte.org.uk/play.php?template_id=102">Demo</a>
                    <br> Een korte screenvideo waarin een eenvoudig leerobject wordt opgestart, pagina's worden toegevoegd en gepubliceerd voor het web.
                </p>

                <p class="demo">
                    <a data-featherlight="iframe" href="https://xot.xerte.org.uk/play_164">Leerobject Demo</a>
                    <br> Een eenvoudige demo van een leerobject geschikt voor HTML5 waarin diverse paginatypes getoond worden.
                </p>
            </section>
        </div>

        <div class="help-layout">
            <section class="info-layout">
                <p class="news_title">Graag een bijdrage leveren?</p>

                <p class="general">
                    Wanneer u opmerkingen heeft, verzoek om support, ideeen voor nieuwe projecten of problemen te rapporteren, neem dan contact met ons op.
                </p>

                <p class="general">
                    Gebruikt u hiervoor alstublieft het forum van de
                    <a target="_blank&quot;" href="http://www.xerte.org.uk"> Xerte Community Website</a>
                </p>
            </section>
        </div>

        <div class="help-layout">
            <section class="highlightbox">
                <p class="news_title">Handleidingen</p>
                <p class="news_story"><a target="_blank" href="https://toll-net.be/moodle/xertetoolkits/play.php?template_id=34554">De eerste stappen</a></p>
                <p class="news_story"><a target="_blank" href="https://toll-net.be/moodle/xertetoolkits/play.php?template_id=34555">Op weg naar een interactieve module</a></p>
                <p class="news_story"><a target="_blank" href="https://toll-net.be/moodle/xertetoolkits/play.php?template_id=36265">Voor wie bijna alles wil weten</a></p>
                <p class="news_story"><a target="_blank" href="http://www.xerte.org.uk/images/Tutorials/NL/Handleiding_Xerte.pdf">Handleiding Xerte</a></p>
                <p class="news_story"><a target="_blank" href="http://www.xerte.org.uk/images/Tutorials/NL/Snelgids_Xerte.pdf">Snelgids pagina's</a></p>
                <p class="news_story"><a href="https://www.dlearning.nl/index.php/trainingen-events" target="_blank">Trainingen Xerte</a></p>
                <p class="news_story"><a data-featherlight="iframe" href="https://creativecommons.org/choose/">Licentievorm kiezen?</a></p>
            </section>
        </div>
<!--        <span id="south-closer" class="button-close button-close-south" title="Sluit dit paneel"></span>-->
        <span class="pin-button button-pin button-pin-south button-pin-down button-pin-south-down" pin="down" title="Los maken"></span>
    </div>

    <div class="content">
        <!-- <div class="border" style="margin:10px"></div>  -->
        <!--
        <div class="help" style="width:31%;float:left;">
            <?PHP echo apply_filters('editor_pod_one', $xerte_toolkits_site->pod_one); ?>
        </div>

        <div class="help" style="width:31%;float:left;">
            <?PHP echo apply_filters('editor_pod_two', $xerte_toolkits_site->pod_two); ?>
        </div>
        <div class="highlightbox" style="width:31%;float:right;">
            <?PHP
        //echo $xerte_toolkits_site->demonstration_page;
        echo $xerte_toolkits_site->news_text;
        //echo $xerte_toolkits_site->tutorial_text;
        //echo $xerte_toolkits_site->site_text;
        ?>
        </div>

        <div class="border"></div>-->

        <p class="copyright">
            <!--<img src="website_code/images/lt_logo.gif" /><br/>-->
            <?PHP
            echo $xerte_toolkits_site->copyright;
            ?> <i class="fa fa-info-circle xerte_info_button" aria-hidden="true" style=" cursor: help;" title="<?PHP echo $version;?>"></i></p><div class="footerlogos"><a href="https://xot.xerte.org.uk/play.php?template_id=214#home" target="_blank" title="Xerte accessibility statement https://xot.xerte.org.uk/play.php?template_id=214"><img src="website_code/images/wcag2.1AA-blue-v.png" border="0"></a> <a href="https://opensource.org/" target="_blank" title="Open Source Initiative: https://opensource.org/"><img src="website_code/images/osiFooterLogo.png" border="0"></a> <a href="https://www.apereo.org" target="_blank" title="Apereo: https://www.apereo.org"><img src="website_code/images/apereoFooterLogo.png" border="0"></a> <a href="https://xerte.org.uk" target="_blank" title="Xerte: https://xerte.org.uk"><img src="website_code/images/logo.png" border="0"></a></div>

        <div style="clear:both;"></div>
    </div>

</div>
<!--    <div class="content">-->
<!--         <div class="border" style="margin:10px"></div>  -->
<!--        <!-->
<!--        <div class="help" style="width:31%;float:left;">-->
<!--            --><?PHP //echo apply_filters('editor_pod_one', $xerte_toolkits_site->pod_one); ?>
<!--        </div>-->
<!---->
<!--        <div class="help" style="width:31%;float:left;">-->
<!--            --><?PHP //echo apply_filters('editor_pod_two', $xerte_toolkits_site->pod_two); ?>
<!--        </div>-->
<!--        <div class="highlightbox" style="width:31%;float:right;">-->
<!--            --><?PHP
//            //echo $xerte_toolkits_site->demonstration_page;
//            echo $xerte_toolkits_site->news_text;
//            //echo $xerte_toolkits_site->tutorial_text;
//            //echo $xerte_toolkits_site->site_text;
//            ?>
<!--        </div>-->
<!---->
<!--        <div class="border"></div>-->-->
<!---->
<!--        <p class="copyright">-->
<!--            <!<img src="website_code/images/lt_logo.gif" /><br/>-->-
<!--            --><?PHP
//            echo $xerte_toolkits_site->copyright;
//            ?><!-- <i class="fa fa-info-circle xerte_info_button" aria-hidden="true" style=" cursor: help;" title="--><?PHP //echo $version;?><!--"></i></p><div class="footerlogos"><a href="https://xot.xerte.org.uk/play.php?template_id=214#home" target="_blank" title="Xerte accessibility statement https://xot.xerte.org.uk/play.php?template_id=214"><img src="website_code/images/wcag2.1AA-blue-v.png" border="0"></a> <a href="https://opensource.org/" target="_blank" title="Open Source Initiative: https://opensource.org/"><img src="website_code/images/osiFooterLogo.png" border="0"></a> <a href="https://www.apereo.org" target="_blank" title="Apereo: https://www.apereo.org"><img src="website_code/images/apereoFooterLogo.png" border="0"></a> <a href="https://xerte.org.uk" target="_blank" title="Xerte: https://xerte.org.uk"><img src="website_code/images/logo.png" border="0"></a></div>-->
<!---->
<!--        <div style="clear:both;"></div>-->
<!--    </div>-->
</div>

<script>
    $(document).ready(function () {
        setupMainLayout();
        refresh_workspace();
    });
</script>
<?php body_end(); ?></body>
</html>
<?php shutdown(); ?>
