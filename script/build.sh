#!/bin/bash

outDir=build/src/
mkdir -p $outDir
node script/update-package.json.js
node script/gen-pkg.ts.js
tsc
cp README.md $outDir

./script/setup.sh
webpack