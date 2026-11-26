/** Shared media/iframe properties controls. @license Apache-2.0 */
import { displayDimension } from './xerte-image-dimensions.js';
import '../xerte-embed-dialog.css';

export function createEmbedDialog( editor, title, kind = 'media' ) {
	const doc = editor.ui.view.element?.ownerDocument || editor.sourceElement?.ownerDocument || document;
	const overlay = doc.createElement( 'div' ); overlay.className = `xerte-embed-overlay xerte-${ kind }-overlay`;
	const form = doc.createElement( 'form' ); form.className = `xerte-embed-dialog xerte-${ kind }-dialog`;
	form.setAttribute( 'role', 'dialog' ); form.setAttribute( 'aria-modal', 'true' ); form.setAttribute( 'aria-label', editor.t( title ) );
	const heading = doc.createElement( 'h2' ); heading.textContent = editor.t( title ); form.appendChild( heading );
	const body = doc.createElement( 'div' ); body.className = 'xerte-embed-dialog__body'; form.appendChild( body );
	const actions = doc.createElement( 'div' ); actions.className = 'xerte-embed-dialog__actions';
	const save = embedButton( actions, editor.t( 'OK' ), 'submit' );
	const cancel = embedButton( actions, editor.t( 'Cancel' ) );
	form.appendChild( actions ); overlay.appendChild( form );
	return { doc, overlay, form, body, save, cancel };
}

export function embedField( parent, text, value = '', name = '', width = 'auto' ) {
	const label = parent.ownerDocument.createElement( 'label' ); label.className = 'xerte-embed-dialog__field';
	label.appendChild( parent.ownerDocument.createTextNode( text ) ); label.style.width = width;
	const input = parent.ownerDocument.createElement( 'input' ); input.type = 'text'; input.value = value;
	if ( name ) input.name = name;
	label.appendChild( input ); parent.appendChild( label ); return input;
}

export function embedButton( parent, text, type = 'button' ) {
	const button = parent.ownerDocument.createElement( 'button' ); button.type = type; button.textContent = text;
	parent.appendChild( button ); return button;
}

export function embedDimensions( parent, t, values ) {
	const row = parent.ownerDocument.createElement( 'div' ); row.className = 'xerte-embed-dialog__dimensions'; parent.appendChild( row );
	const width = embedField( row, t( 'Width' ), displayDimension( values.width ), 'width', '90px' );
	const height = embedField( row, t( 'Height' ), displayDimension( values.height ), 'height', '90px' );
	width.placeholder = '%'; height.placeholder = t( 'Auto' );
	const reset = embedButton( row, '↻' ); reset.title = t( 'Reset size' ); reset.setAttribute( 'aria-label', t( 'Reset size' ) );
	reset.addEventListener( 'click', () => {
		width.value = '100%'; height.value = '';
		for ( const input of [ width, height ] ) input.dispatchEvent( new Event( 'input', { bubbles: true } ) );
	} );
	const help = parent.ownerDocument.createElement( 'p' ); help.className = 'xerte-embed-dialog__hint';
	help.textContent = t( 'Sizes default to %. Add px for pixels. Leave height blank to keep the original proportions.' ); parent.appendChild( help );
	return { width, height, reset };
}

export function embedAlignment( parent, t, value, name = 'xerte-media-alignment' ) {
	const fieldset = parent.ownerDocument.createElement( 'fieldset' ); fieldset.className = 'xerte-embed-dialog__alignment';
	const legend = parent.ownerDocument.createElement( 'legend' ); legend.textContent = t( 'Alignment' ); fieldset.appendChild( legend );
	for ( const [ alignment, text ] of [ [ '', 'None' ], [ 'left', 'Align Left' ], [ 'center', 'Align Center' ], [ 'right', 'Align Right' ] ] ) {
		const label = parent.ownerDocument.createElement( 'label' );
		const input = parent.ownerDocument.createElement( 'input' ); input.type = 'radio'; input.name = name; input.value = alignment; input.checked = alignment === ( value || '' );
		label.append( input, parent.ownerDocument.createTextNode( t( text ) ) ); fieldset.appendChild( label );
	}
	parent.appendChild( fieldset ); return fieldset;
}
