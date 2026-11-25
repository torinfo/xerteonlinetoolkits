# CKEditor 49 beta migration record

Target: **49.1.0**. Load and preserve older CKEditor 4 content; new content may
use CKEditor 5 markup.

For future updates, commands, and the acceptance checklist, use [the maintenance
guide](README.md). Run the [browser suite](http://localhost/xotlatest/editor/ckeditor5-build/tests/index.html)
for the initial checks. The previous v49-smoke.html link still works.

## Implemented

- Supported ckeditor5 package and modern imports throughout the editor and custom plugins.
- Updated Classic/Inline initialization and language-keyed translation configuration.
- Preserved custom plugins, toolbar registrations, and hand-maintained language files.
- Rebuilt bundle and upstream translations; preserved Xerte table styling and inline table alignment.
- Added build timestamps to application script URLs to refresh cached assets.
- Added lasting translation, bridge, legacy-content, lifecycle, and test-runner checks.
- Added a single Node-test entry point for both existing test directories.

## Validation and remaining work

- The original English/Dutch initial check was reported working by the project owner
  after correcting the translation configuration.
- Saving with Source still open was also reported working in the real local Xerte editor.
- Production build, Node tests, and syntax checks are recorded in the handoff.
- The expanded browser suite still needs to be run by the project owner.
- Representative older projects and real media/upload/playback workflows still need
  the manual checks in the maintenance guide.

This record does not certify the expanded browser suite or published content.
