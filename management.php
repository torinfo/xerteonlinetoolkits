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
require_once(dirname(__FILE__) . "/website_code/php/language_library.php");

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
			<link rel="stylesheet" type="text/css" href="modules/xerte/parent_templates/Nottingham/common_html5/font-awesome-4.3.0/css/font-awesome.min.css">
            <link href='website_code/styles/management.css' rel='stylesheet' type='text/css'>
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

            <header class="topbar">
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
                    <img src="<?php echo "branding/logo_left.png";?>" style="margin-left:10px; float:left" alt="<?php echo MANAGEMENT_LOGO_ALT; ?>"/>
                <?php
                }
                else {
                ?>
                    <img src="website_code/images/logo.png" style="margin-left:10px; float:left" alt="<?php echo MANAGEMENT_LOGO_ALT; ?>"/>
                <?php
                }
                ?>
            </header>




			<main class="mainbody">
				<div class="title_holder">
					<h1 class="title_welcome">
						<?PHP echo $xerte_toolkits_site->welcome_message; ?>
					</h1>
					<div class="mainbody_holder">
						<div style="margin:0 7px 4px 0"><?PHP echo MANAGEMENT_LOGIN; ?></div>
						<form method="post" enctype="application/x-www-form-urlencoded" >
							<p style="margin:4px"><label for="login_box"><?PHP echo MANAGEMENT_USERNAME; ?>:</label>
							<input class="xerte_input_box" type="text" size="20" maxlength="100" name="login" id="login_box"/></p>
							<p style="margin:4px"><label for="password"><?PHP echo MANAGEMENT_PASSWORD; ?>:</label>
							<input class="xerte_input_box" type="password" size="20" maxlength="100" name="password" id="password"/></p>
							<button type="submit" class="xerte_button" style="margin:0 3px 0 0"><i class="fa fa-sign-in"></i> <?php echo MANAGEMENT_BUTTON_LOGIN; ?></button>
						</form>
						<script>document.getElementById("login_box").focus();</script>
						<!--<p><?PHP echo $extra; ?></p>-->
					</div>
				</div>
					<div style="clear:both;"></div>
			</main>

			<div class="bottompart">
				<div class="border"></div>
				<footer>
					<p class="copyright">
						<?php echo $xerte_toolkits_site->copyright; ?> <i class="fa fa-info-circle" aria-hidden="true" style="color:#f86718; cursor: help;" title="<?PHP $vtext = "version.txt";$lines = file($vtext);echo $lines[0];?>"></i>
					</p>
					<div class="footerlogos">
						<a href="https://xot.xerte.org.uk/play.php?template_id=214#home" target="_blank" title="Xerte accessibility statement https://xot.xerte.org.uk/play.php?template_id=214"><img src="website_code/images/wcag2.1AA-blue-v.png" border="0" alt="<?php echo MANAGEMENT_WCAG_LOGO_ALT; ?>"></a><a href="https://opensource.org/" target="_blank" title="Open Source Initiative: https://opensource.org/"><img src="website_code/images/osiFooterLogo.png" border="0" alt="<?php echo MANAGEMENT_OSI_LOGO_ALT; ?>"></a><a href="https://www.apereo.org" target="_blank" title="Apereo: https://www.apereo.org"><img src="website_code/images/apereoFooterLogo.png" border="0" alt="<?php echo MANAGEMENT_APEREO_LOGO_ALT; ?>"></a><a href="https://xerte.org.uk" target="_blank" title="Xerte: https://xerte.org.uk"><img src="website_code/images/xerteFooterLogo.png" border="0" alt="<?php echo MANAGEMENT_XERTE_LOGO_ALT; ?>"></a>
					</div>
				</footer>
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

            <div id="managementContainer">
                <iframe id="upload_iframe" name="upload_iframe" src="" style="width:0px;height:0px; display:none;"></iframe>

                <div class="white_topbar">
                    <div class="topbar-section">

                        <div class="Profile">
                            <img src="media/download.jpg">
                        </div>

                        <div class="dropdown">
                            <form action="#">
                                <label for="lang"></label>
                                <select name="languages" id="lang">
                                    <option class="drop"  value="Nederlands">Nederlands</option>
                                    <option class="drop" value="Engels">Engels</option>
                                </select>
                            </form>
                        </div>

                        <script>
                            $(document).ready(function() {
                                $('#lang').change(function() {
                                    document.title = $(this).val();
                                });
                            });

                        </script>

                        <?php display_language_selectionform_extra("", false) ?>



                        <div id="toggle-switch">
                            <label class="switch">
                                <input id="themeSwitch" type="checkbox">
                                <span class="slider round"></span>
                            </label>

                        </div>

                        <script>
                            const toggleSwitch = document.getElementById('themeSwitch');

                            function switchTheme(e) {
                                if (e.target.checked) {
                                    document.documentElement.setAttribute('data-theme', 'dark');
                                    localStorage.setItem('theme', 'dark');
                                } else {
                                    document.documentElement.setAttribute('data-theme', 'light');
                                    localStorage.setItem('theme', 'light');
                                }
                            }

                            toggleSwitch.addEventListener('change', switchTheme, false);

                        </script>


                    </div>
                </div>

                <div class="block">
                    <div class="block-header">
                        <h3 id="content-header" > </h3>

                    </div>
                    <div id="admin_area">
                    </div>

                </div>

                <div class="sidebar">
                    <div class="background_logo" id="logoContainer">
                        <img id="logo_top_left" src="media/xerte-logo.png" width="100px" height="50px">
                    </div>
                    <div class="xerte-buttons-container">
                        <button type="button" id="button-site" class="xerte-button" onclick="javascript:site_list();"><div class="icon-1"><i class="fa fa-sitemap"></i></div> <?PHP echo MANAGEMENT_MENUBAR_SITE; ?>	</button>
                        <button type="button" id="button-template" class="xerte-button"><div class="icon-2"><i class="fa fa-file-code-o"></i></div><?PHP echo MANAGEMENT_MENUBAR_CENTRAL; ?>	</button>
                        <button type="button" id="button-gebruikers" class="xerte-button" onclick="javascript:users_list();"><div class="icon-3"><i class="fa fa-users-cog"></i></div> <?PHP echo MANAGEMENT_MENUBAR_USERS; ?>	</button>
                        <button type="button" id="button-groepen" class="xerte-button" onclick="javascript:user_groups_list();"><div class="icon-4"><i class="fa fa-users"></i></div> <?PHP echo MANAGEMENT_MENUBAR_USER_GROUPS; ?>	</button>
                        <button type="button" id="button-gebruikerslo" class="xerte-button" onclick="javascript:user_templates_list();"><div class="icon-5"><i class="far fa-file-alt"></i></div> <?PHP echo MANAGEMENT_MENUBAR_TEMPLATES; ?>	</button>
                        <button type="button" id="button-logs" class="xerte-button" onclick="javascript:errors_list();"><div class="icon-6"> <i class="fa fa-exclamation-triangle"></i></div> <?PHP echo MANAGEMENT_MENUBAR_LOGS; ?>	</button>
                        <button type="button" id="button-toegang" class="xerte-button" onclick="javascript:play_security_list();"><div class="icon-7"><i class="fa fa-key"></i></div> <?PHP echo MANAGEMENT_MENUBAR_PLAY; ?>	</button>
                        <button type="button" id="button-categorie" class="xerte-button" onclick="javascript:categories_list();"><div class="icon-8"><i class="fa fa-list-ul"></i></div> <?PHP echo MANAGEMENT_MENUBAR_CATEGORIES; ?>	</button>
                        <button type="button" id="button-educations" class="xerte-button" onclick="javascript:educationlevel_list();"><div class="icon-9"><i class="fa fa-list-ul"></i></div> <?PHP echo MANAGEMENT_MENUBAR_EDUCATION; ?>	</button>
                        <button type="button" id="button-groeperingen" class="xerte-button" onclick="javascript:grouping_list();"><div class="icon-10"><i class="fa fa-list-ul"></i></div> <?PHP echo MANAGEMENT_MENUBAR_GROUPINGS; ?>	</button>
                        <button type="button" id="button-cursussen" class="xerte-button" onclick="javascript:course_list();"><div class="icon-11"><i class="fa fa-list-ul"></i><div> <?PHP echo MANAGEMENT_MENUBAR_COURSES; ?>	</button>
                        <button type="button" id="button-licentie" class="xerte-button" onclick="javascript:licenses_list();"><div class="icon-12"><i class="fa fa-cc"></i></div> <?PHP echo MANAGEMENT_MENUBAR_LICENCES; ?>	</button>
                        <button type="button" id="button-feed"  class="xerte-button" onclick="javascript:feeds_list();"><div class="icon-13"><i class="fa fa-rss"></i></div> <?PHP echo MANAGEMENT_MENUBAR_FEEDS; ?>	</button>
                    </div>

                </div>


                <script>


                    document.addEventListener('click', function(event) {
                        if(event.target.classList.contains('xerte-button')) {
                            var id = event.target.id;
                            var newContent;
                            switch(id) {
                                case 'button-site':
                                    newContent = "Site";
                                    break

                                case 'button-template':
                                    newContent = "Template";
                                    break;

                                case 'button-gebruikers':
                                    newContent = "Gebruikers";
                                    break;

                                case 'button-groepen':
                                    newContent = "Groepen";
                                    break;

                                case 'button-gebruikerslo':
                                    newContent = "Gebruikers LO";
                                    break;

                                case 'button-logs':
                                    newContent = "Logs";
                                    break;

                                case 'button-toegang':
                                    newContent = "Toegang";
                                    break;

                                case 'button-categorie':
                                    newContent = "Categorie";
                                    break;

                                case 'button-educations':
                                    newContent = "Educations";
                                    break;

                                case 'button-groeperingen':
                                    newContent = "Groepering";
                                    break;

                                case 'button-cursussen':
                                    newContent = "Cursussen";
                                    break;

                                case 'button-licentie':
                                    newContent = "Licentie";
                                    break;

                                case 'button-feed':
                                    newContent = "Feed";
                                    break;
                                // Add cases for all other buttons
                            }
                            document.getElementById("content-header").innerHTML = newContent;
                        }
                    });


                    // document.getElementById('button-site').onclick = function()
                    // {
                    //     document.getElementById("content-header").innerHTML = "Site";
                    // };
                    //
                    // document.getElementById('button-template').onclick = function()
                    // {
                    //     document.getElementById("content-header").innerHTML = "Template";
                    // };
                    //
                    // document.getElementById('button-gebruikers').onclick = function()
                    // {
                    //     document.getElementById("content-header").innerHTML = "Gebruikers";
                    // };
                    //
                    // document.getElementById('button-groepen').onclick = function()
                    // {
                    //     document.getElementById("content-header").innerHTML = "Groepen";
                    // };
                    //
                    // document.getElementById('button-gebruikerslo').onclick = function()
                    // {
                    //     document.getElementById("content-header").innerHTML = "Gebruikers LO";
                    // };
                    //
                    // document.getElementById('button-logs').onclick = function()
                    // {
                    //     document.getElementById("content-header").innerHTML = "Logs";
                    // };
                    //
                    // document.getElementById('button-toegang').onclick = function()
                    // {
                    //     document.getElementById("content-header").innerHTML = "Toegang";
                    // };
                    //
                    // document.getElementById('button-categorie').onclick = function()
                    // {
                    //     document.getElementById("content-header").innerHTML = "Categorie";
                    // };
                    //
                    // document.getElementById('button-educations').onclick = function()
                    // {
                    //     document.getElementById("content-header").innerHTML = "Educations";
                    // };
                    //
                    // document.getElementById('button-groeperingen').onclick = function()
                    // {
                    //     document.getElementById("content-header").innerHTML = "Groeperingen";
                    // };
                    //
                    //
                    // document.getElementById('button-cursussen').onclick = function()
                    // {
                    //     document.getElementById("content-header").innerHTML = "Cursussen";
                    // };
                    //
                    //
                    // document.getElementById('button-licentie').onclick = function()
                    // {
                    //     document.getElementById("content-header").innerHTML = "Licentie";
                    // };
                    //
                    //
                    // document.getElementById('button-feed').onclick = function()
                    // {
                    //     document.getElementById("content-header").innerHTML = "Feed";
                    // };




                </script>


                <div id="button-site-menu" class="menu">
                    <div class="space-top">
                        <a href="#" onclick="javascript:site_display('siteSettings')" >Site settings (HTML/Images)</a>
                        <a href="#" onclick="javascript:site_display('serverdetails')"> Server Settings</a>
                        <a href="#" onclick="javascript:site_display('rssdetails')"> RSS settings</a>
                        <a href="#" onclick="javascript:site_display('pathdetails')">Path settings</a>
                        <a href="#" onclick="javascript:site_display('sqldetails')">SQL query settings</a>
                        <a href="#" onclick="javascript:site_display('errordetails')">Error handling settings</a>
                        <a href="#" onclick="javascript:site_display('authdetails')">Authentication settings</a>
                        <a href="#" onclick="javascript:site_display('ldapdetails')">LDAP settings </a>
                        <a href="#" onclick="javascript:site_display('xertedetails')">Xerte settings</a>
                        <a href="#" onclick="javascript:site_display('emaildetails')">Email</a>
                        <a href="#" onclick="javascript:site_display('languagedetails')">Language settings</a>
                        <a href="#" onclick="javascript:site_display('xapidetails')">xAPI settings</a>
                        <a href="#" onclick="javascript:site_display('socialicondetails')">Social Icon settings</a>
                        <a href="#" onclick="javascript:site_display('ltidetails')">LT/Moodle settings</a>
                    </div>
                </div>

                <div id="button-template-menu" class="menu">
                    <div class="space-top">
                        <a href="#" onclick="javascript:template_display('sub-templates')">Sub-Templates</a>
                    </div>
                </div>

                <div id="button-gebruikers-menu" class="menu">
                    <div class="space-top">
                        <a href="#">Guest User</a>
                    </div>
                </div>

                <div id="button-groepen-menu" class="menu">
                    <div class="space-top">
                        <a href="#">Manage Groups</a>
                    </div>
                </div>

                <div id="button-gebruikerslo-menu" class="menu">
                    <div class="space-top">
                        <a href="#">Projects</a>
                    </div>
                </div>

                <div id="button-logs-menu" class="menu">
                    <div class="space-top">
                        <a href="#">Log files</a>

                    </div>
                </div>

                <div id="button-toegang-menu" class="menu">
                    <div class="space-top">
                        <a href="#">Add new settings</a>
                        <a href="#">Manage existing settings</a>
                    </div>
                </div>

                <div id="button-categorie-menu" class="menu">
                    <div class="space-top">
                        <a href="#">Add new categorie</a>
                        <a href="#">Manage existing categorie</a>
                    </div>
                </div>

                <div id="button-educations-menu" class="menu">
                    <div class="space-top">
                        <a href="#">Add new education level</a>
                        <a href="#">Manage existing education levels</a>
                    </div>
                </div>

                <div id="button-groeperingen-menu" class="menu">
                    <div class="space-top">
                        <a href="#">Manage groups</a>
                    </div>
                </div>

                <div id="button-cursussen-menu" class="menu">
                    <div class="space-top">
                        <a href="#">Add new education level</a>
                        <a href="#">Manage existing education levels</a>
                    </div>
                </div>

                <div id="button-licentie-menu" class="menu">
                    <div class="space-top">
                        <a href="#">Licenses</a>
                    </div>
                </div>

                <div id="button-feed-menu" class="menu">
                    <div class="space-top">
                        <a href="#">Feed</a>
                    </div>
                </div>




                <script>

                    $(".xerte-button").each(function (index, element){
                        $("#"+$(this).attr('id')+"-menu").addClass('hide');
                        $(this).on("click", function(){
                            var doubleClickElement;
                            $(".xerte-button").each(function (index, element){
                                if($("#"+$(this).attr('id')+"-menu").hasClass("show")){
                                    $("#"+$(this).attr('id')+"-menu").removeClass('show');
                                    $("#"+$(this).attr('id')+"-menu").addClass('hide');
                                    doubleClickElement =  "#"+$(this).attr('id')+"-menu";
                                }

                            })

                            if($("#"+$(this).attr('id')+"-menu").hasClass("show")){
                                $("#"+$(this).attr('id')+"-menu").removeClass('show');
                                $("#"+$(this).attr('id')+"-menu").addClass('hide');
                            }else{
                                if("#"+$(this).attr('id')+"-menu" != doubleClickElement){
                                    $("#"+$(this).attr('id')+"-menu").removeClass('hide');
                                    $("#"+$(this).attr('id')+"-menu").addClass('show');
                                }
                            }

                        });
                    })
                    // $('.xerte-button').click(function(){
                    //     $('.navbar-collapse').toggleClass('show');
                    //     $('.navbar-toggle').toggleClass('hide');
                    // });
                    // $( "#menuButton" ).each(function(index) {
                    //
                    // });
                </script>

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
                            <div class="sign_in_TL m_b_d_2_child">
                                <div class="sign_in_TR m_b_d_2_child">
                                    <h1 class="heading">
                                        <?PHP echo MANAGEMENT_TITLE; ?>
                                    </h1>
                                </div>
                            </div>
                        </div>

                        <div class="admin_mgt_area_middle">
                            <div class="admin_mgt_area_middle_button">

                                <!--

                                    admin area menu

                                -->

                                <div class="admin_mgt_area_middle_button_left">
                                    <button type="button" class="xerte_button" onclick="javascript:site_list();"><i class="fa fa-sitemap"></i> <?PHP echo MANAGEMENT_MENUBAR_SITE; ?>	</button>
                                    <button type="button" class="xerte_button" onclick="javascript:templates_list();"><i class="fa fa-file-code-o"></i> <?PHP echo MANAGEMENT_MENUBAR_CENTRAL; ?>	</button>
                                    <button type="button" class="xerte_button" onclick="javascript:users_list();"><i class="fa fa-users-cog"></i> <?PHP echo MANAGEMENT_MENUBAR_USERS; ?>	</button>
                                    <button type="button" class="xerte_button" onclick="javascript:user_groups_list();"><i class="fa fa-users"></i> <?PHP echo MANAGEMENT_MENUBAR_USER_GROUPS; ?>	</button>
                                    <button type="button" class="xerte_button" onclick="javascript:user_templates_list();"><i class="far fa-file-alt"></i> <?PHP echo MANAGEMENT_MENUBAR_TEMPLATES; ?>	</button>
                                    <button type="button" class="xerte_button" onclick="javascript:errors_list();"><i class="fa fa-exclamation-triangle"></i> <?PHP echo MANAGEMENT_MENUBAR_LOGS; ?>	</button>
                                    <button type="button" class="xerte_button" onclick="javascript:play_security_list();"><i class="fa fa-key"></i> <?PHP echo MANAGEMENT_MENUBAR_PLAY; ?>	</button>
                                    <button type="button" class="xerte_button" onclick="javascript:categories_list();"><i class="fa fa-list-ul"></i> <?PHP echo MANAGEMENT_MENUBAR_CATEGORIES; ?>	</button>
                                    <button type="button" class="xerte_button" onclick="javascript:educationlevel_list();"><i class="fa fa-list-ul"></i> <?PHP echo MANAGEMENT_MENUBAR_EDUCATION; ?>	</button>
                                    <button type="button" class="xerte_button" onclick="javascript:grouping_list();"><i class="fa fa-list-ul"></i> <?PHP echo MANAGEMENT_MENUBAR_GROUPINGS; ?>	</button>
                                    <button type="button" class="xerte_button" onclick="javascript:course_list();"><i class="fa fa-list-ul"></i> <?PHP echo MANAGEMENT_MENUBAR_COURSES; ?>	</button>
                                    <button type="button" class="xerte_button" onclick="javascript:licenses_list();"><i class="fa fa-cc"></i> <?PHP echo MANAGEMENT_MENUBAR_LICENCES; ?>	</button>
                                    <button type="button" class="xerte_button" onclick="javascript:feeds_list();"><i class="fa fa-rss"></i> <?PHP echo MANAGEMENT_MENUBAR_FEEDS; ?>	</button> <!--style="margin-right:10px;"-->
                                </div>
                                <div class="admin_mgt_area_middle_button_right">
                                    <button type="button" class="xerte_button" onclick="javascript:save_changes()"><i class="fa fa-floppy-o"></i> <?PHP echo MANAGEMENT_MENUBAR_SAVE; ?></button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

            </div>

                <!--

                Folder popup is the div that appears when creating a new folder

                -->

                <!--

                    Main part of the page

                -->


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
