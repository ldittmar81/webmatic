#!/bin/tclsh

source /www/config/cgi.tcl

set type ""
set name ""

catch {
    set input $env(QUERY_STRING)
    set pairs [split $input &]
    foreach pair $pairs {
        if {0 != [regexp "^(\[^=]*)=(.*)$" $pair dummy varname val]} {
            set $varname $val
        }
    }
}

cgi_eval {
    cgi_input

    cgi_content_type "text/plain"
    cgi_http_head

    cgi_import "type"
    cgi_import "name"

    set filename "/usr/local/etc/config/addons/www/webmatic_user/img/ids/$type/$name.png"
    file delete $filename
}