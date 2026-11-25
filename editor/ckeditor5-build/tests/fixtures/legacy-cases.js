/** Small, synthetic CKEditor 4-style samples. Assert meaning, allowing v5 to normalize HTML. */
export const legacyCases = [
	{
		name: 'styled containers and text languages',
		html: '<div class="custom-panel" style="padding:12px"><p>First <strong>bold</strong> <em>italic</em></p><p><span class="highlight1">Highlighted</span> <span lang="nl" dir="ltr">Nederlands</span></p></div>',
		checks: [
			{ selector: '.custom-panel', styles: { padding: '12px' } },
			{ selector: 'strong, b', text: 'bold' }, { selector: 'em, i', text: 'italic' },
			{ selector: '.highlight1', text: 'Highlighted' },
			{ selector: '[lang="nl"]', text: 'Nederlands' }
		]
	},
	{
		name: 'nested lists and an ordered-list start',
		html: '<ol start="3"><li>First<ul><li>Nested</li></ul></li><li>Second</li></ol>',
		checks: [ { selector: 'ol', attributes: { start: '3' } }, { selector: 'ol li ul li', text: 'Nested' }, { selector: 'li', count: 3 } ]
	},
	{
		name: 'table caption, headers and merged cells',
		html: '<table border="1"><caption>Test caption</caption><thead><tr><th>First header</th><th>Second header</th></tr></thead><tbody><tr><td colspan="2">Merged content</td></tr></tbody></table>',
		checks: [
			{ selector: 'table', count: 1 }, { selector: 'th', count: 2 },
			{ selector: 'td[colspan="2"]', text: 'Merged content' },
			{ selector: 'figcaption, caption', text: 'Test caption' }
		]
	},
	{
		name: 'relative image URLs and alternative text',
		html: '<p><img src="media/example.png" alt="A meaningful description" width="120" height="80"></p>',
		checks: [ { selector: 'img', attributes: { src: 'media/example.png', alt: 'A meaningful description' } } ]
	},
	{
		name: 'Xerte page links',
		html: '<p><a href="#" onclick="x_navigateToPage(false,{type:\'linkID\',ID:\'PG123\'}); return false;">Next page</a></p>',
		checks: [ { selector: 'a', text: 'Next page', attributeContains: { onclick: 'PG123' } } ]
	},
	{
		name: 'legacy lightbox links',
		html: '<p><a href="media/example.html" target="_lightbox" data-featherlight-iframe-width="640">Open media</a></p>',
		checks: [ { selector: 'a', text: 'Open media', attributes: { href: 'media/example.html', 'data-featherlight': 'iframe' } } ]
	},
	{
		name: 'Font Awesome icons with accessible descriptions',
		html: '<p><span class="fav2"><i class="fa fa-star" aria-hidden="true"></i><span style="position:absolute;left:-10000px">Star description</span></span></p>',
		checks: [ { selector: '.fav2 i.fa-star', count: 1 }, { selector: '.fav2', text: 'Star description' } ]
	},
	{
		name: 'ruby pronunciation annotations',
		html: '<p><ruby>漢<rp>(</rp><rt>kan</rt><rp>)</rp></ruby></p>',
		checks: [ { selector: 'ruby rt', text: 'kan' }, { selector: 'ruby', textIncludes: '漢' } ]
	},
	{
		name: 'MathJax source and featured equation styles',
		html: '<p><span class="math-tex math-featured">\\(x^2\\)</span></p>',
		checks: [ { selector: '.mathjax.math-featured', text: '\\(x^2\\)' } ]
	},
	{
		name: 'audio widget settings',
		html: '<div class="ckeditor-html5-audio" style="text-align:right"><audio src="about:blank" controls="controls" controlslist="nodownload" title="Example audio"></audio></div>',
		checks: [ { selector: '.ckeditor-html5-audio audio', attributes: { src: 'about:blank', controlslist: 'nodownload', title: 'Example audio' } } ]
	},
	{
		name: 'automatic columns and their content',
		html: '<div class="autocolumns autocolumns2" style="column-count:2;column-gap:20px;column-rule:1px solid #000"><p>Left content</p><p>Right content</p></div>',
		checks: [ { selector: '.autocolumns.autocolumns2', styles: { columnCount: '2', columnGap: '20px' } }, { selector: '.autocolumns p', count: 2 } ]
	}
];
