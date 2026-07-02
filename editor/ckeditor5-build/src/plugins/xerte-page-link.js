/**
 * Insert a legacy Xerte page link:
 * <a href="#" onclick="x_navigateToPage(false,{type:'linkID',ID:'...'}); return false;">...</a>
 * @license Apache-2.0
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView, MenuBarMenuListItemButtonView } from '@ckeditor/ckeditor5-ui';
import { IconLink } from 'ckeditor5/src/icons.js';

function escapeHtml( value ) {
	return String( value )
		.replace( /&/g, '&amp;' )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' )
		.replace( /"/g, '&quot;' );
}

function getPageItems() {
	try {
		if ( window.EDITOR && window.EDITOR.toolbox && typeof window.EDITOR.toolbox.getPageList === 'function' ) {
			return window.EDITOR.toolbox.getPageList() || [];
		}
	} catch ( e ) {
		// Ignore and fallback to manual ID entry.
	}
	return [];
}

function normalizePageItems( items ) {
	const out = [];
	for ( const item of items ) {
		if ( !item || item.length < 2 ) {
			continue;
		}
		out.push( {
			label: String( item[ 0 ] ),
			id: String( item[ 1 ] )
		} );
	}
	return out;
}

function choosePageFromModal( pages ) {
	return new Promise( resolve => {
		const overlay = document.createElement( 'div' );
		overlay.style.position = 'fixed';
		overlay.style.inset = '0';
		overlay.style.background = 'rgba(17, 24, 39, 0.45)';
		overlay.style.zIndex = '100000';
		overlay.style.display = 'flex';
		overlay.style.alignItems = 'center';
		overlay.style.justifyContent = 'center';
		overlay.style.padding = '20px';
		overlay.style.backdropFilter = 'blur(2px)';

		const modal = document.createElement( 'div' );
		modal.setAttribute( 'role', 'dialog' );
		modal.setAttribute( 'aria-modal', 'true' );
		modal.style.background = '#ffffff';
		modal.style.border = '1px solid #e5e7eb';
		modal.style.borderRadius = '12px';
		modal.style.boxShadow = '0 20px 45px rgba(17, 24, 39, 0.22)';
		modal.style.width = '460px';
		modal.style.maxWidth = '92vw';
		modal.style.padding = '18px';
		modal.style.fontFamily = 'Inter, Segoe UI, Arial, sans-serif';
		modal.style.color = '#111827';

		const title = document.createElement( 'div' );
		title.textContent = 'Xerte Page Link';
		title.style.fontWeight = '700';
		title.style.fontSize = '17px';
		title.style.letterSpacing = '0.2px';
		title.style.marginBottom = '4px';
		modal.appendChild( title );

		const subtitle = document.createElement( 'div' );
		subtitle.textContent = 'Select a page to link to.';
		subtitle.style.fontSize = '13px';
		subtitle.style.color = '#6b7280';
		subtitle.style.marginBottom = '14px';
		modal.appendChild( subtitle );

		const label = document.createElement( 'label' );
		label.textContent = 'Choose a page';
		label.style.display = 'block';
		label.style.marginBottom = '8px';
		label.style.fontSize = '13px';
		label.style.fontWeight = '600';
		modal.appendChild( label );

		const select = document.createElement( 'select' );
		select.style.width = '100%';
		select.style.padding = '10px 12px';
		select.style.boxSizing = 'border-box';
		select.style.marginBottom = '16px';
		select.style.fontSize = '14px';
		select.style.border = '1px solid #d1d5db';
		select.style.borderRadius = '8px';
		select.style.background = '#ffffff';
		select.style.color = '#111827';
		select.style.outline = 'none';
		for ( const page of pages ) {
			const option = document.createElement( 'option' );
			option.value = page.id;
			option.textContent = page.label;
			select.appendChild( option );
		}
		modal.appendChild( select );

		const buttonRow = document.createElement( 'div' );
		buttonRow.style.display = 'flex';
		buttonRow.style.justifyContent = 'flex-end';
		buttonRow.style.gap = '8px';

		const cancelBtn = document.createElement( 'button' );
		cancelBtn.type = 'button';
		cancelBtn.textContent = 'Cancel';
		cancelBtn.style.padding = '9px 14px';
		cancelBtn.style.borderRadius = '8px';
		cancelBtn.style.border = '1px solid #d1d5db';
		cancelBtn.style.background = '#ffffff';
		cancelBtn.style.color = '#374151';
		cancelBtn.style.fontSize = '13px';
		cancelBtn.style.fontWeight = '600';
		cancelBtn.style.cursor = 'pointer';

		const okBtn = document.createElement( 'button' );
		okBtn.type = 'button';
		okBtn.textContent = 'OK';
		okBtn.style.padding = '9px 14px';
		okBtn.style.borderRadius = '8px';
		okBtn.style.border = '1px solid #2563eb';
		okBtn.style.background = '#2563eb';
		okBtn.style.color = '#ffffff';
		okBtn.style.fontSize = '13px';
		okBtn.style.fontWeight = '600';
		okBtn.style.cursor = 'pointer';

		if ( !pages.length ) {
			select.disabled = true;
			okBtn.disabled = true;
			okBtn.style.opacity = '0.55';
			okBtn.style.cursor = 'not-allowed';
		}

		buttonRow.appendChild( cancelBtn );
		buttonRow.appendChild( okBtn );
		modal.appendChild( buttonRow );
		overlay.appendChild( modal );
		document.body.appendChild( overlay );

		const cleanup = result => {
			document.removeEventListener( 'keydown', onKeyDown, true );
			if ( overlay.parentNode ) {
				overlay.parentNode.removeChild( overlay );
			}
			resolve( result );
		};

		const onKeyDown = event => {
			if ( event.key === 'Escape' ) {
				event.preventDefault();
				cleanup( null );
			}
		};

		cancelBtn.addEventListener( 'click', () => cleanup( null ) );
		okBtn.addEventListener( 'click', () => cleanup( select.value || null ) );
		select.addEventListener( 'focus', () => {
			select.style.borderColor = '#2563eb';
			select.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15)';
		} );
		select.addEventListener( 'blur', () => {
			select.style.borderColor = '#d1d5db';
			select.style.boxShadow = 'none';
		} );
		cancelBtn.addEventListener( 'mouseenter', () => {
			cancelBtn.style.background = '#f9fafb';
		} );
		cancelBtn.addEventListener( 'mouseleave', () => {
			cancelBtn.style.background = '#ffffff';
		} );
		okBtn.addEventListener( 'mouseenter', () => {
			if ( !okBtn.disabled ) {
				okBtn.style.background = '#1d4ed8';
				okBtn.style.borderColor = '#1d4ed8';
			}
		} );
		okBtn.addEventListener( 'mouseleave', () => {
			if ( !okBtn.disabled ) {
				okBtn.style.background = '#2563eb';
				okBtn.style.borderColor = '#2563eb';
			}
		} );
		overlay.addEventListener( 'click', event => {
			if ( event.target === overlay ) {
				cleanup( null );
			}
		} );
		document.addEventListener( 'keydown', onKeyDown, true );
		select.focus();
	} );
}

export async function runXertePageLink( editor ) {
	const pages = normalizePageItems( getPageItems() );
	const pageId = await choosePageFromModal( pages );
	if ( !pageId ) {
		return;
	}
	const trimmedId = String( pageId ).trim();
	if ( !trimmedId ) {
		return;
	}

	const selection = editor.model.document.selection;
	const selectedContent = editor.model.getSelectedContent( selection );
	const selectedView = editor.data.toView( selectedContent );
	const selectedHtml = editor.data.processor.toData( selectedView ).trim();

	let linkBody = selectedHtml;
	if ( !linkBody ) {
		const matchedPage = pages.find( page => page.id === trimmedId );
		linkBody = escapeHtml( matchedPage ? matchedPage.label : trimmedId );
	}

	const linkHtml = `<a href="#" onclick="x_navigateToPage(false,{type:'linkID',ID:'${ escapeHtml( trimmedId ) }'}); return false;">${ linkBody }</a>`;
	editor.model.change( () => {
		const viewFragment = editor.data.processor.toView( linkHtml );
		const modelFragment = editor.data.toModel( viewFragment );
		editor.model.insertContent( modelFragment, selection );
	} );
}

function createXertePageLinkButton( editor, ButtonClass, locale ) {
	const view = new ButtonClass( locale );
	const buttonProps = {
		label: 'Xerte Page Link',
		icon: IconLink
	};

	if ( ButtonClass === ButtonView ) {
		buttonProps.tooltip = true;
	} else {
		buttonProps.role = 'menuitem';
	}

	view.set( buttonProps );

	view.on( 'execute', () => {
		runXertePageLink( editor );
	} );

	return view;
}

export class XertePageLink extends Plugin {
	static get pluginName() {
		return 'XertePageLink';
	}

	init() {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'xotlink', locale => {
			return createXertePageLinkButton( editor, ButtonView, locale );
		} );

		// Insert > Link in the menu bar should open the Xerte page picker, not CK5's link form.
		editor.ui.componentFactory.add( 'menuBar:link', locale => {
			return createXertePageLinkButton( editor, MenuBarMenuListItemButtonView, locale );
		} );
	}
}
