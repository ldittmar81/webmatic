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
       
        string strObjID;
        object objObject;
        object objDP;
        string strDP;
        string strType;
        string strListEnum = "";
       
        var obj = dom.GetObject(strList);
        strListEnum = obj.EnumUsedIDs();
        WriteLine ("  -+#+-name-+#+-: -+#+-" # obj.Name() # "-+#+-,");
        WriteLine ("  -+#+-description-+#+-: -+#+-" # obj.EnumInfo() # "-+#+-,");
        WriteLine ("  -+#+-date-+#+-: -+#+-" # system.Date("%d.%m.%Y %H:%M:%S") # "-+#+-,");

        WriteLine("  -+#+-entries-+#+-: [");
        integer firstEntry = 0;
        foreach (strObjID, strListEnum){
            objObject = dom.GetObject(strObjID);
            strType   = objObject.TypeName();
            if (strType == "CHANNEL"){
                ! Komma anhängen, wenn schon eine Zeile vorhanden:
                if (firstEntry != 0) { WriteLine(","); }
                firstEntry = 1;

                ! Im Falle eines Kanals die allgemeinen Werte setzen und Datenpunkte auslesen:
                Write("    {");
                Write("-+#+-name-+#+-:-+#+-" # objObject.Name() # "-+#+-");
                Write(", -+#+-type-+#+-:-+#+-CHANNEL-+#+-");
                Write(", -+#+-id-+#+-:-+#+-" # objObject.ID() # "-+#+-");
                Write(", -+#+-address-+#+-:-+#+-" # objObject.Address() # "-+#+-");
                Write(", -+#+-hssType-+#+-:-+#+-" # objObject.HssType() # "-+#+-");

                if (false == objObject.Internal()) {
                    Write(", -+#+-visible-+#+-:-+#+-" # objObject.Visible() # "-+#+-");
                    Write(", -+#+-operate-+#+-:");
                    if( objObject.UserAccessRights(iulOtherThanAdmin) == iarFullAccess ) {
                        Write("-+#+-true-+#+-");
                    } else {
                        Write("-+#+-false-+#+-");
                    }
                } else {
                    Write(", -+#+-visible-+#+-:-+#+--+#+-");
                    Write(", -+#+-operate-+#+-:-+#+--+#+-");
                }

                WriteLine(", -+#+-channels-+#+-: [");
                boolean firstChannelItem = true;
                ! Datenpunkte iterieren:
                foreach (strDP, objObject.DPs().EnumUsedIDs()){
                    objDP = dom.GetObject (strDP);
                    if (firstChannelItem == false){
                        WriteLine(",");
                    }
                    firstChannelItem = false;
             
                    Write("    {");
                    Write("-+#+-id-+#+-:-+#+-" # objDP.ID() # "-+#+-");
                    Write(", -+#+-name-+#+-:-+#+-" # objDP.Name() # "-+#+-");
                    Write(", -+#+-type-+#+-:-+#+-" # objDP.TypeName() # "-+#+-");
                    if(objDP.TypeName() == "HSSDP"){
                        Write(", -+#+-hssType-+#+-:-+#+-" # objDP.HssType() # "-+#+-");
                    }
                    Write(", -+#+-info-+#+-:-+#+-" # objDP.DPInfo() # "-+#+-");
                    Write(", -+#+-value-+#+-:-+#+-" # objDP.Value() # "-+#+-");
                    Write(", -+#+-valueUnit-+#+-:-+#+-" # objDP.ValueUnit() # "-+#+-");
                    if (objDP.ValueType() == 16){
                        Write(",-+#+-valueList-+#+-:-+#+-" # objDP.ValueList() # "-+#+-");
                    }
                    if (objDP.ValueType() == 2){
                        Write(",-+#+-valueName0-+#+-:-+#+-" # objDP.ValueName0() # "-+#+-");
                        Write(",-+#+-valueName1-+#+-:-+#+-" # objDP.ValueName1() # "-+#+-");
                    }
                    if (objDP.ValueType() == 4){
                        Write(",-+#+-valueMin-+#+-:-+#+-" # objDP.ValueMin() # "-+#+-");
                        Write(",-+#+-valueMax-+#+-:-+#+-" # objDP.ValueMax() # "-+#+-");
                    }
                    Write(", -+#+-valueType-+#+-:-+#+-" # objDP.ValueType() # "-+#+-");
                    Write(", -+#+-readable-+#+-:-+#+-" # ((OPERATION_READ & objDP.Operations()) == 1) # "-+#+-");
                    Write(", -+#+-writeable-+#+-:-+#+-" # ((OPERATION_WRITE & objDP.Operations()) == 2) # "-+#+-");
                    Write(", -+#+-date-+#+-:-+#+-" # objDP.Timestamp().Format("%d.%m.%Y %H:%M:%S") # "-+#+-");
                    Write("}");

                }
                WriteLine("  ]");
                Write ("}");

            }else{

                if ((strType == "VARDP") || (strType == "ALARMDP")){
                    ! Komma anhängen, wenn schon eine Zeile vorhanden:
                    if (firstEntry != 0) { WriteLine(","); }
                    firstEntry = 1;

                    ! Im Falle einer Variable die allgemeinen Werte setzen und Inhalt auslesen:
                    Write("    {");
                    Write("-+#+-name-+#+-:-+#+-" # objObject.Name() # "-+#+-");
                    Write(", -+#+-type-+#+-:-+#+-VARDP-+#+-");
                    Write(", -+#+-id-+#+-:-+#+-" # objObject.ID() # "-+#+-");
                    Write(", -+#+-info-+#+-:-+#+-" # objObject.DPInfo() # "-+#+-");
                    Write(", -+#+-value-+#+-:-+#+-" # objObject.Value() # "-+#+-");
                    Write(", -+#+-visible-+#+-:-+#+-" # objObject.Visible() # "-+#+-");
                    
                    if (objObject.ValueType() == 16){
                        Write(",-+#+-valueList-+#+-:-+#+-" # objObject.ValueList() # "-+#+-");
                    }
                    if (objObject.ValueType() == 2){
                        Write(",-+#+-valueName0-+#+-:-+#+-" # objObject.ValueName0() # "-+#+-");
                        Write(",-+#+-valueName1-+#+-:-+#+-" # objObject.ValueName1() # "-+#+-");
                    }
                    if (objObject.ValueType() == 4){
                        Write(",-+#+-valueMin-+#+-:-+#+-" # objObject.ValueMin() # "-+#+-");
                        Write(",-+#+-valueMax-+#+-:-+#+-" # objObject.ValueMax() # "-+#+-");
                    }

                    Write(", -+#+-valueType-+#+-:-+#+-" # objObject.ValueType() # "-+#+-");
                    Write(", -+#+-valueUnit-+#+-:-+#+-" # objObject.ValueUnit() # "-+#+-");
                    Write(", -+#+-date-+#+-:-+#+-" # objObject.Timestamp().Format("%d.%m.%Y %H:%M:%S") # "-+#+-");

                    ! Prüfen ob Kombinationsdiagramm vorliegt. Fix notwendig -> objObject.DPInfo() liefert in manchen Fällen wohl ein obj?
                    string inf;
                    ! var v = objObject.DPInfo();
                    if (inf.Find("(dk") == -1){
                    }else{
                        ! Werte aller Diagramme auslesen, auf welche hier verwiesen wird:
                        WriteLine(", -+#+-diagrams-+#+-: [");
                        string val = objObject.Value();
                        string strDkVar;
                        integer firstDiagram = 0;
                        foreach(strDkVar, val.Split(";")){
                            ! Komma anhängen, wenn schon eine Zeile vorhanden:
                            if (firstDiagram != 0) { WriteLine(","); }
                            firstDiagram = 1;

                            Write("  {");
                            ! Das ist noch die Variable inklusive Optionen, nochmal am , teilen und ersten Teil nehmen:
                            string strVarName = strDkVar.StrValueByIndex(",", 0);
                            object objDkVar = dom.GetObject(strVarName);
                            if (objDkVar){
                                Write("-+#+-name-+#+-:-+#+-" # objDkVar.Name() # "-+#+-");
                                Write(", -+#+-value-+#+-:-+#+-" # objDkVar.Value() # "-+#+-");
                            }
                            Write("  }");
                        }
                        WriteLine("    ]");
                    }
                    Write ("}");
                }else{
                    if (strType == "PROGRAM"){
                        ! Komma anhängen, wenn schon eine Zeile vorhanden:
                        if (firstEntry != 0) { WriteLine(","); }
                        firstEntry = 1;

                        Write("    {");
                        Write("-+#+-name-+#+-:-+#+-" # objObject.Name() # "-+#+-");
                        Write(", -+#+-type-+#+-:-+#+-PROGRAM-+#+-");
                        Write(", -+#+-id-+#+-:-+#+-" # objObject.ID() # "-+#+-");
                        Write(", -+#+-info-+#+-:-+#+-" # objObject.PrgInfo() # "-+#+-");
                        Write(", -+#+-visible-+#+-:-+#+-" # objObject.Visible() # "-+#+-");
                        Write(", -+#+-operate-+#+-:");
                        if( objObject.UserAccessRights(iulOtherThanAdmin) == iarFullAccess ) {
                            Write("-+#+-true-+#+-");
                        } else {
                            Write("-+#+-false-+#+-");
                        }

                        Write(", -+#+-date-+#+-:-+#+-" # objObject.ProgramLastExecuteTime().Format("%d.%m.%Y %H:%M:%S") # "-+#+-");
                        Write ("}");
                    }else{
                        Write("    {");
                        Write("-+#+-name-+#+-:-+#+-" # objObject.Name() # "-+#+-");
                        Write(", -+#+-type-+#+-:-+#+-" # strType # "-+#+-");
                        Write(", -+#+-id-+#+-:-+#+-" # objObject.ID() # "-+#+-");                        
                        Write ("}");
                    }
                }
            }
        }	
        WriteLine("  ]");
        WriteLine("}");
    }]

    set response [string map {\" ' -+#+- \" \n "" \r ""} $res(STDOUT)]
    puts -nonewline $response
}