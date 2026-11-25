import { browserChecks, pageResult } from './browser-suite.js';

const entries = browserChecks.map( check => {
	const row = document.createElement( 'li' );
	const link = document.createElement( 'a' );
	link.href = check.url; link.textContent = check.name; link.target = '_blank';
	const state = document.createElement( 'span' ); state.textContent = ' — not run';
	row.append( link, state ); document.querySelector( '#checks' ).appendChild( row );
	return { ...check, row, state };
} );

function runPage( check, runId ) {
	return new Promise( resolve => {
		const frame = document.createElement( 'iframe' );
		frame.title = check.name;
		const url = new URL( check.url, location.href ); url.searchParams.set( 'testRun', runId );
		let loaded = false;
		frame.addEventListener( 'load', () => { loaded = true; } );
		frame.src = url.href;
		document.querySelector( '#active' ).replaceChildren( frame );
		const start = Date.now();
		const poll = setInterval( () => {
			let result;
			try {
				const doc = loaded ? frame.contentDocument : null;
				const root = doc?.documentElement;
				result = pageResult( {
					status: root?.dataset.testStatus,
					runtimeFailure: root?.dataset.runtimeFailure,
					output: doc?.querySelector( '#results' )?.textContent || ''
				}, Date.now() - start >= 90000 );
			} catch ( error ) { result = { status: 'failed', output: String( error ) }; }
			if ( result.status === 'running' ) return;
			clearInterval( poll ); frame.remove();
			resolve( { ...result, name: check.name, url: check.url, milliseconds: Date.now() - start } );
		}, 200 );
	} );
}

document.querySelector( '#run' ).addEventListener( 'click', async event => {
	const button = event.currentTarget;
	const summary = document.querySelector( '#summary' );
	const report = document.querySelector( '#report' );
	button.disabled = true;
	const results = [];
	for ( const entry of entries ) { entry.state.textContent = ' — queued'; delete entry.row.dataset.status; }
	try {
		let version = 'unknown';
		try { version = ( await ( await fetch( '../package.json', { cache: 'no-store' } ) ).json() ).dependencies.ckeditor5; } catch {}
		const header = 'Xerte CKEditor browser checks\nExpected version: ' + version + '\n' + new Date().toISOString();
		for ( const entry of entries ) {
			summary.textContent = `Running ${ results.length + 1 }/${ entries.length }: ${ entry.name }`;
			entry.state.textContent = ' — running';
			const result = await runPage( entry, Date.now() );
			results.push( result );
			entry.state.textContent = ' — ' + result.status.toUpperCase();
			entry.row.dataset.status = result.status;
			report.value = header + '\n\n' + results.map( item => `${ item.status.toUpperCase() }: ${ item.name } (${ item.url })\n${ item.output }` ).join( '\n\n' );
		}
		const failed = results.filter( result => result.status === 'failed' ).length;
		summary.textContent = `${ results.length - failed } passed, ${ failed } failed.`;
		summary.dataset.status = failed ? 'failed' : 'passed';
		document.documentElement.dataset.testStatus = failed ? 'failed' : 'passed';
	} finally { button.disabled = false; }
} );
