/**
 * Inject shell markup as direct children of document.body.
 * jQuery UI Layout (setupMainLayout) requires body > .ui-layout-north|center|south.
 */
function toolkitsIndexAppendShellToBody(html, beforeNode) {
    var holder = document.createElement('div');
    holder.innerHTML = html;
    var body = document.body;
    while (holder.firstChild) {
        if (beforeNode && beforeNode.parentNode === body) {
            body.insertBefore(holder.firstChild, beforeNode);
        } else {
            body.appendChild(holder.firstChild);
        }
    }
}

/**
 * Nottingham toolkits UI theme — injects the classic index.php workspace shell.
 */
function renderToolkitsIndexShell() {
    var cfg = window.toolkits_index_config || {};
    var s = cfg.strings || {};
    var user = cfg.user || {};
    var logos = cfg.logos || {};
    var footer = cfg.footer || {};
    var mount = document.getElementById('toolkits-index-mount');
    if (!mount) {
        return;
    }
    if (mount.getAttribute('data-toolkits-shell-loaded') === 'true') {
        return;
    }

    var userbarExtras = '';
    if (user.canManageUser) {
        userbarExtras += '<div class="settingsDropdown">' +
            '<button onclick="changepasswordPopup()" title="' + s.changePassword + '" class="xerte_workspace_button settingsButton">' +
            '<i class="fa fa-cog xerte-icon"></i></button></div>';
    }
    if (user.hasManagementRole) {
        userbarExtras += '<button onclick="javascript:elevate(\'management.php\')" title="' + s.toManagement + '" class="xerte_workspace_button ">' +
            '<i class="fas fa-tools xerte-icon"></i></button>';
    }

    var logoutBtn = '';
    if (!user.isGuest) {
        logoutBtn = '<button title="' + s.logout + '" type="button" class="xerte_workspace_button" ' +
            'onclick="javascript:logout(' + (user.samlLogout ? 'true' : 'false') + ')">' +
            '<i class="fa fa-sign-out xerte-icon"></i></button>';
    }

    var html =
        '<div class="folder_popup" id="message_box">' +
            '<div class="main_area" id="dynamic_section">' +
                '<p style="color:white">' + s.folderPrompt + '</p>' +
                '<form id="foldernamepopup" action="javascript:create_folder()" method="post" enctype="text/plain">' +
                    '<label for="foldername" class="sr-only">' + s.folderName + '</label>' +
                    '<input type="text" width="200" id="foldername" name="foldername" style="margin:0px; margin-right:5px; padding:3px"/>' +
                    '<button type="submit" class="xerte_button_c">' + s.folderCreate + '</button>' +
                    '<button type="button" class="xerte_button_c" style="margin-top:0.5em;" onclick="javascript:popup_close()">' + s.folderCancel + '</button>' +
                '</form>' +
                '<p><span id="folder_feedback"></span></p>' +
            '</div>' +
        '</div>' +

        '<div class="dashboard-wrapper" id="dashboard-wrapper">' +
            '<div class="dashboard" id="dashboard">' +
                '<div id="options-div">' +
                    '<div class="row dash-row">' +
                        '<div class="dash-col unanonymous-view">' +
                            '<label for="dp-unanonymous-view">' + s.xapiShowNames + '</label>' +
                            '<input type="checkbox" id="dp-unanonymous-view">' +
                        '</div>' +
                        '<div class="dash-col">' +
                            '<label for="dp-start">' + s.xapiFrom + '</label>' +
                            '<input type="text" id="dp-start" value="2018/03/24 21:23" data-test="2018/03/24 21:23">' +
                        '</div>' +
                        '<div class="dash-col-1">' +
                            '<label for="dp-end">' + s.xapiUntil + '</label>' +
                            '<input type="text" id="dp-end">' +
                        '</div>' +
                        '<div class="dash-col-1">' +
                            '<label for="group-select">' + s.xapiGroupSelect + '</label>' +
                            '<select id="group-select"><option value="all-groups">' + s.xapiGroupAll + '</option></select>' +
                        '</div>' +
                        '<div class="close-button">' +
                            '<button type="button" class="xerte_button_c_no_width" onclick="javascript:close_dashboard()">' + s.xapiClose + '</button>' +
                        '</div>' +
                        '<div class="show-display-options-button">' +
                            '<button type="button" class="xerte_button_c_no_width">' + s.xapiDisplayOptions + '</button>' +
                        '</div>' +
                        '<div class="show-question-overview-button">' +
                            '<button type="button" class="xerte_button_c_no_width">' + s.xapiQuestionOverview + '</button>' +
                        '</div>' +
                        '<div class="dashboard-print-button">' +
                            '<button type="button" class="xerte_button_c_no_width">' + s.xapiPrint + '</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div id="dashboard-title"></div>' +
                '<div class="jorneyData-container"><div id="journeyData" class="journeyData journey-container"></div></div>' +
            '</div>' +
        '</div>' +

        '<div class="ui-layout-north"><header>' +
            '<div class="content" id="mainHeader">' +
                '<div class="topbar">' +
                    '<div style="width:50%; height:100%; float:right; position:relative; background-image:url(' + logos.right + '); background-repeat:no-repeat; background-position:right; margin-right:10px; float:right"></div>' +
                    '<img src="' + logos.left + '" style="margin-left:10px; float:left" alt="' + s.logoAlt + '"/>' +
                '</div>' +
                '<div class="buttonbar">' +
                    '<div class="file_mgt_area_top"></div>' +
                    '<div class="userbar">' +
                        (user.displayName || '') +
                        userbarExtras +
                        '<div style="display: inline-block">' + (cfg.languageFormHtml || '') + '</div>' +
                        logoutBtn +
                    '</div>' +
                    '<div style="clear:both;"></div>' +
                    '<div class="separator"></div>' +
                '</div>' +
            '</div>' +
        '</header></div>' +

        toolkitsIndexWorkspaceHtml(cfg) +

        '<div class="ui-layout-south"><div class="content">' +
            '<section class="help" style="width:31%;float:left;">' + (footer.podOneHtml || '') + '</section>' +
            '<section class="help" style="width:31%;float:left;">' + (footer.podTwoHtml || '') + '</section>' +
            '<section class="highlightbox" style="width:31%;float:right;">' + (footer.newsHtml || '') + '</section>' +
            '<div class="border"></div>' +
            '<footer>' +
                '<p class="copyright">' + (footer.copyright || '') +
                    ' <i class="fa fa-info-circle" aria-hidden="true" style="color:#f86718; cursor: help;" title="' + (footer.versionInfo || '') + '"></i></p>' +
                '<div class="footerlogos">' +
                    '<a href="https://xot.xerte.org.uk/play.php?template_id=214#home" target="_blank" title="Xerte accessibility statement">' +
                        '<img src="website_code/images/wcag2.2AA-blue.png" border="0" alt="' + s.wcagAlt + '"></a>' +
                    '<a href="https://opensource.org/" target="_blank" title="Open Source Initiative">' +
                        '<img src="website_code/images/osiFooterLogo.png" border="0" alt="' + s.osiAlt + '"></a>' +
                    '<a href="https://www.apereo.org" target="_blank" title="Apereo">' +
                        '<img src="website_code/images/apereoFooterLogo.png" border="0" alt="' + s.apereoAlt + '"></a>' +
                    '<a href="https://xerte.org.uk" target="_blank" title="Xerte">' +
                        '<img src="website_code/images/xerteFooterLogo.png" border="0" alt="' + s.xerteAlt + '"></a>' +
                '</div>' +
            '</footer>' +
            '<div style="clear:both;"></div>' +
        '</div></div>';

    toolkitsIndexAppendShellToBody(html, mount);
    mount.setAttribute('data-toolkits-shell-loaded', 'true');
    mount.innerHTML = '';
    mount.style.display = 'none';
}

