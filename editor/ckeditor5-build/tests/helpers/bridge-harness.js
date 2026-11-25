import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const assets = new URL( '../../../js/vendor/ckeditor5/', import.meta.url );
const bridge = await readFile( new URL( 'xerte-ckeditor5.js', assets ), 'utf8' );

/** Exercise the real bridge and language files without starting a browser. */
export async function bridgeHarness( { language = 'en', missing = [], globals = {}, afterScript = () => {} } = {} ) {
	const requests = [];
	const configurations = [];
	const captured = new Error( 'Editor configuration captured' );
	const type = { create( config ) { configurations.push( config ); return Promise.reject( captured ); } };
	const context = vm.createContext( {
		console, location: { search: '' }, language: { $code: language },
		XerteCKEditor5: { Classic: type, Inline: type }, ...globals,
		document: {
			currentScript: { src: 'https://example.test/editor/js/vendor/ckeditor5/xerte-ckeditor5.js?build=test' },
			createElement: () => ( {} ),
			head: { appendChild( script ) {
				const relative = new URL( script.src ).pathname.match( /\/(translations|lang)\/[^/]+\.js$/ )[ 0 ].slice( 1 );
				requests.push( relative );
				queueMicrotask( async () => {
					try {
						if ( missing.includes( relative ) ) throw new Error( 'Simulated missing asset' );
						vm.runInContext( await readFile( new URL( relative, assets ), 'utf8' ), context );
						afterScript( relative, context );
					} catch {
						script.onerror();
						return;
					}
					script.onload();
				} );
			} }
		}
	} );
	context.window = context;
	vm.runInContext( await readFile( new URL( 'lang/en.js', assets ), 'utf8' ), context );
	vm.runInContext( bridge, context );
	return {
		context, requests, configurations,
		merge: ( config = {} ) => context.XerteCKEditor5Facade.mergeEditorConfig( config ),
		async create( config = {} ) {
			try { await context.XerteCKEditor5Facade.create( { id: 'test-field' }, config ); }
			catch ( error ) { if ( error !== captured ) throw error; }
			return configurations.at( -1 );
		}
	};
}
