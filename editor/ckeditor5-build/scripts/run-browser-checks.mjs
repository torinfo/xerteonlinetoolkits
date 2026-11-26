/** Run local fixtures in a separate headless Chrome/Edge profile using Node 24's CDP WebSocket. */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve, sep } from 'node:path';
import { browserChecks } from '../tests/browser-suite.js';

const browser = process.env.XERTE_TEST_BROWSER || [
	'C:/Program Files/Google/Chrome/Application/chrome.exe',
	'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
].find( existsSync );
if ( !browser ) throw new Error( 'Set XERTE_TEST_BROWSER to the Chrome or Edge executable.' );
const base = process.env.XERTE_TEST_BASE_URL || 'http://localhost/xotlatest/editor/ckeditor5-build/tests/';
const screenshot = process.argv.find( value => value.startsWith( '--screenshot=' ) )?.slice( '--screenshot='.length );
const pages = process.argv.includes( '--all' ) ? browserChecks.map( check => check.url ) : process.argv.slice( 2 ).filter( value => !value.startsWith( '--screenshot=' ) );
if ( !pages.length ) pages.push( 'iframe-properties.html' );
const delay = milliseconds => new Promise( resolve => setTimeout( resolve, milliseconds ) );
const profile = await mkdtemp( join( tmpdir(), 'xerte-browser-check-' ) );
const child = spawn( browser, [ '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
	'--disable-background-networking', '--remote-debugging-port=0', `--user-data-dir=${ profile }`, 'about:blank' ],
{ stdio: [ 'ignore', 'ignore', 'pipe' ], windowsHide: true } );
const pending = new Map();
let socket, nextId = 0;
function call( method, params = {}, sessionId ) {
	const id = ++nextId;
	return new Promise( ( resolve, reject ) => {
		const timer = setTimeout( () => { pending.delete( id ); reject( new Error( 'CDP timeout: ' + method ) ); }, 15000 );
		pending.set( id, { resolve: value => { clearTimeout( timer ); resolve( value ); }, reject: error => { clearTimeout( timer ); reject( error ); } } );
		socket.send( JSON.stringify( { id, method, params, ...( sessionId ? { sessionId } : {} ) } ) );
	} );
}
try {
	const endpoint = await new Promise( ( resolve, reject ) => {
		let log = '';
		const timeout = setTimeout( () => reject( new Error( 'Browser startup timed out: ' + log.slice( -1000 ) ) ), 15000 );
		child.once( 'error', error => { clearTimeout( timeout ); reject( error ); } );
		child.stderr.on( 'data', chunk => {
			log += chunk.toString();
			const match = log.match( /DevTools listening on (ws:\/\/\S+)/ );
			if ( match ) { clearTimeout( timeout ); resolve( match[ 1 ] ); }
		} );
	} );
	socket = new WebSocket( endpoint );
	socket.addEventListener( 'message', event => {
		const message = JSON.parse( event.data ); const request = pending.get( message.id );
		if ( !request ) return;
		pending.delete( message.id );
		if ( message.error ) request.reject( new Error( message.error.message ) ); else request.resolve( message.result );
	} );
	await new Promise( ( resolve, reject ) => { socket.addEventListener( 'open', resolve, { once: true } ); socket.addEventListener( 'error', reject, { once: true } ); } );
	let failures = 0;
	for ( const page of pages ) {
		const url = new URL( page, base ); url.searchParams.set( 'testRun', Date.now() );
		const { targetId } = await call( 'Target.createTarget', { url: 'about:blank' } );
		const { sessionId } = await call( 'Target.attachToTarget', { targetId, flatten: true } );
		await call( 'Emulation.setDeviceMetricsOverride', { width: 1280, height: 1000, deviceScaleFactor: 1, mobile: false }, sessionId );
		await call( 'Target.activateTarget', { targetId } );
		await call( 'Page.navigate', { url: url.href }, sessionId );
		const started = Date.now();
		let state;
		while ( Date.now() - started < 90000 ) {
			await delay( 100 );
			const result = await call( 'Runtime.evaluate', { returnByValue: true,
				expression: '({status:document.documentElement.dataset.testStatus,failure:document.documentElement.dataset.runtimeFailure,output:document.querySelector("#results")?.textContent})' }, sessionId );
			state = result.result.value;
			if ( [ 'passed', 'failed' ].includes( state?.status ) ) break;
		}
		const passed = state?.status === 'passed' && !state.failure;
		console.log( `${ passed ? 'PASS' : 'FAIL' }: ${ page } (${ Date.now() - started }ms)` );
		console.log( state?.failure || state?.output || 'No completion marker within 90 seconds.' );
		if ( !passed ) failures++;
		if ( screenshot && page === pages.at( -1 ) ) {
			const capture = await call( 'Page.captureScreenshot', { format: 'png' }, sessionId );
			await writeFile( screenshot, Buffer.from( capture.data, 'base64' ) );
			console.log( 'Screenshot: ' + resolve( screenshot ) );
		}
		await call( 'Target.closeTarget', { targetId } );
	}
	console.log( `${ pages.length - failures } browser pages passed; ${ failures } failed.` );
	if ( failures ) process.exitCode = 1;
} finally {
	if ( socket?.readyState === WebSocket.OPEN ) {
		await call( 'Browser.close' ).catch( () => {} ); socket.close();
	}
	if ( child.exitCode === null ) {
		await Promise.race( [ new Promise( resolve => child.once( 'exit', resolve ) ), delay( 2000 ) ] );
		if ( child.exitCode === null ) child.kill();
	}
	// Delete only the dedicated profile created above, after checking the absolute target.
	const target = resolve( profile );
	if ( target.startsWith( resolve( tmpdir() ) + sep ) && basename( target ).startsWith( 'xerte-browser-check-' ) ) {
		await rm( target, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 } ).catch( error => console.error( 'Temporary browser profile cleanup: ' + error.message ) );
	}
}
