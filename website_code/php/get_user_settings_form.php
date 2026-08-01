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
if (!in_array($section, array('all', 'password', 'settings', 'preferences'), true)) {
    $section = 'all';
}

$isModern = function_exists('get_toolkits_ui_theme') && get_toolkits_ui_theme() === 'modern';

// Preferences section and modern card UI are modern-theme only.
if (!$isModern && $section === 'preferences') {
    $section = 'all';
}

$showPassword = ($section === 'all' || $section === 'password');
$showSettings = ($section === 'all' || $section === 'settings');
$showPreferencesModern = $isModern && ($section === 'all' || $section === 'preferences');
$showPreferencesLegacy = !$isModern && ($section === 'all');

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
<?php if ($showPreferencesLegacy) { ?>
        <div class="panel-setting-item toolkits-user-settings-form__editor-open">
            <p class="toolkits-user-settings-form__section-title"><?php echo USER_SETTINGS_SECTION_EDITOR_OPEN; ?></p>
            <div class="toolkits-editor-open-options">
                <label class="toolkits-editor-open-option">
                    <input type="radio" name="editor_open_mode" value="popup" id="editor_open_mode_popup">
                    <span><?php echo USER_SETTINGS_EDITOR_OPEN_MODE_POPUP; ?></span>
                </label>
                <label class="toolkits-editor-open-option">
                    <input type="radio" name="editor_open_mode" value="_blank" id="editor_open_mode_blank">
                    <span><?php echo USER_SETTINGS_EDITOR_OPEN_MODE_BLANK; ?></span>
                </label>
                <label class="toolkits-editor-open-option">
                    <input type="radio" name="editor_open_mode" value="lightbox" id="editor_open_mode_lightbox">
                    <span><?php echo USER_SETTINGS_EDITOR_OPEN_MODE_LIGHTBOX; ?></span>
                </label>
                <label class="toolkits-editor-open-option">
                    <input type="radio" name="editor_open_mode" value="_self" id="editor_open_mode_self">
                    <span><?php echo USER_SETTINGS_EDITOR_OPEN_MODE_SELF; ?></span>
                </label>
            </div>
        </div>
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
            <label for="modern_show_tour">
                <input type="checkbox" id="modern_show_tour" name="modern_show_tour">
                <?php echo defined('USER_SETTINGS_PREF_MODERN_TOUR') ? USER_SETTINGS_PREF_MODERN_TOUR : 'Show guided tour'; ?>
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
<?php if (!$showPreferencesModern) { ?>
        <div id="settings-result" class="toolkits-user-settings-form__result"></div>
<?php } ?>
    </div>
<?php } ?>
<?php if ($showPreferencesModern) {
    $pref = function ($id, $labelConst, $descConst) {
        $label = defined($labelConst) ? constant($labelConst) : $labelConst;
        $desc = defined($descConst) ? constant($descConst) : '';
        ?>
        <div class="toolkits-pref-row">
            <div class="toolkits-pref-row__text">
                <label class="toolkits-pref-row__title" for="<?php echo htmlspecialchars($id, ENT_QUOTES); ?>"><?php echo htmlspecialchars($label); ?></label>
                <?php if ($desc !== '') { ?>
                    <p class="toolkits-pref-row__desc"><?php echo htmlspecialchars($desc); ?></p>
                <?php } ?>
            </div>
            <label class="toolkits-pref-switch">
                <input type="checkbox" class="toolkits-pref-switch__input" id="<?php echo htmlspecialchars($id, ENT_QUOTES); ?>" name="<?php echo htmlspecialchars($id, ENT_QUOTES); ?>">
                <span class="toolkits-pref-switch__ui" aria-hidden="true"></span>
            </label>
        </div>
        <?php
    };
?>
    <div class="panel-settings toolkits-user-settings-form__preferences toolkits-pref-list">
        <section class="toolkits-pref-card" aria-labelledby="toolkits-pref-workspace-heading">
            <h3 class="toolkits-pref-card__heading" id="toolkits-pref-workspace-heading"><?php echo defined('USER_SETTINGS_PREF_GROUP_WORKSPACE') ? USER_SETTINGS_PREF_GROUP_WORKSPACE : 'Workspace'; ?></h3>
            <?php
            $pref('modern_show_tour', 'USER_SETTINGS_PREF_MODERN_TOUR', 'USER_SETTINGS_PREF_MODERN_TOUR_DESC');
            ?>
        </section>
        <section class="toolkits-pref-card" aria-labelledby="toolkits-pref-editor-open-heading">
            <h3 class="toolkits-pref-card__heading" id="toolkits-pref-editor-open-heading"><?php echo defined('USER_SETTINGS_PREF_GROUP_EDITOR_OPEN') ? USER_SETTINGS_PREF_GROUP_EDITOR_OPEN : USER_SETTINGS_SECTION_EDITOR_OPEN; ?></h3>
            <div class="toolkits-pref-radio-list" role="radiogroup" aria-labelledby="toolkits-pref-editor-open-heading">
                <label class="toolkits-pref-radio">
                    <input type="radio" class="toolkits-pref-radio__input" name="editor_open_mode" value="popup" id="editor_open_mode_popup">
                    <span class="toolkits-pref-radio__control" aria-hidden="true"></span>
                    <span class="toolkits-pref-radio__text"><?php echo USER_SETTINGS_EDITOR_OPEN_MODE_POPUP; ?></span>
                </label>
                <label class="toolkits-pref-radio">
                    <input type="radio" class="toolkits-pref-radio__input" name="editor_open_mode" value="_blank" id="editor_open_mode_blank">
                    <span class="toolkits-pref-radio__control" aria-hidden="true"></span>
                    <span class="toolkits-pref-radio__text"><?php echo USER_SETTINGS_EDITOR_OPEN_MODE_BLANK; ?></span>
                </label>
                <label class="toolkits-pref-radio">
                    <input type="radio" class="toolkits-pref-radio__input" name="editor_open_mode" value="lightbox" id="editor_open_mode_lightbox">
                    <span class="toolkits-pref-radio__control" aria-hidden="true"></span>
                    <span class="toolkits-pref-radio__text"><?php echo USER_SETTINGS_EDITOR_OPEN_MODE_LIGHTBOX; ?></span>
                </label>
                <label class="toolkits-pref-radio">
                    <input type="radio" class="toolkits-pref-radio__input" name="editor_open_mode" value="_self" id="editor_open_mode_self">
                    <span class="toolkits-pref-radio__control" aria-hidden="true"></span>
                    <span class="toolkits-pref-radio__text"><?php echo USER_SETTINGS_EDITOR_OPEN_MODE_SELF; ?></span>
                </label>
            </div>
        </section>
        <section class="toolkits-pref-card" aria-labelledby="toolkits-pref-editor-heading">
            <h3 class="toolkits-pref-card__heading" id="toolkits-pref-editor-heading"><?php echo defined('USER_SETTINGS_PREF_GROUP_EDITOR') ? USER_SETTINGS_PREF_GROUP_EDITOR : 'Editor'; ?></h3>
            <?php
            $pref('editor_panel_east_open', 'USER_SETTINGS_PREF_EDITOR_PANEL_EAST', 'USER_SETTINGS_PREF_EDITOR_PANEL_EAST_DESC');
            $pref('editor_show_language', 'USER_SETTINGS_PREF_EDITOR_LANGUAGE', 'USER_SETTINGS_PREF_EDITOR_LANGUAGE_DESC');
            $pref('editor_show_toolbar', 'USER_SETTINGS_PREF_EDITOR_TOOLBAR', 'USER_SETTINGS_PREF_EDITOR_TOOLBAR_DESC');
            $pref('editor_expand_groups', 'USER_SETTINGS_PREF_EDITOR_EXPAND_GROUPS', 'USER_SETTINGS_PREF_EDITOR_EXPAND_GROUPS_DESC');
            $pref('editor_expand_tree', 'USER_SETTINGS_PREF_EDITOR_EXPAND_TREE', 'USER_SETTINGS_PREF_EDITOR_EXPAND_TREE_DESC');
            ?>
        </section>
        <div id="settings-result" class="toolkits-user-settings-form__result"></div>
    </div>
<?php } ?>
</div>
