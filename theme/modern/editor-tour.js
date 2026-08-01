/**
 * Modern LO editor — continue guided tour after workspace steps 1–3.
 * Triggered when localStorage toolkits_modern_tour_continue === '1'.
 */
(function (window, document, $) {
    'use strict';

    if (!$ || !document.body || !document.body.classList.contains('toolkits-ui-theme-modern')) {
        return;
    }

    var CONTINUE_KEY = 'toolkits_modern_tour_continue';
    var DONE_PREF = 'modern_tour_done';
    var TOTAL = 6;
    var HOME_STEPS = 3;

    var active = false;
    var stepIndex = 0;
    var resizeTimer = null;

    function cfgStrings() {
        var cfg = window.toolkits_index_config || {};
        return cfg.strings || {};
    }

    function s(key, fallback) {
        var strings = cfgStrings();
        return strings[key] || fallback;
    }

    function shouldContinue() {
        try {
            var params = new URLSearchParams(window.location.search || '');
            if (params.get('tour') === '1') {
                return true;
            }
            return window.localStorage.getItem(CONTINUE_KEY) === '1';
        } catch (e) {
            return false;
        }
    }

    function clearContinue() {
        try {
            window.localStorage.removeItem(CONTINUE_KEY);
        } catch (e) { /* ignore */ }
    }

    function markDone() {
        clearContinue();
        try {
            window.localStorage.setItem('toolkits_modern_tour_done', '1');
        } catch (e) { /* ignore */ }
        if (typeof window.user_preferences === 'undefined' || !window.user_preferences) {
            window.user_preferences = {};
        }
        window.user_preferences[DONE_PREF] = true;
        if (typeof save_user_preference === 'function') {
            save_user_preference(DONE_PREF, true);
        }
    }

    function getSteps() {
        return [
            {
                id: 'topbar',
                title: s('modernTourEditorTopbarTitle', 'The editor top bar'),
                body: s(
                    'modernTourEditorTopbarBody',
                    'Use the top bar to preview your learning object, save your work, and open your account menu.'
                ),
                highlight: ['#modern-editor-topbar'],
                tipAnchor: '#modern-editor-topbar',
                tipPlacement: 'below'
            },
            {
                id: 'pages',
                title: s('modernTourEditorPagesTitle', 'Your pages'),
                body: s(
                    'modernTourEditorPagesBody',
                    'This list shows the pages in your learning object. Select a page to edit it, or add a new page.'
                ),
                highlight: ['#modern-editor-pages'],
                tipAnchor: '#modern-editor-pages',
                tipPlacement: 'right'
            },
            {
                id: 'content',
                title: s('modernTourEditorContentTitle', 'Edit your content'),
                body: s(
                    'modernTourEditorContentBody',
                    'The centre panel is where you build each page. Change titles, text and settings, then save from the top bar.'
                ),
                highlight: ['#mainContent', '.ui-layout-center'],
                tipAnchor: '#mainContent',
                tipPlacement: 'left'
            }
        ];
    }

    function ensureShell() {
        var root = document.getElementById('toolkits-modern-editor-tour');
        if (root) {
            return root;
        }
        root = document.createElement('div');
        root.id = 'toolkits-modern-editor-tour';
        root.className = 'toolkits-modern-tour toolkits-modern-editor-tour';
        root.hidden = true;
        root.innerHTML =
            '<div class="toolkits-modern-tour__overlay" id="toolkits-modern-editor-tour-overlay"></div>' +
            '<div class="toolkits-modern-tour__tip" id="toolkits-modern-editor-tour-tip" role="dialog" aria-modal="true" hidden>' +
                '<button type="button" class="toolkits-modern-tour__tip-close" data-editor-tour-skip aria-label="' +
                    (s('modernTourClose', 'Close tour')) + '">' +
                    '<i class="fa fa-times" aria-hidden="true"></i>' +
                '</button>' +
                '<h3 class="toolkits-modern-tour__tip-title" id="toolkits-modern-editor-tour-tip-title"></h3>' +
                '<div class="toolkits-modern-tour__tip-body" id="toolkits-modern-editor-tour-tip-body"></div>' +
                '<div class="toolkits-modern-tour__tip-footer">' +
                    '<span class="toolkits-modern-tour__tip-step" id="toolkits-modern-editor-tour-tip-step"></span>' +
                    '<button type="button" class="toolkits-modern-btn toolkits-modern-btn--primary" data-editor-tour-next id="toolkits-modern-editor-tour-next">' +
                        (s('modernTourNext', 'Next step')) +
                    '</button>' +
                '</div>' +
                '<span class="toolkits-modern-tour__tip-arrow" aria-hidden="true"></span>' +
            '</div>';
        document.body.appendChild(root);
        return root;
    }

    function clearHighlights() {
        document.querySelectorAll('.toolkits-modern-tour-highlight').forEach(function (el) {
            el.classList.remove('toolkits-modern-tour-highlight');
        });
    }

    function positionTip(step) {
        var tip = document.getElementById('toolkits-modern-editor-tour-tip');
        if (!tip || !step) {
            return;
        }
        var anchor = step.tipAnchor ? document.querySelector(step.tipAnchor) : null;
        if (!anchor && step.highlight && step.highlight.length) {
            for (var i = 0; i < step.highlight.length; i++) {
                anchor = document.querySelector(step.highlight[i]);
                if (anchor) {
                    break;
                }
            }
        }

        tip.hidden = false;
        tip.style.visibility = 'hidden';
        tip.classList.remove(
            'toolkits-modern-tour__tip--left',
            'toolkits-modern-tour__tip--right',
            'toolkits-modern-tour__tip--above',
            'toolkits-modern-tour__tip--below'
        );

        var tipWidth = tip.offsetWidth || 340;
        var tipHeight = tip.offsetHeight || 180;
        var gap = 28;
        var top;
        var left;
        var placement = step.tipPlacement || 'below';

        if (anchor) {
            var rect = anchor.getBoundingClientRect();
            if (placement === 'below') {
                top = rect.bottom + gap;
                left = rect.left + (rect.width / 2) - (tipWidth / 2);
                tip.classList.add('toolkits-modern-tour__tip--above');
            } else if (placement === 'left') {
                top = rect.top + (rect.height / 2) - (tipHeight / 2);
                left = rect.left - tipWidth - gap;
                tip.classList.add('toolkits-modern-tour__tip--right');
            } else {
                top = rect.top + (rect.height / 2) - (tipHeight / 2);
                left = rect.right + gap;
                tip.classList.add('toolkits-modern-tour__tip--left');
            }
        } else {
            top = window.innerHeight / 2 - tipHeight / 2;
            left = window.innerWidth / 2 - tipWidth / 2;
        }

        top = Math.max(16, Math.min(top, window.innerHeight - tipHeight - 16));
        left = Math.max(16, Math.min(left, window.innerWidth - tipWidth - 16));
        tip.style.top = Math.round(top) + 'px';
        tip.style.left = Math.round(left) + 'px';
        tip.style.visibility = '';
    }

    function renderStep(index) {
        var steps = getSteps();
        var step = steps[index];
        if (!step) {
            endTour(true);
            return;
        }

        clearHighlights();
        (step.highlight || []).forEach(function (sel) {
            var el = document.querySelector(sel);
            if (el) {
                el.classList.add('toolkits-modern-tour-highlight');
            }
        });

        var titleEl = document.getElementById('toolkits-modern-editor-tour-tip-title');
        var bodyEl = document.getElementById('toolkits-modern-editor-tour-tip-body');
        var stepEl = document.getElementById('toolkits-modern-editor-tour-tip-step');
        var nextBtn = document.getElementById('toolkits-modern-editor-tour-next');

        if (titleEl) {
            titleEl.textContent = step.title;
        }
        if (bodyEl) {
            bodyEl.innerHTML = step.body || '';
        }
        if (stepEl) {
            stepEl.textContent = (HOME_STEPS + index + 1) + '/' + TOTAL;
        }
        if (nextBtn) {
            var isLast = index >= steps.length - 1;
            nextBtn.textContent = isLast
                ? s('modernTourFinish', 'Finish')
                : s('modernTourNext', 'Next step');
        }

        window.setTimeout(function () {
            positionTip(step);
        }, 40);
    }

    function showRoot(show) {
        var root = ensureShell();
        root.hidden = !show;
        active = !!show;
        document.body.classList.toggle('toolkits-modern-editor-tour-active', !!show);
    }

    function endTour(done) {
        if (done) {
            markDone();
        } else {
            clearContinue();
        }
        clearHighlights();
        showRoot(false);
        var tip = document.getElementById('toolkits-modern-editor-tour-tip');
        if (tip) {
            tip.hidden = true;
        }
        stepIndex = 0;
        window.removeEventListener('resize', onResize);
    }

    function nextStep() {
        var steps = getSteps();
        if (stepIndex >= steps.length - 1) {
            endTour(true);
            return;
        }
        stepIndex += 1;
        renderStep(stepIndex);
    }

    function onResize() {
        if (!active) {
            return;
        }
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(function () {
            renderStep(stepIndex);
        }, 80);
    }

    function bindEvents() {
        document.addEventListener('click', function (e) {
            if (!active) {
                return;
            }
            if (e.target.closest('[data-editor-tour-skip]')) {
                e.preventDefault();
                endTour(true);
                return;
            }
            if (e.target.closest('[data-editor-tour-next]')) {
                e.preventDefault();
                nextStep();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (!active) {
                return;
            }
            if (e.key === 'Escape') {
                endTour(true);
            }
        });
    }

    function begin() {
        ensureShell();
        showRoot(true);
        stepIndex = 0;
        renderStep(0);
        window.addEventListener('resize', onResize);
    }

    function waitForTopbarThenStart() {
        var attempts = 0;
        var timer = window.setInterval(function () {
            attempts++;
            var topbar = document.getElementById('modern-editor-topbar');
            if (topbar || attempts > 40) {
                window.clearInterval(timer);
                if (topbar) {
                    begin();
                } else {
                    clearContinue();
                }
            }
        }, 250);
    }

    bindEvents();

    $(document).ready(function () {
        if (!shouldContinue()) {
            return;
        }
        waitForTopbarThenStart();
    });
})(window, document, window.jQuery);
