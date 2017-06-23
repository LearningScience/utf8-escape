# UTF8-Escape

> Multi format UTF-8 escape utility

So, your project is chocked full of UTF-8 literals 😊, but you need to deploy to a platform that only supports ASCII 😒... Point utf8-escape at your project directory and it will apply escape notations to all supported UTF-8 encoded files 😏. Supports js, json, css, svg, html and can be extended with more.

## Install

```sh
npm install -g utf8-escape
```

```sh
man utf8-escape
```

## Caveats

This tool parses _bytes_ not _source_. This can be a problematic if a format has inconsistent escape support. For example if literals are allowed in both strings and identifiers but escape sequences are not allowed in identifiers, you should operate on copies and use `git diff --word-diff` to verify.

## Usage

Basic usage with CLI:

```sh
# Check first
utf8-escape -nvR ./dist

# Do it now!
utf8-escape -R ./dist

# Glob glob
utf8-escape './dist/**' '!./dist/libs/**'
```

Basic usage with [Gulp](//github.com/gulpjs/gulp):

```js
const gulp = require('gulp');
const utf8Escape = require('utf8-escape');

gulp.task('Escape', () => gulp.src('src/**/*')
	.pipe(utf8Escape({
		quiet: true
	}))
	.pipe(gulp.dest('dist'));
);
```

Basic usage with [Gurt](//github.com/learningscience/gurt):

```js
const utf8Escape = require('utf8-escape');

module.exports['Escape'] = (stream) => stream
	.pipe(utf8Escape({
		quiet: true
	}));
```

## API

### utf8Escape([options])

#### options.verbose
Type: `Boolean`

Increase output verbosity, output encoding details for every file. Lists all selected files regardless of encoding or support, as UTF-8, ASCII or BINARY.

#### options.quiet
Type: `Boolean`

Decrease output verbosity, suppress all output including errors. Useful when invoking from a shell script or as part of a build pipeline e.g Gulp / Gurt.

#### options.format
Type: `Object`

Define custom escape notation formats where {b:p:s} denotes the code point and it's numeric base (b), zero padding width (p), and use of surrogates (s):

```js
// ES5
format: {
	js: '\\u{16:4:1}'
}
// ES6
format: {
	js: '\\u{{16:0:0}}'
}
```

## Contribute

Suggestions and contributions will be considered. When crafting a pull request please consider if your contribution is a good fit with the project, follow contribution best practices and use the github "flow" workflow.

## License

[The MIT License](LICENSE.md)
