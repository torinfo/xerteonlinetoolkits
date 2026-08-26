/**
 * Modern toolkits UI theme — dashboard shell + workspace panel.
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

function renderToolkitsIndexShell() {
    var cfg = window.toolkits_index_config || {};
    var s = cfg.strings || {};
    var logos = cfg.logos || {};
    var mount = document.getElementById('toolkits-index-mount');
    if (!mount) {
        return;
    }

    var navGroups = [
        [
            { id: 'all', icon: 'fa-table-cells-large', label: s.modernNavAll, action: 'all' }
        ],
        [
            { id: 'recent', icon: 'fa-clock', label: s.modernNavRecent, action: 'recent', countKey: 'recent' },
            { id: 'published', icon: 'fa-tower-broadcast', label: s.modernNavPublished, action: 'published', countKey: 'published' },
            { id: 'favourites', icon: 'fa-heart', label: s.modernNavFavourites, action: 'favourites', countKey: 'favourites' },
            { id: 'trash', icon: 'fa-trash', label: s.modernNavTrash, action: 'trash', countKey: 'trash' }
        ],
        [
            { id: 'guides', icon: 'fa-book', label: s.modernNavGuides, action: 'guides' }
        ]
    ];

    var navHtml = '';
    navGroups.forEach(function (group, groupIndex) {
        navHtml += '<div class="toolkits-modern-nav__group">';
        group.forEach(function (item, itemIndex) {
            var active = groupIndex === 0 && itemIndex === 0 ? ' toolkits-modern-nav__item--active' : '';
            var badgeHtml = item.countKey
                ? '<span class="toolkits-modern-nav__badge" data-modern-nav-count="' + item.countKey + '">0</span>'
                : '';
            if (item.href) {
                navHtml += '<a href="' + item.href + '" target="_blank" rel="noopener" class="toolkits-modern-nav__item toolkits-modern-nav__item--link' + active + '">' +
                    '<i class="fa ' + item.icon + ' toolkits-modern-nav__icon"></i>' +
                    '<span class="toolkits-modern-nav__label">' + item.label + '</span>' +
                    badgeHtml +
                '</a>';
            } else {
                navHtml += '<button type="button" class="toolkits-modern-nav__item' + active + '" data-modern-view="' + item.action + '" data-modern-nav="' + item.id + '">' +
                    '<i class="fa ' + item.icon + ' toolkits-modern-nav__icon"></i>' +
                    '<span class="toolkits-modern-nav__label">' + item.label + '</span>' +
                    badgeHtml +
                '</button>';
            }
        });
        navHtml += '</div>';
        if (groupIndex === 1) {
            navHtml += '<hr class="toolkits-modern-nav__hr" aria-hidden="true">' +
                '<hr class="toolkits-modern-nav__hr" aria-hidden="true">';
        } else if (groupIndex === 2) {
            navHtml += '<hr class="toolkits-modern-nav__hr" aria-hidden="true">';
        }
    });

    mount.innerHTML =
        '<div class="toolkits-modern-folder-modal" id="message_box" hidden>' +
            '<div class="toolkits-modern-folder-modal__backdrop" data-folder-modal-close></div>' +
            '<div class="toolkits-modern-folder-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="toolkits-modern-folder-modal-title">' +
                '<div class="toolkits-modern-folder-modal__header">' +
                    '<h2 class="toolkits-modern-folder-modal__title" id="toolkits-modern-folder-modal-title">' +
                        (s.modernNewFolder || s.newFolder || 'New folder') +
                    '</h2>' +
                    '<button type="button" class="toolkits-modern-folder-modal__close" data-folder-modal-close aria-label="' + (s.folderCancel || 'Close') + '">' +
                        '<i class="fa fa-times" aria-hidden="true"></i>' +
                    '</button>' +
                '</div>' +
                '<div class="toolkits-modern-folder-modal__body" id="dynamic_section">' +
                    '<p class="toolkits-modern-folder-modal__prompt">' + s.folderPrompt + '</p>' +
                    '<form id="foldernamepopup" action="javascript:create_folder()" method="post" enctype="text/plain">' +
                        '<label class="toolkits-modern-folder-modal__label" for="foldername">' + (s.folderName || 'Folder name') + '</label>' +
                        '<input type="text" id="foldername" name="foldername" class="toolkits-modern-folder-modal__input" autocomplete="off"/>' +
                        '<div class="toolkits-modern-folder-modal__actions">' +
                            '<button type="button" class="toolkits-modern-folder-modal__btn toolkits-modern-folder-modal__btn--secondary" data-folder-modal-close>' +
                                (s.folderCancel || 'Cancel') +
                            '</button>' +
                            '<button type="submit" class="toolkits-modern-folder-modal__btn toolkits-modern-folder-modal__btn--primary">' +
                                (s.folderCreate || 'Create') +
                            '</button>' +
                        '</div>' +
                    '</form>' +
                    '<p class="toolkits-modern-folder-modal__feedback"><span id="folder_feedback"></span></p>' +
                '</div>' +
            '</div>' +
        '</div>' +

        '<div class="toolkits-modern-import-modal" id="toolkits-modern-import-modal" hidden>' +
            '<div class="toolkits-modern-import-modal__backdrop" data-import-modal-close></div>' +
            '<div class="toolkits-modern-import-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="toolkits-modern-import-modal-title">' +
                '<div class="toolkits-modern-import-modal__header">' +
                    '<h2 class="toolkits-modern-import-modal__title" id="toolkits-modern-import-modal-title">' +
                        (s.modernImport || 'Import') +
                    '</h2>' +
                    '<button type="button" class="toolkits-modern-import-modal__close" data-import-modal-close aria-label="' + (s.folderCancel || 'Close') + '">' +
                        '<i class="fa fa-times" aria-hidden="true"></i>' +
                    '</button>' +
                '</div>' +
                '<div class="toolkits-modern-import-modal__body">' +
                    '<p class="toolkits-modern-import-modal__prompt">' +
                        (s.modernImportInstructions || 'Import a project that has been exported from another Xerte installation. Enter a name for the imported project, then choose a zip file to upload.') +
                    '</p>' +
                    '<form target="upload_iframe" method="post" onsubmit="javascript:iframe_check_initialise(1);" enctype="multipart/form-data" id="importpopup" name="importform" action="website_code/php/import/import.php">' +
                        '<label class="toolkits-modern-import-modal__label" for="templatename">' +
                            (s.modernImportProjectName || 'New project name') +
                        '</label>' +
                        '<input id="templatename" name="templatename" type="text" class="toolkits-modern-import-modal__input" onkeyup="new_template_name()" autocomplete="off"/>' +
                        '<div id="namewrong" class="toolkits-modern-import-modal__namewrong"></div>' +
                        '<label class="toolkits-modern-import-modal__label" for="filenameuploaded">' +
                            (s.modernImportFileLabel || 'Zip file') +
                        '</label>' +
                        '<div id="filenameuploaded_container" class="toolkits-modern-import-modal__file">' +
                            '<input name="filenameuploaded" id="filenameuploaded" type="file" accept=".zip,application/zip"/>' +
                        '</div>' +
                        '<div class="toolkits-modern-import-modal__actions">' +
                            '<button type="button" class="toolkits-modern-import-modal__btn toolkits-modern-import-modal__btn--secondary" data-import-modal-close>' +
                                (s.folderCancel || 'Cancel') +
                            '</button>' +
                            '<button id="submitbutton" type="submit" name="submitBtn" onclick="javascript:load_button_spinner(this);" class="toolkits-modern-import-modal__btn toolkits-modern-import-modal__btn--primary" disabled="disabled">' +
                                '<i class="fa fa-upload" aria-hidden="true"></i> ' + (s.modernImportUpload || 'Upload') +
                            '</button>' +
                        '</div>' +
                    '</form>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<iframe id="upload_iframe" name="upload_iframe" src="" title="" style="width:0;height:0;border:0;position:absolute;left:-9999px;"></iframe>' +
        '<div id="errorpopup" title="' + (s.modernImport || 'Import') + '" style="display:none"></div>' +

        '<div class="dashboard-wrapper" id="dashboard-wrapper">' +
            '<div class="dashboard" id="dashboard">' +
                '<div id="options-div"><div class="row dash-row">' +
                    '<div class="dash-col unanonymous-view"><label for="dp-unanonymous-view">' + s.xapiShowNames + '</label><input type="checkbox" id="dp-unanonymous-view"></div>' +
                    '<div class="dash-col"><label for="dp-start">' + s.xapiFrom + '</label><input type="text" id="dp-start" value="2018/03/24 21:23"></div>' +
                    '<div class="dash-col-1"><label for="dp-end">' + s.xapiUntil + '</label><input type="text" id="dp-end"></div>' +
                    '<div class="dash-col-1"><label for="group-select">' + s.xapiGroupSelect + '</label><select id="group-select"><option value="all-groups">' + s.xapiGroupAll + '</option></select></div>' +
                    '<div class="close-button"><button type="button" class="xerte_button_c_no_width" onclick="javascript:close_dashboard()">' + s.xapiClose + '</button></div>' +
                '</div></div>' +
                '<div id="dashboard-title"></div>' +
                '<div class="jorneyData-container"><div id="journeyData" class="journeyData journey-container"></div></div>' +
            '</div>' +
        '</div>' +

        '<div class="toolkits-modern-app">' +
            '<aside class="toolkits-modern-sidebar" aria-label="Main navigation">' +
                '<div class="toolkits-modern-sidebar__brand">' +
                    '<img src="' + logos.left + '" alt="' + s.logoAlt + '" class="toolkits-modern-sidebar__logo"/>' +
                '</div>' +
                '<div class="toolkits-modern-sidebar__search">' +
                    '<i class="fa fa-search" aria-hidden="true"></i>' +
                    '<input type="search" id="toolkits-modern-sidebar-search" placeholder="' + s.modernSearch + '" autocomplete="off"/>' +
                '</div>' +
                toolkitsModernCreateButtonHtml(s) +
                '<nav class="toolkits-modern-nav">' + navHtml + '</nav>' +
                '<div class="toolkits-modern-sidebar__badges">' +
                        '<a href="https://www.apereo.org" target="_blank" rel="noopener" title="Apereo">' +
                            '<img src="website_code/images/apereoFooterLogo.png" alt="' + s.apereoAlt + '"/>' +
                        '</a>' +
                        '<a href="https://xot.xerte.org.uk/play.php?template_id=214#home" target="_blank" rel="noopener" title="Xerte accessibility statement">' +
                            '<img src="website_code/images/wcag2.1AA-blue-v.png" alt="' + s.wcagAlt + '"/>' +
                        '</a>' +
                        '<a href="https://opensource.org/" target="_blank" rel="noopener" title="Open Source Initiative">' +
                            '<img src="website_code/images/osiFooterLogo.png" alt="' + s.osiAlt + '"/>' +
                        '</a>' +
                '</div>' +
            '</aside>' +

            '<div class="toolkits-modern-main">' +
                toolkitsModernTopbarHtml(cfg) +

                '<div class="toolkits-modern-home" id="toolkits-modern-home">' +
                    '<section class="toolkits-modern-welcome">' +
                        '<h1 class="toolkits-modern-welcome__title">' + s.modernWelcome + '</h1>' +
                        '<p class="toolkits-modern-welcome__tagline">' + s.modernTagline + '</p>' +
                    '</section>' +

                    toolkitsModernStartSectionHtml(s) +

                    toolkitsModernHomeGuidesSectionHtml(s) +
                '</div>' +

                toolkitsModernGuidesViewHtml(s) +

                toolkitsModernObjectsViewHtml(s) +

                '<div class="toolkits-modern-workspace" id="toolkits-modern-workspace" hidden>' +
                    toolkitsIndexWorkspaceHtml(cfg) +
                '</div>' +
            '</div>' +
        '</div>' +
        toolkitsModernCardCreateMenuHtml(s) +
        toolkitsModernUserModalShellHtml(s) +
        toolkitsModernTourShellHtml(s, logos);
}

function toolkitsModernCardCreateMenuHtml(s) {
    return '<div class="toolkits-modern-card-create-flyout" id="toolkits-modern-card-create-menu" hidden>' +
        '<button type="button" class="toolkits-modern-create-menu__option" data-card-create-empty>' +
            '<span class="toolkits-modern-create-menu__head">' +
                '<i class="fa fa-plus toolkits-modern-create-menu__plus" aria-hidden="true"></i>' +
                '<span class="toolkits-modern-create-menu__title">' + s.modernCreateEmptyTitle + '</span>' +
                '<i class="fa fa-chevron-right toolkits-modern-create-menu__chevron" aria-hidden="true"></i>' +
            '</span>' +
        '</button>' +
        '<hr class="toolkits-modern-create-menu__divider" aria-hidden="true">' +
        '<div class="toolkits-modern-create-menu__template-block">' +
            '<span class="toolkits-modern-create-menu__head">' +
                '<i class="fa fa-plus toolkits-modern-create-menu__plus" aria-hidden="true"></i>' +
                '<span class="toolkits-modern-create-menu__title">' + s.modernCreateTemplateTitle + '</span>' +
                '<i class="fa fa-chevron-right toolkits-modern-create-menu__chevron" aria-hidden="true"></i>' +
            '</span>' +
            '<label class="sr-only" for="toolkits-modern-card-create-template-select">' + s.modernCreateTemplatePlaceholder + '</label>' +
            '<select class="toolkits-modern-create-menu__select" id="toolkits-modern-card-create-template-select">' +
                '<option value="">' + s.modernCreateTemplatePlaceholder + '</option>' +
            '</select>' +
        '</div>' +
    '</div>';
}

function toolkitsModernTourShellHtml(s, logos) {
    var logoSrc = (logos && logos.left) ? logos.left : 'website_code/images/logo.png';
    return '<div class="toolkits-modern-tour" id="toolkits-modern-tour" hidden>' +
        '<div class="toolkits-modern-tour__overlay" id="toolkits-modern-tour-overlay"></div>' +
        '<div class="toolkits-modern-tour__welcome" id="toolkits-modern-tour-welcome" role="dialog" aria-modal="true" aria-labelledby="toolkits-modern-tour-welcome-title" hidden>' +
            '<h2 class="toolkits-modern-tour__welcome-title" id="toolkits-modern-tour-welcome-title">' +
                '<span>' + (s.modernTourWelcomeTitle || 'Welcome to') + '</span> ' +
                '<img src="' + logoSrc + '" alt="Xerte" class="toolkits-modern-tour__welcome-logo"/>' +
            '</h2>' +
            '<div class="toolkits-modern-tour__welcome-art" aria-hidden="true">' +
                '<img src="theme/modern/assets/tour-welcome.svg" alt=""/>' +
            '</div>' +
            '<p class="toolkits-modern-tour__welcome-body">' + (s.modernTourWelcomeBody || '') + '</p>' +
            '<div class="toolkits-modern-tour__welcome-actions">' +
                '<button type="button" class="toolkits-modern-btn toolkits-modern-btn--secondary" data-tour-skip>' +
                    (s.modernTourSkip || 'Skip') +
                '</button>' +
                '<button type="button" class="toolkits-modern-btn toolkits-modern-btn--primary" data-tour-start>' +
                    (s.modernTourStart || 'Start tour') +
                '</button>' +
            '</div>' +
        '</div>' +
        '<div class="toolkits-modern-tour__tip" id="toolkits-modern-tour-tip" role="dialog" aria-modal="true" hidden>' +
            '<button type="button" class="toolkits-modern-tour__tip-close" data-tour-skip aria-label="' + (s.modernTourClose || 'Close tour') + '">' +
                '<i class="fa fa-times" aria-hidden="true"></i>' +
            '</button>' +
            '<h3 class="toolkits-modern-tour__tip-title" id="toolkits-modern-tour-tip-title"></h3>' +
            '<div class="toolkits-modern-tour__tip-body" id="toolkits-modern-tour-tip-body"></div>' +
            '<div class="toolkits-modern-tour__tip-footer">' +
                '<span class="toolkits-modern-tour__tip-step" id="toolkits-modern-tour-tip-step"></span>' +
                '<button type="button" class="toolkits-modern-btn toolkits-modern-btn--primary" data-tour-next>' +
                    (s.modernTourNext || 'Next step') +
                '</button>' +
            '</div>' +
            '<span class="toolkits-modern-tour__tip-arrow" aria-hidden="true"></span>' +
        '</div>' +
    '</div>';
}

function toolkitsModernCreateButtonHtml(s) {
    return '<div class="toolkits-modern-sidebar__create-wrap">' +
        '<button type="button" class="toolkits-modern-btn toolkits-modern-btn--primary toolkits-modern-sidebar__create" id="toolkits-modern-create-toggle" aria-expanded="false" aria-haspopup="true" aria-controls="toolkits-modern-create-menu">' +
            '<i class="fa fa-plus" aria-hidden="true"></i> ' + s.modernCreateLo +
        '</button>' +
        '<div class="toolkits-modern-create-flyout" id="toolkits-modern-create-menu" hidden>' +
            '<div class="toolkits-modern-create-menu__panel" id="toolkits-modern-create-menu-main">' +
                '<button type="button" class="toolkits-modern-create-menu__item" role="menuitem" data-create-parent="Nottingham">' +
                    '<span class="toolkits-modern-create-menu__head">' +
                        '<i class="fa fa-plus toolkits-modern-create-menu__plus" aria-hidden="true"></i>' +
                        '<span class="toolkits-modern-create-menu__title">' + s.modernCardInteractiveTitle + '</span>' +
                        '<i class="fa fa-chevron-right toolkits-modern-create-menu__chevron" aria-hidden="true"></i>' +
                    '</span>' +
                    '<span class="toolkits-modern-create-menu__desc">' + s.modernCardInteractiveDesc + '</span>' +
                '</button>' +
                '<hr class="toolkits-modern-create-menu__divider" aria-hidden="true">' +
                '<button type="button" class="toolkits-modern-create-menu__item" role="menuitem" data-create-parent="site">' +
                    '<span class="toolkits-modern-create-menu__head">' +
                        '<i class="fa fa-plus toolkits-modern-create-menu__plus" aria-hidden="true"></i>' +
                        '<span class="toolkits-modern-create-menu__title">' + s.modernCardSiteTitle + '</span>' +
                        '<i class="fa fa-chevron-right toolkits-modern-create-menu__chevron" aria-hidden="true"></i>' +
                    '</span>' +
                    '<span class="toolkits-modern-create-menu__desc">' + s.modernCardSiteDesc + '</span>' +
                '</button>' +
            '</div>' +
            '<div class="toolkits-modern-create-menu__panel toolkits-modern-create-menu__panel--sub" id="toolkits-modern-create-menu-sub" hidden>' +
                '<button type="button" class="toolkits-modern-create-menu__option" data-create-empty>' +
                    '<span class="toolkits-modern-create-menu__head">' +
                        '<i class="fa fa-plus toolkits-modern-create-menu__plus" aria-hidden="true"></i>' +
                        '<span class="toolkits-modern-create-menu__title">' + s.modernCreateEmptyTitle + '</span>' +
                    '</span>' +
                    '<span class="toolkits-modern-create-menu__desc">' + s.modernCreateEmptyDesc + '</span>' +
                '</button>' +
                '<hr class="toolkits-modern-create-menu__divider" aria-hidden="true">' +
                '<div class="toolkits-modern-create-menu__template-block">' +
                    '<span class="toolkits-modern-create-menu__head">' +
                        '<i class="fa fa-plus toolkits-modern-create-menu__plus" aria-hidden="true"></i>' +
                        '<span class="toolkits-modern-create-menu__title">' + s.modernCreateTemplateTitle + '</span>' +
                    '</span>' +
                    '<span class="toolkits-modern-create-menu__desc">' + s.modernCreateTemplateDesc + '</span>' +
                    '<label class="sr-only" for="toolkits-modern-create-template-select">' + s.modernCreateTemplatePlaceholder + '</label>' +
                    '<select class="toolkits-modern-create-menu__select" id="toolkits-modern-create-template-select">' +
                        '<option value="">' + s.modernCreateTemplatePlaceholder + '</option>' +
                    '</select>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>';
}

function toolkitsModernUserModalShellHtml(s) {
    return '<div class="toolkits-modern-user-modal" id="toolkits-modern-user-modal" hidden>' +
        '<div class="toolkits-modern-user-modal__backdrop" data-user-modal-close></div>' +
        '<div class="toolkits-modern-user-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="toolkits-modern-user-modal-title">' +
            '<div class="toolkits-modern-user-modal__header">' +
                '<h2 class="toolkits-modern-user-modal__title" id="toolkits-modern-user-modal-title"></h2>' +
                '<button type="button" class="toolkits-modern-user-modal__close" data-user-modal-close aria-label="' + (s.folderCancel || 'Close') + '">' +
                    '<i class="fa fa-times" aria-hidden="true"></i>' +
                '</button>' +
            '</div>' +
            '<div class="toolkits-modern-user-modal__body" id="toolkits-modern-user-modal-body"></div>' +
        '</div>' +
    '</div>';
}

function toolkitsModernUserMenuItemHtml(icon, label, onclick, modifier) {
    var mod = modifier ? ' ' + modifier : '';
    return '<button type="button" class="toolkits-modern-topbar__dropdown-item' + mod + '" role="menuitem" onclick="' + onclick + '">' +
        '<i class="fa ' + icon + ' toolkits-modern-topbar__dropdown-icon" aria-hidden="true"></i>' +
        '<span>' + label + '</span>' +
    '</button>';
}

function toolkitsModernShowUserModalContent(title, html, modifier) {
    var modal = document.getElementById('toolkits-modern-user-modal');
    var body = document.getElementById('toolkits-modern-user-modal-body');
    var titleEl = document.getElementById('toolkits-modern-user-modal-title');
    if (!modal || !body) {
        return;
    }

    toolkitsModernCloseUserModal();
    if (titleEl) {
        titleEl.textContent = title || '';
    }
    if (modifier) {
        modal.classList.add(modifier);
    }
    body.innerHTML = html || '';
    modal.hidden = false;
    document.body.classList.add('toolkits-modern-user-modal-open');
}

function toolkitsModernOpenUserDetails() {
    toolkitsModernCloseUserMenu();
    var s = (window.toolkits_index_config && window.toolkits_index_config.strings) || {};
    var title = s.modernMyDetails || 'My details';
    var esc = typeof escapeHtml === 'function' ? escapeHtml : toolkitsModernEscapeHtml;

    toolkitsModernShowUserModalContent(
        title,
        '<p class="toolkits-modern-user-modal__loading">' + esc(s.modernDetailsLoading || 'Loading details…') + '</p>',
        'toolkits-modern-user-modal--details'
    );

    if (typeof $ === 'undefined' || typeof rest_api_url === 'undefined') {
        var body = document.getElementById('toolkits-modern-user-modal-body');
        if (body) {
            body.innerHTML = '<p class="toolkits-modern-user-modal__error">' +
                esc(s.modernDetailsError || 'Could not load your details. Please try again.') + '</p>';
        }
        return;
    }

    $.ajax({
        url: rest_api_url,
        data: { route: 'workspaceproperties/my-properties' },
        dataType: 'json',
        success: function (res) {
            var body = document.getElementById('toolkits-modern-user-modal-body');
            var modal = document.getElementById('toolkits-modern-user-modal');
            if (!body || !modal || modal.hidden || !modal.classList.contains('toolkits-modern-user-modal--details')) {
                return;
            }
            if (!res || !res.ok || !res.data) {
                body.innerHTML = '<p class="toolkits-modern-user-modal__error">' +
                    esc(s.modernDetailsError || 'Could not load your details. Please try again.') + '</p>';
                return;
            }
            var d = res.data;
            var name = (d.user && d.user.name) ? d.user.name : '';
            var username = (d.user && d.user.username) ? d.user.username : '';
            var lastLogin = (d.user && d.user.lastLogin) ? d.user.lastLogin : '';
            var initial = (name || username || '?').trim().charAt(0).toUpperCase();
            var i18n = d.i18n || {};

            body.innerHTML =
                '<div class="toolkits-modern-user-details">' +
                    '<div class="toolkits-modern-user-details__hero">' +
                        '<span class="toolkits-modern-user-details__avatar" aria-hidden="true">' + esc(initial) + '</span>' +
                        '<div class="toolkits-modern-user-details__hero-text">' +
                            '<p class="toolkits-modern-user-details__name">' + esc(name || username) + '</p>' +
                            (username ? '<p class="toolkits-modern-user-details__username">@' + esc(username) + '</p>' : '') +
                        '</div>' +
                    '</div>' +
                    '<dl class="toolkits-modern-user-details__list">' +
                        '<div class="toolkits-modern-user-details__row">' +
                            '<dt>' + esc(i18n.nameLabel || 'Name') + '</dt>' +
                            '<dd>' + esc(name || '—') + '</dd>' +
                        '</div>' +
                        '<div class="toolkits-modern-user-details__row">' +
                            '<dt>' + esc(i18n.usernameLabel || 'Username') + '</dt>' +
                            '<dd>' + esc(username || '—') + '</dd>' +
                        '</div>' +
                        '<div class="toolkits-modern-user-details__row">' +
                            '<dt>' + esc(i18n.lastLoginLabel || 'Last login') + '</dt>' +
                            '<dd>' + esc(lastLogin || '—') + '</dd>' +
                        '</div>' +
                    '</dl>' +
                '</div>';
        },
        error: function () {
            var body = document.getElementById('toolkits-modern-user-modal-body');
            var modal = document.getElementById('toolkits-modern-user-modal');
            if (!body || !modal || modal.hidden || !modal.classList.contains('toolkits-modern-user-modal--details')) {
                return;
            }
            body.innerHTML = '<p class="toolkits-modern-user-modal__error">' +
                esc(s.modernDetailsError || 'Could not load your details. Please try again.') + '</p>';
        }
    });
}

function toolkitsModernOpenFeedback() {
    toolkitsModernCloseUserMenu();
    var s = (window.toolkits_index_config && window.toolkits_index_config.strings) || {};
    var esc = typeof escapeHtml === 'function' ? escapeHtml : toolkitsModernEscapeHtml;
    var title = s.modernFeedback || 'Give feedback';
    var html =
        '<div class="toolkits-modern-feedback">' +
            '<p class="toolkits-modern-feedback__desc">' + esc(s.modernFeedbackDesc || '') + '</p>' +
            '<form class="toolkits-modern-feedback__form" id="toolkits-modern-feedback-form" novalidate>' +
                '<label class="toolkits-modern-feedback__label" for="toolkits-modern-feedback-name">' +
                    esc(s.modernFeedbackName || 'Name (optional)') +
                '</label>' +
                '<input type="text" class="toolkits-modern-feedback__input" id="toolkits-modern-feedback-name" name="name" autocomplete="name" />' +
                '<label class="toolkits-modern-feedback__label" for="toolkits-modern-feedback-message">' +
                    esc(s.modernFeedbackMessage || 'Your feedback') +
                '</label>' +
                '<textarea class="toolkits-modern-feedback__textarea" id="toolkits-modern-feedback-message" name="feedback" rows="8" required></textarea>' +
                '<p class="toolkits-modern-feedback__status" id="toolkits-modern-feedback-status" hidden></p>' +
                '<div class="toolkits-modern-feedback__actions">' +
                    '<button type="submit" class="toolkits-modern-btn toolkits-modern-btn--primary" id="toolkits-modern-feedback-submit">' +
                        esc(s.modernFeedbackSend || 'Send feedback') +
                    '</button>' +
                '</div>' +
            '</form>' +
        '</div>';

    toolkitsModernShowUserModalContent(title, html, 'toolkits-modern-user-modal--feedback');

    var form = document.getElementById('toolkits-modern-feedback-form');
    if (!form) {
        return;
    }
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var message = document.getElementById('toolkits-modern-feedback-message');
        var nameEl = document.getElementById('toolkits-modern-feedback-name');
        var status = document.getElementById('toolkits-modern-feedback-status');
        var submit = document.getElementById('toolkits-modern-feedback-submit');
        var msgVal = message ? message.value.trim() : '';
        if (!msgVal) {
            if (message) {
                message.focus();
            }
            return;
        }
        if (submit) {
            submit.disabled = true;
        }
        if (status) {
            status.hidden = true;
            status.className = 'toolkits-modern-feedback__status';
            status.textContent = '';
        }

        var feedbackUrl = (typeof site_url !== 'undefined' ? site_url : '') + 'feedback/';
        var postData = {
            name: nameEl ? nameEl.value : '',
            feedback: msgVal
        };

        function showResult(ok) {
            if (submit) {
                submit.disabled = false;
            }
            if (!status) {
                return;
            }
            status.hidden = false;
            status.className = 'toolkits-modern-feedback__status ' +
                (ok ? 'toolkits-modern-feedback__status--ok' : 'toolkits-modern-feedback__status--error');
            status.textContent = ok
                ? (s.modernFeedbackThanks || 'Thank you for your feedback.')
                : (s.modernFeedbackError || 'Could not send feedback. Please try again.');
            if (ok) {
                form.reset();
                if (submit) {
                    submit.hidden = true;
                }
            }
        }

        if (typeof $ !== 'undefined') {
            $.ajax({
                url: feedbackUrl,
                type: 'POST',
                data: postData
            }).done(function () {
                showResult(true);
            }).fail(function () {
                showResult(false);
            });
            return;
        }

        fetch(feedbackUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
            body: 'name=' + encodeURIComponent(postData.name) + '&feedback=' + encodeURIComponent(postData.feedback),
            credentials: 'same-origin'
        }).then(function (r) {
            showResult(r.ok);
        }).catch(function () {
            showResult(false);
        });
    });
}

function toolkitsModernTopbarUserMenuHtml(cfg) {
    var s = cfg.strings || {};
    var user = cfg.user || {};
    var items = '';

    if (user.canManageUser) {
        items += toolkitsModernUserMenuItemHtml(
            'fa-lock',
            s.changePassword,
            'toolkitsModernCloseUserMenu(); toolkitsModernOpenPasswordModal();'
        );
    }
    if (!user.isGuest) {
        items += toolkitsModernUserMenuItemHtml(
            'fa-user-circle',
            s.modernMyDetails,
            'toolkitsModernOpenUserDetails();'
        );
        if (user.canManageUser) {
            items += toolkitsModernUserMenuItemHtml(
                'fa-sliders',
                s.modernPreferences,
                'toolkitsModernCloseUserMenu(); toolkitsModernOpenPreferencesModal();'
            );
            items += toolkitsModernUserMenuItemHtml(
                'fa-gears',
                s.modernSettings,
                'toolkitsModernCloseUserMenu(); toolkitsModernOpenSettingsModal();'
            );
        }
        items += toolkitsModernUserMenuItemHtml(
            'fa-pencil',
            s.modernFeedback,
            'toolkitsModernOpenFeedback();'
        );
        items += '<hr class="toolkits-modern-topbar__dropdown-divider" aria-hidden="true">';
        items += toolkitsModernUserMenuItemHtml(
            'fa-right-from-bracket',
            s.logout,
            'toolkitsModernCloseUserMenu(); logout(' + (user.samlLogout ? 'true' : 'false') + ');',
            'toolkits-modern-topbar__dropdown-item--logout'
        );
    }

    var topbarName = user.firstName || user.displayName || '';
    var menuHtml = '';
    if (items) {
        menuHtml =
            '<div class="toolkits-modern-topbar__user-menu">' +
                '<button type="button" class="toolkits-modern-topbar__user-toggle" id="toolkits-modern-user-toggle" aria-expanded="false" aria-haspopup="true" aria-controls="toolkits-modern-user-menu">' +
                    '<span class="toolkits-modern-topbar__name">' + topbarName + '</span>' +
                    '<i class="fa fa-chevron-down toolkits-modern-topbar__chevron" aria-hidden="true"></i>' +
                    '<span class="toolkits-modern-topbar__avatar" aria-hidden="true"><i class="fa fa-user"></i></span>' +
                '</button>' +
                '<div class="toolkits-modern-topbar__dropdown" id="toolkits-modern-user-menu" role="menu" hidden>' + items + '</div>' +
            '</div>';
    } else if (topbarName) {
        menuHtml = '<span class="toolkits-modern-topbar__name">' + topbarName + '</span>' +
            '<span class="toolkits-modern-topbar__avatar" aria-hidden="true"><i class="fa fa-user"></i></span>';
    }

    return '<div class="toolkits-modern-topbar__user">' + menuHtml + '</div>';
}

function toolkitsModernTopbarHtml(cfg) {
    return '<header class="toolkits-modern-topbar">' +
        '<div class="toolkits-modern-topbar__lang">' +
            '<div class="toolkits-modern-topbar__lang-control">' +
                '<i class="fa fa-globe toolkits-modern-topbar__lang-icon" aria-hidden="true"></i>' +
                '<span class="toolkits-modern-topbar__lang-code" id="toolkits-modern-lang-code">--</span>' +
                '<i class="fa fa-chevron-down toolkits-modern-topbar__chevron" aria-hidden="true"></i>' +
                '<div class="toolkits-modern-topbar__lang-select">' + (cfg.languageFormHtml || '') + '</div>' +
            '</div>' +
        '</div>' +
        toolkitsModernTopbarUserMenuHtml(cfg) +
    '</header>';
}

function toolkitsModernGuideAssetUrl(filename) {
    var base = (typeof site_url !== 'undefined' && site_url) ? site_url : '';
    return base + 'theme/modern/assets/' + filename;
}

function toolkitsModernGuideCardHtml(variant, icon, title, desc, href) {
    var iconHtml;
    if (icon && /\.(svg|png|jpe?g|webp|gif)$/i.test(icon)) {
        iconHtml = '<img class="toolkits-modern-guide__img" src="' + toolkitsModernGuideAssetUrl(icon) + '" alt="" />';
    } else {
        iconHtml = '<i class="fa ' + icon + '" aria-hidden="true"></i>';
    }
    return '<a class="toolkits-modern-guide toolkits-modern-guide--' + variant + '" href="' + href + '" target="_blank" rel="noopener">' +
        '<div class="toolkits-modern-guide__icon">' + iconHtml + '</div>' +
        '<h3>' + title + '</h3>' +
        '<p>' + desc + '</p>' +
        '<span class="toolkits-modern-guide__arrow"><i class="fa fa-chevron-right"></i></span>' +
    '</a>';
}

function toolkitsModernHomeGuidesSectionHtml(s) {
    return '<section class="toolkits-modern-section">' +
        '<h2 class="toolkits-modern-section__title">' + s.modernGetStarted + '</h2>' +
        '<div class="toolkits-modern-cards toolkits-modern-cards--three">' +
            toolkitsModernGuideCardHtml('orange', 'know-how.svg', s.modernGuide1Title, s.modernGuide1Desc, 'https://xot.xerte.org.uk/play.php?template_id=150') +
            toolkitsModernGuideCardHtml('cream', 'signpost.png', s.modernGuide2Title, s.modernGuide2Desc, 'https://xot.xerte.org.uk/play.php?template_id=150#page2') +
            toolkitsModernGuideCardHtml('peach', 'curious.png', s.modernGuide3Title, s.modernGuide3Desc, 'https://xot.xerte.org.uk/play.php?template_id=150#page3') +
        '</div>' +
        '<p class="toolkits-modern-more-guides">' +
            '<button type="button" class="toolkits-modern-more-guides__link" data-modern-view="guides">' + s.modernMoreGuides + ' <i class="fa fa-arrow-right"></i></button>' +
        '</p>' +
    '</section>';
}

function toolkitsModernFaqItemHtml(question, answer, linkText, linkHref, open) {
    var openClass = open ? ' toolkits-modern-faq__item--open' : '';
    var expanded = open ? 'true' : 'false';
    var panelHidden = open ? '' : ' hidden';
    var linkHtml = '';
    if (linkText && linkHref) {
        linkHtml = '<p class="toolkits-modern-faq__link"><a class="toolkits-modern-btn toolkits-modern-btn--primary toolkits-modern-btn--small" href="' + linkHref + '" target="_blank" rel="noopener">' + linkText + '</a></p>';
    }
    return '<div class="toolkits-modern-faq__item' + openClass + '">' +
        '<div class="toolkits-modern-faq__header">' +
            '<h3 class="toolkits-modern-faq__question">' + question + '</h3>' +
            '<button type="button" class="toolkits-modern-faq__toggle" aria-expanded="' + expanded + '">' +
                '<i class="fa fa-chevron-up" aria-hidden="true"></i>' +
            '</button>' +
        '</div>' +
        '<div class="toolkits-modern-faq__panel"' + panelHidden + '>' +
            '<p>' + answer + '</p>' +
            linkHtml +
        '</div>' +
    '</div>';
}

function toolkitsModernGuidesViewHtml(s) {
    return '<div class="toolkits-modern-guides" id="toolkits-modern-guides" hidden>' +
        '<header class="toolkits-modern-guides__header">' +
            '<h1 class="toolkits-modern-guides__title">' + s.modernNavGuides + '</h1>' +
        '</header>' +
        '<section class="toolkits-modern-section">' +
            '<h2 class="toolkits-modern-section__title">' + s.modernGuidesSectionManuals + '</h2>' +
            '<div class="toolkits-modern-cards toolkits-modern-cards--three">' +
                toolkitsModernGuideCardHtml('orange', 'know-how.svg', s.modernGuide1Title, s.modernGuide1Desc, 'https://xot.xerte.org.uk/play.php?template_id=150') +
                toolkitsModernGuideCardHtml('cream', 'signpost.png', s.modernGuide2Title, s.modernGuide2Desc, 'https://xot.xerte.org.uk/play.php?template_id=150#page2') +
                toolkitsModernGuideCardHtml('peach', 'curious.png', s.modernGuide3Title, s.modernGuide3Desc, 'https://xot.xerte.org.uk/play.php?template_id=150#page3') +
            '</div>' +
        '</section>' +
        '<section class="toolkits-modern-section">' +
            '<h2 class="toolkits-modern-section__title">' + s.modernGuidesSectionDemos + '</h2>' +
            '<div class="toolkits-modern-cards toolkits-modern-cards--three">' +
                toolkitsModernGuideCardHtml('demo', 'fa-play-circle', s.modernDemo1Title, s.modernDemo1Desc, 'modules/xerte/training/toolkits.htm') +
                toolkitsModernGuideCardHtml('demo', 'fa-table-cells', s.modernDemo2Title, s.modernDemo2Desc, 'https://xot.xerte.org.uk/play.php?template_id=116#xertepagetypes') +
                toolkitsModernGuideCardHtml('demo', 'fa-globe', s.modernDemo3Title, s.modernDemo3Desc, 'https://xot.xerte.org.uk/play.php?template_id=137') +
            '</div>' +
        '</section>' +
        '<section class="toolkits-modern-section toolkits-modern-section--faq">' +
            '<h2 class="toolkits-modern-section__title">' + s.modernGuidesSectionFaq + '</h2>' +
            '<div class="toolkits-modern-faq">' +
                toolkitsModernFaqItemHtml(s.modernFaq1Question, s.modernFaq1Answer, s.modernFaq1Link, 'https://xerte.org.uk', true) +
                toolkitsModernFaqItemHtml(s.modernFaq2Question, s.modernFaq2Answer, '', '', false) +
                toolkitsModernFaqItemHtml(s.modernFaq3Question, s.modernFaq3Answer, '', '', false) +
            '</div>' +
        '</section>' +
    '</div>';
}

function toolkitsModernStartSectionHtml(s) {
    return '<section class="toolkits-modern-section">' +
        '<h2 class="toolkits-modern-section__title">' + s.modernStartSection + '</h2>' +
        '<div class="toolkits-modern-cards toolkits-modern-cards--two">' +
            '<article class="toolkits-modern-card toolkits-modern-card--blue" id="toolkits-modern-card-interactive">' +
                '<h3>' + s.modernCardInteractiveTitle + '</h3>' +
                '<p>' + s.modernCardInteractiveDesc + '</p>' +
                '<div class="toolkits-modern-card__create-wrap">' +
                    '<button type="button" class="toolkits-modern-btn toolkits-modern-btn--primary" id="toolkits-modern-card-interactive-btn" data-modern-card-create="Nottingham">' +
                        '<i class="fa fa-plus"></i> ' + s.modernCardInteractiveBtn +
                    '</button>' +
                '</div>' +
            '</article>' +
            '<article class="toolkits-modern-card toolkits-modern-card--blue" id="toolkits-modern-card-site">' +
                '<h3>' + s.modernCardSiteTitle + '</h3>' +
                '<p>' + s.modernCardSiteDesc + '</p>' +
                '<div class="toolkits-modern-card__create-wrap">' +
                    '<button type="button" class="toolkits-modern-btn toolkits-modern-btn--primary" id="toolkits-modern-card-site-btn" data-modern-card-create="site">' +
                        '<i class="fa fa-plus"></i> ' + s.modernCardSiteBtn +
                    '</button>' +
                '</div>' +
            '</article>' +
        '</div>' +
    '</section>';
}

function toolkitsModernObjectsViewHtml(s) {
    return '<div class="toolkits-modern-objects" id="toolkits-modern-objects" hidden>' +
        '<div class="toolkits-modern-objects__scroll">' +
            '<div class="toolkits-modern-lo-page">' +
                '<header class="toolkits-modern-lo-page__header">' +
                    '<div class="toolkits-modern-lo-page__top">' +
                        '<h1 class="toolkits-modern-lo-page__title">' + (s.modernLoPageTitle || 'Learning objects') + '</h1>' +
                        '<div class="toolkits-modern-lo-page__actions">' +
                            '<button type="button" class="toolkits-modern-lo-page__action toolkits-modern-lo-page__action--primary" id="toolkits-modern-new-folder">' +
                                '<i class="fa fa-plus" aria-hidden="true"></i>' +
                                '<span>' + (s.modernNewFolder || s.newFolder || 'New folder') + '</span>' +
                            '</button>' +
                            '<button type="button" class="toolkits-modern-lo-page__action toolkits-modern-lo-page__action--secondary" id="toolkits-modern-import">' +
                                '<i class="fa fa-arrow-up" aria-hidden="true"></i>' +
                                '<span>' + (s.modernImport || 'Import') + '</span>' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                    '<div class="toolkits-modern-objects__access-filters" id="toolkits-modern-access-filters" role="group" aria-label="' + (s.modernLoColAccess || 'Access') + '">' +
                        '<button type="button" class="toolkits-modern-objects__access-pill toolkits-modern-objects__access-pill--active" data-modern-access="all">' + (s.modernAccessFilterAll || 'All') + '</button>' +
                        '<button type="button" class="toolkits-modern-objects__access-pill" data-modern-access="public">' + (s.modernLoAccessPublic || 'Public') + '</button>' +
                        '<button type="button" class="toolkits-modern-objects__access-pill" data-modern-access="password">' + (s.modernLoAccessPassword || 'Password') + '</button>' +
                        '<button type="button" class="toolkits-modern-objects__access-pill" data-modern-access="private">' + (s.modernLoAccessPrivate || 'Private') + '</button>' +
                        '<button type="button" class="toolkits-modern-objects__access-pill" data-modern-access="demo">' + (s.modernLoAccessDemo || 'Demo') + '</button>' +
                    '</div>' +
                    '<div class="toolkits-modern-lo-page__breadcrumb-row">' +
                        '<nav class="toolkits-modern-objects__breadcrumb" id="toolkits-modern-objects-filter" aria-label="' + (s.modernNavAll || 'All learning objects') + '"></nav>' +
                        '<div class="toolkits-modern-lo-page__toolbar">' +
                            '<div class="toolkits-modern-lo-page__search">' +
                                '<i class="fa fa-search" aria-hidden="true"></i>' +
                                '<input type="search" id="toolkits-modern-lo-search" placeholder="' + (s.modernSearch || s.searchPlaceholder || 'Search') + '" autocomplete="off"/>' +
                            '</div>' +
                            '<div class="toolkits-modern-lo-page__sort">' +
                                '<select id="toolkits-modern-lo-sort" aria-label="' + (s.sort || 'Sort') + '">' +
                                    '<option value="alpha_up">' + (s.sortA || 'A-Z') + '</option>' +
                                    '<option value="alpha_down">' + (s.sortZ || 'Z-A') + '</option>' +
                                    '<option value="date_down" selected>' + (s.sortNew || 'Newest') + '</option>' +
                                    '<option value="date_up">' + (s.sortOld || 'Oldest') + '</option>' +
                                '</select>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<p class="toolkits-modern-objects__count" id="toolkits-modern-objects-count"></p>' +
                '</header>' +
                '<section class="toolkits-modern-objects__list-section" aria-live="polite">' +
                    '<div class="toolkits-modern-lo-panel">' +
                        '<div class="toolkits-modern-lo-empty" id="toolkits-modern-lo-empty" hidden>' +
                            '<h3 class="toolkits-modern-lo-empty__title" id="toolkits-modern-lo-empty-title"></h3>' +
                            '<p class="toolkits-modern-lo-empty__text" id="toolkits-modern-lo-empty-text"></p>' +
                        '</div>' +
                        '<table class="toolkits-modern-lo-table" id="toolkits-modern-lo-table">' +
                            '<thead>' +
                                '<tr>' +
                                    '<th class="toolkits-modern-lo-table__col-preview" scope="col"><span class="sr-only">' + (s.modernLoColPreview || 'Preview') + '</span></th>' +
                                    '<th class="toolkits-modern-lo-table__col-name" scope="col">' + (s.modernLoColName || 'Name') + '</th>' +
                                    '<th class="toolkits-modern-lo-table__col-id" scope="col">' + (s.modernLoColId || 'ID') + '</th>' +
                                    '<th class="toolkits-modern-lo-table__col-modified" scope="col">' + (s.modernLoColModified || 'Modified') + '</th>' +
                                    '<th class="toolkits-modern-lo-table__col-template" scope="col">' + (s.modernLoColTemplate || 'Template') + '</th>' +
                                    '<th class="toolkits-modern-lo-table__col-access" scope="col">' + (s.modernLoColAccess || 'Access') + '</th>' +
                                    '<th class="toolkits-modern-lo-table__col-actions" scope="col">' + (s.modernLoColActions || 'Actions') + '</th>' +
                                '</tr>' +
                            '</thead>' +
                            '<tbody id="toolkits-modern-lo-list"></tbody>' +
                        '</table>' +
                    '</div>' +
                '</section>' +
            '</div>' +
        '</div>' +
        '<div class="toolkits-modern-lo-menu" id="toolkits-modern-lo-menu" role="menu" hidden></div>' +
        '<div class="toolkits-modern-lo-preview" id="toolkits-modern-lo-preview" hidden>' +
            '<div class="toolkits-modern-lo-preview__backdrop" data-lo-preview-close></div>' +
            '<div class="toolkits-modern-lo-preview__dialog" role="dialog" aria-modal="true" aria-labelledby="toolkits-modern-lo-preview-title">' +
                '<button type="button" class="toolkits-modern-lo-preview__close" data-lo-preview-close aria-label="' + (s.modernLoPreviewClose || 'Close preview') + '">' +
                    '<i class="fa fa-times" aria-hidden="true"></i>' +
                '</button>' +
                '<p class="toolkits-modern-lo-preview__title" id="toolkits-modern-lo-preview-title"></p>' +
                '<iframe class="toolkits-modern-lo-preview__frame" id="toolkits-modern-lo-preview-frame" title=""></iframe>' +
            '</div>' +
        '</div>' +
        '<div class="toolkits-modern-properties-modal" id="toolkits-modern-properties-modal" hidden>' +
            '<div class="toolkits-modern-properties-modal__backdrop" data-properties-modal-close></div>' +
            '<div class="toolkits-modern-properties-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="toolkits-modern-properties-modal-title">' +
                '<div class="toolkits-modern-properties-modal__header">' +
                    '<h2 class="toolkits-modern-properties-modal__title" id="toolkits-modern-properties-modal-title">' +
                        (s.modernLoMenuProperties || s.properties || 'Properties') +
                    '</h2>' +
                    '<button type="button" class="toolkits-modern-properties-modal__close" data-properties-modal-close aria-label="' + (s.folderCancel || 'Close') + '">' +
                        '<i class="fa fa-times" aria-hidden="true"></i>' +
                    '</button>' +
                '</div>' +
                '<iframe class="toolkits-modern-properties-modal__frame" id="toolkits-modern-properties-frame" title="' + (s.modernLoMenuProperties || 'Properties') + '"></iframe>' +
            '</div>' +
        '</div>' +
    '</div>';
}

function toolkitsModernIsRecycleBinNode(item) {
    if (!item || typeof workspace === 'undefined') {
        return false;
    }
    if (item.type === 'recyclebin') {
        return true;
    }
    var recycleId = workspace.recyclebin_id;
    if (!recycleId) {
        return false;
    }
    var current = item;
    var guard = 0;
    while (current && current.parent && current.parent !== '#' && guard < 50) {
        if (current.parent === recycleId || current.id === recycleId) {
            return true;
        }
        current = workspace.nodes && workspace.nodes[current.parent] ? workspace.nodes[current.parent] : null;
        guard++;
    }
    return false;
}

function toolkitsModernIsFolderNode(item) {
    if (!item || !item.type) {
        return false;
    }
    return item.type === 'folder' ||
        item.type === 'folder_shared' ||
        item.type === 'sub_folder_shared' ||
        item.type === 'folder_group';
}

function toolkitsModernIsLearningObjectNode(item) {
    if (!item || !item.type) {
        return false;
    }
    var structural = {
        workspace: true,
        recyclebin: true,
        folder: true,
        folder_shared: true,
        sub_folder_shared: true,
        group: true,
        folder_group: true
    };
    if (structural[item.type]) {
        return false;
    }
    if (toolkitsModernIsRecycleBinNode(item)) {
        return false;
    }
    if (workspace.templates && workspace.templates.indexOf(item.type) !== -1) {
        return true;
    }
    return item.xot_type === 'template' || item.xot_type === 'file';
}

function toolkitsModernGetWorkspaceRootId() {
    if (typeof workspace === 'undefined') {
        return null;
    }
    return workspace.workspace_id || null;
}

window.toolkitsModernCurrentFolderId = null;

function toolkitsModernGetCurrentFolderId() {
    if (window.toolkitsModernBrowseMode !== 'all') {
        return null;
    }
    var rootId = toolkitsModernGetWorkspaceRootId();
    var current = window.toolkitsModernCurrentFolderId;
    if (!current || current === rootId) {
        return rootId;
    }
    if (typeof workspace !== 'undefined' && workspace.nodes && workspace.nodes[current] && toolkitsModernIsFolderNode(workspace.nodes[current])) {
        if (!toolkitsModernIsRecycleBinNode(workspace.nodes[current])) {
            return current;
        }
    }
    window.toolkitsModernCurrentFolderId = null;
    return rootId;
}

function toolkitsModernResetFolder() {
    window.toolkitsModernCurrentFolderId = null;
}

function toolkitsModernEnterFolder(folderId) {
    if (!folderId) {
        toolkitsModernResetFolder();
    } else {
        window.toolkitsModernCurrentFolderId = folderId;
        toolkitsModernSelectTreeNode(folderId);
    }

    var loSearch = document.getElementById('toolkits-modern-lo-search');
    var workspaceSearch = document.getElementById('workspace_search');
    if (loSearch && loSearch.value) {
        loSearch.value = '';
    }
    if (workspaceSearch && workspaceSearch.value) {
        workspaceSearch.value = '';
    }

    toolkitsModernRenderObjectList();
}

function toolkitsModernCountFolderLearningObjects(folderId) {
    if (typeof workspace === 'undefined' || !workspace.items || !folderId) {
        return 0;
    }
    var count = 0;
    workspace.items.forEach(function (item) {
        if (item.parent !== folderId) {
            return;
        }
        if (toolkitsModernIsLearningObjectNode(item)) {
            count++;
        } else if (toolkitsModernIsFolderNode(item) && !toolkitsModernIsRecycleBinNode(item)) {
            count += toolkitsModernCountFolderLearningObjects(item.id);
        }
    });
    return count;
}

function toolkitsModernFormatFolderCount(count) {
    var cfg = window.toolkits_index_config || {};
    var s = cfg.strings || {};
    var template = s.modernFolderCount || '%s learning objects';
    return String(template).replace('%s', String(count));
}

function toolkitsModernGetFolderBreadcrumb() {
    var crumbs = [];
    if (window.toolkitsModernBrowseMode !== 'all' || typeof workspace === 'undefined' || !workspace.nodes) {
        return crumbs;
    }
    var currentId = toolkitsModernGetCurrentFolderId();
    var rootId = toolkitsModernGetWorkspaceRootId();
    if (!currentId || currentId === rootId) {
        return crumbs;
    }
    var path = [];
    var guard = 0;
    var node = workspace.nodes[currentId];
    while (node && toolkitsModernIsFolderNode(node) && guard < 50) {
        path.unshift({ id: node.id, text: node.text || '' });
        if (!node.parent || node.parent === '#' || node.parent === rootId) {
            break;
        }
        node = workspace.nodes[node.parent] || null;
        guard++;
    }
    return path;
}

function toolkitsModernIsTrashLearningObjectNode(item) {
    if (!toolkitsModernIsRecycleBinNode(item)) {
        return false;
    }
    return item && item.xot_type === 'file';
}

var TOOLKITS_MODERN_RECENT_KEY = 'toolkits_modern_recent';
var TOOLKITS_MODERN_RECENT_MAX = 25;
window.toolkitsModernBrowseMode = 'all';

function toolkitsModernGetRecentIds() {
    try {
        var raw = window.localStorage.getItem(TOOLKITS_MODERN_RECENT_KEY);
        var parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function toolkitsModernRememberRecent(nodeId) {
    if (!nodeId || typeof workspace === 'undefined' || !workspace.nodes || !workspace.nodes[nodeId]) {
        return;
    }
    if (!toolkitsModernIsLearningObjectNode(workspace.nodes[nodeId])) {
        return;
    }
    var ids = toolkitsModernGetRecentIds().filter(function (id) {
        return id !== nodeId;
    });
    ids.unshift(nodeId);
    if (ids.length > TOOLKITS_MODERN_RECENT_MAX) {
        ids = ids.slice(0, TOOLKITS_MODERN_RECENT_MAX);
    }
    try {
        window.localStorage.setItem(TOOLKITS_MODERN_RECENT_KEY, JSON.stringify(ids));
    } catch (e) { /* storage unavailable */ }
    toolkitsModernUpdateNavCounts();
}

