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
 *
 *
 *
 *
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

if(isset($_SESSION['theme'])){
    require_once(dirname(__FILE__) . "/workbench_themes/". $_SESSION['theme'] ."/index.php");
}else{
    require_once(dirname(__FILE__) . "/workbench_themes/xerte/index.php");
}


/*
 * Output the main page, including the user's and blank templates
 */

