/* global theme, debugModus, readModus, optionsMap */

// ----------------------- HTML Creation Helper ------------------------------

// Ein Button, bei dessen drücken ein Wert an die ID übertragen wird.
// onlyButton wird benutzt, wenn für das selbe Element mehrere Controls angezeigt werden sollen, aber nur einmal die Zusatzinfos. Z.B. Winmatic, Keymatic, Dimmer.
function addSetButton(parentId, id, text, value, vorDate, onlyButton, noAction, refresh) {
    var html = "";
    if (!onlyButton) {
        html += "<p class='ui-li-desc'>";
    }

    if (noAction) {
        html += "<a href='#' data-value='" + value + "' data-role='button' class='ui-btn-active' data-inline='true' data-theme='" + theme + "'>" + text + "</a>";
    } else {
        html += "<a href='#' id='setButton_" + id + "' data-id='" + id + "' data-parent-id='" + parentId + "' data-refresh='" + refresh + "' data-value='" + value + "' data-role='button' data-inline='true'>" + text + "</a>";
    }

    if (!onlyButton) {
        html += "<i>" + vorDate + "</i> <span id='info_" + id + "' class='valueOK valueOK-" + theme + "'></span></p>";
    }

    return html;
}

function addSetControlGroup(paretnId, id, txt0, txt1, vorDate, valFloat, addFirst, addLast) {
    var html = "";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    if (addFirst) {
        html += addFirst;
    }
    html += addSetButton(paretnId, id, txt0, 0.0, vorDate, true, valFloat === 0.0, false);
    html += addSetButton(paretnId, id, "20%", 0.2, vorDate, true, valFloat === 0.2, false);
    html += addSetButton(paretnId, id, "40%", 0.4, vorDate, true, valFloat === 0.4, false);
    html += addSetButton(paretnId, id, "60%", 0.6, vorDate, true, valFloat === 0.6, false);
    html += addSetButton(paretnId, id, "80%", 0.8, vorDate, true, valFloat === 0.8, false);
    html += addSetButton(paretnId, id, txt1, 1.0, vorDate, true, valFloat === 1.0, false);
    if (addLast) {
        html += addLast;
    }
    html += "</div>";

    return html;
}

// Ein Button, bei dessen drücken ein Programm ID ausgeführt wird.
function addStartProgramButton(parentId, id, text, vorDate, operate) {
    var html = "<p class='ui-li-desc'><a href='#' " + (!operate ? "class='ui-link ui-btn ui-icon-gear ui-btn-icon-left ui-btn-inline ui-shadow ui-corner-all ui-state-disabled'" : "data-role='button' data-inline='true' data-icon='gear'") + " id='startProgramButton_" + id + "' data-parent-id='" + parentId + "' data-id='" + id + "'>" + text + "</a></div>";
    html += "<i>" + vorDate + "</i> <span id='info_" + id + "' class='valueOK valueOK-" + theme + "'></span></p>";
    return html;
}

// Ein Slider und Button, bei dessen drücken der neue Wert an die ID übertragen wird.
// Factor wird für das Setzen verwendet, z.B. bei Jalousien muss 0-1 gesetzt werden, für die Anzeige
// ist aber 0 - 100 schöner.
//
// TODO: Was mit Float/Integer Unterscheidung? Slider evtl. aus, wenn der Bereich zu groß ist?
function addSetNumber(parentId, id, value, unit, min, max, step, factor, vorDate, refresh) {
    var html = "<div class='ui-field-contain'>";
    html += "<input type='range' value='" + value * factor + "' min='" + min * factor + "' max='" + max * factor + "' step='" + step * factor + "' data-factor='" + factor + "' id='setValue_" + id + "' data-id='" + id + "' data-highlight='true' data-theme='" + theme + "'/>";
    html += " (" + min * factor + " - " + max * factor + " <span id='unit_ " + id + "'>" + unit + "</span>) ";
    html += "<a href='#' id='setButton_" + id + "' data-parent-id='" + parentId + "' data-id='" + id + "' data-refresh='" + refresh + "' data-role='button' data-inline='true' data-icon='check'>" + mapText("SET") + "</a>";
    html += "<i class='ui-li-desc'>" + vorDate + "</i> <span id='info_" + id + "' class='valueOK valueOK-" + theme + "'></span>";
    html += "</div>";
    return html;
}