function toolkitsModernCountLearningObjectsByMode(mode) {
    if (typeof workspace === 'undefined' || !workspace.items) {
        return 0;
    }
    var count = 0;
    var recentIds = mode === 'recent' ? toolkitsModernGetRecentIds() : null;
    var recentRank = {};

    if (recentIds) {
        recentIds.forEach(function (id, index) {
            recentRank[id] = index;
        });
    }

    workspace.items.forEach(function (item) {
        if (mode === 'trash') {
            if (!toolkitsModernIsTrashLearningObjectNode(item)) {
                return;
            }
        } else if (!toolkitsModernIsLearningObjectNode(item)) {
            return;
        }
        item = toolkitsModernSyncWorkspaceItemMeta(item);
        if (mode === 'favourites' && !toolkitsModernIsFavorite(item.favorite)) {
            return;
        }
        if (mode === 'published' && !toolkitsModernIsPublished(item.published)) {
            return;
        }
        if (recentIds && recentRank[item.id] === undefined) {
            return;
        }
        count++;
    });

    return count;
}

function toolkitsModernUpdateNavCounts() {
    var modes = ['recent', 'published', 'favourites', 'trash'];
    modes.forEach(function (mode) {
        var badge = document.querySelector('[data-modern-nav-count="' + mode + '"]');
        if (badge) {
            badge.textContent = String(toolkitsModernCountLearningObjectsByMode(mode));
        }
    });
}

