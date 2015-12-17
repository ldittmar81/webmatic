#!/bin/sh

mkdir -p tmp
cp -a webmatic tmp/
cp -a ccu1 tmp/
cp -a ccu2 tmp/
cp -a ccurm tmp/
cp -a rc.d tmp/
cp -a update_script tmp/

ISALPHA=$(cat ISALPHA)
VERSION=""

if [ ${ISALPHA} = "0" ]; then
    VERSION=$(cat VERSION)  
    cp -a VERSION tmp/
elif [ ${ISALPHA} = "1" ]; then
    VERSION=$(cat VERSIONALPHA) 
    cp -a VERSIONALPHA tmp/VERSION
fi

GERDATE=$(date +"%d.%m.%y")
HASHDATE=$(date +"%y%m%d")

cd tmp 

cd webmatic
sed -i "s/BETAVERSION/${VERSION}/g" index.html
sed -i "s/BETAVERSION/${VERSION}/g" get.html
sed -i "s/BETAVERSION/${VERSION}/g" dlgAbout.html
sed -i "s/BETAVERSION/${VERSION}/g" webmatic.appcache
sed -i "s/RELEASEDATE/${GERDATE}/g" dlgAbout.html

sed -i "s/<html lang='de'>/<html lang='de' manifest='webmatic.appcache'>/g" index.html
sed -i "s/<html lang='de'>/<html lang='de' manifest='webmatic.appcache'>/g" get.html
sed -i "s/<html lang='de'>/<html lang='de' manifest='webmatic.appcache'>/g" dlgAbout.html

sed -i "s/webmatic.css/webmatic.min.css?${HASHDATE}/" index.html
sed -i "s/webmatic.css/webmatic.min.css?${HASHDATE}/" get.html

sed -i "s/wmmap.de.js/wmmap.de.min.js?${HASHDATE}/" index.html
sed -i "s/wmmap.de.js/wmmap.de.min.js?${HASHDATE}/" get.html
sed -i "s/wmmap.js/wmmap.min.js?${HASHDATE}/" index.html
sed -i "s/wmmap.js/wmmap.min.js?${HASHDATE}/" get.html
sed -i "s/wmhelper.js/wmhelper.min.js?${HASHDATE}/" index.html
sed -i "s/wmhelper.js/wmhelper.min.js?${HASHDATE}/" get.html
sed -i "s/webmatic.js/webmatic.min.js?${HASHDATE}/" index.html
sed -i "s/webmatic.js/webmatic.min.js?${HASHDATE}/" get.html
sed -i "s/index.js/index.min.js?${HASHDATE}/" index.html
sed -i "s/get.js/get.min.js?${HASHDATE}/" get.html

cd js

sed -i "s/webmaticVersion=\"0\"/webmaticVersion=\"${VERSION}\"/" wmhelper.min.js
sed -i "s/isPreRelease=0/isPreRelease=${ISALPHA}/" wmhelper.min.js
sed -i "s/debugModus=true/debugModus=false/" wmhelper.min.js

cd ..

cd ..

tar --owner=root --group=root -czvf ../webmatic-${VERSION}.tar.gz *
cd ..
rm -rf tmp
