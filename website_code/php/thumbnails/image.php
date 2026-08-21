<?php

require_once(dirname(__FILE__) . '/../../../config.php');

require_once(
    $xerte_toolkits_site->root_file_path .
    'website_code/php/template_status.php'
);

require_once(
    $xerte_toolkits_site->root_file_path .
    'website_code/php/services/ThumbnailService.php'
);

require_once(
    $xerte_toolkits_site->root_file_path .
    'website_code/php/folder_status.php'
);

require_once(
    $xerte_toolkits_site->root_file_path .
    'website_code/php/user_library.php'
);


/*
 * Must be logged in
 */
if (empty($_SESSION['toolkits_logon_id'])) {
    http_response_code(401);
    exit;
}


$template_id = isset($_GET['template_id'])
    ? (int)$_GET['template_id']
    : 0;

$page_link_id = isset($_GET['page_link_id'])
    ? trim((string)$_GET['page_link_id'])
    : '';

$first = isset($_GET['first'])
    && (string)$_GET['first'] === '1';


if (
    $template_id <= 0 ||
    (!$first && $page_link_id === '')
) {
    http_response_code(400);
    exit;
}

$user_id = (int)$_SESSION['toolkits_logon_id'];

if (
    !has_rights_to_this_template($template_id, $user_id) &&
    !is_user_permitted('projectadmin')
) {
    http_response_code(403);
    exit;
}


if ($first) {

    $thumbnail = thumbnail_service_get_first_image($template_id);

} else {

    $thumbnail = thumbnail_service_get_image(
        $template_id,
        $page_link_id
    );
}


if (
    !$thumbnail ||
    !isset($thumbnail['image_data']) ||
    $thumbnail['image_data'] === ''
) {
    http_response_code(404);
    exit;
}


/*
 * Generate an ETag from the identity and revision of the
 * currently stored thumbnail.
 */
$etag = '"' . sha1(
        $thumbnail['template_id'] .
        '|' .
        $thumbnail['page_link_id'] .
        '|' .
        $thumbnail['revision']
    ) . '"';


$requested_revision = isset($_GET['v'])
    ? trim((string)$_GET['v'])
    : '';


/*
 * Set the caching policy before handling conditional requests,
 * so a 304 response also carries the appropriate cache headers.
 */
if (
    $requested_revision !== '' &&
    $requested_revision === $thumbnail['revision']
) {

    /*
     * Editor URLs identify a specific thumbnail revision.
     *
     * A changed thumbnail will have a different ?v= value,
     * therefore this URL can be cached for a long time.
     */
    header(
        'Cache-Control: private, max-age=31536000, immutable'
    );

} else {

    /*
     * Workspace uses a stable URL such as:
     *
     * image.php?template_id=123&first=1
     *
     * Allow the browser to retain the image, but require
     * revalidation before reuse.
     */
    header(
        'Cache-Control: private, no-cache'
    );
}


header('ETag: ' . $etag);


/*
 * If the browser already has this exact revision, no image
 * body needs to be transmitted.
 */
if (
    isset($_SERVER['HTTP_IF_NONE_MATCH']) &&
    trim($_SERVER['HTTP_IF_NONE_MATCH']) === $etag
) {
    http_response_code(304);
    exit;
}


$mime_type = isset($thumbnail['mime_type'])
    ? $thumbnail['mime_type']
    : 'image/jpeg';


header('Content-Type: ' . $mime_type);
header('X-Content-Type-Options: nosniff');

header(
    'Content-Length: ' .
    strlen($thumbnail['image_data'])
);


echo $thumbnail['image_data'];
exit;