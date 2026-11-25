import assert from 'node:assert/strict';
import test from 'node:test';
import { Locale } from '@ckeditor/ckeditor5-utils';
import { bridgeHarness } from './helpers/bridge-harness.js';

const localeFor = config => new Locale( { uiLanguage: config.language.ui, translations: config.translations } );

test( 'regional language codes load the real core dictionary followed by local overrides', async () => {
	const bridge = await bridgeHarness( { language: 'nl_NL' } );
	const config = await bridge.create();
	assert.deepEqual( bridge.requests, [ 'translations/nl.js', 'lang/nl.js' ] );
	assert.equal( localeFor( config ).t( 'Bold' ), 'Vet' );
	assert.equal( localeFor( config ).t( 'Image Properties' ), 'Afbeeldingseigenschappen' );
} );

test( 'local overrides win when their keys also occur in the upstream dictionary', async () => {
	const bridge = await bridgeHarness( { language: 'nl', afterScript( file, context ) {
		if ( file === 'lang/nl.js' ) context.CKEDITOR_TRANSLATIONS.nl.dictionary.Bold = 'Custom Dutch label';
	} } );
	assert.equal( localeFor( await bridge.create() ).t( 'Bold' ), 'Custom Dutch label' );
} );

test( 'a missing upstream language falls back to usable English', async () => {
	const bridge = await bridgeHarness( { language: 'nl', missing: [ 'translations/nl.js' ] } );
	const config = await bridge.create();
	assert.equal( config.language.ui, 'en' );
	assert.equal( localeFor( config ).t( 'Choose language' ), 'Set language' );
} );

test( 'a missing local override file retains the working upstream language', async () => {
	const bridge = await bridgeHarness( { language: 'nl', missing: [ 'lang/nl.js' ] } );
	const config = await bridge.create();
	assert.equal( config.language.ui, 'nl' );
	assert.equal( localeFor( config ).t( 'Bold' ), 'Vet' );
} );

test( 'concurrent editor creation loads each language asset only once', async () => {
	const bridge = await bridgeHarness( { language: 'nl' } );
	await Promise.all( [ bridge.create(), bridge.create(), bridge.create() ] );
	assert.deepEqual( bridge.requests, [ 'translations/nl.js', 'lang/nl.js' ] );
	assert.equal( bridge.configurations.length, 3 );
	for ( const config of bridge.configurations ) assert.equal( localeFor( config ).t( 'Bold' ), 'Vet' );
} );

test( 'unknown languages fall back without preventing editor initialization', async () => {
	const bridge = await bridgeHarness( { language: 'zz-ZZ' } );
	assert.equal( ( await bridge.create() ).language.ui, 'en' );
} );

test( 'legacy media browser URLs use the CKEditor 5 callback mode', async () => {
	const bridge = await bridgeHarness();
	const config = bridge.merge( {
		filebrowserImageBrowseUrl: 'browse.php?mode=cke&type=image&folder=demo',
		filebrowserBrowseUrl: 'browse.php?folder=demo&mode=cke'
	} );
	assert.equal( config.xerteBrowseImageUrl, 'browse.php?mode=cke5&type=image&folder=demo' );
	assert.equal( config.xerteBrowseMediaUrl, 'browse.php?folder=demo&mode=cke5' );
} );

test( 'upload and browser URLs retain project paths containing spaces and ampersands', async () => {
	const bridge = await bridgeHarness( { globals: {
		rlopathvariable: '/projects/Demo & test/', rlourlvariable: 'https://example.test/Demo & test/'
	} } );
	const config = bridge.merge();
	const upload = new URL( config.xerteUploadUrl, 'https://example.test/' );
	const browse = new URL( config.xerteBrowseImageUrl, 'https://example.test/' );
	assert.equal( upload.searchParams.get( 'uploadPath' ), '/projects/Demo & test/' );
	assert.equal( browse.searchParams.get( 'uploadURL' ), 'https://example.test/Demo & test' );
} );

test( 'legacy custom toolbar names resolve to the corresponding Xerte controls', async () => {
	const bridge = await bridgeHarness();
	const config = bridge.merge( { toolbar: [ 'Source', 'Link', 'xotlink', 'Image', 'html5audio', 'xotcolumns', 'Mathjax', 'FontAwesome', 'rubytext' ] } );
	assert.deepEqual( Array.from( config.toolbar.items ), [ 'sourceEditing', 'xerteLink', 'xotlink', 'xerteBrowseImage', 'xerteAudio', 'autocolumns', 'xerteMathJax', 'fontAwesome', 'xerteRubyText' ] );
} );

test( 'Inline uses its source dialog and stays outside the themed iframe', async () => {
	const bridge = await bridgeHarness();
	const config = bridge.merge( { inlineEditor: true, toolbar: [ 'Source', 'Bold' ] } );
	assert.deepEqual( Array.from( config.toolbar.items ), [ 'xerteSourceDialog', 'bold' ] );
	assert.equal( config.xerteIframeEditing, false );
	assert.equal( config.menuBar.isVisible, false );
} );

test( 'Site uses Site theme styles and preserves text-language directions', async () => {
	const bridge = await bridgeHarness( { globals: { templateframework: 'site' } } );
	const config = bridge.merge();
	assert.ok( config.xerteIframeStylesheets.includes( 'modules/site/parent_templates/site/common/css/bootstrap.css?build=test' ) );
	assert.ok( !config.xerteIframeStylesheets.some( url => url.includes( 'Nottingham' ) ) );
	assert.equal( config.language.textPartLanguage.find( item => item.languageCode === 'ar' ).textDirection, 'rtl' );
	assert.equal( config.language.textPartLanguage.find( item => item.languageCode === 'he' ).textDirection, 'rtl' );
} );

test( 'pending Source edits are synchronized in every ready editor before saving', async () => {
	const bridge = await bridgeHarness();
	let commits = 0;
	const editor = ( state, isSourceEditingMode ) => ( {
		state, plugins: { has: () => true, get: () => ( { isSourceEditingMode, updateEditorData() { commits++; } } ) }
	} );
	Object.assign( bridge.context.__xerteCke5Instances, {
		first: editor( 'ready', true ), second: editor( 'ready', true ),
		rich: editor( 'ready', false ), loading: editor( 'initializing', true )
	} );
	bridge.context.XerteCKEditor5Facade.syncSourceData();
	assert.equal( commits, 2 );
} );

test( 'destroying an old instance cannot remove its replacement from the bridge registry', async () => {
	const bridge = await bridgeHarness();
	let finish;
	bridge.context.__xerteCke5Instances.field = { destroy: () => new Promise( resolve => { finish = resolve; } ) };
	const destroyed = bridge.context.XerteCKEditor5Facade.destroyById( 'field' );
	const replacement = {};
	bridge.context.__xerteCke5Instances.field = replacement;
	finish();
	await destroyed;
	assert.equal( bridge.context.__xerteCke5Instances.field, replacement );
} );
