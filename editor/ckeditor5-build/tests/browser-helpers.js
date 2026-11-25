export const modes = [
	{ name: 'Classic', inlineEditor: false, xerteIframeEditing: false },
	{ name: 'Classic iframe', inlineEditor: false, xerteIframeEditing: true },
	{ name: 'Inline', inlineEditor: true, xerteIframeEditing: false }
];
export const assert = ( condition, message ) => { if ( !condition ) throw new Error( message ); };
let fieldNumber = 0;
export function configFor( mode ) {
	return { inlineEditor: mode.inlineEditor, xerteIframeEditing: mode.xerteIframeEditing, xerteIframeStylesheets: [] };
}
export async function mountEditor( mode ) {
	const section = document.createElement( 'section' );
	const heading = document.createElement( 'h2' ); heading.textContent = mode.name;
	const field = document.createElement( mode.inlineEditor ? 'div' : 'textarea' );
	field.id = 'regression_field_' + ++fieldNumber;
	section.append( heading, field ); document.body.appendChild( section );
	const editor = await XerteCKEditor5Facade.create( field, configFor( mode ) );
	return { section, field, editor };
}
export function record( message ) {
	const output = document.querySelector( '#results' );
	if ( output.textContent === 'Running…' ) output.textContent = '';
	output.textContent += 'PASS: ' + message + '\n';
}
export function finish( error ) {
	if ( error ) document.querySelector( '#results' ).textContent += '\nFAIL: ' + ( error.stack || error );
	document.documentElement.dataset.testStatus = error ? 'failed' : 'passed';
}
export function verifyLegacy( html, sample, context ) {
	const fragment = document.createElement( 'div' ); fragment.innerHTML = html;
	for ( const check of sample.checks ) {
		const nodes = fragment.querySelectorAll( check.selector );
		const label = `${ context }: ${ sample.name } (${ check.selector })`;
		assert( nodes.length > 0, label + ' is missing' );
		if ( check.count !== undefined ) assert( nodes.length === check.count, label + ': incorrect count' );
		const node = nodes[ 0 ];
		if ( check.text !== undefined ) assert( node.textContent === check.text, label + ': text changed' );
		if ( check.textIncludes ) assert( node.textContent.includes( check.textIncludes ), label + ': text lost' );
		for ( const [ key, value ] of Object.entries( check.attributes || {} ) ) assert( node.getAttribute( key ) === value, label + ': ' + key + ' changed' );
		for ( const [ key, value ] of Object.entries( check.attributeContains || {} ) ) assert( node.getAttribute( key )?.includes( value ), label + ': ' + key + ' lost' );
		for ( const [ key, value ] of Object.entries( check.styles || {} ) ) assert( node.style[ key ] === value, label + ': ' + key + ' changed' );
	}
}
