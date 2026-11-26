/**
 * Enumerate the actual pre-migration CKEditor installation and current bridge.
 * Read-only with respect to application code; writes an audit JSON report.
 * Run from the repository root: node editor/ckeditor5-build/scripts/audit-ckeditor4-support.mjs
 * Requires the build's installed development dependencies and local Git history.
 */
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parse } from 'acorn';
import vm from 'node:vm';
import { bridgeHarness } from '../tests/helpers/bridge-harness.js';

const root = fileURLToPath( new URL( '../../../', import.meta.url ) );
const firstMigration = 'ec9fe0e4b077bfc9213d2c95d0eb261669c550d8';
const git = ( ...args ) => execFileSync( 'git', args, { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 } );
const baseline = git( 'rev-parse', `${ firstMigration }^` ).trim();
const sourceRecords = [];
const oldRoot = 'editor/js/vendor/ckeditor/';
const currentRoot = 'editor/ckeditor5-build/';

function sourceRecord( path, text, revision ) {
	const record = { path, revision, sha256: createHash( 'sha256' ).update( text ).digest( 'hex' ) };
	sourceRecords.push( record );
	return { text, record, ast: parse( text, { ecmaVersion: 'latest', sourceType: 'module', locations: true } ) };
}
const oldSource = path => sourceRecord( path, git( 'show', `${ baseline }:${ path }` ), baseline );
const currentSource = async path => sourceRecord( path, await readFile( new URL( '../../../' + path, import.meta.url ), 'utf8' ), 'working-tree' );
function walk( node, fn ) {
	if ( !node || typeof node !== 'object' ) return;
	if ( node.type ) fn( node );
	for ( const [ key, value ] of Object.entries( node ) ) {
		if ( key === 'loc' ) continue;
		if ( Array.isArray( value ) ) value.forEach( child => walk( child, fn ) );
		else if ( value && typeof value === 'object' ) walk( value, fn );
	}
}
function memberPath( node ) {
	if ( node?.type === 'Identifier' ) return node.name;
	if ( node?.type === 'MemberExpression' ) return memberPath( node.object ) + '.' + ( node.computed ? node.property.value : node.property.name );
	return '';
}
function literal( node ) {
	if ( node?.type === 'Literal' ) return node.regex ? { regex: node.regex.pattern, flags: node.regex.flags } : node.value;
	if ( node?.type === 'ArrayExpression' ) return node.elements.map( literal );
	if ( node?.type === 'ObjectExpression' ) return Object.fromEntries( node.properties.filter( p => p.type === 'Property' ).map( p => [ p.key.name ?? p.key.value, literal( p.value ) ] ) );
	return undefined;
}
const at = ( source, node ) => ( { path: source.record.path, line: node.loc.start.line, revision: source.record.revision } );
const split = value => String( value || '' ).split( ',' ).filter( Boolean );
function assignments( source, prefix ) {
	const result = {};
	walk( source.ast, node => {
		if ( node.type !== 'AssignmentExpression' ) return;
		const name = memberPath( node.left );
		if ( name.startsWith( prefix ) && literal( node.right ) !== undefined ) result[ name.slice( prefix.length ) ] = literal( node.right );
	} );
	return result;
}
function registrations( source ) {
	const records = [];
	walk( source.ast, node => {
		if ( node.type !== 'CallExpression' || memberPath( node.callee ) !== 'CKEDITOR.plugins.add' || typeof node.arguments[ 0 ]?.value !== 'string' ) return;
		const definition = node.arguments[ 1 ];
		const properties = literal( definition ) || {};
		const ui = [];
		walk( definition, child => {
			if ( child.type !== 'CallExpression' || ![ 'addButton', 'addRichCombo' ].includes( child.callee?.property?.name ) ) return;
			const value = literal( child.arguments[ 0 ] );
			const options = literal( child.arguments[ 1 ] );
			ui.push( { kind: child.callee.property.name, name: typeof value === 'string' ? value : null,
				toolbar: options?.toolbar ?? null, location: at( source, child ),
				...( typeof value === 'string' ? {} : { dynamicRegistration: source.text.slice( child.start, child.end ) } ) } );
		} );
		records.push( { name: node.arguments[ 0 ].value, requires: split( properties.requires ), ui, location: at( source, node ) } );
	} );
	return records;
}
function providers( source ) {
	const records = [];
	walk( source.ast, node => {
		if ( node.type !== 'NewExpression' || node.callee?.property?.name !== 'OEmbedProvider' ) return;
		records.push( { name: literal( node.arguments[ 0 ] ), type: literal( node.arguments[ 1 ] ),
			urlPatterns: literal( node.arguments[ 2 ] ), endpointExpression: node.arguments[ 3 ] ? source.text.slice( node.arguments[ 3 ].start, node.arguments[ 3 ].end ) : null,
			location: at( source, node ) } );
	} );
	return records;
}

