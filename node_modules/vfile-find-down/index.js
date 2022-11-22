'use strict'

var fs = require('fs')
var path = require('path')
var vfile = require('to-vfile')

var INCLUDE = 1
var SKIP = 4
var BREAK = 8

exports.INCLUDE = INCLUDE
exports.SKIP = SKIP
exports.BREAK = BREAK
exports.all = all
exports.one = one

var own = {}.hasOwnProperty
var readdir = fs.readdir
var stat = fs.stat
var resolve = path.resolve
var join = path.join

// Find a file or a directory downwards.
function one(test, paths, callback) {
  return find(test, paths, callback, true)
}

// Find files or directories downwards.
function all(test, paths, callback) {
  return find(test, paths, callback)
}

// Find applicable files.
function find(test, paths, callback, one) {
  var state = {
    broken: false,
    checked: [],
    test: augment(test)
  }

  if (!callback) {
    callback = paths
    paths = [process.cwd()]
  } else if (typeof paths === 'string') {
    paths = [paths]
  }

  return visitAll(state, paths, null, one, done)

  function done(result) {
    callback(null, one ? result[0] || null : result)
  }
}

// Find files in `filePath`.
function visit(state, filePath, one, done) {
  var file

  // Don’t walk into places multiple times.
  if (own.call(state.checked, filePath)) {
    done([])
    return
  }

  state.checked[filePath] = true

  file = vfile(filePath)

  stat(resolve(filePath), onstat)

  function onstat(error, stats) {
    var real = Boolean(stats)
    var results = []
    var result

    if (state.broken || !real) {
      done([])
    } else {
      result = state.test(file, stats)

      if (mask(result, INCLUDE)) {
        results.push(file)

        if (one) {
          state.broken = true
          return done(results)
        }
      }

      if (mask(result, BREAK)) {
        state.broken = true
      }

      if (state.broken || !stats.isDirectory() || mask(result, SKIP)) {
        return done(results)
      }

      readdir(filePath, onread)
    }

    function onread(error, entries) {
      visitAll(state, entries, filePath, one, onvisit)
    }

    function onvisit(files) {
      done(results.concat(files))
    }
  }
}

// Find files in `paths`.  Returns a list of applicable files.
// eslint-disable-next-line max-params
function visitAll(state, paths, cwd, one, done) {
  var expected = paths.length
  var actual = -1
  var result = []

  paths.forEach(each)

  next()

  function each(filePath) {
    visit(state, join(cwd || '', filePath), one, onvisit)
  }

  function onvisit(files) {
    result = result.concat(files)
    next()
  }

  function next() {
    actual++

    if (actual === expected) {
      done(result)
    }
  }
}

// Augment `test` from several supported values to a function returning a
// boolean.
function augment(test) {
  if (typeof test === 'function') {
    return test
  }

  return typeof test === 'string' ? testString(test) : multiple(test)
}

// Wrap a string given as a test.
// A normal string checks for equality to both the filename and extension.
// A string starting with a `.` checks for that equality too, and also to just
// the extension.
function testString(test) {
  return check

  // Check whether the given `file` matches the bound value.
  function check(file) {
    var basename = file.basename

    if (test === basename || test === file.extname) {
      return true
    }

    if (basename.charAt(0) === '.' || basename === 'node_modules') {
      return SKIP
    }
  }
}

function multiple(test) {
  var length = test.length
  var index = -1
  var tests = []

  while (++index < length) {
    tests[index] = augment(test[index])
  }

  return check

  function check(file) {
    var result

    index = -1

    while (++index < length) {
      result = tests[index](file)

      if (result) {
        return result
      }
    }

    return false
  }
}

function mask(value, bitmask) {
  return (value & bitmask) === bitmask
}