function addSetBoolButtonList(parentId, valID, strValue, val0, val1, valUnit, vorDate, refresh) {
    var html = "<div class=ui-field-contain'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";

    var idString = "";
    // Leerstring heißt wohl auch false, z.B. bei Alarmzone.
    if (strValue === "false" || strValue === "") {
        idString = "class='ui-btn-active'";
    } else {
        idString = "id='setButton_" + valID + "' data-parent-id='" + parentId + "' data-id='" + valID + "' data-refresh='" + refresh + "'";
    }
    html += "<a href='#' " + idString + " data-value='false' data-role='button' data-inline='true' data-theme='" + theme + "'>" + val0 + "</a>";

    if (strValue === "true") {
        idString = "class='ui-btn-active'";
    } else {
        idString = "id='setButton_" + valID + "' data-parent-id='" + parentId + "' data-id='" + valID + "' data-refresh='" + refresh + "'";
    }
    html += "<a href='#' " + idString + " data-value='true' data-role='button' data-inline='true' data-theme='" + theme + "'>" + val1 + "</a>";

    html += "</div>";
    html += "</div>";
    html += " <span id='unit_ " + valID + "'>" + valUnit + "</span> ";
    html += "<i class='ui-li-desc'>" + vorDate + "</i> <span id='info_" + valID + "' class='valueOK valueOK-" + theme + "'></span>";

    return html;
}

function addSetValueList(parentId, valID, strValue, valList, valUnit, vorDate, refresh, forceList) {
    
    var selIndex = parseInt(strValue);
    var optionsArray = valList.split(";");
    
    if(forceList === "small" || (optionsArray.length < 6 && forceList !== "big")){
        return addSmallList(selIndex, optionsArray, valID, parentId, valUnit, vorDate, refresh);
    }else{
        return addBigList(selIndex, optionsArray, valID, parentId, valUnit, vorDate, refresh);
    }
    
}

function addSmallList(selIndex, optionsArray, valID, parentId, valUnit, vorDate, refresh){
    var html = "<div class='ui-field-contain'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";    
    for (var i = 0; i < optionsArray.length; i++) {
        if (selIndex === i) {
            html += "<a href='#' data-value='" + i + "' data-role='button' data-inline='true' class='ui-btn-active' data-theme='" + theme + "'>" + optionsArray[i] + "</a>";
        } else {
            html += "<a href='#' id='setButton_" + valID + "' data-parent-id='" + parentId + "' data-id='" + valID + "' data-refresh='" + refresh + "' data-value='" + i + "' data-role='button' data-inline='true'>" + optionsArray[i] + "</a>";
        }
    }
    html += "</div>";
    html += "</div>";
    html += "<span id='unit_ " + valID + "'>" + valUnit + "</span> ";
    html += "<i class='ui-li-desc'>" + vorDate + "</i> <span id='info_" + valID + "' class='valueOK valueOK-" + theme + "'></span>";

    return html;
}

function addBigList(selIndex, optionsArray, valID, parentId, valUnit, vorDate, refresh) {
    var html = "<div class='ui-field-contain'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    html += "<select id='selector_" + valID + "' data-theme='" + theme + "'>";
    for (var i = 0; i < optionsArray.length; i++) {
        if (selIndex === i) {
            html += "<option value='" + i + "' selected='selected'>" + optionsArray[i] + "</option>";
        } else {
            html += "<option value='" + i + "'>" + optionsArray[i] + "</option>";
        }
    }
    html += "</select>";    
    html += "<span id='unit_ " + valID + "'>" + valUnit + "</span> <a href='#' id='setValueBigList_" + valID + "' data-parent-id='" + parentId + "' data-id='" + valID + "' data-refresh='" + refresh + "' data-role='button' data-inline='true' data-icon='check'>&nbsp;</a>";
    html += "<i class='ui-li-desc'>" + vorDate + "</i> <span id='info_" + valID + "' class='valueOK valueOK-" + theme + "'></span>";
    html += "</div>";
    html += "</div>";
    return html;
}

