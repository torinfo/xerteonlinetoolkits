/**
 * @license Copyright (c) 2003-2025, Xerte / Apereo contributors.
 * Webpack build for CKEditor 5 (GPL-2.0+ via CKEditor packages — see LICENSE-NOTICE.txt next to output bundle).
 */
import path from 'path';
import { fileURLToPath } from 'url';
import postcssNesting from 'postcss-nesting';
import TerserWebpackPlugin from 'terser-webpack-plugin';

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );

// Xerte's player stylesheet supplies these content rules in both views. Keep
// CKEditor's widget, selection and focus rules in the editor bundle.
const stockTableContent = /^\.ck-content(?:\[dir="(?:ltr|rtl)"\])? (?:(?:figure|table)?\.table:not\(\.layout-table\)|\.table (?:th|> figcaption)$|figure\.table(?: > table > caption)?$)/;
const useXerteTableStyles = {
	postcssPlugin: 'xerte-table-content-styles',
	Once( root ) {
		// Only replace upstream content defaults. Xerte's shared player stylesheet
		// and its own editing styles must pass through unchanged.
		if ( !/[\\/]node_modules[\\/](?:ckeditor5|@ckeditor[\\/]ckeditor5-[^\\/]+)[\\/]/.test( root.source.input.file ) ) return;
		root.walkRules( rule => {
			// v49 includes the nested table defaults in its aggregate CSS file.
			const nestedTableContent = rule.selector === '.ck-content' &&
				rule.nodes.some( node => node.type === 'rule' && node.selector === '& .table th' );
			if ( nestedTableContent || rule.selectors.every( selector => stockTableContent.test( selector ) ) ) {
				rule.remove();
			} else if ( rule.selector === '.ck .ck-editor__nested-editable' ) {
				// A transparent editing border changes table cell and caption dimensions.
				rule.selector += ':not(td, th, figure.table > figcaption)';
			}
		} );
	}
};

export default {
	context: __dirname,
	mode: 'production',
	entry: './src/xerte-editor.js',
	output: {
		path: path.resolve( __dirname, '../js/vendor/ckeditor5' ),
		filename: 'xerte-editor.bundle.js',
		library: {
			name: 'XerteCKEditor5',
			type: 'umd',
			export: 'default'
		}
	},
	optimization: {
		minimize: true,
		minimizer: [
			new TerserWebpackPlugin( {
				terserOptions: {
					format: { comments: /^!/ }
				},
				extractComments: false
			} )
		]
	},
	module: {
		rules: [
			{
				test: /\.[cm]?js$/,
				include: path.resolve( __dirname, 'node_modules', '@ckeditor' ),
				use: {
					loader: 'esbuild-loader',
					options: { target: 'es2020' }
				}
			},
			{
				test: /\.[cm]?js$/,
				include: path.resolve( __dirname, 'node_modules', 'ckeditor5' ),
				use: {
					loader: 'esbuild-loader',
					options: { target: 'es2020' }
				}
			},
			{
				test: /\.[cm]?js$/,
				include: path.resolve( __dirname, 'src' ),
				use: {
					loader: 'esbuild-loader',
					options: { target: 'es2020' }
				}
			},
			{
				test: /\.svg$/,
				type: 'asset/source'
			},
			{
				test: /\.css$/,
				use: [
					{
						loader: 'style-loader',
						// The iframe plugin copies styles carrying this attribute.
						options: { injectType: 'singletonStyleTag', attributes: { 'data-cke': true } }
					},
					{ loader: 'css-loader', options: { importLoaders: 1 } },
					{
						loader: 'postcss-loader',
						options: { postcssOptions: { config: false, plugins: [ useXerteTableStyles, postcssNesting() ] } }
					}
				]
			}
		]
	},
	performance: { hints: false },
	devtool: false
};
