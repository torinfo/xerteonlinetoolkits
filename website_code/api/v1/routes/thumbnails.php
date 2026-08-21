<?php

global $xerte_toolkits_site;

require_once(
    $xerte_toolkits_site->root_file_path .
    'website_code/php/services/ThumbnailService.php'
);

require_once(
    $xerte_toolkits_site->root_file_path .
    'website_code/php/template_status.php'
);

require_once(
    $xerte_toolkits_site->root_file_path .
    'website_code/php/user_library.php'
);


function thumbnails_rest_api_dispatch($method, $path, array $params)
{
    /*
     * POST thumbnails/store
     */
    if ($method === 'POST' && $path === 'thumbnails/store') {

        if (!isset($params['template_id'])) {
            ApiResponse::error(
                400,
                'missing_template_id',
                'template_id is required'
            );
            exit;
        }

        $template_id = (int)$params['template_id'];

        if ($template_id <= 0) {
            ApiResponse::error(
                400,
                'invalid_template_id',
                'Invalid template id'
            );
            exit;
        }

        $user_id = (int)$_SESSION['toolkits_logon_id'];

        if (
            !is_user_an_editor($template_id, $user_id) &&
            !is_user_permitted('projectadmin')
        ) {
            ApiResponse::error(
                403,
                'forbidden',
                'No editing rights for this template'
            );
            exit;
        }

        $result = thumbnail_service_store(
            $template_id,
            isset($params['page_link_id'])
                ? $params['page_link_id']
                : '',
            isset($params['page_index'])
                ? $params['page_index']
                : 0,
            isset($params['revision'])
                ? $params['revision']
                : '',
            isset($params['image'])
                ? $params['image']
                : ''
        );

        if (!$result['ok']) {
            $status =
                $result['code'] === 'database_error'
                    ? 500
                    : 400;

            ApiResponse::error(
                $status,
                $result['code'],
                $result['message']
            );
            exit;
        }

        ApiResponse::success(array(
            'stored' => true,
            'thumbnail' => $result
        ));

        exit;
    }

    /*
 * GET thumbnails/status
 */
    if ($method === 'GET' && $path === 'thumbnails/status') {

        if (!isset($params['template_id'])) {
            ApiResponse::error(
                400,
                'missing_template_id',
                'template_id is required'
            );
            exit;
        }

        $template_id = (int)$params['template_id'];

        if ($template_id <= 0) {
            ApiResponse::error(
                400,
                'invalid_template_id',
                'Invalid template id'
            );
            exit;
        }

        $user_id = (int)$_SESSION['toolkits_logon_id'];

        if (
            !is_user_an_editor($template_id, $user_id) &&
            !is_user_permitted('projectadmin')
        ) {
            ApiResponse::error(
                403,
                'forbidden',
                'No access to thumbnails for this template'
            );
            exit;
        }

        $result = thumbnail_service_get_status($template_id);

        if (!$result['ok']) {
            ApiResponse::error(
                500,
                $result['code'],
                $result['message']
            );
            exit;
        }

        ApiResponse::success(array(
            'thumbnails' => $result['thumbnails']
        ));

        exit;
    }

    /*
 * POST thumbnails/delete
 */
    if ($method === 'POST' && $path === 'thumbnails/delete') {

        if (!isset($params['template_id'])) {
            ApiResponse::error(
                400,
                'missing_template_id',
                'template_id is required'
            );
            exit;
        }

        if (empty($params['page_link_id'])) {
            ApiResponse::error(
                400,
                'missing_page_link_id',
                'page_link_id is required'
            );
            exit;
        }

        $template_id = (int)$params['template_id'];
        $page_link_id = (string)$params['page_link_id'];

        $user_id = (int)$_SESSION['toolkits_logon_id'];

        if (
            !is_user_an_editor($template_id, $user_id) &&
            !is_user_permitted('projectadmin')
        ) {
            ApiResponse::error(
                403,
                'forbidden',
                'No editing rights for this template'
            );
            exit;
        }

        $ok = thumbnail_service_delete(
            $template_id,
            $page_link_id
        );

        if (!$ok) {
            ApiResponse::error(
                500,
                'delete_failed',
                'Unable to delete thumbnail'
            );
            exit;
        }

        ApiResponse::success(array(
            'deleted' => true
        ));

        exit;
    }


    /*
     * POST thumbnails/delete-all
     */
    if ($method === 'POST' && $path === 'thumbnails/delete-all') {

        if (!isset($params['template_id'])) {
            ApiResponse::error(
                400,
                'missing_template_id',
                'template_id is required'
            );
            exit;
        }

        $template_id = (int)$params['template_id'];
        $user_id = (int)$_SESSION['toolkits_logon_id'];

        if (
            !is_user_an_editor($template_id, $user_id) &&
            !is_user_permitted('projectadmin')
        ) {
            ApiResponse::error(
                403,
                'forbidden',
                'No editing rights for this template'
            );
            exit;
        }

        $ok = thumbnail_service_delete_all(
            $template_id
        );

        if (!$ok) {
            ApiResponse::error(
                500,
                'delete_failed',
                'Unable to delete thumbnails'
            );
            exit;
        }

        ApiResponse::success(array(
            'deleted' => true
        ));

        exit;
    }


    ApiResponse::error(
        404,
        'unknown_thumbnail_route',
        'No handler for ' . $method . ' ' . $path
    );

    exit;
}