function addSetText(parentId, valID, val, valUnit, vorDate) {
    var html = "<div class=ui-field-contain'>";
    // Der String ist hier mit " eingefasst, darum müssen diese im String mit &quot; ersetzt werden:
    val = val.replace(/\"/g, "&quot;");
    if (val.length > 40) {
        html += "<textarea id='setValue_" + valID + "' data-parent-id='" + parentId + "' data-id='" + valID + "' style='width:20em; display:inline-block;'>" + val + "</textarea>";
    } else {
        html += "<input type='text' id='setValue_" + valID + "' data-parent-id='" + parentId + "' data-id='" + valID + "' value=\"" + val + "\" style='width:20em; display:inline-block;'/>";
    }
    html += " <span id='unit_ " + valID + "'>" + valUnit + "</span> <a href='#' id='setTextButton_" + valID + "' data-parent-id='" + parentId + "' data-id='" + valID + "' data-role='button' data-inline='true' data-icon='check'>" + mapText("SET") + "</a>";
    html += "<i class='ui-li-desc'>" + vorDate + "</i> <span id='info_" + valID + "' class='valueOK valueOK-" + theme + "'></span>";
    html += "</div>";
    return html;
}

function addHTML(parentId, valID, val, vorDate, readonly) {
    var html = "<div class='ui-field-contain'" + (readonly ? "" : " ui-grid-a") + "'>";
    html += "<div class='evalScript" + (readonly ? "" : " ui-block-a") + "'>" + val + "</div>";
    if (!readonly) {
        html += "<div class='ui-block-b'><textarea id='setValue_" + valID + "' data-parent-id='" + parentId + "' data-id='" + valID + "' style='width:20em; display:inline-block;'>" + val + "</textarea>";
        html += "<a href='#' id='setTextButton_" + valID + "' data-parent-id='" + parentId + "' data-id='" + valID + "' data-role='button' data-inline='true' data-icon='check'>" + mapText("SET") + "</a>";
        html += "<i class='ui-li-desc'>" + vorDate + "</i> <span id='info_" + valID + "' class='valueOK valueOK-" + theme + "'></span>";
        html += "</div>";       
    }
    html += "</div>";
    return html;
}

function addHistorianDiagram(parentId, valID, val, vorDate, readonly) {
    if(!val){
        readonly = false;
        val = ";;1D";
    }
    var optionsArray = val.split(";");
    if(optionsArray.length !== 3){
        readonly = false;
        optionsArray = ['','','1D'];
    }
    
    var html = "<div class='ui-field-contain'" + (readonly ? "" : " ui-grid-a") + "'>";
    if(readonly){
        html += "<div>HIER SOLLTE EIN DIAGRAMM ANGEZEIGT WERDEN</div>"
    }else{
        html += "<div class='ui-block-a'>CCU-Historian-ID</div>";
        html += "<div class='ui-block-b'>";
        html += "<input type='text' id='hisHistorianID_" + valID + "' value=\"" + optionsArray[0] + "\" style='width:20em; display:inline-block;'/>";
        html += "</div>";
        html += "<div class='ui-block-a'>Homematic-ID</div>";
        html += "<input type='text' id='hisHMID_" + valID + "' value=\"" + optionsArray[1] + "\" style='width:20em; display:inline-block;'/>";
        html += "<div class='ui-block-b'>";
        html += "</div>";
        html += "<div class='ui-block-a'>" + mapText("HISTORIAN_DURATION") + "</div>";
        html += "<div class='ui-block-b'>";
        html += "<div data-role='controlgroup' data-type='horizontal'>";
        var durCount = optionsArray[2].slice(0, -1);
        var durType = optionsArray[2].substr(optionsArray[2].length - 1);        
        html += "<input type='number' min='1' max='1000' id='hisDuration_" + valID + "' value=\"" + durCount + "\" style='width:20em; display:inline-block;'/>";
        html += "<select id='hisSelector_" + valID + "' data-theme='" + theme + "'>";
        html += "<option value='s' " + (durType === "s"?"selected='selected'":"") + ">" + mapText("TIME_SEC_PLURAL") + "</option>";
        html += "<option value='m' " + (durType === "m"?"selected='selected'":"") + ">" + mapText("TIME_MIN_PLURAL") + "</option>";
        html += "<option value='h' " + (durType === "h"?"selected='selected'":"") + ">" + mapText("TIME_H_PLURAL") + "</option>";
        html += "<option value='D' " + (durType === "D"?"selected='selected'":"") + ">" + mapText("TIME_DAY_PLURAL") + "</option>";
        html += "<option value='W' " + (durType === "W"?"selected='selected'":"") + ">" + mapText("TIME_W_PLURAL") + "</option>";
        html += "<option value='M' " + (durType === "M"?"selected='selected'":"") + ">" + mapText("TIME_MON_PLURAL") + "</option>";
        html += "<option value='Y' " + (durType === "Y"?"selected='selected'":"") + ">" + mapText("TIME_Y_PLURAL") + "</option>";
        html += "</select>";
        html += "</div>";
        html += "</div>";
        html += "<a href='#' id='saveHistorianData_" + valID + "' data-parent-id='" + parentId + "' data-id='" + valID + "' data-role='button' data-inline='true' data-icon='check'>" + mapText("SET") + "</a>";
        html += "<i class='ui-li-desc'>" + vorDate + "</i> <span id='info_" + valID + "' class='valueOK valueOK-" + theme + "'></span>";
    }    
    html += "</div>";
    
    return html;
}

function addReadonlyVariable(valID, strValue, vorDate, valType, valUnit, valList, val0, val1) {
    // Bestimmen, wie der sichtbare Werte aussehen soll:
    var visVal = "";
    if (valType === "2") {
        // Bool.
        if (strValue === "true") {
            visVal = val1;
        } else {
            visVal = val0;
        }
    } else if (valType === "4") {
        // Float, Integer.
        visVal = parseFloat(strValue);
    } else if (valType === "16") {
        // Liste.
        var optionsArray = valList.split(";");
        visVal = optionsArray[parseInt(strValue)];
    } else {
        // String oder unbekannt.
        visVal = strValue;
    }
    if (valType === "20" && valUnit.toUpperCase() === "HTML") {
        return addHTML("", valID, strValue, vorDate, true);
    } else if (valType === "20" && valUnit.toUpperCase() === "HISTORIAN") {
        return addHistorianDiagram("", valID, strValue, vorDate, true);
    } else {
        return "<p><img class='ui-img-" + theme + "' src='img/channels/unknown.png' style='max-height:20px'><span class='valueInfo valueInfo-" + theme + "'>" + visVal + " " + valUnit + " </span></p><i class='ui-li-desc'>" + vorDate + "</i>";
    }
}

// ----------------------- Helper functions ----------------------------

function log(txt, type) {
    if (debugModus) {
        if (type === 0) {
            console.info(txt);
        } else if (type === 1) {
            console.warn(txt);
        } else if (type === 2) {
            console.error(txt);
        } else {
            console.log(txt);
        }
    }
}

function getDateFromString(strDate) {
    var dy = strDate.substring(0, 2);
    var mn = strDate.substring(3, 5) - 1; // -1, da 0 basiert.
    var yr = strDate.substring(6, 10);
    var hr = strDate.substring(11, 13);
    var mi = strDate.substring(14, 16);
    var sc = strDate.substring(17, 19);
    return new Date(yr, mn, dy, hr, mi, sc);
}

function getMap(type){
     switch (type) {
        case "variables":
            return variablesMap;
        case "programs":
            return programsMap;
        case "favorites":
            return favoritesMap;
        case "rooms":               
            return roomsMap;
        case "functions":
            return functionsMap;
        case "devices":
            return devicesMap;
    }
}

function setMap(type, data){
    switch (type) {
        case "variables":
            variablesMap = data;
            break;
        case "programs":
            programsMap = data;
            break
        case "favorites":
            favoritesMap = data;                
            break
        case "rooms":               
            roomsMap = data;
            break
        case "functions":
            functionsMap = data;
            break
        case "devices":
            devicesMap = data;
            break
    }
}

function loadLocalStorageMap(type, id){
    switch (type) {
        case "variables":
            variablesMap = JSON.parse(localStorage.getItem("webmatic" + type + "Map"));
            break;
        case "programs":
            programsMap = JSON.parse(localStorage.getItem("webmatic" + type + "Map"));
            break
        case "favorites":
            favoritesMap = JSON.parse(localStorage.getItem("webmatic" + type + "Map"));                
            break
        case "rooms":               
            roomsMap = JSON.parse(localStorage.getItem("webmatic" + type + "Map"));
            break
        case "functions":
            functionsMap = JSON.parse(localStorage.getItem("webmatic" + type + "Map"));
            break 
        case "devices":
            devicesMap = JSON.parse(localStorage.getItem("webmatic" + type + "Map" + id));
            break
    }
}

function isReadOnly(valInfo) {
    if (!readModus) {
        return false;
    }

    // Wenn die Variable hinten (r) hat, dann ist sie Read-Only:
    // Wenn die Variable hinten (w) hat, dann ist sie nicht Read-Only:
    var varOptionsFirst = "";
    var varOptions = [];
    // ( finden:
    var bracketOpen = valInfo.indexOf("(");
    if (bracketOpen !== -1) {
        // ) finden:
        var bracketClose = valInfo.indexOf(")", bracketOpen);
        if (bracketClose !== -1) {
            var optionsString = valInfo.substring(bracketOpen + 1, bracketClose);
            varOptions = optionsString.split(",");

            if (varOptions.length >= 1) {
                varOptionsFirst = varOptions[0].toLowerCase();
            }
        }
    }

    if (varOptionsFirst === "h" || varOptionsFirst === "dk" || varOptionsFirst === "d" || varOptionsFirst === "g") {
        return false;
    }

    if (optionsMap["systemvar_readonly"] && readModus) {
        return varOptionsFirst !== "w";
    }
    return varOptionsFirst === "r";
}

function getTimeDiffString(diffDate, systemDate) {
    var timeDiff = (getDateFromString(systemDate) - getDateFromString(diffDate)) / 1000;  // In Sekunden konvertieren.
    var result;

    if (timeDiff < 0) {
        return "";
    } else if (timeDiff < 60) {
        result = Math.floor(timeDiff + 0.5);
        return mapText("TIME_PREFIX") + " " + result + " " + (result === 1 ? mapText("TIME_SEC_SINGULAR") : mapText("TIME_SEC_PLURAL")) + " " + mapText("TIME_SUFFIX");
    } else if (timeDiff < 60 * 60) {
        result = Math.floor(timeDiff / 60 + 0.5);
        return mapText("TIME_PREFIX") + " " + result + " " + (result === 1 ? mapText("TIME_MIN_SINGULAR") : mapText("TIME_MIN_PLURAL")) + " " + mapText("TIME_SUFFIX");
    } else if (timeDiff < 60 * 60 * 24) {
        result = Math.floor(timeDiff / (60 * 60) + 0.5);
        return mapText("TIME_PREFIX") + " " + result + " " + (result === 1 ? mapText("TIME_H_SINGULAR") : mapText("TIME_H_PLURAL")) + " " + mapText("TIME_SUFFIX");
    } else if (timeDiff < 60 * 60 * 24 * 30.5) {
        result = Math.floor(timeDiff / (60 * 60 * 24) + 0.5);
        return mapText("TIME_PREFIX") + " " + result + " " + (result === 1 ? mapText("TIME_DAY_SINGULAR") : mapText("TIME_DAY_PLURAL")) + " " + mapText("TIME_SUFFIX");
    } else if (timeDiff < 60 * 60 * 24 * 30.5 * 12) {
        result = Math.floor(timeDiff / (60 * 60 * 24 * 30.5) + 0.5);
        return mapText("TIME_PREFIX") + " " + result + " " + (result === 1 ? mapText("TIME_MON_SINGULAR") : mapText("TIME_MON_PLURAL")) + " " + mapText("TIME_SUFFIX");
    } else {
        result = Math.floor(timeDiff / (60 * 60 * 24 * 30.5 * 12) + 0.5);
        if (result < 40) {
            return mapText("TIME_PREFIX") + " " + result + " " + (result === 1 ? mapText("TIME_Y_SINGULAR") : mapText("TIME_Y_PLURAL")) + " " + mapText("TIME_SUFFIX");
        }
    }
    return "";
}