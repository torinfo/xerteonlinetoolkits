<?php

/**
 * Thumbnail cache storage service.
 */

function thumbnail_service_table()
{
    global $xerte_toolkits_site;

    return $xerte_toolkits_site->database_table_prefix . 'template_thumbnails';
}


/**
 * Store or replace one JPEG thumbnail.
 */
function thumbnail_service_store($template_id, $page_link_id, $page_index, $revision, $image)
{
    $template_id = (int)$template_id;
    $page_link_id = trim((string)$page_link_id);
    $page_index = (int)$page_index;
    $revision = trim((string)$revision);

    if ($template_id <= 0) {
        return array(
            'ok' => false,
            'code' => 'invalid_template_id',
            'message' => 'Invalid template id'
        );
    }

    if ($page_link_id === '' || strlen($page_link_id) > 255) {
        return array(
            'ok' => false,
            'code' => 'invalid_page_link_id',
            'message' => 'Invalid page id'
        );
    }

    if ($revision === '' || strlen($revision) > 64) {
        return array(
            'ok' => false,
            'code' => 'invalid_revision',
            'message' => 'Invalid revision'
        );
    }

    /*
     * only accept the JPEG
     * produced by editor-thumbnails.js.
     */
    if (
        !is_string($image) ||
        strpos($image, 'data:image/jpeg;base64,') !== 0
    ) {
        return array(
            'ok' => false,
            'code' => 'invalid_image',
            'message' => 'Expected a JPEG data URL'
        );
    }

    $base64 = substr(
        $image,
        strlen('data:image/jpeg;base64,')
    );

    $binary = base64_decode($base64, true);

    if ($binary === false || $binary === '') {
        return array(
            'ok' => false,
            'code' => 'invalid_image',
            'message' => 'Unable to decode thumbnail'
        );
    }

    /*
     * A 320x180 JPEG should be tiny compared with this.
     */
    if (strlen($binary) > 2 * 1024 * 1024) {
        return array(
            'ok' => false,
            'code' => 'image_too_large',
            'message' => 'Thumbnail exceeds maximum size'
        );
    }

    $table = thumbnail_service_table();

    /*
     * Check whether this page already has a cached thumbnail.
     */
    $existing = db_query_one(
        "SELECT id
     FROM `$table`
     WHERE template_id = ?
     AND page_link_id = ?
     LIMIT 1",
        array(
            $template_id,
            $page_link_id
        )
    );

    if ($existing) {

        $result = db_query(
            "UPDATE `$table`
         SET
            page_index = ?,
            revision = ?,
            mime_type = ?,
            image_data = ?,
            width = ?,
            height = ?,
            updated_at = CURRENT_TIMESTAMP
         WHERE id = ?",
            array(
                $page_index,
                $revision,
                'image/jpeg',
                $binary,
                320,
                180,
                (int)$existing['id']
            )
        );

    } else {

        $result = db_query(
            "INSERT INTO `$table`
        (
            template_id,
            page_link_id,
            page_index,
            revision,
            mime_type,
            image_data,
            width,
            height
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            array(
                $template_id,
                $page_link_id,
                $page_index,
                $revision,
                'image/jpeg',
                $binary,
                320,
                180
            )
        );
    }

    if ($result === false) {
        return array(
            'ok' => false,
            'code' => 'database_error',
            'message' => 'Unable to store thumbnail'
        );
    }

    return array(
        'ok' => true,
        'template_id' => $template_id,
        'page_link_id' => $page_link_id,
        'page_index' => $page_index,
        'revision' => $revision,
        'bytes' => strlen($binary)
    );
}

/**
 * Return metadata for all cached thumbnails belonging to an LO.
 *
 * Image BLOBs are deliberately not returned here.
 */
function thumbnail_service_get_status($template_id)
{
    $template_id = (int)$template_id;

    if ($template_id <= 0) {
        return array(
            'ok' => false,
            'code' => 'invalid_template_id',
            'message' => 'Invalid template id'
        );
    }

    $table = thumbnail_service_table();

    $rows = db_query(
        "SELECT
            page_link_id,
            page_index,
            revision,
            mime_type,
            width,
            height,
            updated_at
         FROM `$table`
         WHERE template_id = ?
         ORDER BY page_index ASC",
        array($template_id)
    );

    if ($rows === false) {
        return array(
            'ok' => false,
            'code' => 'database_error',
            'message' => 'Unable to load thumbnail metadata'
        );
    }

    return array(
        'ok' => true,
        'thumbnails' => $rows
    );
}

/**
 * Retrieve one stored thumbnail.
 */
function thumbnail_service_get_image($template_id, $page_link_id)
{
    $template_id = (int)$template_id;
    $page_link_id = trim((string)$page_link_id);

    if ($template_id <= 0 || $page_link_id === '') {
        return false;
    }

    $table = thumbnail_service_table();

    return db_query_one(
        "SELECT
            template_id,
            page_link_id,
            page_index,
            revision,
            mime_type,
            image_data,
            width,
            height,
            updated_at
         FROM `$table`
         WHERE template_id = ?
         AND page_link_id = ?
         LIMIT 1",
        array(
            $template_id,
            $page_link_id
        )
    );
}

/**
 * Delete one cached page thumbnail.
 */
function thumbnail_service_delete($template_id, $page_link_id)
{
    $template_id = (int)$template_id;
    $page_link_id = trim((string)$page_link_id);

    if ($template_id <= 0 || $page_link_id === '') {
        return false;
    }

    $table = thumbnail_service_table();

    $result = db_query(
        "DELETE FROM `$table`
         WHERE template_id = ?
         AND page_link_id = ?",
        array(
            $template_id,
            $page_link_id
        )
    );

    return $result !== false;
}


/**
 * Delete every cached thumbnail belonging to an LO.
 *
 * Used when a global presentation setting such as the theme changes.
 */
function thumbnail_service_delete_all($template_id)
{
    $template_id = (int)$template_id;

    if ($template_id <= 0) {
        return false;
    }

    $table = thumbnail_service_table();

    $result = db_query(
        "DELETE FROM `$table`
         WHERE template_id = ?",
        array(
            $template_id
        )
    );

    return $result !== false;
}

/**
 * Retrieve the first cached page thumbnail for an LO.
 *
 * Used by the workspace as the learning object's thumbnail.
 */
function thumbnail_service_get_first_image($template_id)
{
    $template_id = (int)$template_id;

    if ($template_id <= 0) {
        return false;
    }

    $table = thumbnail_service_table();

    return db_query_one(
        "SELECT
            template_id,
            page_link_id,
            page_index,
            revision,
            mime_type,
            image_data,
            width,
            height,
            updated_at
         FROM `$table`
         WHERE template_id = ?
         ORDER BY page_index ASC
         LIMIT 1",
        array($template_id)
    );
}