function toolkitsModernGetBrowseStrings() {
    var cfg = window.toolkits_index_config || {};
    var s = cfg.strings || {};
    if (window.toolkitsModernBrowseMode === 'recent') {
        return {
            filter: s.modernNavRecent || 'Recent',
            emptyTitle: s.modernRecentEmptyTitle || 'You have no recent learning objects yet',
            emptyDesc: s.modernRecentEmptyDesc || 'Recent learning objects appear here'
        };
    }
    if (window.toolkitsModernBrowseMode === 'favourites') {
        return {
            filter: s.modernNavFavourites || 'Favourites',
            emptyTitle: s.modernFavouritesEmptyTitle || 'You have no favourite learning objects yet',
            emptyDesc: s.modernFavouritesEmptyDesc || 'Favourite learning objects appear here'
        };
    }
    if (window.toolkitsModernBrowseMode === 'published') {
        return {
            filter: s.modernNavPublished || 'Published',
            emptyTitle: s.modernPublishedEmptyTitle || 'You have no published learning objects yet',
            emptyDesc: s.modernPublishedEmptyDesc || 'Published learning objects appear here'
        };
    }
    if (window.toolkitsModernBrowseMode === 'trash') {
        return {
            filter: s.modernNavTrash || 'Trash',
            emptyTitle: s.modernTrashEmptyTitle || 'Your trash is empty',
            emptyDesc: s.modernTrashEmptyDesc || 'Deleted learning objects appear here'
        };
    }
    var inFolder = false;
    if (window.toolkitsModernBrowseMode === 'all') {
        var currentFolderId = toolkitsModernGetCurrentFolderId();
        var rootId = toolkitsModernGetWorkspaceRootId();
        inFolder = !!(currentFolderId && rootId && currentFolderId !== rootId);
    }
    return {
        filter: s.modernNavAll || 'All learning objects',
        emptyTitle: inFolder
            ? (s.modernFolderEmptyTitle || 'This folder is empty')
            : (s.modernEmptyTitle || 'You have no learning objects yet'),
        emptyDesc: inFolder
            ? (s.modernFolderEmptyDesc || 'Learning objects and folders appear here')
            : (s.modernEmptyDesc || 'Learning objects appear here')
    };
}

function toolkitsModernEscapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function toolkitsModernFormatDate(value) {
    if (!value) {
        return '';
    }
    var d = new Date(String(value).replace(' ', 'T'));
    if (isNaN(d.getTime())) {
        return String(value).split(' ')[0] || '';
    }
    var day = String(d.getDate()).padStart(2, '0');
    var month = String(d.getMonth() + 1).padStart(2, '0');
    var year = d.getFullYear();
    return day + '-' + month + '-' + year;
}

function toolkitsModernIsFavorite(value) {
    return parseInt(value, 10) === 1;
}

function toolkitsModernIsPublished(value) {
    return value === true || value === 1 || value === '1' || value === 'true';
}

function toolkitsModernFormatAccess(access) {
    var cfg = window.toolkits_index_config || {};
    var s = cfg.strings || {};
    var key = toolkitsModernNormalizeAccess(access);
    if (key === 'public') {
        return s.modernLoAccessPublic || 'Public';
    }
    if (key === 'password') {
        return s.modernLoAccessPassword || 'Password';
    }
    if (key === 'demo') {
        return s.modernLoAccessDemo || 'Demo';
    }
    return s.modernLoAccessPrivate || 'Private';
}

function toolkitsModernNormalizeAccess(access) {
    var value = String(access || '');
    if (value === 'Public') {
        return 'public';
    }
    if (value === 'Password' || value.indexOf('PasswordPlay-') === 0) {
        return 'password';
    }
    if (value.indexOf('Other-') === 0) {
        return 'demo';
    }
    return 'private';
}

window.toolkitsModernAccessFilter = 'all';

function toolkitsModernGetAccessFilter() {
    var value = window.toolkitsModernAccessFilter || 'all';
    if (['all', 'public', 'password', 'private', 'demo'].indexOf(value) === -1) {
        return 'all';
    }
    return value;
}

function toolkitsModernSetAccessFilter(value) {
    if (['all', 'public', 'password', 'private', 'demo'].indexOf(value) !== -1) {
        window.toolkitsModernAccessFilter = value;
    } else {
        window.toolkitsModernAccessFilter = 'all';
    }
    toolkitsModernRenderObjectList();
}

function toolkitsModernGetLoPreviewUrl(templateId) {
    if (!templateId) {
        return '';
    }
    var path = 'preview.php?template_id=' + templateId;
    if (typeof url_return === 'function') {
        path = url_return('preview', templateId);
    }
    var base = (typeof site_url !== 'undefined' && site_url) ? site_url : '';
    return base + path + '#page1';
}

function toolkitsModernGetLoThumbnailUrl(templateId) {
    if (!templateId) {
        return '';
    }

    var base =
        (typeof site_url !== 'undefined' && site_url)
            ? site_url
            : '';

    return (
        base +
        'website_code/php/thumbnails/image.php' +
        '?template_id=' +
        encodeURIComponent(templateId) +
        '&first=1'
    );
}

function toolkitsModernOpenLoPreviewLightbox(previewUrl, title) {
    var overlay = document.getElementById('toolkits-modern-lo-preview');
    var frame = document.getElementById('toolkits-modern-lo-preview-frame');
    var titleEl = document.getElementById('toolkits-modern-lo-preview-title');
    if (!overlay || !frame || !previewUrl) {
        return;
    }
    frame.src = previewUrl;
    frame.title = title || 'Preview';
    if (titleEl) {
        titleEl.textContent = title || '';
    }
    overlay.hidden = false;
    document.body.classList.add('toolkits-modern-lo-preview-open');
}

function toolkitsModernCloseLoPreviewLightbox() {
    var overlay = document.getElementById('toolkits-modern-lo-preview');
    var frame = document.getElementById('toolkits-modern-lo-preview-frame');
    if (overlay) {
        overlay.hidden = true;
    }
    if (frame) {
        frame.src = 'about:blank';
    }
    document.body.classList.remove('toolkits-modern-lo-preview-open');
}

function toolkitsModernBindLoPreviewLightbox() {
    if (window.toolkitsModernLoPreviewBound) {
        return;
    }
    window.toolkitsModernLoPreviewBound = true;

    document.addEventListener('click', function (e) {
        if (e.target.closest('[data-lo-preview-close]')) {
            e.preventDefault();
            toolkitsModernCloseLoPreviewLightbox();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            var overlay = document.getElementById('toolkits-modern-lo-preview');
            if (overlay && !overlay.hidden) {
                toolkitsModernCloseLoPreviewLightbox();
            }
        }
    });
}

function toolkitsModernSyncWorkspaceItemMeta(item) {
    if (!item || typeof workspace === 'undefined' || !workspace.nodes || !workspace.nodes[item.id]) {
        return item;
    }
    var node = workspace.nodes[item.id];
    if (item.date_created !== undefined) {
        node.date_created = item.date_created;
    }
    if (item.date_modified !== undefined) {
        node.date_modified = item.date_modified;
    }
    if (item.display_name !== undefined) {
        node.display_name = item.display_name;
    }
    if (item.access !== undefined) {
        node.access = item.access;
    }
    if (item.favorite !== undefined) {
        node.favorite = item.favorite;
    }
    return node;
}

