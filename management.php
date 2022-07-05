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
require_once(dirname(__FILE__) . "/config.php");

_load_language_file("/management.inc");

/**
 *
 * Login page, self posts to become management page
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */
function mgt_page($xerte_toolkits_site, $extra)
{
    ?>
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <title><?PHP echo $xerte_toolkits_site->site_title; ?></title>
            <link rel="icon" href="favicon.ico" type="image/x-icon" />
            <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
            <script type="text/javascript">
    <?PHP
    echo "var site_url = \"" . $xerte_toolkits_site->site_url . "\";\n";

    echo "var site_apache = \"" . $xerte_toolkits_site->apache . "\";\n";

    echo "var properties_ajax_php_path = \"website_code/php/properties/\";\n var management_ajax_php_path = \"website_code/php/management/\";\n var ajax_php_path = \"website_code/php/\";\n";
    ?></script>



            <link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
            <link href="website_code/styles/xerte_buttons.css" media="screen" type="text/css" rel="stylesheet" />

            <!--

            HTML to use to set up the login page
            The {{}} pairs are replaced in the page formatting functions in display library

            Version 1.0

            -->
            <style>
            body {
                background:white;
            }
            </style>

            <?php
            if (file_exists($xerte_toolkits_site->root_file_path . "branding/branding.css"))
            {
                ?>
                <link href='branding/branding.css' rel='stylesheet' type='text/css'>
                <?php
            }
            else {
                ?>
                <?php
            }
            ?>
        </head>

        <body>

            <div class="topbar">
                <?php
                if (file_exists($xerte_toolkits_site->root_file_path . "branding/logo_right.png"))
                {
                ?>
                    <div
                    style="width:50%; height:100%; float:right; position:relative; background-image:url(<?php echo "branding/logo_right.png";?>); background-repeat:no-repeat; background-position:right; margin-right:10px; float:right">
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
                    <img src="<?php echo "branding/logo_left.png";?>" style="margin-left:10px; float:left"/>
                <?php
                }
                else {
                ?>
                    <img src="website_code/images/logo.png" style="margin-left:10px; float:left"/>
                <?php
                }
                ?>
            </div>


						<div class="mainbody">
								<div class="title_holder">
									<div class="title_welcome">
										<?PHP echo $xerte_toolkits_site->welcome_message; ?>
									</div>
									<div class="mainbody_holder">
										<div style="margin:0 7px 4px 0"><?PHP echo MANAGEMENT_LOGIN; ?></div>
										<form method="post" enctype="application/x-www-form-urlencoded" >
										<p style="margin:4px">Username:
										<input class="xerte_input_box" type="text" size="20" maxlength="100" name="login" id="login_box"/></p>
										<p style="margin:4px">Password:
										<input class="xerte_input_box" type="password" size="20" maxlength="100" name="password" /></p>
										<button type="submit" class="xerte_button_c" style="margin:0 3px 0 0"><?php echo "<i class=\"fa fa-sign-in\"></i> ".MANAGEMENT_BUTTON_LOGIN; ?></button>
										</form>
										<script>document.getElementById("login_box").focus();</script>
										<!--<p><?PHP echo $extra; ?></p>-->
									</div>
								</div>
								<div style="clear:both;"></div>
						</div>

						<div class="bottompart">
							<div class="border"></div>
							<p class="copyright">
								<?php echo $xerte_toolkits_site->copyright; ?>
							</p><div class="footerlogos"><a href="https://xot.xerte.org.uk/play.php?template_id=214#home" target="_blank" title="Xerte accessibility statement https://xot.xerte.org.uk/play.php?template_id=214"><img src="website_code/images/wcag2.1AA-blue-v.png" border="0"></a> <a href="https://opensource.org/" target="_blank" title="Open Source Initiative: https://opensource.org/"><img src="website_code/images/osiFooterLogo.png" border="0"></a> <a href="https://www.apereo.org" target="_blank" title="Apereo: https://www.apereo.org"><img src="website_code/images/apereoFooterLogo.png" border="0"></a> <a href="https://xerte.org.uk" target="_blank" title="Xerte: https://xerte.org.uk"><img src="website_code/images/xerteFooterLogo.png" border="0"></a></div>
						</div>
        </body>
    </html>


    <?PHP
}

/*
 * As with index.php, check for posts and similar
 */

