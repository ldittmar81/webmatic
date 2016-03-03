#!/bin/tclsh

load tclrega.so
source [file join $env(DOCUMENT_ROOT) once.tcl]
source [file join $env(DOCUMENT_ROOT) cgi.tcl]

cgi_eval {
    cgi_input
    cgi_content_type "text/plain; charset=iso-8859-1"
    array set res [rega_script {
        WriteLine ("{");
        string s_date = system.Date("%d.%m.%Y %H:%M:%S");
        WriteLine ('"date":"' + s_date + '"');

        string id;
        object obj;
     
        obj = dom.GetObject(ID_ROOMS);
        foreach (id, obj.EnumUsedIDs()){
            var room = dom.GetObject(id);
            WriteLine(',"' + id + '": "' + room.Name() + '"');
        }

        WriteLine ("}");
    }]

    puts -nonewline $res(STDOUT)
}