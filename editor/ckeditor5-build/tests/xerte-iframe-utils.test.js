import assert from 'node:assert/strict';
import test from 'node:test';
import { iframeDimension, iframeLayout, iframeLayoutPatch, patchIframeData, validIframeUrl } from '../src/plugins/xerte-iframe-utils.js';

test( 'general iframe URLs accept webpages, PeerTube embeds and relative project files without a provider registry', () => {
	for ( const url of [ 'https://example.test/page', 'http://example.test/', '//example.test/page', '../media/page.html?x=1&y=2#part',
		'/xotlatest/page.html', 'page.html', '#section', 'about:blank',
		'https://video.dlearning.nl/videos/embed/e46bd183-ceca-46d3-88d9-f1344441b191' ] ) assert.ok( validIframeUrl( url ), url );
	for ( const url of [ '', 'javascript:alert(1)', 'data:text/html,test', 'file:///C:/test', 'vbscript:test', 'java\nscript:test', 'https://example.test/ path' ] ) assert.equal( validIframeUrl( url ), false, url );
} );

test( 'iframe layout reads legacy pixels and existing styles without rewriting saved data', () => {
	const legacy = { attributes: { width: '640', height: '400', align: 'right' } };
	assert.deepEqual( iframeLayout( legacy ), { width: '640px', height: '400px', ratio: '640 / 400', align: 'right' } );
	assert.equal( legacy.attributes.width, '640' );
	const styled = { ...legacy, styles: { width: '75%', height: 'auto', 'aspect-ratio': '4 / 3', 'margin-left': 'auto', 'margin-right': 'auto' } };
	assert.deepEqual( iframeLayout( styled ), { width: '75%', height: '', ratio: '4 / 3', align: 'center' } );
} );

test( 'percentage resizing restores proportional height and keeps iframe-specific attributes and styling', () => {
	const original = { attributes: { src: 'page.html', width: '640', height: '400', sandbox: 'allow-scripts', scrolling: 'yes', align: 'top' },
		styles: { border: '2px solid red' }, classes: [ 'theme-frame' ] };
	const result = patchIframeData( original, iframeLayoutPatch( original, { width: '60%', height: '', align: 'center' } ) );
	assert.equal( result.attributes.width, '60%' ); assert.equal( result.attributes.height, undefined );
	assert.equal( result.styles.height, 'auto' ); assert.equal( result.styles[ 'aspect-ratio' ], '640 / 400' );
	assert.equal( result.styles[ 'margin-left' ], 'auto' ); assert.equal( result.styles[ 'margin-right' ], 'auto' );
	assert.equal( result.styles.border, original.styles.border ); assert.deepEqual( result.classes, original.classes );
	for ( const key of [ 'src', 'sandbox', 'scrolling', 'align' ] ) assert.equal( result.attributes[ key ], original.attributes[ key ] );
	assert.equal( original.attributes.height, '400' );
} );

test( 'iframe dimensions retain pixel semantics for CKEditor 4 values', () => {
	assert.equal( iframeDimension( '400' ), '400' );
	assert.equal( iframeDimension( '400px' ), '400' );
	assert.equal( iframeDimension( '100%' ), '100%' );
	assert.equal( iframeDimension( '' ), '' );
	assert.equal( iframeDimension( '0' ), '0' );
	for ( const value of [ '-5', '20garbage', 'calc(100% - 5px)' ] ) assert.equal( iframeDimension( value ), null );
} );

test( 'editing a title preserves legacy iframe permissions, URL parameters, custom attributes and theme styling', () => {
	const original = { attributes: { src: 'https://example.test/embed?id=1&start=30', title: 'Old title', width: '100%', height: '400',
		sandbox: 'allow-same-origin allow-scripts allow-popups', allowfullscreen: '', allow: 'autoplay; fullscreen',
		referrerpolicy: 'strict-origin', loading: 'lazy', id: 'existing-frame', 'data-project': 'retain' },
	classes: [ 'theme-frame', 'custom-frame' ], styles: { border: '2px solid red', height: '60vh !important' } };
	const saved = structuredClone( original );
	const edited = patchIframeData( original, { attributes: { title: 'New title' } } );
	assert.deepEqual( edited, { ...saved, attributes: { ...saved.attributes, title: 'New title' } } );
	assert.deepEqual( original, saved );
	assert.notEqual( edited.attributes, original.attributes );
	assert.notEqual( edited.classes, original.classes );
	assert.notEqual( edited.styles, original.styles );
} );

test( 'explicitly removing a boolean iframe permission differs from retaining its empty HTML value', () => {
	const original = { attributes: { allowfullscreen: '', sandbox: '', srcdoc: '<p>Embedded HTML</p>' } };
	assert.equal( Object.hasOwn( patchIframeData( original ).attributes, 'allowfullscreen' ), true );
	const updated = patchIframeData( original, { attributes: { allowfullscreen: null } } );
	assert.equal( Object.hasOwn( updated.attributes, 'allowfullscreen' ), false );
	assert.equal( updated.attributes.sandbox, '' );
	assert.equal( updated.attributes.srcdoc, '<p>Embedded HTML</p>' );
} );
