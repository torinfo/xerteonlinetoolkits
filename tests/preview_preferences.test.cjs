// Run with: node --test tests/preview_preferences.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function fixture(preferences = {}) {
    const opened = [], overlays = [], alerts = [];
    const $ = () => ({ length: 0, hide() {} });
    $.jstree = { reference: () => ({ get_selected: () => ['node1'] }) };
    $.featherlight = options => overlays.push(options);
    $.extend = Object.assign;
    let done, fail, always, request;
    $.ajax = options => {
        request = options;
        return { done(fn) { done = fn; return this; }, fail(fn) { fail = fn; return this; }, always(fn) { always = fn; return this; } };
    };
    const context = vm.createContext({
        $, jQuery: $, console, user_preferences: preferences,
        window: { user_preferences: preferences, open(...args) {
            const tab = { closed: false, close() { this.closed = true; } };
            opened.push({ args, tab });
            return tab;
        } },
        site_url: '/', site_apache: 'false', setup_ajax: () => true,
        workspace: { nodes: { node1: { id: 'node1', xot_id: 42, xot_type: 'file', preview_size: '900,700' } } },
        template_id: 42, template_height: 700, template_width: 900,
        preview_url: 'preview.php?template_id=', previewxmlurl: 'preview.xml', rlourlvariable: '/',
        language: { Alert: { sessionError: 'Save failed' } }, alert: text => alerts.push(text)
    });
    for (const file of ['website_code/scripts/template_management.js', 'website_code/scripts/user_settings.js', 'editor/js/tree.js']) {
        vm.runInContext(readFileSync(path.join(__dirname, '..', file), 'utf8'), context, { filename: file });
    }
    context.build_json = () => ({ name: 'Test object' });
    context.getCurrentPageID = () => 'page1';
    return {
        context, opened, overlays, alerts,
        success(response) { done(response); if (always) always(); },
        failure() { fail({}, 'error', 'Save failed'); if (always) always(); },
        request: () => request
    };
}

