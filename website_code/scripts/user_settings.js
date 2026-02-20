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
	 * code to handle settings dropdown menu
	 *
	 * @author Noud Liefrink
	 * @version 1.0
	 * @package
	 */

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function settingsDropdown() {
    document.getElementById("settings").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
$(function() {
    $("body").click(function(e) {
        if (!(e.target.class == "settingsDropdown" || $(e.target).parents(".settingsDropdown").length)) {
            var dropdowns = $(".settings-content");
            var i;
            for (i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
    });
})

/**
 * Password change popup and form code:
 */

function changepasswordPopup() {
    // Check if dialog already exists
    var $dialog = $("#change-password-dialog");
    
    if ($dialog.length === 0) {
        // Create dialog div if it doesn't exist
        $dialog = $("<div id='change-password-dialog' style='display: none;'></div>");
        $("body").append($dialog);
        
        // Add custom CSS for workspace styling
        if ($("#change-password-dialog-styles").length === 0) {
            $("head").append('<style id="change-password-dialog-styles">' +
                '#change-password-dialog { font-family: Arial, sans-serif; } ' +
                '#change-password-dialog .ui-dialog-titlebar { background-color: #ededed; border: 1px solid #ccc; border-bottom: none; padding: 10px; border-radius: 5px 5px 0 0; } ' +
                '#change-password-dialog .ui-dialog-titlebar-close { background-color: #f86718 !important; border: 1px solid #fff !important; border-radius: 4px; color: #fff !important; width: 20px !important; height: 20px !important; padding: 0 !important; } ' +
                '#change-password-dialog .ui-dialog-titlebar-close .ui-icon { background-image: none !important; background-color: transparent !important; text-indent: 0 !important; width: 100% !important; height: 100% !important; margin: 0 !important; left: 0 !important; top: 0 !important; } ' +
                '#change-password-dialog .ui-dialog-titlebar-close .ui-icon:before { content: "×"; font-size: 18px; color: #fff !important; font-weight: bold; line-height: 20px; display: block; text-align: center; width: 100%; height: 100%; position: absolute; left: 0; top: 0; } ' +
                '#change-password-dialog .ui-dialog-titlebar-close:hover { background-color: #d85a15 !important; } ' +
                '#change-password-dialog .ui-dialog-titlebar-close:hover .ui-icon:before { color: #fff !important; } ' +
                '#change-password-dialog .ui-dialog-content { background-color: #fff; border: 1px solid #ccc; border-top: none; border-bottom: none; padding: 0; } ' +
                '#change-password-dialog .ui-dialog-buttonpane { background-color: #ededed; border: 1px solid #ccc; border-top: none; border-radius: 0 0 5px 5px; padding: 10px; } ' +
                '#change-password-dialog .workspace-form-container { padding: 15px; background-color: #fff; } ' +
                '#change-password-dialog .workspace-form-title { font-weight: bold; color: #000; margin-bottom: 15px; padding-left: 10px; } ' +
                '#change-password-dialog .workspace-form-area { background-color: #fff; border-radius: 5px; padding: 15px; } ' +
                '#change-password-dialog label { display: block; margin-top: 10px; margin-bottom: 5px; color: #000; font-weight: normal; } ' +
                '#change-password-dialog input[type="password"] { width: 100%; padding: 5px; margin-bottom: 10px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 3px; font-size: 1em; } ' +
                '#change-password-dialog input[type="password"]:focus { border-color: #f86718; outline: none; } ' +
                '#change-password-dialog button.xerte_button { background-color: #f86718; color: #fff; border-radius: 4px; border: 1px solid #fff; padding: 4px 10px; cursor: pointer; font-size: 1em; margin-top: 10px; } ' +
                '#change-password-dialog button.xerte_button:hover { background-color: #d85a15; } ' +
                '#change-password-dialog #result { margin-top: 15px; padding: 10px; background-color: #fff; border-radius: 3px; } ' +
                '#change-password-dialog .panel-settings { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ccc; } ' +
                '#change-password-dialog .panel-setting-item { margin-top: 10px; } ' +
                '#change-password-dialog .panel-setting-item label { display: inline-block; margin-right: 10px; cursor: pointer; color: #000; font-weight: normal; } ' +
                '#change-password-dialog .panel-setting-item input[type="checkbox"] { margin-right: 5px; cursor: pointer; width: auto; } ' +
                '</style>');
        }
        
        // Initialize dialog
        $dialog.dialog({
            autoOpen: false,
            modal: true,
            width: 450,
            height: 'auto',
            resizable: false,
            title: "Edit preferences",
            dialogClass: "workspace-dialog",
            close: function() {
                // Clear form on close
                $("#passform").find("input[type=password]").val('');
                $("#result").html('');
            }
        });
    }
    
    // Load form content via AJAX
    $.ajax({
        url: site_url + "website_code/php/get_user_settings_form.php",
        type: "GET",
        dataType: "html",
        success: function(html) {
            $dialog.html(html);
            
            // Load current panel states from user preferences
            if (typeof user_preferences !== 'undefined' && user_preferences) {
                // Set east panel checkbox (workspace)
                var eastCheckbox = $("#change-password-dialog #panel_east_open");
                if (eastCheckbox.length) {
                    var eastOpen = user_preferences.panel_east_open;
                    if (eastOpen === undefined || eastOpen === null) {
                        // Default to true if not set
                        eastCheckbox.prop('checked', true);
                    } else {
                        eastCheckbox.prop('checked', eastOpen !== false && eastOpen !== 'false' && eastOpen !== 0 && eastOpen !== '0');
                    }
                }
                
                // Set south panel checkbox (workspace)
                var southCheckbox = $("#change-password-dialog #panel_south_open");
                if (southCheckbox.length) {
                    var southOpen = user_preferences.panel_south_open;
                    if (southOpen === undefined || southOpen === null) {
                        // Default to true if not set
                        southCheckbox.prop('checked', true);
                    } else {
                        southCheckbox.prop('checked', southOpen !== false && southOpen !== 'false' && southOpen !== 0 && southOpen !== '0');
                    }
                }
                
                // Set editor east panel checkbox
                var editorEastCheckbox = $("#change-password-dialog #editor_panel_east_open");
                if (editorEastCheckbox.length) {
                    var editorEastOpen = user_preferences.editor_panel_east_open;
                    if (editorEastOpen === undefined || editorEastOpen === null) {
                        // Default to true if not set, and create it in preferences
                        editorEastCheckbox.prop('checked', true);
                        if (typeof save_user_preference === 'function') {
                            save_user_preference('editor_panel_east_open', true);
                        }
                    } else {
                        editorEastCheckbox.prop('checked', editorEastOpen !== false && editorEastOpen !== 'false' && editorEastOpen !== 0 && editorEastOpen !== '0');
                    }
                }
                
                // Set editor show language checkbox (default false)
                var editorShowLanguageCheckbox = $("#change-password-dialog #editor_show_language");
                if (editorShowLanguageCheckbox.length) {
                    var editorShowLanguage = user_preferences.editor_show_language;
                    if (editorShowLanguage === undefined || editorShowLanguage === null) {
                        editorShowLanguageCheckbox.prop('checked', false);
                    } else {
                        editorShowLanguageCheckbox.prop('checked', editorShowLanguage !== false && editorShowLanguage !== 'false' && editorShowLanguage !== 0 && editorShowLanguage !== '0');
                    }
                }
                
                // Set editor show toolbar checkbox (default false)
                var editorShowToolbarCheckbox = $("#change-password-dialog #editor_show_toolbar");
                if (editorShowToolbarCheckbox.length) {
                    var editorShowToolbar = user_preferences.editor_show_toolbar;
                    if (editorShowToolbar === undefined || editorShowToolbar === null) {
                        editorShowToolbarCheckbox.prop('checked', false);
                    } else {
                        editorShowToolbarCheckbox.prop('checked', editorShowToolbar !== false && editorShowToolbar !== 'false' && editorShowToolbar !== 0 && editorShowToolbar !== '0');
                    }
                }
                
                // Set editor expand groups checkbox (default false)
                var editorExpandGroupsCheckbox = $("#change-password-dialog #editor_expand_groups");
                if (editorExpandGroupsCheckbox.length) {
                    var editorExpandGroups = user_preferences.editor_expand_groups;
                    if (editorExpandGroups === undefined || editorExpandGroups === null) {
                        editorExpandGroupsCheckbox.prop('checked', false);
                    } else {
                        editorExpandGroupsCheckbox.prop('checked', editorExpandGroups !== false && editorExpandGroups !== 'false' && editorExpandGroups !== 0 && editorExpandGroups !== '0');
                    }
                }
                
                // Set editor expand tree checkbox (default false)
                var editorExpandTreeCheckbox = $("#change-password-dialog #editor_expand_tree");
                if (editorExpandTreeCheckbox.length) {
                    var editorExpandTree = user_preferences.editor_expand_tree;
                    if (editorExpandTree === undefined || editorExpandTree === null) {
                        editorExpandTreeCheckbox.prop('checked', false);
                    } else {
                        editorExpandTreeCheckbox.prop('checked', editorExpandTree !== false && editorExpandTree !== 'false' && editorExpandTree !== 0 && editorExpandTree !== '0');
                    }
                }
            }
            
            // Add change handlers for panel checkboxes
            $("#change-password-dialog #panel_east_open").on('change', function() {
                if (typeof save_user_preference === 'function') {
                    save_user_preference('panel_east_open', $(this).is(':checked'));
                    // Update actual panel state
                    if (typeof xerteinner_layout !== 'undefined') {
                        if ($(this).is(':checked')) {
                            xerteinner_layout.open('east');
                        } else {
                            xerteinner_layout.close('east');
                        }
                    }
                }
            });
            
            $("#change-password-dialog #panel_south_open").on('change', function() {
                if (typeof save_user_preference === 'function') {
                    save_user_preference('panel_south_open', $(this).is(':checked'));
                    // Update actual panel state
                    if (typeof xertemain_layout !== 'undefined') {
                        if ($(this).is(':checked')) {
                            xertemain_layout.open('south');
                        } else {
                            xertemain_layout.close('south');
                        }
                    }
                }
            });
            
            // Editor panel checkbox handler
            $("#change-password-dialog #editor_panel_east_open").on('change', function() {
                if (typeof save_user_preference === 'function') {
                    save_user_preference('editor_panel_east_open', $(this).is(':checked'));
                }
            });
            
            // Editor show language checkbox handler
            $("#change-password-dialog #editor_show_language").on('change', function() {
                if (typeof save_user_preference === 'function') {
                    save_user_preference('editor_show_language', $(this).is(':checked'));
                }
            });
            
            // Editor show toolbar checkbox handler
            $("#change-password-dialog #editor_show_toolbar").on('change', function() {
                if (typeof save_user_preference === 'function') {
                    save_user_preference('editor_show_toolbar', $(this).is(':checked'));
                }
            });
            
            // Editor expand groups checkbox handler
            $("#change-password-dialog #editor_expand_groups").on('change', function() {
                if (typeof save_user_preference === 'function') {
                    save_user_preference('editor_expand_groups', $(this).is(':checked'));
                }
            });
            
            // Editor expand tree checkbox handler
            $("#change-password-dialog #editor_expand_tree").on('change', function() {
                if (typeof save_user_preference === 'function') {
                    save_user_preference('editor_expand_tree', $(this).is(':checked'));
                    // Apply change to editor's expand_tree checkbox if editor is open
                    var expandTreeCb = $('#expand_tree');
                    if (expandTreeCb.length > 0) {
                        expandTreeCb.prop('checked', $(this).is(':checked'));
                        // Trigger change event to call expandTree()
                        expandTreeCb.trigger('change');
                    }
                }
            });
            
            $dialog.dialog("open");
        },
        error: function(xhr, status, error) {
            console.error("Error loading password form:", error);
            $dialog.html("<div style='padding: 20px; color: red;'>Error loading password form. Please try again.</div>");
            $dialog.dialog("open");
        }
    });
}

function ajax_send(url, mesg, success){

    $.ajax({
        type: "POST",
        url: "library/Xerte/Authentication/Db/" + url,
        data: mesg,
        success: success
    })

}

function changePassword(username){
    var oldpass = $("#oldpass").val();
    var passwd1 = $("#newpass").val();
    var passwd2 = $("#newpassrepeat").val();
    if (passwd1 == passwd2) {

        var url = "changepassword.php";
        var mesg = 'username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(passwd1) + '&oldpass=' + encodeURIComponent(oldpass);

        ajax_send("changepassword.php", mesg, function(response) {$("#result").html(response)})

    }else{
        $('#result').html("<p>" + PASS_FAILED + "</p><p><font color = \"red\"><ul><li>" + NOT_SAME_PASS + "</li></ul></font></p>");
    }

    $("#passform").find("input[type=password], textarea").val('');
}

