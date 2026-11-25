import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';
import postcss from 'postcss';
import { Locale } from '@ckeditor/ckeditor5-utils';
import webpackConfig from '../webpack.config.js';

const bridgeSource = await readFile( new URL( '../../js/vendor/ckeditor5/xerte-ckeditor5.js', import.meta.url ), 'utf8' );
const sourceRoot = new URL( '../', import.meta.url );
const cssPlugins = webpackConfig.module.rules.find( rule => rule.test.test( 'style.css' ) )
	.use.find( item => item.loader === 'postcss-loader' ).options.postcssOptions.plugins;

test( 'v49 table CSS retains Xerte player defaults and editor interaction styles', async () => {
	const upstreamPath = new URL( 'node_modules/ckeditor5/dist/ckeditor5.css', sourceRoot );
	const upstream = await postcss( cssPlugins ).process( await readFile( upstreamPath, 'utf8' ), { from: upstreamPath.pathname } );
	assert.ok( !upstream.css.includes( 'background: var(--ck-content-table-header-background)' ), 'stock header fill must not override themes' );
	upstream.root.walkRules( rule => {
		if ( rule.selector.includes( '.ck-content' ) && rule.selector.includes( '.table' ) ) {
			assert.ok( !rule.nodes.some( node => node.prop === 'min-width' && node.value === '2em' ), 'stock content table sizing must not override player defaults' );
		}
	} );
	assert.ok( upstream.css.includes( '.ck-widget_selected' ), 'editor selection styles must remain' );
	assert.ok( upstream.css.includes( 'table-style-align-left' ), 'new table alignment styles must remain available in the editor' );
	const playerPath = new URL( '../../modules/common/css/rich-text-tables.css', sourceRoot );
	const player = await postcss( cssPlugins ).process( await readFile( playerPath, 'utf8' ), { from: playerPath.pathname } );
	assert.ok( player.css.includes( 'padding: 10px' ) );
	assert.ok( player.css.includes( 'border: 1px solid #808080' ) );
} );

test( 'every shipped language loads its upstream dictionary and preserves Xerte overrides', async () => {
	const languages = [ 'en', 'cs', 'de', 'el', 'es', 'fr', 'it', 'ja', 'nb', 'nl', 'pl', 'pt', 'ru', 'tr', 'uk' ];
	for ( const language of languages ) {
		const context = vm.createContext( { document: { currentScript: null }, location: { search: '' } } );
		context.window = context;
		if ( language !== 'en' ) {
			vm.runInContext( await readFile( new URL( `../../js/vendor/ckeditor5/translations/${ language }.js`, import.meta.url ), 'utf8' ), context );
			assert.ok( context.CKEDITOR_TRANSLATIONS[ language ].dictionary.Bold, `${ language }: upstream dictionary missing` );
		}
		for ( const code of language === 'en' ? [ 'en' ] : [ 'en', language ] ) {
			vm.runInContext( await readFile( new URL( `../../js/vendor/ckeditor5/lang/${ code }.js`, import.meta.url ), 'utf8' ), context );
		}
		vm.runInContext( bridgeSource, context );
		const config = context.XerteCKEditor5Facade.mergeEditorConfig( {}, { requestedLanguage: language, uiLanguage: language } );
		assert.equal( config.language.ui, language );
		// Exercise CKEditor's real translation service, rather than only checking
		// that dictionary objects are present somewhere in the configuration.
		const locale = new Locale( { uiLanguage: config.language.ui, translations: config.translations } );
		if ( language === 'en' ) {
			assert.equal( locale.t( 'Choose language' ), 'Set language', 'English overrides must reach CKEditor' );
		} else {
			assert.equal( locale.t( 'Bold' ), context.CKEDITOR_TRANSLATIONS[ language ].dictionary.Bold, `${ language }: upstream translation unavailable to CKEditor` );
			assert.equal( locale.t( 'Image Properties' ), context.CKEDITOR_TRANSLATIONS[ language ].dictionary['Image Properties'], `${ language }: Xerte override unavailable to CKEditor` );
		}
	}
} );

test( 'legacy placeholder configuration reaches the modern root config', () => {
	const context = vm.createContext( { document: { currentScript: null }, location: { search: '' } } );
	context.window = context;
	vm.runInContext( bridgeSource, context );
	const config = context.XerteCKEditor5Facade.mergeEditorConfig( { editorplaceholder: 'Type here' } );
	assert.equal( config.root.placeholder, 'Type here' );
} );

for ( const inlineEditor of [ false, true ] ) {
	test( `${ inlineEditor ? 'Inline' : 'Classic' } initialization uses the v49 signature and versioned language assets`, async () => {
		const urls = [];
		const stopAfterCreate = new Error( 'configuration captured' );
		let capturedConfig;
		const type = { create( config ) { capturedConfig = config; return Promise.reject( stopAfterCreate ); } };
		const context = vm.createContext( {
			location: { search: '' }, language: { $code: 'nl-NL' },
			XerteCKEditor5: { Classic: type, Inline: type },
			document: {
				currentScript: { src: 'https://example.test/editor/js/vendor/ckeditor5/xerte-ckeditor5.js?build=123' },
				createElement: () => ( {} ),
				head: { appendChild( script ) { urls.push( script.src ); script.onload(); } }
			}
		} );
		context.window = context;
		vm.runInContext( bridgeSource, context );
		const field = { id: 'field' };
		await assert.rejects( context.XerteCKEditor5Facade.create( field, { inlineEditor } ), error => error === stopAfterCreate );
		assert.equal( inlineEditor ? capturedConfig.root.element : capturedConfig.attachTo, field );
		assert.deepEqual( urls, [
			'https://example.test/editor/js/vendor/ckeditor5/translations/nl.js?build=123',
			'https://example.test/editor/js/vendor/ckeditor5/lang/nl.js?build=123'
		] );
	} );
}
