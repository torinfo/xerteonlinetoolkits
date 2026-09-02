<?php
/** Personal folder colours and labels for the modern workspace. */

require_once dirname(__FILE__) . '/../folder_status.php';

function folder_organisation_colours()
{
    return array('blue', 'teal', 'green', 'yellow', 'orange', 'red', 'purple', 'pink');
}

function folder_organisation_user_id()
{
    return isset($_SESSION['toolkits_logon_id']) ? (int) $_SESSION['toolkits_logon_id'] : 0;
}

function folder_organisation_can_access($folder_id, $user_id)
{
    return $folder_id > 0 && $user_id > 0 && has_rights_to_this_folder($folder_id, $user_id);
}

function folder_organisation_payload()
{
    global $xerte_toolkits_site;
    $prefix = $xerte_toolkits_site->database_table_prefix;
    $user_id = folder_organisation_user_id();
    $labels = db_query(
        "SELECT label_id, label_name FROM {$prefix}folder_labels WHERE login_id = ? ORDER BY label_name ASC",
        array($user_id)
    );
    $metadata = db_query(
        "SELECT folder_id, colour FROM {$prefix}folder_user_metadata WHERE login_id = ?",
        array($user_id)
    );
    $assignments = db_query(
        "SELECT fla.folder_id, fla.label_id FROM {$prefix}folder_label_assignments fla "
        . "INNER JOIN {$prefix}folder_labels fl ON fl.label_id = fla.label_id WHERE fl.login_id = ?",
        array($user_id)
    );

    // These records contain only the logged-in user's own presentation
    // preferences. The workspace applies them only to folders it already
    // returned as accessible; writes still perform a full access check.
    $folders = array();
    foreach (($metadata ?: array()) as $row) {
        $id = (string) $row['folder_id'];
        $folders[$id] = array('colour' => $row['colour'], 'label_ids' => array());
    }
    foreach (($assignments ?: array()) as $row) {
        $id = (string) $row['folder_id'];
        if (!isset($folders[$id])) {
            $folders[$id] = array('colour' => null, 'label_ids' => array());
        }
        $folders[$id]['label_ids'][] = (int) $row['label_id'];
    }

    return array(
        'colours' => folder_organisation_colours(),
        'labels' => array_map(function ($row) {
            return array('id' => (int) $row['label_id'], 'name' => $row['label_name']);
        }, $labels ?: array()),
        'folders' => $folders,
    );
}

function folder_organisation_normalize_label_name($name)
{
    $name = trim(preg_replace('/\s+/u', ' ', (string) $name));
    if ($name === '' || mb_strlen($name, 'UTF-8') > 100) {
        return false;
    }
    return $name;
}

function folder_organisation_create_label($name)
{
    global $xerte_toolkits_site;
    $name = folder_organisation_normalize_label_name($name);
    if ($name === false) {
        return array('ok' => false, 'status' => 400, 'code' => 'invalid_label', 'message' => 'Label names must contain 1 to 100 characters');
    }
    $prefix = $xerte_toolkits_site->database_table_prefix;
    $user_id = folder_organisation_user_id();
    $exists = db_query_one(
        "SELECT label_id FROM {$prefix}folder_labels WHERE login_id = ? AND label_name = ?",
        array($user_id, $name)
    );
    if ($exists) {
        return array('ok' => false, 'status' => 409, 'code' => 'duplicate_label', 'message' => 'That label already exists');
    }
    $now = date('Y-m-d H:i:s');
    $id = db_query(
        "INSERT INTO {$prefix}folder_labels (login_id, label_name, created_at, updated_at) VALUES (?, ?, ?, ?)",
        array($user_id, $name, $now, $now)
    );
    return $id === false
        ? array('ok' => false, 'status' => 500, 'code' => 'save_failed', 'message' => 'Could not create label')
        : array('ok' => true, 'data' => array('id' => (int) $id, 'name' => $name));
}

function folder_organisation_label_for_user($label_id, $user_id)
{
    global $xerte_toolkits_site;
    return db_query_one(
        "SELECT label_id, label_name FROM {$xerte_toolkits_site->database_table_prefix}folder_labels WHERE label_id = ? AND login_id = ?",
        array($label_id, $user_id)
    );
}