const core = oldSource( oldRoot + 'ckeditor.js' );
const config = oldSource( oldRoot + 'config.js' );
const oldConfig = assignments( config, 'config.' );
const coreConfig = assignments( core, 'CKEDITOR.config.' );
const toolboxSource = oldSource( 'editor/js/toolbox.js' );
const oldToolbarProfiles = {};
walk( toolboxSource.ast, node => {
	if ( node.type === 'VariableDeclarator' && [ 'defaultToolbar', 'fullToolbar' ].includes( node.id.name ) ) oldToolbarProfiles[ node.id.name ] = literal( node.init );
} );
const declared = new Map( registrations( core ).map( record => [ record.name, record ] ) );
const extraPlugins = split( oldConfig.extraPlugins );
const inlineExtraPlugins = [ 'sourcedialog', 'image3', 'fontawesome', 'rubytext', 'editorplaceholder' ];
const enabled = new Set( [ ...split( coreConfig.plugins ), ...extraPlugins, ...inlineExtraPlugins ] );
const externalFiles = new Map();
const loadedSources = [ core ];
for ( const name of enabled ) {
	if ( declared.has( name ) || externalFiles.has( name ) ) continue;
	const source = oldSource( `${ oldRoot }plugins/${ name }/plugin.js` );
	externalFiles.set( name, source.record );
	loadedSources.push( source );
	const found = registrations( source );
	for ( const record of found ) declared.set( record.name, record );
	// Packed plugins are retained in the inventory without evaluating their code.
	for ( const record of found ) for ( const dependency of record.requires ) enabled.add( dependency );
}
for ( const name of split( oldConfig.removePlugins ) ) enabled.delete( name );
const oldPlugins = [ ...enabled ].sort().map( name => ( {
	name, declaredBy: split( coreConfig.plugins ).includes( name ) ? 'bundled-default' : extraPlugins.includes( name ) ? 'extraPlugins' : inlineExtraPlugins.includes( name ) ? 'inline-extraPlugins' : 'dependency',
	...( declared.get( name ) || { source: externalFiles.get( name ), staticRegistrationUnavailable: true } )
} ) );

const styleSource = oldSource( oldRoot + 'styles.js' );
let styles;
walk( styleSource.ast, node => {
	if ( node.type === 'CallExpression' && memberPath( node.callee ) === 'CKEDITOR.stylesSet.add' ) styles = literal( node.arguments[ 1 ] );
} );
const actualLibrary = oldSource( oldRoot + 'plugins/oembed/libs/jquery.oembed.min.js' );
const siblingLibrary = oldSource( oldRoot + 'plugins/oembed/libs/jquery.oembed.js' );
const iframeDialog = oldSource( oldRoot + 'plugins/iframe/dialogs/iframe.js' );
const iframeDialogFields = new Set();
walk( iframeDialog.ast, node => {
	if ( node.type === 'Property' && ( node.key.name ?? node.key.value ) === 'id' && typeof literal( node.value ) === 'string' ) iframeDialogFields.add( literal( node.value ) );
} );
const oldProviders = providers( actualLibrary );
const siblingProviders = providers( siblingLibrary );
const newMedia = await currentSource( currentRoot + 'node_modules/@ckeditor/ckeditor5-media-embed/dist/index.js' );
let newProviders;
walk( newMedia.ast, node => {
	if ( node.type !== 'CallExpression' || node.callee?.property?.name !== 'define' || node.arguments[ 0 ]?.value !== 'mediaEmbed' ) return;
	const providerProperty = node.arguments[ 1 ]?.properties?.find( property => ( property.key.name ?? property.key.value ) === 'providers' );
	if ( !providerProperty ) return;
	const values = providerProperty.value.elements;
	newProviders = values.map( value => {
		const properties = literal( value );
		return { name: properties.name, urlPatterns: properties.url, savesEmbedHtml: value.properties.some( property => ( property.key.name ?? property.key.value ) === 'html' ), location: at( newMedia, value ) };
	} );
} );
const providerFile = await currentSource( currentRoot + 'src/plugins/xerte-media-properties-dialog.js' );
walk( providerFile.ast, node => {
	if ( node.type !== 'VariableDeclarator' || node.id.name !== 'xerteVideoProvider' ) return;
	const value = literal( node.init );
	newProviders.push( { name: value.name, urlPatterns: value.url, savesEmbedHtml: true, location: at( providerFile, node ) } );
} );
const names = new Map( newProviders.map( provider => [ provider.name.toLowerCase(), provider ] ) );
for ( const provider of oldProviders ) {
	const equivalent = names.get( provider.name.toLowerCase() );
	provider.currentProvider = equivalent?.name ?? null;
	provider.status = equivalent ? equivalent.savesEmbedHtml ? 'same-name-provider-html-available-url-parity-unverified' : 'same-name-provider-url-only-no-general-player-renderer' : 'no-same-name-provider';
}

