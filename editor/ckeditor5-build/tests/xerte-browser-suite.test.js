import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';
import { browserChecks, pageResult } from './browser-suite.js';

const runnerSource = ( await readFile( new URL( './browser-runner.js', import.meta.url ), 'utf8' ) )
	.replace( /^import[^\n]+\n/, '' );

// Run the actual runner with controlled iframe load events and a manual clock.
function runnerHarness() {
	let poll, load, frame, now = 0, documentReads = 0, removed = false, cleared = false;
	const context = vm.createContext( {
		browserChecks: [], pageResult, URL, location: { href: 'https://example.test/tests/index.html' },
		Date: { now: () => now },
		setInterval( callback ) { poll = callback; return 1; },
		clearInterval() { cleared = true; },
		document: {
			createElement() {
				frame = {
					addEventListener( type, callback ) { if ( type === 'load' ) load = callback; },
					get contentDocument() {
						documentReads++;
						return { documentElement: { dataset: { testStatus: 'passed' } }, querySelector: () => ( { textContent: 'PASS: complete' } ) };
					},
					remove() { removed = true; }
				};
				return frame;
			},
			querySelector: () => ( { replaceChildren() {}, addEventListener() {} } )
		}
	} );
	vm.runInContext( runnerSource, context );
	return {
		start: () => context.runPage( { name: 'Fixture', url: 'smoke.html' }, 1 ),
		poll: () => poll(), load: () => load(), advance: milliseconds => { now += milliseconds; },
		state: () => ( { documentReads, removed, cleared } )
	};
}

test( 'runner polls safely before iframe load and reads results only after load', async () => {
	const runner = runnerHarness();
	const result = runner.start();
	runner.poll();
	assert.deepEqual( runner.state(), { documentReads: 0, removed: false, cleared: false } );
	runner.load(); runner.poll();
	assert.equal( ( await result ).status, 'passed' );
	assert.deepEqual( runner.state(), { documentReads: 1, removed: true, cleared: true } );
} );

test( 'runner reports a real timeout when an iframe never loads', async () => {
	const runner = runnerHarness();
	const result = runner.start();
	runner.advance( 90001 ); runner.poll();
	assert.match( ( await result ).output, /No final result within 90 seconds/ );
	assert.deepEqual( runner.state(), { documentReads: 0, removed: true, cleared: true } );
} );

test( 'browser runner waits for explicit completion instead of accepting partial PASS output', () => {
	assert.equal( pageResult( { status: 'running', output: 'PASS: first check\nStill running…' } ).status, 'running' );
	assert.equal( pageResult( { status: 'passed', output: 'PASS: complete' } ).status, 'passed' );
} );

test( 'browser runner reports runtime errors and explicit failures even after a success marker', () => {
	assert.equal( pageResult( { status: 'passed', runtimeFailure: 'Script failed' } ).status, 'failed' );
	assert.equal( pageResult( { status: 'passed', output: 'PASS: first\nFAIL: second' } ).status, 'failed' );
	assert.equal( pageResult( { status: 'failed' } ).status, 'failed' );
} );

test( 'browser runner times out missing or stalled pages instead of reporting success', () => {
	assert.equal( pageResult( {}, true ).status, 'failed' );
	assert.match( pageResult( { output: 'Running…' }, true ).output, /90 seconds/ );
} );

test( 'all browser checks exist, have valid inline JavaScript, and report completion', async () => {
	assert.equal( new Set( browserChecks.map( entry => entry.url ) ).size, browserChecks.length );
	for ( const entry of browserChecks ) {
		const file = new URL( entry.url, import.meta.url );
		const html = await readFile( file, 'utf8' );
		assert.match( html, /test-page\.js/, entry.name + ': shared error reporting missing' );
		for ( const match of html.matchAll( /<script\b([^>]*)>([\s\S]*?)<\/script>/g ) ) {
			const src = match[ 1 ].match( /\bsrc="([^"]+)"/ );
			if ( src ) await readFile( new URL( src[ 1 ], file ), 'utf8' );
			else new vm.Script( match[ 2 ], { filename: entry.url } );
		}
		assert.ok( html.includes( 'dataset.testStatus' ) || /type="module" src="(?:legacy-content|editor-lifecycle)\.js"/.test( html ), entry.name + ': final result missing' );
	}
} );
