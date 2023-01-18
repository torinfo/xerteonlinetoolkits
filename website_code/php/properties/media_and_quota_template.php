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
/**
 *
 * media and quota template, specifies which files in the media folder are in use so they can be deleted
 *
 * @author Patrick Lockley
 * @version 1.0
 * @package
 */

require_once("../../../config.php");
require_once("../xmlInspector.php");

_load_language_file("/website_code/php/properties/media_and_quota_template.inc");
_load_language_file("/properties.inc");

include "../template_status.php";
include "../user_library.php";

$temp_dir_path="";
$temp_new_path="";

$quota=0;

/**
 *
 * Function in use
 * This function copies files from one folder to another (does not move - copies)
 * @param string $file_name - the file name we are checking for
 * @return bool - true or false if the file is found
 * @version 1.0
 * @author Patrick Lockley
 */

function in_use($file_name)
{

    global $xmlpath, $previewpath;

    $preview = file_get_contents($previewpath);
    // Decode all filenames in preview
    $preview2 = rawurldecode($preview);
    $preview3 = html_entity_decode($preview2);
    $data = file_get_contents($xmlpath);
    // Decode all filenames in data
    $data2 = rawurldecode($data);
    $data3 = html_entity_decode($data2);
    if (strpos($data3, $file_name) === false && strpos($preview3, $file_name) === false)
    {
        return false;
    } else {
        return true;
    }

}

$result_string = array();

$delete_string = array();

/**
 *
 * Function media folder loop
 * This function copies files from one folder to another (does not move - copies)
 * @param string $folder_name - path to the media folder to loop through
 * @version 1.0
 * @author Patrick Lockley
 */

function media_folder_loop($folder_name){

    global $dir_path, $new_path, $temp_dir_path, $temp_new_path, $quota, $result_string, $delete_string, $xerte_toolkits_site, $end_of_path, $dataInspector, $previewInspector;

    $result = "";

    $d = opendir($dir_path . $folder_name);

    while($f = readdir($d)){

        $full = $dir_path . $folder_name . $f;

        if(!is_dir($full)){

            /**
             * Create the string that the function will return
             */
            $path = $xerte_toolkits_site->site_url . "USER-FILES/" . $end_of_path . "/media/" . $folder_name . $f;
            $buttonlbl = MEDIA_AND_QUOTA_DOWNLOAD;

            if($dataInspector->fileIsUsed($folder_name . $f) || $previewInspector->fileIsUsed($folder_name . $f)){
                $result = "<div class=\"filename found\" style=\"cursor:hand; cursor:pointer;\" onClick=\"setup_download_link('" . $path . "', '" . $buttonlbl . "', '" . $end_of_path . "/media/" . $folder_name . $f . "')\">" . $folder_name . $f . "</div><div class=\"filesize found\">" . substr((filesize($full)/1000000),0,4) . " MB</div><span class=\"fileinuse found foundtextcolor\">" . MEDIA_AND_QUOTA_USE . " </span>";

            }else{
                $result = "<div class=\"filename notfound\" style=\"cursor:hand; cursor:pointer;\" onClick=\"setup_download_link('" . $path . "', '" . $buttonlbl . "', '" . $end_of_path . "/media/" . $folder_name . $f . "')\">" . $folder_name . $f . "</div><div class=\"filesize notfound\">" . substr((filesize($full)/1000000),0,4) . " MB</div><div class=\"fileinuse notfound notfoundtextcolor\">" . MEDIA_AND_QUOTA_NOT_IN_USE . " <img alt=\"Click to delete\" title=\"" . MEDIA_AND_QUOTA_DELETE . "\"  onclick=\"javascript:delete_file('" . $dir_path . $folder_name . $f . "')" . "\" \" align=\"absmiddle\" src=\"website_code/images/delete.gif\" /></div>";

                /**
                 * add the files to the delete array that are not in use  so they can be listed for use in the delete function
                 */

                array_push($delete_string, $folder_name . $f);

            }
            $quota += filesize($full);

            array_push($result_string,$result);
            $result="";
        }
        else if (strlen($f) > 0 && $f[0] != '.')
        {
            media_folder_loop($folder_name . $f . '/');
        }

    }

}

