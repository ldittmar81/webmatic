#!/bin/tclsh

load tclrega.so
source [file join $env(DOCUMENT_ROOT) once.tcl]
source [file join $env(DOCUMENT_ROOT) cgi.tcl]

cgi_eval {
	cgi_input
	cgi_content_type "text/plain; charset=iso-8859-1"
	array set res [rega_script {
		WriteLine ('{');
		string s_date = system.Date("%d.%m.%Y %H:%M:%S");
		WriteLine ('"date": "' # s_date # '",');
		WriteLine ('"entries":[');

		string id;
		object obj;
		boolean isFirst;

		obj = dom.GetObject(ID_PROGRAMS);
		isFirst = true;
		foreach (id, obj.EnumUsedIDs()){
			if (isFirst) { isFirst = false; } else { WriteLine (','); }

			var program = dom.GetObject(id);
			Write('{"id":"' # id # '","name":"' # program.Name() # '","info":"' # program.PrgInfo() # '","date":"' # program.ProgramLastExecuteTime().Format("%d.%m.%Y %H:%M:%S") # '"}');
		}
    
		WriteLine ("");
		WriteLine ("]}");
  }]
  
  puts -nonewline $res(STDOUT)
}