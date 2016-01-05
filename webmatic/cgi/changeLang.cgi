#!/bin/tclsh

source /www/config/cgi.tcl

set old ""
set new ""
set debug ""
set wwwdir "/usr/local/etc/config/addons/www/webmatic"

catch {
    set input $env(QUERY_STRING)
    set pairs [split $input &]
    foreach pair $pairs {
        if {0 != [regexp "^(\[^=]*)=(.*)$" $pair dummy varname val]} {
            set $varname $val
        }
    }
}

exec sed -i "s/html lang=\"$old\"/html lang=\"$new\"/" $wwwdir/index.html
exec sed -i "s/html lang=\"$old\"/html lang=\"$new\"/" $wwwdir/get.html
exec sed -i "s/jtsage-datebox.i18n.$old.utf8.min.js/jtsage-datebox.i18n.$new.utf8.min.js/" $wwwdir/index.html
exec sed -i "s/jtsage-datebox.i18n.$old.utf8.min.js/jtsage-datebox.i18n.$new.utf8.min.js/" $wwwdir/get.html

if {$debug == "true"} {
    exec sed -i "s/wmmap.$old.js/wmmap.$new.js/" $wwwdir/index.html
    exec sed -i "s/wmmap.$old.js/wmmap.$new.js/" $wwwdir/get.html
    exec sed -i "s/wmLang=\"$old\"/wmLang=\"$new\"/" $wwwdir/js/wmhelper.js
} else {
    exec sed -i "s/wmmap.$old.min.js/wmmap.$new.min.js/" $wwwdir/webmatic.appcache
    exec sed -i "s/wmmap.$old.min.js/wmmap.$new.min.js/" $wwwdir/index.html
    exec sed -i "s/wmmap.$old.min.js/wmmap.$new.min.js/" $wwwdir/get.html
    exec sed -i "s/jtsage-datebox.i18n.$old.utf8.min.js/jtsage-datebox.i18n.$new.utf8.min.js/" $wwwdir/webmatic.appcache    
    exec sed -i "s/wmLang=\"$old\"/wmLang=\"$new\"/" $wwwdir/js/wmhelper.min.js
}

file mkdir "/usr/local/etc/config/addons/www/webmatic_user"
set filename "/usr/local/etc/config/addons/www/webmatic_user/lang.json"
set fileId [open $filename "w"]
puts $fileId $new
close $fileId