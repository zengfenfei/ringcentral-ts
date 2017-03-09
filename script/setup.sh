#!/bin/bash

cd $(dirname $0)/..
cd build/

links=("package.json" "data")
for link in "${links[@]}"
do
[ -e $link ] && rm $link
ln -sf ../$link $link
done

cd -    # Back project root
mkdir -p data
auth_conf=data/test-config.json
[ ! -e $auth_conf ] && echo '{}' > $auth_conf     # Required by test/auth.ts
