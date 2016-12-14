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
        WriteLine ('"date": "' # s_date # '"');
      
        string id;
        object obj;
        boolean isFirst;

        obj = dom.GetObject(ID_PROGRAMS);
        isFirst = true;
        foreach (id, obj.EnumUsedIDs()){
            var program = dom.GetObject(id);
            Write(',"' # id # '":{');
            Write('"name":"' # program.Name() # '"');
            Write(',"info":"' # program.PrgInfo() # '"');
            Write(',"date":"' # program.ProgramLastExecuteTime().Format("%d.%m.%Y %H:%M:%S") # '"');
            Write(',"visible":' # program.Visible() # '');
            Write(',"active":' # program.Active() # '');
            Write(',"internal":' # program.Internal() # '');
            Write(',"operate":');
            if( program.UserAccessRights(iulOtherThanAdmin) == iarFullAccess ) {
                Write('true');
            } else {
                Write('false');
            }
            Write('}');
        }

        WriteLine ("");
        WriteLine ("}");
    }]

    puts -nonewline $res(STDOUT)
}