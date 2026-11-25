import { modes, assert, configFor, mountEditor, record, finish } from './browser-helpers.js';

try {
	for ( const mode of modes ) {
		const entry = await mountEditor( mode );
		const { editor, field } = entry;
		const shim = CKEDITOR.instances[ field.id ];
		assert( shim && XerteCKEditor5Facade.getInstance( field.id ) === editor, mode.name + ': bridge registry missing' );
		shim.setData( '<p>Original text</p>' );
		const before = shim.getData();
		editor.model.change( writer => {
			const paragraph = editor.model.document.getRoot().getChild( 0 );
			writer.insertText( ' edited', writer.createPositionAt( paragraph, 'end' ) );
		} );
		const edited = shim.getData();
		assert( edited.includes( 'Original text edited' ), mode.name + ': editing failed' );
		editor.execute( 'undo' ); assert( shim.getData() === before, mode.name + ': undo failed' );
		editor.execute( 'redo' ); assert( shim.getData() === edited, mode.name + ': redo failed' );
		record( mode.name + ': bridge get/set data and single-step undo/redo' );

		shim.setReadOnly( true );
		assert( editor.isReadOnly && !editor.commands.get( 'bold' ).isEnabled, mode.name + ': read-only not enforced' );
		shim.setReadOnly( false );
		assert( !editor.isReadOnly, mode.name + ': read-only could not be cleared' );
		assert( shim.getData() === edited, mode.name + ': read-only changed content' );
		record( mode.name + ': read-only toggles without changing content' );

		if ( mode.inlineEditor ) {
			const sourceButton = editor.ui.componentFactory.create( 'xerteSourceDialog' );
			for ( const save of [ false, true ] ) {
				sourceButton.fire( 'execute' );
				const dialog = document.querySelector( '[role="dialog"]' );
				assert( dialog?.querySelector( 'textarea' ), 'Inline: source dialog did not open' );
				dialog.querySelector( 'textarea' ).value = '<p>Source dialog edit</p>';
				const button = Array.from( dialog.querySelectorAll( 'button' ) ).find( item => item.textContent.trim() === ( save ? 'Save' : 'Cancel' ) );
				assert( button, 'Inline: source dialog action missing' ); button.click();
				assert( shim.getData() === ( save ? '<p>Source dialog edit</p>' : edited ), 'Inline: source Save/Cancel behaved incorrectly' );
			}
			sourceButton.destroy();
			record( 'Inline: Source dialog Cancel discards changes and Save applies them' );
		}

		if ( mode.xerteIframeEditing ) {
			const plugin = editor.plugins.get( 'XerteIframeEditing' );
			const contentDocument = plugin.frame.contentDocument;
			const content = shim.getData();
			plugin.setHeight( 320 );
			assert( plugin.frame.style.height === '320px', 'Iframe: editor height did not update' );
			editor.execute( 'toggleFullscreen' );
			assert( editor.ui.view.element.classList.contains( 'xerte-iframe-fullscreen' ), 'Iframe: fullscreen did not enable' );
			editor.execute( 'toggleFullscreen' );
			assert( !editor.ui.view.element.classList.contains( 'xerte-iframe-fullscreen' ), 'Iframe: fullscreen did not close' );
			assert( plugin.frame.contentDocument === contentDocument && shim.getData() === content, 'Iframe: fullscreen recreated the content document or lost data' );
			record( 'Iframe: resize/fullscreen preserve the document and content' );
		}

		const independent = await mountEditor( mode );
		independent.editor.setData( '<p>Independent field</p>' );
		const saved = shim.getData();
		await shim.destroy();
		assert( !XerteCKEditor5Facade.getInstance( field.id ) && !CKEDITOR.instances[ field.id ], mode.name + ': destroyed instance remains registered' );
		assert( independent.editor.getData() === '<p>Independent field</p>', mode.name + ': another field was affected by destruction' );
		if ( mode.inlineEditor ) field.innerHTML = saved; else field.value = saved;
		const reopened = await XerteCKEditor5Facade.create( field, configFor( mode ) );
		assert( reopened.getData() === saved, mode.name + ': reopen lost data' );
		await CKEDITOR.instances[ field.id ].destroy();
		await CKEDITOR.instances[ independent.field.id ].destroy();
		entry.section.remove(); independent.section.remove();
		record( mode.name + ': independent fields, destruction, cleanup and recreation' );
	}
	finish();
} catch ( error ) { finish( error ); }
