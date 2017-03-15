'use strict';

let path = require('path');
let fs = require('fs');
let child_process = require('child_process');
let pkg = require('../package.json');

let output = './build/src/';
pkg.main = path.relative(output, pkg.main);
pkg.types = path.relative(output, pkg.types);
try {
    updateVersion2gitTag(pkg);
} catch (e) { }
fs.writeFileSync(output + 'package.json', JSON.stringify(pkg));

// Will throw if not on a tag
function updateVersion2gitTag(pkg) {
    let tag = child_process.execSync('git describe --tag').toString().trim();
    pkg.version = tag;
}