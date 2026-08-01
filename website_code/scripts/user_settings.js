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
});

function isModernToolkitsTheme() {
    return document.body.classList.contains('toolkits-ui-theme-modern');
}

function userSettingsFeedbackRoot($root) {
    var $settingsResult = $root.find('#settings-result');
    if ($settingsResult.length) {
        return $settingsResult;
    }
    return $root.find('#result');
}

function loadUserSettingsPreferences($root) {
    if (typeof user_preferences === 'undefined' || !user_preferences) {
        user_preferences = {};
    }

    var themeSelect = $root.find('#toolkits_ui_theme');
    if (themeSelect.length) {
        var savedTheme = user_preferences.toolkits_ui_theme;
        if (savedTheme === 'modern' || savedTheme === 'nottingham') {
            themeSelect.val(savedTheme);
        } else {
            themeSelect.val('nottingham');
            user_preferences.toolkits_ui_theme = 'nottingham';
        }
    }

    function setCheckbox(id, prefKey, defaultValue) {
        var checkbox = $root.find('#' + id);
        if (!checkbox.length) {
            return;
        }
        var value = user_preferences[prefKey];
        if (value === undefined || value === null) {
            checkbox.prop('checked', defaultValue);
            if (id === 'editor_panel_east_open' && defaultValue && typeof save_user_preference === 'function') {
                save_user_preference('editor_panel_east_open', true);
            }
        } else {
            checkbox.prop('checked', value !== false && value !== 'false' && value !== 0 && value !== '0');
        }
    }

    setCheckbox('panel_east_open', 'panel_east_open', true);
    setCheckbox('panel_south_open', 'panel_south_open', true);
    setCheckbox('editor_panel_east_open', 'editor_panel_east_open', true);
    setCheckbox('editor_show_language', 'editor_show_language', false);
    setCheckbox('editor_show_toolbar', 'editor_show_toolbar', false);
    setCheckbox('editor_expand_groups', 'editor_expand_groups', false);
    setCheckbox('editor_expand_tree', 'editor_expand_tree', false);

    // Guided tour: show by default until the user completes/skips it (modern_tour_done).
    var tourCheckbox = $root.find('#modern_show_tour');
    if (tourCheckbox.length) {
        var tourDone = user_preferences.modern_tour_done;
        var showTour = !(tourDone === true || tourDone === 'true' || tourDone === 1 || tourDone === '1');
        tourCheckbox.prop('checked', showTour);
    }

    var editorOpenMode = user_preferences.editor_open_mode;
    if (editorOpenMode !== 'popup' && editorOpenMode !== '_blank' && editorOpenMode !== 'lightbox' && editorOpenMode !== '_self') {
        editorOpenMode = 'popup';
    }
    $root.find('input[name="editor_open_mode"][value="' + editorOpenMode + '"]').prop('checked', true);
}

function initUserSettingsHandlers($root) {
    loadUserSettingsPreferences($root);

    function handleToolkitsThemeChange() {
        var newTheme = $(this).val();
        if (newTheme !== 'nottingham' && newTheme !== 'modern') {
            return;
        }
        if (typeof save_user_preference !== 'function') {
            return;
        }

        var $result = userSettingsFeedbackRoot($root);
        if ($result.length) {
            $result.html('<div>Saving interface theme…</div>');
        }

        save_user_preference('toolkits_ui_theme', newTheme, function() {
            if ($result.length) {
                $result.html('<div>Interface theme saved. Reload the page to apply.</div>');
            }
        });
    }

    $root.find('#toolkits_ui_theme')
        .off('.toolkitsThemeDirect')
        .on('change.toolkitsThemeDirect input.toolkitsThemeDirect blur.toolkitsThemeDirect', handleToolkitsThemeChange);

    $root.find('input[name="editor_open_mode"]').off('change.userSettings').on('change.userSettings', function() {
        if (typeof save_user_preference === 'function') {
            var mode = $(this).val();
            if (mode !== 'popup' && mode !== '_blank' && mode !== 'lightbox' && mode !== '_self') {
                mode = 'popup';
            }
            save_user_preference('editor_open_mode', mode);
        }
    });

    $root.find('#panel_east_open').off('change.userSettings').on('change.userSettings', function() {
        if (typeof save_user_preference === 'function') {
            save_user_preference('panel_east_open', $(this).is(':checked'));
            if (typeof xerteinner_layout !== 'undefined') {
                if ($(this).is(':checked')) {
                    xerteinner_layout.open('east');
                } else {
                    xerteinner_layout.close('east');
                }
            }
        }
    });

    $root.find('#panel_south_open').off('change.userSettings').on('change.userSettings', function() {
        if (typeof save_user_preference === 'function') {
            save_user_preference('panel_south_open', $(this).is(':checked'));
            if (typeof xertemain_layout !== 'undefined') {
                if ($(this).is(':checked')) {
                    xertemain_layout.open('south');
                } else {
                    xertemain_layout.close('south');
                }
            }
        }
    });

    $root.find('#modern_show_tour').off('change.userSettings').on('change.userSettings', function() {
        if (typeof save_user_preference !== 'function') {
            return;
        }
        var showTour = $(this).is(':checked');
        // Store completion flag: done = true means do not auto-show the tour.
        save_user_preference('modern_tour_done', !showTour, function () {
            try {
                if (showTour) {
                    window.localStorage.removeItem('toolkits_modern_tour_done');
                } else {
                    window.localStorage.setItem('toolkits_modern_tour_done', '1');
                }
            } catch (e) { /* ignore */ }
            if (showTour && typeof window.toolkitsModernRestartTour === 'function' &&
                document.body.classList.contains('toolkits-ui-theme-modern')) {
                window.toolkitsModernRestartTour();
            }
        });
    });

    $root.find('#editor_panel_east_open').off('change.userSettings').on('change.userSettings', function() {
        if (typeof save_user_preference === 'function') {
            save_user_preference('editor_panel_east_open', $(this).is(':checked'));
        }
    });

    $root.find('#editor_show_language').off('change.userSettings').on('change.userSettings', function() {
        if (typeof save_user_preference === 'function') {
            save_user_preference('editor_show_language', $(this).is(':checked'));
        }
    });

    $root.find('#editor_show_toolbar').off('change.userSettings').on('change.userSettings', function() {
        if (typeof save_user_preference === 'function') {
            save_user_preference('editor_show_toolbar', $(this).is(':checked'));
        }
    });

    $root.find('#editor_expand_groups').off('change.userSettings').on('change.userSettings', function() {
        if (typeof save_user_preference === 'function') {
            save_user_preference('editor_expand_groups', $(this).is(':checked'));
        }
    });

    $root.find('#editor_expand_tree').off('change.userSettings').on('change.userSettings', function() {
        if (typeof save_user_preference === 'function') {
            save_user_preference('editor_expand_tree', $(this).is(':checked'));
            var expandTreeCb = $('#expand_tree');
            if (expandTreeCb.length > 0) {
                expandTreeCb.prop('checked', $(this).is(':checked'));
                expandTreeCb.trigger('change');
            }
        }
    });
}

