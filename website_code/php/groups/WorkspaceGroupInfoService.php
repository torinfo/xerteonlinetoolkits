<?php

require_once(dirname(__FILE__) . "/../../../config.php");
require_once(dirname(__FILE__) . "/../properties/properties_library.php");

function group_workspace_get_info($group_name, $group_id)
{
    $info = new stdClass();
    $info->group_name = $group_name;
    $info->group_id = $group_id;
    $info->properties = group_info($group_id);
    return $info;
}
