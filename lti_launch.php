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
$tsugi_disable_xerte_session = true;
require_once(dirname(__FILE__) . "/config.php");
require_once($xerte_toolkits_site->tsugi_dir . "/config.php");
require_once(dirname(__FILE__) . "/website_code/php/xAPI/xAPI_library.php");

ini_set('display_errors', 0);
error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED & ~E_STRICT);

use \Tsugi\Core\LTIX;
use \Tsugi\Core\Settings;
use \Tsugi\Util\Net;
use \Tsugi\Grades\GradeUtil;

global $tsugi_enabled;
global $xapi_enabled;
global $lti_enabled;
global $xerte_toolkits_site;
global $x_embed;
global $x_embed_activated;

_debug("LTI launch request: " . print_r($_POST, true));

if (isset($_GET["template_id"])) {
    $id = $_GET["template_id"];
}
else if(isset($_POST["template_id"]))
{
    $id = $_POST["template_id"];
    // Hack for the rest of Xerte
    $_GET['template_id'] = $id;
}
if(is_numeric($id) || $id == null)
{
	$tsugi_enabled = true;
	$lti_enabled = true;
    $LAUNCH = LTIX::requireData();

    if (method_exists($LAUNCH, 'isLTIAdvantage'))
    {
        $islti13 = $LAUNCH->isLTIAdvantage();
    }
    else{
        $islti13 = false;
    }
    if ($islti13) {
        $msg = array();
        $nrps = $LAUNCH->context->loadNamesAndRoles(false, $msg);
    }

    if ($id == null)
    {
        $id = $LAUNCH->ltiCustomGet('template_id');
        if (!is_numeric($id))
        {
            exit;
        }
        // Hack for the rest of Xerte
        $_GET['template_id'] = $id;
    }

    _debug("LTI user: " . print_r($USER, true));
    $xerte_toolkits_site->lti_user = $USER;

    $group = $LAUNCH->ltiParameter('group');
    if ($group === false)
    {
        $group = $LAUNCH->ltiCustomGet('group');
    }
    if ($group===false && isset($_REQUEST['group']))
    {
        $group = $_REQUEST['group'];
    }
    if ($group !== false)
    {
        $xerte_toolkits_site->group = $group;
    }
    $course = $LAUNCH->ltiParameter('course');
    if ($course === false)
    {
        $course = $LAUNCH->ltiCustomGet('course');
    }
    if ($course===false && isset($_REQUEST['course']))
    {
        $course = $_REQUEST['course'];
    }
    if ($course !== false)
    {
        $xerte_toolkits_site->course = $course;
    }
    $module = $LAUNCH->ltiParameter('module');
    if ($module === false)
    {
        $module = $LAUNCH->ltiCustomGet('module');
    }
    if ($module===false && isset($_REQUEST['module']))
    {
        $module = $_REQUEST['module'];
    }
    if ($module !== false)
    {
        $xerte_toolkits_site->module = $module;
    }
    $lticontextid = $LAUNCH->ltiParameter('context_id');
    if ($lticontextid === false)
    {
        $lticontextid = $LAUNCH->ltiCustomGet('context_id');
    }
    if ($lticontextid===false && isset($_REQUEST['context_id']))
    {
        $lticontextid = $_REQUEST['context_id'];
    }
    if ($lticontextid === false)
    {
        $lticontextid = $LAUNCH->context->id;
    }
    if ($lticontextid !== false)
    {
        $xerte_toolkits_site->lti_context_id = $lticontextid;
    }
    $lticontextname = $LAUNCH->ltiParameter('context_title');
    if ($lticontextname === false)
    {
        $lticontextname = $LAUNCH->ltiCustomGet('context_title');
    }
    if ($lticontextname===false && isset($_REQUEST['context_title']))
    {
        $lticontextname = $_REQUEST['context_title'];
    }
    if ($lticontextname === false)
    {
        $lticontextname = $LAUNCH->context->title;
    }
    if ($lticontextname !== false)
    {
        $xerte_toolkits_site->lti_context_name = $lticontextname;
    }

    // Get LRS endpoint and see if xAPI is enabled
    $prefix = $xerte_toolkits_site->database_table_prefix;
    $q = "select * from {$prefix}templatedetails where template_id=?";
    $params = array($id);
    $row = db_query_one($q, $params);
    if ($row === false)
    {
        die("template_id not found");
    }
    if ($row['tsugi_xapi_enabled'] == '1') {
        $xapi_enabled = true;
        if ($row['tsugi_xapi_useglobal']) {
            $q = "select LRS_Endpoint, LRS_Key, LRS_Secret from {$prefix}sitedetails where site_id=1";
            $globalrow = db_query_one($q);
            $lrs = array('lrsendpoint' => $globalrow['LRS_Endpoint'],
                'lrskey' => $globalrow['LRS_Key'],
                'lrssecret' => $globalrow['LRS_Secret'],
            );
        } else {
            $lrs = array('lrsendpoint' => $row['tsugi_xapi_endpoint'],
                'lrskey' => $row['tsugi_xapi_key'],
                'lrssecret' => $row['tsugi_xapi_secret'],
            );
        }
        $lrs = CheckLearningLocker($lrs);

        $_SESSION['XAPI_PROXY'] = $lrs;
    }

    if ($_GET['x_embed'] === 'true') {
        $x_embed = true;
        if ($_GET['activated'] !== 'true') {
            $lti_enabled = false;
            $xapi_enabled = false;
            $x_embed_activated = false;
        } else {
            $x_embed_activated = true;
        }
    }
    require("play.php");
}
?>
