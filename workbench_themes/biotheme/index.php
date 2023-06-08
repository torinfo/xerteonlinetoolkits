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
require_once("website_code/php/settings_library.php");

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
$toolkits_logon_id = $_SESSION['toolkits_logon_id'];
$image = get_user_image($toolkits_logon_id);

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
    <link rel="stylesheet" href="workbench_themes/biotheme/theme.css" type="text/css"/>
    <link rel="stylesheet" href="editor/js/vendor/themes/default/style.css?version=<?php echo $version;?>" />
    <link rel="stylesheet" href="editor/js/vendor/themes/default-dark/style.css?version=<?php echo $version;?>" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">


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
    <script type="text/javascript" src="website_code/scripts/user_settings.js"></script>


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


<div class="modal fade" id="changeLanguage" tabindex="-1" role="dialog" aria-labelledby="changeLanguage" aria-hidden="true">
    <div class="modal-dialog customModal" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Change Language</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <?php display_language_selectionform_extra("general", false); ?>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn" data-dismiss="modal">Close</button>
                <button type="submit" name="submit" value="Upload" form="languageForm" class="btn input-group-text submit">Change</button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="changeImage" tabindex="-1" role="dialog" aria-labelledby="changeImage" aria-hidden="true">
    <div class="modal-dialog customModal" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Change Image</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <?php if(count($image) > 0 && $image){ ?>
                    <div id="userContainerSettings" >
                        <img id="userSettings" src="data:image/png;charset=utf8;base64,<?php echo $image[0]['profileimage']; ?>" alt="User" />
                    </div>
                <?php }else{ ?>
                    <div id="userContainerSettings">
                        <img id="userSettings" src="website_code/images/user_placeholder.jpg" alt="User">
                    </div>
                <?php } ?>
                <form action="website_code/php/upload_profile_image.php" id="imageForm" method="post" enctype="multipart/form-data">
                    <div class="input-group">
                        <div class="custom-file">
                            <input type="file" name="fileToUpload" id="fileToUpload" class="custom-file-input">
                            <label class="custom-file-label" for="fileToUpload">Choose file</label>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn" data-dismiss="modal">Close</button>
                <button type="submit" name="submit" value="Upload" form="imageForm" class="btn input-group-text submit">Upload</button>
            </div>
        </div>
    </div>
</div>


<div class="modal fade" id="changePassword" tabindex="-1" role="dialog" aria-labelledby="changePassword" aria-hidden="true">
    <div class="modal-dialog customModal" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Change Password</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <form action="" onclick='changePassword(<?php echo $_SESSION['toolkits_logon_username'] ?>)' id="passwordForm" method="post" enctype="multipart/form-data">
                    <div class="form-group">
                        <label for="recipient-name" class="col-form-label">Current Password</label>
                        <input type="text" class="form-control" id="oldpass">
                    </div>

                    <div class="form-group">
                        <label for="recipient-name" class="col-form-label">New Password</label>
                        <input type="text" class="form-control" id="newpass">
                    </div>

                    <div class="form-group">
                        <label for="recipient-name" class="col-form-label">Repeat Password</label>
                        <input type="text" class="form-control" id="newpassrepeat">
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn" data-dismiss="modal">Close</button>
                <button type="submit" name="submit" value="Upload" form="passwordForm" class="btn input-group-text submit">Submit</button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="changeTheme" tabindex="-1" role="dialog" aria-labelledby="changeTheme" aria-hidden="true">
    <div class="modal-dialog customModal" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Change Theme</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <form action="website_code/php/change_theme.php" id="themeForm" method="post" enctype="multipart/form-data">
                    <select name="theme" class="form-select" aria-label="Default select example">
                        <option value="dlearning">Dlearning</option>
                        <option value="xerte">Xerte</option>
                        <option selected value="biotheme">Biotheme</option>
                    </select>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn" data-dismiss="modal">Close</button>
                <button type="submit" name="submit" value="Upload" form="themeForm" class="btn input-group-text submit">Change</button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="MakeFolder" tabindex="-1" role="dialog" aria-labelledby="MakeFolder" aria-hidden="true">
    <div class="modal-dialog customModal" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Create Folder</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <form onclick='create_folder()' id="MakeFolder" method="post" enctype="multipart/form-data">
                    <div class="form-group">
                        <label for="recipient-name" class="col-form-label"><?php echo INDEX_FOLDER_NAME ?></label>
                        <input type="text" class="form-control" id="foldername">
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn" data-dismiss="modal">Close</button>
                <button type="submit" name="submit" value="Upload" form="MakeFolder" class="btn input-group-text submit">Submit</button>
            </div>
        </div>
    </div>
</div>


