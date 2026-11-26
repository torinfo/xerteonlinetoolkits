/** General iframe insertion and properties, using the existing HTML preservation model. @license Apache-2.0 */
import {
	Plugin, Command, ButtonView, MenuBarMenuListItemButtonView, DomEventObserver,
	GeneralHtmlSupport, Widget, WidgetResize, WidgetToolbarRepository, toWidget, IconWeb, IconPencil
} from 'ckeditor5';
import { iframeAttributeKey, iframeLayout, iframeLayoutPatch, patchIframeData, validIframeUrl } from './xerte-iframe-utils.js';
import { normalizeDimension } from './xerte-image-dimensions.js';
import { createEmbedDialog, embedAlignment, embedButton, embedDimensions, embedField } from './xerte-embed-dialog.js';
import { browseMedia } from './xerte-browse-media.js';
import '../xerte-iframe.css';

const isIframe = element => element?.is( 'element', 'htmlIframe' );
const selectedIframe = editor => {
	const selected = editor.model.document.selection.getSelectedElement();
	return isIframe( selected ) ? selected : null;
};

class IframeCommand extends Command {
	refresh() {
		this.value = selectedIframe( this.editor );
		const { schema, document } = this.editor.model;
		this.isEnabled = !!this.value || schema.isRegistered( 'htmlIframe' ) &&
			!!schema.findAllowedParent( document.selection.getFirstPosition(), 'htmlIframe' );
	}

	execute( { patch, iframe = selectedIframe( this.editor ) } ) {
		const { model } = this.editor;
		if ( iframe && iframe.root.rootName === '$graveyard' ) return;
		model.change( writer => {
			const data = patchIframeData( iframe?.getAttribute( iframeAttributeKey ), patch );
			if ( iframe ) writer.setAttribute( iframeAttributeKey, data, iframe );
			else model.insertObject( writer.createElement( 'htmlIframe', { [ iframeAttributeKey ]: data, htmlContent: '' } ),
				null, null, { setSelection: 'on' } );
		} );
	}
}

class IframeDoubleClickObserver extends DomEventObserver {
	domEventType = 'dblclick';
	onDomEvent( event ) { this.fire( 'dblclick', event ); }
}

export class XerteIframe extends Plugin {
	static get pluginName() { return 'XerteIframe'; }
	static get requires() { return [ GeneralHtmlSupport, Widget, WidgetResize, WidgetToolbarRepository ]; }

