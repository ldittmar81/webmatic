#!/bin/tclsh

load tclrega.so
source [file join $env(DOCUMENT_ROOT) once.tcl]
source [file join $env(DOCUMENT_ROOT) cgi.tcl]

cgi_eval {
    cgi_input
    cgi_content_type "text/html; charset=iso-8859-1"
    set id ""
    set value ""
    set ontimeId ""
    set ontimeValue ""
    catch { import id }
    catch { import value }
    catch { import ontimeId }
    catch { import ontimeValue }

    array set res [rega_script {
        string strId = "} $id {";
        string strValue = "} $value {";
        string strOntimeId = "} $ontimeId {";
        string strOntimeValue = "} $ontimeValue {";

        string s_dbg;
        s_dbg = strId.StrValueByIndex ("_", 0);
        if (s_dbg != "dbg"){
            if(strOntimeId != ""){
                object ontime_obj = dom.GetObject(strOntimeId);
                ontime_obj.State(strOntimeValue);
                WriteLine ('{ "ON_TIME" : "' # strOntimeValue # '" }');
            }
            object o_object = dom.GetObject(strId);
            boolean b;
            b = o_object.State(strValue);
            WriteLine ('{ "Result" : "' # b # '" }');
        }else{
            WriteLine ('{ "Result" : "Debug Mode" }');
        }
    }]

    puts -nonewline $res(STDOUT)
}