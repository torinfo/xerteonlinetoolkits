/**
 * Media-properties dialog UI.
 * @license Apache-2.0
 */
import { normalizeDimension } from './xerte-image-dimensions.js';
import { createEmbedDialog, embedAlignment, embedButton, embedDimensions, embedField } from './xerte-embed-dialog.js';

export const xerteVideoProvider = {
	name: 'xerteVideo',
	url: /^((?:https?:\/\/|\/\/|(?![a-z][a-z\d+.-]*:))[^?#\s]+\.(?:mp4|webm|ogv|ogg|m4v|mov)(?:[?#][^\s]*)?)$/i,
	html: match => `<video controls preload="metadata" style="display:block;width:100%;height:auto" src="${ escapeAttribute( match[ 0 ] ) }"></video>`
};

function escapeAttribute( value ) {
	return value.replace( /&/g, '&amp;' ).replace( /"/g, '&quot;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' );
}

function normalizeVideoUrl( url ) {
	if ( !xerteVideoProvider.url.test( url ) ) return url;
	// CKEditor's media registry otherwise treats relative paths as remote hosts.
	try { return new URL( url, document.baseURI ).href; }
	catch { return ''; }
}

export function showMediaPropertiesDialog( editor, media, browseMedia = null ) {
	return new Promise( resolve => {
		const previouslyFocused = document.activeElement;
		const { overlay, form, body, save, cancel } = createEmbedDialog( editor, media ? 'Media properties' : 'Insert media' );
		media = media || { getAttribute: name => name === 'mediaWidth' ? '100%' : '' };
		const urlRow = document.createElement( 'div' );
		urlRow.className = 'xerte-embed-dialog__url';
		body.appendChild( urlRow );
		const url = embedField( urlRow, editor.t( 'URL' ), media.getAttribute( 'url' ) || '' );
		url.required = true;
		const browse = embedButton( urlRow, editor.t( 'Browse Server' ) );
		browse.disabled = !browseMedia;
		const title = embedField( body, editor.t( 'Title' ), media.getAttribute( 'mediaTitle' ) || '' );
		const aria = embedField( body, editor.t( 'ARIA label' ), media.getAttribute( 'mediaAriaLabel' ) || '' );
		const { width, height } = embedDimensions( body, editor.t, { width: media.getAttribute( 'mediaWidth' ), height: media.getAttribute( 'mediaHeight' ) } );
		embedAlignment( body, editor.t, media.getAttribute( 'mediaAlign' ) );
		document.body.appendChild( overlay );

		let finished = false;
		const finish = value => {
			if ( finished ) return;
			finished = true;
			document.removeEventListener( 'keydown', onKeydown, true );
			overlay.remove();
			if ( previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected ) previouslyFocused.focus();
			resolve( value );
		};
		const onKeydown = event => {
			if ( event.key === 'Tab' ) {
				const controls = Array.from( form.querySelectorAll( 'input:not([type=radio]), input[type=radio]:checked, select, button:not(:disabled)' ) );
				const first = controls[ 0 ], last = controls[ controls.length - 1 ];
				if ( event.shiftKey && document.activeElement === first ) {
					event.preventDefault(); last.focus();
				} else if ( !event.shiftKey && document.activeElement === last ) {
					event.preventDefault(); first.focus();
				}
			}
			if ( event.key !== 'Escape' ) return;
			event.preventDefault();
			event.stopPropagation();
			finish( null );
		};
		browse.addEventListener( 'click', async () => {
			browse.disabled = true;
			try {
				const chosen = await browseMedia();
				if ( finished ) return;
				if ( chosen ) { url.value = chosen; url.setCustomValidity( '' ); }
				url.focus();
			} finally {
				browse.disabled = false;
			}
		} );
		cancel.addEventListener( 'click', () => finish( null ) );
		form.addEventListener( 'submit', event => {
			event.preventDefault();
			const source = normalizeVideoUrl( url.value.trim() );
			if ( !source || !editor.plugins.get( 'MediaEmbedEditing' ).registry.hasMedia( source ) ) {
				url.setCustomValidity( editor.t( 'This media URL is not supported.' ) );
				url.reportValidity();
				return;
			}
			if ( !validDimension( width.value ) || !validDimension( height.value ) ) {
				window.alert( editor.t( 'Enter a positive number, optionally followed by px or %.' ) );
				return;
			}
			finish( {
				url: source,
				mediaTitle: title.value.trim(), mediaAriaLabel: aria.value.trim(),
				mediaWidth: normalizeDimension( width.value ), mediaHeight: normalizeDimension( height.value ),
				mediaAlign: form.elements[ 'xerte-media-alignment' ].value
			} );
		} );
		overlay.addEventListener( 'click', event => {
			if ( event.target === overlay ) finish( null );
		} );
		document.addEventListener( 'keydown', onKeydown, true );
		url.addEventListener( 'input', () => url.setCustomValidity( '' ) );
		url.focus();
	} );
}

function validDimension( value ) {
	return !value.trim() || !!normalizeDimension( value );
}

