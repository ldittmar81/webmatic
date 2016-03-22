#!/bin/sh

ISALPHA=$(cat ISALPHA)
VERSION=""
STABLEVERSION=""
FOLDER=""

if [ ${ISALPHA} = "0" ]; then
    VERSION=$(cat VERSION)
    STABLEVERSION=${VERSION}
    FOLDER=webmatic
    mkdir -p tmp/${FOLDER}
    cp -a VERSION tmp/
    mkdir -p tmp/rc.d
    cp -a rc.d/webmatic tmp/rc.d/
    cp -a update_script tmp/
elif [ ${ISALPHA} = "1" ]; then
    VERSION=$(cat VERSIONALPHA)
    STABLEVERSION=$(cat VERSION)
    FOLDER=wmalpha
    mkdir -p tmp/${FOLDER}
    cp -a VERSIONALPHA tmp/VERSION
    mkdir -p tmp/rc.d
    cp -a rc.d/wmalpha tmp/rc.d/
    cp -a update_script_alpha tmp/update_script
fi

cp webmatic/*.* tmp/${FOLDER}/
cp -a webmatic/cgi tmp/${FOLDER}/
cp -a webmatic/img tmp/${FOLDER}/
cp -a webmatic/libs tmp/${FOLDER}/
mkdir -p tmp/${FOLDER}/js/i18n
cp -a webmatic/js/*.min.js tmp/${FOLDER}/js/
cp -a webmatic/js/i18n/*.min.js tmp/${FOLDER}/js/i18n/
mkdir -p tmp/${FOLDER}/themes
cp -a webmatic/themes/*.min.* tmp/${FOLDER}/themes/
cp -a webmatic/themes/images tmp/${FOLDER}/themes/
cp -a webmatic/themes/fonts tmp/${FOLDER}/themes/
cp -a ccu1 tmp/
cp -a ccu2 tmp/
cp -a ccurm tmp/

GERDATE=$(date +"%d.%m.%y")
HASHDATE=$(date +"%y%m%d")

cd tmp 

cd ${FOLDER}
sed -i "s/BETAVERSION/${VERSION}/g" index.html
sed -i "s/BETAVERSION/${VERSION}/g" get.html
sed -i "s/BETAVERSION/${VERSION}/g" dlgAbout.html
sed -i "s/BETAVERSION/${VERSION}/g" webmatic.appcache
sed -i "s/RELEASEDATE/${GERDATE}/g" dlgAbout.html

sed -i "s/<html lang=\"de\">/<html lang=\"de\" manifest=\"webmatic.appcache\">/g" index.html
sed -i "s/<html lang=\"de\">/<html lang=\"de\" manifest=\"webmatic.appcache\">/g" get.html

sed -i "s/webmatic.css/webmatic.min.css?${HASHDATE}/" index.html
sed -i "s/webmatic.css/webmatic.min.css?${HASHDATE}/" get.html
sed -i "s/webmatic.css/webmatic.min.css?${HASHDATE}/" dlgAbout.html

sed -i "s/wmmap.de.js/wmmap.de.min.js?${HASHDATE}/" index.html
sed -i "s/wmmap.de.js/wmmap.de.min.js?${HASHDATE}/" get.html
sed -i "s/wmmap.js/wmmap.min.js?${HASHDATE}/" index.html
sed -i "s/wmmap.js/wmmap.min.js?${HASHDATE}/" get.html
sed -i "s/wmhelper.js/wmhelper.min.js?${HASHDATE}/" index.html
sed -i "s/wmhelper.js/wmhelper.min.js?${HASHDATE}/" get.html
sed -i "s/webmatic.js/webmatic.min.js?${HASHDATE}/" index.html
sed -i "s/webmatic.js/webmatic.min.js?${HASHDATE}/" get.html
sed -i "s/options.js/options.min.js?${HASHDATE}/" index.html
sed -i "s/loadData.js/loadData.min.js?${HASHDATE}/" index.html
sed -i "s/loadData.js/loadData.min.js?${HASHDATE}/" get.html
sed -i "s/init.js/init.min.js?${HASHDATE}/" index.html
sed -i "s/init.js/init.min.js?${HASHDATE}/" get.html
sed -i "s/index.js/index.min.js?${HASHDATE}/" index.html
sed -i "s/get.js/get.min.js?${HASHDATE}/" get.html

cd js

sed -i "s/webmaticVersion=\"0\"/webmaticVersion=\"${VERSION}\"/" wmhelper.min.js
sed -i "s/lastStableVersion=\"0\"/lastStableVersion=\"${STABLEVERSION}\"/" wmhelper.min.js
sed -i "s/isPreRelease=0/isPreRelease=${ISALPHA}/" wmhelper.min.js
sed -i "s/debugModus=true/debugModus=false/" wmhelper.min.js

cd ..

cd ..

tar --owner=root --group=root -czvf ../webmatic-${VERSION}.tar.gz *
cd ..
rm -rf tmp