	init() {
		const editor = this.editor;
		editor.commands.add( 'xerteIframe', new IframeCommand( editor ) );
		// Keep GHS's existing upcast and data downcast. Only the editor preview changes:
		// saved iframes retain their original attributes, classes, styles and surrounding HTML.
		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: { name: 'htmlIframe', attributes: [ iframeAttributeKey, 'htmlContent' ] },
			converterPriority: 'high',
			view: ( model, { writer } ) => {
				const data = model.getAttribute( iframeAttributeKey ) || {};
				const attributes = data.attributes || {}, layout = iframeLayout( data );
				const label = attributes.title || attributes.src || editor.t( 'Iframe' );
				const view = writer.createContainerElement( 'span', { class: 'xerte-iframe-widget', title: label } );
				writer.setStyle( { width: layout.width, ...( layout.height ? { height: layout.height } : { 'aspect-ratio': layout.ratio } ),
					...( layout.align ? { display: 'block' } : {} ),
					...( layout.align === 'center' ? { 'margin-left': 'auto', 'margin-right': 'auto' } : {} ),
					...( [ 'left', 'right' ].includes( layout.align ) ? { float: layout.align,
						'margin-left': layout.align === 'right' ? '1.5em' : '0', 'margin-right': layout.align === 'left' ? '1.5em' : '0' } : {} ) }, view );
				// As with media previews, the real iframe lives inside a RawElement. It keeps
				// its own permissions and is not rewritten by GHS's editing-only sandbox.
				const preview = writer.createRawElement( 'span', { class: 'xerte-iframe-widget__preview' }, dom => {
					const iframe = dom.ownerDocument.createElement( 'iframe' );
					for ( const [ name, value ] of Object.entries( attributes ) ) iframe.setAttribute( name, value );
					if ( data.classes?.length ) iframe.className = data.classes.join( ' ' );
					iframe.style.cssText = Object.entries( data.styles || {} ).map( ( [ name, value ] ) => `${ name }:${ value }` ).join( ';' );
					Object.assign( iframe.style, { width: '100%', height: '100%', maxWidth: 'none', maxHeight: 'none', float: 'none', margin: '0', display: 'block' } );
					iframe.setAttribute( 'tabindex', '-1' ); dom.appendChild( iframe );
				} );
				writer.insert( writer.createPositionAt( view, 0 ), preview );
				writer.insert( writer.createPositionAt( view, 'end' ), writer.createUIElement( 'span', { class: 'xerte-iframe-widget__mask' } ) );
				return toWidget( view, writer, { label: editor.t( 'Iframe properties' ) + ': ' + label } );
			}
		} );
		for ( const [ name, Type ] of [ [ 'xerteIframe', ButtonView ], [ 'menuBar:xerteIframe', MenuBarMenuListItemButtonView ], [ 'xerteIframeProperties', ButtonView ] ] ) {
			editor.ui.componentFactory.add( name, locale => {
				const button = new Type( locale );
				button.set( { label: editor.t( name === 'xerteIframeProperties' ? 'Iframe properties' : 'Iframe' ),
					icon: name === 'xerteIframeProperties' ? IconPencil : IconWeb, tooltip: true } );
				button.bind( 'isEnabled' ).to( editor.commands.get( 'xerteIframe' ), 'isEnabled' );
				button.on( 'execute', () => openIframeDialog( editor ) );
				return button;
			} );
		}
		editor.editing.view.addObserver( IframeDoubleClickObserver );
		this.listenTo( editor.editing.view.document, 'dblclick', ( event, data ) => {
			const iframe = iframeFromDomTarget( editor, data.domEvent.target );
			if ( !iframe ) return;
			data.preventDefault();
			openIframeDialog( editor, iframe );
		} );
		editor.conversion.for( 'editingDowncast' ).add( dispatcher => {
			dispatcher.on( 'insert:htmlIframe', ( event, data, api ) => {
				const model = data.item, view = api.mapper.toViewElement( model );
				const resizers = editor.plugins.get( WidgetResize );
				if ( !view || resizers.getResizerByViewElement( view ) ) return;
				resizers.attachTo( {
					unit: '%', modelElement: model, viewElement: view, editor,
					getHandleHost: widget => widget, getResizeHost: widget => widget,
					isCentered: () => iframeLayout( model.getAttribute( iframeAttributeKey ) ).align === 'center',
					onCommit: width => editor.model.change( writer => {
						const original = model.getAttribute( iframeAttributeKey ) || {};
						writer.setAttribute( iframeAttributeKey, patchIframeData( original, iframeLayoutPatch( original, { width, height: '' } ) ), model );
					} )
				} );
			}, { priority: 'low' } );
		} );
	}

	afterInit() {
		const editor = this.editor;
		editor.plugins.get( WidgetToolbarRepository ).register( 'xerteIframe', {
			ariaLabel: editor.t( 'Iframe properties' ), items: [ 'xerteIframeProperties' ],
			getRelatedElement: () => {
				const iframe = selectedIframe( editor );
				return iframe ? editor.editing.mapper.toViewElement( iframe ) : null;
			}
		} );
	}

	destroy() {
		this._closeDialog?.();
		return super.destroy();
	}
}

export function iframeFromDomTarget( editor, target ) {
	const wrapper = target?.closest?.( '.xerte-iframe-widget' );
	if ( !wrapper || !editor.ui.getEditableElement().contains( wrapper ) ) return null;
	const view = editor.editing.view.domConverter.domToView( wrapper );
	const model = view && editor.editing.mapper.toModelElement( view );
	return isIframe( model ) ? model : null;
}

