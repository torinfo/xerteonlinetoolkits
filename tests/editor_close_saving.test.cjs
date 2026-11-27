// Run: node --test tests/editor_close_saving.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function fixture() {
    const requests = [], events = [];
    let options;
    const $ = () => ({ hide() {} });
    $.jstree = { reference: () => ({ get_selected: () => ['node1'] }) };
    $.featherlight = value => { options = value; return {}; };
    $.ajax = data => {
        requests.push(data);
        events.push('save');
        const request = { done() { return this; }, fail() { return this; } };
        return request;
    };
    const context = vm.createContext({
        $, jQuery: $, console, screen: { width: 1280, height: 1000 },
        site_url: '/', site_apache: 'false', rest_api_url: '/api/v1',
        workspace: { nodes: { node1: { id: 'node1', parent: 'root', xot_id: 42, xot_type: 'file', editor_size: '900,700' } } },
        previewxmlurl: '/USER-FILES/42-test/preview.xml', rlourlvariable: '/USER-FILES/42-test/', template_id: 42,
        XMLHttpRequest: function() {}, bunload: () => events.push('unlock')
    });
    context.window = context;
    for (const file of ['website_code/scripts/template_management.js', 'editor/js/tree.js']) {
        vm.runInContext(readFileSync(path.join(__dirname, '..', file), 'utf8'), context, { filename: file });
    }
    context.build_json = () => ({ attributes: { nodeName: 'learningObject' }, children: { 0: { data: '<p>Latest draft</p>' } } });
    function closeOverlay() {
        context.edit_window(false, 'edithtml', 'lightbox');
        const editorWindow = { WIZARD_EDITOR: context.EDITOR, onbeforeunload() {}, bunload: context.bunload };
        options.beforeClose.call({ $content: [{ contentWindow: editorWindow }] });
        return editorWindow;
    }
    return { context, requests, events, closeOverlay };
}

test('normal close/refresh saves the latest preview asynchronously before normal cleanup', () => {
    const f = fixture();
    f.context.unloadFunction();
    assert.equal(f.requests.length, 1);
    const request = f.requests[0];
    assert.equal(request.async, true);
    assert.equal(request.type, 'POST');
    assert.equal(request.url, '/api/v1?route=learning-objects/save');
    assert.equal(request.data.fileupdate, 0);
    assert.equal(request.data.filename, f.context.previewxmlurl);
    assert.equal(JSON.parse(decodeURIComponent(request.data.lo_data)).children[0].data, '<p>Latest draft</p>');
    assert.deepEqual(f.events, ['save', 'unlock']);
});

test('lightbox keeps its synchronous save while the iframe is alive and its corrected cleanup', () => {
    const f = fixture();
    const editorWindow = f.closeOverlay();
    assert.equal(f.requests.length, 1);
    assert.equal(f.requests[0].async, false);
    assert.equal(f.requests[0].data.fileupdate, 0);
    assert.equal(editorWindow.window_reference, vm.runInContext('window', f.context));
    assert.equal(editorWindow.onbeforeunload, null);
    assert.deepEqual(f.events, ['save', 'unlock']);
});

test('merged editors retain the existing no-save cleanup for both close paths', () => {
    for (const overlay of [false, true]) {
        const f = fixture();
        f.context.merged = true;
        if (overlay) f.closeOverlay();
        else f.context.unloadFunction();
        assert.equal(f.requests.length, 0);
        assert.deepEqual(f.events, ['unlock']);
    }
});
