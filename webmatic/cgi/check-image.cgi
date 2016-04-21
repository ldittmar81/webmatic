#!/bin/tclsh

source /www/config/cgi.tcl

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

set tclfiles [glob -nocomplain "/usr/local/etc/config/addons/www/$folder/img/ids/*/*.png"]

puts "Content-type: text/plain; charset=iso-8859-1\n"

puts -nonewline "\["
set need_comma false
foreach f $tclfiles {
    if {$need_comma} {
        puts -nonewline ","
    } else {
        set need_comma true
    }
    puts -nonewline "\"[file tail [file rootname $f]]\""
}
puts -nonewline "\]"