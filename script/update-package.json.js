let path= require('path');
let fs = require('fs');
let pkg = require('../package.json');

let output = './build/src/';
pkg.main = path.relative(output, pkg.main);
pkg.typings = path.relative(output, pkg.typings);
delete pkg.scripts.prepublish;
fs.writeFileSync(output+'package.json', JSON.stringify(pkg));