function preferencesForm() {
    const selected = {}, controls = {}, handlers = {};
    const form = {
        off() { return this; },
        on() { return this; },
        find(selector) {
            if (controls[selector]) return controls[selector];
            return controls[selector] = {
                textValue: '', classes: new Set(),
                prop(name, value) {
                    this[name] = value;
                    const match = selector.match(/input\[name="([^"]+)"\]\[value="([^"]+)"\]/);
                    if (match && name === 'checked' && value) selected[match[1]] = match[2];
                    return this;
                },
                is: () => false,
                val: () => selected[selector.match(/input\[name="([^"]+)"\]/)?.[1]],
                attr: name => name === 'data-saved-message' ? 'Your preferences have been saved.' : 'Save failed.',
                text(value) { this.textValue = value; return this; },
                empty() { this.textValue = ''; return this; },
                addClass(value) { this.classes.add(value); return this; },
                removeClass(value) { this.classes.delete(value); return this; },
                off() { return this; },
                on(event, handler) { handlers[selector] = handler; return this; }
            };
        }
    };
    return { form, selected, controls, handlers };
}

test('missing and invalid preview preferences preserve popup defaults independently of editor mode', () => {
    for (const mode of [undefined, null, false, 'invalid', 'popup']) {
        const f = fixture({ editor_open_mode: '_blank', preview_open_mode: mode });
        f.context.preview_window(false);
        assert.deepEqual(f.opened[0].args, ['/preview.php?template_id=42', 'previewwindownode1', 'height=700, width=900, scrollbars=yes,resizable=yes']);
    }
});

test('workspace previews use new tabs without popup features', () => {
    const f = fixture({ preview_open_mode: '_blank' });
    f.context.preview_window(false);
    assert.deepEqual(f.opened[0].args, ['/preview.php?template_id=42', '_blank']);
});

test('workspace and management previews support overlays, with a popup fallback', () => {
    const f = fixture({ preview_open_mode: 'lightbox' });
    f.context.preview_window(false);
    f.context.preview_window(99);
    assert.equal(f.opened.length, 0);
    assert.equal(f.overlays[0].iframe, '/preview.php?template_id=42');
    assert.equal(f.overlays[1].iframe, '/preview.php?template_id=99');
    delete f.context.$.featherlight;
    f.context.preview_window(false);
    assert.equal(f.opened[0].args[1], 'previewwindownode1');
});

test('workspace shortcuts preserve Shift play and allow Ctrl/Cmd tabs and Alt overlays', () => {
    for (const modifier of ['ctrlKey', 'metaKey']) {
        const f = fixture({ preview_open_mode: 'lightbox' });
        f.context.preview_window(false, { shiftKey: true, [modifier]: true });
        assert.deepEqual(f.opened[0].args, ['/play.php?template_id=42', '_blank']);
    }
    const f = fixture();
    f.context.preview_window(false, { altKey: true });
    assert.equal(f.overlays.length, 1);
});

test('editor reserves a new tab before saving and navigates only after success', () => {
    const f = fixture({ preview_open_mode: '_blank' });
    f.context.preview({ shiftKey: true });
    assert.deepEqual(f.opened[0].args, ['', '_blank']);
    assert.equal(f.request().data.fileupdate, 0);
    assert.equal(f.opened[0].tab.location, undefined);
    f.success();
    assert.equal(f.opened.length, 1);
    assert.equal(f.opened[0].tab.location, 'preview.php?template_id=42&linkID=page1');
});

test('editor closes the reserved tab on save failure', () => {
    const f = fixture({ preview_open_mode: '_blank' });
    f.context.preview({});
    f.failure();
    assert.equal(f.opened[0].tab.closed, true);
    assert.deepEqual(f.alerts, ['Save failed']);
});

test('editor popup and overlay previews wait for saving', () => {
    for (const mode of ['popup', 'lightbox']) {
        const f = fixture({ preview_open_mode: mode });
        f.context.preview();
        assert.equal(f.opened.length + f.overlays.length, 0);
        f.success();
        if (mode === 'popup') {
            assert.deepEqual(f.opened[0].args, ['preview.php?template_id=42', 'previewwindow42', 'height=700, width=900, resizable=yes, scrollbars=1']);
        } else {
            assert.equal(f.overlays[0].iframe, 'preview.php?template_id=42');
        }
    }
});

test('preferences form loads, saves and resets preview mode separately from editor mode', () => {
    const f = fixture({ editor_open_mode: 'lightbox', preview_open_mode: '_blank' });
    const { form, selected } = preferencesForm();
    f.context.populatePreferencesForm(form);
    assert.equal(selected.editor_open_mode, 'lightbox');
    assert.equal(selected.preview_open_mode, '_blank');
    f.context.savePreferencesFromForm(form);
    assert.equal(f.request().data.preferences.preview_open_mode, '_blank');
    f.success({ ok: true, data: { success: true } });
    assert.equal(f.context.user_preferences.preview_open_mode, '_blank');
    f.context.populatePreferencesForm(form, f.context.getDefaultUserPreferences());
    assert.equal(selected.preview_open_mode, 'popup');
    assert.equal(selected.editor_open_mode, 'popup');
});

test('Save keeps the preferences dialog open and confirms only a successful response', () => {
    const f = fixture();
    const { form, controls, handlers } = preferencesForm();
    let closed = false;
    f.context.bindPreferencesModalHandlers({ find: () => form, dialog: () => { closed = true; } });
    handlers['.preferences-btn-save']();
    const status = controls['.preferences-save-status'];
    const save = controls['.preferences-btn-save'];
    assert.equal(closed, false);
    assert.equal(status.textValue, '');
    assert.equal(save.disabled, true);
    assert.equal(f.context.user_preferences.preview_open_mode, undefined);
    f.success({ ok: true, data: { success: true } });
    assert.equal(closed, false);
    assert.equal(status.textValue, 'Your preferences have been saved.');
    assert.equal(save.disabled, false);
    assert.equal(f.context.user_preferences.preview_open_mode, 'popup');
    handlers['.preferences-btn-reset']();
    assert.equal(status.textValue, '');
});

test('failed saves show inline feedback, allow retry and do not apply unsaved preferences', () => {
    for (const failure of ['network', 'response']) {
        const f = fixture({ preview_open_mode: '_blank' });
        const { form, controls } = preferencesForm();
        f.context.savePreferencesFromForm(form);
        if (failure === 'network') f.failure();
        else f.success({ ok: false });
        assert.equal(controls['.preferences-save-status'].textValue, 'Save failed.');
        assert.equal(controls['.preferences-save-status'].classes.has('preferences-save-status--error'), true);
        assert.equal(controls['.preferences-btn-save'].disabled, false);
        assert.equal(f.context.user_preferences.preview_open_mode, '_blank');
        assert.deepEqual(f.alerts, []);
        f.context.savePreferencesFromForm(form);
        assert.equal(controls['.preferences-save-status'].textValue, '');
        assert.equal(controls['.preferences-save-status'].classes.size, 0);
        f.success({ ok: true, data: { success: true } });
        assert.equal(controls['.preferences-save-status'].textValue, 'Your preferences have been saved.');
    }
});
