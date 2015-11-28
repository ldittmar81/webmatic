#!/bin/tclsh

load tclrega.so
source [file join $env(DOCUMENT_ROOT) once.tcl]
source [file join $env(DOCUMENT_ROOT) cgi.tcl]

cgi_eval {
    cgi_input
    cgi_content_type "text/html; charset=iso-8859-1"
    
    set id ""
    set debug ""
    
    catch { import id }
    catch { import debug }

    array set res [rega_script {
        string strId = "} $id {";
        string strDebug = "} $debug {"; 

        if (strDebug != "true"){
            object prgObj = dom.GetObject(strId);
            prgObj.ProgramExecute();
            WriteLine ('{ "id" : "' # strId # '" }');
        }else{
            WriteLine ('{ "id" : "' # strId # '" }');
            WriteLine ('{ "debug" : "' # strDebug # '" }');
        }
    }]

    puts -nonewline $res(STDOUT)
}