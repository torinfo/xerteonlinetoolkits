import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';

test( 'Source-save browser fixture loads the dependencies needed by every real save entry point', async () => {
	const file = new URL( './source-save.html', import.meta.url );
	const html = await readFile( file, 'utf8' );
	const requests = [];
	const $ = () => ( {} );
	$.each = ( object, callback ) => Object.entries( object ).forEach( ( [ key, value ] ) => callback( key, value ) );
	$.ajax = options => {
		requests.push( options );
		const response = { done: () => response, fail: () => response };
		return response;
	};
	const context = vm.createContext( { $, jQuery: $, console } );
	context.window = context;
	// Use the fixture's actual bootstrap and application-script ordering. Editor
	// rendering is left to the browser; this checks its save harness dependencies.
	for ( const script of html.matchAll( /<script\b([^>]*)>([\s\S]*?)<\/script>/g ) ) {
		const src = script[ 1 ].match( /\bsrc="([^"]+)"/ )?.[ 1 ];
		if ( src?.includes( 'template_management.js' ) || src?.includes( 'tree.js' ) ) {
			vm.runInContext( await readFile( new URL( src, file ), 'utf8' ), context, { filename: src } );
		} else if ( !src && script[ 2 ].includes( 'var EDITOR =' ) ) {
			vm.runInContext( script[ 2 ], context );
		}
	}
	context.lo_data = {
		treeroot: { attributes: { nodeName: 'learningObject' } },
		page1: { data: '<p>Old data</p>' }, page2: { data: '<p>Second field</p>' }
	};
	let pending;
	context.XerteCKEditor5Facade = { syncSourceData() { context.lo_data.page1.data = pending; } };
	for ( const [ name, save ] of [
		[ 'preview', () => context.preview( {} ) ], [ 'publish', () => context.publish() ],
		[ 'async save', () => context.savepreviewasync( true ) ],
		[ 'close save', () => context.savepreviewasync( false ) ], [ 'LTI save', () => context.lti_save() ]
	] ) {
		pending = '<p>Pending Source: ' + name + '</p>';
		save();
		const request = requests.pop();
		assert.ok( request, name + ': save request missing' );
		const payload = JSON.parse( decodeURIComponent( request.data.lo_data ) );
		assert.equal( payload.children[ 0 ].data, pending, name + ': pending Source data missing from save payload' );
	}
} );
