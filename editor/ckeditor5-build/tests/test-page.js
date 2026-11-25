/* Shared failure reporting for browser fixtures, including script-load errors. */
(() => {
	document.documentElement.dataset.testStatus = 'running';
	function fail( message ) {
		document.documentElement.dataset.testStatus = 'failed';
		document.documentElement.dataset.runtimeFailure = message;
		const output = document.querySelector( '#results' );
		if ( output ) output.textContent += '\nFAIL: ' + message;
	}
	window.addEventListener( 'error', event => {
		if ( event.message ) fail( event.message );
		else if ( event.target?.tagName === 'SCRIPT' ) fail( 'Unable to load script: ' + event.target.src );
	}, true );
	window.addEventListener( 'unhandledrejection', event => fail( String( event.reason?.stack || event.reason ) ) );
})();
