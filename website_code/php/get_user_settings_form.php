<?php
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.
 *
 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

try {
    require_once("../../config.php");
    require_once("user_library.php");
} catch (Exception $e) {
    header('Content-Type: text/html; charset=utf-8');
    echo "<div style='color: red;'>Error loading config: " . htmlspecialchars($e->getMessage()) . "</div>";
    exit;
}

if(empty($_SESSION['toolkits_logon_id'])) {
    header('Content-Type: text/html; charset=utf-8');
    echo "<div style='color: red;'>Please login</div>";
    exit;
}

_load_language_file("/user_settings.inc");

if (function_exists('ensure_toolkits_ui_theme_preference')) {
    ensure_toolkits_ui_theme_preference(true);
}

header('Content-Type: text/html; charset=utf-8');

$username = isset($_SESSION['toolkits_logon_username']) ? $_SESSION['toolkits_logon_username'] : '';

ob_end_clean();

?>
<div class="workspace-form-container">
    <div class="workspace-form-title">
        <?php echo USER_SETTINGS_PASSWORD_DISPLAY_TITLE; ?>
    </div>
    <div class="workspace-form-area">
        <form id="passform">
            <?php echo '<label for="oldpass">' . USER_SETTINGS_PASSWORD_OLD . '</label>'?>
            <input type='password' id="oldpass">
            <?php echo '<label for="newpass">' . USER_SETTINGS_PASSWORD_NEW . '</label>'?>
            <input type='password' id="newpass">
            <?php echo '<label for="newpassrepeat">' . USER_SETTINGS_PASSWORD_NEW_REPEAT . '</label>'?>
            <input type='password' id="newpassrepeat">
            <?php echo "<button type='button' class='xerte_button' onclick='changePassword(\"". htmlspecialchars($username, ENT_QUOTES) ."\")'>" . USER_SETTINGS_PASSWORD_SUBMIT . "</button>"?>
        </form>
        <div id="result"></div>
        <div class="panel-settings" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ccc;">
            <div class="panel-setting-item" style="margin-bottom: 12px;">
                <label for="toolkits_ui_theme" style="display: block; margin-bottom: 6px;">
                    <?php echo USER_SETTINGS_UI_THEME_LABEL; ?>
                </label>
                <select id="toolkits_ui_theme" name="toolkits_ui_theme" style="width: 100%; max-width: 100%; padding: 6px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 3px;">
                    <option value="nottingham"<?php echo get_toolkits_ui_theme() === 'nottingham' ? ' selected="selected"' : ''; ?>><?php echo USER_SETTINGS_UI_THEME_NOTTINGHAM; ?></option>
                    <option value="modern"<?php echo get_toolkits_ui_theme() === 'modern' ? ' selected="selected"' : ''; ?>><?php echo USER_SETTINGS_UI_THEME_MODERN; ?></option>
                </select>
                <p style="margin-top: 6px; font-size: 0.9em; color: #555;"><?php echo USER_SETTINGS_UI_THEME_HELP; ?></p>
            </div>
            <div class="panel-setting-item">
                <label for="panel_east_open" style="display: inline-block; margin-right: 10px; cursor: pointer;">
                    <input type="checkbox" id="panel_east_open" name="panel_east_open" style="margin-right: 5px; cursor: pointer;">
                    Show Right Panel (Workspace)
                </label>
            </div>
            <div class="panel-setting-item" style="margin-top: 10px;">
                <label for="panel_south_open" style="display: inline-block; margin-right: 10px; cursor: pointer;">
                    <input type="checkbox" id="panel_south_open" name="panel_south_open" style="margin-right: 5px; cursor: pointer;">
                    Show Bottom Panel (Workspace)
                </label>
            </div>
            <div class="panel-setting-item" style="margin-top: 10px;">
                <label for="editor_panel_east_open" style="display: inline-block; margin-right: 10px; cursor: pointer;">
                    <input type="checkbox" id="editor_panel_east_open" name="editor_panel_east_open" style="margin-right: 5px; cursor: pointer;">
                    Show Right Panel (Editor)
                </label>
            </div>
            <div class="panel-setting-item" style="margin-top: 10px;">
                <label for="editor_show_language" style="display: inline-block; margin-right: 10px; cursor: pointer;">
                    <input type="checkbox" id="editor_show_language" name="editor_show_language" style="margin-right: 5px; cursor: pointer;">
                    Show Language Option (Editor)
                </label>
            </div>
            <div class="panel-setting-item" style="margin-top: 10px;">
                <label for="editor_show_toolbar" style="display: inline-block; margin-right: 10px; cursor: pointer;">
                    <input type="checkbox" id="editor_show_toolbar" name="editor_show_toolbar" style="margin-right: 5px; cursor: pointer;">
                    Show Toolbar (Editor)
                </label>
            </div>
            <div class="panel-setting-item" style="margin-top: 10px;">
                <label for="editor_expand_groups" style="display: inline-block; margin-right: 10px; cursor: pointer;">
                    <input type="checkbox" id="editor_expand_groups" name="editor_expand_groups" style="margin-right: 5px; cursor: pointer;">
                    Expand Groups (Editor)
                </label>
            </div>
            <div class="panel-setting-item" style="margin-top: 10px;">
                <label for="editor_expand_tree" style="display: inline-block; margin-right: 10px; cursor: pointer;">
                    <input type="checkbox" id="editor_expand_tree" name="editor_expand_tree" style="margin-right: 5px; cursor: pointer;">
                    Expand Tree (Editor)
                </label>
            </div>
        </div>
    </div>
</div>

