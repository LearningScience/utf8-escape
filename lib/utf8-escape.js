'use strict';

const through2 = require('through2'),
	format = require('./utf8-format.js');

/**
 * Build Format
 */

const build = (format) => {
	let [pref, base, padd, surr, post] =
		format.split(/{(\d+):(\d+):(\d+)}/);
	// Formatter
	let f = C => {
		let code = C.toString(base);
		let leng = Math.max(0, padd - code.length);
		let zero = ('0').repeat(leng);
		return pref + zero + code + post;
	};
	// Surrogate
	let s = C => {
		let S = +surr && C > 0xFFFF;
		let H = 0xD800 | (C - 0x10000) >>> 10;
		let L = 0xDC00 | (C - 0x10000) & 0x03FF;
		return S ? f(H) + f(L) : f(C);
	};
	return s;
};

/**
 * Parse Buffer
 */

const parse = (buffer, format) => {
	let code, n, string = '';
	for (let byte of buffer) {
		// 1 byte sequence
		if (!(0x80 & byte ^ 0x00)) {
			code = byte ^ 0x00;
			string += String.fromCodePoint(code);
			continue;
		}
		// n byte sequence
		if (!(0xC0 & byte ^ 0x80)) {
			code = byte ^ 0x80 | code << 6;
			string += -- n ? '' : format(code);
			continue;
		}
		// 2 byte sequence
		if (!(0xE0 & byte ^ 0xC0)) {
			code = byte ^ 0xC0;
			n = 1;
			continue;
		}
		// 3 byte sequence
		if (!(0xF0 & byte ^ 0xE0)) {
			code = byte ^ 0xE0;
			n = 2;
			continue;
		}
		// 4 byte sequence
		if (!(0xF8 & byte ^ 0xF0)) {
			code = byte ^ 0xF0;
			n = 3;
			continue;
		}
		// Invalid UTF-8
		return false;
	}
	// Valid UTF-8
	return string;
};

/**
 * Logs
 */

const logs = (file, opts) => {
	let type = file.path.replace(/^(.*)\.(\w+)$/, '$2');
	if (type in format) {
		// Supported format
		type = type.toUpperCase();
		type += (' ').repeat(Math.max(0, 5 - type.length));
		!opts.quiet && file.result && console.log(
			'\x1b[32m', 'escaped:', '  UTF-8', type,
			'\x1b[00m', file.relative, '\x1b[0m'
		);
		opts.verbose && file.result === null && console.log(
			'\x1b[00m', 'nominal:', '  ASCII', type,
			'\x1b[00m', file.relative, '\x1b[0m'
		);
		!opts.quiet && file.result === false && console.log(
			'\x1b[31m', 'invalid:', '  UTF-8', type,
			'\x1b[00m', file.relative, '\x1b[0m'
		);
	} else {
		// Unfamiliar format
		type = type.toUpperCase();
		type += (' ').repeat(Math.max(0, 5 - type.length));
		!opts.quiet && file.result && console.log(
			'\x1b[31m', 'unknown:', '  UTF-8', type,
			'\x1b[00m', file.relative, '\x1b[0m'
		);
		opts.verbose && file.result === null && console.log(
			'\x1b[00m', 'nominal:', '  ASCII', type,
			'\x1b[00m', file.relative, '\x1b[0m'
		);
		opts.verbose && file.result === false && console.log(
			'\x1b[02m', '--------', '  BIN-?', type,
			'\x1b[02m', file.relative, '\x1b[0m'
		);
	}
};

/**
 * Main
 */

const main = (file, opts) => {
	let type = file.path.replace(/^(.*)\.(\w+)$/, '$2');
	if (type in format) {
		// Supported format
		file.result = parse(file.contents, format[type]);
	} else {
		// Unfamiliar format
		file.result = parse(file.contents, () => '');
	}
	if (file.result.length === file.contents.length) {
		file.result = null;
	}
	logs(file, opts);
	if (type in format && file.result) {
		file.contents = new Buffer(file.result);
	}
	return file;
};

/**
 * Plug
 */

module.exports = (opts) => {
	Object.assign(format, opts.format);
	// Process formats
	for (let type in format) {
		if (typeof format[type] === 'string') {
			format[type] = build(format[type]);
		}
	}
	// Process buffers
	return through2.obj(function (file, en, cb) {
		if (!file.isDirectory()) {
			this.push(main(file, opts));
		}
		cb();
	});
};
