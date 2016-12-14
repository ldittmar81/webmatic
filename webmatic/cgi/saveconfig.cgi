#!/bin/tclsh

source /www/config/cgi.tcl

set text ""
set name ""
set folder ""

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

    cgi_import "text"
    cgi_import "name"
    cgi_import "folder"

    file mkdir "/usr/local/etc/config/addons/www/$folder"
    set filename "/usr/local/etc/config/addons/www/$folder/$name.json"
    set fileId [open $filename "w"]
    puts $fileId $text
    close $fileId
}