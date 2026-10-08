/**
 * Autocolumns dialog (legacy xotcolumns behaviour).
 * @license Apache-2.0
 */

const DEFAULT_SETTINGS = {
	columns: 2,
	columnSpacing: 1,
	spacingUnits: 'em',
	rulerStyle: 'none',
	rulerThickness: 1,
	rulerColour: '#000000'
};

function parseAutocolumnsSettings( element ) {
	const settings = { ...DEFAULT_SETTINGS };
	if ( !element || !element.classList ) {
		return settings;
	}
	for ( let i = 1; i <= 5; i++ ) {
		if ( element.classList.contains( 'autocolumns' + i ) ) {
			settings.columns = i;
			break;
		}
	}
	const style = element.getAttribute( 'style' ) || '';
	const gapMatch = style.match( /column-gap:\s*([\d.]+)(em|px)/i );
	if ( gapMatch ) {
		settings.columnSpacing = parseFloat( gapMatch[ 1 ] );
		settings.spacingUnits = gapMatch[ 2 ];
	}
	const ruleMatch = style.match( /column-rule:\s*([\d.]+)px\s+(\w+)\s+(#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|\w+)/i );
	if ( ruleMatch ) {
		settings.rulerThickness = parseFloat( ruleMatch[ 1 ] );
		settings.rulerStyle = ruleMatch[ 2 ];
		settings.rulerColour = ruleMatch[ 3 ];
	}
	return settings;
}

function buildAutocolumnsStyle( settings ) {
	return `column-rule: ${ settings.rulerThickness }px ${ settings.rulerStyle } ${ settings.rulerColour };` +
		`column-gap: ${ settings.columnSpacing }${ settings.spacingUnits };`;
}

function buildAutocolumnsHtml( innerHtml, settings ) {
	return `<div class="autocolumns autocolumns${ settings.columns }" style="${ buildAutocolumnsStyle( settings ) }">${ innerHtml || '<p>&nbsp;</p>' }</div>`;
}

function findAutocolumnsElement( editor ) {
	const domRoot = editor.editing.view.getDomRoot();
	const selection = window.getSelection();
	if ( !domRoot || !selection || !selection.anchorNode ) {
		return null;
	}
	let node = selection.anchorNode;
	if ( node.nodeType === Node.TEXT_NODE ) {
		node = node.parentElement;
	}
	while ( node && node !== domRoot ) {
		if ( node.nodeType === Node.ELEMENT_NODE && node.classList.contains( 'autocolumns' ) ) {
			return node;
		}
		node = node.parentElement;
	}
	return null;
}

function chooseAutocolumnsFromModal( initialSettings, canRemove ) {
	return new Promise( resolve => {
		const settings = { ...DEFAULT_SETTINGS, ...initialSettings };

		const overlay = document.createElement( 'div' );
		overlay.style.cssText = 'position:fixed;inset:0;background:rgba(17,24,39,0.45);z-index:2147483645;display:flex;align-items:center;justify-content:center;padding:20px;';

		const modal = document.createElement( 'div' );
		modal.setAttribute( 'role', 'dialog' );
		modal.style.cssText = 'background:#fff;border:1px solid #e5e7eb;border-radius:12px;width:480px;max-width:92vw;padding:18px;font-family:Segoe UI,Arial,sans-serif;';

		const title = document.createElement( 'div' );
		title.textContent = 'Autocolumn Settings';
		title.style.cssText = 'font-weight:700;font-size:17px;margin-bottom:14px;';
		modal.appendChild( title );

		function addField( labelText, inputEl ) {
			const wrap = document.createElement( 'div' );
			wrap.style.marginBottom = '12px';
			const label = document.createElement( 'label' );
			label.textContent = labelText;
			label.style.cssText = 'display:block;margin-bottom:6px;font-size:13px;font-weight:600;';
			wrap.appendChild( label );
			wrap.appendChild( inputEl );
			modal.appendChild( wrap );
		}

		const columnsInput = document.createElement( 'input' );
		columnsInput.type = 'number';
		columnsInput.min = '1';
		columnsInput.max = '5';
		columnsInput.value = String( settings.columns );
		columnsInput.style.cssText = 'width:100%;padding:8px;box-sizing:border-box;';
		addField( 'Number of columns', columnsInput );

		const spacingInput = document.createElement( 'input' );
		spacingInput.type = 'number';
		spacingInput.min = '0';
		spacingInput.step = '0.1';
		spacingInput.value = String( settings.columnSpacing );
		spacingInput.style.cssText = 'width:100%;padding:8px;box-sizing:border-box;';
		addField( 'Spacing between columns', spacingInput );

		const rulerStyle = document.createElement( 'select' );
		rulerStyle.style.cssText = 'width:100%;padding:8px;box-sizing:border-box;';
		[ 'none', 'solid', 'double', 'dotted', 'dashed' ].forEach( style => {
			const opt = document.createElement( 'option' );
			opt.value = style;
			opt.textContent = style;
			rulerStyle.appendChild( opt );
		} );
		rulerStyle.value = settings.rulerStyle;
		addField( 'Line style', rulerStyle );

		const thicknessInput = document.createElement( 'input' );
		thicknessInput.type = 'number';
		thicknessInput.min = '0';
		thicknessInput.value = String( settings.rulerThickness );
		thicknessInput.style.cssText = 'width:100%;padding:8px;box-sizing:border-box;';
		addField( 'Line thickness (px)', thicknessInput );

		const colourInput = document.createElement( 'input' );
		colourInput.type = 'color';
		colourInput.value = settings.rulerColour.startsWith( '#' ) ? settings.rulerColour : '#000000';
		colourInput.style.cssText = 'width:100%;height:40px;padding:4px;box-sizing:border-box;';
		addField( 'Line colour', colourInput );

		const buttonRow = document.createElement( 'div' );
		buttonRow.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;margin-top:16px;';

		const cleanup = result => {
			document.removeEventListener( 'keydown', onKeyDown, true );
			if ( overlay.parentNode ) {
				overlay.parentNode.removeChild( overlay );
			}
			resolve( result );
		};

		if ( canRemove ) {
			const removeBtn = document.createElement( 'button' );
			removeBtn.type = 'button';
			removeBtn.textContent = 'Remove';
			removeBtn.style.cssText = 'padding:9px 14px;margin-right:auto;border:1px solid #dc2626;background:#fff;color:#dc2626;cursor:pointer;';
			removeBtn.addEventListener( 'click', () => cleanup( { remove: true } ) );
			buttonRow.appendChild( removeBtn );
		}

		const cancelBtn = document.createElement( 'button' );
		cancelBtn.type = 'button';
		cancelBtn.textContent = 'Cancel';
		cancelBtn.style.cssText = 'padding:9px 14px;border:1px solid #d1d5db;background:#fff;cursor:pointer;';

		const okBtn = document.createElement( 'button' );
		okBtn.type = 'button';
		okBtn.textContent = 'OK';
		okBtn.style.cssText = 'padding:9px 14px;border:1px solid #2563eb;background:#2563eb;color:#fff;cursor:pointer;';

		const onKeyDown = event => {
			if ( event.key === 'Escape' ) {
				cleanup( null );
			}
		};

		cancelBtn.addEventListener( 'click', () => cleanup( null ) );
		okBtn.addEventListener( 'click', () => {
			cleanup( {
				columns: Math.min( 5, Math.max( 1, parseInt( columnsInput.value, 10 ) || 2 ) ),
				columnSpacing: parseFloat( spacingInput.value ) || 1,
				spacingUnits: 'em',
				rulerStyle: rulerStyle.value,
				rulerThickness: parseFloat( thicknessInput.value ) || 0,
				rulerColour: colourInput.value.toUpperCase()
			} );
		} );

		buttonRow.appendChild( cancelBtn );
		buttonRow.appendChild( okBtn );
		modal.appendChild( buttonRow );
		overlay.appendChild( modal );
		document.body.appendChild( overlay );
		overlay.addEventListener( 'click', e => { if ( e.target === overlay ) cleanup( null ); } );
		document.addEventListener( 'keydown', onKeyDown, true );
		columnsInput.focus();
	} );
}

export async function runAutocolumnsDialog( editor ) {
	const existing = findAutocolumnsElement( editor );
	const initialSettings = existing ? parseAutocolumnsSettings( existing ) : DEFAULT_SETTINGS;
	const result = await chooseAutocolumnsFromModal( initialSettings, !!existing );
	if ( !result ) {
		return;
	}

	if ( existing ) {
		const innerHtml = existing.innerHTML;
		const outerHtml = existing.outerHTML;
		let currentData = editor.getData();

		if ( result.remove ) {
			if ( currentData.indexOf( outerHtml ) !== -1 ) {
				editor.setData( currentData.replace( outerHtml, innerHtml ) );
			}
			return;
		}

		const replacement = buildAutocolumnsHtml( innerHtml, result );
		if ( currentData.indexOf( outerHtml ) !== -1 ) {
			editor.setData( currentData.replace( outerHtml, replacement ) );
		}
		return;
	}

	const selection = editor.model.document.selection;
	const selectedContent = editor.model.getSelectedContent( selection );
	const selectedView = editor.data.toView( selectedContent );
	const innerHtml = editor.data.processor.toData( selectedView ).trim();
	const html = buildAutocolumnsHtml( innerHtml, result );

	editor.model.change( () => {
		const viewFragment = editor.data.processor.toView( html );
		const modelFragment = editor.data.toModel( viewFragment );
		editor.model.insertContent( modelFragment, selection );
	} );
}
