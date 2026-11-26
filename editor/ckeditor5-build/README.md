# Updating and testing Xerte's CKEditor

CKEditor is built locally and served as part of Xerte. Its build project is in
this directory; generated browser assets and the hand-maintained bridge live
in `../js/vendor/ckeditor5/`. No CDN is required.

The acceptance requirement is to **load, display, edit, save, and reopen older
CKEditor 4 content without losing its meaning or required settings**. CKEditor 5
may normalize markup; it does not have to produce CKEditor 4's exact HTML.

## Initial check

Use a local/test installation and a disposable copy of an older project.

1. From this directory, run `npm ci`, then `npm run check`. The latter rebuilds
   the editor and runs both CKEditor and project-wide JavaScript tests.
2. Open `tests/index.html` through the web server. In this checkout:
   [browser test runner](http://localhost/xotlatest/editor/ckeditor5-build/tests/index.html).
   Click **Run all browser checks**, keep the tab active, and inspect the report.
   Every check should finish with PASS; a timeout is a failure.
3. Open a real older project. Check a title, rich-text field, table, image, and
   one custom feature used by that project. Make an edit, save, reopen, and
   preview. Also save with Source still open.
4. Try English and Dutch, fullscreen, resizing, and page switching. Check that
   custom toolbar buttons remain available and translations are applied.
5. Record the editor version, browser/version, test report, project checked,
   and any outstanding failures before committing or distributing the update.

The Node checks do not start a browser. Browser fixtures use temporary content
and mock server saves/media selection; they do not establish that real uploads,
microphone recording, or published playback work.

## Commands and test locations

Use Node.js 24 with npm; the current migration was checked with Node 24.15.0.

| Command | Working directory | What it runs |
| --- | --- | --- |
| `npm test` | `editor/ckeditor5-build` | CKEditor Node tests |
| `npm run test:all` | `editor/ckeditor5-build` | Both JavaScript suites |
| `npm run check` | `editor/ckeditor5-build` | Production build, then both JavaScript suites |
| `node tests/run-javascript-tests.cjs` | Project root | Both JavaScript suites without rebuilding |
| `node editor/ckeditor5-build/scripts/run-browser-checks.mjs --all` | Project root | All browser fixtures in headless Chrome or Edge; requires the local web server |

`tests/` here contains CKEditor-specific checks and fixtures. The project's root
`tests/` contains application-wide tests, including PHP tests and
`preview_preferences.test.cjs`. The shared Node command discovers test files in
both locations. PHP tests remain separate; see the root `tests/README.txt`.

## What is covered

| Layer | Coverage |
| --- | --- |
| Node | Actual CKEditor translation service for all shipped languages, override precedence, failed language downloads, concurrent language loading, legacy toolbar mapping, media URLs, theme selection, Source synchronization, async cleanup, table CSS, and existing dimension/link/lightbox/math helpers |
| Initial browser check | Installed version matches `package.json`; explicit custom-plugin inventory and toolbar controls; English/Dutch; Classic, iframe, and Inline editors |
| Legacy-content fixtures | Styled DIVs, text languages, nested lists, table headers/captions/merged cells, images/alt text, Xerte page links, lightboxes, icons, ruby, equation source, audio settings, and columns through repeated save/reload cycles |
| Lifecycle fixture | Undo/redo, bridge get/set data, read-only state, Inline Source Save/Cancel, iframe fullscreen/height, independent fields, destroy/recreate |
| Contextual toolbar fixture | Image/table controls mount in the wizard document, remain within the viewport, and pass hit testing on a scrolled page, in fullscreen, and after leaving fullscreen |
| General iframe fixtures | Live webpage previews, visible/hit-tested properties icon, actual resize drags, shared media/iframe dialogs, legacy properties and attribute/theme preservation, Source/reload, cancel, undo/redo, read-only and cleanup in all three modes |
| Existing browser fixtures | Source-open save payloads, HTML embeds, responsive media, mocked media browser dialogs, and link/lightbox dialogs and undo |

The browser runner visits fixtures sequentially in an iframe, captures explicit
completion or errors, and produces a copyable report. Individual links allow
debugging a check on its own. Browser test assets receive fresh cache keys.
The old `v49-smoke.html` URL redirects to the reusable `smoke.html` check.

The optional headless runner uses Node 24 and a separate temporary browser
profile. `XERTE_TEST_BROWSER` selects another Chrome/Edge executable;
`XERTE_TEST_BASE_URL` changes the local test directory URL. Pass a fixture name
instead of `--all` to run one page, for example `iframe-properties.html`.

The **Iframe** button embeds a webpage URL or relative project path without a
media-provider lookup. Select an existing iframe and use the button, its
properties toolbar, double-click, or right-click to edit it. The editor renders
the webpage inside a selectable frame with percentage resize handles. Media
and iframe properties share their dialog, dimensions, reset and alignment
controls; iframe-specific settings remain under Advanced. New frames default
to 100% width and automatic 16:9 proportions; existing pixel sizes reopen with
explicit units. General HTML Support
continues to serialize the original element and its surrounding markup, keeping
unmodified permissions, classes, styles, IDs and other attributes. Provider
media widgets and explicit HTML Embed blocks retain their own controls.

## Update procedure

1. **Record a baseline.** Commit the working integration and its tests. Run the
   initial check before changing versions so existing failures are distinguishable.
   Keep copies of representative older content for comparison and rollback.
2. **Choose the version deliberately.** Read the upstream changelog and every
   intervening major/minor update guide relevant to the installation. Start with
   the [official update guide](https://ckeditor.com/docs/ckeditor5/latest/updating/guides/updating-ckeditor-5.html).
   Review licensing/feature availability against the project's existing notice.
3. **Update dependencies.** Change the exact `ckeditor5` version in
   `package.json`, run `npm install`, and retain the resulting lockfile. Update
   build tools only when required. `npm ci` reproduces the lockfile; it does not
   select a newer editor version.
4. **Adapt integration code.** Keep supported imports from `ckeditor5`; avoid
   returning to removed `/src/` imports. Review editor creation, translations,
   conversion rules, table styles, and the iframe plugin's private CKEditor hooks.
   Keep the bridge's `CKEDITOR.instances`/jQuery compatibility behavior.

   In iframe mode, floating UI must stay in the wizard document. CKEditor 49
   otherwise follows the editable into the content iframe, while Xerte's balloon
   bridge supplies wizard coordinates. Preserve the explicit `ui.overlayContainer`
   and the fullscreen `--ck-layer-*` overrides; checking that a toolbar exists
   does not establish that it is visible or reachable.
5. **Build and verify.** Run `npm run check`, the browser runner, and the manual
   checks below. Fix regressions and add the smallest fixture that reproduces
   each one. Compare meaning/behavior and required attributes, allowing valid
   CKEditor 5 normalization.
6. **Review and distribute together.** Include source, package/lockfile changes,
   generated bundle/translations, necessary bridge/player CSS changes, tests,
   documentation, and `LICENSE-NOTICE.txt`. Check versioned script URLs in the
   Xerte, Site, and Decision entry pages. Reopen the actual editor after deployment
   to confirm it loads the new assets rather than a cached bundle.

The build overwrites the served bundle. The repository currently tracks
`node_modules`, so installing dependencies can produce a large Git diff. Treat
any future dependency-directory cleanup as a separate change.

## Where customizations belong

| File/location | Purpose |
| --- | --- |
| `src/xerte-editor.js` | Plugin registration, toolbar and default configuration |
| `src/plugins/` | Xerte tools and converters; edit source and rebuild |
| `../js/vendor/ckeditor5/xerte-ckeditor5.js` | Hand-maintained bridge, legacy configuration and language loading |
| `../js/vendor/ckeditor5/lang/` | Hand-maintained Xerte language overrides; the build preserves these files |
| `scripts/copy-translations.mjs` | Copies matching upstream translations to the served assets |
| `webpack.config.js` | Bundle/CSS processing, including Xerte's table-default integration |
| `tests/browser-contract.js` | Explicit expected plugin/toolbar inventory; update deliberately when features change |
| `tests/fixtures/legacy-cases.js` | Small synthetic older-content examples and semantic expectations |

Translations must reach the editor as language-keyed objects, for example
`{ nl: { dictionary: { Bold: 'Vet' }, getPluralForm } }`. The bridge loads the
upstream dictionary first and applies local overrides afterwards. Merely finding
strings in a global object is insufficient: tests must exercise CKEditor's
translation service. Do not hand-edit the generated bundle or upstream dictionaries.

## Manual checks before wider use

- [ ] Representative older projects in Xerte, Site, and Decision: display,
  edit/save/reopen, preview, and published playback with their real themes.
- [ ] Standard authoring: keyboard navigation, selection, copy/paste (including
  Office content), undo/redo, multiple fields, page switching, and closing/reopening.
- [ ] Real image/file uploads and selection through elFinder, media playback,
  lightboxes, page navigation links, and supported audio recording/upload workflows.
- [ ] Formulas render, icons appear, and ruby/columns/styles match published output.
- [ ] Toolbar modes, fullscreen, mouse/keyboard resize, dialogs and floating
  toolbars stay correctly positioned in relevant themes and supported browsers.
- [ ] Accessibility: useful alt text and language attributes survive, keyboard
  focus remains usable, and the accessibility checker still opens and reports issues.

For failures, save the test report plus reproduction steps, browser/version,
framework/theme, and a minimal non-sensitive HTML example. Add that example to
the fixtures when practical. If reverting an editor upgrade, restore the matching
source and built assets together; reverting code does not undo content already
saved by a newer editor. Use content copies when evaluating a rollback.
