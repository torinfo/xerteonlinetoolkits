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
if (file_exists('../../../config.php')) {

  require_once('../../../config.php');

} elseif (file_exists(dirname(__FILE__) . '/../../config.php')) {
  require_once(dirname(__FILE__) . '/../../config.php');
} else {

  require_once('config.php');

}
require_once('file_library.php');
require_once('user_library.php');
require_once('folder_status.php');

_load_language_file("/website_code/php/folder_library.inc");

/**
 *
 * Function make new folder
 * This function is used to send an error email meesage
 * @param string $folder_id = id for the new folder
 * @param string $folder_name = Name of the new folder
 * @version 1.0
 * @author Patrick Lockley
 */


function make_new_folder($folder_id,$folder_name){

    global $xerte_toolkits_site;

    $mysql_id = database_connect("New folder database connect success","New folder database connect failed");

    $prefix = $xerte_toolkits_site->database_table_prefix;
    
    if($folder_id=="file_area"){
        $folder_id = get_user_root_folder();
    }
    $query = "INSERT INTO {$prefix}folderdetails (login_id,folder_parent,folder_name,date_created) values  (?,?,?,?)";
    $params = array($_SESSION['toolkits_logon_id'], $folder_id, $folder_name, date('Y-m-d'));


    $new_folder_id = db_query($query, $params);
    $ok = false;
    if ($new_folder_id !== false){
        $query = "INSERT INTO {$prefix}folderrights (folder_id, login_id, folder_parent, role) values (?,?,?,?)";
        $params = array($new_folder_id, $_SESSION['toolkits_logon_id'], $folder_id, "creator");
        $ok = db_query($query, $params);
    }

    if($ok !== false) {


        receive_message($_SESSION['toolkits_logon_username'], "USER", "SUCCESS", "Folder creation succeeded for " . $_SESSION['toolkits_logon_username'], "Folder creation succeeded for " . $_SESSION['toolkits_logon_username']);

        echo FOLDER_LIBRARY_CREATE;

    }else{

        receive_message($_SESSION['toolkits_logon_username'], "USER", "CRITICAL", "Folder creation failed for " . $_SESSION['toolkits_logon_username'], "Folder creation failed for " . $_SESSION['toolkits_logon_username']);

        echo FOLDER_LIBRARY_FAIL;

    }



}

/**
 * 
 * Function delete folder
 * This function deletes a folder (puts it in recyclebin)
 * @param string $folder_id = id for the folder
 * @version 1.0
 * @author Patrick Lockley
 */

function delete_folder($folder_id){

    global $xerte_toolkits_site;

    $database_id = database_connect("Delete folder database connect success","Delete folder database connect failed");

    $prefix = $xerte_toolkits_site->database_table_prefix;

    //Check if this is the folder's creator:
    if(!is_user_creator_folder($folder_id)) {
        $name_query = "SELECT folder_name from {$prefix}}folderdetails WHERE folder_id = ? ";
        $name = db_query_one($name_query, array($folder_id));
        echo(FOLDER_LIBRARY_DELETE_FAIL . $name['folder_name']);
        return;
    }

    //Do recursively for all folders within this folder (depth first):
    $query_for_folders = "select folder_id from {$prefix}folderdetails where folder_parent = ?";
    $folders = db_query($query_for_folders, array($folder_id));

    foreach($folders as $folder){
        delete_folder($folder['folder_id']);
    }

    //delete (move to recyclebin) templates in this folder
    $query_for_templates = "select template_id from {$prefix}templaterights WHERE folder = ?";
    $templates = db_query($query_for_templates, array($folder_id));

    foreach($templates as $template){
        delete_template($template['template_id']);
    }

    //delete this folder from details and all rights
    $query_to_delete_folder = "delete from {$prefix}folderdetails where folder_id = ? AND login_id = ?";
    $params = array($folder_id, $_SESSION['toolkits_logon_id']);

    $ok = db_query($query_to_delete_folder, $params);

    //delete everyone's rights to this folder
    $query_to_delete_folder_rights = "delete from {$prefix}folderrights where folder_id = ?";
    $params = array($folder_id);
    $ok2 = db_query($query_to_delete_folder_rights, $params);


    $query_to_delete_folder_group_rights = "delete from {$prefix}folder_group_rights where folder_id = ?";
    $params = array($folder_id);
    $ok3 = db_query($query_to_delete_folder_group_rights, $params);

    if($ok !== false AND $ok2 !== false AND $ok3 !== false) {
        receive_message($_SESSION['toolkits_logon_username'], "USER", "SUCCESS", "Folder " . $folder_id . " deleted for " . $_SESSION['toolkits_logon_username'], "Folder deletion succeeded for " . $_SESSION['toolkits_logon_username']);
    }else{
        receive_message($_SESSION['toolkits_logon_username'], "USER", "CRITICAL", "Folder " . $folder_id . " not deleted for " . $_SESSION['toolkits_logon_username'], "Folder deletion falied for " . $_SESSION['toolkits_logon_username']);
    }


}

