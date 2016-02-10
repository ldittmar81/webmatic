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
        WriteLine ("-+#+-date-+#+-: -+#+-" # s_date # "-+#+-");
      
        string id;
        object obj;
        boolean isFirst;

        obj = dom.GetObject(ID_SYSTEM_VARIABLES);
        isFirst = true;
        foreach (id, obj.EnumUsedIDs()){
            var sysVar = dom.GetObject(id);
            string description = sysVar.DPInfo();
            Write(',-+#+-' # id # '-+#+-:{');
            Write("-+#+-name-+#+-:-+#+-");
            WriteURL(sysVar.Name());
            Write("-+#+-");
            Write(",-+#+-info-+#+-:-+#+-");
            WriteURL(description);
            Write("-+#+-");
            Write(",-+#+-value-+#+-:-+#+-")
            if(sysVar.ValueUnit() == "html"){
                WriteHTML(sysVar.Value());
            }else{
                WriteURL(sysVar.Value());
            }
            Write("-+#+-");
            if (sysVar.ValueType() == 16){
                Write(",-+#+-valueList-+#+-:-+#+-" # sysVar.ValueList() # "-+#+-");
            }
            if (sysVar.ValueType() == 2){
                Write(",-+#+-valueName0-+#+-:-+#+-" # sysVar.ValueName0() # "-+#+-");
                Write(",-+#+-valueName1-+#+-:-+#+-" # sysVar.ValueName1() # "-+#+-");
            }
            if (sysVar.ValueType() == 4){
                Write(",-+#+-valueMin-+#+-:-+#+-" # sysVar.ValueMin() # "-+#+-");
                Write(",-+#+-valueMax-+#+-:-+#+-" # sysVar.ValueMax() # "-+#+-");
            }
            Write(",-+#+-valueType-+#+-:-+#+-" # sysVar.ValueType() # "-+#+-");
            Write(",-+#+-valueUnit-+#+-:-+#+-" # sysVar.ValueUnit() # "-+#+-");
            Write(",-+#+-date-+#+-:-+#+-" # sysVar.Timestamp().Format("%d.%m.%Y %H:%M:%S") # "-+#+-");
            Write(",-+#+-visible-+#+-:" # sysVar.Visible());
            Write("}");
        }

        WriteLine ("");
        WriteLine ("}");
    }]

    set response [string map {\" ' -+#+- \" \n "" \r ""} $res(STDOUT)]
    puts -nonewline $response
}