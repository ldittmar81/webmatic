#!/bin/tclsh

load tclrega.so
source [file join $env(DOCUMENT_ROOT) once.tcl]
source [file join $env(DOCUMENT_ROOT) cgi.tcl]

cgi_eval {
	cgi_input
	cgi_content_type "text/html; charset=iso-8859-1"
	set id ""
	set value ""
	catch { import id }
	catch { import value }

	array set res [rega_script {
        string strId = "} $id {";
		string strValue = "} $value {";

        string s_dbg;
        s_dbg = strId.StrValueByIndex ("_", 0);
        if (s_dbg != "dbg"){
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