const editorSource = await currentSource( currentRoot + 'src/xerte-editor.js' );
let currentToolbar;
let currentPlugins;
let styleDefinitions;
walk( editorSource.ast, node => {
	if ( node.type !== 'VariableDeclarator' ) return;
	if ( node.id.name === 'toolbarItems' ) currentToolbar = literal( node.init );
	if ( node.id.name === 'xerteBuiltinPlugins' ) currentPlugins = node.init.elements.map( value => value.name );
} );
const legacyStyleSource = await currentSource( currentRoot + 'src/plugins/xerte-legacy-styles.js' );
// Evaluate only the local, data-only style definitions, not imports or plugin code.
const styleData = legacyStyleSource.text.slice( legacyStyleSource.text.indexOf( 'const variants =' ), legacyStyleSource.text.indexOf( 'const usesCustomCommand' ) ).replace( 'export const legacyStyles', 'const legacyStyles' );
const currentLegacyStyles = vm.runInNewContext( styleData + '\nlegacyStyles;', {}, { timeout: 1000 } );
walk( editorSource.ast, node => {
	if ( node.type !== 'Property' || ( node.key.name ?? node.key.value ) !== 'style' || node.value.type !== 'ObjectExpression' ) return;
	const definitions = node.value.properties.find( property => ( property.key.name ?? property.key.value ) === 'definitions' );
	if ( definitions ) styleDefinitions = vm.runInNewContext( '(' + editorSource.text.slice( definitions.value.start, definitions.value.end ) + ')',
		{ legacyStyles: currentLegacyStyles, styleVariants: [ 1, 2, 3, 4, 5, 6 ] }, { timeout: 1000 } );
} );
if ( !styleDefinitions?.length ) throw new Error( 'Current style definitions were not extracted.' );
const bridgeSource = await currentSource( 'editor/js/vendor/ckeditor5/xerte-ckeditor5.js' );
let bridgeMap;
walk( bridgeSource.ast, node => {
	if ( node.type === 'FunctionDeclaration' && node.id?.name === 'mapLegacyToolbarItem' ) walk( node.body, child => {
		if ( child.type === 'VariableDeclarator' && child.id.name === 'map' ) bridgeMap = literal( child.init );
	} );
} );
const supplement = [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', 'BidiLtr', 'BidiRtl', 'Font', 'FontSize',
	'TextColor', 'BGColor', 'Language', 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', 'Scayt', 'Form', 'Checkbox', 'Radio',
	'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField', 'FontAwesome' ];
