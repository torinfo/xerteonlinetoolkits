/**
 * Modern LO editor — left panel page cards with iframe previews.
 * Replaces the visible jstree for toolkits-ui-theme-modern only.
 */
(function ($, window, document) {
    'use strict';

    if (!document.body || !document.body.classList.contains('toolkits-ui-theme-modern')) {
        return;
    }

    var previewToken = Date.now();
    var pendingInsertMode = null;
    var iframeObserver = null;
    var refreshTimer = null;
    var bound = false;
    var topbarReady = false;
    // Modern navigation state only; the underlying project tree is unchanged.
    var collapsedNodeIds = Object.create(null);
    var collapsedStateLoaded = false;

    var thumbnailEditTimer = null;
    var THUMBNAIL_EDIT_DELAY = 1500;

    var ckEditorFlushDepth = 0;

    function getTree() {
        return $.jstree.reference('#treeview');
    }

    function collapsedStorageKey() {
        var templateKey = typeof template_id !== 'undefined' && template_id
            ? template_id
            : 'unknown';
        return 'xerte-modern-editor-collapsed:' + String(templateKey);
    }

    function loadCollapsedNodeIds() {
        try {
            var storedValue = window.localStorage.getItem(collapsedStorageKey());
            var stored = JSON.parse(storedValue || '[]');
            var collapsed = Object.create(null);
            if (Array.isArray(stored)) {
                stored.forEach(function (nodeId) {
                    collapsed[nodeId] = true;
                });
            }
            return collapsed;
        } catch (e) {
            return Object.create(null);
        }
    }

    function saveCollapsedNodeIds() {
        try {
            window.localStorage.setItem(
                collapsedStorageKey(),
                JSON.stringify(Object.keys(collapsedNodeIds))
            );
        } catch (e) {
            // Navigation still works when browser storage is unavailable.
        }
    }

    function ensureCollapsedNodeIdsLoaded() {
        if (!collapsedStateLoaded) {
            collapsedNodeIds = loadCollapsedNodeIds();
            collapsedStateLoaded = true;
        }
    }

    function setAllNestedPagesCollapsed(collapse) {
        var tree = getTree();
        var root = tree && tree.get_node('treeroot');
        if (!root) {
            return;
        }
        ensureCollapsedNodeIdsLoaded();
        (root.children_d || []).forEach(function (nodeId) {
            var node = tree.get_node(nodeId);
            if (!node || !node.children || !node.children.length) {
                return;
            }
            if (collapse) {
                collapsedNodeIds[nodeId] = true;
            } else {
                delete collapsedNodeIds[nodeId];
            }
        });
        saveCollapsedNodeIds();
    }

    function hasCollapsedNestedPages() {
        var tree = getTree();
        var root = tree && tree.get_node('treeroot');
        if (!root) {
            return false;
        }
        ensureCollapsedNodeIdsLoaded();
        return (root.children_d || []).some(function (nodeId) {
            var node = tree.get_node(nodeId);
            return node && node.children && node.children.length && collapsedNodeIds[nodeId];
        });
    }

    function nestedPagesLabel(expand) {
        var lang = (typeof languagecodevariable !== 'undefined' && languagecodevariable)
            ? String(languagecodevariable)
            : '';
        if (lang.indexOf('nl') === 0) {
            return expand ? 'Alles uitvouwen' : 'Alles invouwen';
        }
        return expand ? 'Expand all' : 'Collapse all';
    }

    function pagesHeadingLabel() {
        var lang = (typeof languagecodevariable !== 'undefined' && languagecodevariable)
            ? String(languagecodevariable)
            : '';
        return lang.indexOf('nl') === 0 ? "Pagina's" : 'Pages';
    }

    function updateNestedPagesButton() {
        var $button = $('#modern-editor-pages-toggle-all');
        if (!$button.length) {
            return;
        }
        var tree = getTree();
        var root = tree && tree.get_node('treeroot');
        var hasBranches = !!(root && (root.children_d || []).some(function (nodeId) {
            var node = tree.get_node(nodeId);
            return node && node.children && node.children.length;
        }));
        var expand = hasCollapsedNestedPages();
        $button.text(nestedPagesLabel(expand))
            .attr('aria-label', nestedPagesLabel(expand))
            .prop('hidden', !hasBranches);
    }

    function getPageIds(tree) {
        var root = tree.get_node('treeroot');
        return root && root.children ? root.children.slice() : [];
    }

    // Page/LO names are often stored as HTML (e.g. coloured spans) — show plain text
    function plainText(value) {
        if (value == null || value === '') {
            return '';
        }
        return $('<div>').html(String(value)).text();
    }

    function getLoTitle() {
        var root = (typeof lo_data !== 'undefined') ? lo_data.treeroot : null;
        if (root && root.attributes) {
            var title = plainText(root.attributes.name || root.attributes.navigationName);
            return title || 'Learning Object';
        }
        return 'Learning Object';
    }

    function langLabel(path, fallback) {
        try {
            var parts = path.split('.');
            var cur = language;
            for (var i = 0; i < parts.length; i++) {
                if (!cur || cur[parts[i]] == null) {
                    return fallback;
                }
                cur = cur[parts[i]];
            }
            return cur || fallback;
        } catch (e) {
            return fallback;
        }
    }

    function getLogoSrc() {
        var $existing = $('body > .ui-layout-north .content img').first();
        if ($existing.length && $existing.attr('src')) {
            return $existing.attr('src');
        }
        return 'website_code/images/logo.png';
    }

    function syncLoTitles() {
        var title = getLoTitle();
        $('#modern-editor-lo-title').text(title);
        $('#modern-editor-topbar-title').text(title);
    }

    function shrinkNorthPane() {
        if (typeof xerte_layout !== 'undefined' && xerte_layout) {
            try {
                if (xerte_layout.options && xerte_layout.options.north) {
                    xerte_layout.options.north.minSize = 48;
                    xerte_layout.options.north.maxSize = 48;
                    xerte_layout.options.north.size = 48;
                    xerte_layout.options.north.spacing_open = 0;
                    xerte_layout.options.north.spacing_closed = 0;
                }
                if (xerte_layout.sizePane) {
                    xerte_layout.sizePane('north', 48);
                }
                // Layout plugin often enables overflow:auto on pane content
                $('body > .ui-layout-north, body > .ui-layout-north > .content')
                    .css({ overflow: 'hidden', height: '48px', maxHeight: '48px' });
            } catch (e) {
                // layout may not be ready
            }
        }
    }

    function disableModernResizers() {
        if (typeof xerte_layout === 'undefined' || !xerte_layout) {
            return;
        }
        try {
            ['north', 'south', 'west', 'east'].forEach(function (pane) {
                if (!xerte_layout.options || !xerte_layout.options[pane]) {
                    return;
                }
                xerte_layout.options[pane].resizable = false;
                xerte_layout.options[pane].spacing_open = 0;
                xerte_layout.options[pane].spacing_closed = 0;
                xerte_layout.options[pane].togglerLength_open = 0;
                xerte_layout.options[pane].togglerLength_closed = 0;
            });
            // Left panel stays open — no close/hide control in modern
            if (xerte_layout.options.west) {
                xerte_layout.options.west.closable = false;
                xerte_layout.options.west.slidable = false;
            }
            if (typeof xerte_layout.resizeAll === 'function') {
                xerte_layout.resizeAll();
            }
            $('body > .ui-layout-resizer').hide();
            $('#west-closer').hide();
        } catch (e) {
            // ignore
        }
    }

    function modernizeFooterCheckboxes() {
        var $box = $('#parameter_checkboxes');
        if (!$box.length) {
            pinCenterFooter();
            return;
        }

        $box.addClass('modern-footer-checks');
        $('#main_footer').addClass('modern-main-footer');

        var $inputs = $box.children('input[type="checkbox"]').toArray();
        $inputs.forEach(function (input) {
            var $input = $(input);
            var id = $input.attr('id');
            var $oldLabel = $box.children('label[for="' + id + '"]');
            if (!$oldLabel.length) {
                return;
            }
            var title = $oldLabel.text();
            var labelClass = $oldLabel.attr('class') || '';
            var $wrap = $('<label class="modern-footer-check"></label>').attr('for', id);
            var $title = $('<span></span>')
                .attr('id', id + '_span')
                .attr('class', 'modern-footer-check__title ' + labelClass)
                .text(title);

            $oldLabel.remove();
            $input.addClass('modern-checkbox');
            $wrap.append($input).append($title);
            $box.append($wrap);
        });

        pinCenterFooter();
    }

    function pinCenterFooter() {
        if (typeof xerte_layout === 'undefined' || !xerte_layout) {
            return;
        }
        try {
            // Recalc center content height so the footer stays docked at the bottom
            if (typeof xerte_layout.resizeContent === 'function') {
                xerte_layout.resizeContent('center');
            } else if (typeof xerte_layout.resizeAll === 'function') {
                xerte_layout.resizeAll();
            }
        } catch (e) {
            // ignore
        }
        // Layout resize can fire scroll → classic hideInlineEditor; restore editors after
        setTimeout(reviveModernCkEditors, 0);
    }

    // Commit wizard field values into lo_data (plain inputs + CKEditor).
    // Classic relies on change-on-blur / scroll→hideInlineEditor; modern must flush without hiding toolbars.
    function flushCkEditorInstance(editor) {
        if (!editor || typeof editor.fire !== 'function') {
            return;
        }

        /*
         * Modern sometimes fires CKEditor's change event artificially
         * just to commit its current value to lo_data.
         *
         * That should NOT regenerate a thumbnail, as doing so for essentially each keystroke is excessive.
         */
        ckEditorFlushDepth++;

        try {
            editor.fire('change');
        } catch (e) {
            // ignore
        } finally {
            ckEditorFlushDepth--;
        }
    }

    function ensureCkEditorBlurFlush(editor) {
        if (!editor || editor.__modernBlurFlushBound) {
            return;
        }

        editor.__modernBlurFlushBound = true;

        /*
         * commit CKEditor when it loses focus.
         */
        editor.on('blur', function () {
            flushCkEditorInstance(this);
        });

        /*
         * CKEditor does not produce a normal DOM input/change event
         * on #mainPanel, so the thumbnail listener never sees it.
         *
         * Xerte itself already listens to this same CKEditor change event
         * and updates lo_data through inputChanged().
         *
         * We schedule the thumbnail refresh as well.
         */
        editor.on('change', function () {

            /*
             * Ignore change events generated by flushCkEditorInstance().
             */
            if (ckEditorFlushDepth > 0) {
                return;
            }

            scheduleCurrentPageThumbnailRefresh();
        });
    }

    function flushModernEditorFields() {
        // Plain wizard controls: change fires on blur in Nottingham; force commit here too.
        $('#mainPanel input, #mainPanel textarea').each(function () {
            var $el = $(this);
            if ($el.is(':disabled') || $el.attr('type') === 'checkbox' || $el.attr('type') === 'radio' ||
                $el.attr('type') === 'file' || $el.attr('type') === 'button' || $el.attr('type') === 'submit' ||
                $el.hasClass('cke_source')) {
                return;
            }
            try {
                $el.trigger('change');
            } catch (e) {
                // ignore
            }
        });
        $('#mainPanel input[type="number"]').each(function () {
            try {
                $(this).trigger('blur');
            } catch (e2) {
                // ignore
            }
        });

        if (typeof CKEDITOR === 'undefined') {
            return;
        }
        for (var name in CKEDITOR.instances) {
            if (Object.prototype.hasOwnProperty.call(CKEDITOR.instances, name)) {
                flushCkEditorInstance(CKEDITOR.instances[name]);
            }
        }
    }

    // Classic editor hides inline CKEditor toolbars on scroll and never shows them again.
    // Modern keeps toolbars visible but still flushes values (same role as change-on-blur).
    function patchModernCkEditorBehavior() {
        if (typeof EDITOR === 'undefined' || !EDITOR.toolbox) {
            return;
        }
        if (EDITOR.toolbox.__modernHideInlinePatched) {
            return;
        }
        EDITOR.toolbox.__modernHideInlinePatched = true;
        EDITOR.toolbox.hideInlineEditor = function () {
            flushModernEditorFields();
        };
    }

    function reviveModernCkEditors() {
        if (typeof CKEDITOR === 'undefined') {
            return;
        }
        $('#mainPanel .inlinewysiwyg, #mainPanel .cke_editable').each(function () {
            var el = this;
            var id = el.id;
            if (!id) {
                return;
            }
            try {
                $(el).attr('contenteditable', 'true');
                $('#cke_' + id).show();
                if (CKEDITOR.instances[id]) {
                    CKEDITOR.instances[id].setReadOnly(false);
                    ensureCkEditorBlurFlush(CKEDITOR.instances[id]);
                }
            } catch (e) {
                // ignore
            }
        });
        // Editors that failed to replace while layout was settling
        function needsCkRetry(opts) {
            if (!opts || !opts.length) {
                return false;
            }
            var needs = false;
            $.each(opts, function (i, opt) {
                if (opt && opt.id && !CKEDITOR.instances[opt.id] && $('#' + opt.id).length &&
                    (!$('#' + opt.id).closest('.table_holder').length || $('#' + opt.id).closest('.table_holder').is(':visible'))) {
                    needs = true;
                }
            });
            return needs;
        }
        if (EDITOR && EDITOR.toolbox) {
            if (typeof textareas_options !== 'undefined' && needsCkRetry(textareas_options) &&
                typeof EDITOR.toolbox.convertTextAreas === 'function') {
                try {
                    EDITOR.toolbox.convertTextAreas();
                } catch (e2) {
                    // ignore
                }
            }
            if (typeof textinputs_options !== 'undefined' && needsCkRetry(textinputs_options) &&
                typeof EDITOR.toolbox.convertTextInputs === 'function') {
                try {
                    EDITOR.toolbox.convertTextInputs();
                } catch (e3) {
                    // ignore
                }
            }
        }
        for (var name in CKEDITOR.instances) {
            if (Object.prototype.hasOwnProperty.call(CKEDITOR.instances, name)) {
                ensureCkEditorBlurFlush(CKEDITOR.instances[name]);
            }
        }
    }

    function isWorkspaceWindowMode() {
        var prefs = (typeof window.user_preferences !== 'undefined' && window.user_preferences)
            ? window.user_preferences
            : null;
        return !!(prefs && prefs.editor_open_mode === '_self');
    }

    function goHome() {
        if (typeof site_url !== 'undefined' && site_url) {
            window.location.href = site_url;
            return;
        }
        if (window.opener && !window.opener.closed) {
            try {
                window.opener.focus();
            } catch (e) { /* ignore */ }
            window.close();
        }
    }

    function triggerClassicButton(id, sourceEvent, overrides) {
        var $btn = $('#' + id);
        if ($btn.length) {
            var eventProps = {
                altKey: !!(sourceEvent && sourceEvent.altKey),
                ctrlKey: !!(sourceEvent && sourceEvent.ctrlKey),
                metaKey: !!(sourceEvent && sourceEvent.metaKey),
                shiftKey: !!(sourceEvent && sourceEvent.shiftKey)
            };
            if (overrides) {
                $.extend(eventProps, overrides);
            }
            $btn.trigger($.Event('click', eventProps));
        }
    }

    function ensureTopbar() {
        var $northContent = $('body > .ui-layout-north > .content');
        if (!$northContent.length) {
            return null;
        }
        if (typeof language === 'undefined') {
            return null;
        }
        if ($northContent.find('#modern-editor-topbar').length) {
            syncLoTitles();
            shrinkNorthPane();
            return $northContent.find('#modern-editor-topbar');
        }

        var logoSrc = getLogoSrc();
        // Always "Preview" in modern; en-GB wizard label is historically "Play"
        var previewLabel = 'Preview';
        var previewTip = langLabel('btnPreview.$tooltip', previewLabel);
        var saveLabel = langLabel('btnSaveXerte.$label', 'Save');
        var saveTip = langLabel('btnPublishXot.$tooltip', saveLabel);
        var showWorkspaceChrome = isWorkspaceWindowMode();
        var homeHtml = showWorkspaceChrome
            ? (
                '<button type="button" class="modern-editor-topbar__home" id="modern-editor-home" title="Home" aria-label="Home">' +
                    '<i class="fa fa-home" aria-hidden="true"></i>' +
                '</button>'
            )
            : '';
        var userHtml = '';
        if (showWorkspaceChrome && typeof window.toolkitsModernTopbarUserMenuHtml === 'function') {
            userHtml = window.toolkitsModernTopbarUserMenuHtml(window.toolkits_index_config || {});
        }

        $northContent.empty().append(
            '<div id="modern-editor-topbar" class="modern-editor-topbar">' +
                '<div class="modern-editor-topbar__left">' +
                    '<img class="modern-editor-topbar__logo" src="' + logoSrc + '" alt="Xerte" />' +
                    homeHtml +
                '</div>' +
                '<div class="modern-editor-topbar__title" id="modern-editor-topbar-title"></div>' +
                '<div class="modern-editor-topbar__right">' +
                    '<button type="button" class="modern-editor-topbar__btn modern-editor-topbar__btn--preview" id="modern-editor-preview" title="' + previewTip + '">' +
                        '<i class="fa fa-eye" aria-hidden="true"></i>' +
                        '<span>' + previewLabel + '</span>' +
                    '</button>' +
                    '<button type="button" class="modern-editor-topbar__btn modern-editor-topbar__btn--save" id="modern-editor-save" title="' + saveTip + '">' +
                        '<i class="fa fa-save" aria-hidden="true"></i>' +
                        '<span>' + saveLabel + '</span>' +
                    '</button>' +
                    userHtml +
                '</div>' +
            '</div>'
        );

        if (showWorkspaceChrome && typeof window.toolkitsModernEnsureEditorUserShell === 'function') {
            window.toolkitsModernEnsureEditorUserShell();
        }

        topbarReady = true;
        syncLoTitles();
        shrinkNorthPane();
        return $northContent.find('#modern-editor-topbar');
    }

    function getPageLinkId(nodeId) {
        if (
            typeof lo_data === 'undefined' ||
            !lo_data[nodeId] ||
            !lo_data[nodeId].attributes
        ) {
            return '';
        }

        return lo_data[nodeId].attributes.linkID || '';
    }

    function getPageLabel(nodeId) {
        var data = (typeof lo_data !== 'undefined') ? lo_data[nodeId] : null;
        if (!data || !data.attributes) {
            return nodeId;
        }
        // Card header = page title (Page Title field)
        var title = plainText(data.attributes.name || '');
        if (title) {
            return title;
        }
        var nodeName = data.attributes.nodeName;
        if (typeof wizard_data !== 'undefined' && wizard_data[nodeName] &&
            wizard_data[nodeName].menu_options && wizard_data[nodeName].menu_options.menuItem) {
            return plainText(wizard_data[nodeName].menu_options.menuItem);
        }
        return nodeName || nodeId;
    }

    function getChildTitle(childId, index) {
        var data = (typeof lo_data !== 'undefined') ? lo_data[childId] : null;
        var nodeName = data && data.attributes ? data.attributes.nodeName : '';
        var attributes = data && data.attributes ? data.attributes : {};
        var titleFields = ['name', 'title', 'prompt', 'question', 'answer', 'text', 'label'];
        for (var i = 0; i < titleFields.length; i++) {
            var title = plainText(attributes[titleFields[i]] || '').trim();
            if (title) {
                return title;
            }
        }
        if (data && data.data) {
            var dataTitle = plainText(data.data).trim();
            if (dataTitle) {
                return dataTitle;
            }
        }
        var menuItem = '';
        if (typeof wizard_data !== 'undefined' && wizard_data[nodeName] &&
            wizard_data[nodeName].menu_options && wizard_data[nodeName].menu_options.menuItem) {
            menuItem = plainText(wizard_data[nodeName].menu_options.menuItem);
        }
        if (!menuItem) {
            menuItem = nodeName || 'Item';
        }
        return menuItem + ' ' + (index + 1);
    }

    function getChildBadge(childId) {
        var data = (typeof lo_data !== 'undefined') ? lo_data[childId] : null;
        if (!data || !data.attributes || !data.attributes.type) {
            return '';
        }
        var type = plainText(data.attributes.type);
        var lang = (typeof languagecodevariable !== 'undefined' && languagecodevariable)
            ? String(languagecodevariable)
            : '';
        if (lang.indexOf('nl') === 0) {
            if (type === 'Single Answer') {
                return 'Eén antwoord';
            }
            if (type === 'Multiple Answer') {
                return 'Meerdere antwoorden';
            }
        }
        return type;
    }

    function incompleteLabel() {
        var lang = (typeof languagecodevariable !== 'undefined' && languagecodevariable)
            ? String(languagecodevariable)
            : '';
        return lang.indexOf('nl') === 0 ? 'Nog niet ingevuld' : 'Not yet filled in';
    }

    function optionApplies(option, nodeId) {
        if (!option.condition || !EDITOR.toolbox || !EDITOR.toolbox.evaluateCondition) {
            return true;
        }
        try {
            return EDITOR.toolbox.evaluateCondition(option.condition, nodeId);
        } catch (e) {
            // Do not show a warning when a condition cannot be evaluated safely.
            return false;
        }
    }

    function optionGroupApplies(option, nodeId, nodeOptions, attributes) {
        var groupName = option.value && option.value.group;
        if (!groupName) {
            return true;
        }
        var options = nodeOptions.all || [];
        var group = null;
        var groupHasStoredValue = false;
        for (var i = 0; i < options.length; i++) {
            if (options[i].name === groupName && options[i].value.type === 'group') {
                group = options[i];
            }
            if (options[i].value.group === groupName &&
                Object.prototype.hasOwnProperty.call(attributes, options[i].name)) {
                groupHasStoredValue = true;
            }
        }
        if (!group) {
            return true;
        }
        if (!optionApplies(group.value, nodeId)) {
            return false;
        }
        if (group.value.optional === 'true' && !groupHasStoredValue) {
            return false;
        }
        return optionGroupApplies(group, nodeId, nodeOptions, attributes);
    }

    function isRequiredOptionEmpty(option, nodeId, nodeOptions, attributes) {
        var rules = option.value || {};
        var required = rules.mandatory === true || rules.mandatory === 'true';
        var verification = rules.verification || '';
        if (!required && !verification) {
            return false;
        }
        if (!optionApplies(rules, nodeId)) {
            return false;
        }
        if (!optionGroupApplies(option, nodeId, nodeOptions, attributes)) {
            return false;
        }

        var attribute = EDITOR.toolbox.getAttributeValue(
            attributes,
            option.name,
            nodeOptions,
            nodeId
        );
        if (rules.optional === 'true' && !attribute.found) {
            return false;
        }
        var value = attribute.found ? attribute.value : rules.defaultValue;
        value = value == null ? '' : plainText(value).trim();

        if (required && value === '') {
            return true;
        }
        if (verification) {
            try {
                return !(new RegExp(verification)).test(value);
            } catch (e) {
                // An invalid schema expression should not produce a false warning.
                return false;
            }
        }
        return false;
    }

    function isChildIncomplete(childId) {
        var data = (typeof lo_data !== 'undefined') ? lo_data[childId] : null;
        var nodeName = data && data.attributes ? data.attributes.nodeName : '';
        var definition = (typeof wizard_data !== 'undefined') ? wizard_data[nodeName] : null;
        var nodeOptions = definition && definition.node_options;
        var options = nodeOptions && nodeOptions.all ? nodeOptions.all : [];

        if (!data || !data.attributes || !EDITOR.toolbox ||
            !EDITOR.toolbox.getAttributeValue || !options.length) {
            return false;
        }

        for (var i = 0; i < options.length; i++) {
            var option = options[i];
            if (option && option.value &&
                isRequiredOptionEmpty(option, childId, nodeOptions, data.attributes)) {
                return true;
            }
        }
        return false;
    }

    function getTopLevelPageId(tree, nodeId) {
        if (!tree || !nodeId || nodeId === 'treeroot') {
            return null;
        }
        var walk = nodeId;
        while (walk && walk !== 'treeroot' && tree.get_parent(walk) !== 'treeroot') {
            walk = tree.get_parent(walk);
        }
        return (walk && walk !== 'treeroot') ? walk : null;
    }

    // Completion is derived from each node type's XWD requirements. Do not infer
    // it from generic field names: descendants/sub-nodes store their content differently i.e. 'prompt', 'text', etc.
    function buildChildrenHtml(tree, parentId, selectedId, depth) {
        var node = tree.get_node(parentId);
        var children = node && node.children ? node.children : [];
        if (!children.length) {
            return '';
        }
        depth = depth || 0;
        var containerClass = depth === 0
            ? 'modern-editor-page__children'
            : 'modern-editor-child__children';
        var html = '<div class="' + containerClass + '">';
        children.forEach(function (childId, index) {
            var childNode = tree.get_node(childId);
            var hasChildren = !!(childNode && childNode.children && childNode.children.length);
            var collapsed = hasChildren && collapsedNodeIds[childId];
            var active = childId === selectedId ? ' modern-editor-child--active' : '';
            var collapsedClass = collapsed ? ' modern-editor-child--collapsed' : '';
            var badge = getChildBadge(childId);
            var incomplete = isChildIncomplete(childId);
            html += '<div class="modern-editor-child' + active + collapsedClass + '" data-node-id="' + childId + '" data-sibling-index="' + index + '">' +
                '<div class="modern-editor-child__row">' +
                    (hasChildren
                        ? '<button type="button" class="modern-editor-child__toggle" aria-label="Toggle nested items" aria-expanded="' + (!collapsed) + '"><i class="fa fa-chevron-down" aria-hidden="true"></i></button>'
                        : '<span class="modern-editor-child__toggle-spacer" aria-hidden="true"></span>') +
                    '<button type="button" class="modern-editor-child__select"><span class="modern-editor-child__title"></span>' +
                        (badge ? '<span class="modern-editor-child__badge"></span>' : '') +
                    '</button>' +
                '</div>' +
                (incomplete ? '<div class="modern-editor-child__status"></div>' : '') +
                (hasChildren ? buildChildrenHtml(tree, childId, selectedId, depth + 1) : '') +
            '</div>';
        });
        html += '</div>';
        return html;
    }

    function revealNodePath(tree, nodeId) {
        // Reveal the node itself without changing whether its own children are open.
        var walk = tree.get_parent(nodeId);
        var changed = false;
        while (walk && walk !== 'treeroot') {
            changed = changed || !!collapsedNodeIds[walk];
            delete collapsedNodeIds[walk];
            walk = tree.get_parent(walk);
        }
        if (changed) {
            saveCollapsedNodeIds();
        }
    }

    function previewUrl(pageIndex1Based) {
        return site_url + 'preview.php?template_id=' + template_id +
            '&_t=' + previewToken + '#page' + pageIndex1Based;
    }

    function ensureShell() {
        var $west = $('body > .ui-layout-west');
        var $content = $west.children('.content');
        if (!$content.length) {
            return null;
        }
        if (!$content.find('#modern-editor-pages').length) {
            $content.prepend(
                '<div id="modern-editor-pages" class="modern-editor-pages">' +
                    '<button type="button" class="modern-editor-pages__title" id="modern-editor-lo-title" title="Learning Object settings"></button>' +
                    '<div class="modern-editor-pages__toolbar">' +
                        '<span class="modern-editor-pages__heading">' + pagesHeadingLabel() + '</span>' +
                        '<button type="button" class="modern-editor-pages__toggle-all" id="modern-editor-pages-toggle-all"></button>' +
                    '</div>' +
                    '<div class="modern-editor-pages__list" id="modern-editor-pages-list"></div>' +
                '</div>'
            );
        } else {
            var $title = $content.find('#modern-editor-lo-title');
            if ($title.length && !$title.is('button')) {
                var text = $title.text();
                var $btn = $('<button type="button" class="modern-editor-pages__title" id="modern-editor-lo-title" title="Learning Object settings"></button>');
                $btn.text(text);
                $title.replaceWith($btn);
            }
            if (!$content.find('#modern-editor-pages-toggle-all').length) {
                $content.find('#modern-editor-pages-list').before(
                    '<div class="modern-editor-pages__toolbar">' +
                        '<span class="modern-editor-pages__heading">' + pagesHeadingLabel() + '</span>' +
                        '<button type="button" class="modern-editor-pages__toggle-all" id="modern-editor-pages-toggle-all"></button>' +
                    '</div>'
                );
            }
        }
        return $content.find('#modern-editor-pages');
    }

    function closeMenus() {
        $('.modern-editor-page__dropdown').removeClass('is-open');
        $('#modern-editor-user-menu').removeClass('is-open');
        $('#modern-editor-user-toggle').attr('aria-expanded', 'false');
    }

    function buildInsertHtml(insertIndex) {
        return '<div class="modern-editor-insert" data-insert-index="' + insertIndex + '">' +
            '<hr class="modern-editor-insert__line" />' +
            '<button type="button" class="modern-editor-insert__btn" title="Add page" aria-label="Add page">' +
                '<i class="fa fa-plus" aria-hidden="true"></i>' +
            '</button>' +
        '</div>';
    }

    function buildCardHtml(tree, nodeId, pageNum, selectedId) {
        var topSelected = getTopLevelPageId(tree, selectedId) || selectedId;
        var active = nodeId === topSelected ? ' modern-editor-page--active' : '';
        var node = tree.get_node(nodeId);
        var hasChildren = !!(node && node.children && node.children.length);
        var collapsed = hasChildren && collapsedNodeIds[nodeId];
        var collapsedClass = collapsed ? ' modern-editor-page--children-collapsed' : '';

        return '<div class="modern-editor-page' + active + collapsedClass + '" data-node-id="' + nodeId + '" data-page-num="' + pageNum + '" role="button" tabindex="0">' +
                '<div class="modern-editor-page__head">' +
                    (hasChildren
                        ? '<button type="button" class="modern-editor-page__toggle" aria-label="Toggle nested pages" aria-expanded="' + (!collapsed) + '"><i class="fa fa-chevron-down" aria-hidden="true"></i></button>'
                        : '') +
                    '<span class="modern-editor-page__label"></span>' +
                    '<div class="modern-editor-page__menu-wrap">' +
                        '<button type="button" class="modern-editor-page__menu" aria-label="Page options" aria-haspopup="true" aria-expanded="false">' +
                            '<i class="fa fa-ellipsis-v" aria-hidden="true"></i>' +
                        '</button>' +
                        '<div class="modern-editor-page__dropdown" role="menu">' +
                            '<button type="button" data-action="duplicate" role="menuitem">Duplicate</button>' +
                            '<button type="button" class="is-danger" data-action="delete" role="menuitem">Delete</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="modern-editor-page__body">' +
                    '<span class="modern-editor-page__num">' + pageNum + '</span>' +
                    '<div class="modern-editor-page__preview">' +
                        '<div class="modern-editor-page__thumbnail-placeholder">' +
                            '<i class="fa fa-image" aria-hidden="true"></i>' +
                            '<span>Generating thumbnail...</span>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                buildChildrenHtml(tree, nodeId, selectedId) +
            '</div>';
    }

    function observeIframes($list) {
        if (iframeObserver) {
            iframeObserver.disconnect();
        }
        if (!('IntersectionObserver' in window)) {
            $list.find('.modern-editor-page__iframe').each(function () {
                var $iframe = $(this);
                if (!$iframe.attr('src') && $iframe.attr('data-src')) {
                    $iframe.attr('src', $iframe.attr('data-src'));
                }
            });
            return;
        }
        iframeObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) {
                    return;
                }
                var iframe = entry.target;
                var src = iframe.getAttribute('data-src');
                if (src && iframe.getAttribute('src') !== src) {
                    iframe.setAttribute('src', src);
                }
            });
        }, {
            root: $('body > .ui-layout-west > .content').get(0),
            rootMargin: '80px 0px',
            threshold: 0.01
        });
        $list.find('.modern-editor-page__iframe').each(function () {
            iframeObserver.observe(this);
        });
    }

    function applyStoredThumbnails($list) {

        if (
            !window.modernEditorThumbnails ||
            typeof window.modernEditorThumbnails.loadStatus !== 'function'
        ) {
            return;
        }

        window.modernEditorThumbnails.loadStatus(
            template_id,
            function (err, thumbnails) {

                if (err) {
                    console.warn(
                        'Unable to load stored thumbnails:',
                        err
                    );
                    return;
                }

                $list.find('.modern-editor-page').each(function () {

                    var $card = $(this);

                    var treeId =
                        $card.attr('data-node-id');

                    var pageNum = parseInt(
                        $card.attr('data-page-num'),
                        10
                    );

                    var pageLinkId =
                        getPageLinkId(treeId);

                    if (!pageLinkId) {
                        return;
                    }

                    var thumbnail =
                        thumbnails[pageLinkId];

                    /*
                     * We already have a cached thumbnail.
                     */
                    if (thumbnail) {

                        setCardThumbnail(
                            $card,
                            pageLinkId,
                            pageNum,
                            thumbnail.revision
                        );

                        return;
                    }

                    /*
                     * Missing thumbnail.
                     *
                     * Leave the placeholder visible and queue this
                     * page for the single hidden renderer.
                     */
                    var revision =
                        'auto-' + Date.now();

                    window.modernEditorThumbnails.queuePageThumbnail(
                        {
                            templateId: template_id,
                            pageLinkId: pageLinkId,
                            pageIndex: pageNum,
                            revision: revision
                        },
                        function (generateErr) {

                            if (generateErr) {
                                console.warn(
                                    'Thumbnail generation failed:',
                                    pageLinkId,
                                    generateErr
                                );

                                markThumbnailFailed(
                                    pageLinkId
                                );

                                return;
                            }

                            /*
                             * renderPages() may have rebuilt the cards
                             * while this thumbnail was being generated,
                             * so locate the CURRENT card again.
                             */
                            var $currentCard =
                                findCardByPageLinkId(
                                    pageLinkId
                                );

                            if (!$currentCard.length) {
                                return;
                            }

                            setCardThumbnail(
                                $currentCard,
                                pageLinkId,
                                pageNum,
                                revision
                            );
                        }
                    );
                });
            }
        );
    }

    function findCardByPageLinkId(pageLinkId) {
        var $found = $();

        $('#modern-editor-pages-list .modern-editor-page')
            .each(function () {

                var $card = $(this);

                var treeId =
                    $card.attr('data-node-id');

                if (
                    getPageLinkId(treeId) ===
                    pageLinkId
                ) {
                    $found = $card;

                    return false;
                }
            });

        return $found;
    }

    function setCardThumbnail(
        $card,
        pageLinkId,
        pageNum,
        revision
    ) {
        if (!$card || !$card.length) {
            return;
        }

        var imageUrl =
            window.modernEditorThumbnails.getImageUrl(
                template_id,
                pageLinkId,
                revision
            );

        var $img = $('<img>')
            .addClass(
                'modern-editor-page__thumbnail'
            )
            .attr({
                src: imageUrl,
                alt: 'Page ' + pageNum + ' thumbnail',
                loading: 'lazy'
            });

        $card
            .find('.modern-editor-page__preview')
            .empty()
            .append($img);
    }

    function markThumbnailFailed(pageLinkId) {
        var $card =
            findCardByPageLinkId(pageLinkId);

        if (!$card.length) {
            return;
        }

        $card
            .find(
                '.modern-editor-page__thumbnail-placeholder span'
            )
            .text('Thumbnail unavailable');
    }

    function refreshPageThumbnail(treeId) {

        if (
            !treeId ||
            !window.modernEditorThumbnails
        ) {
            return;
        }

        var tree =
            $.jstree.reference('#treeview');

        if (!tree) {
            return;
        }


        /*
         * treeId may identify a nested Xerte item rather than the
         * top-level page. The thumbnail represents the whole page,
         * so walk up to the top-level page.
         */
        var topPageId =
            getTopLevelPageId(
                tree,
                treeId
            );

        if (!topPageId) {
            return;
        }


        var pageLinkId =
            getPageLinkId(topPageId);

        if (!pageLinkId) {
            return;
        }


        var root =
            tree.get_node('treeroot');

        if (!root || !root.children) {
            return;
        }


        var index =
            root.children.indexOf(topPageId);

        if (index < 0) {
            return;
        }

        /*
         * preview.php uses 1-based page numbers.
         */
        var pageNum = index + 1;

        var revision =
            'edit-' + Date.now();


        /*
         * First save current lo_data to preview.xml.
         *
         * Otherwise preview.php could render the previous version
         * of the page.
         */
        saveCurrentPreview(function (saveErr) {

            if (saveErr) {
                console.warn(
                    'Unable to save preview before thumbnail update:',
                    saveErr
                );
                return;
            }


            window.modernEditorThumbnails
                .queuePageThumbnail(
                    {
                        templateId: template_id,
                        pageLinkId: pageLinkId,
                        pageIndex: pageNum,
                        revision: revision,

                        /*
                         * A cached thumbnail already exists, but
                         * we're explicitly regenerating it.
                         */
                        force: true
                    },

                    function (generateErr) {

                        if (generateErr) {
                            console.warn(
                                'Unable to regenerate thumbnail:',
                                pageLinkId,
                                generateErr
                            );
                            return;
                        }


                        /*
                         * Keep the existing thumbnail visible until
                         * the replacement is ready.
                         */
                        var $card =
                            findCardByPageLinkId(
                                pageLinkId
                            );

                        if (!$card.length) {
                            return;
                        }


                        setCardThumbnail(
                            $card,
                            pageLinkId,
                            pageNum,
                            revision
                        );
                    }
                );
        });
    }

    function scheduleCurrentPageThumbnailRefresh() {

        if (thumbnailEditTimer) {
            clearTimeout(
                thumbnailEditTimer
            );
        }

        thumbnailEditTimer =
            setTimeout(function () {

                thumbnailEditTimer = null;

                var tree =
                    $.jstree.reference('#treeview');

                if (!tree) {
                    return;
                }

                var selected =
                    tree.get_selected();

                if (
                    !selected ||
                    !selected.length
                ) {
                    return;
                }

                refreshPageThumbnail(
                    selected[0]
                );

            }, THUMBNAIL_EDIT_DELAY);
    }

    function renderPages(options) {
        options = options || {};
        var tree = getTree();
        if (!tree) {
            return;
        }
        var $shell = ensureShell();
        if (!$shell) {
            return;
        }
        ensureCollapsedNodeIdsLoaded();

        var pageIds = getPageIds(tree);
        var selected = tree.get_selected();
        var selectedId = selected.length ? selected[0] : null;

        syncLoTitles();

        var $list = $('#modern-editor-pages-list');
        var html = buildInsertHtml(0);
        pageIds.forEach(function (nodeId, index) {
            html += buildCardHtml(tree, nodeId, index + 1, selectedId);
            html += buildInsertHtml(index + 1);
        });
        $list.html(html);
        updateNestedPagesButton();

        $list.find('.modern-editor-page').each(function () {
            var $card = $(this);
            var pageId = $card.attr('data-node-id');
            $card.find('.modern-editor-page__label').text(getPageLabel(pageId));

            $card.find('.modern-editor-child').each(function () {
                var $child = $(this);
                var childId = $child.attr('data-node-id');
                var childIndex = parseInt($child.attr('data-sibling-index'), 10) || 0;
                $child.children('.modern-editor-child__row').find('.modern-editor-child__title').text(getChildTitle(childId, childIndex));
                var badge = getChildBadge(childId);
                if (badge) {
                    $child.children('.modern-editor-child__row').find('.modern-editor-child__badge').text(badge);
                }
                if (isChildIncomplete(childId)) {
                    $child.children('.modern-editor-child__status').text(incompleteLabel());
                }
            });
        });

        //observeIframes($list);

        applyStoredThumbnails($list);

        if (options.refreshPreviews) {
            schedulePreviewRefresh();
        }
    }

    function schedulePreviewRefresh() {
        if (refreshTimer) {
            clearTimeout(refreshTimer);
        }
        refreshTimer = setTimeout(function () {
            refreshTimer = null;
            savePreviewAndReloadIframes();
        }, 400);
    }

    function saveCurrentPreview(callback) {

        flushModernEditorFields();

        if (
            typeof EDITOR === 'undefined' ||
            !EDITOR.tree ||
            !EDITOR.tree.build_json
        ) {
            if (typeof callback === 'function') {
                callback(
                    new Error('Unable to build preview data')
                );
            }
            return;
        }

        if (
            typeof merged !== 'undefined' &&
            merged === true
        ) {
            if (typeof callback === 'function') {
                callback(
                    new Error('Merged editor cannot save preview')
                );
            }
            return;
        }

        var json =
            EDITOR.tree.build_json('treeroot');

        var apiBase =
            (typeof rest_api_url !== 'undefined' && rest_api_url)
                ? rest_api_url
                : 'website_code/api/v1/index.php';

        $.ajax({
            url: apiBase + '?route=learning-objects/save',

            data: {
                fileupdate: 0,
                filename: previewxmlurl,
                lo_data: encodeURIComponent(
                    JSON.stringify(json)
                ),
                absmedia: rlourlvariable,
                template_id: template_id
            },

            dataType: 'json',
            type: 'POST',
            cache: false

        }).done(function () {

            if (typeof callback === 'function') {
                callback(null);
            }

        }).fail(function (xhr) {

            if (typeof callback === 'function') {
                callback(
                    new Error(
                        'Unable to save thumbnail preview data'
                    )
                );
            }
        });
    }

    function savePreviewAndReloadIframes() {
        flushModernEditorFields();
        if (typeof EDITOR === 'undefined' || !EDITOR.tree || !EDITOR.tree.build_json) {
            reloadIframeSources();
            return;
        }
        if (typeof merged !== 'undefined' && merged === true) {
            return;
        }
        var json = EDITOR.tree.build_json('treeroot');
        var apiBase = (typeof rest_api_url !== 'undefined' && rest_api_url) ? rest_api_url : 'website_code/api/v1/index.php';
        $.ajax({
            url: apiBase + '?route=learning-objects/save',
            data: {
                fileupdate: 0,
                filename: previewxmlurl,
                lo_data: encodeURIComponent(JSON.stringify(json)),
                absmedia: rlourlvariable,
                template_id: template_id
            },
            dataType: 'json',
            type: 'POST',
            cache: false
        }).always(function () {
            reloadIframeSources();
        });
    }

    function reloadIframeSources() {
        previewToken = Date.now();
        $('#modern-editor-pages-list .modern-editor-page__iframe').each(function () {
            var $iframe = $(this);
            var pageNum = $iframe.closest('.modern-editor-page').attr('data-page-num');
            var url = previewUrl(pageNum);
            $iframe.attr('data-src', url);
            if ($iframe.attr('src')) {
                $iframe.attr('src', url);
            }
        });
    }

    function selectPage(nodeId) {
        var tree = getTree();
        if (!tree || !nodeId) {
            return;
        }
        flushModernEditorFields();
        tree.deselect_all();
        tree.select_node(nodeId);
        $('#modern-editor-lo-title').removeClass('is-active');
        $('#modern-editor-pages-list .modern-editor-page')
            .removeClass('modern-editor-page--active')
            .filter('[data-node-id="' + nodeId + '"]')
            .addClass('modern-editor-page--active');
    }

    function selectLoRoot() {
        var tree = getTree();
        if (!tree) {
            return;
        }
        flushModernEditorFields();
        tree.deselect_all();
        tree.select_node('treeroot');
        $('#modern-editor-pages-list .modern-editor-page').removeClass('modern-editor-page--active');
        $('#modern-editor-pages-list .modern-editor-child').removeClass('modern-editor-child--active');
        $('#modern-editor-lo-title').addClass('is-active');
    }

    function openInsertMenu($btn, insertIndex) {
        var tree = getTree();
        if (!tree) {
            return;
        }
        flushModernEditorFields();
        var pageIds = getPageIds(tree);
        tree.deselect_all();

        if (!pageIds.length) {
            tree.select_node('treeroot');
            pendingInsertMode = 'after';
        } else if (insertIndex <= 0) {
            tree.select_node(pageIds[0]);
            pendingInsertMode = 'before';
        } else if (insertIndex >= pageIds.length) {
            tree.select_node(pageIds[pageIds.length - 1]);
            pendingInsertMode = 'after';
        } else {
            tree.select_node(pageIds[insertIndex - 1]);
            pendingInsertMode = 'after';
        }

        openInsertLightbox();
    }

    function insertLightboxTitle() {
        var lang = (typeof languagecodevariable !== 'undefined' && languagecodevariable)
            ? String(languagecodevariable)
            : '';
        if (lang.indexOf('nl') === 0) {
            return 'Selecteer een pagina om toe te voegen';
        }
        return 'Select a page to add';
    }

    function insertExampleLabel() {
        if (typeof language !== 'undefined' && language.insertDialog && language.insertDialog.$preview) {
            return language.insertDialog.$preview;
        }
        var lang = (typeof languagecodevariable !== 'undefined' && languagecodevariable)
            ? String(languagecodevariable)
            : '';
        return lang.indexOf('nl') === 0 ? 'voorbeeld' : 'example';
    }

    function getInsertCategories() {
        if (typeof menu_data === 'undefined' || !menu_data.menu) {
            return [];
        }
        var advanced = (typeof advanced_mode !== 'undefined') ? advanced_mode : false;
        var cats = [];
        $.each(menu_data.menu, function () {
            if (this.deprecated) {
                return;
            }
            if (!(this.simple_enabled || advanced)) {
                return;
            }
            var pages = [];
            $.each(this.submenu || [], function () {
                if (this.deprecated) {
                    return;
                }
                if (!(this.simple_enabled || advanced)) {
                    return;
                }
                pages.push(this);
            });
            if (pages.length) {
                cats.push({
                    name: this.name,
                    pages: pages
                });
            }
        });
        return cats;
    }

    function pageMockupSrc(page) {
        // Real mockups can replace this later; use existing thumb when present
        if (page.thumb) {
            return 'modules/xerte/parent_templates/Nottingham/' + page.thumb;
        }
        return '';
    }

    function ensureInsertLightbox() {
        if ($('#modern-insert-lightbox').length) {
            return $('#modern-insert-lightbox');
        }
        $('body').append(
            '<div id="modern-insert-lightbox" class="modern-insert-lightbox" hidden>' +
                '<div class="modern-insert-lightbox__backdrop" data-insert-close></div>' +
                '<div class="modern-insert-lightbox__dialog" role="dialog" aria-modal="true" aria-labelledby="modern-insert-title">' +
                    '<div class="modern-insert-lightbox__header">' +
                        '<h2 class="modern-insert-lightbox__title" id="modern-insert-title"></h2>' +
                        '<button type="button" class="modern-insert-lightbox__close" data-insert-close aria-label="Close">' +
                            '<i class="fa fa-times" aria-hidden="true"></i>' +
                        '</button>' +
                    '</div>' +
                    '<div class="modern-insert-lightbox__body">' +
                        '<nav class="modern-insert-lightbox__nav" id="modern-insert-nav" aria-label="Categories"></nav>' +
                        '<div class="modern-insert-lightbox__content">' +
                            '<div class="modern-insert-lightbox__grid" id="modern-insert-grid"></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>'
        );
        return $('#modern-insert-lightbox');
    }

    function renderInsertCategory(categoryIndex) {
        var cats = getInsertCategories();
        if (!cats.length) {
            return;
        }
        if (categoryIndex < 0 || categoryIndex >= cats.length) {
            categoryIndex = 0;
        }
        var cat = cats[categoryIndex];
        var $nav = $('#modern-insert-nav');
        var $grid = $('#modern-insert-grid');
        var exampleLabel = insertExampleLabel();

        $nav.find('.modern-insert-lightbox__nav-item')
            .removeClass('modern-insert-lightbox__nav-item--active')
            .eq(categoryIndex)
            .addClass('modern-insert-lightbox__nav-item--active');

        var html = '';
        cat.pages.forEach(function (page) {
            var mockSrc = pageMockupSrc(page);
            var mockHtml = mockSrc
                ? '<img class="modern-insert-card__img" src="' + mockSrc + '" alt="" />'
                : '<div class="modern-insert-card__placeholder"><span></span><span></span><span></span></div>';
            var exampleHtml = page.example
                ? '<a class="modern-insert-card__example" href="' + page.example + '" target="_blank" rel="noopener" data-example="1">' +
                    '<span>' + exampleLabel + '</span>' +
                    '<i class="fa fa-eye" aria-hidden="true"></i>' +
                  '</a>'
                : '<span class="modern-insert-card__example modern-insert-card__example--disabled">' +
                    '<span>' + exampleLabel + '</span>' +
                    '<i class="fa fa-eye" aria-hidden="true"></i>' +
                  '</span>';

            html += '<div class="modern-insert-card" data-insert-item="' + page.item + '" role="button" tabindex="0">' +
                '<div class="modern-insert-card__preview">' + mockHtml + '</div>' +
                '<div class="modern-insert-card__footer">' +
                    '<span class="modern-insert-card__name"></span>' +
                    exampleHtml +
                '</div>' +
            '</div>';
        });
        $grid.html(html);
        $grid.find('.modern-insert-card').each(function (i) {
            $(this).find('.modern-insert-card__name').text(cat.pages[i].name || cat.pages[i].item);
        });
    }

    function openInsertLightbox() {
        var cats = getInsertCategories();
        if (!cats.length) {
            return;
        }
        var $box = ensureInsertLightbox();
        $('#modern-insert-title').text(insertLightboxTitle());

        var navHtml = '';
        cats.forEach(function (cat, index) {
            navHtml += '<button type="button" class="modern-insert-lightbox__nav-item' +
                (index === 0 ? ' modern-insert-lightbox__nav-item--active' : '') +
                '" data-insert-cat="' + index + '">' + cat.name + '</button>';
        });
        $('#modern-insert-nav').html(navHtml);
        renderInsertCategory(0);

        $box.removeAttr('hidden').addClass('is-open');
        $('body').addClass('modern-insert-open');
        $('#shadow').hide();
        $('#insert_menu').hide();
    }

    function closeInsertLightbox() {
        $('#modern-insert-lightbox').attr('hidden', true).removeClass('is-open');
        $('body').removeClass('modern-insert-open modern-editor-insert-fixed');
        pendingInsertMode = null;
    }

    function insertPageType(itemName) {
        if (!itemName || !EDITOR || !EDITOR.tree || !EDITOR.tree.addNode) {
            return;
        }
        var mode = pendingInsertMode || 'after';
        pendingInsertMode = null;
        closeInsertLightbox();
        EDITOR.tree.addNode(itemName, mode);
    }

    function wrapAddNode() {
        if (!EDITOR || !EDITOR.tree || EDITOR.tree.__modernAddNodeWrapped) {
            return;
        }
        var original = EDITOR.tree.addNode;
        EDITOR.tree.addNode = function (selectedItem, mode) {
            if (pendingInsertMode) {
                mode = pendingInsertMode;
                pendingInsertMode = null;
            }
            $('body').removeClass('modern-editor-insert-fixed');
            return original.call(this, selectedItem, mode);
        };
        EDITOR.tree.__modernAddNodeWrapped = true;
    }

    function widenWestPane() {
        if (typeof xerte_layout !== 'undefined' && xerte_layout && xerte_layout.sizePane) {
            try {
                xerte_layout.sizePane('west', 340);
            } catch (e) {
                // layout may not be ready
            }
        }
    }

    function bindUi() {
        if (bound) {
            return;
        }
        bound = true;

        patchModernCkEditorBehavior();

        $(document).on('click', '#modern-editor-home', function (e) {
            e.preventDefault();
            goHome();
        });

        $(document).on('click', '#modern-editor-lo-title', function (e) {
            e.preventDefault();
            selectLoRoot();
        });

        $(document).on('click', '#modern-editor-pages-toggle-all', function (e) {
            e.preventDefault();
            setAllNestedPagesCollapsed(!hasCollapsedNestedPages());
            renderPages({ refreshPreviews: false });
        });

        // Restore toolbar + editability when focusing a field
        $(document).on('focus', '#mainPanel .inlinewysiwyg, #mainPanel .cke_editable', function () {
            var id = this.id;
            $(this).attr('contenteditable', 'true');
            if (id) {
                $('#cke_' + id).show();
            }
            if (typeof CKEDITOR !== 'undefined' && id && CKEDITOR.instances[id]) {
                try {
                    CKEDITOR.instances[id].setReadOnly(false);
                    ensureCkEditorBlurFlush(CKEDITOR.instances[id]);
                } catch (e) {
                    // ignore
                }
            }
        });

        // Match Nottingham: commit field values when an input loses focus
        $(document).on('focusout', '#mainPanel input, #mainPanel textarea', function () {
            var $el = $(this);
            if ($el.is(':disabled') || $el.attr('type') === 'checkbox' || $el.attr('type') === 'radio' ||
                $el.attr('type') === 'file' || $el.attr('type') === 'button' || $el.attr('type') === 'submit' ||
                $el.hasClass('cke_source')) {
                return;
            }
            try {
                $el.trigger('change');
            } catch (e) {
                // ignore
            }
        });

        $(document).on('focusout', '#mainPanel .inlinewysiwyg, #mainPanel .cke_editable', function () {
            var id = this.id;
            if (typeof CKEDITOR !== 'undefined' && id && CKEDITOR.instances[id]) {
                flushCkEditorInstance(CKEDITOR.instances[id]);
            }
        });

        // Editors inside collapsed optional groups were often inited while hidden
        $(document).on('click', '#mainPanel .legend_label', function () {
            setTimeout(reviveModernCkEditors, 450);
        });

        $(document).on('click', '#modern-editor-preview', function (e) {
            e.preventDefault();
            flushModernEditorFields();
            triggerClassicButton('preview_button', e);
        });

        $(document).on('click', '#modern-editor-save', function (e) {
            e.preventDefault();
            // Publish = write data.xml (the real project save)
            flushModernEditorFields();
            triggerClassicButton('publish_button');
        });

        $(document).on('click', '#modern-editor-pages-list .modern-editor-insert__btn', function (e) {
            e.preventDefault();
            e.stopPropagation();
            closeMenus();
            var insertIndex = parseInt($(this).closest('.modern-editor-insert').attr('data-insert-index'), 10) || 0;
            openInsertMenu($(this), insertIndex);
        });

        $(document).on('click', '#modern-insert-nav .modern-insert-lightbox__nav-item', function (e) {
            e.preventDefault();
            renderInsertCategory(parseInt($(this).attr('data-insert-cat'), 10) || 0);
        });

        $(document).on('click', '#modern-insert-grid .modern-insert-card', function (e) {
            if ($(e.target).closest('[data-example]').length) {
                return;
            }
            e.preventDefault();
            insertPageType($(this).attr('data-insert-item'));
        });

        $(document).on('keydown', '#modern-insert-grid .modern-insert-card', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                insertPageType($(this).attr('data-insert-item'));
            }
        });

        $(document).on('click', '#modern-insert-lightbox [data-insert-close]', function (e) {
            e.preventDefault();
            closeInsertLightbox();
        });

        $(document).on('keydown', function (e) {
            if (e.key === 'Escape' && $('#modern-insert-lightbox').hasClass('is-open')) {
                closeInsertLightbox();
            }
        });

        $(document).on('click', '#modern-editor-pages-list .modern-editor-page', function (e) {
            if ($(e.target).closest('.modern-editor-page__menu-wrap').length) {
                return;
            }
            if ($(e.target).closest('.modern-editor-child').length) {
                return;
            }
            closeMenus();
            selectPage($(this).attr('data-node-id'));
        });

        $(document).on('dblclick', '#modern-editor-pages-list .modern-editor-page', function (e) {
            if ($(e.target).closest('.modern-editor-page__menu-wrap, .modern-editor-child').length) {
                return;
            }
            e.preventDefault();
            closeMenus();
            selectPage($(this).attr('data-node-id'));
            flushModernEditorFields();
            // The classic preview handler uses Shift to append the selected
            // page's linkID. Reuse that path so saving and window behaviour
            // remain identical to Shift+Preview.
            triggerClassicButton('preview_button', e, {shiftKey: true});
        });

        $(document).on('click', '#modern-editor-pages-list .modern-editor-child__toggle', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var $child = $(this).closest('.modern-editor-child');
            var nodeId = $child.attr('data-node-id');
            var collapsed = !$child.hasClass('modern-editor-child--collapsed');
            $child.toggleClass('modern-editor-child--collapsed', collapsed);
            $(this).attr('aria-expanded', String(!collapsed));
            if (collapsed) {
                collapsedNodeIds[nodeId] = true;
                $('#expand_tree').prop('checked', false);
            } else {
                delete collapsedNodeIds[nodeId];
            }
            saveCollapsedNodeIds();
            updateNestedPagesButton();
        });

        $(document).on('click', '#modern-editor-pages-list .modern-editor-page__toggle', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var $page = $(this).closest('.modern-editor-page');
            var nodeId = $page.attr('data-node-id');
            var collapsed = !$page.hasClass('modern-editor-page--children-collapsed');
            $page.toggleClass('modern-editor-page--children-collapsed', collapsed);
            $(this).attr('aria-expanded', String(!collapsed));
            if (collapsed) {
                collapsedNodeIds[nodeId] = true;
                $('#expand_tree').prop('checked', false);
            } else {
                delete collapsedNodeIds[nodeId];
            }
            saveCollapsedNodeIds();
            updateNestedPagesButton();
        });

        $(document).on('click', '#modern-editor-pages-list .modern-editor-child__select', function (e) {
            e.preventDefault();
            e.stopPropagation();
            closeMenus();
            selectPage($(this).closest('.modern-editor-child').attr('data-node-id'));
        });

        $(document).on('keydown', '#modern-editor-pages-list .modern-editor-page', function (e) {
            if ($(e.target).closest('.modern-editor-child').length) {
                return;
            }
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectPage($(this).attr('data-node-id'));
            }
        });

        $(document).on('click', '#modern-editor-pages-list .modern-editor-page__menu', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var $dropdown = $(this).siblings('.modern-editor-page__dropdown');
            var wasOpen = $dropdown.hasClass('is-open');
            closeMenus();
            if (!wasOpen) {
                $dropdown.addClass('is-open');
                $(this).attr('aria-expanded', 'true');
            }
        });

        $(document).on('click', '#modern-editor-pages-list .modern-editor-page__dropdown button', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var action = $(this).attr('data-action');
            var nodeId = $(this).closest('.modern-editor-page').attr('data-node-id');
            closeMenus();
            selectPage(nodeId);
            setTimeout(function () {
                if (action === 'duplicate') {
                    $('#copy_button').trigger('click');
                } else if (action === 'delete') {
                    $('#delete_button').trigger('click');
                }
            }, 30);
        });

        $(document).on('click', function () {
            closeMenus();
        });

        $(document).on('click', '#shadow', function () {
            pendingInsertMode = null;
            $('body').removeClass('modern-editor-insert-fixed');
            closeInsertLightbox();
        });

        /*
         * A theme affects every rendered page.
         *
         * Discard all cached thumbnails and regenerate them using
         * the newly selected theme.
         */
        $(document).on(
            'change',
            '#mainPanel [id^="theme_div_"] select',
            function () {

                if (
                    !window.modernEditorThumbnails ||
                    typeof window.modernEditorThumbnails
                        .cancelPendingGeneration !== 'function'
                ) {
                    return;
                }

                /*
                 * The normal Xerte .change() handler runs first and updates
                 * lo_data. Wait until that handler has completed.
                 */
                setTimeout(function () {

                    window.modernEditorThumbnails
                        .cancelPendingGeneration(function () {

                            /*
                             * Save the new theme into preview.xml before
                             * asking preview.php to render anything.
                             */
                            saveCurrentPreview(function (saveErr) {

                                if (saveErr) {
                                    console.warn(
                                        'Unable to save preview before ' +
                                        'thumbnail regeneration:',
                                        saveErr
                                    );
                                    return;
                                }

                                window.modernEditorThumbnails
                                    .deleteAllThumbnails(
                                        template_id,
                                        function (deleteErr) {

                                            if (deleteErr) {
                                                console.warn(
                                                    'Unable to invalidate thumbnails:',
                                                    deleteErr
                                                );
                                                return;
                                            }

                                            /*
                                             * Rebuild cards.
                                             *
                                             * DB status is now empty, so every page
                                             * becomes a placeholder and enters the
                                             * single-renderer queue.
                                             */
                                            renderPages({
                                                refreshPreviews: false
                                            });
                                        }
                                    );
                            });
                        });

                }, 0);
            }
        );

        /*
         * Regenerate the current page thumbnail after real user edits.
         *
         * We deliberately ignore synthetic jQuery change events.
         */
        $(document).on(
            'input change',
            '#mainPanel input, #mainPanel textarea, #mainPanel select',
            function (event) {

                /*
                 * .trigger('change') produces no originalEvent.
                 *
                 * This prevents Xerte's various synthetic flushes from
                 * causing unnecessary thumbnail regeneration.
                 */
                if (!event.originalEvent) {
                    return;
                }

                scheduleCurrentPageThumbnailRefresh();
            }
        );
    }

    function bindTreeEvents() {
        var $tree = $('#treeview');
        if (!$tree.length || $tree.data('modern-editor-bound')) {
            return;
        }
        $tree.data('modern-editor-bound', true);

        $tree
            .on('ready.jstree', function () {
                wrapAddNode();
                disableModernResizers();
                widenWestPane();
                ensureTopbar();
                ensureShell();
                modernizeFooterCheckboxes();
                renderPages({ refreshPreviews: false });
            })
            .on('select_node.jstree', function () {
                var tree = getTree();
                if (!tree) {
                    return;
                }
                var selected = tree.get_selected();
                var selectedId = selected.length ? selected[0] : null;
                var topId = getTopLevelPageId(tree, selectedId) || selectedId;
                var isRoot = selectedId === 'treeroot';

                if (!isRoot) {
                    revealNodePath(tree, selectedId);
                    $('#modern-editor-pages-list .modern-editor-page').each(function () {
                        var nodeId = $(this).attr('data-node-id');
                        if (!collapsedNodeIds[nodeId]) {
                            $(this).removeClass('modern-editor-page--children-collapsed')
                                .children('.modern-editor-page__head')
                                .find('.modern-editor-page__toggle')
                                .attr('aria-expanded', 'true');
                        }
                    });
                    $('#modern-editor-pages-list .modern-editor-child').each(function () {
                        var nodeId = $(this).attr('data-node-id');
                        if (!collapsedNodeIds[nodeId]) {
                            $(this).removeClass('modern-editor-child--collapsed')
                                .children('.modern-editor-child__row')
                                .find('.modern-editor-child__toggle')
                                .attr('aria-expanded', 'true');
                        }
                    });
                }

                $('#modern-editor-lo-title').toggleClass('is-active', isRoot);

                $('#modern-editor-pages-list .modern-editor-page')
                    .removeClass('modern-editor-page--active')
                    .filter(isRoot ? '' : '[data-node-id="' + topId + '"]')
                    .addClass('modern-editor-page--active');

                $('#modern-editor-pages-list .modern-editor-child')
                    .removeClass('modern-editor-child--active')
                    .filter(isRoot ? '' : '[data-node-id="' + selectedId + '"]')
                    .addClass('modern-editor-child--active');

                // Keep footer docked after page form / checkbox enable state changes
                setTimeout(pinCenterFooter, 0);
                setTimeout(pinCenterFooter, 100);
                setTimeout(function () {
                    patchModernCkEditorBehavior();
                    reviveModernCkEditors();
                }, 400);

                // Refresh child meta (e.g. incomplete status after editing)
                $('#modern-editor-pages-list .modern-editor-page').each(function () {
                    $(this).find('.modern-editor-child').each(function () {
                        var $child = $(this);
                        var childId = $child.attr('data-node-id');
                        var childIndex = parseInt($child.attr('data-sibling-index'), 10) || 0;
                        var $row = $child.children('.modern-editor-child__row');
                        $row.find('.modern-editor-child__title').text(getChildTitle(childId, childIndex));
                        var badge = getChildBadge(childId);
                        var $badge = $row.find('.modern-editor-child__badge');
                        if (badge) {
                            if (!$badge.length) {
                                $child.find('.modern-editor-child__select')
                                    .append($('<span class="modern-editor-child__badge"></span>'));
                                $badge = $row.find('.modern-editor-child__badge');
                            }
                            $badge.text(badge).show();
                        } else {
                            $badge.remove();
                        }
                        var $status = $child.children('.modern-editor-child__status');
                        if (isChildIncomplete(childId)) {
                            if (!$status.length) {
                                $row.after($('<div class="modern-editor-child__status"></div>'));
                                $status = $child.children('.modern-editor-child__status');
                            }
                            $status.text(incompleteLabel());
                        } else {
                            $status.remove();
                        }
                    });
                });
            })
            .on(
                'create_node.jstree move_node.jstree rename_node.jstree set_text.jstree',
                function (e, data) {
                    var tree = getTree();
                    if (tree && data && data.node &&
                        (e.type === 'create_node' || e.type === 'move_node')) {
                        revealNodePath(tree, data.node.id);
                    }
                    renderPages({
                        refreshPreviews: true
                    });
                    if (e.type === 'create_node' && data && data.node) {
                        setTimeout(function () {
                            var $newNode = $('#modern-editor-pages-list .modern-editor-child')
                                .filter('[data-node-id="' + data.node.id + '"]');
                            if ($newNode.length && $newNode[0].scrollIntoView) {
                                $newNode[0].scrollIntoView({ block: 'nearest' });
                            }
                        }, 0);
                    }
                }
            )
            .on(
                'delete_node.jstree',
                function (e, data) {

                    var deletedNodeId =
                        data && data.node
                            ? data.node.id
                            : null;

                    if (deletedNodeId && collapsedNodeIds[deletedNodeId]) {
                        delete collapsedNodeIds[deletedNodeId];
                        saveCollapsedNodeIds();
                    }

                    var deletedPageLinkId =
                        deletedNodeId
                            ? getPageLinkId(deletedNodeId)
                            : '';

                    /*
                     * If this was a top-level page, delete its thumbnail.
                     */
                    if (
                        deletedPageLinkId &&
                        data.node.parent === 'treeroot' &&
                        window.modernEditorThumbnails
                    ) {
                        window.modernEditorThumbnails
                            .deleteThumbnail(
                                template_id,
                                deletedPageLinkId,
                                function (err) {

                                    if (err) {
                                        console.warn(
                                            'Unable to remove deleted page thumbnail:',
                                            deletedPageLinkId,
                                            err
                                        );
                                    }
                                }
                            );
                    }

                    renderPages({
                        refreshPreviews: true
                    });
                }
            )
            .on('changed.jstree', function (e, data) {
                if (data && data.action && (
                    data.action === 'delete_node' ||
                    data.action === 'create_node' ||
                    data.action === 'move_node'
                )) {
                    renderPages({ refreshPreviews: true });
                }
            });
    }

    function init() {
        bindUi();
        bindTreeEvents();
        ensureTopbar();
        disableModernResizers();
        modernizeFooterCheckboxes();
        patchModernCkEditorBehavior();
        // Tree may already be ready if script loaded late
        if (getTree()) {
            wrapAddNode();
            widenWestPane();
            ensureShell();
            renderPages({ refreshPreviews: false });
        }
    }

    $(document).ready(function () {
        // Layout + tree init shortly after ready; retry briefly
        init();
        var attempts = 0;
        var timer = setInterval(function () {
            attempts++;
            ensureTopbar();
            disableModernResizers();
            modernizeFooterCheckboxes();
            patchModernCkEditorBehavior();
            if (getTree() || attempts > 40) {
                clearInterval(timer);
                init();
                setTimeout(reviveModernCkEditors, 500);
            }
        }, 100);
    });

    window.modernEditorPages = {
        refresh: function () {
            renderPages({ refreshPreviews: true });
        },
        render: function () {
            renderPages({ refreshPreviews: false });
        }
    };

})(jQuery, window, document);
