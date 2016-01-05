#!/bin/tclsh

source /www/config/cgi.tcl

set client ""

catch {
    set input $env(QUERY_STRING)
    set pairs [split $input &]
    foreach pair $pairs {
        if {0 != [regexp "^(\[^=]*)=(.*)$" $pair dummy varname val]} {
            set $varname $val
        }
    }
}

set directory "/usr/local/etc/config/addons/www/webmatic_user"
file delete {*} [glob $directory/*$client.json]