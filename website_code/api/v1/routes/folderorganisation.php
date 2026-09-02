<?php
/** REST routes for personal folder colours and labels. */

global $xerte_toolkits_site;
require_once $xerte_toolkits_site->root_file_path . 'website_code/php/services/FolderOrganisationService.php';

function folderorganisation_rest_result(array $result)
{
    if (!empty($result['ok'])) {
        ApiResponse::success($result['data']);
        return;
    }
    ApiResponse::error((int) $result['status'], $result['code'], $result['message']);
}

function folderorganisation_rest_api_dispatch($method, $path, array $params)
{
    if ($method === 'GET' && $path === 'workspace/folder-organisation') {
        ApiResponse::success(folder_organisation_payload());
        return;
    }
    if ($method === 'POST' && $path === 'workspace/folder-organisation/folder') {
        if (!isset($params['folder_id'])) {
            ApiResponse::error(400, 'missing_folder_id', 'folder_id is required');
            return;
        }
        folderorganisation_rest_result(folder_organisation_save_folder(
            $params['folder_id'],
            isset($params['colour']) ? $params['colour'] : '',
            isset($params['label_ids']) ? $params['label_ids'] : array()
        ));
        return;
    }
    if ($method === 'POST' && $path === 'workspace/folder-organisation/labels/create') {
        folderorganisation_rest_result(folder_organisation_create_label(isset($params['name']) ? $params['name'] : ''));
        return;
    }
    if ($method === 'POST' && $path === 'workspace/folder-organisation/labels/rename') {
        folderorganisation_rest_result(folder_organisation_rename_label(
            isset($params['label_id']) ? (int) $params['label_id'] : 0,
            isset($params['name']) ? $params['name'] : ''
        ));
        return;
    }
    if ($method === 'POST' && $path === 'workspace/folder-organisation/labels/delete') {
        folderorganisation_rest_result(folder_organisation_delete_label(isset($params['label_id']) ? (int) $params['label_id'] : 0));
        return;
    }
    ApiResponse::error(404, 'unknown_folderorganisation_route', 'Unknown folder organisation route');
}
