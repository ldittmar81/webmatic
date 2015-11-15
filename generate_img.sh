#!/bin/sh
mkdir -p tmp
cp -a webmatic tmp/
cp -a webmatic_user tmp/
cp -a ccu1 tmp/
cp -a ccu2 tmp/
cp -a ccurm tmp/
cp -a rc.d tmp/
cp -a update_script tmp/
cp -a VERSION tmp/
cd tmp

tar --owner=root --group=root -czvf ../webmatic-$(cat ../VERSION).tar.gz *
cd ..
rm -rf tmp
