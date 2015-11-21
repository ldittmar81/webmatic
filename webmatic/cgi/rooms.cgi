#!/bin/tclsh

load tclrega.so
source [file join $env(DOCUMENT_ROOT) once.tcl]
source [file join $env(DOCUMENT_ROOT) cgi.tcl]

cgi_eval {
    cgi_input
    cgi_content_type "text/plain; charset=iso-8859-1"
    array set res [rega_script {
        WriteLine ("{");

        string id;
        object obj;
        boolean isFirst;

        obj = dom.GetObject(ID_ROOMS);
        isFirst = true;
        foreach (id, obj.EnumUsedIDs()){
            if (isFirst){
                isFirst = false;
            }else{
                WriteLine (',');
            }

            var room = dom.GetObject(id);
            Write('  "' + id + '": "' + room.Name() + '"');
        }

        WriteLine("");
        WriteLine ("}");
    }]

    puts -nonewline $res(STDOUT)
}