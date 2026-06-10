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
            { id: 'recent', icon: 'fa-clock', label: s.modernNavRecent, action: 'recent' },
            { id: 'published', icon: 'fa-tower-broadcast', label: s.modernNavPublished, action: 'published' },
            { id: 'favourites', icon: 'fa-heart', label: s.modernNavFavourites, action: 'favourites' },
            { id: 'trash', icon: 'fa-trash', label: s.modernNavTrash, action: 'trash' }
        ],
        [
            { id: 'guides', icon: 'fa-book', label: s.modernNavGuides, href: 'https://xot.xerte.org.uk/play.php?template_id=150' }
        ]
    ];

    var navHtml = '';
    navGroups.forEach(function (group, groupIndex) {
        navHtml += '<div class="toolkits-modern-nav__group">';
        group.forEach(function (item, itemIndex) {
            var active = groupIndex === 0 && itemIndex === 0 ? ' toolkits-modern-nav__item--active' : '';
            if (item.href) {
                navHtml += '<a href="' + item.href + '" target="_blank" rel="noopener" class="toolkits-modern-nav__item toolkits-modern-nav__item--link' + active + '">' +
                    '<i class="fa ' + item.icon + ' toolkits-modern-nav__icon"></i>' +
                    '<span>' + item.label + '</span>' +
                '</a>';
            } else {
                navHtml += '<button type="button" class="toolkits-modern-nav__item' + active + '" data-modern-view="' + item.action + '" data-modern-nav="' + item.id + '">' +
                    '<i class="fa ' + item.icon + ' toolkits-modern-nav__icon"></i>' +
                    '<span>' + item.label + '</span>' +
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
        '<div class="folder_popup" id="message_box">' +
            '<div class="main_area" id="dynamic_section">' +
                '<p style="color:white">' + s.folderPrompt + '</p>' +
                '<form id="foldernamepopup" action="javascript:create_folder()" method="post" enctype="text/plain">' +
                    '<label for="foldername" class="sr-only">' + s.folderName + '</label>' +
                    '<input type="text" id="foldername" name="foldername" style="margin:0px; margin-right:5px; padding:3px"/>' +
                    '<button type="submit" class="xerte_button_c">' + s.folderCreate + '</button>' +
                    '<button type="button" class="xerte_button_c" style="margin-top:0.5em;" onclick="javascript:popup_close()">' + s.folderCancel + '</button>' +
                '</form>' +
                '<p><span id="folder_feedback"></span></p>' +
            '</div>' +
        '</div>' +

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
                '<button type="button" class="toolkits-modern-btn toolkits-modern-btn--primary toolkits-modern-sidebar__create" onclick="toolkitsModernShowWorkspace(true)">' +
                    '<i class="fa fa-plus"></i> ' + s.modernCreateLo +
                '</button>' +
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

                    '<section class="toolkits-modern-section">' +
                        '<h2 class="toolkits-modern-section__title">' + s.modernGetStarted + '</h2>' +
                        '<div class="toolkits-modern-cards toolkits-modern-cards--three">' +
                            '<a class="toolkits-modern-guide toolkits-modern-guide--orange" href="https://xot.xerte.org.uk/play.php?template_id=150" target="_blank" rel="noopener">' +
                                '<div class="toolkits-modern-guide__icon"><i class="fa fa-lightbulb"></i></div>' +
                                '<h3>' + s.modernGuide1Title + '</h3>' +
                                '<p>' + s.modernGuide1Desc + '</p>' +
                                '<span class="toolkits-modern-guide__arrow"><i class="fa fa-chevron-right"></i></span>' +
                            '</a>' +
                            '<a class="toolkits-modern-guide toolkits-modern-guide--cream" href="https://xot.xerte.org.uk/play.php?template_id=150#page2" target="_blank" rel="noopener">' +
                                '<div class="toolkits-modern-guide__icon"><i class="fa fa-signs-post"></i></div>' +
                                '<h3>' + s.modernGuide2Title + '</h3>' +
                                '<p>' + s.modernGuide2Desc + '</p>' +
                                '<span class="toolkits-modern-guide__arrow"><i class="fa fa-chevron-right"></i></span>' +
                            '</a>' +
                            '<a class="toolkits-modern-guide toolkits-modern-guide--peach" href="https://xot.xerte.org.uk/play.php?template_id=150#page3" target="_blank" rel="noopener">' +
                                '<div class="toolkits-modern-guide__icon"><i class="fa fa-magnifying-glass"></i></div>' +
                                '<h3>' + s.modernGuide3Title + '</h3>' +
                                '<p>' + s.modernGuide3Desc + '</p>' +
                                '<span class="toolkits-modern-guide__arrow"><i class="fa fa-chevron-right"></i></span>' +
                            '</a>' +
                        '</div>' +
                        '<p class="toolkits-modern-more-guides">' +
                            '<a href="https://xot.xerte.org.uk/play.php?template_id=150" target="_blank" rel="noopener">' + s.modernMoreGuides + ' <i class="fa fa-arrow-right"></i></a>' +
                        '</p>' +
                    '</section>' +
                '</div>' +

                toolkitsModernObjectsViewHtml(s) +

                '<div class="toolkits-modern-workspace" id="toolkits-modern-workspace" hidden>' +
                    toolkitsIndexWorkspaceHtml(cfg) +
                '</div>' +
            '</div>' +
        '</div>';
}

function toolkitsModernTopbarUserMenuHtml(cfg) {
    var s = cfg.strings || {};
    var user = cfg.user || {};
    var settingsLabel = s.modernSettings || 'Settings';
    var items = '';

    if (user.canManageUser) {
        items += '<button type="button" class="toolkits-modern-topbar__dropdown-item" role="menuitem" onclick="toolkitsModernCloseUserMenu(); changepasswordPopup();">' + settingsLabel + '</button>';
    }
    if (user.hasManagementRole) {
        items += '<button type="button" class="toolkits-modern-topbar__dropdown-item" role="menuitem" onclick="toolkitsModernCloseUserMenu(); javascript:elevate(\'management.php\');">' + s.toManagement + '</button>';
    }
    if (!user.isGuest) {
        items += '<button type="button" class="toolkits-modern-topbar__dropdown-item" role="menuitem" onclick="toolkitsModernCloseUserMenu(); javascript:logout(' + (user.samlLogout ? 'true' : 'false') + ');">' + s.logout + '</button>';
    }

    var topbarName = user.firstName || user.displayName || '';
    var menuHtml = '';
    if (items) {
        menuHtml =
            '<div class="toolkits-modern-topbar__user-menu">' +
                '<button type="button" class="toolkits-modern-topbar__user-toggle" id="toolkits-modern-user-toggle" aria-expanded="false" aria-haspopup="true" aria-controls="toolkits-modern-user-menu">' +
                    '<span class="toolkits-modern-topbar__name">' + topbarName + '</span>' +
                    '<i class="fa fa-chevron-down toolkits-modern-topbar__chevron" aria-hidden="true"></i>' +
                '</button>' +
                '<div class="toolkits-modern-topbar__dropdown" id="toolkits-modern-user-menu" role="menu" hidden>' + items + '</div>' +
            '</div>';
    } else if (topbarName) {
        menuHtml = '<span class="toolkits-modern-topbar__name">' + topbarName + '</span>';
    }

    return '<div class="toolkits-modern-topbar__user">' + menuHtml +
        '<span class="toolkits-modern-topbar__avatar" aria-hidden="true"><i class="fa fa-user"></i></span>' +
    '</div>';
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

function toolkitsModernStartSectionHtml(s) {
    return '<section class="toolkits-modern-section">' +
        '<h2 class="toolkits-modern-section__title">' + s.modernStartSection + '</h2>' +
        '<div class="toolkits-modern-cards toolkits-modern-cards--two">' +
            '<article class="toolkits-modern-card toolkits-modern-card--blue">' +
                '<h3>' + s.modernCardInteractiveTitle + '</h3>' +
                '<p>' + s.modernCardInteractiveDesc + '</p>' +
                '<button type="button" class="toolkits-modern-btn toolkits-modern-btn--primary" onclick="toolkitsModernCreateTemplate(\'Nottingham\')">' +
                    '<i class="fa fa-plus"></i> ' + s.modernCardInteractiveBtn +
                '</button>' +
            '</article>' +
            '<article class="toolkits-modern-card toolkits-modern-card--blue">' +
                '<h3>' + s.modernCardSiteTitle + '</h3>' +
                '<p>' + s.modernCardSiteDesc + '</p>' +
                '<button type="button" class="toolkits-modern-btn toolkits-modern-btn--primary" onclick="toolkitsModernCreateTemplate(\'site\')">' +
                    '<i class="fa fa-plus"></i> ' + s.modernCardSiteBtn +
                '</button>' +
            '</article>' +
        '</div>' +
    '</section>';
}

function toolkitsModernObjectsViewHtml(s) {
    return '<div class="toolkits-modern-objects" id="toolkits-modern-objects" hidden>' +
        '<div class="toolkits-modern-objects__scroll">' +
            '<div class="toolkits-modern-lo-page">' +
                '<header class="toolkits-modern-lo-page__header">' +
                    '<div class="toolkits-modern-lo-page__intro">' +
                        '<h1 class="toolkits-modern-lo-page__title">' + (s.modernLoPageTitle || 'Learning objects') + '</h1>' +
                        '<span class="toolkits-modern-objects__filter" id="toolkits-modern-objects-filter"></span>' +
                    '</div>' +
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
    return item.xot_type === 'template';
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
    return {
        filter: s.modernNavAll || 'All learning objects',
        emptyTitle: s.modernEmptyTitle || 'You have no learning objects yet',
        emptyDesc: s.modernEmptyDesc || 'Learning objects appear here'
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
    var value = String(access || '');
    if (value === 'Private') {
        return s.modernLoAccessPrivate || 'Private';
    }
    if (value === 'Public') {
        return s.modernLoAccessPublic || 'Public';
    }
    if (value === 'Password' || value.indexOf('PasswordPlay-') === 0) {
        return s.modernLoAccessPassword || 'Password';
    }
    if (value.indexOf('Other-') === 0) {
        return s.modernLoAccessDemo || 'Demo';
    }
    return value || s.modernLoAccessPrivate || 'Private';
}

function toolkitsModernGetLoPlaceholderUrl() {
    return 'website_code/images/Icon_Page.gif';
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
    if (filterEl) {
        filterEl.textContent = copy.filter;
    }
    if (titleEl) {
        titleEl.textContent = copy.emptyTitle;
    }
    if (textEl) {
        textEl.textContent = copy.emptyDesc;
    }
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

function toolkitsModernBuildLoMenuHtml(item) {
    var items = toolkitsModernGetLoMenuItems(item);
    var html = '';
    items.forEach(function (entry, index) {
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

function toolkitsModernRunLoAction(action, nodeId, actionBtn) {
    if (!nodeId) {
        return;
    }
    toolkitsModernSelectTreeNode(nodeId);
    toolkitsModernUpdateListSelection(nodeId);
    toolkitsModernCloseLoMenu();

    if (action === 'edit' && typeof edit_window === 'function') {
        edit_window(false);
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
    } else if (action === 'properties' && typeof properties_window === 'function') {
        properties_window(false);
    } else if (action === 'delete' && typeof remove_this === 'function') {
        remove_this();
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
            toolkitsModernRunLoAction(actionBtn.getAttribute('data-lo-action'), toolkitsModernLoMenuState.nodeId, actionBtn);
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

    var objects = toolkitsModernCollectLearningObjects();
    listEl.innerHTML = '';

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
        item = toolkitsModernSyncWorkspaceItemMeta(item);
        var tr = document.createElement('tr');
        tr.className = 'toolkits-modern-lo-item';
        if (item.id === selectedId) {
            tr.classList.add('toolkits-modern-lo-item--selected');
        }
        tr.setAttribute('data-node-id', item.id);

        var previewTd = document.createElement('td');
        previewTd.className = 'toolkits-modern-lo-item__preview';
        previewTd.innerHTML =
            '<span class="toolkits-modern-lo-item__chevron" aria-hidden="true"><i class="fa fa-chevron-right"></i></span>' +
            '<img class="toolkits-modern-lo-item__thumb" src="' + toolkitsModernGetLoPlaceholderUrl() + '" alt="" width="48" height="32"/>';

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
        var accessHtml = '<span class="toolkits-modern-lo-item__access-label">' + toolkitsModernFormatAccess(item.access) + '</span>';
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

        var editBtn = actionsTd.querySelector('.toolkits-modern-lo-item__action--edit');
        if (editBtn) {
            editBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                toolkitsModernRunLoAction('edit', item.id);
            });
        }

        tr.addEventListener('click', function () {
            toolkitsModernRememberRecent(item.id);
            toolkitsModernSelectTreeNode(item.id);
            toolkitsModernUpdateListSelection(item.id);
        });

        listEl.appendChild(tr);
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
    toolkitsModernRenderObjectList();
}

function toolkitsModernEnsureWorkspaceData() {
    if (typeof refresh_workspace === 'function') {
        refresh_workspace();
    }
}

function toolkitsModernSetMainView(view) {
    var home = document.getElementById('toolkits-modern-home');
    var objects = document.getElementById('toolkits-modern-objects');
    var workspacePanel = document.getElementById('toolkits-modern-workspace');

    if (home) {
        home.hidden = view !== 'home';
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
        window.toolkitsModernBrowseMode = 'recent';
        toolkitsModernSetMainView('recent');
    } else if (mode === 'favourites') {
        window.toolkitsModernBrowseMode = 'favourites';
        toolkitsModernSetMainView('favourites');
    } else if (mode === 'published') {
        window.toolkitsModernBrowseMode = 'published';
        toolkitsModernSetMainView('published');
    } else if (mode === 'trash') {
        window.toolkitsModernBrowseMode = 'trash';
        toolkitsModernSetMainView('trash');
    } else {
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

function toolkitsModernCreateTemplate(templateName) {
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
        } else if (view === 'workspace') {
            toolkitsModernShowWorkspace(false);
        }
        if (view === 'all' || view === 'recent' || view === 'favourites' || view === 'published' || view === 'trash' || view === 'workspace') {
            mount.querySelectorAll('.toolkits-modern-nav__item[data-modern-nav]').forEach(function (el) {
                el.classList.remove('toolkits-modern-nav__item--active');
            });
            btn.classList.add('toolkits-modern-nav__item--active');
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

function toolkitsIndexAfterShell() {
    toolkitsModernBindNav();
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
