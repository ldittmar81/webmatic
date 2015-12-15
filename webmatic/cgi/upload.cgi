#!/bin/tclsh

source /www/config/cgi.tcl
load tclrega.so

set file ""
set filename ""
set path ""

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

    cgi_import "file"
    cgi_import "path"
    cgi_import "filename"

    set tmpfile [lindex $file 0]
    set newfile $path
    append newfile $filename

    puts $tmpfile
    puts $newfile

    file rename -force -- $tmpfile $newfile

}