function toolkitsModernUpdateBrowseChrome() {
    var copy = toolkitsModernGetBrowseStrings();
    var filterEl = document.getElementById('toolkits-modern-objects-filter');
    var titleEl = document.getElementById('toolkits-modern-lo-empty-title');
    var textEl = document.getElementById('toolkits-modern-lo-empty-text');
    var accessFilter = toolkitsModernGetAccessFilter();
    if (filterEl) {
        if (window.toolkitsModernBrowseMode === 'all') {
            var crumbs = toolkitsModernGetFolderBreadcrumb();
            var html;
            if (crumbs.length) {
                html = '<button type="button" class="toolkits-modern-objects__crumb" data-modern-folder-crumb="">' +
                    toolkitsModernEscapeHtml(copy.filter) +
                    '</button>';
            } else {
                html = '<span class="toolkits-modern-objects__crumb toolkits-modern-objects__crumb--current">' +
                    toolkitsModernEscapeHtml(copy.filter) +
                    '</span>';
            }
            crumbs.forEach(function (crumb, index) {
                html += '<span class="toolkits-modern-objects__crumb-sep" aria-hidden="true">&gt;</span>';
                if (index === crumbs.length - 1) {
                    html += '<span class="toolkits-modern-objects__crumb toolkits-modern-objects__crumb--current">' +
                        toolkitsModernEscapeHtml(crumb.text) +
                        '</span>';
                } else {
                    html += '<button type="button" class="toolkits-modern-objects__crumb" data-modern-folder-crumb="' +
                        toolkitsModernEscapeHtml(crumb.id) + '">' +
                        toolkitsModernEscapeHtml(crumb.text) +
                        '</button>';
                }
            });
            filterEl.innerHTML = html;
        } else {
            filterEl.innerHTML = '<span class="toolkits-modern-objects__crumb toolkits-modern-objects__crumb--current">' +
                toolkitsModernEscapeHtml(copy.filter) +
                '</span>';
        }
    }
    document.querySelectorAll('[data-modern-access]').forEach(function (pill) {
        var active = pill.getAttribute('data-modern-access') === accessFilter;
        pill.classList.toggle('toolkits-modern-objects__access-pill--active', active);
        pill.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    if (titleEl) {
        titleEl.textContent = copy.emptyTitle;
    }
    if (textEl) {
        textEl.textContent = copy.emptyDesc;
    }
}

function toolkitsModernUpdateObjectsCount(objects) {
    var countEl = document.getElementById('toolkits-modern-objects-count');
    if (!countEl) {
        return;
    }
    var list = objects || [];
    var count = 0;
    list.forEach(function (item) {
        if (!toolkitsModernIsFolderNode(item)) {
            count++;
        }
    });
    countEl.textContent = toolkitsModernFormatFolderCount(count);
}

function toolkitsModernCollectLearningObjects() {
    if (typeof workspace === 'undefined' || !workspace.items) {
        return [];
    }
    var searchInput = document.getElementById('workspace_search');
    var search = searchInput ? String(searchInput.value || '').trim() : '';
    var reg = search ? new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi') : null;
    var objects = [];
    var recentIds = window.toolkitsModernBrowseMode === 'recent' ? toolkitsModernGetRecentIds() : null;
    var recentRank = {};
    var isAllMode = window.toolkitsModernBrowseMode === 'all';
    var currentFolderId = isAllMode && !reg ? toolkitsModernGetCurrentFolderId() : null;

    if (recentIds) {
        recentIds.forEach(function (id, index) {
            recentRank[id] = index;
        });
    }

    workspace.items.forEach(function (item) {
        if (window.toolkitsModernBrowseMode === 'trash') {
            if (!toolkitsModernIsTrashLearningObjectNode(item)) {
                return;
            }
        } else if (isAllMode) {
            if (toolkitsModernIsFolderNode(item)) {
                if (toolkitsModernIsRecycleBinNode(item)) {
                    return;
                }
                if (currentFolderId && item.parent !== currentFolderId) {
                    return;
                }
            } else if (!toolkitsModernIsLearningObjectNode(item)) {
                return;
            } else if (currentFolderId && item.parent !== currentFolderId) {
                return;
            }
        } else if (!toolkitsModernIsLearningObjectNode(item)) {
            return;
        }
        item = toolkitsModernSyncWorkspaceItemMeta(item);
        if (window.toolkitsModernBrowseMode === 'favourites' && !toolkitsModernIsFavorite(item.favorite)) {
            return;
        }
        if (window.toolkitsModernBrowseMode === 'published' && !toolkitsModernIsPublished(item.published)) {
            return;
        }
        if (!toolkitsModernIsFolderNode(item)) {
            var accessFilter = toolkitsModernGetAccessFilter();
            if (accessFilter !== 'all' && toolkitsModernNormalizeAccess(item.access) !== accessFilter) {
                return;
            }
        }
        if (recentIds) {
            if (recentRank[item.id] === undefined) {
                return;
            }
        }
        if (reg) {
            var match = item.text && item.text.match(reg);
            if (!match && workspace.nodes[item.id] && String(workspace.nodes[item.id].xot_id) === search) {
                match = [search];
            }
            if (!match) {
                return;
            }
        }
        objects.push(item);
    });

    if (recentIds) {
        objects.sort(function (a, b) {
            return (recentRank[a.id] || 0) - (recentRank[b.id] || 0);
        });
    } else if (isAllMode && !reg) {
        objects.sort(function (a, b) {
            var aFolder = toolkitsModernIsFolderNode(a) ? 0 : 1;
            var bFolder = toolkitsModernIsFolderNode(b) ? 0 : 1;
            if (aFolder !== bFolder) {
                return aFolder - bFolder;
            }
            return 0;
        });
    }

    return objects;
}

function toolkitsModernGetNodeIconUrl(type) {
    if (typeof getIcon === 'function') {
        return getIcon(type);
    }
    return 'website_code/images/Icon_Page.gif';
}

function toolkitsModernGetObjectTypeLabel(type) {
    var cfg = window.toolkits_index_config || {};
    var s = cfg.strings || {};
    var base = String(type || '').replace(/_shared$/, '').replace(/_group$/, '').toLowerCase();
    if (base === 'nottingham') {
        return s.modernLoTypeInteractive || 'Interactive learning object';
    }
    if (base === 'site') {
        return s.modernLoTypeSite || 'Mini-website learning object';
    }
    if (!type) {
        return '';
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
}

function toolkitsModernUpdateListSelection(nodeId) {
    document.querySelectorAll('.toolkits-modern-lo-item').forEach(function (el) {
        el.classList.toggle('toolkits-modern-lo-item--selected', el.getAttribute('data-node-id') === nodeId);
    });
}

var toolkitsModernLoMenuState = {
    nodeId: '',
    templateId: ''
};

function toolkitsModernCloseLoMenu() {
    var menu = document.getElementById('toolkits-modern-lo-menu');
    if (menu) {
        menu.hidden = true;
    }
    toolkitsModernLoMenuState.nodeId = '';
    toolkitsModernLoMenuState.templateId = '';
}

function toolkitsModernGetLoMenuItems(item) {
    var cfg = window.toolkits_index_config || {};
    var s = cfg.strings || {};
    var isFavorite = toolkitsModernIsFavorite(item.favorite);
    var favoriteLabel = isFavorite ? (s.modernLoMenuUnfavorite || 'Remove favourite') : (s.modernLoMenuFavorite || 'Make favourite');
    return [
        { id: 'edit', icon: 'fa-pencil', label: s.modernLoMenuEdit || 'Edit' },
        { id: 'copy', icon: 'fa-copy', label: s.modernLoMenuCopy || 'Copy' },
        { id: 'preview', icon: 'fa-eye', label: s.modernLoMenuPreview || 'Preview' },
        { id: 'share', icon: 'fa-share-alt', label: s.modernLoMenuShare || 'Share' },
        { id: 'move', icon: 'fa-folder-open', label: s.modernLoMenuMove || 'Move' },
        { id: 'favorite', icon: isFavorite ? 'fa-heart' : 'fa-heart-o', label: favoriteLabel, favoriteValue: isFavorite ? 0 : 1 },
        { id: 'properties', icon: 'fa-sliders', label: s.modernLoMenuProperties || 'Properties' },
        { id: 'delete', icon: 'fa-trash', label: s.modernLoMenuDelete || 'Delete', danger: true }
    ];
}

function toolkitsModernFolderCanManageContents(item) {
    if (!item) {
        return false;
    }
    if (item.type === 'folder') {
        return true;
    }
    if ((item.type === 'folder_shared' || item.type === 'sub_folder_shared') && item.role === 'creator') {
        return true;
    }
    return false;
}

function toolkitsModernFolderCanDuplicate(item) {
    if (!item) {
        return false;
    }
    if (item.type === 'folder' || item.type === 'folder_group') {
        return true;
    }
    if ((item.type === 'folder_shared' || item.type === 'sub_folder_shared') && item.role === 'creator') {
        return true;
    }
    return false;
}

function toolkitsModernGetFolderMenuItems(item) {
    var cfg = window.toolkits_index_config || {};
    var s = cfg.strings || {};
    var items = [
        { id: 'open', icon: 'fa-folder-open', label: s.modernFolderMenuOpen || 'Open' },
        { id: 'properties', icon: 'fa-sliders', label: s.modernLoMenuProperties || 'Properties' }
    ];
    if (toolkitsModernFolderCanDuplicate(item)) {
        items.push({ id: 'copy', icon: 'fa-copy', label: s.modernLoMenuCopy || 'Copy' });
    }
    if (toolkitsModernFolderCanManageContents(item)) {
        items.push({ id: 'newfolder', icon: 'fa-plus', label: s.modernFolderMenuNew || s.modernNewFolder || 'New folder' });
        items.push({ id: 'delete', icon: 'fa-trash', label: s.modernLoMenuDelete || 'Delete', danger: true });
    }
    return items;
}

function toolkitsModernBuildLoMenuHtml(item) {
    var items = toolkitsModernIsFolderNode(item)
        ? toolkitsModernGetFolderMenuItems(item)
        : toolkitsModernGetLoMenuItems(item);
    var html = '';
    items.forEach(function (entry) {
        if (entry.danger) {
            html += '<div class="toolkits-modern-lo-menu__sep" role="separator"></div>';
        }
        var favoriteAttr = entry.id === 'favorite' ? ' data-lo-favorite-value="' + entry.favoriteValue + '"' : '';
        html += '<button type="button" class="toolkits-modern-lo-menu__item' + (entry.danger ? ' toolkits-modern-lo-menu__item--danger' : '') + '" role="menuitem" data-lo-action="' + entry.id + '"' + favoriteAttr + '>' +
            '<i class="fa ' + entry.icon + '" aria-hidden="true"></i>' +
            '<span>' + entry.label + '</span>' +
        '</button>';
    });
    return html;
}

function toolkitsModernOpenLoMenu(button, item) {
    var menu = document.getElementById('toolkits-modern-lo-menu');
    if (!menu || !button) {
        return;
    }
    toolkitsModernLoMenuState.nodeId = item.id;
    toolkitsModernLoMenuState.templateId = String(item.xot_id || '');
    menu.innerHTML = toolkitsModernBuildLoMenuHtml(item);
    menu.hidden = false;
    var rect = button.getBoundingClientRect();
    var menuWidth = menu.offsetWidth || 200;
    menu.style.top = (rect.bottom + 4) + 'px';
    menu.style.left = Math.max(8, rect.right - menuWidth) + 'px';
}

function toolkitsModernRunLoAction(action, nodeId, actionBtn, event) {
    if (!nodeId) {
        return;
    }
    toolkitsModernSelectTreeNode(nodeId);
    toolkitsModernUpdateListSelection(nodeId);
    toolkitsModernCloseLoMenu();

    var node = workspace && workspace.nodes ? workspace.nodes[nodeId] : null;
    if (node && toolkitsModernIsFolderNode(node)) {
        toolkitsModernRunFolderAction(action, nodeId, event);
        return;
    }

    if (action === 'edit') {
        if (typeof openSelectedEditor === 'function') {
            openSelectedEditor(event || null, 'edithtml');
        } else if (typeof edit_window === 'function') {
            edit_window(false, 'edithtml');
        }
    } else if (action === 'copy' && typeof duplicate_template === 'function') {
        duplicate_template();
    } else if (action === 'preview' && typeof preview_window === 'function') {
        preview_window(false);
    } else if (action === 'share' && typeof publishproperties_window === 'function') {
        publishproperties_window(false);
    } else if (action === 'move') {
        toolkitsModernShowWorkspace(false);
    } else if (action === 'favorite') {
        var explicit = actionBtn ? actionBtn.getAttribute('data-lo-favorite-value') : null;
        var next = explicit !== null && explicit !== '' ? parseInt(explicit, 10) : 1;
        if (isNaN(next)) {
            next = 1;
        }
        toolkitsModernToggleFavorite(nodeId, next);
    } else if (action === 'properties') {
        toolkitsModernOpenPropertiesForNode(nodeId);
    } else if (action === 'delete' && typeof remove_this === 'function') {
        remove_this();
    }
}

function toolkitsModernRunFolderAction(action, nodeId, event) {
    if (action === 'open') {
        toolkitsModernEnterFolder(nodeId);
        return;
    }
    if (action === 'properties') {
        var folderNode = workspace && workspace.nodes ? workspace.nodes[nodeId] : null;
        if (folderNode && folderNode.xot_id) {
            toolkitsModernOpenFolderPropertiesModal(folderNode.xot_id, folderNode.text || '');
        }
        return;
    }
    if (action === 'copy' && typeof duplicate_folder === 'function') {
        duplicate_folder();
        return;
    }
    if (action === 'newfolder') {
        if (typeof toolkitsModernCreateNewFolder === 'function') {
            toolkitsModernCreateNewFolder();
        } else if (typeof make_new_folder === 'function') {
            make_new_folder();
        }
        return;
    }
    if (action === 'delete' && typeof remove_this === 'function') {
        remove_this();
    }
}

function toolkitsModernOpenPropertiesForNode(nodeId) {
    var node = workspace && workspace.nodes ? workspace.nodes[nodeId] : null;
    if (!node || !node.xot_id) {
        return;
    }
    if (toolkitsModernIsFolderNode(node)) {
        toolkitsModernOpenFolderPropertiesModal(node.xot_id, node.text || '');
        return;
    }
    toolkitsModernOpenPropertiesModal(node.xot_id, node.text || '');
}

function toolkitsModernGetPropertiesUrl(templateId) {
    if (!templateId) {
        return '';
    }
    var base = (typeof site_url !== 'undefined' && site_url) ? site_url : '';
    // Always use query-string form in the embed modal so template_id is available
    // even when iframe window.name does not stick (unlike window.open).
    return base + 'properties.php?template_id=' + encodeURIComponent(templateId) + '&embed=1';
}

function toolkitsModernGetFolderPropertiesUrl(folderId) {
    if (!folderId) {
        return '';
    }
    var base = (typeof site_url !== 'undefined' && site_url) ? site_url : '';
    return base + 'folderproperties.php?folder_id=' + encodeURIComponent(folderId) + '&embed=1';
}

function toolkitsModernOpenPropertiesModal(templateId, title) {
    toolkitsModernOpenPropertiesFrame(
        toolkitsModernGetPropertiesUrl(templateId),
        String(templateId),
        title,
        false
    );
}

function toolkitsModernOpenFolderPropertiesModal(folderId, title) {
    toolkitsModernOpenPropertiesFrame(
        toolkitsModernGetFolderPropertiesUrl(folderId),
        String(folderId) + '_folder',
        title,
        true
    );
}

function toolkitsModernOpenPropertiesFrame(url, frameName, title, isFolder) {
    var modal = document.getElementById('toolkits-modern-properties-modal');
    var frame = document.getElementById('toolkits-modern-properties-frame');
    var titleEl = document.getElementById('toolkits-modern-properties-modal-title');
    var cfg = window.toolkits_index_config || {};
    var s = cfg.strings || {};
    if (!modal || !frame || !url) {
        return;
    }

    window.window_reference = window;

    // Recreate the iframe so the browsing context gets a reliable window.name.
    var fresh = document.createElement('iframe');
    fresh.className = frame.className;
    fresh.id = frame.id;
    fresh.name = String(frameName);
    fresh.setAttribute('name', String(frameName));
    fresh.title = title || (s.modernLoMenuProperties || 'Properties');
    fresh.src = url;
    if (frame.parentNode) {
        frame.parentNode.replaceChild(fresh, frame);
    }

    var heading = s.modernLoMenuProperties || s.properties || 'Properties';
    if (isFolder) {
        heading = s.modernFolderPropertiesTitle || heading;
    }
    if (titleEl) {
        titleEl.textContent = title ? (heading + ': ' + title) : heading;
    }
    modal.hidden = false;
    document.body.classList.add('toolkits-modern-properties-modal-open');
}

function toolkitsModernClosePropertiesModal() {
    var modal = document.getElementById('toolkits-modern-properties-modal');
    var frame = document.getElementById('toolkits-modern-properties-frame');
    if (modal) {
        modal.hidden = true;
    }
    if (frame) {
        frame.src = 'about:blank';
        frame.removeAttribute('name');
    }
    document.body.classList.remove('toolkits-modern-properties-modal-open');
    if (typeof refresh_workspace === 'function') {
        refresh_workspace();
    }
}

function toolkitsModernBindPropertiesModal() {
    if (window.toolkitsModernPropertiesModalBound) {
        return;
    }
    window.toolkitsModernPropertiesModalBound = true;

    document.addEventListener('click', function (e) {
        if (e.target.closest('[data-properties-modal-close]')) {
            e.preventDefault();
            toolkitsModernClosePropertiesModal();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') {
            return;
        }
        var modal = document.getElementById('toolkits-modern-properties-modal');
        if (modal && !modal.hidden) {
            toolkitsModernClosePropertiesModal();
        }
    });
}

function properties_window(admin) {
    if (admin) {
        toolkitsModernOpenPropertiesModal(admin, '');
        return;
    }
    if (typeof $ === 'undefined' || typeof workspace === 'undefined') {
        return;
    }
    var tree = $.jstree.reference('#workspace');
    if (!tree) {
        return;
    }
    var ids = tree.get_selected();
    if (!ids || !ids.length) {
        return;
    }
    if (workspace.nodes[ids[0]].type === 'workspace') {
        if (typeof site_url !== 'undefined' && typeof url_return === 'function') {
            var workspaceWin = window.open(
                site_url + url_return('workspaceproperties', null),
                'workspace',
                'height=760, width=1000'
            );
            if (workspaceWin) {
                workspaceWin.window_reference = window;
                workspaceWin.focus();
            }
        }
        return;
    }
    for (var i = 0; i < ids.length; i++) {
        var node = workspace.nodes[ids[i]];
        if (!node) {
            continue;
        }
        if (node.type === 'folder' || node.type === 'folder_shared' || node.type === 'sub_folder_shared' || node.type === 'folder_group') {
            toolkitsModernOpenFolderPropertiesModal(node.xot_id, node.text || '');
        } else if (node.parent !== workspace.recyclebin_id) {
            toolkitsModernOpenPropertiesModal(node.xot_id, node.text || '');
        } else if (typeof RECYCLE_PROPERTIES !== 'undefined') {
            window.alert(RECYCLE_PROPERTIES);
        }
    }
}

function toolkitsModernToggleFavorite(nodeId, favorite) {
    var node = workspace && workspace.nodes ? workspace.nodes[nodeId] : null;
    if (!node || !node.xot_id || typeof $ === 'undefined' || typeof apiV1Url !== 'function') {
        return;
    }
    var nextFavorite = parseInt(favorite, 10) === 1 ? 1 : 0;
    $.ajax({
        type: 'POST',
        url: apiV1Url('workspace/toggle-favorite'),
        dataType: 'json',
        data: {
            template_id: node.xot_id,
            favorite: nextFavorite
        }
    }).done(function (response) {
        if (response && response.ok === false) {
            return;
        }
        var data = typeof apiUnpack === 'function' ? apiUnpack(response) : response;
        var value = data && typeof data.favorite !== 'undefined' ? parseInt(data.favorite, 10) : nextFavorite;
        if (isNaN(value)) {
            value = nextFavorite;
        }
        node.favorite = value;
        if (workspace.items) {
            workspace.items.forEach(function (item) {
                if (item.id === nodeId) {
                    item.favorite = value;
                }
            });
        }
        toolkitsModernRenderObjectList();
        toolkitsModernUpdateNavCounts();
    });
}

function toolkitsModernBindLoMenu() {
    if (window.toolkitsModernLoMenuBound) {
        return;
    }
    window.toolkitsModernLoMenuBound = true;

    document.addEventListener('click', function (e) {
        var menuBtn = e.target.closest('[data-lo-menu-trigger]');
        if (menuBtn) {
            e.preventDefault();
            e.stopPropagation();
            var row = menuBtn.closest('.toolkits-modern-lo-item');
            var nodeId = row ? row.getAttribute('data-node-id') : '';
            var item = workspace && workspace.nodes ? workspace.nodes[nodeId] : null;
            if (item) {
                toolkitsModernOpenLoMenu(menuBtn, item);
            }
            return;
        }
        var actionBtn = e.target.closest('[data-lo-action]');
        if (actionBtn && actionBtn.closest('#toolkits-modern-lo-menu')) {
            e.preventDefault();
            e.stopPropagation();
            toolkitsModernRunLoAction(actionBtn.getAttribute('data-lo-action'), toolkitsModernLoMenuState.nodeId, actionBtn, e);
            return;
        }
        if (!e.target.closest('#toolkits-modern-lo-menu')) {
            toolkitsModernCloseLoMenu();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            toolkitsModernCloseLoMenu();
        }
    });
}

function toolkitsModernBindLoToolbar() {
    if (window.toolkitsModernLoToolbarBound) {
        return;
    }
    window.toolkitsModernLoToolbarBound = true;

    var loSearch = document.getElementById('toolkits-modern-lo-search');
    var workspaceSearch = document.getElementById('workspace_search');
    var loSort = document.getElementById('toolkits-modern-lo-sort');
    var sortSelector = document.getElementById('sort-selector');

    if (loSearch && workspaceSearch) {
        loSearch.addEventListener('input', function () {
            workspaceSearch.value = loSearch.value;
            toolkitsModernRenderObjectList();
        });
    }

    if (loSort && sortSelector) {
        loSort.value = sortSelector.value || 'date_down';
        loSort.addEventListener('change', function () {
            sortSelector.value = loSort.value;
            if (typeof refresh_workspace === 'function') {
                refresh_workspace();
            }
            if (typeof save_user_preference === 'function') {
                save_user_preference('sort_type', loSort.value);
            }
        });
    }

    document.addEventListener('click', function (e) {
        var crumb = e.target.closest('[data-modern-folder-crumb]');
        if (crumb && crumb.closest('#toolkits-modern-objects-filter')) {
            e.preventDefault();
            var folderId = crumb.getAttribute('data-modern-folder-crumb') || '';
            toolkitsModernEnterFolder(folderId || null);
            return;
        }
        var accessPill = e.target.closest('[data-modern-access]');
        if (accessPill && accessPill.closest('#toolkits-modern-access-filters')) {
            e.preventDefault();
            toolkitsModernSetAccessFilter(accessPill.getAttribute('data-modern-access') || 'all');
            return;
        }
        if (e.target.closest('#toolkits-modern-new-folder')) {
            e.preventDefault();
            toolkitsModernCreateNewFolder();
            return;
        }
        if (e.target.closest('#toolkits-modern-import')) {
            e.preventDefault();
            toolkitsModernOpenImport();
        }
    });
}

function toolkitsModernEnsureFolderSelectionForCreate() {
    if (typeof $ === 'undefined' || typeof workspace === 'undefined') {
        return;
    }
    var tree = $.jstree.reference('#workspace');
    if (!tree) {
        return;
    }
    if (window.toolkitsModernBrowseMode === 'all') {
        var currentFolderId = toolkitsModernGetCurrentFolderId();
        var rootId = toolkitsModernGetWorkspaceRootId();
        if (currentFolderId && currentFolderId !== rootId) {
            tree.deselect_all();
            tree.select_node(currentFolderId);
            return;
        }
        if (rootId) {
            tree.deselect_all();
            tree.select_node(rootId);
        }
        return;
    }
    var ids = tree.get_selected();
    if ((!ids || !ids.length) && workspace.workspace_id) {
        tree.select_node(workspace.workspace_id);
    }
}

function toolkitsModernCreateNewFolder() {
    toolkitsModernEnsureFolderSelectionForCreate();
    if (typeof make_new_folder === 'function') {
        make_new_folder();
    }
}

function make_new_folder() {
    var box = document.getElementById('message_box');
    var nameInput = document.getElementById('foldername');
    var feedback = document.getElementById('folder_feedback');
    if (!box) {
        return;
    }
    if (nameInput) {
        nameInput.value = '';
    }
    if (feedback) {
        feedback.innerHTML = '';
    }
    box.hidden = false;
    box.style.display = 'flex';
    box.style.left = '';
    box.style.top = '';
    box.style.zIndex = '2200';
    document.body.classList.add('toolkits-modern-folder-modal-open');
    setTimeout(function () {
        if (nameInput) {
            nameInput.focus();
        }
    }, 0);
}

function popup_close() {
    if (typeof folder_timeout !== 'undefined' && folder_timeout) {
        clearTimeout(folder_timeout);
    }
    var box = document.getElementById('message_box');
    if (box) {
        box.hidden = true;
        box.style.display = 'none';
        box.style.zIndex = '';
        box.style.left = '';
        box.style.top = '';
    }
    document.body.classList.remove('toolkits-modern-folder-modal-open');
}

function toolkitsModernBindFolderModal() {
    if (window.toolkitsModernFolderModalBound) {
        return;
    }
    window.toolkitsModernFolderModalBound = true;

    document.addEventListener('click', function (e) {
        if (e.target.closest('[data-folder-modal-close]')) {
            e.preventDefault();
            popup_close();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') {
            return;
        }
        var box = document.getElementById('message_box');
        if (box && !box.hidden) {
            popup_close();
        }
    });
}

function toolkitsModernCloseImportModal() {
    var modal = document.getElementById('toolkits-modern-import-modal');
    if (modal) {
        modal.hidden = true;
    }
    document.body.classList.remove('toolkits-modern-import-modal-open');
}

function toolkitsModernOpenImport() {
    var cfg = window.toolkits_index_config || {};
    var s = cfg.strings || {};
    var modal = document.getElementById('toolkits-modern-import-modal');
    var form = document.getElementById('importpopup');
    var nameInput = document.getElementById('templatename');
    var nameWrong = document.getElementById('namewrong');
    var submitBtn = document.getElementById('submitbutton');

    window.WORKSPACE_UPLOAD = s.modernImportUpload || 'Upload';
    window.WORKSPACE_UPLOADING = s.modernImportUploading || 'Uploading...';
    if (typeof window.NAME_FAIL_IMPORT === 'undefined') {
        window.NAME_FAIL_IMPORT = s.modernImportNameFail || 'Sorry that is not a valid project name. Please use only letters and numbers.';
    }
    window.window_reference = window;

    if (!modal) {
        return;
    }
    if (form && typeof form.reset === 'function') {
        form.reset();
    }
    if (nameInput) {
        nameInput.value = '';
    }
    if (nameWrong) {
        nameWrong.innerHTML = '';
    }
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa fa-upload" aria-hidden="true"></i> ' + (s.modernImportUpload || 'Upload');
    }

    modal.hidden = false;
    document.body.classList.add('toolkits-modern-import-modal-open');
    setTimeout(function () {
        if (nameInput) {
            nameInput.focus();
        }
    }, 0);
}

function toolkitsModernBindImportModal() {
    if (window.toolkitsModernImportModalBound) {
        return;
    }
    window.toolkitsModernImportModalBound = true;

    document.addEventListener('click', function (e) {
        if (e.target.closest('[data-import-modal-close]')) {
            e.preventDefault();
            toolkitsModernCloseImportModal();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') {
            return;
        }
        var modal = document.getElementById('toolkits-modern-import-modal');
        if (modal && !modal.hidden) {
            toolkitsModernCloseImportModal();
        }
    });

    if (typeof iframe_check === 'function' && !window.toolkitsModernIframeCheckWrapped) {
        window.toolkitsModernIframeCheckWrapped = true;
        var originalIframeCheck = iframe_check;
        window.iframe_check = function () {
            var iframe = window.upload_iframe;
            var html = iframe && iframe.document && iframe.document.body ? iframe.document.body.innerHTML : '';
            var success = html !== '' && html.indexOf('****') !== -1;
            originalIframeCheck.apply(this, arguments);
            if (success) {
                toolkitsModernCloseImportModal();
            }
        };
    }
}

function toolkitsModernBindListTreeSelection() {
    if (window.toolkitsModernListSelectBound || typeof $ === 'undefined' || !$('#workspace').length) {
        return;
    }
    $('#workspace').on('select_node.jstree toolkitsModernListRefresh', function (e, data) {
        var nodeId = data && data.node ? data.node.id : '';
        if (!nodeId && typeof workspace !== 'undefined' && workspace.current_node) {
            nodeId = workspace.current_node.id || '';
        }
        if (nodeId && data && data.node && toolkitsModernIsLearningObjectNode(data.node)) {
            toolkitsModernRememberRecent(nodeId);
            if (window.toolkitsModernBrowseMode === 'recent') {
                toolkitsModernRenderObjectList();
            }
        }
        toolkitsModernUpdateListSelection(nodeId);
    }).on('deselect_all.jstree', function () {
        toolkitsModernUpdateListSelection('');
    });
    window.toolkitsModernListSelectBound = true;
}

window.toolkitsModernExpandedFolderIds = window.toolkitsModernExpandedFolderIds || {};
window.toolkitsModernFolderDetailCache = window.toolkitsModernFolderDetailCache || {};
window.toolkitsModernExpandedLoIds = window.toolkitsModernExpandedLoIds || {};
window.toolkitsModernLoDetailCache = window.toolkitsModernLoDetailCache || {};

function toolkitsModernRenderFolderDetailContent(info, item, s) {
    var count = toolkitsModernCountFolderLearningObjects(item.id);
    var countLabel = toolkitsModernFormatFolderCount(count);
    var role = toolkitsModernFormatShareRole((info && info.role) || item.role || '');
    var folderId = (info && info.folder_id != null) ? info.folder_id : (item.xot_id || '');
    var created = (info && info.date_created) ? info.date_created : (item.date_created || '');
    var modified = (info && info.date_modified) ? info.date_modified : (item.date_modified || '');
    var sharing = (info && info.sharing) ? info.sharing : null;

    return '<div class="toolkits-modern-lo-detail__grid toolkits-modern-lo-detail__grid--folder">' +
        '<div class="toolkits-modern-lo-detail__meta">' +
            '<div class="toolkits-modern-lo-detail__row">' +
                '<span class="toolkits-modern-lo-detail__label">' + toolkitsModernEscapeHtml(s.modernFolderDetailId || 'ID') + '</span>' +
                '<span class="toolkits-modern-lo-detail__value">' + toolkitsModernEscapeHtml(String(folderId || '—')) + '</span>' +
            '</div>' +
            '<div class="toolkits-modern-lo-detail__row">' +
                '<span class="toolkits-modern-lo-detail__label">' + toolkitsModernEscapeHtml(s.modernFolderDetailCreated || 'Created') + '</span>' +
                '<span class="toolkits-modern-lo-detail__value">' + toolkitsModernEscapeHtml(toolkitsModernFormatDate(created) || '—') + '</span>' +
            '</div>' +
            '<div class="toolkits-modern-lo-detail__row">' +
                '<span class="toolkits-modern-lo-detail__label">' + toolkitsModernEscapeHtml(s.modernFolderDetailModified || 'Modified') + '</span>' +
                '<span class="toolkits-modern-lo-detail__value">' + toolkitsModernEscapeHtml(toolkitsModernFormatDate(modified) || '—') + '</span>' +
            '</div>' +
            '<div class="toolkits-modern-lo-detail__row">' +
                '<span class="toolkits-modern-lo-detail__label">' + toolkitsModernEscapeHtml(s.modernFolderDetailRights || 'Your rights') + '</span>' +
                '<span class="toolkits-modern-lo-detail__value">' + toolkitsModernEscapeHtml(role || '—') + '</span>' +
            '</div>' +
            '<div class="toolkits-modern-lo-detail__row">' +
                '<span class="toolkits-modern-lo-detail__label">' + toolkitsModernEscapeHtml(s.modernFolderDetailCount || 'Learning objects') + '</span>' +
                '<span class="toolkits-modern-lo-detail__value">' + toolkitsModernEscapeHtml(countLabel) + '</span>' +
            '</div>' +
            '<div class="toolkits-modern-lo-detail__row toolkits-modern-lo-detail__row--share">' +
                '<span class="toolkits-modern-lo-detail__label">' + toolkitsModernEscapeHtml(s.modernLoDetailShared || 'Shared') + '</span>' +
                '<span class="toolkits-modern-lo-detail__value">' + toolkitsModernBuildSharedListHtml(sharing, s) + '</span>' +
            '</div>' +
        '</div>' +
    '</div>';
}

function toolkitsModernLoadFolderDetail(item, panelEl) {
    var cfg = window.toolkits_index_config || {};
    var s = cfg.strings || {};
    var folderId = item.xot_id;
    if (!panelEl || !folderId) {
        return;
    }

    var cached = window.toolkitsModernFolderDetailCache[folderId];
    if (cached) {
        panelEl.innerHTML = toolkitsModernRenderFolderDetailContent(cached, item, s);
        return;
    }

    panelEl.innerHTML = '<p class="toolkits-modern-lo-detail__loading">' +
        '<i class="fa fa-spinner fa-spin" aria-hidden="true"></i> ' +
        toolkitsModernEscapeHtml(s.modernLoDetailLoading || 'Loading details...') +
        '</p>';

    if (typeof $ === 'undefined' || typeof apiV1Url !== 'function') {
        panelEl.innerHTML = '<p class="toolkits-modern-lo-detail__error">' +
            toolkitsModernEscapeHtml(s.modernLoDetailError || 'Could not load details.') +
            '</p>';
        return;
    }

    $.ajax({
        type: 'POST',
        url: apiV1Url('folders/info'),
        dataType: 'json',
        data: {
            folder_id: folderId,
            user_id: typeof workspace !== 'undefined' ? workspace.user : ''
        }
    }).done(function (response) {
        var info = typeof apiUnpack === 'function' ? apiUnpack(response) : response;
        if (!info || info.folder_id == null) {
            panelEl.innerHTML = '<p class="toolkits-modern-lo-detail__error">' +
                toolkitsModernEscapeHtml(s.modernLoDetailError || 'Could not load details.') +
                '</p>';
            return;
        }
        if (info.role && workspace && workspace.nodes && workspace.nodes[item.id]) {
            workspace.nodes[item.id].role = info.role;
            item.role = info.role;
        }
        window.toolkitsModernFolderDetailCache[folderId] = info;
        panelEl.innerHTML = toolkitsModernRenderFolderDetailContent(info, item, s);
    }).fail(function () {
        panelEl.innerHTML = '<p class="toolkits-modern-lo-detail__error">' +
            toolkitsModernEscapeHtml(s.modernLoDetailError || 'Could not load details.') +
            '</p>';
    });
}

function toolkitsModernToggleFolderExpand(item, tr, detailTr, chevronBtn) {
    var cfg = window.toolkits_index_config || {};
    var s = cfg.strings || {};
    var expanded = !window.toolkitsModernExpandedFolderIds[item.id];
    window.toolkitsModernExpandedFolderIds[item.id] = expanded;
    toolkitsModernSetLoExpandState(tr, detailTr, chevronBtn, expanded, s);
    if (expanded) {
        var panel = detailTr.querySelector('[data-folder-detail-panel]');
        toolkitsModernLoadFolderDetail(item, panel);
    }
}

function toolkitsModernRenderFolderRow(item, selectedId, s) {
    var expanded = !!window.toolkitsModernExpandedFolderIds[item.id];
    var tr = document.createElement('tr');
    tr.className = 'toolkits-modern-lo-item toolkits-modern-lo-item--folder';
    if (item.id === selectedId) {
        tr.classList.add('toolkits-modern-lo-item--selected');
    }
    if (expanded) {
        tr.classList.add('toolkits-modern-lo-item--expanded');
    }
    tr.setAttribute('data-node-id', item.id);
    tr.setAttribute('data-folder-id', item.id);

    var previewTd = document.createElement('td');
    previewTd.className = 'toolkits-modern-lo-item__preview';
    var chevronBtn = document.createElement('button');
    chevronBtn.type = 'button';
    chevronBtn.className = 'toolkits-modern-lo-item__chevron';
    chevronBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    chevronBtn.setAttribute(
        'aria-label',
        expanded
            ? (s.modernLoDetailCollapse || 'Hide details')
            : (s.modernLoDetailExpand || 'Show details')
    );
    chevronBtn.innerHTML = '<i class="fa ' + (expanded ? 'fa-chevron-down' : 'fa-chevron-right') + '" aria-hidden="true"></i>';
    var iconWrap = document.createElement('span');
    iconWrap.className = 'toolkits-modern-lo-item__folder-icon toolkits-modern-lo-item__folder-icon--thumb';
    iconWrap.setAttribute('aria-hidden', 'true');
    iconWrap.innerHTML = '<i class="fa fa-folder-o"></i>';
    previewTd.appendChild(chevronBtn);
    previewTd.appendChild(iconWrap);

    var nameTd = document.createElement('td');
    nameTd.className = 'toolkits-modern-lo-item__name';
    nameTd.innerHTML =
        '<span class="toolkits-modern-lo-item__label toolkits-modern-lo-item__label--folder">' +
            toolkitsModernEscapeHtml(item.text) +
        '</span>' +
        '<span class="toolkits-modern-lo-item__date">' +
            toolkitsModernEscapeHtml(toolkitsModernFormatFolderCount(toolkitsModernCountFolderLearningObjects(item.id))) +
        '</span>';

    var idTd = document.createElement('td');
    idTd.className = 'toolkits-modern-lo-item__id';
    idTd.textContent = String(item.xot_id || '');

    var modifiedTd = document.createElement('td');
    modifiedTd.className = 'toolkits-modern-lo-item__modified';
    modifiedTd.textContent = toolkitsModernFormatDate(item.date_modified) || '—';

    var templateTd = document.createElement('td');
    templateTd.className = 'toolkits-modern-lo-item__template';
    templateTd.innerHTML =
        '<span class="toolkits-modern-lo-item__type">' +
            toolkitsModernEscapeHtml(s.modernFolderTypeLabel || 'Folder') +
        '</span>';

    var accessTd = document.createElement('td');
    accessTd.className = 'toolkits-modern-lo-item__access';
    var roleLabel = toolkitsModernFormatShareRole(item.role || '');
    accessTd.innerHTML = roleLabel
        ? '<span class="toolkits-modern-lo-item__access-label toolkits-modern-lo-item__access-label--folder">' +
            toolkitsModernEscapeHtml(roleLabel) +
          '</span>'
        : '';

    var actionsTd = document.createElement('td');
    actionsTd.className = 'toolkits-modern-lo-item__actions';
    actionsTd.innerHTML =
        '<button type="button" class="toolkits-modern-lo-item__action toolkits-modern-lo-item__action--open" title="' +
            toolkitsModernEscapeHtml(s.modernFolderOpenBtn || 'Open folder') +
            '" aria-label="' + toolkitsModernEscapeHtml(s.modernFolderOpenBtn || 'Open folder') + '">' +
            '<i class="fa fa-folder-open" aria-hidden="true"></i>' +
        '</button>' +
        '<button type="button" class="toolkits-modern-lo-item__action toolkits-modern-lo-item__action--menu" data-lo-menu-trigger title="' +
            toolkitsModernEscapeHtml(s.modernLoMenuBtn || 'More actions') +
            '" aria-label="' + toolkitsModernEscapeHtml(s.modernLoMenuBtn || 'More actions') + '" aria-haspopup="true">' +
            '<i class="fa fa-ellipsis-v" aria-hidden="true"></i>' +
        '</button>';

    tr.appendChild(previewTd);
    tr.appendChild(nameTd);
    tr.appendChild(idTd);
    tr.appendChild(modifiedTd);
    tr.appendChild(templateTd);
    tr.appendChild(accessTd);
    tr.appendChild(actionsTd);

    var detailTr = document.createElement('tr');
    detailTr.className = 'toolkits-modern-lo-detail toolkits-modern-lo-detail--folder';
    detailTr.hidden = !expanded;
    detailTr.setAttribute('data-detail-for', item.id);
    var detailTd = document.createElement('td');
    detailTd.colSpan = 7;
    detailTd.innerHTML = '<div class="toolkits-modern-lo-detail__panel" data-folder-detail-panel></div>';
    detailTr.appendChild(detailTd);

    var openBtn = actionsTd.querySelector('.toolkits-modern-lo-item__action--open');
    if (openBtn) {
        openBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            toolkitsModernEnterFolder(item.id);
        });
    }

    chevronBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        toolkitsModernToggleFolderExpand(item, tr, detailTr, chevronBtn);
    });

    tr.addEventListener('click', function () {
        toolkitsModernSelectTreeNode(item.id);
        toolkitsModernUpdateListSelection(item.id);
    });

    tr.addEventListener('dblclick', function (e) {
        e.preventDefault();
        toolkitsModernEnterFolder(item.id);
    });

    if (expanded) {
        toolkitsModernLoadFolderDetail(item, detailTd.querySelector('[data-folder-detail-panel]'));
    }

    return { row: tr, detail: detailTr };
}

