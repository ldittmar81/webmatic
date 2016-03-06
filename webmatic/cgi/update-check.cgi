#!/bin/tclsh

set checkURL    "https://raw.githubusercontent.com/jens-maus/webmatic/master/VERSION"


catch {
    set input $env(QUERY_STRING)
    set pairs [split $input &]
    foreach pair $pairs {
        if {0 != [regexp "^(\[^=]*)=(.*)$" $pair dummy varname val]} {
            set $varname $val
        }
    }
}

if { [info exists cmd ] && $cmd == "download"} {
    catch {
        set newversion [ exec /usr/bin/wget -qO- --no-check-certificate $checkURL ]
    }
    set downloadURL "http://github.com/jens-maus/webmatic/releases/tag/v$newversion"
    puts "<meta http-equiv='refresh' content='0; url=$downloadURL' />"
} else {
    catch {
        set newversion [ exec /usr/bin/wget -qO- --no-check-certificate $checkURL ]
    }
    if { [info exists newversion] } {
        puts $newversion
    } else {
        puts "n/a"
    }
}