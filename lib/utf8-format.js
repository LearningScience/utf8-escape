'use strict';

const exp = module.exports;

/**
 * JS Style Notation
 */

exp['js'] =
exp['json'] =
exp['java'] =
	'\\u{16:4:1}';

/**
 * CSS Style Notation
 */

exp['css'] =
exp['scss'] =
exp['less'] =
	'\\{16:0:0} ';

/**
 * XML Style Notation
 */

exp['xml'] =
exp['svg'] =
exp['html'] =
	'&#x{16:0:0};';
