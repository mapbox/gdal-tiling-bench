#!/usr/bin/env node

'use strict';

var bench = require('../src/index.js');
var fs = require('fs');
var fixtures = require('../testcases/index.js');
var argv = require('minimist')(process.argv.slice(2));
var usage = fs.readFileSync(__dirname+ '/usage').toString();

console.log(argv);

// usage
if (argv._.length < 2) console.log(usage);

// test source for fixture first, then file path
var source = (fixtures[argv._[0]]) ? fixtures[argv._[0]] : argv._[0];
// use version specified, or default to latest
var version = (argv._[1]) ? argv._[1] : 'latest';

var opts = {};
if (argv.threadpool) opts.threadpool = argv.threadpool;

bench(source, version, opts, function(err, stats) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // report back based on "save" or "console"
  // probably best to default to console

  console.log('complete!', stats);
});
