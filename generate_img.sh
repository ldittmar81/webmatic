#!/bin/sh
mkdir -p tmp/webmatic
cp -a webmatic/* tmp/webmatic
cp update_script tmp/
cp webmatic-dlg tmp/
cd tmp
tar -czvf ../webmatic-1.3beta.tar.gz *
cd ..
rm -rf tmp