function toolkitsModernFormatShareRole(role) {
    var value = String(role || '').toLowerCase();
    if (value === 'creator') {
        return 'Creator';
    }
    if (value === 'co-author') {
        return 'Co-author';
    }
    if (value === 'editor') {
        return 'Editor';
    }
    if (value === 'read-only' || value === 'readonly') {
        return 'Read-only';
    }
    return role || '';
}

function toolkitsModernGetPublicLink(info) {
    if (!info) {
        return '';
    }
    if (info.panels && info.panels.project && info.panels.project.playUrl) {
        return info.panels.project.playUrl;
    }
    if (info.xapi_url) {
        return info.xapi_url;
    }
    if (info.lti_url) {
        return info.lti_url;
    }
    return '';
}

function toolkitsModernBuildSharedListHtml(sharing, s) {
    if (!sharing || sharing.empty) {
        return '<span class="toolkits-modern-lo-detail__muted">' +
            toolkitsModernEscapeHtml(s.modernLoDetailSharedNone || 'Not shared') +
            '</span>';
    }
    var lines = [];
    (sharing.users || []).forEach(function (user) {
        var name = ((user.firstname || '') + ' ' + (user.surname || '')).trim();
        var label = name || user.username || '';
        if (user.username) {
            label += ' (' + user.username + ')';
        }
        if (user.role) {
            label += ' - ' + toolkitsModernFormatShareRole(user.role);
        }
        lines.push('<li>' + toolkitsModernEscapeHtml(label) + '</li>');
    });
    (sharing.groups || []).forEach(function (group) {
        var label = group.name || '';
        if (group.role) {
            label += ' - ' + toolkitsModernFormatShareRole(group.role);
        }
        lines.push('<li>' + toolkitsModernEscapeHtml(label) + '</li>');
    });
    if (!lines.length) {
        return '<span class="toolkits-modern-lo-detail__muted">' +
            toolkitsModernEscapeHtml(s.modernLoDetailSharedNone || 'Not shared') +
            '</span>';
    }
    return '<ul class="toolkits-modern-lo-detail__share-list">' + lines.join('') + '</ul>';
}

