# vfile-find-down

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

Find [vfile][]s by searching the file system downwards.

## Install

[npm][]:

```sh
npm install vfile-find-down
```

## Use

```js
var findDown = require('vfile-find-down')

findDown.all('.md', console.log)
```

Yields:

```js
null [ VFile {
  data: {},
  messages: [],
  history: [ '/Users/tilde/projects/oss/vfile-find-down/readme.md' ],
  cwd: '/Users/tilde/projects/oss/vfile-find-down' } ]
```

## API

### `findDown.all(tests[, paths], callback)`

Search for `tests` downwards.
Invokes callback with either an error or an array of files passing `tests`.
Note: Virtual Files are not read (their `contents` is not populated).

##### Parameters

###### `tests`

Things to search for (`string|Function|Array.<tests>`).

If an array is passed in, any test must match a given file for it to be
included.

If a `string` is passed in, the `basename` or `extname` of files must match it
for them to be included (and hidden directories and `node_modules` will not be
searched).

Otherwise, they must be [`function`][test].

###### `paths`

Place(s) to searching from (`Array.<string>` or `string`, default:
`process.cwd()`).

###### `callback`

Function invoked with all matching files (`function cb(err[, files])`).

### `findDown.one(tests[, paths], callback)`

Like `findDown.all`, but invokes `callback` with the first found file, or
`null`.

### `function test(file, stats)`

Check whether a virtual file should be included.
Invoked with a [vfile][] and a [stats][] object.

###### Returns

*   `true` or `findDown.INCLUDE` — Include the file in the results
*   `findDown.SKIP` — Do not search inside this directory
*   `findDown.BREAK` — Stop searching for files
*   anything else is ignored: files are neither included nor skipped

The different flags can be combined by using the pipe operator:
`findDown.INCLUDE | findDown.SKIP`.

## Contribute

See [`contributing.md`][contributing] in [`vfile/.github`][health] for ways to
get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://img.shields.io/travis/vfile/vfile-find-down.svg

[build]: https://travis-ci.org/vfile/vfile-find-down

[coverage-badge]: https://img.shields.io/codecov/c/github/vfile/vfile-find-down.svg

[coverage]: https://codecov.io/github/vfile/vfile-find-down

[downloads-badge]: https://img.shields.io/npm/dm/vfile-find-down.svg

[downloads]: https://www.npmjs.com/package/vfile-find-down

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-spectrum-7b16ff.svg

[chat]: https://spectrum.chat/unified/vfile

[npm]: https://docs.npmjs.com/cli/install

[contributing]: https://github.com/vfile/.github/blob/master/contributing.md

[support]: https://github.com/vfile/.github/blob/master/support.md

[health]: https://github.com/vfile/.github

[coc]: https://github.com/vfile/.github/blob/master/code-of-conduct.md

[license]: license

[author]: https://wooorm.com

[vfile]: https://github.com/vfile/vfile

[stats]: https://nodejs.org/api/fs.html#fs_class_fs_stats

[test]: #function-testfile-stats
