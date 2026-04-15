/**
 * Xerte CKEditor 5 classic build (GPL-2.0+ via CKEditor packages).
 */
import 'ckeditor5/ckeditor5.css';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { InlineEditor } from '@ckeditor/ckeditor5-editor-inline';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import {
	Bold,
	Italic,
	Underline,
	Strikethrough,
	Subscript,
	Superscript,
	Code
} from '@ckeditor/ckeditor5-basic-styles';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Link, LinkImage } from '@ckeditor/ckeditor5-link';
import { List, ListProperties } from '@ckeditor/ckeditor5-list';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import {
	Image,
	ImageCaption,
	ImageResize,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	AutoImage
} from '@ckeditor/ckeditor5-image';
import { Table, TableToolbar, TableCaption } from '@ckeditor/ckeditor5-table';
import { Indent, IndentBlock } from '@ckeditor/ckeditor5-indent';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { FontSize, FontFamily, FontColor, FontBackgroundColor } from '@ckeditor/ckeditor5-font';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { SpecialCharacters, SpecialCharactersEssentials } from '@ckeditor/ckeditor5-special-characters';
import { FindAndReplace } from '@ckeditor/ckeditor5-find-and-replace';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { RemoveFormat } from '@ckeditor/ckeditor5-remove-format';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { HtmlEmbed } from '@ckeditor/ckeditor5-html-embed';
import { XerteUploadAdapter } from './plugins/xerte-upload-adapter.js';
import { XerteBrowseMedia } from './plugins/xerte-browse-media.js';
import { XerteMathJaxSnippet } from './plugins/xerte-mathjax-snippet.js';
import { XertePageLink } from './plugins/xerte-page-link.js';
import { XerteMarkWord } from './plugins/xerte-mark-word.js';

const toolbarItems = [
	'undo', 'redo', '|',
	'findAndReplace', '|',
	'sourceEditing', 'htmlEmbed', '|',
	'heading', '|',
	'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
	'bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', 'code', 'removeFormat', '|',
	'specialCharacters', 'horizontalLine', 'xerteMathJax', '|',
	'link', 'xotlink', 'insertImage', 'xerteBrowseMedia', 'mediaEmbed', 'insertTable', 'blockQuote', 'codeBlock', '|',
	'alignment', '|',
	'bulletedList', 'numberedList', 'outdent', 'indent', '|',
	'xotMarkWord'
];

const imageToolbar = [
	'imageStyle:inline',
	'imageStyle:block',
	'imageStyle:side',
	'|',
	'toggleImageCaption',
	'imageTextAlternative',
	'linkImage'
];

const tableToolbar = [
	'insertTableColumnLeft',
	'insertTableColumnRight',
	'deleteTableColumn',
	'|',
	'insertTableRowAbove',
	'insertTableRowBelow',
	'deleteTableRow',
	'|',
	'toggleTableCaption'
];

const htmlAllowAll = {
	name: /.*/,
	attributes: true,
	classes: true,
	styles: true
};

const xerteBuiltinPlugins = [
	Essentials,
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
	Indent,
	IndentBlock,
	Alignment,
	HorizontalLine,
	FontSize,
	FontFamily,
	FontColor,
	FontBackgroundColor,
	PasteFromOffice,
	GeneralHtmlSupport,
	SourceEditing,
	SpecialCharacters,
	SpecialCharactersEssentials,
	FindAndReplace,
	CodeBlock,
	MediaEmbed,
	HtmlEmbed,
	XerteUploadAdapter,
	XerteBrowseMedia,
	XerteMathJaxSnippet,
	XertePageLink,
	XerteMarkWord
];

const xerteDefaultConfig = {
	licenseKey: 'GPL',
	menuBar: {
		isVisible: true
	},
	toolbar: {
		items: toolbarItems,
		shouldNotGroupWhenFull: true
	},
	image: {
		toolbar: imageToolbar
	},
	table: {
		contentToolbar: tableToolbar
	},
	link: {
		decorators: {
			openInNewTab: {
				mode: 'automatic',
				callback: url => /^(https?:|mailto:)/i.test( url ),
				attributes: {
					target: '_blank',
					rel: 'noopener noreferrer'
				}
			}
		}
	},
	htmlSupport: {
		allow: [ htmlAllowAll ]
	},
	mediaEmbed: {
		previewsInData: true
	},
	htmlEmbed: {
		showPreviews: true
	},
	language: 'en',
	xerteUploadUrl: '',
	xerteBrowseMediaUrl: ''
};

export class XerteClassicEditor extends ClassicEditor {}
XerteClassicEditor.builtinPlugins = xerteBuiltinPlugins;
XerteClassicEditor.defaultConfig = xerteDefaultConfig;

export class XerteInlineEditor extends InlineEditor {}
XerteInlineEditor.builtinPlugins = xerteBuiltinPlugins;
XerteInlineEditor.defaultConfig = xerteDefaultConfig;

export default {
	Classic: XerteClassicEditor,
	Inline: XerteInlineEditor
};