function toolkitsModernRenderLoDetailContent(info, s) {
    var project = (info && info.panels && info.panels.project) ? info.panels.project : {};
    var media = (info && info.panels && info.panels.media) ? info.panels.media : {};
    var sharing = (info && info.panels && info.panels.sharing) ? info.panels.sharing : null;
    var accessKey = toolkitsModernNormalizeAccess(project.access);
    var accessLabel = toolkitsModernFormatAccess(project.access);
    var size = media.quotaMb != null && media.quotaMb !== '' ? (String(media.quotaMb) + ' MB') : '—';
    var views = typeof project.numberOfUses === 'number' ? String(project.numberOfUses) : '0';
    var publicLink = toolkitsModernGetPublicLink(info);
    var graphId = 'toolkits-modern-lo-graph-' + (info.template_id || project.templateId || '');

    var html = '<div class="toolkits-modern-lo-detail__grid">' +
        '<div class="toolkits-modern-lo-detail__meta">' +
            '<div class="toolkits-modern-lo-detail__row">' +
                '<span class="toolkits-modern-lo-detail__label">' + toolkitsModernEscapeHtml(s.modernLoDetailSize || 'Learning object size') + '</span>' +
                '<span class="toolkits-modern-lo-detail__value">' + toolkitsModernEscapeHtml(size) + '</span>' +
            '</div>' +
            '<div class="toolkits-modern-lo-detail__row">' +
                '<span class="toolkits-modern-lo-detail__label">' + toolkitsModernEscapeHtml(s.modernLoDetailAccess || 'Access') + '</span>' +
                '<span class="toolkits-modern-lo-detail__value">' +
                    '<span class="toolkits-modern-lo-item__access-label toolkits-modern-lo-item__access-label--' + accessKey + '">' +
                        toolkitsModernEscapeHtml(accessLabel) +
                    '</span>' +
                '</span>' +
            '</div>' +
            '<div class="toolkits-modern-lo-detail__row">' +
                '<span class="toolkits-modern-lo-detail__label">' + toolkitsModernEscapeHtml(s.modernLoDetailViews || 'Views') + '</span>' +
                '<span class="toolkits-modern-lo-detail__value">' + toolkitsModernEscapeHtml(views) + '</span>' +
            '</div>' +
            '<div class="toolkits-modern-lo-detail__row toolkits-modern-lo-detail__row--share">' +
                '<span class="toolkits-modern-lo-detail__label">' + toolkitsModernEscapeHtml(s.modernLoDetailShared || 'Shared') + '</span>' +
                '<span class="toolkits-modern-lo-detail__value">' + toolkitsModernBuildSharedListHtml(sharing, s) + '</span>' +
            '</div>' +
        '</div>' +
        '<div class="toolkits-modern-lo-detail__aside">' +
            '<div class="toolkits-modern-lo-detail__row">' +
                '<span class="toolkits-modern-lo-detail__label">' + toolkitsModernEscapeHtml(s.modernLoDetailPublicLink || 'Public link') + '</span>' +
                '<span class="toolkits-modern-lo-detail__value">';

    if (publicLink) {
        html += '<a class="toolkits-modern-lo-detail__link" href="' + toolkitsModernEscapeHtml(publicLink) + '" target="_blank" rel="noopener">' +
            toolkitsModernEscapeHtml(publicLink) +
            '</a>';
    } else {
        html += '<span class="toolkits-modern-lo-detail__muted">' +
            toolkitsModernEscapeHtml(s.modernLoDetailNoLink || 'No public link (private)') +
            '</span>';
    }

    html += '</span></div>';

    if (info.fetch_statistics) {
        html += '<div class="toolkits-modern-lo-detail__graph-wrap">' +
            '<span class="toolkits-modern-lo-detail__label">' + toolkitsModernEscapeHtml(s.modernLoDetailGraph || 'Number of launches') + '</span>' +
            '<div class="toolkits-modern-lo-detail__graph statistics" id="' + toolkitsModernEscapeHtml(graphId) + '">' +
                '<i class="fa fa-spinner fa-spin" aria-hidden="true"></i>' +
            '</div>' +
        '</div>';
    }

    html += '</div></div>';
    return html;
}

function toolkitsModernDrawLoLaunchChart(info, graphEl) {
    if (!info || !info.fetch_statistics || !graphEl || typeof xAPIDashboard === 'undefined') {
        if (graphEl) {
            graphEl.innerHTML = '';
        }
        return;
    }
    if (typeof site_url === 'undefined') {
        graphEl.innerHTML = '';
        return;
    }

    var url = site_url + info.template_id;
    var q = {
        activity: url,
        verb: 'http://adlnet.gov/expapi/verbs/launched',
        related_activities: false
    };
    if (info.lrs && info.lrs.site_allowed_urls) {
        q.activities = [url]
            .concat(String(info.lrs.lrsurls || '').split(','))
            .concat(String(info.lrs.site_allowed_urls || '').split(',').map(function (allowed) {
                return allowed + info.template_id;
            }))
            .filter(function (value) {
                return value !== '';
            });
    }

    var today = new Date();
    var period = (info.dashboard && info.dashboard.default_period) ? info.dashboard.default_period : 14;
    var start = new Date(today.getTime() - period * 24 * 60 * 60 * 1000);
    var startOfDay = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0);
    var endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 0);
    q.since = startOfDay.toISOString();

    var dashboard = new xAPIDashboard(info);
    dashboard.getStatements(q, false, function () {
        graphEl.innerHTML = '';
        dashboard.drawActivityChart('', $(graphEl), startOfDay, endOfDay);
    }, true);
}

function toolkitsModernLoadLoDetail(item, panelEl) {
    var cfg = window.toolkits_index_config || {};
    var s = cfg.strings || {};
    var templateId = item.xot_id;
    if (!panelEl || !templateId) {
        return;
    }

    var cached = window.toolkitsModernLoDetailCache[templateId];
    if (cached) {
        panelEl.innerHTML = toolkitsModernRenderLoDetailContent(cached, s);
        var graphEl = panelEl.querySelector('.toolkits-modern-lo-detail__graph');
        if (graphEl) {
            toolkitsModernDrawLoLaunchChart(cached, graphEl);
        }
        return;
    }

    panelEl.innerHTML = '<p class="toolkits-modern-lo-detail__loading">' +
        '<i class="fa fa-spinner fa-spin" aria-hidden="true"></i> ' +
        toolkitsModernEscapeHtml(s.modernLoDetailLoading || 'Loading details...') +
        '</p>';

    if (typeof $ === 'undefined' || typeof apiV1Url !== 'function') {
        panelEl.innerHTML = '<p class="toolkits-modern-lo-detail__error">' +
            toolkitsModernEscapeHtml(s.modernLoDetailError || 'Could not load details.') +
            '</p>';
        return;
    }

    $.ajax({
        type: 'POST',
        url: apiV1Url('templates/info'),
        dataType: 'json',
        data: {
            template_id: templateId,
            user_id: typeof workspace !== 'undefined' ? workspace.user : ''
        }
    }).done(function (response) {
        var info = typeof apiUnpack === 'function' ? apiUnpack(response) : response;
        if (!info || !info.panels) {
            panelEl.innerHTML = '<p class="toolkits-modern-lo-detail__error">' +
                toolkitsModernEscapeHtml(s.modernLoDetailError || 'Could not load details.') +
                '</p>';
            return;
        }
        window.toolkitsModernLoDetailCache[templateId] = info;
        panelEl.innerHTML = toolkitsModernRenderLoDetailContent(info, s);
        var graphEl = panelEl.querySelector('.toolkits-modern-lo-detail__graph');
        if (graphEl) {
            toolkitsModernDrawLoLaunchChart(info, graphEl);
        }
    }).fail(function () {
        panelEl.innerHTML = '<p class="toolkits-modern-lo-detail__error">' +
            toolkitsModernEscapeHtml(s.modernLoDetailError || 'Could not load details.') +
            '</p>';
    });
}

function toolkitsModernSetLoExpandState(tr, detailTr, chevronBtn, expanded, s) {
    tr.classList.toggle('toolkits-modern-lo-item--expanded', expanded);
    detailTr.hidden = !expanded;
    if (chevronBtn) {
        chevronBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        chevronBtn.setAttribute(
            'aria-label',
            expanded
                ? (s.modernLoDetailCollapse || 'Hide details')
                : (s.modernLoDetailExpand || 'Show details')
        );
        var icon = chevronBtn.querySelector('i');
        if (icon) {
            icon.className = expanded ? 'fa fa-chevron-down' : 'fa fa-chevron-right';
        }
    }
}

function toolkitsModernToggleLoExpand(item, tr, detailTr, chevronBtn) {
    var cfg = window.toolkits_index_config || {};
    var s = cfg.strings || {};
    var expanded = !window.toolkitsModernExpandedLoIds[item.id];
    window.toolkitsModernExpandedLoIds[item.id] = expanded;
    toolkitsModernSetLoExpandState(tr, detailTr, chevronBtn, expanded, s);
    if (expanded) {
        var panel = detailTr.querySelector('[data-lo-detail-panel]');
        toolkitsModernLoadLoDetail(item, panel);
    }
}

function toolkitsModernRenderLoRow(item, selectedId, s) {
    item = toolkitsModernSyncWorkspaceItemMeta(item);
    var expanded = !!window.toolkitsModernExpandedLoIds[item.id];
    var tr = document.createElement('tr');
    tr.className = 'toolkits-modern-lo-item';
    if (item.id === selectedId) {
        tr.classList.add('toolkits-modern-lo-item--selected');
    }
    if (expanded) {
        tr.classList.add('toolkits-modern-lo-item--expanded');
    }
    tr.setAttribute('data-node-id', item.id);

    var previewTd = document.createElement('td');
    previewTd.className = 'toolkits-modern-lo-item__preview';
    var chevronBtn = document.createElement('button');
    chevronBtn.type = 'button';
    chevronBtn.className = 'toolkits-modern-lo-item__chevron';
    chevronBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    chevronBtn.setAttribute(
        'aria-label',
        expanded
            ? (s.modernLoDetailCollapse || 'Hide details')
            : (s.modernLoDetailExpand || 'Show details')
    );
    chevronBtn.innerHTML = '<i class="fa ' + (expanded ? 'fa-chevron-down' : 'fa-chevron-right') + '" aria-hidden="true"></i>';
    var thumbWrap = document.createElement('button');
    thumbWrap.type = 'button';
    thumbWrap.className = 'toolkits-modern-lo-item__thumb-wrap';
    thumbWrap.setAttribute('aria-label', (s.modernLoMenuPreview || 'Preview') + ': ' + (item.text || ''));

    var thumbnailImage = document.createElement('img');

    thumbnailImage.className = 'toolkits-modern-lo-item__thumb-image';

    thumbnailImage.src = toolkitsModernGetLoThumbnailUrl(item.xot_id);

    thumbnailImage.alt = '';

    thumbnailImage.setAttribute('loading', 'lazy');


    /*
     * Old/imported LOs may not have cached thumbnails yet.
     */
    var thumbnailPlaceholder = document.createElement('span');

    thumbnailPlaceholder.className = 'toolkits-modern-lo-item__thumb-placeholder';

    thumbnailPlaceholder.hidden = true;

    thumbnailPlaceholder.innerHTML = '<i class="fa fa-image" aria-hidden="true"></i>';


    thumbnailImage.addEventListener(
        'error',
        function () {
            thumbnailImage.hidden = true;
            thumbnailPlaceholder.hidden = false;
        }
    );

    thumbnailImage.addEventListener(
        'load',
        function () {
            thumbnailImage.hidden = false;
            thumbnailPlaceholder.hidden = true;
        }
    );


    thumbWrap.appendChild(thumbnailImage);

    thumbWrap.appendChild(thumbnailPlaceholder);

    thumbWrap.addEventListener('click', function (e) {
        e.stopPropagation();
        toolkitsModernOpenLoPreviewLightbox(
            toolkitsModernGetLoPreviewUrl(item.xot_id),
            item.text || ''
        );
    });
    previewTd.appendChild(chevronBtn);
    previewTd.appendChild(thumbWrap);

    var nameTd = document.createElement('td');
    nameTd.className = 'toolkits-modern-lo-item__name';
    nameTd.innerHTML =
        '<span class="toolkits-modern-lo-item__label">' + toolkitsModernEscapeHtml(item.text) + '</span>' +
        '<span class="toolkits-modern-lo-item__date">' + toolkitsModernEscapeHtml(toolkitsModernFormatDate(item.date_created)) + '</span>';

    var idTd = document.createElement('td');
    idTd.className = 'toolkits-modern-lo-item__id';
    idTd.textContent = String(item.xot_id || '');

    var modifiedTd = document.createElement('td');
    modifiedTd.className = 'toolkits-modern-lo-item__modified';
    modifiedTd.textContent = toolkitsModernFormatDate(item.date_modified);

    var templateTd = document.createElement('td');
    templateTd.className = 'toolkits-modern-lo-item__template';
    templateTd.innerHTML =
        '<span class="toolkits-modern-lo-item__type">' + toolkitsModernEscapeHtml(toolkitsModernGetObjectTypeLabel(item.type)) + '</span>' +
        '<span class="toolkits-modern-lo-item__display-name">' + toolkitsModernEscapeHtml(item.display_name) + '</span>';

    var accessTd = document.createElement('td');
    accessTd.className = 'toolkits-modern-lo-item__access';
    var accessKey = toolkitsModernNormalizeAccess(item.access);
    var accessHtml = '<span class="toolkits-modern-lo-item__access-label toolkits-modern-lo-item__access-label--' + accessKey + '">' +
        toolkitsModernFormatAccess(item.access) +
        '</span>';
    accessHtml += '<span class="toolkits-modern-lo-item__access-icons">';
    if (toolkitsModernIsFavorite(item.favorite)) {
        accessHtml += '<i class="fa fa-heart toolkits-modern-lo-item__favorite" aria-hidden="true"></i>';
    }
    if (item.shared) {
        accessHtml += '<i class="fa fa-share-alt toolkits-modern-lo-item__shared" aria-hidden="true"></i>';
    }
    accessHtml += '</span>';
    accessTd.innerHTML = accessHtml;

    var actionsTd = document.createElement('td');
    actionsTd.className = 'toolkits-modern-lo-item__actions';
    actionsTd.innerHTML =
        '<button type="button" class="toolkits-modern-lo-item__action toolkits-modern-lo-item__action--edit" title="' + (s.modernLoEditBtn || 'Edit') + '" aria-label="' + (s.modernLoEditBtn || 'Edit') + '">' +
            '<i class="fa fa-pencil" aria-hidden="true"></i>' +
        '</button>' +
        '<button type="button" class="toolkits-modern-lo-item__action toolkits-modern-lo-item__action--menu" data-lo-menu-trigger title="' + (s.modernLoMenuBtn || 'More actions') + '" aria-label="' + (s.modernLoMenuBtn || 'More actions') + '" aria-haspopup="true">' +
            '<i class="fa fa-ellipsis-v" aria-hidden="true"></i>' +
        '</button>';

    tr.appendChild(previewTd);
    tr.appendChild(nameTd);
    tr.appendChild(idTd);
    tr.appendChild(modifiedTd);
    tr.appendChild(templateTd);
    tr.appendChild(accessTd);
    tr.appendChild(actionsTd);

    var detailTr = document.createElement('tr');
    detailTr.className = 'toolkits-modern-lo-detail';
    detailTr.hidden = !expanded;
    detailTr.setAttribute('data-detail-for', item.id);
    var detailTd = document.createElement('td');
    detailTd.colSpan = 7;
    detailTd.innerHTML = '<div class="toolkits-modern-lo-detail__panel" data-lo-detail-panel></div>';
    detailTr.appendChild(detailTd);

    var editBtn = actionsTd.querySelector('.toolkits-modern-lo-item__action--edit');
    if (editBtn) {
        editBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            toolkitsModernRunLoAction('edit', item.id, null, e);
        });
    }

    chevronBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        toolkitsModernToggleLoExpand(item, tr, detailTr, chevronBtn);
    });

    tr.addEventListener('click', function () {
        toolkitsModernRememberRecent(item.id);
        toolkitsModernSelectTreeNode(item.id);
        toolkitsModernUpdateListSelection(item.id);
    });

    if (expanded) {
        toolkitsModernLoadLoDetail(item, detailTd.querySelector('[data-lo-detail-panel]'));
    }

    return { row: tr, detail: detailTr };
}

function toolkitsModernRenderObjectList() {
    var listEl = document.getElementById('toolkits-modern-lo-list');
    var emptyEl = document.getElementById('toolkits-modern-lo-empty');
    var tableEl = document.getElementById('toolkits-modern-lo-table');
    var objectsPanel = document.getElementById('toolkits-modern-objects');
    if (!listEl || !emptyEl || !objectsPanel || objectsPanel.hidden) {
        return;
    }

    toolkitsModernUpdateBrowseChrome();
    toolkitsModernBindLoToolbar();
    toolkitsModernBindLoMenu();
    toolkitsModernBindLoPreviewLightbox();

    var objects = toolkitsModernCollectLearningObjects();
    listEl.innerHTML = '';
    toolkitsModernUpdateObjectsCount(objects);

    if (!objects.length) {
        emptyEl.hidden = false;
        if (tableEl) {
            tableEl.hidden = true;
        }
        return;
    }

    emptyEl.hidden = true;
    if (tableEl) {
        tableEl.hidden = false;
    }

    var cfg = window.toolkits_index_config || {};
    var s = cfg.strings || {};
    var selectedId = '';
    if (typeof $ !== 'undefined') {
        var tree = $.jstree.reference('#workspace');
        if (tree) {
            var selected = tree.get_selected();
            if (selected && selected.length) {
                selectedId = selected[0];
            }
        }
    }
    if (!selectedId && typeof workspace !== 'undefined' && workspace.current_node && workspace.current_node.id) {
        selectedId = workspace.current_node.id;
    }

    objects.forEach(function (item) {
        if (toolkitsModernIsFolderNode(item)) {
            var folderRendered = toolkitsModernRenderFolderRow(item, selectedId, s);
            listEl.appendChild(folderRendered.row);
            listEl.appendChild(folderRendered.detail);
            return;
        }

        var rendered = toolkitsModernRenderLoRow(item, selectedId, s);
        listEl.appendChild(rendered.row);
        listEl.appendChild(rendered.detail);
    });

    toolkitsModernBindListTreeSelection();
}

function toolkitsModernSelectTreeNode(nodeId) {
    if (typeof $ === 'undefined' || !nodeId) {
        return;
    }
    var tree = $.jstree.reference('#workspace');
    if (tree) {
        tree.deselect_all();
        tree.select_node(nodeId);
    }
}

function toolkitsModernOnWorkspaceRefreshed() {
    var loSort = document.getElementById('toolkits-modern-lo-sort');
    var sortSelector = document.getElementById('sort-selector');
    if (loSort && sortSelector) {
        loSort.value = sortSelector.value || 'date_down';
    }
    window.toolkitsModernLoDetailCache = {};
    window.toolkitsModernFolderDetailCache = {};
    toolkitsModernUpdateNavCounts();
    toolkitsModernRenderObjectList();
}

function toolkitsModernEnsureWorkspaceData() {
    if (typeof refresh_workspace === 'function') {
        refresh_workspace();
    }
}

function toolkitsModernSetMainView(view) {
    var home = document.getElementById('toolkits-modern-home');
    var guides = document.getElementById('toolkits-modern-guides');
    var objects = document.getElementById('toolkits-modern-objects');
    var workspacePanel = document.getElementById('toolkits-modern-workspace');

    if (home) {
        home.hidden = view !== 'home';
    }
    if (guides) {
        guides.hidden = view !== 'guides';
    }
    if (objects) {
        objects.hidden = view !== 'all' && view !== 'recent' && view !== 'favourites' && view !== 'published' && view !== 'trash';
    }
    if (workspacePanel) {
        if (view === 'workspace') {
            workspacePanel.hidden = false;
            workspacePanel.classList.remove('toolkits-modern-workspace--tree-host');
        } else if (view === 'all' || view === 'recent' || view === 'favourites' || view === 'published' || view === 'trash') {
            workspacePanel.hidden = false;
            workspacePanel.classList.add('toolkits-modern-workspace--tree-host');
        } else {
            workspacePanel.hidden = true;
            workspacePanel.classList.remove('toolkits-modern-workspace--tree-host');
        }
    }

    document.body.classList.remove('toolkits-modern-workspace-active', 'toolkits-modern-browse-active');
    if (view === 'workspace') {
        document.body.classList.add('toolkits-modern-workspace-active');
    } else if (view === 'all' || view === 'recent' || view === 'favourites' || view === 'published' || view === 'trash') {
        document.body.classList.add('toolkits-modern-browse-active');
    }
}

function toolkitsModernShowBrowseView(mode) {
    if (mode === 'recent') {
        toolkitsModernResetFolder();
        window.toolkitsModernBrowseMode = 'recent';
        toolkitsModernSetMainView('recent');
    } else if (mode === 'favourites') {
        toolkitsModernResetFolder();
        window.toolkitsModernBrowseMode = 'favourites';
        toolkitsModernSetMainView('favourites');
    } else if (mode === 'published') {
        toolkitsModernResetFolder();
        window.toolkitsModernBrowseMode = 'published';
        toolkitsModernSetMainView('published');
    } else if (mode === 'trash') {
        toolkitsModernResetFolder();
        window.toolkitsModernBrowseMode = 'trash';
        toolkitsModernSetMainView('trash');
    } else {
        toolkitsModernResetFolder();
        window.toolkitsModernBrowseMode = 'all';
        toolkitsModernSetMainView('all');
    }
    toolkitsModernUpdateBrowseChrome();
    toolkitsModernEnsureWorkspaceData();
}

function toolkitsModernShowAllView() {
    toolkitsModernShowBrowseView('all');
}

function toolkitsModernShowRecentView() {
    toolkitsModernShowBrowseView('recent');
}

function toolkitsModernShowFavouritesView() {
    toolkitsModernShowBrowseView('favourites');
}

function toolkitsModernShowPublishedView() {
    toolkitsModernShowBrowseView('published');
}

function toolkitsModernShowTrashView() {
    toolkitsModernShowBrowseView('trash');
}

function toolkitsModernCloseUserMenu() {
    var toggle = document.getElementById('toolkits-modern-user-toggle');
    var menu = document.getElementById('toolkits-modern-user-menu');
    if (menu) {
        menu.hidden = true;
    }
    if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
    }
}

