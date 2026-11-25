/** Publish the upstream UMD dictionaries used by Xerte's language loader. */
import { copyFile, mkdir } from 'node:fs/promises';

const languages = [ 'cs', 'de', 'el', 'es', 'fr', 'it', 'ja', 'nb', 'nl', 'pl', 'pt', 'ru', 'tr', 'uk' ];
const output = new URL( '../../js/vendor/ckeditor5/translations/', import.meta.url );
await mkdir( output, { recursive: true } );
for ( const language of languages ) {
	await copyFile(
		new URL( `../node_modules/ckeditor5/dist/translations/${ language }.umd.js`, import.meta.url ),
		new URL( `${ language }.js`, output )
	);
}
