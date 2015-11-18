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

VERSION=$(cat ../VERSION)
GERDATE=$(date +"%d.%m.%y")
HASHDATE=$(date +"%y%m%d") 

cd webmatic
sed -i "s/BETAVERSION/${VERSION}/g" index.html
sed -i "s/BETAVERSION/${VERSION}/g" get.html
sed -i "s/BETAVERSION/${VERSION}/g" dlgAbout.html

sed -i "s/wmmap.min.js/wmmap.min.js?${HASHDATE}/" index.html
sed -i "s/wmmap.min.js/wmmap.min.js?${HASHDATE}/" get.html
sed -i "s/webmatic.min.js/webmatic.min.js?${HASHDATE}/" index.html
sed -i "s/webmatic.min.js/webmatic.min.js?${HASHDATE}/" get.html
sed -i "s/index.min.js/index.min.js?${HASHDATE}/" index.html
sed -i "s/get.min.js/get.min.js?${HASHDATE}/" get.html

sed -i "s/RELEASEDATE/${GERDATE}/g" dlgAbout.html
cd ..

tar --owner=root --group=root -czvf ../webmatic-${VERSION}.tar.gz *
cd ..
rm -rf tmp