function toolkitsModernShowWorkspace(openTemplates) {
    // Never switch to the classic workspace UI while the guided tour is active.
    if (window.toolkitsModernTourActive) {
        return;
    }
    toolkitsModernSetMainView('workspace');

    if (!window.toolkitsModernLayoutReady && typeof setupMainLayout === 'function') {
        setupMainLayout();
        window.toolkitsModernLayoutReady = true;
        if (typeof load_user_preferences === 'function') {
            load_user_preferences();
        }
    }
    if (typeof refresh_workspace === 'function') {
        refresh_workspace();
    }
    if (openTemplates && typeof xerteinner_layout !== 'undefined' && xerteinner_layout) {
        try {
            xerteinner_layout.open('east');
        } catch (e) { /* layout may still be initialising */ }
    }
}

function toolkitsModernShowHome() {
    toolkitsModernSetMainView('home');
}

function toolkitsModernShowGuidesView() {
    toolkitsModernSetMainView('guides');
}

function toolkitsModernResetCreateMenuPanels() {
    var flyout = document.getElementById('toolkits-modern-create-menu');
    var subPanel = document.getElementById('toolkits-modern-create-menu-sub');
    var templateSelect = document.getElementById('toolkits-modern-create-template-select');
    if (flyout) {
        flyout.classList.remove('toolkits-modern-create-flyout--sub');
    }
    if (subPanel) {
        subPanel.hidden = true;
    }
    document.querySelectorAll('[data-create-parent]').forEach(function (el) {
        el.classList.remove('toolkits-modern-create-menu__item--active');
    });
    if (templateSelect) {
        templateSelect.innerHTML = '';
        var s = (window.toolkits_index_config && window.toolkits_index_config.strings) || {};
        var placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = s.modernCreateTemplatePlaceholder || 'Choose a template';
        templateSelect.appendChild(placeholder);
    }
    window.toolkitsModernCreateParentKey = '';
}

function toolkitsModernCloseCreateMenu() {
    toolkitsModernCloseSidebarCreateMenu();
    toolkitsModernCloseCardCreateMenu();
}

function toolkitsModernCloseSidebarCreateMenu() {
    var menu = document.getElementById('toolkits-modern-create-menu');
    var toggle = document.getElementById('toolkits-modern-create-toggle');
    toolkitsModernResetCreateMenuPanels();
    if (menu) {
        menu.hidden = true;
    }
    if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
    }
}

function toolkitsModernCloseCardCreateMenu() {
    var menu = document.getElementById('toolkits-modern-card-create-menu');
    if (menu) {
        menu.hidden = true;
        menu.style.top = '';
        menu.style.left = '';
    }
    window.toolkitsModernCardCreateParentKey = '';
    document.querySelectorAll('[data-modern-card-create]').forEach(function (btn) {
        btn.setAttribute('aria-expanded', 'false');
    });
}

function toolkitsModernPopulateCardCreateTemplates(parentKey) {
    var templateSelect = document.getElementById('toolkits-modern-card-create-template-select');
    if (!templateSelect) {
        return;
    }
    var s = (window.toolkits_index_config && window.toolkits_index_config.strings) || {};
    templateSelect.innerHTML = '';
    var placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = s.modernCreateTemplatePlaceholder || 'Choose a template';
    templateSelect.appendChild(placeholder);

    if (!document.getElementById(parentKey + '_templatename')) {
        if (window.toolkitsModernTourActive) {
            return;
        }
        toolkitsModernShowWorkspace(true);
        window.setTimeout(function () {
            if (window.toolkitsModernCardCreateParentKey === parentKey) {
                toolkitsModernPopulateCardCreateTemplates(parentKey);
            }
        }, 450);
        return;
    }

    toolkitsModernGetDerivedTemplateOptions(parentKey).forEach(function (opt) {
        var option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        templateSelect.appendChild(option);
    });
}

function toolkitsModernOpenCardCreateMenu(parentKey, anchorBtn) {
    var menu = document.getElementById('toolkits-modern-card-create-menu');
    if (!menu || !anchorBtn) {
        return;
    }
    toolkitsModernCloseSidebarCreateMenu();
    toolkitsModernCloseUserMenu();
    window.toolkitsModernCardCreateParentKey = parentKey;
    toolkitsModernPopulateCardCreateTemplates(parentKey);

    menu.hidden = false;
    anchorBtn.setAttribute('aria-expanded', 'true');

    function placeMenu() {
        var rect = anchorBtn.getBoundingClientRect();
        if (!rect.width && !rect.height) {
            return;
        }
        var menuWidth = menu.offsetWidth || 280;
        var menuHeight = menu.offsetHeight || 160;
        var left = rect.right + 12;
        if (left + menuWidth > window.innerWidth - 16) {
            left = Math.max(16, rect.left - menuWidth - 12);
        }
        var top = rect.top;
        if (top + menuHeight > window.innerHeight - 16) {
            top = Math.max(16, window.innerHeight - menuHeight - 16);
        }
        menu.style.top = Math.round(top) + 'px';
        menu.style.left = Math.round(left) + 'px';
    }

    placeMenu();
    window.requestAnimationFrame(placeMenu);
}

function toolkitsModernGetDerivedTemplateOptions(parentKey) {
    var options = [];
    var select = document.getElementById(parentKey + '_templatename');
    if (select && select.options && select.options.length) {
        Array.prototype.forEach.call(select.options, function (opt) {
            if (opt.value && opt.value !== parentKey) {
                options.push({
                    value: opt.value,
                    label: opt.textContent.trim()
                });
            }
        });
    }
    return options;
}

function toolkitsModernShowCreateSubmenu(parentKey) {
    var menu = document.getElementById('toolkits-modern-create-menu');
    var mainPanel = document.getElementById('toolkits-modern-create-menu-main');
    var subPanel = document.getElementById('toolkits-modern-create-menu-sub');
    var templateSelect = document.getElementById('toolkits-modern-create-template-select');
    if (!menu || !mainPanel || !subPanel || !templateSelect) {
        return;
    }

    if (!document.getElementById(parentKey + '_templatename')) {
        toolkitsModernShowWorkspace(true);
        window.setTimeout(function () {
            toolkitsModernShowCreateSubmenu(parentKey);
        }, 450);
        return;
    }

    window.toolkitsModernCreateParentKey = parentKey;
    var s = (window.toolkits_index_config && window.toolkits_index_config.strings) || {};
    templateSelect.innerHTML = '';
    var placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = s.modernCreateTemplatePlaceholder || 'Choose a template';
    templateSelect.appendChild(placeholder);

    toolkitsModernGetDerivedTemplateOptions(parentKey).forEach(function (opt) {
        var option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        templateSelect.appendChild(option);
    });

    document.querySelectorAll('[data-create-parent]').forEach(function (el) {
        el.classList.toggle(
            'toolkits-modern-create-menu__item--active',
            el.getAttribute('data-create-parent') === parentKey
        );
    });

    subPanel.hidden = false;
    menu.classList.add('toolkits-modern-create-flyout--sub');
}

function toolkitsModernPromptProjectName() {
    var s = (window.toolkits_index_config && window.toolkits_index_config.strings) || {};
    var label = s.modernCreateProjectName || 'Project name';
    return window.prompt(label);
}

function toolkitsModernGetCreateFolderId() {
    if (typeof workspace === 'undefined') {
        return '';
    }

    if (window.toolkitsModernBrowseMode === 'all') {
        var currentFolderId = toolkitsModernGetCurrentFolderId();
        var rootId = toolkitsModernGetWorkspaceRootId();
        if (currentFolderId && currentFolderId !== rootId && workspace.nodes && workspace.nodes[currentFolderId]) {
            return workspace.nodes[currentFolderId].xot_id || '';
        }
    }

    if (typeof $ === 'undefined') {
        return '';
    }
    var tree = $.jstree.reference('#workspace');
    if (!tree) {
        return '';
    }
    var ids = tree.get_selected();
    if (!ids || ids.length !== 1) {
        return '';
    }
    var node = workspace.nodes[ids[0]];
    if (node && node.xot_type === 'folder') {
        return node.xot_id;
    }
    return '';
}

function toolkitsModernCreateLearningObject(parentKey, templateName, projectName, options) {
    if (typeof is_ok_name === 'function' && !is_ok_name(projectName)) {
        if (typeof NAME_FAIL !== 'undefined') {
            window.alert(NAME_FAIL);
        }
        return;
    }
    if (typeof $ === 'undefined' || typeof site_url === 'undefined') {
        return;
    }

    options = options || {};
    var showWorkspace = options.showWorkspace !== false;

    toolkitsModernCloseCreateMenu();
    // if (showWorkspace) {
    //     toolkitsModernShowWorkspace(true);
    // }

    var folderId = toolkitsModernGetCreateFolderId();
    if (typeof new_template_folder !== 'undefined') {
        new_template_folder = folderId;
    }

    $.ajax({
        type: 'POST',
        url: site_url + 'website_code/php/templates/new_template.php',
        data: {
            tutorialid: parentKey,
            templatename: templateName,
            tutorialname: projectName,
            folder_id: folderId
        }
    }).done(function (response) {
        if (showWorkspace && typeof refresh_workspace === 'function') {
            refresh_workspace();
        }
        if (typeof tutorial_created === 'function') {
            tutorial_created(response);
        }
        if (!showWorkspace && typeof toolkitsModernShowHome === 'function') {
            toolkitsModernShowHome();
        }
    });
}

function toolkitsModernToggleCreateMenu() {
    var menu = document.getElementById('toolkits-modern-create-menu');
    var toggle = document.getElementById('toolkits-modern-create-toggle');
    if (!menu || !toggle) {
        return;
    }
    if (!menu.hidden) {
        toolkitsModernCloseCreateMenu();
        return;
    }
    toolkitsModernCloseCardCreateMenu();
    toolkitsModernResetCreateMenuPanels();
    toolkitsModernCloseUserMenu();
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
}

function toolkitsModernBindCreateMenu() {
    if (window.toolkitsModernCreateMenuBound) {
        return;
    }
    window.toolkitsModernCreateMenuBound = true;

    document.addEventListener('click', function (e) {
        if (window.toolkitsModernTourActive) {
            return;
        }
        var toggle = document.getElementById('toolkits-modern-create-toggle');
        var menu = document.getElementById('toolkits-modern-create-menu');
        var cardMenu = document.getElementById('toolkits-modern-card-create-menu');

        var cardCreateBtn = e.target.closest('[data-modern-card-create]');
        if (cardCreateBtn) {
            e.preventDefault();
            e.stopPropagation();
            var parentKey = cardCreateBtn.getAttribute('data-modern-card-create');
            if (cardMenu && !cardMenu.hidden && window.toolkitsModernCardCreateParentKey === parentKey) {
                toolkitsModernCloseCardCreateMenu();
            } else {
                toolkitsModernOpenCardCreateMenu(parentKey, cardCreateBtn);
            }
            return;
        }

        var cardEmptyBtn = e.target.closest('[data-card-create-empty]');
        if (cardEmptyBtn && window.toolkitsModernCardCreateParentKey) {
            e.preventDefault();
            e.stopPropagation();
            var emptyParent = window.toolkitsModernCardCreateParentKey;
            var projectName = toolkitsModernPromptProjectName();
            if (projectName) {
                toolkitsModernCreateLearningObject(emptyParent, emptyParent, projectName);
            }
            return;
        }

        if (!toggle || !menu) {
            return;
        }

        var parentItem = e.target.closest('[data-create-parent]');
        if (parentItem) {
            e.preventDefault();
            e.stopPropagation();
            toolkitsModernShowCreateSubmenu(parentItem.getAttribute('data-create-parent'));
            return;
        }

        var emptyBtn = e.target.closest('[data-create-empty]');
        if (emptyBtn && window.toolkitsModernCreateParentKey) {
            e.preventDefault();
            e.stopPropagation();
            var projectNameSidebar = toolkitsModernPromptProjectName();
            if (projectNameSidebar) {
                toolkitsModernCreateLearningObject(
                    window.toolkitsModernCreateParentKey,
                    window.toolkitsModernCreateParentKey,
                    projectNameSidebar
                );
            }
            return;
        }

        if (e.target.closest('#toolkits-modern-create-toggle')) {
            e.preventDefault();
            e.stopPropagation();
            toolkitsModernToggleCreateMenu();
            return;
        }

        if (!menu.hidden && !e.target.closest('.toolkits-modern-sidebar__create-wrap')) {
            toolkitsModernCloseCreateMenu();
        } else if (cardMenu && !cardMenu.hidden && !e.target.closest('#toolkits-modern-card-create-menu') && !e.target.closest('[data-modern-card-create]')) {
            toolkitsModernCloseCardCreateMenu();
        }
    });

    document.addEventListener('change', function (e) {
        if (e.target.id === 'toolkits-modern-card-create-template-select') {
            var cardTemplateName = e.target.value;
            var cardParentKey = window.toolkitsModernCardCreateParentKey;
            if (!cardTemplateName || !cardParentKey) {
                return;
            }
            var cardProjectName = toolkitsModernPromptProjectName();
            e.target.value = '';
            if (cardProjectName) {
                toolkitsModernCreateLearningObject(cardParentKey, cardTemplateName, cardProjectName);
            }
            return;
        }
        if (e.target.id !== 'toolkits-modern-create-template-select') {
            return;
        }
        var templateName = e.target.value;
        var parentKey = window.toolkitsModernCreateParentKey;
        if (!templateName || !parentKey) {
            return;
        }
        var projectName = toolkitsModernPromptProjectName();
        e.target.value = '';
        if (projectName) {
            toolkitsModernCreateLearningObject(parentKey, templateName, projectName);
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            toolkitsModernCloseCreateMenu();
        }
    });
}

function toolkitsModernCreateTemplate(templateName) {
    toolkitsModernCloseCreateMenu();
    toolkitsModernShowWorkspace(true);
    window.setTimeout(function () {
        if (typeof template_toggle === 'function') {
            template_toggle(templateName);
        }
    }, 400);
}

function toolkitsModernBindTopbar() {
    var langSelect = document.getElementById('language-selector');
    var langCodeEl = document.getElementById('toolkits-modern-lang-code');

    function updateLangCode() {
        if (!langSelect || !langCodeEl) {
            return;
        }
        var val = langSelect.value || '';
        var code = val.split('-')[0].toUpperCase();
        if (code.length > 2) {
            code = code.slice(0, 2);
        }
        langCodeEl.textContent = code || '--';
    }

    if (langSelect) {
        updateLangCode();
        langSelect.addEventListener('change', updateLangCode);
    }

    var userToggle = document.getElementById('toolkits-modern-user-toggle');
    var userMenu = document.getElementById('toolkits-modern-user-menu');
    if (userToggle && userMenu) {
        userToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            var open = userMenu.hidden;
            toolkitsModernCloseUserMenu();
            if (open) {
                userMenu.hidden = false;
                userToggle.setAttribute('aria-expanded', 'true');
            }
        });
        userMenu.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    }

    if (!window.toolkitsModernTopbarClickBound) {
        window.toolkitsModernTopbarClickBound = true;
        document.addEventListener('click', function () {
            toolkitsModernCloseUserMenu();
        });
    }
}

function toolkitsModernBindNav() {
    var mount = document.getElementById('toolkits-index-mount');
    if (!mount) {
        return;
    }
    mount.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-modern-view]');
        if (!btn) {
            return;
        }
        var view = btn.getAttribute('data-modern-view');
        if (view === 'all') {
            toolkitsModernShowAllView();
        } else if (view === 'recent') {
            toolkitsModernShowRecentView();
        } else if (view === 'favourites') {
            toolkitsModernShowFavouritesView();
        } else if (view === 'published') {
            toolkitsModernShowPublishedView();
        } else if (view === 'trash') {
            toolkitsModernShowTrashView();
        } else if (view === 'guides') {
            toolkitsModernShowGuidesView();
        } else if (view === 'workspace') {
            toolkitsModernShowWorkspace(false);
        }
        if (view === 'all' || view === 'recent' || view === 'favourites' || view === 'published' || view === 'trash' || view === 'guides' || view === 'workspace') {
            mount.querySelectorAll('.toolkits-modern-nav__item[data-modern-nav]').forEach(function (el) {
                el.classList.remove('toolkits-modern-nav__item--active');
            });
            if (btn.hasAttribute('data-modern-nav')) {
                btn.classList.add('toolkits-modern-nav__item--active');
            } else if (view === 'guides') {
                var guidesNav = mount.querySelector('.toolkits-modern-nav__item[data-modern-nav="guides"]');
                if (guidesNav) {
                    guidesNav.classList.add('toolkits-modern-nav__item--active');
                }
            }
        }
    });

    toolkitsModernBindTopbar();

    var sidebarSearch = document.getElementById('toolkits-modern-sidebar-search');
    var workspaceSearch = document.getElementById('workspace_search');
    if (sidebarSearch && workspaceSearch) {
        sidebarSearch.addEventListener('input', function () {
            workspaceSearch.value = sidebarSearch.value;
            var loSearch = document.getElementById('toolkits-modern-lo-search');
            if (loSearch) {
                loSearch.value = sidebarSearch.value;
            }
            if (typeof refresh_workspace === 'function') {
                refresh_workspace();
            } else {
                toolkitsModernRenderObjectList();
            }
        });
    }
}

function toolkitsModernCloseUserModal() {
    var modal = document.getElementById('toolkits-modern-user-modal');
    var body = document.getElementById('toolkits-modern-user-modal-body');
    if (!modal) {
        return;
    }
    modal.hidden = true;
    document.body.classList.remove('toolkits-modern-user-modal-open');
    if (body) {
        body.innerHTML = '';
    }
    modal.classList.remove(
        'toolkits-modern-user-modal--password',
        'toolkits-modern-user-modal--settings',
        'toolkits-modern-user-modal--preferences',
        'toolkits-modern-user-modal--details',
        'toolkits-modern-user-modal--feedback'
    );
}

function toolkitsModernOpenUserModal(title, section) {
    var modal = document.getElementById('toolkits-modern-user-modal');
    var body = document.getElementById('toolkits-modern-user-modal-body');
    var titleEl = document.getElementById('toolkits-modern-user-modal-title');
    if (!modal || !body || typeof loadUserSettingsFormHtml !== 'function') {
        return;
    }

    toolkitsModernCloseUserModal();
    if (titleEl) {
        titleEl.textContent = title;
    }
    if (section === 'settings') {
        modal.classList.add('toolkits-modern-user-modal--settings');
    } else if (section === 'preferences') {
        modal.classList.add('toolkits-modern-user-modal--preferences');
    } else {
        modal.classList.add('toolkits-modern-user-modal--password');
    }

    loadUserSettingsFormHtml(section, function (html) {
        body.innerHTML = html;
        if (typeof initUserSettingsHandlers === 'function') {
            initUserSettingsHandlers($(body));
        }
        modal.hidden = false;
        document.body.classList.add('toolkits-modern-user-modal-open');
        if (section === 'password') {
            var oldpass = body.querySelector('#oldpass');
            if (oldpass) {
                oldpass.focus();
            }
        }
    }, function () {
        body.innerHTML = '<p class="toolkits-modern-user-modal__error">Error loading form. Please try again.</p>';
        modal.hidden = false;
        document.body.classList.add('toolkits-modern-user-modal-open');
    });
}

function toolkitsModernOpenPasswordModal() {
    var s = (window.toolkits_index_config && window.toolkits_index_config.strings) || {};
    toolkitsModernOpenUserModal(s.changePassword || 'Change password', 'password');
}

function toolkitsModernOpenPreferencesModal() {
    var s = (window.toolkits_index_config && window.toolkits_index_config.strings) || {};
    toolkitsModernOpenUserModal(s.modernPreferences || 'Preferences', 'preferences');
}

function toolkitsModernOpenSettingsModal() {
    var s = (window.toolkits_index_config && window.toolkits_index_config.strings) || {};
    toolkitsModernOpenUserModal(s.modernSettings || 'Settings', 'settings');
}

function toolkitsModernBindUserModal() {
    if (window.toolkitsModernUserModalBound) {
        return;
    }
    window.toolkitsModernUserModalBound = true;

    document.addEventListener('click', function (e) {
        if (e.target.closest('[data-user-modal-close]')) {
            toolkitsModernCloseUserModal();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            var modal = document.getElementById('toolkits-modern-user-modal');
            if (modal && !modal.hidden) {
                toolkitsModernCloseUserModal();
            }
        }
    });
}

function toolkitsModernBindFaq() {
    var faq = document.getElementById('toolkits-modern-guides');
    if (!faq || faq.dataset.faqBound === '1') {
        return;
    }
    faq.dataset.faqBound = '1';
    faq.addEventListener('click', function (e) {
        var toggle = e.target.closest('.toolkits-modern-faq__toggle');
        if (!toggle) {
            return;
        }
        var item = toggle.closest('.toolkits-modern-faq__item');
        var panel = item ? item.querySelector('.toolkits-modern-faq__panel') : null;
        if (!item || !panel) {
            return;
        }
        var open = item.classList.contains('toolkits-modern-faq__item--open');
        if (open) {
            item.classList.remove('toolkits-modern-faq__item--open');
            panel.hidden = true;
            toggle.setAttribute('aria-expanded', 'false');
        } else {
            item.classList.add('toolkits-modern-faq__item--open');
            panel.hidden = false;
            toggle.setAttribute('aria-expanded', 'true');
        }
    });
}

function toolkitsIndexAfterShell() {
    toolkitsModernBindNav();
    toolkitsModernBindFaq();
    toolkitsModernBindUserModal();
    toolkitsModernBindFolderModal();
    toolkitsModernBindImportModal();
    toolkitsModernBindPropertiesModal();
    toolkitsModernBindCreateMenu();
    toolkitsModernUpdateNavCounts();
    toolkitsModernInitTour();
}

