#!/bin/tclsh

source /www/config/cgi.tcl

set envvars {SERVER_SOFTWARE SERVER_NAME GATEWAY_INTERFACE SERVER_PROTOCOL SERVER_PORT REQUEST_METHOD PATH_INFO PATH_TRANSLATED SCRIPT_NAME QUERY_STRING REMOTE_HOST REMOTE_ADDR REMOTE_USER AUTH_TYPE CONTENT_TYPE CONTENT_LENGTH HTTP_ACCEPT HTTP_REFERER HTTP_USER_AGENT}

puts "Content-type: text/plain; charset=iso-8859-1\n"
puts -nonewline "{"

set need_comma false
foreach var $envvars {
    if {[info exists env($var)]} {
        if {$need_comma} {
            puts -nonewline ","
        } else {
            set need_comma true
        }
        puts -nonewline "\"$var\":\"$env($var)\""
    }
}
puts -nonewline "}"