function loadUserSettingsFormHtml(section, onSuccess, onError) {
    $.ajax({
        url: site_url + 'website_code/php/get_user_settings_form.php',
        type: 'GET',
        data: { section: section },
        dataType: 'html',
        success: onSuccess,
        error: onError
    });
}

function clearPasswordForm($root) {
    $root.find('#passform input[type=password]').val('');
    $root.find('#result').html('');
}

/**
 * Password change popup and form code:
 */
function changepasswordPopup(focusSection) {
    if (isModernToolkitsTheme()) {
        if (focusSection === 'settings') {
            if (typeof toolkitsModernOpenSettingsModal === 'function') {
                toolkitsModernOpenSettingsModal();
            }
        } else if (focusSection === 'preferences') {
            if (typeof toolkitsModernOpenPreferencesModal === 'function') {
                toolkitsModernOpenPreferencesModal();
            }
        } else if (typeof toolkitsModernOpenPasswordModal === 'function') {
            toolkitsModernOpenPasswordModal();
        }
        return;
    }

    openLegacyUserSettingsDialog(focusSection);
}

function openLegacyUserSettingsDialog(focusSection) {
    var $dialog = $('#change-password-dialog');

    if ($dialog.length === 0) {
        $dialog = $("<div id='change-password-dialog' style='display: none;'></div>");
        $('body').append($dialog);

        if ($('#change-password-dialog-styles').length === 0) {
            $('head').append('<style id="change-password-dialog-styles">' +
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
                '#change-password-dialog .toolkits-user-settings-form__section-title { margin: 8px 0 6px; font-weight: bold; color: #000; } ' +
                '#change-password-dialog .toolkits-editor-open-options { display: flex; flex-direction: column; gap: 6px; } ' +
                '#change-password-dialog .toolkits-editor-open-option { display: flex; align-items: center; gap: 8px; cursor: pointer; color: #000; font-weight: normal; } ' +
                '#change-password-dialog .toolkits-editor-open-option input[type="radio"] { width: auto; margin: 0; cursor: pointer; } ' +
                '#change-password-dialog #toolkits_ui_theme { width: 100%; padding: 6px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 3px; margin-bottom: 4px; } ' +
                '#change-password-dialog .toolkits-theme-settings p { margin-top: 8px; font-size: 0.9em; color: #555; } ' +
                '</style>');
        }

        $dialog.dialog({
            autoOpen: false,
            modal: true,
            width: 450,
            height: 'auto',
            resizable: false,
            title: 'Change Password',
            dialogClass: 'workspace-dialog',
            close: function() {
                clearPasswordForm($dialog);
            }
        });
    }

    loadUserSettingsFormHtml('all', function(html) {
        $dialog.html(html);
        initUserSettingsHandlers($dialog);
        $dialog.dialog('open');

        if (focusSection === 'settings') {
            var panelSettings = $dialog.find('.panel-settings')[0];
            if (panelSettings) {
                panelSettings.scrollIntoView({ block: 'start' });
            }
        } else {
            var oldpassField = $dialog.find('#oldpass')[0];
            if (oldpassField) {
                oldpassField.focus();
            }
        }
    }, function(xhr, status, error) {
        console.error('Error loading password form:', error);
        $dialog.html("<div style='padding: 20px; color: red;'>Error loading password form. Please try again.</div>");
        $dialog.dialog('open');
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
