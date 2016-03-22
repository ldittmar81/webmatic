#!/bin/tclsh

load tclrega.so
source [file join $env(DOCUMENT_ROOT) once.tcl]
source [file join $env(DOCUMENT_ROOT) cgi.tcl]

cgi_eval {
    cgi_input
    cgi_content_type "text/html; charset=iso-8859-1"

    set name ""
    set type ""
    set description ""
    set unit ""
    set state ""
    set val1 ""
    set val2 ""

    catch { import name }
    catch { import type }
    catch { import description }
    catch { import unit }
    catch { import state }
    catch { import val1 }
    catch { import val2 }
    
    array set res [rega_script {
        string varName = "} $name {";
        string varType = "} $type {";
        string varDesc = "} $description {";
        string varUnit = "} $unit {";
        string varState = "} $state {";
        string varVal1 = "} $val1 {";
        string varVal2 = "} $val2 {"; 

        object  svObj  = dom.GetObject(varName);

        if (!svObj){
            object svObjects = dom.GetObject(ID_SYSTEM_VARIABLES);
            svObj = dom.CreateObject(OT_VARDP);
            svObjects.Add(svObj.ID());

            svObj.Name(varName);
            svObj.DPInfo(varDesc);
            svObj.ValueUnit(varUnit);

            if(varType == "2"){
                svObj.ValueType(ivtBinary);
                svObj.ValueSubType(istBool);
                
                svObj.State(varState == "true");
                svObj.ValueName0(varVal1);
                svObj.ValueName1(varVal2);   
            }
            if(varType == "4"){
                svObj.ValueType(ivtFloat);
                svObj.ValueSubType(istGeneric);

                svObj.State(varState.ToReal());
                svObj.ValueMin(varVal1.ToReal());
                svObj.ValueMax(varVal2.ToReal()); 
            }
            if(varType == "16"){
                svObj.ValueType(ivtBinary);
                svObj.ValueSubType(istEnum);

                svObj.ValueList(varVal1);
                svObj.State(varState.ToInteger());
            }
            if(varType == "20"){
                svObj.ValueType(ivtString);
                svObj.ValueSubType(istChar8859);

                svObj.State(varState);
            }

            svObj.Internal(false);
            svObj.Visible(true);
            dom.RTUpdate(false);

            WriteLine ('{ "id" : "' # svObj.ID() # '" }');
            WriteLine ('{ "name" : "' # svObj.Name() # '" }');          
        }
    }]

    puts -nonewline $res(STDOUT)
}