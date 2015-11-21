#!/bin/tclsh

load tclrega.so
source [file join $env(DOCUMENT_ROOT) once.tcl]
source [file join $env(DOCUMENT_ROOT) cgi.tcl]

cgi_eval {
    cgi_input
    cgi_content_type "text/html; charset=iso-8859-1"
    array set res [rega_script {
        string id;
        string address;
        object alarmObject;

        foreach(id, dom.GetObject(ID_DEVICES).EnumUsedIDs()){
            address = dom.GetObject(id).Address();
            alarmObject = dom.GetObject("AL-" # address # ":0.STICKY_UNREACH");
            if (alarmObject) {
                if (alarmObject.Value()){
                    alarmObject.AlReceipt();
                }
            }
        }
        WriteLine ('{ "Result" : "Done" }');
    }]

    puts -nonewline $res(STDOUT)
}