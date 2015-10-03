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
  WriteLine ('"date": "' # s_date # '",');
  WriteLine ('"entries":[');

      string id;
      object obj;
      boolean isFirst;

      obj = dom.GetObject(ID_SYSTEM_VARIABLES);
      isFirst = true;
      foreach (id, obj.EnumUsedIDs())
      {
        var sysVar = dom.GetObject(id);
        if (sysVar.Name().Substr(0, 5) == "Quick")
          {;}
        else
        {
          if (isFirst) { isFirst = false; } else { WriteLine (','); }
          Write('{');
          Write('"name":"' # sysVar.Name() # '"');
          Write(',"id":"' # sysVar.ID() # '"');
          Write(',"info":"' # sysVar.DPInfo() # '"');
          Write(',"value":"' # sysVar.Value() # '"');
          if (sysVar.ValueType() == 16)
          {
            Write(',"valueList":"' # sysVar.ValueList() # '"');
          }
          if (sysVar.ValueType() == 2)
          {
            Write(',"valueName0":"' # sysVar.ValueName0() # '"');
            Write(',"valueName1":"' # sysVar.ValueName1() # '"');
          }
          if (sysVar.ValueType() == 4)
          {
            Write(',"valueMin":"' # sysVar.ValueMin() # '"');
            Write(',"valueMax":"' # sysVar.ValueMax() # '"');
          }
          Write(',"valueType":"' # sysVar.ValueType() # '"');
          Write(',"valueUnit":"' # sysVar.ValueUnit() # '"');
          Write(',"date":"' # sysVar.Timestamp().Format("%d.%m.%Y %H:%M:%S") # '"');
          Write ('}');
        }
      }

  WriteLine ("");
  WriteLine ("]}");
  }]
  puts -nonewline $res(STDOUT)
}
