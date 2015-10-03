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

			array set res [rega_script {

				! PARAMETER
				object prgObj = dom.GetObject("} $id {");
        prgObj.ProgramExecute();
        WriteLine ('{ "Result" : "Started" }');
			}]
	
	puts -nonewline $res(STDOUT)
}
