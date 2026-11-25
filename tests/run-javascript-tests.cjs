// One entry point for project-wide and CKEditor-specific Node tests.
// Run from the project root: node tests/run-javascript-tests.cjs
const { readdirSync } = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const project = path.resolve(__dirname, '..');
const directories = [__dirname, path.join(project, 'editor', 'ckeditor5-build', 'tests')];
const files = directories.flatMap(directory => readdirSync(directory)
    .filter(name => /\.test\.(?:js|cjs|mjs)$/.test(name))
    .sort()
    .map(name => path.join(directory, name)));
if (!files.length) throw new Error('No JavaScript tests found.');
const result = spawnSync(process.execPath, ['--test', ...files], { cwd: project, stdio: 'inherit' });
if (result.error) console.error(result.error.message);
process.exitCode = result.status ?? 1;
