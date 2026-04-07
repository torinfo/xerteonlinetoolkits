/**
 * @license Apache-2.0
 */
import { Plugin } from '@ckeditor/ckeditor5-core';

export class XerteUploadAdapter extends Plugin {
	static get requires() {
		return [ 'FileRepository' ];
	}

	static get pluginName() {
		return 'XerteUploadAdapter';
	}

	init() {
		const uploadUrl = this.editor.config.get( 'xerteUploadUrl' );
		if ( !uploadUrl ) {
			return;
		}

		this.editor.plugins.get( 'FileRepository' ).createUploadAdapter = loader => ( {
			upload: () => this._upload( loader, uploadUrl ),
			abort: () => {}
		} );
	}

	_upload( loader, uploadUrl ) {
		return loader.file.then( file => new Promise( ( resolve, reject ) => {
			const data = new FormData();
			data.append( 'upload', file );
			const xhr = new XMLHttpRequest();
			xhr.open( 'POST', uploadUrl, true );
			xhr.onload = () => {
				try {
					const res = JSON.parse( xhr.responseText );
					if ( res.uploaded && res.url ) {
						resolve( { default: res.url } );
					} else {
						reject( res.error || 'Upload failed' );
					}
				} catch ( e ) {
					reject( e );
				}
			};
			xhr.onerror = () => reject( new Error( 'Network error' ) );
			xhr.send( data );
		} ) );
	}
}
