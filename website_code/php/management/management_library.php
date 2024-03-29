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

	_load_language_file("/website_code/php/management/management_library.inc");
	_load_language_file("/management.inc");
	
	require_once("../language_library.php");

	/**
	 * generates a textarea with title for the current theme/layout
	 * @param string $dbname the text to put in the id of the textarea
	 * @param string $title the text above the input
	 * @param string $value the text inside the textarea on creation
	 * @param string $options the html parameters of the textarea
	 *
	 * @return string markup of an textbox with the theme/layout applied
	 */
	function oldInputField($dbname, $title, $value, $options = ""){
		return "<p>" . $title . "</p><form><textarea " . $options . " id=\"$dbname\">" . $value . "</textarea></form>";
	}

	/**
	 * generates a textarea with title for the current theme/layout
	 * @param string $dbname the text to put in the id of the textarea
	 * @param string $title the text above the input
	 * @param string $value the text inside the textarea on creation
	 * @param string $options the html parameters of the textarea
	 *
	 * @return string markup of an textbox with the theme/layout applied
	 */
	function inputField($dbname, $title, $value, $options = ""){
		$inputField = "";
		if($_SESSION['layout'] === "new"){
			$inputField .= "<div class='mgmnt-form-header-container'><div class='mgmnt-form-header'>". $title ."</div><div class='mgmnt-form-container'><form><textarea " . $options . " class='text-area-block' id='" . $dbname . "'>" . $value . "</textarea></form></div></div>";
		}else {
			$inputField .= "<p>" . $title . "</p><form><textarea " . $options . " id=\"$dbname\">" . $value . "</textarea></form>";
		}
		return $inputField;
	}

	/**
	 * generates a wysiwyg textarea with title for the current theme/layout
	 * @param string $dbname the text to put in the id of the textarea
	 * @param string $title the text above the input
	 * @param string $value the text inside the textarea on creation
	 * @param string $options the html parameters of the textarea
	 *
	 * @return string markup of an textbox with the theme/layout applied
	 */
	function wysiwygField($dbname, $title, $value, $options = ""){
		$inputField = "";
		if($_SESSION['layout'] === "new"){
			$inputField .= "<div class='mgmnt-form-header-container'><div class='mgmnt-form-header'>". $title ."</div><div class='mgmnt-form-container'><form><textarea " . $options . " class='text-area-block wysiwyg' id='" . $dbname . "'>" . $value . "</textarea></form></div></div>";
		}else {
			$inputField .= "<p>" . $title . "</p><form><textarea " . $options . " id=\"$dbname\">" . $value . "</textarea></form></p>";
		}
		return $inputField;
	}

	/**
	 * generates a code textarea with title for the current theme/layout
	 * @param string $dbname the text to put in the id of the textarea
	 * @param string $title the text above the input
	 * @param string $value the text inside the textarea on creation
	 * @param string $options the html parameters of the textarea
	 *
	 * @return string markup of an textbox with the theme/layout applied
	 */
	function codeField($dbname, $title, $value, $options = ""){
		$inputField = "";
		if($_SESSION['layout'] === "new"){
			$inputField .= "<div class='mgmnt-form-header-container'><div class='mgmnt-form-header'>". $title ."</div><div class='mgmnt-form-container'><form><textarea " . $options . " class='text-area-block codemirror' id='" . $dbname . "'>" . $value . "</textarea></form></div></div>";
		}else {
			$inputField .= "<p>" . $title . "</p><form><textarea " . $options . " id=\"$dbname\">" . $value . "</textarea></form></p>";
		}
		return $inputField;
	}

	/**
	 * generates a dropdown with title for the current theme/layout
	 * @param string $dbname the text to put in the id of the textarea
	 * @param string $title the text above the input
	 * @param string $currentValue the selected value on creation
	 * @param mixed  $possibleValues all the possible values of the dropdown if standerd array the value is the same as the value atribute of the option tag otherwise the key of the array is the
	 *
	 * @return string markup of an dropdown with the theme/layout applied
	 */
	function dropDown($dbname, $title, $currentValue, $possibleValues){
		if($_SESSION['layout'] == "new"){
			echo "<div class='mgmnt-form-header-container'><div class='mgmnt-form-header'>$title</div><div class='mgmnt-form-container'>";
			$endTags = "</div></div>";
		}else{
			echo "<p>$title</p>";
			$endTags = "";
		}
        echo "<form><select name=\"$dbname\" id=\"$dbname\" style=\"padding: 0.4em 0.15em; \">";
		
		if($possibleValues == array_values($possibleValues)){
			foreach($possibleValues as $value){
				$selected = $currentValue == $value? "selected": "";
				echo "<option value=\"$value\" $selected>$value</option>";
			}
		}else {
			foreach($possibleValues as $value => $translatedValue){
				$selected = $currentValue == $value? "selected": "";
				echo "<option value=\"$value\" $selected>$translatedValue</option>";
			}
		}

        echo "</select></form>";

        echo $endTags;
	}

	class AdminUIBuilder{
		private $DBRow;
		private $Markup;

		function __construct($DBRow)
		{
			$this->DBRow = $DBRow;
		}

		function Build() {
			return $this->Markup;
		}

		function inputField($dbname, $title, $defaultValue = NULL, $options = ""){

			$value = $defaultValue?? $this->DBRow[$dbname];

			if($_SESSION['layout'] === "new"){
				$this->Markup .= "<div class='mgmnt-form-header-container'><div class='mgmnt-form-header'>". $title ."</div><div class='mgmnt-form-container'><form><textarea " . $options . " class='text-area-block' id='" . $dbname . "'>" . $value . "</textarea></form></div></div>";
			}else {
				$this->Markup .= "<p>" . $title . "<form><textarea " . $options . " id=\"$dbname\">" . $value . "</textarea></form></p>";
			}
		}

	}

	function category_add(){
		echo "<div class=\"admin_block\">";
		echo "<h3>" . MANAGEMENT_LIBRARY_ADD_CATEGORY . "</h3>";
		
		echo inputField("newcategory", MANAGEMENT_LIBRARY_NEW_CATEGORY, MANAGEMENT_LIBRARY_NEW_CATEGORY_NAME, "cols=\"100\" rows=\"2\"");
 		echo "<p><form action=\"javascript:new_category();\"><button class=\"xerte_button\" type=\"submit\"><i class=\"fa fa-plus-circle\"></i> " . MANAGEMENT_LIBRARY_NEW_LABEL . "</button></form></p>";
		echo "</div>";
	}

	function category_list(){
	
		global $xerte_toolkits_site;
	
		$query="select * from " . $xerte_toolkits_site->database_table_prefix . "syndicationcategories order by category_name ASC";
	
		echo "<div class=\"admin_block\">";
		echo "<h3>" . MANAGEMENT_LIBRARY_EXISTING_CATEGORIES . "</h3>";

		$query_response = db_query($query);

		foreach($query_response as $row) {

			echo "<p>" . $row['category_name'] . " - <button type=\"button\" class=\"xerte_button\" onclick=\"javascript:remove_category('" . $row['category_id'] .  "')\"><i class=\"fa fa-minus-circle\"></i> " . MANAGEMENT_LIBRARY_REMOVE . " </button></p>";

		}
		
		echo "</div>";
	
	}

	function educationlevel_add(){
		echo "<div class=\"admin_block\">";
        echo "<h3>" . MANAGEMENT_LIBRARY_ADD_EDUCATION . "</h3>";

		echo inputField("neweducationlevel", MANAGEMENT_LIBRARY_NEW_EDUCATION, MANAGEMENT_LIBRARY_NEW_EDUCATION_NAME, "cols=\"100\" rows=\"2\"");
 		echo "<p><form action=\"javascript:new_educationlevel();\"><button class=\"xerte_button\" type=\"submit\"><i class=\"fa fa-plus-circle\"></i> " . MANAGEMENT_LIBRARY_NEW_LABEL . "</button></form></p>";
		echo "</div>";
	}

    function educationlevel_list(){

        global $xerte_toolkits_site;

        $query="select * from " . $xerte_toolkits_site->database_table_prefix . "educationlevel order by educationlevel_name ASC";

		echo "<div class=\"admin_block\">";
        echo "<h3>" . MANAGEMENT_LIBRARY_EXISTING_EDUCATION . "</h3>";

        $query_response = db_query($query);

        foreach($query_response as $row) {

            echo "<p>" . $row['educationlevel_name'] . " - <button type=\"button\" class=\"xerte_button\" onclick=\"javascript:remove_educationlevel('" . $row['educationlevel_id'] .  "')\"><i class=\"fa fa-minus-circle\"></i> " . MANAGEMENT_LIBRARY_REMOVE . " </button></p>";

        }
		echo "</div>";

    }

	function grouping_add(){
		echo "<div class=\"admin_block\">";
        echo "<h3>" . MANAGEMENT_LIBRARY_ADD_GROUPING . "</h3>";

		echo inputField("newgrouping", MANAGEMENT_LIBRARY_NEW_GROUPING, MANAGEMENT_LIBRARY_NEW_GROUPING_NAME, "cols=\"100\" rows=\"2\"");
 		echo "<p><form action=\"javascript:new_grouping();\"><button class=\"xerte_button\" type=\"submit\"><i class=\"fa fa-plus-circle\"></i> " . MANAGEMENT_LIBRARY_NEW_LABEL . "</button></form></p>";
		echo "</div>";
	}


    function grouping_list(){

        global $xerte_toolkits_site;

        $query="select * from `" . $xerte_toolkits_site->database_table_prefix . "grouping` order by grouping_name ASC";
		
		echo "<div class=\"admin_block\">";
        echo "<h3>" . MANAGEMENT_LIBRARY_EXISTING_GROUPINGS . "</h3>";

        $query_response = db_query($query);

        foreach($query_response as $row) {

            echo "<p>" . $row['grouping_name'] . " - <button type=\"button\" class=\"xerte_button\" onclick=\"javascript:remove_grouping('" . $row['grouping_id'] .  "')\"><i class=\"fa fa-minus-circle\"></i> " . MANAGEMENT_LIBRARY_REMOVE . " </button></p>";

        }
		echo "</div>";

    }

	function course_add(){
		echo "<div class=\"admin_block\">";
		
        $query = "select course_freetext_enabled from " . $xerte_toolkits_site->database_table_prefix . "sitedetails";
        $row = db_query_one($query);
		echo inputField("course_freetext_enable", MANAGEMENT_COURSE_FREE_TEXT_ENABLE, $row['course_freetext_enabled'], "");

		echo "</div>";
		echo "<div class=\"admin_block\">";
        echo "<h3>" . MANAGEMENT_LIBRARY_ADD_COURSE . "</h3>";

		echo inputField("newcourse", MANAGEMENT_LIBRARY_NEW_COURSE, MANAGEMENT_LIBRARY_NEW_COURSE_NAME, "cols=\"100\" rows=\"2\"");
 		echo "<p><form action=\"javascript:new_course();\"><button class=\"xerte_button\" type=\"submit\"><i class=\"fa fa-plus-circle\"></i> " . MANAGEMENT_LIBRARY_NEW_LABEL . "</button></form></p>";
		echo "</div>";
	}

    function course_list()
    {

        global $xerte_toolkits_site;

        $query = "select * from " . $xerte_toolkits_site->database_table_prefix . "course order by course_name ASC";
		
		echo "<div class=\"admin_block\">";
        echo "<h3>" . MANAGEMENT_LIBRARY_EXISTING_COURSES . "</h3>";

        $query_response = db_query($query);

        if ($query_response !== false && $query_response != null) {
            foreach ($query_response as $row) {
                echo "<p>" . $row['course_name'] . " - <button type=\"button\" class=\"xerte_button\" onclick=\"javascript:remove_course('" . $row['course_id'] . "')\"><i class=\"fa fa-minus-circle\"></i> " . MANAGEMENT_LIBRARY_REMOVE . " </button></p>";
            }
        }
		echo "</div>";
    }

	function syndication_list(){
	
		global $xerte_toolkits_site;
	
		$database_id = database_connect("templates list connected","template list failed");

		$query="select * from " . $xerte_toolkits_site->database_table_prefix . "templatesyndication," . 
                        $xerte_toolkits_site->database_table_prefix . "templatedetails where " .
                        $xerte_toolkits_site->database_table_prefix . "templatesyndication.template_id = " .
                        $xerte_toolkits_site->database_table_prefix . "templatedetails.template_id and( rss=? or export=? or syndication=?)";

                $params = array('true', 'true', 'true');
                
		$query_response = db_query($query, $params);
		
		echo "<h2>" . MANAGEMENT_MENUBAR_FEEDS . "</h2>";
		
		if (count($query_response) > 0) {
			
			echo "<div class=\"admin_block\">";

			foreach($query_response as $row) {

				echo "<p>" . $row['template_name'];

				if($row['rss'] == "true") {

					echo " - <button type=\"button\" class=\"xerte_button\" onclick=\"javascript:remove_feed('" . $row['template_id'] .  "','RSS')\"><i class=\"fa fa-minus-circle\"></i> " . MANAGEMENT_LIBRARY_REMOVE_RSS . "</button> ";

				}

				if($row['export'] == "true") {

					echo " - <button type=\"button\" class=\"xerte_button\" onclick=\"javascript:remove_feed('" . $row['template_id'] .  "', 'EXPORT')\"><i class=\"fa fa-minus-circle\"></i> " . MANAGEMENT_LIBRARY_REMOVE_EXPORT . "</button> ";

				}

				if($row['syndication'] == "true"){

					echo " - <button type=\"button\" class=\"xerte_button\" onclick=\"javascript:remove_feed('" . $row['template_id'] .  "','SYND')\"><i class=\"fa fa-minus-circle\"></i> " . MANAGEMENT_LIBRARY_REMOVE_SYNDICATION . "</button> ";

				}

			}
			
			echo "</div>";
		}
		else {
			echo "<div class=\"admin_block\">";
			echo "<p>" . MANAGEMENT_LIBRARY_FEEDS_NO_FEEDS . "</p>";
			echo "</div>";
		}
	}

	function security_add(){
		echo "<div class=\"admin_block\">";
		echo "<h3>" . MANAGEMENT_LIBRARY_ADD_SECURITY . "</h3>";

		echo inputField("newsecurity", MANAGEMENT_LIBRARY_NEW_SECURITY, MANAGEMENT_LIBRARY_NEW_SECURITY_NAME, "cols=\"100\" rows=\"2\"");
		echo inputField("newdata", MANAGEMENT_LIBRARY_NEW_SECURITY_DATA, MANAGEMENT_LIBRARY_NEW_SECURITY_DETAILS, "cols=\"100\" rows=\"2\"");
		echo inputField("newdesc", MANAGEMENT_LIBRARY_NEW_SECURITY_INFO, MANAGEMENT_LIBRARY_NEW_SECURITY_DESCRIPTION, "cols=\"100\" rows=\"2\"");

		echo "<p><form action=\"javascript:new_security();\"><button type=\"submit\" class=\"xerte_button\"><i class=\"fa fa-plus-circle\"></i> " . MANAGEMENT_LIBRARY_ADD_SECURITY . " </button></form></p>";
		
		echo "</div>";
	}
	
	function security_list(){
	
		global $xerte_toolkits_site;
		
		echo "<div class=\"admin_block\">";
		echo "<h3>" . MANAGEMENT_LIBRARY_EXISTING_SECURITY . "</h3>";
                
        $query_for_play_security = "select * from " . $xerte_toolkits_site->database_table_prefix . "play_security_details";

		$query_for_play_security_response = db_query($query_for_play_security);
		
		echo "<div class=\"indented\">";
		
        foreach($query_for_play_security_response as $row_security) {
		
			echo "<div class=\"template\" id=\"play" . $row_security['security_id'] . "\" savevalue=\"" . $row_security['security_id'] .  "\"><p>" . $row_security['security_setting'] . " <button type=\"button\" class=\"xerte_button\" id=\"play" . $row_security['security_id'] . "_btn\" onclick=\"javascript:templates_display('play" . $row_security['security_id'] . "')\"> " . MANAGEMENT_LIBRARY_VIEW . "</button></p></div><div class=\"template_details\" id=\"play" . $row_security['security_id']  . "_child\">";
		
			echo inputField($row_security['security_id'] . "security", MANAGEMENT_LIBRARY_EXISTING_SECURITY_IS, $row_security['security_setting'], "cols=\"100\" rows=\"2\"");
			echo inputField($row_security['security_id'] . "data", MANAGEMENT_LIBRARY_EXISTING_SECURITY_DATA, $row_security['security_data'], "cols=\"100\" rows=\"2\"");
			echo inputField($row_security['security_id'] . "info", MANAGEMENT_LIBRARY_EXISTING_SECURITY_INFO, $row_security['security_info'], "cols=\"100\" rows=\"2\"");
		
			echo "<p><button type=\"button\" class=\"xerte_button\" onclick=\"javascript:remove_security()\"><i class=\"fa fa-minus-circle\"></i> " . MANAGEMENT_LIBRARY_EXISTING_SECURITY_REMOVE . "</button> " . MANAGEMENT_LIBRARY_EXISTING_SECURITY_WARNING . "</p></div>";

		}
		
		echo "</div></div>";
	
	}

	function licence_add(){
		echo "<div class=\"admin_block\">";
		echo "<h3>" . MANAGEMENT_LIBRARY_NEW_LICENCE . "</h3>";

		echo inputField("newlicense", MANAGEMENT_LIBRARY_NEW_LICENCE_DETAILS, MANAGEMENT_LIBRARY_NEW_LICENCE_NAME, "cols=\"100\" rows=\"2\"");
 		echo "<p><form action=\"javascript:new_license();\"><button class=\"xerte_button\" type=\"submit\"><i class=\"fa fa-plus-circle\"></i> " . MANAGEMENT_LIBRARY_NEW_LABEL . "</button></form></p>";
		echo "</div>";
	}

	function licence_list(){
	
		global $xerte_toolkits_site;
	
		$database_id = database_connect("licence list connected","licence list failed");
		
		echo "<div class=\"admin_block\">";
		echo "<h3>" . MANAGEMENT_LIBRARY_MANAGE_LICENCES . "</h3>";

		$query="select * from " . $xerte_toolkits_site->database_table_prefix . "syndicationlicenses";

		$query_response = db_query($query);

		foreach($query_response as $row) { 

			echo "<p>" . $row['license_name'] . " - <button type=\"button\" class=\"xerte_button\" onclick=\"javascript:remove_licenses('" . $row['license_id'] .  "')\"><i class=\"fa fa-minus-circle\"></i> " . MANAGEMENT_LIBRARY_REMOVE . " </button></p>";

		}
		echo "</div>";
	
	}

	function management_fail(){
	
		echo MANAGEMENT_LIBRARY_FAIL;
	
	}

    function language_details($changed){

        global $xerte_toolkits_site;


        echo "<p>" . MANAGEMENT_LIBRARY_LANGUAGES_EXPLAINED . "</p>";
        echo "<p>" . MANAGEMENT_LIBRARY_ADD_LANGUAGE . "</p>";
        echo "<p><br><form method=\"post\" enctype=\"multipart/form-data\" id=\"languagepopup\" name=\"languageform\" target=\"upload_iframe\" action=\"website_code/php/language/import_language.php\" onsubmit=\"javascript:iframe_upload_language_check_initialise();\"><input name=\"filenameuploaded\" type=\"file\" /><br /><br/><button type=\"submit\" class=\"xerte_button\" name=\"submitBtn\" onsubmit=\"javascript:iframe_language_check_initialise()\" ><i class=\"fa fa-plus-circle\"></i> " . MANAGEMENT_LIBRARY_LANGUAGE_INSTALL . "</button></form></p>";
        echo "<p>" . MANAGEMENT_LIBRARY_EXISTING_LANGUAGES . "</p>";
        $langs = getLanguages();
        $codes = array_keys($langs);
        echo "<ul>";
        foreach($codes as $code)
        {
            echo "<li>" . $langs[$code];
            if ($code != "en-GB")
            {
                echo " <button type=\"button\" class=\"xerte_button\" onclick=\"javascript:delete_language('" . $code .  "')\"><i class=\"fa fa-minus-circle\"></i> " . MANAGEMENT_LIBRARY_REMOVE . " </button></li>";
            }
            else{
                echo "</li>";
            }
        }
        echo "</ul>";
        if ($changed)
        {
            echo "<p>". MANAGEMENT_LIBRARY_LANGUAGES_UPDATED . "</p>";
        }

    }