function toolkitsModernSetupInnerLayout() {
    if (typeof $ === 'undefined' || !$('#pagecontainer').length) {
        return;
    }
    if (window.toolkitsModernLayoutReady && window.xerteinner_layout) {
        return;
    }

    var opentooltip = typeof LAYOUT_OPENTOOLTIP !== 'undefined' ? LAYOUT_OPENTOOLTIP : 'Open';
    var closetooltip = typeof LAYOUT_CLOSETOOLTIP !== 'undefined' ? LAYOUT_CLOSETOOLTIP : 'Close';
    var resizetooltip = typeof LAYOUT_RESIZETOOLTIP !== 'undefined' ? LAYOUT_RESIZETOOLTIP : 'Resize';
    var unpin = typeof LAYOUT_UNPIN !== 'undefined' ? LAYOUT_UNPIN : 'Un-Pin';
    var pin = typeof LAYOUT_PIN !== 'undefined' ? LAYOUT_PIN : 'Pin';

    var xerteinner_layout_settings = {
        name: 'xerteinner_layout_modern',
        panes: {
            size: 'auto',
            minSize: 50,
            paneClass: 'pane',
            resizerClass: 'resizer',
            togglerClass: 'toggler',
            buttonClass: 'button',
            contentSelector: '.content',
            contentIgnoreSelector: 'span',
            togglerLength_open: 35,
            togglerLength_closed: 35,
            hideTogglerOnSlide: true,
            fxName: 'none',
            tips: { Open: opentooltip, Close: closetooltip, Resize: resizetooltip, Pin: pin, Unpin: unpin },
            closable: false
        },
        west: {
            size: 400,
            minSize: 200,
            spacing_open: 6,
            spacing_closed: 21,
            togglerLength_closed: 21,
            togglerAlign_closed: 'top',
            togglerLength_open: 0,
            slideTrigger_open: 'click',
            initClosed: false
        },
        east: {
            size: 300,
            minSize: 150,
            maxSize: 450,
            spacing_open: 6,
            spacing_closed: 21,
            togglerLength_closed: 21,
            togglerAlign_closed: 'top',
            togglerLength_open: 0,
            slideTrigger_open: 'click',
            initClosed: false,
            closable: true,
            resizable: true,
            onclose_end: function () {
                if (typeof save_user_preference === 'function') {
                    save_user_preference('panel_east_open', false);
                }
            },
            onopen_end: function () {
                if (typeof save_user_preference === 'function') {
                    save_user_preference('panel_east_open', true);
                }
            }
        },
        center: {
            minWidth: 200,
            minHeight: 200,
            onresize: function () {
                if (typeof showInformationAndSetStatus === 'function' && typeof workspace !== 'undefined') {
                    showInformationAndSetStatus(workspace.current_node);
                }
            }
        }
    };

    window.xerteinner_layout = $('#pagecontainer').layout(xerteinner_layout_settings);
    window.toolkitsModernLayoutReady = true;

    var right_column = '#pagecontainer > .ui-layout-east';
    $("<span></span>").attr('id', 'east-closer').prependTo(right_column);
    window.xerteinner_layout.addCloseBtn('#east-closer', 'east');

    if (typeof dynamicResize === 'function') {
        dynamicResize();
    }
    $(window).off('resize.toolkitsModern').on('resize.toolkitsModern', function () {
        if (typeof dynamicResize === 'function') {
            dynamicResize();
        }
    });
}

(function wrapSetupMainLayoutForModern() {
    if (typeof setupMainLayout !== 'function') {
        return;
    }
    var classicSetupMainLayout = setupMainLayout;
    setupMainLayout = function () {
        if (document.body.classList.contains('toolkits-ui-theme-modern')) {
            toolkitsModernSetupInnerLayout();
            return;
        }
        classicSetupMainLayout();
    };
})();

/* ---- Guided tour (home) ---- */

var TOOLKITS_MODERN_TOUR_KEY = 'toolkits_modern_tour_done';
var TOOLKITS_MODERN_TOUR_CONTINUE_KEY = 'toolkits_modern_tour_continue';
var TOOLKITS_MODERN_TOUR_PREF = 'modern_tour_done';
var TOOLKITS_MODERN_TOUR_TOTAL = 6;

function toolkitsModernTourStrings() {
    return (window.toolkits_index_config && window.toolkits_index_config.strings) || {};
}

function toolkitsModernTourPrefs() {
    if (typeof window.user_preferences !== 'undefined' && window.user_preferences) {
        return window.user_preferences;
    }
    if (typeof user_preferences !== 'undefined' && user_preferences) {
        return user_preferences;
    }
    return {};
}

function toolkitsModernTourIsDonePref(value) {
    return value === true || value === 'true' || value === 1 || value === '1';
}

function toolkitsModernTourShouldShow() {
    try {
        var params = new URLSearchParams(window.location.search || '');
        if (params.get('tour') === '1') {
            return true;
        }
        if (params.get('tour') === '0') {
            return false;
        }
    } catch (e) { /* ignore */ }

    var prefs = toolkitsModernTourPrefs();
    if (Object.prototype.hasOwnProperty.call(prefs, TOOLKITS_MODERN_TOUR_PREF)) {
        return !toolkitsModernTourIsDonePref(prefs[TOOLKITS_MODERN_TOUR_PREF]);
    }

    // Migrate older localStorage flag into the database preference once.
    try {
        if (window.localStorage.getItem(TOOLKITS_MODERN_TOUR_KEY) === '1') {
            toolkitsModernTourMarkDone();
            return false;
        }
    } catch (e2) { /* ignore */ }

    return true;
}

function toolkitsModernTourMarkDone() {
    try {
        window.localStorage.setItem(TOOLKITS_MODERN_TOUR_KEY, '1');
    } catch (e) { /* ignore */ }

    if (typeof window.user_preferences === 'undefined' || !window.user_preferences) {
        window.user_preferences = (typeof user_preferences !== 'undefined' && user_preferences) ? user_preferences : {};
    }
    window.user_preferences[TOOLKITS_MODERN_TOUR_PREF] = true;
    if (typeof user_preferences !== 'undefined') {
        user_preferences[TOOLKITS_MODERN_TOUR_PREF] = true;
    }

    if (typeof save_user_preference === 'function') {
        save_user_preference(TOOLKITS_MODERN_TOUR_PREF, true);
    }
}

function toolkitsModernTourClearDone() {
    try {
        window.localStorage.removeItem(TOOLKITS_MODERN_TOUR_KEY);
        window.localStorage.removeItem(TOOLKITS_MODERN_TOUR_CONTINUE_KEY);
    } catch (e) { /* ignore */ }

    if (typeof window.user_preferences === 'undefined' || !window.user_preferences) {
        window.user_preferences = (typeof user_preferences !== 'undefined' && user_preferences) ? user_preferences : {};
    }
    window.user_preferences[TOOLKITS_MODERN_TOUR_PREF] = false;
    if (typeof user_preferences !== 'undefined') {
        user_preferences[TOOLKITS_MODERN_TOUR_PREF] = false;
    }

    if (typeof save_user_preference === 'function') {
        save_user_preference(TOOLKITS_MODERN_TOUR_PREF, false);
    }
}

function toolkitsModernTourMarkContinue() {
    try {
        window.localStorage.setItem(TOOLKITS_MODERN_TOUR_CONTINUE_KEY, '1');
    } catch (e) { /* ignore */ }
}

function toolkitsModernTourClearHighlights() {
    document.querySelectorAll('.toolkits-modern-tour-highlight').forEach(function (el) {
        el.classList.remove('toolkits-modern-tour-highlight');
    });
    document.body.classList.remove(
        'toolkits-modern-tour-mode-welcome',
        'toolkits-modern-tour-mode-sidebar',
        'toolkits-modern-tour-mode-card'
    );
}

function toolkitsModernTourGetSteps() {
    var s = toolkitsModernTourStrings();
    return [
        {
            id: 'create',
            title: s.modernTourStepCreateTitle || 'Create a new learning object',
            body: s.modernTourStepCreateBody || '',
            mode: 'sidebar',
            highlight: ['#toolkits-modern-create-toggle'],
            sidebar: true,
            tipAnchor: '#toolkits-modern-create-toggle'
        },
        {
            id: 'filter',
            title: s.modernTourStepFilterTitle || 'Filtering',
            body: s.modernTourStepFilterBody || '',
            mode: 'sidebar',
            highlight: [
                '.toolkits-modern-nav__item[data-modern-nav="recent"]',
                '.toolkits-modern-nav__item[data-modern-nav="published"]',
                '.toolkits-modern-nav__item[data-modern-nav="favourites"]',
                '.toolkits-modern-nav__item[data-modern-nav="trash"]'
            ],
            sidebar: true,
            tipAnchorGroup: [
                '.toolkits-modern-nav__item[data-modern-nav="recent"]',
                '.toolkits-modern-nav__item[data-modern-nav="published"]',
                '.toolkits-modern-nav__item[data-modern-nav="favourites"]',
                '.toolkits-modern-nav__item[data-modern-nav="trash"]'
            ]
        },
        {
            id: 'interactive',
            title: s.modernTourStepInteractiveTitle || 'Create an interactive learning object',
            body: s.modernTourStepInteractiveBody || '',
            mode: 'card',
            highlight: ['#toolkits-modern-card-interactive', '#toolkits-modern-card-create-menu'],
            openCardCreate: true,
            tipAnchor: '#toolkits-modern-card-interactive',
            tipAnchorFallback: '#toolkits-modern-card-interactive-btn',
            scrollTo: '#toolkits-modern-card-interactive'
        }
    ];
}

function toolkitsModernTourShowRoot(show) {
    var root = document.getElementById('toolkits-modern-tour');
    if (!root) {
        return;
    }
    root.hidden = !show;
    window.toolkitsModernTourActive = !!show;
    document.body.classList.toggle('toolkits-modern-tour-active', !!show);
}

function toolkitsModernTourShowWelcome(show) {
    var welcome = document.getElementById('toolkits-modern-tour-welcome');
    var tip = document.getElementById('toolkits-modern-tour-tip');
    if (welcome) {
        welcome.hidden = !show;
    }
    if (tip && show) {
        tip.hidden = true;
    }
    document.body.classList.toggle('toolkits-modern-tour-mode-welcome', !!show);
}

function toolkitsModernTourPositionTip(anchorSelector, groupSelectors, fallbackSelector) {
    var tip = document.getElementById('toolkits-modern-tour-tip');
    if (!tip) {
        return;
    }

    var rect = null;
    if (groupSelectors && groupSelectors.length) {
        var groupTop = Infinity;
        var groupLeft = Infinity;
        var groupRight = -Infinity;
        var groupBottom = -Infinity;
        var found = false;
        groupSelectors.forEach(function (sel) {
            var el = document.querySelector(sel);
            if (!el || el.hidden) {
                return;
            }
            found = true;
            var r = el.getBoundingClientRect();
            groupTop = Math.min(groupTop, r.top);
            groupLeft = Math.min(groupLeft, r.left);
            groupRight = Math.max(groupRight, r.right);
            groupBottom = Math.max(groupBottom, r.bottom);
        });
        if (found) {
            rect = {
                top: groupTop,
                left: groupLeft,
                right: groupRight,
                bottom: groupBottom,
                width: groupRight - groupLeft,
                height: groupBottom - groupTop
            };
        }
    } else if (anchorSelector) {
        var anchor = document.querySelector(anchorSelector);
        if (anchor && !anchor.hidden) {
            var anchorRect = anchor.getBoundingClientRect();
            if (anchorRect.width > 0 || anchorRect.height > 0) {
                rect = anchorRect;
            }
        }
    }

    if (!rect && fallbackSelector) {
        var fallback = document.querySelector(fallbackSelector);
        if (fallback) {
            rect = fallback.getBoundingClientRect();
        }
    }

    // Prefer sitting to the right of the empty/template flyout when it is open beside the card.
    var cardMenu = document.getElementById('toolkits-modern-card-create-menu');
    if (rect && cardMenu && !cardMenu.hidden && cardMenu.style.top) {
        var menuRect = cardMenu.getBoundingClientRect();
        var nearCard = menuRect.top < window.innerHeight - 40 &&
            Math.abs(menuRect.top - rect.top) < 320;
        if (nearCard && menuRect.width > 0) {
            rect = {
                top: Math.min(rect.top, menuRect.top),
                left: Math.min(rect.left, menuRect.left),
                right: Math.max(rect.right, menuRect.right),
                bottom: Math.max(rect.bottom, menuRect.bottom),
                width: Math.max(rect.right, menuRect.right) - Math.min(rect.left, menuRect.left),
                height: Math.max(rect.bottom, menuRect.bottom) - Math.min(rect.top, menuRect.top)
            };
        }
    }

    tip.hidden = false;
    tip.style.visibility = 'hidden';
    tip.classList.remove('toolkits-modern-tour__tip--left', 'toolkits-modern-tour__tip--right');

    var tipWidth = tip.offsetWidth || 340;
    var tipHeight = tip.offsetHeight || 200;
    var gap = 28;
    var top;
    var left;
    var placeRight = true;

    if (rect) {
        top = rect.top + (rect.height / 2) - (tipHeight / 2);
        left = rect.right + gap;
        if (left + tipWidth > window.innerWidth - 16) {
            left = window.innerWidth - tipWidth - 16;
            if (left < rect.left + 40) {
                placeRight = false;
                left = Math.max(16, rect.left - tipWidth - gap);
            }
        }
    } else {
        top = window.innerHeight / 2 - tipHeight / 2;
        left = window.innerWidth / 2 - tipWidth / 2;
    }

    top = Math.max(16, Math.min(top, window.innerHeight - tipHeight - 16));
    left = Math.max(16, Math.min(left, window.innerWidth - tipWidth - 16));

    tip.style.top = Math.round(top) + 'px';
    tip.style.left = Math.round(left) + 'px';
    tip.classList.add(placeRight ? 'toolkits-modern-tour__tip--left' : 'toolkits-modern-tour__tip--right');
    tip.style.visibility = '';
}

function toolkitsModernTourRenderStep(index) {
    var steps = toolkitsModernTourGetSteps();
    var step = steps[index];
    var tipTitle = document.getElementById('toolkits-modern-tour-tip-title');
    var tipBody = document.getElementById('toolkits-modern-tour-tip-body');
    var tipStep = document.getElementById('toolkits-modern-tour-tip-step');
    if (!step) {
        return;
    }

    toolkitsModernShowHome();
    toolkitsModernTourClearHighlights();
    toolkitsModernCloseSidebarCreateMenu();
    toolkitsModernCloseCardCreateMenu();

    if (tipTitle) {
        tipTitle.textContent = step.title;
    }
    if (tipBody) {
        tipBody.innerHTML = step.body || '';
    }
    if (tipStep) {
        tipStep.textContent = (index + 1) + '/' + TOOLKITS_MODERN_TOUR_TOTAL;
    }

    toolkitsModernTourShowWelcome(false);
    document.body.classList.add('toolkits-modern-tour-mode-' + step.mode);

    if (step.sidebar) {
        var sidebar = document.querySelector('.toolkits-modern-sidebar');
        if (sidebar) {
            sidebar.classList.add('toolkits-modern-tour-highlight');
        }
    }

    function placeTip() {
        toolkitsModernTourPositionTip(step.tipAnchor, step.tipAnchorGroup, step.tipAnchorFallback);
    }

    function finishStepLayout() {
        (step.highlight || []).forEach(function (sel) {
            var el = document.querySelector(sel);
            if (el && el.id !== 'toolkits-modern-card-create-menu') {
                el.classList.add('toolkits-modern-tour-highlight');
            }
        });

        if (step.openCardCreate) {
            var cardBtn = document.getElementById('toolkits-modern-card-interactive-btn');
            if (cardBtn) {
                toolkitsModernOpenCardCreateMenu('Nottingham', cardBtn);
                var cardMenu = document.getElementById('toolkits-modern-card-create-menu');
                if (cardMenu) {
                    cardMenu.classList.add('toolkits-modern-tour-highlight');
                }
            }
            window.setTimeout(placeTip, 60);
            window.setTimeout(placeTip, 180);
        } else {
            window.setTimeout(placeTip, 30);
        }
    }

    if (step.scrollTo) {
        var scrollEl = document.querySelector(step.scrollTo);
        if (scrollEl && typeof scrollEl.scrollIntoView === 'function') {
            scrollEl.scrollIntoView({ block: 'center', inline: 'nearest' });
            window.setTimeout(finishStepLayout, 100);
            return;
        }
    }

    finishStepLayout();
}

function toolkitsModernTourOpenEditor() {
    var s = toolkitsModernTourStrings();
    var name = s.modernTourProjectName || 'My first learning object';
    var tipBody = document.getElementById('toolkits-modern-tour-tip-body');
    if (tipBody) {
        tipBody.textContent = s.modernTourOpeningEditor || 'Opening the editor…';
    }
    window.toolkitsModernTourOpeningEditor = true;
    toolkitsModernTourMarkContinue();
    toolkitsModernTourMarkDone();
    toolkitsModernShowHome();
    toolkitsModernCreateLearningObject('Nottingham', 'Nottingham', name, { showWorkspace: false });
    window.setTimeout(function () {
        toolkitsModernTourEnd(false);
        window.toolkitsModernTourOpeningEditor = false;
        toolkitsModernShowHome();
    }, 600);
}

function toolkitsModernTourEnd(markDone) {
    if (markDone !== false) {
        toolkitsModernTourMarkDone();
    }
    toolkitsModernTourClearHighlights();
    toolkitsModernCloseCardCreateMenu();
    toolkitsModernTourShowWelcome(false);
    var tip = document.getElementById('toolkits-modern-tour-tip');
    if (tip) {
        tip.hidden = true;
    }
    toolkitsModernTourShowRoot(false);
    window.toolkitsModernTourStep = -1;
    window.removeEventListener('resize', toolkitsModernTourOnResize);

    if (!window.toolkitsModernTourOpeningEditor) {
        toolkitsModernShowAllView();
        var mount = document.getElementById('toolkits-index-mount');
        if (mount) {
            mount.querySelectorAll('.toolkits-modern-nav__item[data-modern-nav]').forEach(function (el) {
                el.classList.remove('toolkits-modern-nav__item--active');
            });
            var allNav = mount.querySelector('.toolkits-modern-nav__item[data-modern-nav="all"]');
            if (allNav) {
                allNav.classList.add('toolkits-modern-nav__item--active');
            }
        }
    }
}

function toolkitsModernTourOnResize() {
    if (!window.toolkitsModernTourActive || window.toolkitsModernTourStep < 0) {
        return;
    }
    var steps = toolkitsModernTourGetSteps();
    var step = steps[window.toolkitsModernTourStep];
    if (!step) {
        return;
    }
    if (step.openCardCreate) {
        var cardBtn = document.getElementById('toolkits-modern-card-interactive-btn');
        if (cardBtn && window.toolkitsModernCardCreateParentKey) {
            toolkitsModernOpenCardCreateMenu('Nottingham', cardBtn);
            var cardMenu = document.getElementById('toolkits-modern-card-create-menu');
            if (cardMenu) {
                cardMenu.classList.add('toolkits-modern-tour-highlight');
            }
        }
    }
    toolkitsModernTourPositionTip(step.tipAnchor, step.tipAnchorGroup, step.tipAnchorFallback);
}

function toolkitsModernTourNext() {
    var steps = toolkitsModernTourGetSteps();
    var next = (window.toolkitsModernTourStep || 0) + 1;
    if (next >= steps.length) {
        toolkitsModernTourOpenEditor();
        return;
    }
    window.toolkitsModernTourStep = next;
    toolkitsModernTourRenderStep(next);
}

function toolkitsModernTourStart() {
    window.toolkitsModernTourStep = 0;
    toolkitsModernTourRenderStep(0);
}

function toolkitsModernTourBegin() {
    if (!document.getElementById('toolkits-modern-tour')) {
        return;
    }
    toolkitsModernShowHome();
    toolkitsModernCloseCreateMenu();
    toolkitsModernTourShowRoot(true);
    toolkitsModernTourClearHighlights();
    toolkitsModernTourShowWelcome(true);
    window.toolkitsModernTourStep = -1;
    window.addEventListener('resize', toolkitsModernTourOnResize);
}

function toolkitsModernBindTour() {
    if (window.toolkitsModernTourBound) {
        return;
    }
    window.toolkitsModernTourBound = true;

    document.addEventListener('click', function (e) {
        if (!window.toolkitsModernTourActive) {
            return;
        }
        if (e.target.closest('[data-tour-skip]')) {
            e.preventDefault();
            toolkitsModernTourEnd(true);
            return;
        }
        if (e.target.closest('[data-tour-start]')) {
            e.preventDefault();
            toolkitsModernTourStart();
            return;
        }
        if (e.target.closest('[data-tour-next]')) {
            e.preventDefault();
            toolkitsModernTourNext();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (!window.toolkitsModernTourActive) {
            return;
        }
        if (e.key === 'Escape') {
            toolkitsModernTourEnd(true);
        }
    });
}

function toolkitsModernInitTour() {
    toolkitsModernBindTour();
    if (!toolkitsModernTourShouldShow()) {
        toolkitsModernShowAllView();
        var mount = document.getElementById('toolkits-index-mount');
        if (mount) {
            mount.querySelectorAll('.toolkits-modern-nav__item[data-modern-nav]').forEach(function (el) {
                el.classList.remove('toolkits-modern-nav__item--active');
            });
            var allNav = mount.querySelector('.toolkits-modern-nav__item[data-modern-nav="all"]');
            if (allNav) {
                allNav.classList.add('toolkits-modern-nav__item--active');
            }
        }
        return;
    }
    window.setTimeout(function () {
        toolkitsModernTourBegin();
    }, 400);
}

window.toolkitsModernRestartTour = function () {
    toolkitsModernTourClearDone();
    toolkitsModernTourBegin();
};