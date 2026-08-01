/**
 * Modern LO editor — workspace user menu / modals (workspace-window mode only).
 * Mirrors the workspace topbar user chrome from modern.js.
 */
(function (window, document) {
    'use strict';

    function cfg() {
        return window.toolkits_index_config || {};
    }

    function strings() {
        return cfg().strings || {};
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
        var text = label || '';
        return '<button type="button" class="toolkits-modern-topbar__dropdown-item' + mod + '" role="menuitem" onclick="' + onclick + '">' +
            '<i class="fa ' + icon + ' toolkits-modern-topbar__dropdown-icon" aria-hidden="true"></i>' +
            '<span>' + text + '</span>' +
        '</button>';
    }

    function toolkitsModernTopbarUserMenuHtml(config) {
        var s = (config && config.strings) || {};
        var user = (config && config.user) || {};
        var items = '';

        if (user.canManageUser) {
            items += toolkitsModernUserMenuItemHtml(
                'fa-lock',
                s.changePassword || 'Change password',
                'toolkitsModernCloseUserMenu(); toolkitsModernOpenPasswordModal();'
            );
        }
        if (!user.isGuest) {
            items += toolkitsModernUserMenuItemHtml(
                'fa-user-circle',
                s.modernMyDetails || 'My details',
                'toolkitsModernOpenUserDetails();'
            );
            if (user.canManageUser) {
                items += toolkitsModernUserMenuItemHtml(
                    'fa-sliders',
                    s.modernPreferences || 'Preferences',
                    'toolkitsModernCloseUserMenu(); toolkitsModernOpenPreferencesModal();'
                );
                items += toolkitsModernUserMenuItemHtml(
                    'fa-gears',
                    s.modernSettings || 'Settings',
                    'toolkitsModernCloseUserMenu(); toolkitsModernOpenSettingsModal();'
                );
            }
            items += toolkitsModernUserMenuItemHtml(
                'fa-pencil',
                s.modernFeedback || 'Give feedback',
                'toolkitsModernOpenFeedback();'
            );
            items += '<hr class="toolkits-modern-topbar__dropdown-divider" aria-hidden="true">';
            items += toolkitsModernUserMenuItemHtml(
                'fa-right-from-bracket',
                s.logout || 'Logout',
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

        return '<div class="toolkits-modern-topbar__user modern-editor-topbar__workspace-user">' + menuHtml + '</div>';
    }

    window.toolkitsModernTopbarUserMenuHtml = toolkitsModernTopbarUserMenuHtml;

    window.toolkitsModernCloseUserMenu = function () {
        var toggle = document.getElementById('toolkits-modern-user-toggle');
        var menu = document.getElementById('toolkits-modern-user-menu');
        if (menu) {
            menu.hidden = true;
            menu.style.position = '';
            menu.style.top = '';
            menu.style.left = '';
            menu.style.right = '';
            menu.style.minWidth = '';
        }
        if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
        }
    };

    window.toolkitsModernShowUserModalContent = function (title, html, modifier) {
        var modal = document.getElementById('toolkits-modern-user-modal');
        var body = document.getElementById('toolkits-modern-user-modal-body');
        var titleEl = document.getElementById('toolkits-modern-user-modal-title');
        if (!modal || !body) {
            return;
        }

        window.toolkitsModernCloseUserModal();
        if (titleEl) {
            titleEl.textContent = title || '';
        }
        if (modifier) {
            modal.classList.add(modifier);
        }
        body.innerHTML = html || '';
        modal.hidden = false;
        document.body.classList.add('toolkits-modern-user-modal-open');
    };

    window.toolkitsModernOpenUserDetails = function () {
        window.toolkitsModernCloseUserMenu();
        var s = strings();
        var title = s.modernMyDetails || 'My details';
        var esc = typeof window.escapeHtml === 'function' ? window.escapeHtml : function (v) {
            return String(v || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        };

        window.toolkitsModernShowUserModalContent(
            title,
            '<p class="toolkits-modern-user-modal__loading">' + esc(s.modernDetailsLoading || 'Loading details…') + '</p>',
            'toolkits-modern-user-modal--details'
        );

        if (typeof window.jQuery === 'undefined' || typeof window.rest_api_url === 'undefined') {
            var bodyMissing = document.getElementById('toolkits-modern-user-modal-body');
            if (bodyMissing) {
                bodyMissing.innerHTML = '<p class="toolkits-modern-user-modal__error">' +
                    esc(s.modernDetailsError || 'Could not load your details. Please try again.') + '</p>';
            }
            return;
        }

        window.jQuery.ajax({
            url: window.rest_api_url,
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
    };

    window.toolkitsModernOpenFeedback = function () {
        window.toolkitsModernCloseUserMenu();
        var s = strings();
        var esc = typeof window.escapeHtml === 'function' ? window.escapeHtml : function (v) {
            return String(v || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        };
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

        window.toolkitsModernShowUserModalContent(title, html, 'toolkits-modern-user-modal--feedback');

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

            var feedbackUrl = (typeof window.site_url !== 'undefined' ? window.site_url : '') + 'feedback/';
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

            if (typeof window.jQuery !== 'undefined') {
                window.jQuery.ajax({
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
    };

    window.toolkitsModernCloseUserModal = function () {
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
    };

    window.toolkitsModernOpenUserModal = function (title, section) {
        var modal = document.getElementById('toolkits-modern-user-modal');
        var body = document.getElementById('toolkits-modern-user-modal-body');
        var titleEl = document.getElementById('toolkits-modern-user-modal-title');
        if (!modal || !body || typeof window.loadUserSettingsFormHtml !== 'function') {
            return;
        }

        window.toolkitsModernCloseUserModal();
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

        window.loadUserSettingsFormHtml(section, function (html) {
            body.innerHTML = html;
            if (typeof window.initUserSettingsHandlers === 'function' && typeof window.jQuery !== 'undefined') {
                window.initUserSettingsHandlers(window.jQuery(body));
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
    };

    window.toolkitsModernOpenPasswordModal = function () {
        var s = strings();
        window.toolkitsModernOpenUserModal(s.changePassword || 'Change password', 'password');
    };

    window.toolkitsModernOpenPreferencesModal = function () {
        var s = strings();
        window.toolkitsModernOpenUserModal(s.modernPreferences || 'Preferences', 'preferences');
    };

    window.toolkitsModernOpenSettingsModal = function () {
        var s = strings();
        window.toolkitsModernOpenUserModal(s.modernSettings || 'Settings', 'settings');
    };

    window.toolkitsModernBindUserModal = function () {
        if (window.toolkitsModernUserModalBound) {
            return;
        }
        window.toolkitsModernUserModalBound = true;

        document.addEventListener('click', function (e) {
            if (e.target.closest('[data-user-modal-close]')) {
                window.toolkitsModernCloseUserModal();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                var modal = document.getElementById('toolkits-modern-user-modal');
                if (modal && !modal.hidden) {
                    window.toolkitsModernCloseUserModal();
                }
            }
        });
    };

    window.toolkitsModernBindEditorUserMenu = function () {
        var userToggle = document.getElementById('toolkits-modern-user-toggle');
        var userMenu = document.getElementById('toolkits-modern-user-menu');
        if (userToggle && userMenu && !userToggle.dataset.editorBound) {
            userToggle.dataset.editorBound = '1';
            userToggle.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var open = userMenu.hidden;
                window.toolkitsModernCloseUserMenu();
                if (open) {
                    // Fixed to the viewport so the editor topbar overflow cannot clip it
                    var rect = userToggle.getBoundingClientRect();
                    var menuWidth = Math.max(userMenu.offsetWidth || 240, 240);
                    userMenu.hidden = false;
                    userMenu.style.position = 'fixed';
                    userMenu.style.top = (rect.bottom + 6) + 'px';
                    userMenu.style.left = Math.max(8, rect.right - menuWidth) + 'px';
                    userMenu.style.right = 'auto';
                    userMenu.style.minWidth = menuWidth + 'px';
                    userMenu.style.zIndex = '5000';
                    userToggle.setAttribute('aria-expanded', 'true');
                }
            });
            userMenu.addEventListener('click', function (e) {
                e.stopPropagation();
            });
        }

        if (!window.toolkitsModernEditorUserClickBound) {
            window.toolkitsModernEditorUserClickBound = true;
            document.addEventListener('click', function () {
                window.toolkitsModernCloseUserMenu();
            });
        }
    };

    window.toolkitsModernEnsureEditorUserShell = function () {
        if (!document.getElementById('toolkits-modern-user-modal')) {
            var s = strings();
            document.body.insertAdjacentHTML('beforeend', toolkitsModernUserModalShellHtml(s));
        }
        window.toolkitsModernBindUserModal();
        window.toolkitsModernBindEditorUserMenu();
    };
})(window, document);
