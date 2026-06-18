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
$section = isset($_GET['section']) ? $_GET['section'] : 'all';
if (!in_array($section, array('all', 'password', 'settings'), true)) {
    $section = 'all';
}

$showPassword = ($section === 'all' || $section === 'password');
$showSettings = ($section === 'all' || $section === 'settings');

ob_end_clean();

?>
<div class="toolkits-user-settings-form workspace-form-container">
<?php if ($showPassword) { ?>
    <div class="workspace-form-area toolkits-user-settings-form__password">
        <form id="passform">
            <div class="toolkits-user-settings-form__field">
                <?php echo '<label for="oldpass">' . USER_SETTINGS_PASSWORD_OLD . '</label>'?>
                <input type="password" id="oldpass" autocomplete="current-password">
            </div>
            <div class="toolkits-user-settings-form__field">
                <?php echo '<label for="newpass">' . USER_SETTINGS_PASSWORD_NEW . '</label>'?>
                <input type="password" id="newpass" autocomplete="new-password">
            </div>
            <div class="toolkits-user-settings-form__field">
                <?php echo '<label for="newpassrepeat">' . USER_SETTINGS_PASSWORD_NEW_REPEAT . '</label>'?>
                <input type="password" id="newpassrepeat" autocomplete="new-password">
            </div>
            <div class="toolkits-user-settings-form__actions">
                <?php echo "<button type='button' class='xerte_button toolkits-modern-btn toolkits-modern-btn--primary' onclick='changePassword(\"". htmlspecialchars($username, ENT_QUOTES) ."\")'>" . USER_SETTINGS_PASSWORD_SUBMIT . "</button>"?>
            </div>
        </form>
        <div id="result" class="toolkits-user-settings-form__result"></div>
    </div>
<?php } ?>
<?php if ($showSettings) { ?>
    <div class="panel-settings toolkits-user-settings-form__settings">
        <div class="panel-setting-item toolkits-user-settings-form__field">
            <label for="toolkits_ui_theme">
                <?php echo USER_SETTINGS_UI_THEME_LABEL; ?>
            </label>
            <select id="toolkits_ui_theme" name="toolkits_ui_theme">
                <option value="nottingham"<?php echo get_toolkits_ui_theme() === 'nottingham' ? ' selected="selected"' : ''; ?>><?php echo USER_SETTINGS_UI_THEME_NOTTINGHAM; ?></option>
                <option value="modern"<?php echo get_toolkits_ui_theme() === 'modern' ? ' selected="selected"' : ''; ?>><?php echo USER_SETTINGS_UI_THEME_MODERN; ?></option>
            </select>
            <p class="toolkits-user-settings-form__help"><?php echo USER_SETTINGS_UI_THEME_HELP; ?></p>
        </div>
<?php if ($section === 'all') { ?>
        <div class="panel-setting-item toolkits-user-settings-form__checkbox">
            <label for="panel_east_open">
                <input type="checkbox" id="panel_east_open" name="panel_east_open">
                Show Right Panel (Workspace)
            </label>
        </div>
        <div class="panel-setting-item toolkits-user-settings-form__checkbox">
            <label for="panel_south_open">
                <input type="checkbox" id="panel_south_open" name="panel_south_open">
                Show Bottom Panel (Workspace)
            </label>
        </div>
        <div class="panel-setting-item toolkits-user-settings-form__checkbox">
            <label for="editor_panel_east_open">
                <input type="checkbox" id="editor_panel_east_open" name="editor_panel_east_open">
                Show Right Panel (Editor)
            </label>
        </div>
        <div class="panel-setting-item toolkits-user-settings-form__checkbox">
            <label for="editor_show_language">
                <input type="checkbox" id="editor_show_language" name="editor_show_language">
                Show Language Option (Editor)
            </label>
        </div>
        <div class="panel-setting-item toolkits-user-settings-form__checkbox">
            <label for="editor_show_toolbar">
                <input type="checkbox" id="editor_show_toolbar" name="editor_show_toolbar">
                Show Toolbar (Editor)
            </label>
        </div>
        <div class="panel-setting-item toolkits-user-settings-form__checkbox">
            <label for="editor_expand_groups">
                <input type="checkbox" id="editor_expand_groups" name="editor_expand_groups">
                Expand Groups (Editor)
            </label>
        </div>
        <div class="panel-setting-item toolkits-user-settings-form__checkbox">
            <label for="editor_expand_tree">
                <input type="checkbox" id="editor_expand_tree" name="editor_expand_tree">
                Expand Tree (Editor)
            </label>
        </div>
<?php } ?>
        <div id="settings-result" class="toolkits-user-settings-form__result"></div>
    </div>
<?php } ?>
</div>
