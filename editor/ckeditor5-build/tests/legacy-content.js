import { legacyCases } from './fixtures/legacy-cases.js';
import { modes, mountEditor, record, finish, verifyLegacy } from './browser-helpers.js';

// This fixture tests equation source conversion, not MathJax's renderer.
window.MathJax = { Hub: { Queue() {} } };
const failures = [];
try {
	for ( const mode of modes ) {
		const entry = await mountEditor( mode );
		try {
			for ( const sample of legacyCases ) {
				try {
					entry.editor.setData( sample.html );
					for ( let cycle = 0; cycle < 3; cycle++ ) {
						const saved = entry.editor.getData();
						verifyLegacy( saved, sample, `${ mode.name }, load ${ cycle + 1 }` );
						entry.editor.setData( '<p>Another page</p>' );
						entry.editor.setData( saved );
					}
					verifyLegacy( entry.editor.getData(), sample, mode.name + ', final reload' );
					record( mode.name + ': ' + sample.name + ' survives loading and three save/reload cycles' );
				} catch ( error ) {
					failures.push( error.stack || String( error ) );
					// Keep collecting cases; the runner waits for the final status.
					const output = document.querySelector( '#results' );
					if ( output.textContent === 'Running…' ) output.textContent = '';
					output.textContent += '\nCHECK FAILED: ' + error.message + '\nSaved HTML: ' + entry.editor.getData() + '\n';
				}
			}
		} finally {
			await CKEDITOR.instances[ entry.field.id ].destroy();
			entry.section.remove();
		}
	}
	finish( failures.length ? new Error( failures.length + ' legacy-content checks failed:\n' + failures.join( '\n\n' ) ) : undefined );
} catch ( error ) { finish( error ); }
