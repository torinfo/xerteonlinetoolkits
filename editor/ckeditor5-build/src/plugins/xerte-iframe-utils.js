/** Helpers for editing iframe properties without discarding unrelated HTML. @license Apache-2.0 */
import { normalizeDimension } from './xerte-image-dimensions.js';
export const iframeAttributeKey = 'htmlIframeAttributes';

export function validIframeUrl( value ) {
	const url = String( value || '' ).trim();
	if ( !url || /[\u0000-\u0020\u007f\\]/.test( url ) ) return false;
	// A general iframe accepts web URLs and project-relative paths, not a provider list.
	return /^(?:https?:\/\/|\/\/)/i.test( url ) || /^about:blank(?:#.*)?$/i.test( url ) || !/^[a-z][a-z\d+.-]*:/i.test( url );
}

export function iframeDimension( value ) {
	const size = String( value || '' ).trim();
	if ( !size ) return '';
	if ( !/^\d+(?:\.\d+)?(?:px|%)?$/i.test( size ) ) return null;
	// Unlike the media widget, unitless iframe attributes are pixels (including old content).
	return size.replace( /px$/i, '' );
}

export function patchIframeData( original = {}, patch = {} ) {
	const result = { ...original, attributes: { ...original.attributes } };
	if ( original.classes ) result.classes = [ ...original.classes ];
	if ( original.styles ) result.styles = { ...original.styles };
	for ( const [ name, value ] of Object.entries( patch.attributes || {} ) ) {
		if ( value === null ) delete result.attributes[ name ];
		else result.attributes[ name ] = String( value );
	}
	if ( patch.classes !== undefined ) result.classes = [ ...patch.classes ];
	if ( patch.styles !== undefined ) result.styles = { ...patch.styles };
	return result;
}

export function iframeLayout( data = {} ) {
	const attributes = data.attributes || {}, styles = data.styles || {};
	const width = styles.width || normalizeDimension( attributes.width, 'px' ) || '300px';
	const height = styles.height === 'auto' ? '' : styles.height || normalizeDimension( attributes.height, 'px' ) || ( styles[ 'aspect-ratio' ] ? '' : '150px' );
	const ratio = styles[ 'aspect-ratio' ] || ( width.endsWith( 'px' ) && height.endsWith( 'px' ) ? `${ parseFloat( width ) } / ${ parseFloat( height ) }` : '16 / 9' );
	const align = [ 'left', 'right' ].includes( styles.float ) ? styles.float :
		styles[ 'margin-left' ] === 'auto' && styles[ 'margin-right' ] === 'auto' ? 'center' :
		[ 'left', 'right', 'center' ].includes( attributes.align ) ? attributes.align : '';
	return { width, height, ratio, align };
}

/** Layout changes update the iframe itself; no new saved wrapper or theme class is introduced. */
export function iframeLayoutPatch( data, values ) {
	const attributes = {}, styles = { ...data.styles };
	const previous = iframeLayout( data );
	for ( const name of [ 'width', 'height' ] ) {
		if ( values[ name ] === undefined ) continue;
		const value = values[ name ];
		attributes[ name ] = value ? value.replace( /px$/, '' ) : null;
		if ( value ) styles[ name ] = value;
		else if ( name === 'height' ) { styles.height = 'auto'; styles[ 'aspect-ratio' ] = previous.ratio; }
		else delete styles.width;
	}
	if ( values.align !== undefined ) {
		for ( const name of [ 'float', 'margin-left', 'margin-right' ] ) delete styles[ name ];
		if ( [ 'left', 'right', 'center' ].includes( data.attributes?.align ) ) attributes.align = null;
		if ( values.align ) styles.display = 'block';
		else if ( previous.align && styles.display === 'block' ) delete styles.display;
		if ( values.align === 'center' ) { styles[ 'margin-left' ] = 'auto'; styles[ 'margin-right' ] = 'auto'; }
		if ( values.align === 'left' ) Object.assign( styles, { float: 'left', 'margin-left': '0', 'margin-right': '1.5em' } );
		if ( values.align === 'right' ) Object.assign( styles, { float: 'right', 'margin-left': '1.5em', 'margin-right': '0' } );
	}
	return { attributes, styles };
}
