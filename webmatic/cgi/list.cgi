#!/bin/tclsh

load tclrega.so
source [file join $env(DOCUMENT_ROOT) once.tcl]
source [file join $env(DOCUMENT_ROOT) cgi.tcl]

cgi_eval {
	cgi_input
	cgi_content_type "text/plain; charset=iso-8859-1"

			set list ""
			catch { import list }

			array set res [rega_script {

				! PARAMATER
				string strList = "} $list {";

        WriteLine('{');
        string tab = '\t';

        string strTemp;

        string strObjID;
        object objObject;
        object objDP;
        string strListName;
        string strDP;
        string strType;

        string strListEnum = "";
        string strDate;

        strListEnum = dom.GetObject(strList).EnumUsedIDs();
        strListName = dom.GetObject(strList).Name();
        WriteLine ('  "name": "' # strListName # '",');
        strDate = system.Date("%d.%m.%Y %H:%M:%S");
        WriteLine ('  "date": "' # strDate # '",');

        WriteLine('  "entries": [');
        integer firstEntry = 0;
        foreach (strObjID, strListEnum)
        {
          objObject = dom.GetObject (strObjID);
          strType   = objObject.TypeName();
          if (strType == "CHANNEL")
          {
            ! Komma anhängen, wenn schon eine Zeile vorhanden:
            if (firstEntry != 0) { WriteLine(','); }
            firstEntry = 1;
            
            ! Im Falle eines Kanals die allgemeinen Werte setzen und Datenpunkte auslesen:
            Write('    {');
            Write('"name":"' # objObject.Name() # '"');
            Write(', "type":"CHANNEL"');
            Write(', "id":"' # objObject.ID() # '"');
            Write(', "address":"' # objObject.Address() # '"');
            Write(', "hssType":"' # objObject.HssType() # '"');
            WriteLine(', "channels": [');
            boolean firstChannelItem = true;
            ! Datenpunkte iterieren:
            foreach (strDP, objObject.DPs().EnumUsedIDs())
            {
              objDP = dom.GetObject (strDP);
              strTemp = objDP.TypeName();
              if (firstChannelItem == false)
              {
                WriteLine(',');
              }
              firstChannelItem = false;
                
              ! Prüfen -> Was hat es damit auf sich? Fehlt in Doku.
              if (strTemp == "HSSDP")
              {
                Write('    {');
                Write('"id":"' # objDP.ID() # '"');
                Write(', "type":"' # objDP.TypeName() # '"');
                Write(', "hssType":"' # objDP.HssType() # '"');
                Write(', "value":"' # objDP.Value() # '"');
                Write(', "date":"' # objDP.Timestamp().Format("%d.%m.%Y %H:%M:%S") # '"');
                Write('}');
              }
              else
              {
                ! Im Falle einer Variable die allgemeinen Werte setzen und Inhalt auslesen. Spaeter als Funktion, da unten nochmal selber Code:
                Write('    {');
                Write('"name":"' # objDP.Name() # '"');
                Write(', "type":"VARDP"');
                Write(', "id":"' # objDP.ID() # '"');
                Write(',"info":"' # objDP.DPInfo() # '"');
                Write(', "value":"' # objDP.Value() # '"');

                if (objDP.ValueType() == 16)
                {
                  Write(',"valueList":"' # objDP.ValueList() # '"');
                }
                if (objDP.ValueType() == 2)
                {
                  Write(',"valueName0":"' # objDP.ValueName0() # '"');
                  Write(',"valueName1":"' # objDP.ValueName1() # '"');
                }
                if (objDP.ValueType() == 4)
                {
                  Write(',"valueMin":"' # objDP.ValueMin() # '"');
                  Write(',"valueMax":"' # objDP.ValueMax() # '"');
                }

                Write(', "valueType":"' # objDP.ValueType() # '"');
                Write(', "valueUnit":"' # objDP.ValueUnit() # '"');
                Write(', "date":"' # objDP.Timestamp().Format("%d.%m.%Y %H:%M:%S") # '"');
                Write ('}');
              }
            }
            WriteLine('  ]');
            Write ('}');
          }
          else
          {
            if (strType == "VARDP")
            {
              ! Komma anhängen, wenn schon eine Zeile vorhanden:
              if (firstEntry != 0) { WriteLine(','); }
              firstEntry = 1;
              
              ! Im Falle einer Variable die allgemeinen Werte setzen und Inhalt auslesen:
              Write('    {');
              Write('"name":"' # objObject.Name() # '"');
              Write(', "type":"VARDP"');
              Write(', "id":"' # objObject.ID() # '"');
              Write(',"info":"' # objObject.DPInfo() # '"');
              Write(', "value":"' # objObject.Value() # '"');

              if (objObject.ValueType() == 16)
              {
                Write(',"valueList":"' # objObject.ValueList() # '"');
              }
              if (objObject.ValueType() == 2)
              {
                Write(',"valueName0":"' # objObject.ValueName0() # '"');
                Write(',"valueName1":"' # objObject.ValueName1() # '"');
              }
              if (objObject.ValueType() == 4)
              {
                Write(',"valueMin":"' # objObject.ValueMin() # '"');
                Write(',"valueMax":"' # objObject.ValueMax() # '"');
              }

              Write(', "valueType":"' # objObject.ValueType() # '"');
              Write(', "valueUnit":"' # objObject.ValueUnit() # '"');
              Write(', "date":"' # objObject.Timestamp().Format("%d.%m.%Y %H:%M:%S") # '"');
              Write ('}');
            }
            else
            {
              if (strType == "PROGRAM")
              {
                ! Komma anhängen, wenn schon eine Zeile vorhanden:
                if (firstEntry != 0) { WriteLine(','); }
                firstEntry = 1;
              
                Write('    {');
                Write('"name":"' # objObject.Name() # '"');
                Write(', "type":"PROGRAM"');
                Write(', "id":"' # objObject.ID() # '"');
                Write(', "info":"' # objObject.PrgInfo() # '"');
                Write(', "date":"' # objObject.ProgramLastExecuteTime().Format("%d.%m.%Y %H:%M:%S") # '"');
                Write ('}');
              }
            }
          }
        }	
        WriteLine('  ]');
        WriteLine('}');
			}]
	
			puts -nonewline $res(STDOUT)
}