<div class="ui-container">
    <nav class="navbar navbar-light dlearning-navbar mint">
        <!--        <a class="navbar-brand dlearning-brand" href="#">
            <img src="http://localhost/xot/website_code/images/logo.png" id="xerte-logo" alt="">
        </a>
        <div class="userbar">
            <?PHP /*//echo "&nbsp;&nbsp;&nbsp;" . INDEX_LOGGED_IN_AS . " " .;
            echo $_SESSION['toolkits_firstname'] . " " . $_SESSION['toolkits_surname'] */?>
            <?PHP
        /*            // only on Db:
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
                    */?>
            <div style="display: inline-block"><?php /*display_language_selectionform("general", false); */?></div>
            <?PHP /*if($xerte_toolkits_site->authentication_method != "Guest") {
                */?><button title="<?PHP /*echo INDEX_BUTTON_LOGOUT; */?>" type="button" class="xerte_button_c_no_width"
                          onclick="javascript:logout(<?php /*echo($xerte_toolkits_site->authentication_method == "Saml2" ? "true" : "false"); */?>)">
                <i class="fa fa-sign-out xerte-icon"></i><?PHP /*echo INDEX_BUTTON_LOGOUT; */?>
                </button><?PHP /*} */?>
        </div>-->
        <a class="navbar-brand dlearning-brand" href="#">
            <img src="http://localhost/xot/website_code/images/logo.png" id="xerte-logo" alt="">
        </a>

        <div class="userbar">
            <!-- <div id="username"><?php /*echo $_SESSION['toolkits_firstname'] . " " . $_SESSION['toolkits_surname'] */?> </div>-->
            <?php if(count($image) > 0 && $image){ ?>
                <div id="userContainer" >
                    <img id="user" data-toggle="collapse" href="#settingsCollapse" aria-expanded="false" aria-controls="settingsCollapse" src="data:image/png;charset=utf8;base64,<?php echo $image[0]['profileimage']; ?>" alt="User" />
                </div>

                <div class="card settings collapse green-popup" id="settingsCollapse" aria-expanded="false" aria-controls="settingsCollapse">
                    <div class="card-body settingsCollapseBody">
                        <h5>Manage your account</h5>
                        <hr>
                        <div class="settingsItem"><button class="btn settingsButton text-left green-border green-opacity-50" type="button" data-toggle="modal" data-target="#changeLanguage" aria-expanded="false" aria-controls="changeLanguage">Change language</button></div>
                        <div class="settingsItem"><button class="btn settingsButton text-left green-border green-opacity-50" type="button" data-toggle="modal" data-target="#changeImage" aria-expanded="false" aria-controls="changeImage">Change profile</button></div>
                        <div class="settingsItem"><button class="btn settingsButton text-left green-border green-opacity-50" type="button" data-toggle="modal" data-target="#changePassword" aria-expanded="false" aria-controls="changePassword">Change password</button></div>
                        <div class="settingsItem"><button class="btn settingsButton text-left green-border green-opacity-50" type="button" data-toggle="modal" data-target="#changeTheme" aria-expanded="false" aria-controls="changePassword">Change theme</button></div>
                        <div class="settingsItem"><button class="btn settingsButton text-left green-border green-opacity-50" type="button" onclick="logout(<?php /*echo($xerte_toolkits_site->authentication_method == "Saml2" ? "true" : "false"); */?>)">Log out</button></div>
                    </div>
                </div>

            <?php }else{ ?>
                <div id="userContainer">
                    <img id="user" src="website_code/images/user_placeholder.jpg" alt="User">
                </div>
            <?php } ?>

            <!--<div style="display: inline-block"><?php /*display_language_selectionform_modern("general", false); */?></div>-->
        </div>
    </nav>
    <div class="ui-workbench">
        <div class="ui-tree mint">
            <div class="workspace_search_outer">
                <div class="workspace_search">
                    <input class="form-control" type="text" id="workspace_search" placeholder="Search by <?php echo INDEX_SEARCH_PLACEHOLDER?>">
                </div>
            </div>
            <div class="dlearning-filter" id="sortContainer">
                <div class="file_mgt_area_bottom">
                    <div class="sorter">
                        <form name="sorting" class="input-prepend input-append" style="float:left;margin:7px 5px 5px 10px;">
                            <select id="sort-selector" class="form-select" name="type" onChange="refresh_workspace()">
                                <option value="alpha_up"><?PHP echo INDEX_SORT_A; ?></option>
                                <option value="alpha_down"><?PHP echo INDEX_SORT_Z; ?></option>
                                <option value="date_down" selected><?PHP echo INDEX_SORT_NEW; ?></option>
                                <option value="date_up"><?PHP echo INDEX_SORT_OLD; ?></option>
                            </select>
                        </form>
                    </div>
                </div>
            </div>
            <div class="content">
                <div id="workspace"></div>
            </div>
        </div>
        <div class="ui-middle plant">


            <div class="ui-container-templates">
                <?php
                $templates = get_blank_templates();
                $prefix = $xerte_toolkits_site->database_table_prefix;

                $query_for_blank_templates = "select * from {$prefix}originaltemplatesdetails where "
                    . "active= ? order by parent_template, date_uploaded DESC";

                $rows = db_query($query_for_blank_templates, array(1));

                foreach ($templates as $template) {
                    if(access_check($template['access_rights'])){
                        $derived = array($template);
                        foreach ($rows as $row) {
                            if ($row['template_name'] != $row['parent_template'] && $template['parent_template'] == $row['parent_template'] && access_check($row['access_rights'])) {
                                array_push($derived, $row);
                            }
                        }

                        ?>
                        <div id="<?php echo $template['parent_template']?>_animation" class="slide-in card height-transition ui-container-templates-item <?php echo strtolower($template['parent_template'])?>">
                            <div class="template-info">
                                <h1 class="template-title" style="position: relative; float: left;"><strong> <?php echo $template['display_name']?></strong></h1>
                                <div class="toggle-button template-button-container flex" id="<?php echo $template['parent_template']?>_toggle" style="position: relative; float: right;">
                                    <button onclick="javascript:show_template_bio('<?php echo $template['parent_template']?>')" class="xerte_button_c_no_width template-plus-icon">
                                        <i class="fa fa-plus"></i><span class="sr-only"><?php echo $template['display_name']?></span>
                                    </button>
                                </div>
                                <p class="template-desc" style="width: 100%; position: relative; float: left;"><?php echo$template['description']?></p>
                            </div>
                            <div class="template-button-container hide" id="<?php echo $template['parent_template']?>">
                                <form class="template_form" action="javascript:create_tutorial('<?php echo $template['parent_template'] ?>')" method='post' enctype='text/plain'>
                                    <?php
                                    if (count($derived) == 1) {
                                        ?>
                                        <input type="hidden" id="<?php echo $template['template_name']; ?>_templatename"
                                               name="templatename" value="<?php echo $template['template_name']; ?>"/>
                                        <?php
                                    } else {
                                        ?>
                                        <label for="<?php echo $template['template_name']; ?>_templatename" class="sr-only"><?php echo DISPLAY_TEMPLATE; ?></label>
                                        <select id="<?php echo $template['template_name']; ?>_templatename" name="templatename"
                                                class="select_template form-select" onchange="javascript:setup_example('<?php echo $template["template_name"]; ?>_templatename')">

                                            <?php
                                            foreach ($derived as $row) {
                                                ?>
                                                <option value="<?php echo $row['template_name']; ?>" <?php ($row['template_name'] == $row['parent_template'] ? "\"selected\"" : ""); ?> ><?php echo($row['template_name'] == $row['parent_template'] ? DISPLAY_DEFAULT_TEMPLATE : $row['display_name']); ?></option>
                                                <?php
                                            }
                                            ?>
                                        </select>
                                        <?php
                                    }
                                    ?>
                                    <div class="d-flex flex-row">
                                        <input type="hidden" id="<?php echo $template['template_name']; ?>_templatename"
                                               name="templatename" value="<?php echo $template['template_name']; ?>"/>
                                        <label for="<?php echo $template['template_name']; ?>_filename" class="sr-only"><?php echo DISPLAY_PROJECT_NAME; ?></label>
                                        <input  type='text' class='form-control w-75 form-input' id='<?php echo $template['template_name']?>_filename' name='templatename'>
                                        <button id="<?php echo $template['template_name']?> _button" type="submit" class="xerte_button_c_no_width template-plus-icon">
                                            <i class="fa fa-plus"></i><span class="sr-only"><?php echo $template['display_name']?></span>
                                        </button>
                                    </div>

                                </form>

                            </div>
                        </div>

                        <?php
                    }
                }
                ?>
            </div>
            <script>
                function myFunction() {
                    var element = document.getElementsByClassName("ui-container-templates");
                    element.style.Height = "600px";
                }
            </script>

            <div class="card green-opacity-50 green-border" id="ui-container-buttons">
                <div class="file_mgt_area_left">
                    <button title="<?php echo INDEX_BUTTON_EDIT; ?>" type="button" class="xerte_workspace_button disabled" disabled="disabled"
                            id="edit"><i class="fa fa-pencil-square-o xerte-icon" style="color: #FFFFFF;"></i>Edit</button>
                    <button title="<?php echo INDEX_BUTTON_PROPERTIES; ?>" type="button" class="xerte_workspace_button disabled" disabled="disabled"
                            id="properties"><i class="fa fa-info-circle xerte-icon" style="color: #FFFFFF;"></i>Properties</button>
                    <button title="<?php echo INDEX_BUTTON_PREVIEW; ?>" type="button" class="xerte_workspace_button disabled" disabled="disabled"
                            id="preview"><i class="fa fa-play xerte-icon" style="color: #FFFFFF;"></i> Preview</button>
                </div>

                <div class="file_mgt_area_left">
                    <button title="<?php echo INDEX_BUTTON_NEWFOLDER; ?>" type="button" class="xerte_workspace_button" id="newfolder" data-toggle="modal" data-target="#MakeFolder" aria-expanded="false">
                        <i class="fa fa-folder xerte-icon"></i>New folder
                    </button>
                </div>

                <div class="file_mgt_area_right">
                    <button title="<?php echo INDEX_BUTTON_DELETE; ?>" type="button" class="xerte_workspace_button disabled" disabled="disabled"
                            id="delete"><i class="fa  fa-trash xerte-icon" style="color: #FFFFFF;"></i>Delete</button>
                    <button title="<?php echo INDEX_BUTTON_DUPLICATE; ?>" type="button" class="xerte_workspace_button disabled" disabled="disabled"
                            id="duplicate"><i class="fa fa-copy xerte-icon" style="color: #FFFFFF;"></i>Duplicate</button>
                    <button title="<?php echo INDEX_BUTTON_PUBLISH; ?>" type="button" class="xerte_workspace_button disabled" disabled="disabled"
                            id="publish"><i class="fa  fa-share xerte-icon" style="color: #FFFFFF;"></i>Publish</button>
                </div>
            </div>
            <!-- <div class="card" id="ui-container-preview">

             </div>-->

            <div class="ui-container-information">
                <div class="card no-bg-color ui-container-general-information preview green-border" id="ui-container-details">
                    <div class="card-header information-header">
                        <h5 class="information-title"><strong>Preview</strong></h5>
                    </div>
                    <div class="card-body green-opacity-50">
                        <iframe id="preview_iframe" src="" style=" margin-left:10%;  width: 600px; height: 305px; top: 160px" title="test">

                        </iframe>

                    </div>
                </div>
                <div class="d-flex ui-container-detailed-information flex-column">
                    <div class="card details no-bg-color ui-container-general-information green-border" id="ui-container-shared">
                        <div class="card-header information-header">
                            <h5 class="information-title"><strong>Project details</strong></h5>
                        </div>
                        <div class="card-body green-opacity-50">
                            <nav>
                                <div class="nav nav-tabs nav-fill no-transparency" id="nav-tab" role="tablist">
                                    <a class="nav-item nav-link active" id="nav-home-tab" data-toggle="tab" href="#general" role="tab" aria-controls="nav-home" aria-selected="true">General details</a>
                                    <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#project_shared" role="tab" aria-controls="nav-profile" aria-selected="false">Project shared</a>
                                </div>
                            </nav>
                            <div class="tab-content py-3 px-3 px-sm-0" id="nav-tabContent">
                                <div class="tab-pane fade show active" id="general" role="tabpanel" aria-labelledby="nav-general-tab">
                                    <div class="projectInformationContainer" id="project_information">

                                    </div>
                                </div>
                                <div class="tab-pane fade" id="project_shared" role="tabpanel" aria-labelledby="nav-shared-tab">
                                </div>

                            </div>
                        </div>
                    </div>
                    <div class="card card-body green-opacity-50 ui-container-general-information green-border" id="project_graph">
                        <p>
                            Test tekst voor in de graph container.
                        </p>
                    </div>
                </div>
            </div>

            <div class="ui-help">
                <div class="card no-bg-color ui-container-general-help preview flex1-1 green-border" id="ui-container-details">
                    <div class="card-body green-opacity-50">
                        <?PHP echo apply_filters('editor_pod_one', $xerte_toolkits_site->pod_one); ?>
                    </div>
                </div>
                <div class="card no-bg-color ui-container-general-help preview flex1-1 green-border" id="ui-container-details">
                    <div class="card-body green-opacity-50">
                        <?PHP echo apply_filters('editor_pod_two', $xerte_toolkits_site->pod_two); ?>
                    </div>
                </div>
                <div class="card no-bg-color ui-container-general-help flex1-1 green-border" id="ui-container-details">
                    <div class="card-body green-opacity-50">
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

    $("#preview_iframe").on("load", function() {
        let head = $("#preview_iframe").contents().find("head");
        let css = '<link rel="stylesheet" href="workbench_themes/dlearning/theme.css" type="text/css"/>';
        $(head).append(css);
    });
    
</script>
<?php body_end(); ?></body>
</html>
<?php shutdown(); ?>