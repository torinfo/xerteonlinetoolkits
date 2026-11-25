/* Parser-blocking test assets: always load the current build, in dependency order. */
(() => {
	const bridge = document.currentScript.hasAttribute( 'data-bridge' );
	const run = new URLSearchParams( location.search ).get( 'testRun' ) || Date.now();
	const scripts = [ 'xerte-editor.bundle.js', ...( bridge ? [ 'xerte-ckeditor5.js' ] : [] ) ];
	document.write( scripts.map( name => '<script src="../../js/vendor/ckeditor5/' + name +
		'?testRun=' + encodeURIComponent( run ) + '"></script>' ).join( '' ) );
})();
