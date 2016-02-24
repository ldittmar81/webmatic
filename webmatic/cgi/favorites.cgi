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
        WriteLine ('"date":"' + s_date + '",');

        string id;
        object obj;
        integer nr;
        integer i;
        string favName;
        string favNameUser;
        obj = dom.GetObject(ID_FAVORITES);
        nr = obj.Count();
        i = 1;
        foreach (id, obj.EnumUsedIDs()){
            var fav = dom.GetObject(id);
            favName = fav.Name();
            if (favName.Length() > 5){
                favNameUser = favName.Substr(0, 5);
            }else{
                favNameUser = "";
            }
            if ((id != "202") && (id != "203") && (id != "204") && (favNameUser != "_USER") && (fav.EnCopyID() == ID_ERROR)){
                if (i != 1){
                    WriteLine (',');
                }
                Write('  "' # id # '": "' # favName # '"');
                i = i + 1;
            }
        }

        WriteLine ("");
        WriteLine ("}");
    }]

    puts -nonewline $res(STDOUT)
}