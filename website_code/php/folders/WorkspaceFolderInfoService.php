<?php

require_once(dirname(__FILE__) . "/../../../config.php");

_load_language_file("/properties.inc");

require_once(dirname(__FILE__) . "/../display_library.php");
require_once(dirname(__FILE__) . "/../user_library.php");
require_once(dirname(__FILE__) . "/../url_library.php");
require_once(dirname(__FILE__) . "/../properties/properties_library.php");
require_once(dirname(__FILE__) . "/../folder_status.php");

function folder_workspace_sharing_payload($folder_id)
{
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;
    $folder_id = (int) $folder_id;
    $current_user_id = isset($_SESSION['toolkits_logon_id']) ? (int) $_SESSION['toolkits_logon_id'] : 0;

    $sql = "SELECT ld.login_id, firstname, surname, username, role FROM "
        . " {$prefix}folderrights fr, {$prefix}logindetails ld WHERE "
        . " ld.login_id = fr.login_id and folder_id = ? AND fr.login_id != ?";
    $query_sharing_rows = db_query($sql, array($folder_id, $current_user_id));

    $sqlg = "SELECT ug.group_id, group_name, role FROM "
        . " {$prefix}folder_group_rights fgr, {$prefix}user_groups ug WHERE "
        . " fgr.group_id = ug.group_id and folder_id = ?";
    $query_sharing_rows_group = db_query($sqlg, array($folder_id));

    $users = array();
    foreach ($query_sharing_rows as $row) {
        $users[] = array(
            'userId' => $row['login_id'],
            'firstname' => $row['firstname'],
            'surname' => $row['surname'],
            'username' => $row['username'],
            'role' => $row['role'],
        );
    }

    $groups = array();
    foreach ($query_sharing_rows_group as $row) {
        $groups[] = array(
            'groupId' => $row['group_id'],
            'name' => $row['group_name'],
            'role' => $row['role'],
        );
    }

    return array(
        'users' => $users,
        'groups' => $groups,
        'empty' => (sizeof($query_sharing_rows) === 0 && sizeof($query_sharing_rows_group) === 0),
    );
}

function folder_workspace_get_info($folder_id)
{
    $folder_id = (int) $folder_id;
    $_SESSION["XAPI_PROXY"] = $folder_id;

    // JSON payload for workspace folder expand (no HTML fragments).
    // Full sharing management remains in folder properties.
    $prefix = $GLOBALS['xerte_toolkits_site']->database_table_prefix;
    $row = db_query_one("select folder_name, date_created, date_modified from {$prefix}folderdetails where folder_id=?", array($folder_id));

    return array(
        'folder_id' => $folder_id,
        'name' => ($row && isset($row['folder_name'])) ? str_replace('_', ' ', $row['folder_name']) : '',
        'date_created' => ($row && isset($row['date_created'])) ? $row['date_created'] : null,
        'date_modified' => ($row && isset($row['date_modified'])) ? $row['date_modified'] : null,
        'role' => get_user_access_rights_folder($folder_id),
        'sharing' => folder_workspace_sharing_payload($folder_id),
    );
}
