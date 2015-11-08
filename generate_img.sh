#!/bin/sh
mkdir -p tmp/webmatic
cp -a webmatic/* tmp/webmatic
mkdir -p tmp/webmatic_user
cp -a webmatic_user/* tmp/webmatic_user
cp update_script tmp/
cp webmatic-dlg tmp/
cp VERSION tmp/
cd tmp
tar -czvf ../webmatic-$(cat ../VERSION).tar.gz *
cd ..
rm -rf tmp