if (empty($_POST["login"]) && empty($_POST["password"])) {

    mgt_page($xerte_toolkits_site, MANAGEMENT_USERNAME_AND_PASSWORD_EMPTY);

    /*
     * Password left empty
     */
} else if (empty($_POST["password"])) {

    mgt_page($xerte_toolkits_site, MANAGEMENT_PASSWORD_EMPTY);


    /*
     * Password and username provided, so try to authenticate
     */
} else {

    global $authmech;

    if (!isset($authmech))
    {
        $authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);
    }
    if (isset($_GET['altauth']))
    {
        $xerte_toolkits_site->authentication_method = 'Db';
        $authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);
    }

    if (($_POST["login"] == $xerte_toolkits_site->admin_username) && ($_POST["password"] == $xerte_toolkits_site->admin_password)) {

        $_SESSION['toolkits_logon_id'] = "site_administrator";

        $msg = "Admin user logged in successfully from " . $_SERVER['REMOTE_ADDR'];
        receive_message("", "SYSTEM", "MGMT", "Successful login", $msg);

        $mysql_id = database_connect("management.php database connect success", "management.php database connect fail");

        /*
         * Password and username provided, so try to authenticate
         */
        ?>
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                <title><?PHP echo $xerte_toolkits_site->site_title; ?></title>

                <link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
                <link href="website_code/styles/xerte_buttons.css" media="screen" type="text/css" rel="stylesheet" />
                <!-- Added Bootstrap -->

                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">

                <link href="website_code/styles/management.css" media="screen" type="text/css" rel="stylesheet" />
                <link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/font-awesome-4.3.0/css/font-awesome.min.css">
                <link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/fontawesome-5.6.3/css/all.min.css">
                <link rel="stylesheet" type="text/css" href="website_code/styles/selectize.css">
                <?php
                if (file_exists($xerte_toolkits_site->root_file_path . "branding/branding.css"))
                {
                    ?>
                    <link href='branding/branding.css' rel='stylesheet' type='text/css'>
                    <?php
                }
                else {
                    ?>
                    <?php
                }
                ?>

                <script type="text/javascript">
        <?PHP
        echo "var site_url = \"" . $xerte_toolkits_site->site_url . "\";\n";

        echo "var site_apache = \"" . $xerte_toolkits_site->apache . "\";\n";
        if ($xerte_toolkits_site->altauthentication != "" && isset($_GET['altauth']))
        {
            $xerte_toolkits_site->authentication_method = $xerte_toolkits_site->altauthentication;
            $authmech = Xerte_Authentication_Factory::create($xerte_toolkits_site->authentication_method);
            $_SESSION['altauth'] = $xerte_toolkits_site->altauthentication;
        }

        echo "var properties_ajax_php_path = \"website_code/php/properties/\";\n var management_ajax_php_path = \"website_code/php/management/\";\n var ajax_php_path = \"website_code/php/\";\n";
        ?></script>

                <!--

                HTML to use to set up the login page
                The {{}} pairs are replaced in the page formatting functions in display library

                Version 1.0

                -->
		<?php
                echo "<script type=\"text/javascript\" language=\"javascript\" src=\"" . $xerte_toolkits_site->site_url . "editor/js/vendor/jquery-1.9.1.min.js\"></script>";
                _include_javascript_file("editor/js/vendor/jquery-1.9.1.min.js");
                _include_javascript_file("website_code/scripts/file_system.js");
                _include_javascript_file("website_code/scripts/screen_display.js");
                _include_javascript_file("website_code/scripts/ajax_management.js");
                _include_javascript_file("website_code/scripts/management.js");
                _include_javascript_file("website_code/scripts/import.js");
                _include_javascript_file("website_code/scripts/template_management.js");
                _include_javascript_file("website_code/scripts/logout.js");
                echo "<script type=\"text/javascript\" language=\"javascript\" src=\"" . $xerte_toolkits_site->site_url . "website_code/scripts/selectize.js\"></script>";

                if ($authmech->canManageUser($jsscript))
                {
                    _include_javascript_file($jsscript);
                }
                ?>
                <style>
                body {
                    background:white;
                }
                </style>
            </head>

            <body onload="javascript:site_list()">

                <iframe id="upload_iframe" name="upload_iframe" src="" style="width:0px;height:0px; display:none;"></iframe>

                <!--

                Folder popup is the div that appears when creating a new folder

                -->
                <div class="topbar">
                    <?php
                    if (file_exists($xerte_toolkits_site->root_file_path . "branding/logo_right.png"))
                    {
                        ?>
                        <div
                            style="width:50%; height:100%; float:right; position:relative; background-image:url(<?php echo "branding/logo_right.png";?>); background-repeat:no-repeat; background-position:right; margin-right:10px; float:right">
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
                        <img src="<?php echo "branding/logo_left.png";?>" style="margin-left:10px; float:left"/>
                        <?php
                    }
                    else {
                        ?>
                        <img src="website_code/images/logo.png" style="margin-left:10px; float:left"/>
                        <?php
                    }
                    ?>
                </div>

                <!--

                    Main part of the page

                -->

                <div class="pagecontainer">

                <div class="buttonbar">

                   <div class="userbar">
                        <?php // echo "&nbsp;&nbsp;&nbsp;" . INDEX_LOGGED_IN_AS . " ";
                        echo "Admin"; ?>
                        <button title="<?php echo MANAGEMENT_LOGOUT; ?>"
                            type="button" class="xerte_button_c_no_width"
                            onclick="javascript:logout()" style="margin-bottom: 8px;">
                            <i class="fas fa-sign-out-alt"></i><?php echo MANAGEMENT_LOGOUT; ?>
                        </button>
                    </div>
                    <div style="clear:both;"></div>
                    <div class="separator"></div>
                </div>

                    <div class="admin_mgt_area">
                        <div class="admin_mgt_area_top">
                            <div class="top_left sign_in_TL m_b_d_2_child">
                                <div class="top_right sign_in_TR m_b_d_2_child">
                                    <p class="heading">
        <?PHP echo MANAGEMENT_TITLE; ?>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div class="admin_mgt_area_middle">
                            <div class="admin_mgt_area_middle_button">

                                <!--

                                    admin area menu

                                -->

                                <div class="admin_mgt_area_middle_button_left">
                                    <button type="button" style="margin-left:10px;" class="xerte_button" onclick="javascript:site_list();"><i class="fa fa-sitemap"></i> <?PHP echo MANAGEMENT_MENUBAR_SITE; ?>	</button>
                                    <button type="button" class="xerte_button" onclick="javascript:templates_list();"><i class="fa fa-file-code-o"></i> <?PHP echo MANAGEMENT_MENUBAR_CENTRAL; ?>	</button>
                                    <button type="button" class="xerte_button" onclick="javascript:users_list();"><i class="fa fa-users-cog"></i> <?PHP echo MANAGEMENT_MENUBAR_USERS; ?>	</button>
                                    <button type="button" class="xerte_button" onclick="javascript:user_groups_list();"><i class="fa fa-users"></i> <?PHP echo MANAGEMENT_MENUBAR_USER_GROUPS; ?>	</button>
                                    <button type="button" class="xerte_button" onclick="javascript:user_templates_list();"><i class="far fa-file-alt"></i> <?PHP echo MANAGEMENT_MENUBAR_TEMPLATES; ?>	</button>
                                    <button type="button" class="xerte_button" onclick="javascript:errors_list();"><i class="fa fa-exclamation-triangle"></i> <?PHP echo MANAGEMENT_MENUBAR_LOGS; ?>	</button>
                                    <button type="button" class="xerte_button" onclick="javascript:play_security_list();"><i class="fa fa-key"></i> <?PHP echo MANAGEMENT_MENUBAR_PLAY; ?>	</button>
                                    <button type="button" class="xerte_button" onclick="javascript:categories_list();"><i class="fa fa-list-ul"></i> <?PHP echo MANAGEMENT_MENUBAR_CATEGORIES; ?>	</button>
                                    <button type="button" class="xerte_button" onclick="javascript:grouping_list();"><i class="fa fa-list-ul"></i> <?PHP echo MANAGEMENT_MENUBAR_GROUPINGS; ?>	</button>
                                    <button type="button" class="xerte_button" onclick="javascript:course_list();"><i class="fa fa-list-ul"></i> <?PHP echo MANAGEMENT_MENUBAR_COURSES; ?>	</button>
                                    <button type="button" class="xerte_button" onclick="javascript:licenses_list();"><i class="fa fa-cc"></i> <?PHP echo MANAGEMENT_MENUBAR_LICENCES; ?>	</button>
                                    <button type="button" class="xerte_button" onclick="javascript:feeds_list();"><i class="fa fa-rss"></i> <?PHP echo MANAGEMENT_MENUBAR_FEEDS; ?>	</button> <!--style="margin-right:10px;"-->
                                </div>
                                <div class="admin_mgt_area_middle_button_right">
                                    <button type="button" class="xerte_button" onclick="javascript:save_changes()"><i class="fa fa-floppy-o"></i> <?PHP echo MANAGEMENT_MENUBAR_SAVE; ?></button>
                                </div>
                                <div id="admin_area">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


        <?PHP
    } else {

        /*
         * Wrong username or password message
         */

        if ($_POST["login"] == $xerte_toolkits_site->admin_username) {
            $msg = "Admin user attempted to login from " . $_SERVER['REMOTE_ADDR'];
        }
        else {
            $uid = (empty($_POST["login"])) ? 'UNKNOWN' : $_POST["login"];
            $msg = "User " . $uid . " attempted to login from " . $_SERVER['REMOTE_ADDR'];
        }

        receive_message("", "SYSTEM", "MGMT", "Failed login", $msg);

        mgt_page($xerte_toolkits_site, MANAGEMENT_LOGON_FAIL . " " . MANAGEMENT_NOT_ADMIN_USERNAME);

    }
}
?>
                            </body>
                            </html>