/**
 * Shared workspace layout (west / center / east) used by Nottingham and Modern themes.
 */
function toolkitsIndexWorkspaceHtml(cfg) {
    var s = (cfg && cfg.strings) ? cfg.strings : {};
    var blankTemplatesHtml = (cfg && cfg.blankTemplatesHtml) ? cfg.blankTemplatesHtml : '';

    return '<div class="ui-layout-center" id="pagecontainer" role="main">' +
        '<div class="ui-layout-west" id="workspace_layout">' +
            '<div class="header" id="inner_left_header">' +
                '<h1 class="heading sr-only">' + s.details + '</h1>' +
                '<div class="file_mgt_area_buttons">' +
                    '<div class="file_mgt_area_middle_button_left">' +
                        '<button title="' + s.edit + '" type="button" class="xerte_workspace_button disabled" disabled="disabled" id="edit">' +
                            '<i class="fa fa-pencil-square-o xerte-icon"></i></button>' +
                        '<button title="' + s.properties + '" type="button" class="xerte_workspace_button disabled" disabled="disabled" id="properties">' +
                            '<i class="fa fa-info xerte-icon"></i></button>' +
                        '<button title="' + s.preview + '" type="button" class="xerte_workspace_button disabled" disabled="disabled" id="preview">' +
                            '<i class="fa fa-play xerte-icon"></i></button>' +
                    '</div>' +
                    '<div class="file_mgt_area_middle_button_left">' +
                        '<button title="' + s.newFolder + '" type="button" class="xerte_workspace_button" id="newfolder" onClick="javascript:make_new_folder()">' +
                            '<i class="fa fa-folder xerte-icon"></i></button>' +
                    '</div>' +
                    '<div class="file_mgt_area_middle_button_right">' +
                        '<button title="' + s.delete + '" type="button" class="xerte_workspace_button disabled" disabled="disabled" id="delete">' +
                            '<i class="fa fa-trash xerte-icon"></i></button>' +
                        '<button title="' + s.duplicate + '" type="button" class="xerte_workspace_button disabled" disabled="disabled" id="duplicate">' +
                            '<i class="fa fa-copy xerte-icon"></i></button>' +
                        '<button title="' + s.publish + '" type="button" class="xerte_workspace_button disabled" disabled="disabled" id="publish">' +
                            '<i class="fa fa-share xerte-icon"></i></button>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="content"><div id="workspace"></div></div>' +
            '<div class="footer" id="sortContainer">' +
                '<div class="file_mgt_area_bottom">' +
                    '<div class="sorter">' +
                        '<form name="sorting" style="float:left;margin:7px 5px 5px 10px;">' +
                            '<i class="fa fa-sort xerte-icon"></i>&nbsp;<label for="sort-selector">' + s.sort + '</label>' +
                            '<select id="sort-selector" name="type" onChange="refresh_workspace(); save_user_preference(\'sort_type\', this.value);">' +
                                '<option value="alpha_up">' + s.sortA + '</option>' +
                                '<option value="alpha_down">' + s.sortZ + '</option>' +
                                '<option value="date_down" selected>' + s.sortNew + '</option>' +
                                '<option value="date_up">' + s.sortOld + '</option>' +
                            '</select>' +
                        '</form>' +
                    '</div>' +
                    '<div class="workspace_search_outer">' +
                        '<div class="workspace_search">' +
                            '<i class="fa fa-search"></i>&nbsp;<label for="workspace_search">' + s.search + '</label>' +
                            '<input type="text" id="workspace_search" placeholder="' + s.searchPlaceholder + '">' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div class="ui-layout-center">' +
            '<div class="header" id="inner_center_header">' +
                '<h1 class="heading"><i class="fa icon-info-sign xerte-icon"></i>&nbsp;' + s.details + '</h1>' +
            '</div>' +
            '<div class="content"><div class="projectInformationContainer" id="project_information"></div></div>' +
            '<div class="footer" id="inner_center_footer"></div>' +
        '</div>' +
        '<div class="ui-layout-east">' +
            '<div class="header" id="inner_right_header">' +
                '<h1 class="heading"><i class="fa icon-wrench xerte-icon"></i>&nbsp;' + s.create + '</h1>' +
            '</div>' +
            '<div class="content">' +
                '<div class="new_template_area_middle">' +
                    '<div id="new_template_area_middle_ajax" class="new_template_area_middle_scroll">' + blankTemplatesHtml + '</div>' +
                '</div>' +
            '</div>' +
            '<div class="footer" id="inner_right_footer"></div>' +
        '</div>' +
    '</div>';
}
