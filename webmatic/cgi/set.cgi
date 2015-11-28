#!/bin/tclsh

load tclrega.so
source [file join $env(DOCUMENT_ROOT) once.tcl]
source [file join $env(DOCUMENT_ROOT) cgi.tcl]

cgi_eval {
    cgi_input
    cgi_content_type "text/html; charset=iso-8859-1"

    set id ""
    set value ""
    set durationId0 ""
    set durationValue0 ""
    set debug ""
    set durationId1 ""
    set durationValue1 ""

    catch { import id }
    catch { import value }
    catch { import durationId0 }
    catch { import durationValue0 }
    catch { import durationId1 }
    catch { import durationValue1 }
    catch { import debug }
    
    array set res [rega_script {
        string strId = "} $id {";
        string strValue = "} $value {";
        string strDurationId0 = "} $durationId0 {";
        string strDurationValue0 = "} $durationValue0 {";
        string strDurationId1 = "} $durationId1 {";
        string strDurationValue1 = "} $durationValue1 {";
        string strDebug = "} $debug {"; 

        if (strDebug != "true"){
            if(strDurationId0 != ""){
                object duration_obj = dom.GetObject(strDurationId0);
                duration_obj.State(strDurationValue0);
                WriteLine ('{ "duration0" : "' # strDurationValue0 # '" }');
            }
            if(strDurationId1 != ""){
                object duration_obj = dom.GetObject(strDurationId1);
                duration_obj.State(strDurationValue1);
                WriteLine ('{ "duration1" : "' # strDurationValue1 # '" }');
            }
            object o_object = dom.GetObject(strId);
            boolean b;
            b = o_object.State(strValue);
            WriteLine ('{ "Result" : "' # b # '" }');
        }else{
            WriteLine ('{ "id" : "' # strId # '" }');
            WriteLine ('{ "value" : "' # strValue # '" }');
            WriteLine ('{ "durationId0" : "' # strDurationId0 # '" }');
            WriteLine ('{ "durationValue0" : "' # strDurationValue0 # '" }');
            WriteLine ('{ "durationId1" : "' # strDurationId1 # '" }');
            WriteLine ('{ "durationValue1" : "' # strDurationValue1 # '" }'); 
            WriteLine ('{ "debug" : "' # strDebug # '" }');
        }
    }]

    puts -nonewline $res(STDOUT)
}