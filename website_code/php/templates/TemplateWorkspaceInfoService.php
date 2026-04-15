<?php
/**
 * Workspace project panel data for a template (includes legacy HTML fragments in ->properties).
 */

require_once(dirname(__FILE__) . "/../../../config.php");

_load_language_file("/website_code/php/properties/media_and_quota_template.inc");
_load_language_file("/website_code/php/properties/sharing_status_template.inc");
_load_language_file("/properties.inc");

require_once(dirname(__FILE__) . "/../display_library.php");
require_once(dirname(__FILE__) . "/../user_library.php");
require_once(dirname(__FILE__) . "/../template_status.php");
require_once(dirname(__FILE__) . "/../url_library.php");
require_once(dirname(__FILE__) . "/../properties/properties_library.php");

/**
 * @return stdClass
 */
function template_workspace_get_info($template_id)
{
    $info = new stdClass();
    $info->template_id = $template_id;
    $_SESSION["XAPI_PROXY"] = $template_id;
    $info->properties = project_info($template_id);
    $info->properties .= media_quota_info($template_id);
    $info->properties .= access_info($template_id);
    $info->properties .= sharing_info($template_id);
    $info->properties .= rss_syndication($template_id);
    $info->properties .= oai_shared($template_id);

    $statistics_available = statistics_prepare($template_id);

    if ($statistics_available->published) {
        $info->properties .= $statistics_available->linkinfo;
    }

    if ($statistics_available->available) {
        $info->properties .= $statistics_available->xapi_linkinfo;
        $info->properties .= "<li><a target=\"_blank\" href='" . $statistics_available->xapi_url . "'>" . $statistics_available->xapi_url . "</a></li>";
    }
    $info->properties .= $statistics_available->info;
    $info->fetch_statistics = $statistics_available->available;
    if (isset($statistics_available->lrs)) {
        $info->lrs = $statistics_available->lrs;
    } else {
        $info->lrs = "";
    }
    if (isset($statistics_available->dashboard)) {
        $info->dashboard = $statistics_available->dashboard;
    } else {
        $info->dashnoard = "";
    }

    $info->role = get_user_access_rights($template_id);

    return $info;
}