const candidates = new Set( [ ...oldPlugins.flatMap( plugin => ( plugin.ui || [] ).map( entry => entry.name ).filter( Boolean ) ), ...supplement ] );
const warnings = [];
const bridge = await bridgeHarness( { globals: { console: { ...console, warn: message => warnings.push( message ) } } } );
const toolbarChecks = [ ...candidates ].sort().map( name => {
	const result = bridge.merge( { toolbar: [ name ] } );
	return { name, hiddenByOldConfig: split( oldConfig.removeButtons ).includes( name ), mappedItems: Array.from( result.toolbar?.items || [] ) };
} );
const report = {
	scope: 'Historical configured capabilities, source-level migration inventory, and actual bridge mapping checks; not a playback or preservation certification.',
	baseline: { commit: baseline, firstMigrationCommit: firstMigration, ckeditorVersion: core.text.match( /version:"([^"]+)"/ )[ 1 ],
		defaultPlugins: split( coreConfig.plugins ), extraPlugins, inlineExtraPlugins, removedButtons: split( oldConfig.removeButtons ),
		formatTags: oldConfig.format_tags, allowedContent: oldConfig.allowedContent, toolbarGroups: oldConfig.toolbarGroups, toolbarProfiles: oldToolbarProfiles },
	legacyPlugins: oldPlugins,
	legacyStyles: styles,
	legacyIframe: { dialog: iframeDialog.record.path, explicitDialogFieldIds: [ ...iframeDialogFields ],
		advancedTabFields: [ 'id', 'classes', 'styles' ] },
	legacyOembed: { loadedFile: actualLibrary.record.path, declarationCount: oldProviders.length, uniqueProviderCount: new Set( oldProviders.map( value => value.name ) ).size,
		providers: oldProviders, nonLoadedSibling: { path: siblingLibrary.record.path, declarationCount: siblingProviders.length,
			namesOnlyInLoadedFile: [ ...new Set( oldProviders.map( value => value.name ) ) ].filter( name => !siblingProviders.some( value => value.name === name ) ),
			namesOnlyInSibling: [ ...new Set( siblingProviders.map( value => value.name ) ) ].filter( name => !oldProviders.some( value => value.name === name ) ) } },
	current: { ckeditorVersion: JSON.parse( await readFile( new URL( '../package.json', import.meta.url ), 'utf8' ) ).dependencies.ckeditor5,
		plugins: currentPlugins, toolbar: currentToolbar, mediaProviders: newProviders, explicitLegacyToolbarMap: bridgeMap,
		styleDefinitions, legacyStylesWithoutSameName: styles.filter( style => !styleDefinitions.some( value => value.name.trim() === style.name.trim() ) ).map( style => style.name ),
		legacyToolbarChecks: toolbarChecks, legacyToolbarWarnings: warnings,
		insertGroupItems: Array.from( bridge.merge( { toolbarGroups: [ { name: 'insert' } ] } ).toolbar.items ) },
	limitations: [ 'Provider names do not prove equivalence of accepted URLs, endpoint behavior, or options.',
		'Historical provider declarations do not establish that external services are still available.',
		'Plugin presence does not mean every toolbar exposed it. Removed buttons and dynamic UI registration locations are recorded separately.',
		'Packed plugins are inventoried without executing them; dynamic button declarations are supplemented, not claimed to be a complete runtime UI inventory.',
		'Current working-tree modifications are included; source hashes identify the examined files.',
		'Compare media attributes, theme selectors, and actual preview behavior through editing/save/reopen cycles before marking any feature compatible.' ],
	sources: sourceRecords
};
if ( !oldPlugins.some( plugin => plugin.name === 'iframe' ) || !oldProviders.length || !currentPlugins?.length || !styles?.length ) throw new Error( 'Incomplete source extraction.' );
const directory = new URL( '../reports/', import.meta.url );
await mkdir( directory, { recursive: true } );
await writeFile( new URL( 'ckeditor4-support-inventory.json', directory ), JSON.stringify( report, null, 2 ) + '\n' );
console.log( JSON.stringify( { baseline, oldDefaultPlugins: split( coreConfig.plugins ).length, configuredPluginsIncludingDependencies: oldPlugins.length,
	styles: styles.length, providerDeclarations: oldProviders.length, uniqueProviderNames: report.legacyOembed.uniqueProviderCount,
	currentProviders: newProviders.length, unmappedNonRemovedButtons: toolbarChecks.filter( entry => !entry.hiddenByOldConfig && !entry.mappedItems.length ).map( entry => entry.name ),
	report: 'editor/ckeditor5-build/reports/ckeditor4-support-inventory.json' }, null, 2 ) );