if(is_numeric($_POST['template_id'])) {
    if(has_rights_to_this_template($_POST['template_id'], $_SESSION['toolkits_logon_id']) || is_user_admin()) {

        $prefix = $xerte_toolkits_site->database_table_prefix;
        $sql = "select {$prefix}originaltemplatesdetails.template_name, {$prefix}templaterights.folder, {$prefix}logindetails.username FROM " . 
            "{$prefix}originaltemplatesdetails, {$prefix}templatedetails, {$prefix}templaterights, {$prefix}logindetails WHERE " .
            "{$prefix}originaltemplatesdetails.template_type_id = {$prefix}templatedetails.template_type_id AND " . 
            "{$prefix}templaterights.template_id = {$prefix}templatedetails.template_id AND " . 
            "{$prefix}templatedetails.creator_id = {$prefix}logindetails.login_id AND " . 
            "{$prefix}templatedetails.template_id = ? AND (role = ? OR role = ?)";

        $row_path = db_query_one($sql, array($_POST['template_id'], 'creator', 'co-author'));

        $end_of_path = $_POST['template_id'] . "-" . $row_path['username'] . "-" . $row_path['template_name'];

        /**
         * Set the paths
         */

        $dir_path = $xerte_toolkits_site->users_file_area_full . $end_of_path .  "/media/";

        $xmlpath = $xerte_toolkits_site->users_file_area_full . $end_of_path .  "/data.xml";

        $previewpath = $xerte_toolkits_site->users_file_area_full . $end_of_path .  "/preview.xml";

        $dataInspector = new XerteXMLInspector();
        $dataInspector->loadTemplateXML($xmlpath);

        $previewInspector = new XerteXMLInspector();
        $previewInspector->loadTemplateXML($previewpath);

        if(file_exists($xerte_toolkits_site->users_file_area_full . $end_of_path .  "/preview.xml")){

            $quota = filesize($xerte_toolkits_site->users_file_area_full . $end_of_path .  "/data.xml") + filesize($xerte_toolkits_site->users_file_area_full . $end_of_path .  "/preview.xml");

        }

        media_folder_loop("");


        echo "<p class=\"header\"><span>" . PROPERTIES_TAB_MEDIA . "</span></p>";

        echo "<p>" . MEDIA_AND_QUOTA_IMPORT_MEDIA . "</p><form method=\"post\" enctype=\"multipart/form-data\" id=\"importpopup\" name=\"importform\" target=\"upload_iframe\" action=\"website_code/php/import/fileupload.php\" onsubmit=\"javascript:iframe_upload_check_initialise(1);\"><input name=\"filenameuploaded\" type=\"file\" /><input type=\"hidden\" name=\"mediapath\" value=\"" . $dir_path . "/\" /><br><br><button id=\"submitbutton\" type=\"submit\" class=\"xerte_button\" name=\"submitBtn\" onclick=\"javascript:load_button_spinner(this)\"><i class=\"fa fa-upload\"></i> " . MEDIA_AND_QUOTA_BUTTON_IMPORT . "</button></form><p>" . MEDIA_AND_QUOTA_CLICK_FILENAME . "<br><textarea id=\"linktext\" style=\"width:90%;\" rows=\"3\"></textarea></p>";
        echo "<p style=\"margin:0px; padding:0px; margin-left:10px;\" id=\"download_link\"></p>";

        echo "<div class=\"template_file_area\"><p>" . MEDIA_AND_QUOTA_PUBLISH . "</p>";

        /**
         * display the first string
         */

        while($y=array_pop($result_string)){

            echo $y;

        }
        $delete_string_json = json_encode($delete_string);

        echo "</div>";
        echo "<div style=\"clear:both;\"></div>";
        echo "<p>" . MEDIA_AND_QUOTA_USAGE . " " . substr(($quota/1000000),0,4) . " MB</p>";
        echo '<button id=\'delete_unused_files\' type=\'submit\' class=\'xerte_button\' name=\'delete_unused_filesBTN\' onclick=\'javascript:delete_unused_files("' . $dir_path . '", '. $delete_string_json .')\'>' . MEDIA_AND_QUOTA_UNUSED_DELETE . '</button>';

    }else{

        echo "<p>" . MEDIA_AND_QUOTA_FAIL . "</p>";


    }

}
else {
    echo "<p>" . MEDIA_AND_QUOTA_FAIL . "</p>";
}
