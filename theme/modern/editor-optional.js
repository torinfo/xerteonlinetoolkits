/**
 * Modern LO editor — right pane optional preferences (toggles instead of + buttons).
 */
(function ($, window, document) {
    'use strict';

    if (!document.body || !document.body.classList.contains('toolkits-ui-theme-modern')) {
        return;
    }

    var currentPayload = null;
    var bound = false;

    function t(nl, en) {
        var lang = (typeof languagecodevariable !== 'undefined' && languagecodevariable)
            ? String(languagecodevariable)
            : '';
        return lang.indexOf('nl') === 0 ? nl : en;
    }

    function groupTitle(kind, pageTitle) {
        if (kind === 'page') {
            return pageTitle || t('Pagina', 'Page');
        }
        if (kind === 'assistant') {
            if (typeof language !== 'undefined' && language.optionalAssistantPropHTML && language.optionalAssistantPropHTML.$general) {
                return language.optionalAssistantPropHTML.$general;
            }
            return t('Assistent', 'Assistant');
        }
        if (typeof language !== 'undefined' && language.optionalPropHTML && language.optionalPropHTML.$general) {
            return language.optionalPropHTML.$general;
        }
        return t('Algemeen', 'General');
    }

    function countGroupSettings(opt) {
        if (!opt || !opt.value) {
            return 0;
        }
        if (opt.value.type === 'group' && opt.value.children && opt.value.children.length) {
            var n = 0;
            $.each(opt.value.children, function () {
                if (!this.value || this.value.deprecated) {
                    return;
                }
                if (this.value.type === 'group' && this.value.children) {
                    n += this.value.children.length;
                } else {
                    n += 1;
                }
            });
            return n;
        }
        return 1;
    }

    function isDrawerItem(opt) {
        return !!(opt && opt.value && opt.value.lightbox === 'form');
    }

    var EAST_WIDTH_OPEN = 280;
    var EAST_WIDTH_COLLAPSED = 28;

    function widenEastPane() {
        if (typeof xerte_layout !== 'undefined' && xerte_layout && xerte_layout.sizePane) {
            try {
                if (xerte_layout.options && xerte_layout.options.east) {
                    xerte_layout.options.east.minSize = 200;
                }
                xerte_layout.sizePane('east', EAST_WIDTH_OPEN);
            } catch (e) {
                // ignore
            }
        }
    }

    function ensureOpenButton() {
        if ($('#modern-opt-open').length) {
            return $('#modern-opt-open');
        }
        var $btn = $(
            '<button type="button" class="modern-opt-open" id="modern-opt-open" hidden title="' +
                t('Voorkeuren', 'Preferences') + '" aria-label="' + t('Voorkeuren openen', 'Open preferences') + '">' +
                '<i class="fa fa-arrow-left" aria-hidden="true"></i>' +
            '</button>'
        );
        $('body').append($btn);
        return $btn;
    }

    function isEastCollapsed() {
        return $('body').hasClass('modern-east-closed');
    }

    function isEastLayoutClosed() {
        if (typeof xerte_layout === 'undefined' || !xerte_layout || !xerte_layout.state) {
            return false;
        }
        return !!(xerte_layout.state.east && xerte_layout.state.east.isClosed);
    }

    function syncEastOpenButton() {
        var $btn = ensureOpenButton();
        var $east = $('body > .ui-layout-east');
        if (isEastCollapsed()) {
            if ($east.length) {
                $east.append($btn);
            }
            $btn.removeAttr('hidden').addClass('is-visible');
        } else {
            $('body').append($btn);
            $btn.attr('hidden', true).removeClass('is-visible');
        }
    }

    function collapseEastPane() {
        if (typeof xerte_layout === 'undefined' || !xerte_layout) {
            return;
        }
        try {
            // Stay "open" in layout terms so center still accounts for the strip width
            if (isEastLayoutClosed() && xerte_layout.open) {
                xerte_layout.open('east');
            }
            if (xerte_layout.options && xerte_layout.options.east) {
                xerte_layout.options.east.minSize = EAST_WIDTH_COLLAPSED;
                xerte_layout.options.east.spacing_closed = 0;
            }
            if (xerte_layout.sizePane) {
                xerte_layout.sizePane('east', EAST_WIDTH_COLLAPSED);
            }
        } catch (e) {
            // ignore
        }
        $('body').addClass('modern-east-closed');
        $('body > .ui-layout-east').addClass('modern-east-collapsed');
        syncEastOpenButton();
    }

    function closeEastPane() {
        collapseEastPane();
    }

    function openEastPane() {
        $('body').removeClass('modern-east-closed');
        $('body > .ui-layout-east').removeClass('modern-east-collapsed');
        if (typeof xerte_layout !== 'undefined' && xerte_layout) {
            try {
                if (isEastLayoutClosed() && xerte_layout.open) {
                    xerte_layout.open('east');
                }
                widenEastPane();
            } catch (e) {
                // ignore
            }
        }
        syncEastOpenButton();
    }

    function ensureShell() {
        var $east = $('body > .ui-layout-east');
        if (!$east.length) {
            return null;
        }
        ensureOpenButton();

        // Place collapse control on the left edge (same spot as classic pin)
        $east.children('.header').empty();
        if (!$east.children('#modern-opt-collapse').length) {
            $east.prepend(
                '<button type="button" class="modern-opt-collapse" id="modern-opt-collapse" title="' +
                    t('Sluiten', 'Collapse') + '" aria-label="' + t('Sluiten', 'Collapse') + '">' +
                    '<i class="fa fa-arrow-right" aria-hidden="true"></i>' +
                '</button>'
            );
        }

        var $content = $east.children('.content');
        if (!$content.find('#modern-optional-prefs').length) {
            $content.prepend('<div id="modern-optional-prefs" class="modern-optional-prefs"></div>');
        }

        // Preference may start east fully closed — convert to collapsed strip
        if (isEastLayoutClosed()) {
            collapseEastPane();
        } else if (!isEastCollapsed()) {
            widenEastPane();
            syncEastOpenButton();
        } else {
            syncEastOpenButton();
        }
        return $('#modern-optional-prefs');
    }

    function buildGroups(payload) {
        var pageItems = [];
        var assistantItems = [];
        var generalItems = [];
        var nodeName = payload.nodeName;

        $.each(payload.optional || [], function () {
            if (!this || !this.value || this.value.deprecated || !this.visible) {
                return;
            }
            if (this.value.subgroup === 'assistant') {
                assistantItems.push(this);
            } else if (this.value.common) {
                if (nodeName !== 'chapter') {
                    generalItems.push(this);
                }
            } else {
                pageItems.push(this);
            }
        });

        var groups = [];
        if (pageItems.length) {
            groups.push({ kind: 'page', title: groupTitle('page', payload.pageTitle), items: pageItems });
        }
        if (assistantItems.length) {
            groups.push({ kind: 'assistant', title: groupTitle('assistant'), items: assistantItems });
        }
        if (generalItems.length) {
            groups.push({ kind: 'general', title: groupTitle('general'), items: generalItems });
        }
        return groups;
    }

    function rowHtml(opt) {
        var name = opt.name;
        var label = opt.value.label || name;
        var tip = opt.value.tooltip || '';
        var drawer = isDrawerItem(opt);
        var count = countGroupSettings(opt);

        if (drawer) {
            var drawerDesc = t(
                'Opent in drawer (' + count + ' instellingen)',
                'Opens in drawer (' + count + ' settings)'
            );
            return '<button type="button" class="modern-opt-row modern-opt-row--drawer" data-opt-name="' + name + '" data-opt-drawer="1">' +
                '<div class="modern-opt-row__text">' +
                    '<div class="modern-opt-row__title"></div>' +
                    '<div class="modern-opt-row__desc"></div>' +
                '</div>' +
                '<i class="fa fa-chevron-right modern-opt-row__chevron" aria-hidden="true"></i>' +
            '</button>';
        }

        return '<div class="modern-opt-row" data-opt-name="' + name + '">' +
            '<div class="modern-opt-row__text">' +
                '<div class="modern-opt-row__title"></div>' +
                (tip ? '<div class="modern-opt-row__desc"></div>' : '') +
            '</div>' +
            '<label class="modern-opt-switch">' +
                '<input type="checkbox" class="modern-opt-switch__input" data-opt-toggle="' + name + '"' +
                    (opt.found ? ' checked' : '') + ' />' +
                '<span class="modern-opt-switch__ui" aria-hidden="true"></span>' +
                '<span class="sr-only">' + label + '</span>' +
            '</label>' +
        '</div>';
    }

    function fillRowTexts($root, groups) {
        var flat = [];
        groups.forEach(function (g) {
            flat = flat.concat(g.items);
        });
        $root.find('.modern-opt-row').each(function (i) {
            var opt = flat[i];
            if (!opt) {
                return;
            }
            var $row = $(this);
            $row.find('.modern-opt-row__title').text(opt.value.label || opt.name);
            var $desc = $row.find('.modern-opt-row__desc');
            if (!$desc.length) {
                return;
            }
            if (isDrawerItem(opt)) {
                var count = countGroupSettings(opt);
                $desc.text(t(
                    'Opent in drawer (' + count + ' instellingen)',
                    'Opens in drawer (' + count + ' settings)'
                ));
            } else if (opt.value.tooltip) {
                $desc.text(opt.value.tooltip);
            }
        });
    }

    function render(payload) {
        currentPayload = payload;
        var $panel = ensureShell();
        if (!$panel) {
            return;
        }

        $('.optButtonContainer').hide();

        var groups = buildGroups(payload);
        if (!groups.length) {
            $panel.html(
                '<div class="modern-optional-prefs__empty">' +
                    t('Geen extra voorkeuren voor deze pagina.', 'No extra preferences for this page.') +
                '</div>'
            );
            return;
        }

        var html = '';
        groups.forEach(function (group) {
            html += '<section class="modern-opt-card">' +
                '<div class="modern-opt-card__heading"></div>' +
                '<div class="modern-opt-card__rows">';
            group.items.forEach(function (opt) {
                html += rowHtml(opt);
            });
            html += '</div></section>';
        });
        $panel.html(html);

        $panel.find('.modern-opt-card').each(function (i) {
            $(this).find('.modern-opt-card__heading').text(groups[i].title);
        });
        fillRowTexts($panel, groups);
    }

    function findOpt(name) {
        if (!currentPayload || !currentPayload.optional) {
            return null;
        }
        for (var i = 0; i < currentPayload.optional.length; i++) {
            if (currentPayload.optional[i].name === name) {
                return currentPayload.optional[i];
            }
        }
        return null;
    }

    function enableOptional(opt) {
        if (!opt || !currentPayload) {
            return;
        }
        var key = currentPayload.key;
        var toolbox = EDITOR && EDITOR.toolbox;
        if (!toolbox) {
            return;
        }

        if (opt.value.lightbox === 'form') {
            toolbox.triggerRedrawForm(opt.name, key, opt.value.children, 'initialize');
            return;
        }

        function addGroup(data) {
            if (data.children != undefined) {
                for (var j = 0; j < data.children.length; j++) {
                    if (data.children[j].value.deprecated) {
                        continue;
                    }
                    var load = (j === data.children.length - 1);
                    if (data.children[j].value.children != undefined) {
                        var temp = data.children[j].value;
                        temp.key = data.key;
                        temp.attribute = data.attribute;
                        addGroup(temp);
                    } else {
                        toolbox.insertOptionalProperty(
                            data.key,
                            data.children[j].name,
                            (data.children[j].value.defaultValue ? data.children[j].value.defaultValue : ''),
                            load,
                            (load ? 'group_' + data.attribute : '')
                        );
                    }
                }
            } else {
                toolbox.insertOptionalProperty(data.key, data.attribute, data.default, true, 'opt_' + data.attribute);
            }
        }

        addGroup({
            key: key,
            attribute: opt.name,
            default: opt.value.defaultValue ? opt.value.defaultValue : '',
            children: opt.value.children
        });
    }

    function disableOptional(opt) {
        if (!opt || !EDITOR || !EDITOR.toolbox || !EDITOR.toolbox.removeOptionalProperty) {
            return;
        }
        var children = (opt.value && opt.value.type === 'group') ? opt.value.children : undefined;
        EDITOR.toolbox.removeOptionalProperty(opt.name, children);
    }

    function openDrawer(opt) {
        if (!opt || !EDITOR || !EDITOR.toolbox || !EDITOR.toolbox.triggerRedrawForm) {
            return;
        }
        EDITOR.toolbox.triggerRedrawForm(opt.name, currentPayload.key, opt.value.children, 'initialize');
    }

    function bindUi() {
        if (bound) {
            return;
        }
        bound = true;

        $(document).on('click', '#modern-opt-collapse', function (e) {
            e.preventDefault();
            closeEastPane();
        });

        $(document).on('click', '#modern-opt-open', function (e) {
            e.preventDefault();
            openEastPane();
        });

        // Keep reopen button in sync if layout changes elsewhere
        $(window).on('resize', function () {
            syncEastOpenButton();
        });

        $(document).on('change', '#modern-optional-prefs [data-opt-toggle]', function () {
            var $input = $(this);
            var name = $input.attr('data-opt-toggle');
            var opt = findOpt(name);
            if (!opt) {
                return;
            }
            var on = $input.is(':checked');
            if (on) {
                enableOptional(opt);
                return;
            }

            // Keep switch on until remove is confirmed
            $input.prop('checked', true);
            var confirmed = true;
            var originalConfirm = window.confirm;
            window.confirm = function (msg) {
                confirmed = originalConfirm(msg);
                return confirmed;
            };
            try {
                disableOptional(opt);
            } finally {
                window.confirm = originalConfirm;
            }
            if (!confirmed) {
                $input.prop('checked', true);
            }
        });

        $(document).on('click', '#modern-optional-prefs .modern-opt-row--drawer', function (e) {
            e.preventDefault();
            var name = $(this).attr('data-opt-name');
            var opt = findOpt(name);
            if (opt) {
                openDrawer(opt);
            }
        });
    }

    // Expose removeOptionalProperty for modern toggles (not previously public)
    $(document).ready(function () {
        bindUi();
        ensureOpenButton();
        syncEastOpenButton();
        var tries = 0;
        var timer = setInterval(function () {
            tries++;
            syncEastOpenButton();
            if (EDITOR && EDITOR.toolbox) {
                clearInterval(timer);
            }
            if (tries > 50) {
                clearInterval(timer);
            }
        }, 100);
    });

    window.modernEditorRenderOptionalPrefs = function (payload) {
        bindUi();
        render(payload || { optional: [] });
    };

})(jQuery, window, document);
