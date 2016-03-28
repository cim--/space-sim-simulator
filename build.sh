#!/bin/bash -e

rm -rf build/
mkdir -p build/

FILES="index.html sss.css"

for I in $FILES ; do
	cp src/$I build/$I
done

SCRIPTS="bower_components/jquery/dist/jquery.min.js src/ship.js src/options.js src/sim.js src/gui.js"

cat $SCRIPTS > build/sss.js
