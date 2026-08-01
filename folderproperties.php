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
require_once(dirname(__FILE__) . "/config.php");
_load_language_file("/folderproperties.inc");
$version = getVersion();

$body_classes = array(toolkits_ui_theme_body_class());
if ($xerte_toolkits_site->rights == 'elevated') {
    $body_classes[] = 'elevated';
}
$properties_embed = isset($_GET['embed']) && (string) $_GET['embed'] === '1';
if ($properties_embed) {
    $body_classes[] = 'properties-embed';
}
$body_class_attr = htmlspecialchars(implode(' ', $body_classes), ENT_QUOTES, 'UTF-8');

// Resolve folder_id from query string or apache-style folderproperties_123_folder URL.
$folder_properties_id = 0;
if (isset($_GET['folder_id']) && is_numeric($_GET['folder_id'])) {
    $folder_properties_id = (int) $_GET['folder_id'];
} elseif (!empty($_SERVER['REQUEST_URI']) && preg_match('/folderproperties[_-](\d+)/', $_SERVER['REQUEST_URI'], $folder_uri_match)) {
    $folder_properties_id = (int) $folder_uri_match[1];
    $_GET['folder_id'] = $folder_properties_id;
}
$folder_window_name = $folder_properties_id > 0 ? ($folder_properties_id . '_folder') : '';

?><!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title><?PHP echo FOLDERPROPERTIES_TITLE; ?></title>

<link href="website_code/styles/properties_tab.css" media="screen" type="text/css" rel="stylesheet" />
<link href="website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
<link href="website_code/styles/xerte_buttons.css" media="screen" type="text/css" rel="stylesheet" />
<link rel="stylesheet" type="text/css" href="modules/common/fontawesome-6.6.0/css/all.min.css">
<link rel="stylesheet" type="text/css" href="modules/common/fontawesome-6.6.0/css/v4-shims.min.css">
<link rel="stylesheet" type="text/css" href="modules/common/fontawesome-6.6.0/css/v5-font-face.min.css">

<script type="text/javascript" language="javascript" src="website_code/scripts/validation.js"></script>
<script src="modules/common/js/jquery-1.9.1.min.js"></script>
<script>window.jQuery || document.write('<script src="editor/js/vendor/jquery-1.9.1.min.js"><\/script>')</script>

<script type="text/javascript">
    var site_url = "<?php echo $xerte_toolkits_site->site_url; ?>";
    var ajax_php_path = "website_code/php/";
    <?php if ($folder_window_name !== '') { ?>
    // folderproperties_tab.js expects window.name like "123_folder" (from window.open).
    window.name = "<?php echo $folder_window_name; ?>";
    <?php } ?>
    try {
        if (window.parent && window.parent !== window) {
            window.window_reference = window.parent;
        }
    } catch (e) { /* cross-window reference unavailable */ }

    function toolkitsFolderPropertiesOnUnload() {
        try {
            if (window.parent && window.parent !== window && typeof window.parent.refresh_workspace === 'function') {
                window.parent.refresh_workspace();
                return;
            }
            if (window.opener && !window.opener.closed && typeof window.opener.refresh_workspace === 'function') {
                window.opener.refresh_workspace();
            }
        } catch (e) { /* cross-window refresh unavailable */ }
    }
</script>

<?php
_include_javascript_file("website_code/scripts/template_management.js");
_include_javascript_file("website_code/scripts/properties_tab.js");
_include_javascript_file("website_code/scripts/folderproperties_tab.js");
_include_javascript_file("website_code/scripts/ajax_management.js");

if (file_exists($xerte_toolkits_site->root_file_path . "branding/branding.css")) {
    echo '<link href="branding/branding.css" rel="stylesheet" type="text/css">' . "\n";
}
if (function_exists('get_toolkits_ui_theme') && get_toolkits_ui_theme() === 'modern') {
    echo '<link href="theme/modern/properties.css?version=' . htmlspecialchars($version, ENT_QUOTES, 'UTF-8') . '" media="screen" type="text/css" rel="stylesheet" />' . "\n";
}
?>

</head>

<body class="<?php echo $body_class_attr; ?>" onload="javascript:folderproperties();" onunload="javascript:toolkitsFolderPropertiesOnUnload()">

	<div class="properties_main">
		<div class="main_area">
			<div id="title">
				<h1><i class="fa fa-info-circle xerte-icon"></i><?php echo FOLDERPROPERTIES_DISPLAY_TITLE; ?></h1>
			</div>
			<div id="data_area">

				<div id="menu_tabs">

					<div id="tabs" role="tablist">

						<button id="tabFolder" type="button" role="tab" aria-controls="panelFolder" aria-selected="true" class="tabSelected" onclick="javascript:folderproperties(); tabClicked('tabFolder');">
							<i class="fa fa-folder fa-fw xerte-icon"></i>&nbsp;<?PHP echo FOLDERPROPERTIES_TAB_FOLDER; ?>
						</button>

						<button id="tabContent" type="button" role="tab" aria-controls="panelContent" aria-selected="false" onclick="javascript:folder_content(); tabClicked('tabContent');">
							<i class="fa fa-file-text fa-fw xerte-icon"></i>&nbsp;<?PHP echo FOLDERPROPERTIES_TAB_CONTENT; ?>
						</button>

						<button id="tabRss" type="button" role="tab" aria-controls="panelRss" aria-selected="false" onclick="javascript:folder_rss(); tabClicked('tabRss');">
							<i class="fa fa-rss fa-fw xerte-icon"></i>&nbsp;<?PHP echo FOLDERPROPERTIES_TAB_RSS; ?>
						</button>

						<button id="tabSyn" type="button" role="tab" aria-controls="panelSyn" aria-selected="false" onclick="javascript:sharing_status_folder(); tabClicked('tabSyn');">
							<i class="fa fa-share fa-fw xerte-icon"></i>&nbsp;<?PHP echo FOLDERPROPERTIES_TAB_SHARED; ?>
						</button>

					</div>

					<div id="dynamic_area">

						<div id="panelFolder" class="tabPanel" role="tabpanel" aria-labelledby="tabFolder"></div>
						<div id="panelContent" class="tabPanel" role="tabpanel" aria-labelledby="tabContent"></div>
						<div id="panelRss" class="tabPanel" role="tabpanel" aria-labelledby="tabRss"></div>
						<div id="panelSyn" class="tabPanel" role="tabpanel" aria-labelledby="tabSyn"></div>

					</div>

				</div>
			</div>
			<div style="clear:both;"></div>
		</div>
	</div>

</body>
</html>
