#!/bin/tclsh

load tclrega.so
source [file join $env(DOCUMENT_ROOT) once.tcl]
source [file join $env(DOCUMENT_ROOT) cgi.tcl]

cgi_eval {
    cgi_input
    cgi_content_type "text/plain; charset=iso-8859-1"
    array set res [rega_script {
        WriteLine ('{ "entries":[');

        string id;
        string strDP;
        string strListEnum;
        string strDate;
        object obj;
        object objDP;
        object objObject;
        boolean isFirst;

        obj = dom.GetObject(ID_DEVICES);
        isFirst = true;
        foreach (id, obj.EnumUsedIDs()){
            objObject = dom.GetObject (id);
            strListEnum = "";

            foreach (strDP, 'CONFIG_PENDING\tLOWBAT\tSTICKY_UNREACH\tUNREACH'){
                objDP = dom.GetObject ("AL-" # objObject.Address().StrValueByIndex (":", 0) # ":0." # strDP);
                if (objDP){
                    strListEnum = strListEnum # objDP.ID() # '\t';
                }
            }

            foreach (strDP, objObject.Channels().EnumUsedIDs()) {
                strListEnum = strListEnum # dom.GetObject(strDP).DPs().EnumUsedIDs() # '\t';
            }

            foreach (strDP, strListEnum) {
                objDP = dom.GetObject (strDP);

                if ((objDP.TypeName() == "ALARMDP") && (objDP.Value())){
                    string strErr;
                    strErr = objDP.Name().StrValueByIndex (".", 1);
                    strDate = objDP.Timestamp().Format("%d.%m.%Y %H:%M:%S");
                    if (isFirst) { 
                        isFirst=false; 
                    } else { 
                        WriteLine(","); 
                    }
                    Write('{"name":"' # objObject.Name() # '", "type":"' # objDP.TypeName() # '", "error":"' # strErr # '", "date":"' # strDate # '"}');
                }

                if ((objDP.TypeName() == "HSSDP") && (objDP.Value() != 0)){
                    object objInner;
                    objInner = dom.GetObject(objDP.Channel());

                    string strDpType = objDP.HssType();
                    if ((strDpType == "ERROR") || (strDpType == "ERROR_OVERHEAT") || (strDpType == "ERROR_OVERLOAD") || 
                        (strDpType == "ERROR_REDUCED") || (strDpType == "LOWBAT") || (strDpType == "U_SOURCE_FAIL") ||
                        (strDpType == "ERROR_POWER") || (strDpType == "ERROR_SABOTAGE") || (strDpType == "ERROR_BATTERY") ||
                        (strDpType == "STATE_UNCERTAIN") || (strDpType == "ERROR_ALARM_TEST") || (strDpType == "ERROR_SMOKE_CHAMBER") ||
                        (strDpType == "FAULT_REPORTING")){
                        if (isFirst) { 
                            isFirst=false; 
                        } else { 
                            WriteLine(","); 
                        }
                        strDate = objDP.Timestamp().Format("%d.%m.%Y %H:%M:%S");
                        Write('{"name":"' # objInner.Name() # '", "type":"' # objDP.TypeName() # '", "device":"' # objInner.HssType() # '", "error":"' # strDpType # '", "value":"' # objDP.Value() # '", "date":"' # strDate # '"}');
                    }

                    ! SMOKE_DETECTOR_TEAM
                    ! WATERDETECTIONSENSOR
                    ! SENSOR_FOR_CARBON_DIOXIDE
                    if (strDpType == "STATE"){
                        string strObjType = objInner.HssType();
                        if ((strObjType == "WATERDETECTIONSENSOR") ||(strObjType == "SMOKE_DETECTOR_TEAM") || (strObjType == "SENSOR_FOR_CARBON_DIOXIDE")){
                            if (isFirst) { 
                                isFirst=false; 
                            } else { 
                                WriteLine(","); 
                            }
                            strDate = objDP.Timestamp().Format("%d.%m.%Y %H:%M:%S");
                            Write('{"name":"' # objInner.Name() # '", "type":"' # objDP.TypeName() # '", "device":"' # objInner.HssType() # '", "error":"' # strDpType # '", "value":"' # objDP.Value() # '", "date":"' # strDate # '"}');
                        }
                    } ! STATE
                } ! HSSDP
            }
        }

        WriteLine ("");
        WriteLine ("]}");
    }]

    puts -nonewline $res(STDOUT)
}
