#!/bin/bash

node script/gen-pkg.ts.js
tsc
node script/update-package.json.js
cp README.md build/src/

./script/setup.sh
webpack