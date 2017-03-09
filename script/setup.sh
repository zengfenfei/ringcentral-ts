#!/bin/bash

cd $(dirname $0)/..
cd build/

links=("package.json" "data")
for link in "${links[@]}"
do
[ -e $link ] && rm $link
ln -sf ../$link $link
done