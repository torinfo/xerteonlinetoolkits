/**
 * Wrap selected text in the current main delimiter (legacy xotmarkword behavior).
 * @license Apache-2.0
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { IconPencil } from 'ckeditor5/src/icons.js';

function getMainDelimiter() {
	try {
		const root = document.getElementById( 'opt_mainDelimiter' );
		if ( root ) {
			const input = root.querySelector( '.wizardvalue input' );
			if ( input && input.value ) {
				return String( input.value );
			}
		}
	} catch ( e ) {
		// Ignore and fallback.
	}
	return '|';
}

export class XerteMarkWord extends Plugin {
	static get pluginName() {
		return 'XerteMarkWord';
	}

	init() {
		const editor = this.editor;
		editor.ui.componentFactory.add( 'xotMarkWord', locale => {
			const view = new ButtonView( locale );
			view.set( {
				label: 'Mark Word',
				icon: IconPencil,
				tooltip: true
			} );

			view.on( 'execute', () => {
				const selection = editor.model.document.selection;
				const selectedText = editor.model.document.selection.getSelectedText();
				if ( !selectedText ) {
					return;
				}

				let cleanText = String( selectedText );
				if ( cleanText.endsWith( ' ' ) ) {
					cleanText = cleanText.slice( 0, -1 );
				}
				if ( !cleanText ) {
					return;
				}

				const delimiter = getMainDelimiter();
				editor.model.change( writer => {
					editor.model.insertContent( writer.createText( `${ delimiter }${ cleanText }${ delimiter }` ), selection );
				} );
			} );

			return view;
		} );
	}
}