export async function openIframeDialog( editor, iframe = selectedIframe( editor ) ) {
	const plugin = editor.plugins.get( XerteIframe );
	if ( editor.isReadOnly || plugin._closeDialog ) return;
	const ranges = Array.from( editor.model.document.selection.getRanges(), range => range.clone() );
	const initial = iframe?.getAttribute( iframeAttributeKey ) || { attributes: { width: '100%', frameborder: '0', allowfullscreen: '' },
		styles: { width: '100%', height: 'auto', 'aspect-ratio': '16 / 9' } };
	const dialog = showIframeDialog( editor, initial, !!iframe );
	plugin._closeDialog = dialog.close;
	try {
		const patch = await dialog.result;
		if ( editor.state !== 'ready' ) return;
		if ( patch && !editor.isReadOnly && ( !iframe || iframe.root.rootName !== '$graveyard' ) ) {
			editor.model.change( writer => {
				writer.setSelection( iframe || ranges, iframe ? 'on' : undefined );
				editor.execute( 'xerteIframe', { iframe, patch } );
			} );
		}
		editor.editing.view.focus();
	} finally { plugin._closeDialog = null; }
}

function showIframeDialog( editor, initial, editing ) {
	let close;
	const result = new Promise( resolve => {
		const t = editor.t;
		const { doc, overlay, form, body, cancel } = createEmbedDialog( editor, editing ? 'Iframe properties' : 'Insert iframe', 'iframe' );
		const attributes = initial.attributes || {};
		const layout = iframeLayout( initial );
		const fields = new Map();
		const field = ( name, label, parent = body, choices = null ) => {
			let input = embedField( parent, t( label ), attributes[ name ] || '', name );
			if ( choices ) {
				const select = doc.createElement( 'select' ); select.name = name; input.replaceWith( select ); input = select;
			}
			if ( choices ) for ( const [ value, text ] of choices ) {
				const option = doc.createElement( 'option' ); option.value = value; option.textContent = t( text ); input.appendChild( option );
			}
			input.value = attributes[ name ] || '';
			if ( choices && input.value !== ( attributes[ name ] || '' ) ) {
				const option = doc.createElement( 'option' ); option.value = option.textContent = attributes[ name ]; input.appendChild( option ); input.value = option.value;
			}
			fields.set( name, input ); return input;
		};
		const urlRow = doc.createElement( 'div' ); urlRow.className = 'xerte-embed-dialog__url'; body.appendChild( urlRow );
		const url = field( 'src', 'URL', urlRow ); url.required = !Object.hasOwn( attributes, 'srcdoc' );
		const browse = embedButton( urlRow, t( 'Browse Server' ) ); browse.disabled = !editor.config.get( 'xerteBrowseMediaUrl' );
		field( 'title', 'Title' );
		field( 'aria-label', 'ARIA label' );
		const { width, height } = embedDimensions( body, t, layout ); fields.set( 'width', width ); fields.set( 'height', height );
		embedAlignment( body, t, layout.align, 'xerte-iframe-alignment' );
		const fullscreenLabel = doc.createElement( 'label' ); fullscreenLabel.className = 'xerte-iframe-dialog__checkbox';
		const fullscreen = doc.createElement( 'input' ); fullscreen.type = 'checkbox'; fullscreen.name = 'allowfullscreen';
		fullscreen.checked = Object.hasOwn( attributes, 'allowfullscreen' );
		fullscreenLabel.append( fullscreen, doc.createTextNode( t( 'Allow fullscreen' ) ) ); body.appendChild( fullscreenLabel );
		const details = doc.createElement( 'details' ); const summary = doc.createElement( 'summary' ); summary.textContent = t( 'Advanced' ); details.appendChild( summary ); body.appendChild( details );
		field( 'name', 'Name', details ); field( 'id', 'ID', details );
		const classes = field( 'class', 'CSS classes', details ); classes.value = ( initial.classes || [] ).join( ' ' );
		const styles = field( 'style', 'CSS styles', details ); styles.value = Object.entries( initial.styles || {} ).map( ( [ name, value ] ) => `${ name }: ${ value }` ).join( '; ' );
		field( 'longdesc', 'Long description URL', details );
		field( 'scrolling', 'Scrolling', details, [ [ '', 'Default' ], [ 'auto', 'Auto' ], [ 'yes', 'Yes' ], [ 'no', 'No' ] ] );
		field( 'frameborder', 'Frame border', details, [ [ '', 'Default' ], [ '0', 'No' ], [ '1', 'Yes' ] ] );
		field( 'align', 'Legacy alignment', details, [ [ '', 'None' ], [ 'left', 'Align Left' ], [ 'right', 'Align Right' ], [ 'top', 'Top' ], [ 'middle', 'Middle' ], [ 'bottom', 'Bottom' ] ] );
		const originalValues = new Map( Array.from( fields, ( [ name, input ] ) => [ name, input.value ] ) );
		let finished = false;
		const finish = value => { if ( finished ) return; finished = true; overlay.remove(); resolve( value ); };
		close = () => finish( null ); cancel.addEventListener( 'click', close );
		browse.addEventListener( 'click', async () => {
			browse.disabled = true;
			try {
				const chosen = await browseMedia( editor.config.get( 'xerteBrowseMediaUrl' ) );
				if ( !finished && chosen ) { url.value = chosen; url.setCustomValidity( '' ); url.focus(); }
			} finally { browse.disabled = false; }
		} );
		overlay.addEventListener( 'click', event => { if ( event.target === overlay ) close(); } );
		overlay.addEventListener( 'keydown', event => {
			event.stopPropagation();
			if ( event.key === 'Escape' ) { event.preventDefault(); close(); }
			if ( event.key !== 'Tab' ) return;
			const controls = Array.from( form.querySelectorAll( 'input:not([type=radio]),input[type=radio]:checked,select,summary,button' ) ).filter( element => element.getClientRects().length && !element.disabled );
			const next = event.shiftKey ? controls.at( -1 ) : controls[ 0 ];
			if ( doc.activeElement === ( event.shiftKey ? controls[ 0 ] : controls.at( -1 ) ) ) { event.preventDefault(); next.focus(); }
		} );
		for ( const input of fields.values() ) input.addEventListener( 'input', () => input.setCustomValidity( '' ) );
		form.addEventListener( 'submit', event => {
			event.preventDefault();
			if ( url.value.trim() && !validIframeUrl( url.value ) || !url.value.trim() && !Object.hasOwn( attributes, 'srcdoc' ) ) {
				url.setCustomValidity( t( 'Enter a webpage URL or a relative path.' ) ); url.reportValidity(); return;
			}
			for ( const name of [ 'width', 'height' ] ) {
				const input = fields.get( name );
				if ( input.value !== originalValues.get( name ) && input.value.trim() && !normalizeDimension( input.value ) ) {
					input.setCustomValidity( t( 'Enter a positive number, optionally followed by px or %.' ) ); input.reportValidity(); return;
				}
			}
			if ( !form.reportValidity() ) return;
			const patch = { attributes: {}, ...( !editing ? { styles: { ...initial.styles } } : {} ) };
			for ( const [ name, input ] of fields ) {
				if ( input.value === originalValues.get( name ) || [ 'class', 'style', 'width', 'height' ].includes( name ) ) continue;
				patch.attributes[ name ] = input.value.trim() || null;
			}
			if ( !editing ) Object.assign( patch.attributes, { ...attributes, ...patch.attributes } );
			if ( fullscreen.checked !== Object.hasOwn( attributes, 'allowfullscreen' ) ) patch.attributes.allowfullscreen = fullscreen.checked ? '' : null;
			if ( classes.value !== originalValues.get( 'class' ) ) patch.classes = classes.value.trim().split( /\s+/ ).filter( Boolean );
			if ( styles.value !== originalValues.get( 'style' ) ) {
				const style = doc.createElement( 'span' ).style; style.cssText = styles.value;
				patch.styles = Object.fromEntries( Array.from( style, name => [ name, style.getPropertyValue( name ) + ( style.getPropertyPriority( name ) ? ' !important' : '' ) ] ) );
			}
			const changedLayout = {};
			for ( const [ name, input ] of [ [ 'width', width ], [ 'height', height ] ] ) {
				if ( input.value !== originalValues.get( name ) ) changedLayout[ name ] = normalizeDimension( input.value ) || '';
			}
			const align = form.elements[ 'xerte-iframe-alignment' ].value;
			if ( align !== layout.align ) changedLayout.align = align;
			if ( Object.keys( changedLayout ).length ) {
				const changes = iframeLayoutPatch( patchIframeData( initial, patch ), changedLayout );
				Object.assign( patch.attributes, changes.attributes ); patch.styles = changes.styles;
			}
			finish( patch );
		} );
		doc.body.appendChild( overlay ); url.focus();
	} );
	return { result, close: () => close() };
}
