let fs = require('fs');
let pkg = require('../package.json');

let code = '';
const props = ['version', 'name'];

for (let p of props) {
    code += `export const ${p} = '${pkg[p]}';\n`;
}

fs.writeFileSync('./src/pkg.ts', code);