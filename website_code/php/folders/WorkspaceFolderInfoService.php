<?php

require_once(dirname(__FILE__) . "/../../../config.php");

_load_language_file("/website_code/php/properties/media_and_quota_template.inc");
_load_language_file("/website_code/php/properties/sharing_status_template.inc");
_load_language_file("/properties.inc");

require_once(dirname(__FILE__) . "/../display_library.php");
require_once(dirname(__FILE__) . "/../user_library.php");
require_once(dirname(__FILE__) . "/../url_library.php");
require_once(dirname(__FILE__) . "/../properties/properties_library.php");
require_once(dirname(__FILE__) . "/../folder_status.php");

function folder_workspace_get_info($folder_id)
{
    $info = new stdClass();
    $info->folder_id = $folder_id;
    $_SESSION["XAPI_PROXY"] = $folder_id;
    $info->properties = folder_info($folder_id);
    $info->properties .= folder_sharing_info($folder_id);
    $info->role = get_user_access_rights_folder($folder_id);
    return $info;
}