/**
 * 
 * Function move file
 * This function is used to move files and folders
 * @param array $files_to_move = an array of files and folders to move
 * @param string $destination = Name of the new folder
 * @version 1.0
 * @author Patrick Lockley
 */

function move_file($template_id,$destination)
{

    global $xerte_toolkits_site;

    $mysql_id = database_connect("Move file database connect success", "Move file database connect failure");


    if (($destination != "")) {

        if (!is_user_creator_folder($destination)){
            return;
        }
        /*
         * Move files in the database
         */

        $prefix = $xerte_toolkits_site->database_table_prefix;

        $query_file = "UPDATE {$prefix}templaterights SET folder = ? WHERE template_id = ?  AND user_id = ?";
        $params = array($destination, $template_id, $_SESSION['toolkits_logon_id']);

        $ok = db_query($query_file, $params);

        if ($ok !== false) {
            receive_message($_SESSION['toolkits_logon_username'], "USER", "SUCCESS", "File " . $template_id . " moved into " . $destination . " for " . $_SESSION['toolkits_logon_username'], "Template " . $template_id . " moved into " . $destination . " for " . $_SESSION['toolkits_logon_username']);
        } else {
            receive_message($_SESSION['toolkits_logon_username'], "USER", "SUCCESS", "File " . $template_id . " failed to move into " . $destination . " for " . $_SESSION['toolkits_logon_username'], "File " . $$template_id . " failed to move into " . $destination . " for " . $_SESSION['toolkits_logon_username']);
        }
    }
}

function move_folder($folder_id,$destination)
{

    global $xerte_toolkits_site;

    $mysql_id = database_connect("Move file database connect success", "Move file database connect failure");


    if (($destination != "")) {

        if (!is_user_creator_folder($destination)){
            return;
        }

        /*
         * Move folder in database
         */

        $prefix = $xerte_toolkits_site->database_table_prefix;

        $query_folder = "UPDATE {$prefix}folderdetails SET folder_parent = ? WHERE (folder_id = ?  )";
        $params = array($destination, $folder_id);

        $ok = db_query($query_folder, $params);
        if ($ok) {
            receive_message($_SESSION['toolkits_logon_username'], "USER", "SUCCESS", "Folder " . $folder_id . " moved into " . $destination . " for " . $_SESSION['toolkits_logon_username'], "File " . $new_files_array[$x] . " moved into " . $destination . " for " . $_SESSION['toolkits_logon_username']);
        } else {
            receive_message($_SESSION['toolkits_logon_username'], "USER", "SUCCESS", "File " . $folder_id . " failed to move into " . $destination . " for " . $_SESSION['toolkits_logon_username'], "Folder " . $new_files_array[$x] . " failed to move into " . $destination . " for " . $_SESSION['toolkits_logon_username']);
        }

    }
}

/* already in folder status:
function has_rights_to_this_folder($folder_id, $user_id){
    global $xerte_toolkits_site;
    $query = "select * from {$xerte_toolkits_site->database_table_prefix}folderdetails where login_id=? AND folder_id = ?";
    $result = db_query_one($query, array($user_id, $folder_id));

    if(!empty($result)) {
        return true;
    }
    return false;
}
*/

