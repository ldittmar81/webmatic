#!/bin/sh
mkdir -p tmp/webmatic
mkdir -p tmp/webmatic/cgi
mkdir -p tmp/webmatic/debug
mkdir -p tmp/webmatic/img
mkdir -p tmp/webmatic/js
mkdir -p tmp/webmatic/jqplot
mkdir -p tmp/webmatic/jquery
mkdir -p tmp/webmatic/themes
mkdir -p tmp/webmatic/themes/images
cp webmatic/* tmp/webmatic
cp webmatic/cgi/* tmp/webmatic/cgi
cp webmatic/debug/* tmp/webmatic/debug
cp -a webmatic/img/* tmp/webmatic/img
cp -a webmatic/jqplot/* tmp/webmatic/jqplot
cp -a webmatic/jquery/* tmp/webmatic/jquery
cp webmatic/js/*.min.js tmp/webmatic/js
cp webmatic/themes/*.min.css tmp/webmatic/themes
cp -a webmatic/themes/images/* tmp/webmatic/themes/images

mkdir -p tmp/webmatic_user
cp -a webmatic_user/* tmp/webmatic_user
cp update_script tmp/
cp webmatic-dlg tmp/
cp VERSION tmp/
cd tmp
tar -czvf ../webmatic-$(cat ../VERSION).tar.gz *
cd ..
rm -rf tmp
