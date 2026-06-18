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
        toolkitsModernUserModalShellHtml(s);
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

function toolkitsModernOpenUserDetails() {
    toolkitsModernCloseUserMenu();
    if (typeof $ === 'undefined' || typeof rest_api_url === 'undefined') {
        return;
    }
    $.ajax({
        url: rest_api_url,
        data: { route: 'workspaceproperties/my-properties' },
        dataType: 'json',
        success: function (res) {
            if (!res || !res.ok || !res.data) {
                return;
            }
            var d = res.data;
            var esc = typeof escapeHtml === 'function' ? escapeHtml : function (v) { return v; };
            var html = '<div class="toolkits-modern-user-details">' +
                '<h3 class="toolkits-modern-user-details__title">' + esc(d.heading) + '</h3>' +
                '<p><strong>' + esc(d.i18n.nameLabel) + ':</strong> ' + esc(d.user.name) + '</p>' +
                '<p><strong>' + esc(d.i18n.usernameLabel) + ':</strong> ' + esc(d.user.username) + '</p>' +
                '<p><strong>' + esc(d.i18n.lastLoginLabel) + ':</strong> ' + esc(d.user.lastLogin) + '</p>' +
            '</div>';
            $.featherlight(html);
        }
    });
}

function toolkitsModernOpenFeedback() {
    toolkitsModernCloseUserMenu();
    if (typeof $ === 'undefined' || typeof $.featherlight !== 'function') {
        return;
    }
    var feedbackUrl = (typeof site_url !== 'undefined' ? site_url : '') + 'feedback/';
    $.featherlight({
        iframe: feedbackUrl,
        iframeWidth: '85vw',
        iframeHeight: '85vh'
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

function toolkitsModernGuideCardHtml(variant, icon, title, desc, href) {
    return '<a class="toolkits-modern-guide toolkits-modern-guide--' + variant + '" href="' + href + '" target="_blank" rel="noopener">' +
        '<div class="toolkits-modern-guide__icon"><i class="fa ' + icon + '"></i></div>' +
        '<h3>' + title + '</h3>' +
        '<p>' + desc + '</p>' +
        '<span class="toolkits-modern-guide__arrow"><i class="fa fa-chevron-right"></i></span>' +
    '</a>';
}

function toolkitsModernHomeGuidesSectionHtml(s) {
    return '<section class="toolkits-modern-section">' +
        '<h2 class="toolkits-modern-section__title">' + s.modernGetStarted + '</h2>' +
        '<div class="toolkits-modern-cards toolkits-modern-cards--three">' +
            toolkitsModernGuideCardHtml('orange', 'fa-lightbulb', s.modernGuide1Title, s.modernGuide1Desc, 'https://xot.xerte.org.uk/play.php?template_id=150') +
            toolkitsModernGuideCardHtml('cream', 'fa-signs-post', s.modernGuide2Title, s.modernGuide2Desc, 'https://xot.xerte.org.uk/play.php?template_id=150#page2') +
            toolkitsModernGuideCardHtml('peach', 'fa-magnifying-glass', s.modernGuide3Title, s.modernGuide3Desc, 'https://xot.xerte.org.uk/play.php?template_id=150#page3') +
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
                toolkitsModernGuideCardHtml('orange', 'fa-lightbulb', s.modernGuide1Title, s.modernGuide1Desc, 'https://xot.xerte.org.uk/play.php?template_id=150') +
                toolkitsModernGuideCardHtml('cream', 'fa-signs-post', s.modernGuide2Title, s.modernGuide2Desc, 'https://xot.xerte.org.uk/play.php?template_id=150#page2') +
                toolkitsModernGuideCardHtml('peach', 'fa-magnifying-glass', s.modernGuide3Title, s.modernGuide3Desc, 'https://xot.xerte.org.uk/play.php?template_id=150#page3') +
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
        edit_window(false, 'edithtml');
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
    toolkitsModernBindLoPreviewLightbox();

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
        var chevronSpan = document.createElement('span');
        chevronSpan.className = 'toolkits-modern-lo-item__chevron';
        chevronSpan.setAttribute('aria-hidden', 'true');
        chevronSpan.innerHTML = '<i class="fa fa-chevron-right"></i>';
        var thumbWrap = document.createElement('button');
        thumbWrap.type = 'button';
        thumbWrap.className = 'toolkits-modern-lo-item__thumb-wrap';
        thumbWrap.setAttribute('aria-label', (s.modernLoMenuPreview || 'Preview') + ': ' + (item.text || ''));
        var previewFrame = document.createElement('iframe');
        previewFrame.className = 'toolkits-modern-lo-item__thumb-frame';
        previewFrame.src = toolkitsModernGetLoPreviewUrl(item.xot_id);
        previewFrame.setAttribute('title', (item.text || 'Learning object') + ' preview');
        previewFrame.setAttribute('loading', 'lazy');
        previewFrame.setAttribute('tabindex', '-1');
        thumbWrap.appendChild(previewFrame);
        thumbWrap.addEventListener('click', function (e) {
            e.stopPropagation();
            toolkitsModernOpenLoPreviewLightbox(
                toolkitsModernGetLoPreviewUrl(item.xot_id),
                item.text || ''
            );
        });
        previewTd.appendChild(chevronSpan);
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
    if (typeof $ === 'undefined' || typeof workspace === 'undefined') {
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

function toolkitsModernCreateLearningObject(parentKey, templateName, projectName) {
    if (typeof is_ok_name === 'function' && !is_ok_name(projectName)) {
        if (typeof NAME_FAIL !== 'undefined') {
            window.alert(NAME_FAIL);
        }
        return;
    }
    if (typeof $ === 'undefined' || typeof site_url === 'undefined') {
        return;
    }

    toolkitsModernCloseCreateMenu();
    toolkitsModernShowWorkspace(true);

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
        if (typeof refresh_workspace === 'function') {
            refresh_workspace();
        }
        if (typeof tutorial_created === 'function') {
            tutorial_created(response);
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
        var toggle = document.getElementById('toolkits-modern-create-toggle');
        var menu = document.getElementById('toolkits-modern-create-menu');
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
            var projectName = toolkitsModernPromptProjectName();
            if (projectName) {
                toolkitsModernCreateLearningObject(
                    window.toolkitsModernCreateParentKey,
                    window.toolkitsModernCreateParentKey,
                    projectName
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
        }
    });

    document.addEventListener('change', function (e) {
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
    modal.classList.remove('toolkits-modern-user-modal--password', 'toolkits-modern-user-modal--settings');
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
    modal.classList.add(section === 'settings' ? 'toolkits-modern-user-modal--settings' : 'toolkits-modern-user-modal--password');

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
    toolkitsModernBindCreateMenu();
    toolkitsModernUpdateNavCounts();
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
