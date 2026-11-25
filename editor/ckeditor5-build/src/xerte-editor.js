/**
 * Xerte CKEditor 5 classic build (GPL-2.0+ via CKEditor packages).
 */
import {
	ClassicEditor,
	InlineEditor,
	Emoji,
	Essentials,
	Autoformat,
	Bold,
	Italic,
	Underline,
	Strikethrough,
	Subscript,
	Superscript,
	Code,
	BlockQuote,
	Heading,
	AutoLink,
	Link,
	LinkImage,
	List,
	ListProperties,
	Paragraph,
	Image,
	ImageCaption,
	ImageResize,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	AutoImage,
	Table,
	TableToolbar,
	TableCaption,
	TableProperties,
	TableCellProperties,
	Indent,
	IndentBlock,
	TextPartLanguage,
	Alignment,
	HorizontalLine,
	FontSize,
	FontFamily,
	FontColor,
	FontBackgroundColor,
	Fullscreen,
	PasteFromOffice,
	GeneralHtmlSupport,
	SourceEditing,
	ShowBlocks,
	SpecialCharacters,
	SpecialCharactersEssentials,
	Style,
	FindAndReplace,
	CodeBlock,
	RemoveFormat,
	MediaEmbed,
	Mention,
	HtmlEmbed
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import '../../../modules/common/css/rich-text-tables.css';
import './autocolumns.css';
import './xerte-image-editing.css';
import { XerteUploadAdapter } from './plugins/xerte-upload-adapter.js';
import { XerteBrowseMedia } from './plugins/xerte-browse-media.js';
import { XerteAudio } from './plugins/xerte-audio.js';
import { XerteRecorder } from './plugins/xerte-recorder.js';
import '../../js/vendor/ckeditor5/lang/en.js';
import { XerteMathJaxSnippet } from './plugins/xerte-mathjax-snippet.js';
import { XertePageLink } from './plugins/xerte-page-link.js';
import { XerteMarkWord } from './plugins/xerte-mark-word.js';
import { XerteSpecialCharacters } from './plugins/xerte-special-characters.js';
import { XerteMarkTag } from './plugins/xerte-mark-tag.js';
import { XerteContextMenu } from './plugins/xerte-context-menu.js';
import { XerteAutocolumns } from './plugins/xerte-autocolumns-dialog.js';
import { XerteFontAwesome } from './plugins/xerte-fontawesome.js';
import { XerteLineHeight } from './plugins/xerte-line-height.js';
import { XerteRubyText } from './plugins/xerte-ruby-text.js';
import { XerteMediaEmbedRoundTrip } from './plugins/xerte-media-embed-roundtrip.js';
import { XerteMediaResize } from './plugins/xerte-media-resize.js';
import { XerteLightbox } from './plugins/xerte-lightbox.js';
import { XerteLinkTarget } from './plugins/xerte-link-target.js';
import { XerteLinkDialog } from './plugins/xerte-link-dialog.js';
import { XerteAccessibilityChecker } from './plugins/xerte-accessibility-checker.js';
import { XerteSourceDialog } from './plugins/xerte-source-dialog.js';
import { XerteIframeEditing } from './plugins/xerte-iframe-editing.js';
import { XerteStylePreview } from './plugins/xerte-style-preview.js';
import { XerteLegacyStyles, legacyStyles } from './plugins/xerte-legacy-styles.js';

const toolbarItems = [
	'sourceEditing', '|',
	'undo', 'redo', 'findAndReplace', '|',
	'bold', 'italic', 'underline', 'removeFormat', 'strikethrough', 'subscript', 'superscript', 'code', '|',
	'xerteLink', 'xotlink', '|',
	'style', 'heading', 'fontFamily', 'fontSize', 'lineHeight', '|',
	'fontColor', 'fontBackgroundColor', '|',
	'accessibilityChecker', 'fullscreen', 'showBlocks', '|',
	'xerteBrowseImage', 'xerteBrowseMedia', 'xerteAudio', 'xerteRecorder', 'mediaEmbed', 'insertTable', 'autocolumns', 'htmlEmbed', '|',
	'horizontalLine', 'specialCharacters', 'emoji', 'fontAwesome', 'xerteMathJax', 'xerteRubyText', '|',
	'bulletedList', 'numberedList', 'outdent', 'indent', 'blockQuote', 'codeBlock', 'alignment', 'textPartLanguage', '|',
	'markTag'
];

const imageToolbar = [
	'xerteImageProperties',
	'|',
	'imageStyle:inline',
	'imageStyle:wrapText',
	'imageStyle:breakText',
	'|',
	'resizeImage',
	'|',
	'toggleImageCaption',
	'imageTextAlternative',
	'linkImage'
];

const tableWidgetToolbar = [ 'tableProperties', 'toggleTableCaption' ];

const tableContentToolbar = [
	'tableColumn',
	'tableRow',
	'|',
	'mergeTableCells',
	'tableProperties',
	'tableCellProperties',
	'|',
	'toggleTableCaption'
];

const htmlAllowAll = {
	name: /.*/,
	attributes: true,
	classes: true,
	styles: true
};

const styleVariants = [ 1, 2, 3, 4, 5, 6 ];

const xerteBuiltinPlugins = [
	XerteIframeEditing,
	Essentials,
	Mention,
	Emoji,
	Paragraph,
	Autoformat,
	Bold,
	Italic,
	Underline,
	Strikethrough,
	Subscript,
	Superscript,
	Code,
	RemoveFormat,
	BlockQuote,
	Heading,
	AutoLink,
	Link,
	LinkImage,
	List,
	ListProperties,
	Image,
	ImageCaption,
	ImageResize,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	AutoImage,
	Table,
	TableToolbar,
	TableCaption,
	TableProperties,
	TableCellProperties,
	Indent,
	IndentBlock,
	TextPartLanguage,
	Alignment,
	HorizontalLine,
	FontSize,
	FontFamily,
	FontColor,
	FontBackgroundColor,
	Fullscreen,
	PasteFromOffice,
	GeneralHtmlSupport,
	SourceEditing,
	ShowBlocks,
	SpecialCharacters,
	SpecialCharactersEssentials,
	Style,
	XerteStylePreview,
	XerteLegacyStyles,
	FindAndReplace,
	CodeBlock,
	MediaEmbed,
	XerteMediaEmbedRoundTrip,
	XerteMediaResize,
	XerteLightbox,
	XerteLinkTarget,
	XerteLinkDialog,
	XerteAccessibilityChecker,
	XerteSourceDialog,
	HtmlEmbed,
	XerteUploadAdapter,
	XerteBrowseMedia,
	XerteAudio,
	XerteRecorder,
	XerteMathJaxSnippet,
	XertePageLink,
	XerteMarkWord,
	XerteSpecialCharacters,
	XerteMarkTag,
	XerteContextMenu,
	XerteAutocolumns,
	XerteFontAwesome,
	XerteLineHeight,
	XerteRubyText
];

const defaultTableBorder = { borderStyle: 'solid', borderWidth: '1px', borderColor: '#808080' };

const xerteDefaultConfig = {
	licenseKey: 'GPL',
	translations: [ { en: globalThis.CKEDITOR_TRANSLATIONS.en } ],
	menuBar: {
		isVisible: true
	},
	toolbar: {
		items: toolbarItems,
		shouldNotGroupWhenFull: false
	},
	heading: {
		options: [
			{
				model: 'paragraph',
				title: 'Paragraph',
				class: 'ck-heading_paragraph'
			},
			{
				model: 'heading1',
				view: 'h2',
				title: 'Heading 1',
				class: 'ck-heading_heading1'
			},
			{
				model: 'heading2',
				view: 'h3',
				title: 'Heading 2',
				class: 'ck-heading_heading2'
			},
			{
				model: 'heading3',
				view: 'h4',
				title: 'Heading 3',
				class: 'ck-heading_heading3'
			},
			{
				model: 'heading4',
				view: 'h5',
				title: 'Heading 4',
				class: 'ck-heading_heading4'
			},
			{
				model: 'heading5',
				view: 'h6',
				title: 'Heading 5',
				class: 'ck-heading_heading5'
			},
			{
				model: 'address',
				view: 'address',
				title: 'Address',
				class: 'ck-heading_address'
			},
			{
				model: 'div',
				view: 'div',
				title: 'Normal (DIV)',
				class: 'ck-heading_div',
				// DIVs may be containers or widgets, not just text blocks. Let
				// dedicated features and GHS preserve their structure first.
				converterPriority: 'low'
			}
		]
	},
	codeBlock: {
		languages: [
			{ language: 'plaintext', label: 'Plain text', class: '' },
			{ language: 'apache', label: 'Apache' },
			{ language: 'bash', label: 'Bash' },
			{ language: 'coffeescript', label: 'CoffeeScript' },
			{ language: 'cpp', label: 'C++' },
			{ language: 'cs', label: 'C#' },
			{ language: 'css', label: 'CSS' },
			{ language: 'diff', label: 'Diff' },
			{ language: 'html', label: 'HTML' },
			{ language: 'http', label: 'HTTP' },
			{ language: 'ini', label: 'INI' },
			{ language: 'java', label: 'Java' },
			{ language: 'javascript', label: 'JavaScript' },
			{ language: 'json', label: 'JSON' },
			{ language: 'makefile', label: 'Makefile' },
			{ language: 'markdown', label: 'Markdown' },
			{ language: 'nginx', label: 'Nginx' },
			{ language: 'objectivec', label: 'Objective-C' },
			{ language: 'perl', label: 'Perl' },
			{ language: 'php', label: 'PHP' },
			{ language: 'python', label: 'Python' },
			{ language: 'ruby', label: 'Ruby' },
			{ language: 'sql', label: 'SQL' },
			{ language: 'vbscript', label: 'VBScript' },
			{ language: 'xhtml', label: 'XHTML' },
			{ language: 'xml', label: 'XML' }
		]
	},
	image: {
		toolbar: imageToolbar,
		resizeUnit: '%',
		resizeOptions: [
			{ name: 'resizeImage:original', value: null, icon: 'original' },
			{ name: 'resizeImage:custom', value: 'custom', icon: 'custom' },
			{ name: 'resizeImage:25', value: '25', icon: 'small' },
			{ name: 'resizeImage:50', value: '50', icon: 'medium' },
			{ name: 'resizeImage:75', value: '75', icon: 'large' },
			{ name: 'resizeImage:100', value: '100', icon: 'original' }
		]
	},
	table: {
		contentToolbar: tableContentToolbar,
		tableToolbar: tableWidgetToolbar,
		showHiddenBorders: false,
		// These values are implicit in saved HTML. Match rich-text-tables.css
		// so selecting a different value (including middle alignment) saves it.
		tableProperties: {
			defaultProperties: defaultTableBorder,
			// Players do not load CKEditor's new alignment classes. Store equivalent
			// inline styles so aligned tables display in existing Xerte themes.
			alignment: { useInlineStyles: true }
		},
		tableCellProperties: {
			defaultProperties: {
				...defaultTableBorder,
				padding: '10px', verticalAlignment: 'top'
			}
		}
	},
	link: {
		toolbar: [ 'xerteLinkPreview', 'xerteEditPageLink', '|', 'xerteEditLink', 'unlink' ]
	},
	language: {
		ui: 'en',
		textPartLanguage: [
			{ title: 'English (en-GB)', languageCode: 'en-GB' },
			{ title: 'Nederlands (nl-NL)', languageCode: 'nl-NL' },
			{ title: 'Vlaams (nl-BE)', languageCode: 'nl-BE' },
			{ title: 'Français (fr-FR)', languageCode: 'fr-FR' },
			{ title: 'Español (es-ES)', languageCode: 'es-ES' },
			{ title: 'Czech (cs-CZ)', languageCode: 'cs-CZ' },
			{ title: 'Cymraeg (cy-GB)', languageCode: 'cy-GB' },
			{ title: 'Polish (pl-PL)', languageCode: 'pl-PL' },
			{ title: 'Russian (ru-RU)', languageCode: 'ru-RU' },
			{ title: 'Norsk bokmål (nb-NO)', languageCode: 'nb-NO' },
			{ title: 'Italiano (it-IT)', languageCode: 'it-IT' },
			{ title: 'Japanese (ja-JP)', languageCode: 'ja-JP' },
			{ title: 'Portugues (pt-BR)', languageCode: 'pt-BR' },
			{ title: 'Deutsch (de-DE)', languageCode: 'de-DE' },
			{ title: 'Türkçe (tr-TR)', languageCode: 'tr-TR' },
			{ title: 'Українська (uk-UA)', languageCode: 'uk-UA' },
			{ title: 'Ελληνικά (el-GR)', languageCode: 'el-GR' },
			{ title: 'Arabic', languageCode: 'ar', textDirection: 'rtl' },
			{ title: 'Hebrew', languageCode: 'he', textDirection: 'rtl' }
		]
	},
	htmlSupport: {
		allow: [ htmlAllowAll ]
	},
	style: {
		definitions: [
			{
				// Keep the paragraph style available for content authored during the CKEditor 5 rollout.
				name: 'Panel',
				element: 'p',
				classes: [ 'panel1' ],
				existingOnly: true
			},
			{
				name: 'Inline Panel',
				element: 'span',
				classes: [ 'panel', 'editorStyle', 'inline' ],
				existingOnly: true
			},
			...styleVariants.map( number => ( {
				name: `Panel ${ number }`,
				element: 'span',
				classes: [ `panel${ number }` ]
			} ) ),
			...styleVariants.map( number => ( {
				name: `Highlight ${ number }`,
				element: 'span',
				classes: [ `highlight${ number }` ]
			} ) ),
			...legacyStyles
		]
	},
	mediaEmbed: {
		previewsInData: true,
		toolbar: [ 'xerteMediaProperties' ]
	},
	htmlEmbed: {
		showPreviews: true
	},
	xerteUploadUrl: '',
	xerteUploadAudioUrl: '',
	xerteBrowseImageUrl: '',
	xerteBrowseMediaUrl: '',
	xerteMathJaxLib: 'offline/js/mathjax/MathJax.js?config=TeX-MML-AM_HTMLorMML-full'
};

export class XerteClassicEditor extends ClassicEditor {}
XerteClassicEditor.builtinPlugins = xerteBuiltinPlugins;
XerteClassicEditor.defaultConfig = xerteDefaultConfig;

// Titles/metadata remain native inline editors in the wizard, as in CKEditor 4.
// Their final heading styling belongs to the player; applying the project theme
// here would also change ordinary form-field fonts/backgrounds. Only rich-text
// bodies need the iframe plugin and fullscreen shell.
export class XerteInlineEditor extends InlineEditor {}
XerteInlineEditor.builtinPlugins = xerteBuiltinPlugins.filter( plugin => plugin !== Fullscreen && plugin !== XerteIframeEditing );
XerteInlineEditor.defaultConfig = {
	...xerteDefaultConfig,
	toolbar: {
		...xerteDefaultConfig.toolbar,
		items: toolbarItems
			.filter( item => item !== 'fullscreen' )
			.map( item => item === 'sourceEditing' ? 'xerteSourceDialog' : item )
	}
};

export default {
	Classic: XerteClassicEditor,
	Inline: XerteInlineEditor
};
