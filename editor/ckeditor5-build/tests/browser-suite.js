export const browserChecks = [
	{ name: 'Initial check — English', url: 'smoke.html?language=en' },
	{ name: 'Initial check — Dutch', url: 'smoke.html?language=nl' },
	{ name: 'Older content and custom widgets', url: 'legacy-content.html' },
	{ name: 'Editor lifecycle, undo and read-only', url: 'editor-lifecycle.html' },
	{ name: 'Iframe contextual toolbar visibility', url: 'contextual-toolbars.html' },
	{ name: 'Save while Source stays open', url: 'source-save.html' },
	{ name: 'HTML and styled DIVs', url: 'html-embed.html' },
	{ name: 'HTML and styled DIVs — iframe', url: 'html-embed.html?iframe=1' },
	{ name: 'Responsive images, media and audio', url: 'responsive-media.html' },
	{ name: 'Media browser dialogs', url: 'media-browser.html' },
	{ name: 'Site uploaded-video playback', url: 'site-media-playback.html' },
	{ name: 'Site native video fullscreen return', url: 'site-native-fullscreen.html' },
	{ name: 'Nottingham video panel sizing', url: 'nottingham-video-sizing.html' },
	{ name: 'Native video fullscreen return', url: 'native-video-fullscreen.html' },
	{ name: 'Established video and audio skin', url: 'player-skin.html' },
	{ name: 'General iframe insertion and legacy properties', url: 'iframe-properties.html' },
	{ name: 'Iframe preview and shared media controls', url: 'iframe-presentation.html' },
	{ name: 'Links and lightboxes', url: 'link-lightbox.html' },
	{ name: 'Links and lightboxes — iframe', url: 'link-lightbox.html?iframe=1' }
];

/** A PASS progress line alone is insufficient to declare a whole page passed. */
export function pageResult( { status, output = '', runtimeFailure = '' }, timedOut = false ) {
	if ( runtimeFailure || status === 'failed' || /(?:^|\n)FAIL:/.test( output ) ) {
		return { status: 'failed', output: runtimeFailure || output || 'Page reported a failure.' };
	}
	if ( status === 'passed' ) return { status: 'passed', output };
	if ( timedOut ) return { status: 'failed', output: output + '\nFAIL: No final result within 90 seconds.' };
	return { status: 'running', output };
}
