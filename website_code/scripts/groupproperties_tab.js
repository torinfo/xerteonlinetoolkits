
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
	 * groupproperties, javascript for the group properties tab
	 *
	 */

	 /**
	 * 
	 * Function folders ajax send prepare
 	 * This function sorts out the URL for most of the queries in the folder properties window
	 * @param string url = the extra part of the url for this ajax query
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function group_ajax_send_prepare(url){

   	xmlHttp.open("post","website_code/php/groupproperties/" + url,true);
	xmlHttp.onreadystatechange=group_properties_stateChanged;
	xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	
}

 	/**
	 * 
	 * Function folders properties state changed
 	 * This function handles all of the responses from the ajax queries
	 * @version 1.0
	 * @author Patrick Lockley
	 */

function group_properties_stateChanged(){

	if (xmlHttp.readyState==4){ 
			
		if(xmlHttp.responseText!=""){
			
			document.getElementById('dynamic_area').innerHTML = xmlHttp.responseText;

		}
	}
}

 /**
	 * 
	 * Function group properties
 	 * This function displays the basic properties panel for this folder
	 */

function groupproperties(){
	 $.ajax({
		 type: "POST",
		 url: "website_code/php/groupproperties/groupproperties.php",
		 data: {group_id: String(window.name).substr(0,String(window.name).indexOf("_"))},
	 })
	 .done(function(response){
		 $('#dynamic_area').html(response);
	 })
}

 /**
	 * 
	 * Function group content template
 	 * This function shows the content of this folder for the folder content tab
	 */


function group_content(){

	$.ajax({
		 type: "POST",
		 url: "website_code/php/groupproperties/group_content.php",
		 data: {group_id: String(window.name).substr(0,String(window.name).indexOf("_"))},
	})
	.done(function(response){
		$('#dynamic_area').html(response);
	})

}


/**
 *
 * Function sharing status folder
 * This function handles the display of the current sharing status
 * modified for use with folders
 * @version 1.0
 * @author Patrick Lockley
 */

function sharing_status_group(){

	$.ajax({
		type: "POST",
		url: "website_code/php/groupproperties/sharing_status_group.php",
		data: {group_id: window.name},
	})
	.done(function(response){
		$('#dynamic_area').html(response);
	})
}

function share_stateChanged(){

	if (xmlHttp.readyState==4){

		if(xmlHttp.responseText!=""){
			document.getElementById('area2').innerHTML = xmlHttp.responseText;
		}
	}
}

function delete_sharing_folder(folder_id,id,who_deleted_flag, group=false){

	var answer = confirm(SHARING_CONFIRM_FOLDER_PROPERTIES);
	var after_sharing_deleted = false;
	if(answer){
		if(who_deleted_flag){
			after_sharing_deleted = true;
		}

		if(setup_ajax()!=false){
			$.ajax({
				type: "POST",
				url: "website_code/php/folderproperties/remove_sharing_folder.php",
				data: {
					folder_id: folder_id,
					id: id,
					group: group,
					user_deleting_self: after_sharing_deleted
				},
			})
				.done(function(response){
					$('#area3').html(response);

					if(after_sharing_deleted){
						if(typeof window_reference==="undefined"){
							window.opener.refresh_workspace();
						}
						else {
							window_reference.refresh_workspace();
						}

					}

					sharing_status_folder()
				});
		}
	}
}

//   	xmlHttp.open("post",properties_ajax_php_path + url,true);
// 	xmlHttp.onreadystatechange=properties_stateChanged;
// 	xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
