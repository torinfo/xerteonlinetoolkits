/**
 * @license Apache-2.0
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { IconBrowseFiles } from 'ckeditor5/src/icons.js';

function isImageUrl( url ) {
	const m = url.match( /\.([a-z0-9]+)(?:\?|$)/i );
	if ( !m ) {
		return false;
	}
	return [ 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp' ].includes( m[ 1 ].toLowerCase() );
}

export class XerteBrowseMedia extends Plugin {
	static get pluginName() {
		return 'XerteBrowseMedia';
	}

	init() {
		const editor = this.editor;
		const browseUrl = editor.config.get( 'xerteBrowseMediaUrl' );
		if ( !browseUrl ) {
			return;
		}

		editor.ui.componentFactory.add( 'xerteBrowseMedia', locale => {
			const view = new ButtonView( locale );
			view.set( {
				label: 'Browse server',
				icon: IconBrowseFiles,
				tooltip: true
			} );
			view.on( 'execute', () => {
				const prev = window.__xerteCke5FilePickerResolve;
				window.__xerteCke5FilePickerResolve = url => {
					window.__xerteCke5FilePickerResolve = prev || null;
					if ( !url ) {
						return;
					}
					editor.model.change( () => {
						if ( isImageUrl( url ) ) {
							editor.execute( 'insertImage', { source: url } );
						} else {
							const label = decodeURIComponent( url.split( '/' ).pop() || url );
							const linkCmd = editor.commands.get( 'link' );
							if ( linkCmd && linkCmd.isEnabled ) {
								editor.execute( 'link', url, {}, label );
							} else {
								const html = `<p><a href="${ escapeAttr( url ) }">${ escapeHtml( label ) }</a></p>`;
								const viewFragment = editor.data.processor.toView( html );
								const modelFragment = editor.data.toModel( viewFragment );
								editor.model.insertContent( modelFragment );
							}
						}
					} );
				};
				window.open( browseUrl, 'XerteBrowseMedia', 'height=600,width=800' );
			} );
			return view;
		} );
	}
}

function escapeHtml( s ) {
	return String( s )
		.replace( /&/g, '&amp;' )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' )
		.replace( /"/g, '&quot;' );
}

function escapeAttr( s ) {
	return String( s )
		.replace( /&/g, '&amp;' )
		.replace( /"/g, '&quot;' )
		.replace( /</g, '&lt;' );
}