function folder_organisation_rename_label($label_id, $name)
{
    global $xerte_toolkits_site;
    $user_id = folder_organisation_user_id();
    if (!folder_organisation_label_for_user($label_id, $user_id)) {
        return array('ok' => false, 'status' => 404, 'code' => 'label_not_found', 'message' => 'Label not found');
    }
    $name = folder_organisation_normalize_label_name($name);
    if ($name === false) {
        return array('ok' => false, 'status' => 400, 'code' => 'invalid_label', 'message' => 'Label names must contain 1 to 100 characters');
    }
    $prefix = $xerte_toolkits_site->database_table_prefix;
    $duplicate = db_query_one(
        "SELECT label_id FROM {$prefix}folder_labels WHERE login_id = ? AND label_name = ? AND label_id != ?",
        array($user_id, $name, $label_id)
    );
    if ($duplicate) {
        return array('ok' => false, 'status' => 409, 'code' => 'duplicate_label', 'message' => 'That label already exists');
    }
    $ok = db_query(
        "UPDATE {$prefix}folder_labels SET label_name = ?, updated_at = ? WHERE label_id = ? AND login_id = ?",
        array($name, date('Y-m-d H:i:s'), $label_id, $user_id)
    );
    return $ok === false
        ? array('ok' => false, 'status' => 500, 'code' => 'save_failed', 'message' => 'Could not rename label')
        : array('ok' => true, 'data' => array('id' => (int) $label_id, 'name' => $name));
}

function folder_organisation_delete_label($label_id)
{
    global $xerte_toolkits_site;
    $user_id = folder_organisation_user_id();
    if (!folder_organisation_label_for_user($label_id, $user_id)) {
        return array('ok' => false, 'status' => 404, 'code' => 'label_not_found', 'message' => 'Label not found');
    }
    $prefix = $xerte_toolkits_site->database_table_prefix;
    db_query("DELETE FROM {$prefix}folder_label_assignments WHERE label_id = ?", array($label_id));
    $ok = db_query("DELETE FROM {$prefix}folder_labels WHERE label_id = ? AND login_id = ?", array($label_id, $user_id));
    return $ok === false
        ? array('ok' => false, 'status' => 500, 'code' => 'delete_failed', 'message' => 'Could not delete label')
        : array('ok' => true, 'data' => array('deleted' => true));
}

function folder_organisation_save_folder($folder_id, $colour, $label_ids)
{
    global $xerte_toolkits_site;
    $folder_id = (int) $folder_id;
    $user_id = folder_organisation_user_id();
    if (!folder_organisation_can_access($folder_id, $user_id)) {
        return array('ok' => false, 'status' => 403, 'code' => 'forbidden', 'message' => 'No access to this folder');
    }
    $colour = trim((string) $colour);
    if ($colour !== '' && !in_array($colour, folder_organisation_colours(), true)) {
        return array('ok' => false, 'status' => 400, 'code' => 'invalid_colour', 'message' => 'Invalid folder colour');
    }
    if (!is_array($label_ids)) {
        $label_ids = $label_ids === '' || $label_ids === null ? array() : explode(',', (string) $label_ids);
    }
    $prefix = $xerte_toolkits_site->database_table_prefix;
    $requested_ids = array_values(array_filter(array_unique(array_map('intval', $label_ids)), function ($label_id) {
        return $label_id > 0;
    }));
    $owned_rows = db_query("SELECT label_id FROM {$prefix}folder_labels WHERE login_id = ?", array($user_id));
    $owned_ids = array_map(function ($row) {
        return (int) $row['label_id'];
    }, $owned_rows ?: array());
    $owned_lookup = array_fill_keys($owned_ids, true);
    foreach ($requested_ids as $label_id) {
        if (!isset($owned_lookup[$label_id])) {
            return array('ok' => false, 'status' => 400, 'code' => 'invalid_label', 'message' => 'One or more labels are invalid');
        }
    }
    $valid_ids = $requested_ids;

    db_query("DELETE FROM {$prefix}folder_user_metadata WHERE folder_id = ? AND login_id = ?", array($folder_id, $user_id));
    if ($colour !== '') {
        $ok = db_query(
            "INSERT INTO {$prefix}folder_user_metadata (folder_id, login_id, colour, updated_at) VALUES (?, ?, ?, ?)",
            array($folder_id, $user_id, $colour, date('Y-m-d H:i:s'))
        );
        if ($ok === false) {
            return array('ok' => false, 'status' => 500, 'code' => 'save_failed', 'message' => 'Could not save folder colour');
        }
    }
    if ($owned_ids) {
        $placeholders = implode(',', array_fill(0, count($owned_ids), '?'));
        db_query(
            "DELETE FROM {$prefix}folder_label_assignments WHERE folder_id = ? AND label_id IN ({$placeholders})",
            array_merge(array($folder_id), $owned_ids)
        );
    }

    if ($valid_ids) {
        $values = array();
        $insert_params = array();
        foreach ($valid_ids as $label_id) {
            $values[] = '(?, ?)';
            $insert_params[] = $label_id;
            $insert_params[] = $folder_id;
        }
        if (db_query(
            "INSERT INTO {$prefix}folder_label_assignments (label_id, folder_id) VALUES " . implode(', ', $values),
            $insert_params
        ) === false) {
            return array('ok' => false, 'status' => 500, 'code' => 'save_failed', 'message' => 'Could not save folder labels');
        }
    }
    return array('ok' => true, 'data' => array('folder_id' => $folder_id, 'colour' => $colour ?: null, 'label_ids' => $valid_ids));
}
