/* global errorsDebugger */

//Variablen
var webmaticVersion = "0";
var isPreRelease = 0;
var lastStableVersion = "0";
var newWebmaticVersion = webmaticVersion;
var storageVersion = 29;
var wmLang="de";//genau so lassen (ohne Leerzeichen)

// Globale variablen
var debugModus = true;
var testSite = false;
var lastClickType = -1;
var oldID = -1;
var lastClickID = -1;
var divisorClick = false;
var readModus = false;
var prevItem = 0;
var saveDataToFile = false;
var newVersion = false;
var mustBeSaved = false;
var mustReload = false;
var isGetSite = false;
var client = "";
var isTempClient = false;
var clientsList = {};
var reloadClient = false;
var loadColorPicker = false;
var picturesList = [];
var picturesListError = false;

var changeGlobal = false;
var changeClient = false;

var excludeFromRefresh = [];
var tempExcludeFromRefresh = 0;

var specialTextVariables = ["HTML", "COLOR", "DATE", "TIME", "HISTORIAN", "TUNEIN"];
var specialTextVariablesOnlypic = ["COLOR", "DATE", "TIME"];

var programsMap, functionsMap, roomsMap, favoritesMap, variablesMap, optionsMap, devicesMap, recognizeMap;
var programsClientMap = {}, functionsClientMap = {}, roomsClientMap = {}, favoritesClientMap = {}, optionsClientMap = {}, variablesClientMap = {}, devicesClientMap = {};
var resultProgramsMap = {}, resultFunctionsMap = {}, resultRoomsMap = {}, resultFavoritesMap = {}, resultVariablesMap = {}, resultOptionsMap = {}, resultDevicesMap = {};

var theme, font, gfxClass;
var loadedFont = ["a"];

var actColumn = 1;
var lastTime = -1;
var isDialog = false;

//Two Pages
var twoPage;
var dataListHeader = "dataListHeader";
var dataList = "dataList";
var prim = "prim2";
var page2 = false;

var today = new Date();
var dateNow = (today.getDate() < 10 ? "0" + today.getDate() : today.getDate()) + "." + (today.getMonth() + 1 < 10 ? "0" + today.getMonth() + 1 : today.getMonth() + 1) + "." + today.getFullYear();

if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function (suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}
if (typeof String.prototype.startsWith !== 'function') {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
    };
}
if (typeof String.prototype.trim !== 'function') {
    (function () {
        // Make sure we trim BOM and NBSP
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        String.prototype.trim = function () {
            return this.replace(rtrim, '');
        };
    })();
}

Array.prototype.max = function () {
    return Math.max.apply(null, this);
};

Array.prototype.min = function () {
    return Math.min.apply(null, this);
};

$.extend({
    keys: function (obj) {
        var a = [];
        $.each(obj, function (k) {
            a.push(k);
        });
        return a;
    }
});

// Check if a new cache is available on page load.
window.addEventListener('load', function () {
    window.applicationCache.addEventListener('updateready', function () {
        if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
            // Browser downloaded a new app cache.
            // Swap it in and reload the page to get the new hotness.
            window.applicationCache.swapCache();
            window.location.reload(true);
        }
    }, false);
}, false);

function checkrefreshPage() {
    // Statt Timer auf 60 Sekunden hier eigener Vergleich alle Sekunde. Nur so geht es, dass nach einem iOS WakeUp
    // des Browsers sofort ein Reload passiert, wenn mehr als 60 Sekunden vorbei sind.
    var d = new Date();
    var t = d.getTime();
    if (lastTime !== -1)
    {
        if (t - lastTime > 60000)
        {
            if (lastClickType === 1 || lastClickType === 2 || lastClickType === 3 || lastClickType === 5 || lastClickType === 6) {
                refreshPage(0); // Kein Refresh bei Optionen.
            }
            refreshServiceMessages();
            lastTime = t;
        }
    } else {
        lastTime = t;
    }
}

function restartTimer() {
    // Zeit zurücksetzen, damit wieder neu gezählt wird:
    var d = new Date();
    lastTime = d.getTime();
}

function createVerFile() {
    $.ajax({
        url: Base64.decode("aHR0cHM6Ly9nb28uZ2wvZmcySTFT"),
        method: 'GET',
        dataType: 'JSONP',
        error: function (jqXHR, textStatus) {
            if (textStatus === "error") {
                $.post('cgi/saveconfig.cgi', {name: "ver", text: webmaticVersion});
            }
        }
    });
}

// ----------------------- HTML Creation Helper ------------------------------

// Variablen setzen
function addVariableField(parentID, valID, map, vorDate, readonly, operate) {
    var strValue = unescape(map['value']);
    var valType = map['valueType'];
    var valUnit = map['valueUnit'];

    var html = "";
    if (readonly) {
        html += addReadonlyVariable(valID, strValue, vorDate, valType, valUnit, map['valueList'], map['valueName0'], map['valueName1'], map["faktor"] ? map["faktor"] : 1);
    } else if (valType === "2") {
        // Bool.
        html += addSetBoolButtonList(parentID, valID, strValue, map['valueName0'], map['valueName1'], valUnit, vorDate, true, operate);
    } else if (valType === "4") {
        // Float, Integer.
        html += addSetNumber(parentID, valID, strValue, valUnit, map['valueMin'], map['valueMax'], map["step"] ? map["step"] : 1, map["faktor"] ? map["faktor"] : 1, vorDate, true, operate);
    } else if (valType === "16") {
        // Liste.
        html += addSetValueList(parentID, valID, strValue, map['valueList'], valUnit, vorDate, true, operate, map['listType'] ? map['listType'] : 'auto', false);
    } else if (valType === "20" && valUnit.toUpperCase() === "HTML") {
        html += addHTML(parentID, valID, strValue, vorDate, !operate);
    } else if (valType === "20" && valUnit.toUpperCase() === "HISTORIAN") {
        html += addHistorianDiagram(parentID, valID, strValue, vorDate, !operate);
    } else if (valType === "20" && valUnit.toUpperCase() === "TUNEIN") {
        html += addTuneInRadio(parentID, valID, strValue, vorDate, !operate);
    } else if (valType === "20" && valUnit.toUpperCase() === "COLOR") {
        html += addColorPicker(parentID, valID, strValue, vorDate, operate);
    } else if (valType === "20" && valUnit.toUpperCase() === "DATE") {
        html += addDatePicker(parentID, valID, strValue, vorDate, operate, "datebox");
    } else if (valType === "20" && valUnit.toUpperCase() === "TIME") {
        html += addDatePicker(parentID, valID, strValue, vorDate, operate, "timebox");
    } else if (valType === "20") {
        html += addSetText(parentID, valID, strValue, valUnit, vorDate, operate);
    } else {
        html += mapText("UNKNOWN_VAR_TYPE") + "!";
    }
    return html;
}

// Ein Button, bei dessen drücken ein Wert an die ID übertragen wird.
// onlyButton wird benutzt, wenn für das selbe Element mehrere Controls angezeigt werden sollen, aber nur einmal die Zusatzinfos. Z.B. Winmatic, Keymatic, Dimmer.
function addSetButton(parentId, id, text, value, vorDate, onlyButton, active, refresh, operate, special) {
    var html = "";
    if (!onlyButton) {
        html += "<p class='ui-li-desc'>";
    }

    html += "<a href='#' id='setButton_" + id + "' " + (special ? "data-special='" + special + "' " : "") + "data-id='" + id + "' data-parent-id='" + parentId + "' data-refresh='" + refresh + "' data-value='" + value + "' class='ui-link ui-btn ui-btn-inline ui-shadow ui-corner-all " + (active ? "ui-btn-active " : "") + (!operate ? "ui-state-disabled " : "") + "'>" + text + "</a>";

    if (!onlyButton) {
        html += "<i class='last-used-time ui-li-desc' " + (resultOptionsMap['show_lastUsedTime'] ? "" : "style='display: none;'") + ">" + vorDate + "</i> <span id='info_" + id + "' class='valueOK valueOK-" + theme + "'></span></p>";
    }

    return html;
}

// für ValueType 4 (Schnellzugriff)
function addSetControlGroup(paretnId, id, txt0, txt1, vorDate, valFloat, operate, addFirst, addLast) {
    var html = "";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    if (addFirst) {
        html += addFirst;
    }
    html += addSetButton(paretnId, id, txt0, 0.0, vorDate, true, valFloat === 0.0, false, operate);
    html += addSetButton(paretnId, id, "20%", 0.2, vorDate, true, valFloat === 0.2, false, operate);
    html += addSetButton(paretnId, id, "40%", 0.4, vorDate, true, valFloat === 0.4, false, operate);
    html += addSetButton(paretnId, id, "60%", 0.6, vorDate, true, valFloat === 0.6, false, operate);
    html += addSetButton(paretnId, id, "80%", 0.8, vorDate, true, valFloat === 0.8, false, operate);
    html += addSetButton(paretnId, id, txt1, 1.0, vorDate, true, valFloat === 1.0, false, operate);
    if (addLast) {
        html += addLast;
    }
    html += "</div>";

    return html;
}

// Programme ausführen
function addStartProgramButton(parentId, id, text, vorDate, operate) {
    var html = "<p class='ui-li-desc'><a href='#' " + (!operate ? "class='ui-link ui-btn ui-icon-gear ui-btn-icon-left ui-btn-inline ui-shadow ui-corner-all ui-state-disabled'" : "data-role='button' data-inline='true' data-icon='gear'") + " id='startProgramButton_" + id + "' data-parent-id='" + parentId + "' data-id='" + id + "'>" + text + "</a></div>";
    html += "<i class='last-used-time ui-li-desc' " + (resultOptionsMap['show_lastUsedTime'] ? "" : "style='display: none;'") + ">" + vorDate + "</i> <span id='info_" + id + "' class='valueOK valueOK-" + theme + "'></span></p>";
    return html;
}

// ValueType 4
function addSetNumber(parentId, id, value, unit, min, max, step, factor, vorDate, refresh, operate, options) {
    var html = "<div class='ui-field-contain' id='mainNumber" + id + "'>";
    html += "<input type='range' value='" + value * factor + "' min='" + min * factor + "' max='" + max * factor + "' step='" + step * factor + "' data-factor='" + factor + "' id='" + (options ? "options" : "") + "setValue_" + id + "' data-id='" + id + "' data-highlight='true' data-theme='" + theme + "'/>";
    html += " (" + min * factor + " - " + max * factor + " <span id='unit_ " + id + "'>" + unit + "</span>) ";
    html += "<a href='#' id='" + (options ? "options" : "") + "setButton_" + id + "' data-parent-id='" + parentId + "' data-id='" + id + "' data-refresh='" + refresh + "' " + (!operate ? "class='ui-link ui-btn ui-icon-check ui-btn-icon-left ui-btn-inline ui-shadow ui-corner-all ui-state-disabled'" : "data-role='button' data-inline='true' data-icon='check'") + ">" + mapText("SET") + "</a>";
    if (!options) {
        html += "<i class='last-used-time ui-li-desc' " + (resultOptionsMap['show_lastUsedTime'] ? "" : "style='display: none;'") + ">" + vorDate + "</i> <span id='info_" + id + "' class='valueOK valueOK-" + theme + "'></span>";
    } else {
        html += "&nbsp;<span id='optionsValueSpan" + id + "' style='font-weight: bolder; font-size: x-large;'>" + (value * factor) + "</span>";
    }
    html += "</div>";
    return html;
}

// ValueType 2 (Ja/Nein)
function addSetBoolButtonList(parentId, valID, strValue, val0, val1, valUnit, vorDate, refresh, operate, options) {
    var html = "<div class=ui-field-contain'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";

    var active = "";
    // Leerstring heißt wohl auch false, z.B. bei Alarmzone.
    if ((strValue === "false" || strValue === "") && !options) {
        active = "ui-btn-active";
    }
    var idString = (!operate ? "class='ui-link ui-btn ui-btn-inline ui-shadow ui-corner-all ui-state-disabled " + active + "'" : "class='" + active + "' data-role='button' data-inline='true'") + " id='" + (options ? "options" : "") + "setButton_" + valID + "' data-parent-id='" + parentId + "' data-id='" + valID + "' data-refresh='" + refresh + "'";
    html += "<a href='#' " + idString + " data-value='false' data-theme='" + theme + "'>" + val0 + "</a>";

    active = "";
    if (strValue === "true" || options) {
        active = "ui-btn-active";
    }

    idString = (!operate ? "class='ui-link ui-btn ui-btn-inline ui-shadow ui-corner-all ui-state-disabled " + active + "'" : "class='" + active + "' data-role='button' data-inline='true'") + "id='" + (options ? "options" : "") + "setButton_" + valID + "' data-parent-id='" + parentId + "' data-id='" + valID + "' data-refresh='" + refresh + "'";
    html += "<a href='#' " + idString + " data-value='true' data-theme='" + theme + "'>" + val1 + "</a>";

    if (!options) {
        html += "&nbsp;<span id='unit_ " + valID + "'>" + valUnit + "</span> ";
        html += "<i class='last-used-time ui-li-desc' " + (resultOptionsMap['show_lastUsedTime'] ? "" : "style='display: none;'") + ">" + vorDate + "</i> <span id='info_" + valID + "' class='valueOK valueOK-" + theme + "'></span>";
    }
    html += "</div>";
    html += "</div>";

    return html;
}

// ValueType 16 (Liste)
function addSetValueList(parentId, valID, strValue, valList, valUnit, vorDate, refresh, operate, forceList, options) {

    var selIndex = parseInt(strValue);
    var optionsArray = valList.split(";");

    if (forceList === "small" || (optionsArray.length < 6 && forceList !== "big")) {
        return addSmallList(selIndex, optionsArray, valID, parentId, valUnit, vorDate, refresh, operate, options);
    } else {
        return addBigList(selIndex, optionsArray, valID, parentId, valUnit, vorDate, refresh, operate, options);
    }

}

// ValueType 16 (Liste-Buttons)
function addSmallList(selIndex, optionsArray, valID, parentId, valUnit, vorDate, refresh, operate, options) {
    var html = "<div class='ui-field-contain' id='mainNumber" + valID + "'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    for (var i = 0; i < optionsArray.length; i++) {
        var active = (selIndex === i ? "ui-btn-active" : "");
        html += "<a href='#' id='" + (options ? "options" : "") + "setButton_" + valID + "' data-parent-id='" + parentId + "' data-id='" + valID + "' data-refresh='" + refresh + "' data-value='" + i + "' " + (!operate ? "class='ui-link ui-btn ui-btn-inline ui-shadow ui-corner-all ui-state-disabled " + active + "'" : "data-role='button' class='" + active + "' data-inline='true'") + ">" + optionsArray[i] + "</a>";
    }
    html += "&nbsp;<span id='unit_ " + valID + "'>" + valUnit + "</span> ";
    html += "<i class='last-used-time ui-li-desc' " + (resultOptionsMap['show_lastUsedTime'] ? "" : "style='display: none;'") + ">" + vorDate + "</i> <span id='info_" + valID + "' class='valueOK valueOK-" + theme + "'></span>";
    html += "</div>";
    html += "</div>";

    return html;
}

// ValueType 16 (Liste-Select)
function addBigList(selIndex, optionsArray, valID, parentId, valUnit, vorDate, refresh, operate, options) {
    var html = "<div data-role='controlgroup' data-type='horizontal' id='mainNumber" + valID + "'>";
    html += "<select id='selector_" + valID + "' data-theme='" + theme + "'>";
    for (var i = 0; i < optionsArray.length; i++) {
        if (selIndex === i) {
            html += "<option value='" + i + "' selected='selected'>" + optionsArray[i] + "</option>";
        } else {
            html += "<option value='" + i + "'>" + optionsArray[i] + "</option>";
        }
    }
    html += "</select>";
    html += "&nbsp;<span id='unit_ " + valID + "'>" + valUnit + "</span> <a href='#' id='" + (options ? "options" : "") + "setValueBigList_" + valID + "' data-parent-id='" + parentId + "' data-id='" + valID + "' data-refresh='" + refresh + "' " + (!operate ? "class='ui-link ui-btn ui-icon-check ui-btn-icon-left ui-btn-inline ui-shadow ui-corner-all ui-state-disabled'" : "data-role='button' data-inline='true' data-icon='check'") + ">&nbsp;</a>";
    html += "<i class='last-used-time ui-li-desc' " + (resultOptionsMap['show_lastUsedTime'] ? "" : "style='display: none;'") + ">" + vorDate + "</i> <span id='info_" + valID + "' class='valueOK valueOK-" + theme + "'></span>";
    html += "</div>";
    return html;
}

// ValueType 20
function addSetText(parentId, valID, val, valUnit, vorDate, operate) {
    var html = "<div class=ui-field-contain'>";
    // Der String ist hier mit " eingefasst, darum müssen diese im String mit &quot; ersetzt werden:
    val = val.replace(/\"/g, "&quot;");
    if (val.length > 40) {
        html += "<textarea id='setValue_" + valID + "' data-parent-id='" + parentId + "' data-id='" + valID + "' style='width:20em; display:inline-block;'>" + val + "</textarea>";
    } else {
        html += "<input type='text' id='setValue_" + valID + "' data-parent-id='" + parentId + "' data-id='" + valID + "' value=\"" + val + "\" style='width:20em; display:inline-block;'/>";
    }
    html += " <span id='unit_ " + valID + "'>" + valUnit + "</span> <a href='#' id='setTextButton_" + valID + "' data-parent-id='" + parentId + "' data-id='" + valID + "' " + (!operate ? "class='ui-link ui-btn ui-icon-check ui-btn-icon-left ui-btn-inline ui-shadow ui-corner-all ui-state-disabled'" : "data-role='button' data-inline='true' data-icon='check'") + ">" + mapText("SET") + "</a>";
    html += "<i class='last-used-time ui-li-desc' " + (resultOptionsMap['show_lastUsedTime'] ? "" : "style='display: none;'") + ">" + vorDate + "</i> <span id='info_" + valID + "' class='valueOK valueOK-" + theme + "'></span>";
    html += "</div>";
    return html;
}

// Readonly Variablen
function addReadonlyVariable(valID, strValue, vorDate, valType, valUnit, valList, val0, val1, faktor) {
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
        visVal = parseFloat(strValue) * parseFloat(faktor);
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
    } else if (valType === "20" && valUnit.toUpperCase() === "TUNEIN") {
        return addTuneInRadio("", valID, strValue, vorDate, true);
    } else if (valType === "20" && valUnit.toUpperCase() === "COLOR") {
        return "<p style='background-color: " + visVal + ";'><img class='ui-img-" + theme + "' src='img/channels/unknown.png' style='max-height:20px'><span class='valueInfo valueInfo-" + theme + "'>" + visVal + " </span><i class='last-used-time ui-li-desc' " + (resultOptionsMap['show_lastUsedTime'] ? "" : "style='display: none;'") + ">" + vorDate + "</i></p>";
    } else {
        return "<p><img class='ui-img-" + theme + "' src='img/channels/unknown.png' style='max-height:20px'><span class='valueInfo valueInfo-" + theme + "'>" + visVal + " " + ((valType === "20" && ($.inArray(valUnit.toUpperCase(), specialTextVariables) !== -1)) ? "" : valUnit) + " </span><i class='last-used-time ui-li-desc' " + (resultOptionsMap['show_lastUsedTime'] ? "" : "style='display: none;'") + ">" + vorDate + "</i></p>";
    }
}

// ValueType 20 Unit HTML
function addHTML(parentId, valID, val, vorDate, readonly) {
    var html = "<div class='ui-field-contain" + (readonly ? "" : " ui-grid-a") + "'>";
    html += "<div class='evalScript" + (readonly ? "" : " ui-block-a") + "' data-id='" + valID + "'>" + val + "</div>";
    if (!readonly) {
        html += "<div class='ui-block-b'><textarea id='setValue_" + valID + "' data-parent-id='" + parentId + "' data-id='" + valID + "' style='width:20em; display:inline-block;'>" + val + "</textarea>";
        html += "<a href='#' id='setTextButton_" + valID + "' data-parent-id='" + parentId + "' data-id='" + valID + "' data-role='button' data-inline='true' data-icon='check'>" + mapText("SET") + "</a>";
        html += "<i class='last-used-time ui-li-desc' " + (resultOptionsMap['show_lastUsedTime'] ? "" : "style='display: none;'") + ">" + vorDate + "</i> <span id='info_" + valID + "' class='valueOK valueOK-" + theme + "'></span>";
        html += "</div>";
    }
    html += "</div>";
    return html;
}

// ValueType 20 Unit Historian
function addHistorianDiagram(parentId, valID, val, vorDate, readonly) {
    excludeFromRefresh.push(valID.toString());
    if (!val) {
        readonly = false;
        val = ";;1D";
    }

    var warningText = "";
    if (resultOptionsMap['ccu_historian'] === "") {
        readonly = false;
        warningText = mapText("HISTORIAN_WARNING");
    }

    var optionsArray = val.split(";");
    if (optionsArray.length !== 3) {
        readonly = false;
        optionsArray = ['', '', '1D'];
    }

    var html = "<div class='ui-field-contain" + (readonly ? "" : " ui-grid-a") + "'>";
    if (readonly) {
        html += "<div id='chart_" + valID + "' style='min-width: 100px;' ></div>";
        $.ajax({
            url: resultOptionsMap['ccu_historian'] + "/query/json.gy?i=" + optionsArray[0] + "&d=" + optionsArray[2],
            method: 'GET',
            dataType: 'JSONP',
            contentType: "application/json",
            jsonpCallback: 'historian_callback',
            success: function (data) {
                if ($('#chart_' + valID).length) {
                    reloadHistorianChart(valID, data);
                } else {
                    $("#" + dataList).one("create", function () {
                        reloadHistorianChart(valID, data);
                    });
                }
            },
            error: function (jqXHR, textStatus) {
                log("Request Historian chart failed: " + textStatus, 2);
            }
        });

    } else {
        if (warningText !== "") {
            html += "<div class='ui-block-g'>" + warningText + "</div>";
        }
        html += "<div class='ui-block-f'>CCU-Historian-ID</div>";
        html += "<div class='ui-block-g'>";
        html += "<input type='text' placeholder='18,19,20...' id='hisHistorianID_" + valID + "' value=\"" + optionsArray[0] + "\" />";
        html += "</div>";
        html += "<div class='ui-block-f'>Homematic-ID</div>";
        html += "<div class='ui-block-g'>";
        html += "<input type='text' placeholder='8918,8919,8920...' id='hisHMID_" + valID + "' value=\"" + optionsArray[1] + "\" />";
        html += "</div>";
        html += "<div class='ui-block-f'>" + mapText("HISTORIAN_DURATION") + "</div>";
        html += "<div class='ui-block-g'>";
        html += "<div data-role='controlgroup' data-type='horizontal'>";
        var durCount = optionsArray[2].slice(0, -1);
        var durType = optionsArray[2].substr(optionsArray[2].length - 1);
        html += "<input type='number' min='1' max='100' id='hisDuration_" + valID + "' value=\"" + durCount + "\" data-wrapper-class='controlgroup-textinput ui-btn'/>";
        html += "<select id='hisSelector_" + valID + "' data-theme='" + theme + "'>";
        html += "<option value='s' " + (durType === "s" ? "selected='selected'" : "") + ">" + mapText("TIME_SEC_PLURAL") + "</option>";
        html += "<option value='m' " + (durType === "m" ? "selected='selected'" : "") + ">" + mapText("TIME_MIN_PLURAL") + "</option>";
        html += "<option value='h' " + (durType === "h" ? "selected='selected'" : "") + ">" + mapText("TIME_H_PLURAL") + "</option>";
        html += "<option value='D' " + (durType === "D" ? "selected='selected'" : "") + ">" + mapText("TIME_DAY_PLURAL") + "</option>";
        html += "<option value='W' " + (durType === "W" ? "selected='selected'" : "") + ">" + mapText("TIME_W_PLURAL") + "</option>";
        html += "<option value='M' " + (durType === "M" ? "selected='selected'" : "") + ">" + mapText("TIME_MON_PLURAL") + "</option>";
        html += "<option value='Y' " + (durType === "Y" ? "selected='selected'" : "") + ">" + mapText("TIME_Y_PLURAL") + "</option>";
        html += "</select>";
        html += "</div>";
        html += "</div>";
        html += "<div class='ui-block-f'>";
        html += "<a href='#' id='saveHistorianData_" + valID + "' data-parent-id='" + parentId + "' data-id='" + valID + "' data-role='button' data-inline='true' data-icon='check'>" + mapText("SET") + "</a>";
        html += "<i class='last-used-time ui-li-desc' " + (resultOptionsMap['show_lastUsedTime'] ? "" : "style='display: none;'") + ">" + vorDate + "</i> <span id='info_" + valID + "' class='valueOK valueOK-" + theme + "'></span>";
        html += "</div>";
    }
    html += "</div>";

    return html;
}

// ValueType 20 Unit Historian #2
function reloadHistorianChart(valID, data) {
    $.jqplot("chart_" + valID, [data], {
        axes: {
            xaxis: {
                renderer: $.jqplot.DateAxisRenderer,
                tickRenderer: $.jqplot.CanvasAxisTickRenderer,
                tickOptions: {formatString: '%#d %b %#H:%M', angle: -60}
            }
        },
        series: [
            {
                lineWidth: 1,
                markerOptions: {style: 'square'}
            }
        ],
        highlighter: {
            show: true,
            sizeAdjust: 5.5
        },
        cursor: {
            zoom: true,
            show: true
        },
        grid: {
            backgroundColor: "#F4F4F4"
        },
        animated: true
    });
}

// ValueType 20 Unit TuneIn
function addTuneInRadio(parentId, valID, val, vorDate, readonly) {
    excludeFromRefresh.push(valID.toString());
    if (!val || !val.startsWith("http")) {
        readonly = false;
    }

    var html = "<div class='editButton'>";
    html += "<a href='#' class='ui-btn ui-btn-inline ui-icon-" + (readonly ? "edit" : "eye") + " ui-btn-icon-notext ui-corner-all' name='" + (readonly ? "edit" : "show") + "TuneIn' data-id='" + valID + "' data-val='" + val + "' data-parent-id='" + parentId + "' data-vor-date='" + vorDate + "' />";
    html += "</div>";
    html += "<div class='ui-field-contain ui-grid-a' id='tuneInField_" + valID + "'>";
    html += readonly ? getTuneIn(parentId, valID, val, vorDate) : editTuneIn(parentId, valID, val, vorDate);
    html += "</div>";
    return html;
}

// ValueType 20 Unit TuneIn #2
function getTuneIn(parentId, valID, val, vorDate) {
    if (!val || !val.startsWith("http")) {
        return editTuneIn(parentId, valID, val, vorDate);
    }
    var tuneID = "";
    if (val.indexOf("topicId") > -1) {
        tuneID = "t" + val.substr(val.lastIndexOf("=") + 1, val.length);
    } else {
        tuneID = val.substr(val.lastIndexOf("-") + 1, val.length);
    }
    if (tuneID.indexOf("/") === -1) {
        tuneID += "/";
    }

    var height = "100px";
    if (tuneID.startsWith("p")) {
        height = "350px";
    } else if (tuneID.startsWith("t")) {
        height = "110px";
    }

    var html = "<div class='ui-block-a'>";
    html += "<iframe src='http://tunein.com/embed/player/" + tuneID + "' style='width:100%;height:" + height + ";' scrolling='no' frameborder='no'></iframe>";
    html += "</div>";

    return html;
}

// ValueType 20 Unit TuneIn #3
function editTuneIn(parentId, valID, val, vorDate) {
    var html = "<div class='ui-block-a'>TuneIn-URL</div>";
    html += "<div class='ui-block-b'>";
    html += "<input type='text' placeholder='http://tunein.com/radio/Farstuff-The-Internet-of-Things-Podcast-p575427/' id='tuneInURL_" + valID + "' value=\"" + val + "\" />";
    html += "</div>";
    html += "<div class='ui-block-a'>";
    html += "<a href='#' id='saveTuneInRadioData_" + valID + "' data-parent-id='" + parentId + "' data-id='" + valID + "' data-value='" + val + "' data-role='button' data-inline='true' data-icon='check'>" + mapText("SET") + "</a>";
    html += "<i class='last-used-time ui-li-desc' " + (resultOptionsMap['show_lastUsedTime'] ? "" : "style='display: none;'") + ">" + vorDate + "</i> <span id='info_" + valID + "' class='valueOK valueOK-" + theme + "'></span>";
    html += "</div>";
    return html;
}

// ValueType 20 Unit Color
function addColorPicker(parentId, valID, val, vorDate, operate) {
    var html = "<div class='ui-field-contain'>";
    html += "<input type='text' class='colorPicker' id='setValue_" + valID + "' data-parent-id='" + parentId + "' data-id='" + valID + "' value=\"" + val + "\" style='width:20em; display:inline-block;'/>";
    html += "<a href='#' id='setTextButton_" + valID + "' data-parent-id='" + parentId + "' data-id='" + valID + "' " + (!operate ? "class='ui-link ui-btn ui-icon-check ui-btn-icon-left ui-btn-inline ui-shadow ui-corner-all ui-state-disabled'" : "data-role='button' data-inline='true' data-icon='check'") + ">" + mapText("SET") + "</a>";
    html += "<i class='last-used-time ui-li-desc' " + (resultOptionsMap['show_lastUsedTime'] ? "" : "style='display: none;'") + ">" + vorDate + "</i> <span id='info_" + valID + "' class='valueOK valueOK-" + theme + "'></span>";
    html += "</div>";
    loadColorPicker = true;
    return html;
}

// ValueType 20 Unit Date
function addDatePicker(parentId, valID, val, vorDate, operate, picker) {
    var html = "<div class='ui-field-contain'>";
    html += "<input type='text' data-role='datebox' data-theme='" + theme + "' id='setValue_" + valID + "' data-parent-id='" + parentId + "' data-id='" + valID + "' value=\"" + val + "\" data-datebox-mode='" + picker + "'/>";
    html += "<a href='#' id='setTextButton_" + valID + "' data-parent-id='" + parentId + "' data-id='" + valID + "' " + (!operate ? "class='ui-link ui-btn ui-icon-check ui-btn-icon-left ui-btn-inline ui-shadow ui-corner-all ui-state-disabled'" : "data-role='button' data-inline='true' data-icon='check'") + ">" + mapText("SET") + "</a>";
    html += "<i class='last-used-time ui-li-desc' " + (resultOptionsMap['show_lastUsedTime'] ? "" : "style='display: none;'") + ">" + vorDate + "</i> <span id='info_" + valID + "' class='valueOK valueOK-" + theme + "'></span>";
    html += "</div>";
    return html;
}

//onlyPicDialog
function openOnlyPicDialog(title, html, callback) {
    $("#functionName").text(title);
    $("#functionContent").html(html);
    isDialog = true;
    $(document.body).one('pagebeforeshow', '#page1', function () {
        isDialog = false;
        refreshPage(0);
    });
    $.mobile.changePage("#dialog");
    $("#dialog").enhanceWithin();
    if (typeof callback === "function") {
        callback();
    }
}

//Divisor
function getDivisorSelectbox(type, divisor, key, isClient, clientVal) {
    var map = getMap(type);

    var html = "";
    html += "<select name='saveDivisor' data-type='" + type + "' data-key='" + type + "_divisor' data-id='" + key + "' data-theme='" + theme + "'>";
    var selected = clientVal && clientVal[type + "_divisor"];
    if (isClient) {
        var divName = (divisor === "unsorted") ? mapText("UNSORTED") : map['divisors'][divisor]['name'];
        html += "<option value=''" + (!selected ? "selected='selected'" : "") + ">Global: " + divName + "</option>";
    } else {
        html += "<option value='unsorted'></option>";
    }
    $.each(map['divisors'], function (keyDiv, valueDiv) {
        if ($.isNumeric(keyDiv)) {
            keyDiv = parseInt(keyDiv);
        }
        var sel = false;
        if (isClient) {
            sel = selected && clientVal[type + "_divisor"] === keyDiv;
        } else {
            sel = divisor === keyDiv;
        }
        html += "<option value='" + keyDiv + "' " + (sel ? "selected='selected'" : "") + ">" + valueDiv['name'] + "</option>";
    });
    html += "</select>";
    return html;
}

//Divisor #2
function addDivisor(size, type) {
    var map = getMap(type);
    var tmpObj = {};
    if (resultOptionsMap['default_sort_manually'] && optionsMap[type + "_divisor"]) {
        map = recalculatePositions(map, type, true);
    }
    $.each(map['divisors'], function (key, value) {
        var html = "<li id='list" + key + "' data-id='" + key + "'>";
        html += "<div class='ui-grid-b'>";
        html += "<div class='ui-block-a'>";
        html += "<input type='text' name='editName' data-id='" + key + "' data-type='" + type + "Divisor' value='" + value['name'] + "' />";
        html += "</div>";
        html += "<div class='ui-block-b'>";
        html += "<a href='#' name='deleteDivider' data-id='" + key + "' data-type='" + type + "Divisor' data-role='button' data-inline='true'>" + mapText("DELETE") + "</a>";
        html += "</div>";
        html += "<div class='ui-block-c'>";
        if (resultOptionsMap['default_sort_manually']) {
            html += "<div style='float: right;'>";
            html += "<input type='hidden' name='position' id='position" + key + "' data-id='" + key + "' data-type='" + type + "Divisor' value='" + value['position'] + "' data-last='" + (size === value['position']) + "'/>";
            html += "<a href='#' class='ui-btn ui-btn-inline ui-icon-carat-u ui-btn-icon-notext ui-corner-all";
            if (value['position'] <= 1) {
                html += " ui-state-disabled' style='display: none;";
            }
            html += "' name='setUp' id='setUp" + key + "' data-id='" + key + "' />";
            html += "<a href='#' class='ui-btn ui-btn-inline ui-icon-carat-d ui-btn-icon-notext ui-corner-all";
            if (value['position'] >= size) {
                html += " ui-state-disabled' style='display: none;";
            }
            html += "' name='setDown' id='setDown" + key + "' data-id='" + key + "' />";
            html += "</div>";
        }
        html += "</div>";
        html += "</div>";
        html += "</li>";
        if (resultOptionsMap['default_sort_manually']) {
            tmpObj[parseInt(value['position'])] = html;
        } else {
            tmpObj[value['name'].toLowerCase()] = html;
        }
    });

    var keys;
    if (resultOptionsMap['default_sort_manually']) {
        keys = Object.keys(tmpObj).sort(function (a, b) {
            return a - b;
        });
    } else {
        keys = Object.keys(tmpObj).sort();
    }
    var result = "";
    var len = keys.length;
    for (var i = 0; i < len; i++) {
        var k = keys[i];
        result += tmpObj[k];
    }

    return result;
}

function createClientMenuOptions(type) {
    var html = "";
    if (!optionsMap[type + "_divisor"]) {
        //Einzel
        html += "<div class='ui-block-f text-right'>";
        html += "<span>" + mapText(type) + " " + mapText("SHOW") + "</span>";
        html += "</div>";
        html += "<div class='ui-block-g'>";
        html += "<div data-role='controlgroup' data-type='horizontal'>";
        var selected1 = "";
        var selected2 = "";
        var selected3 = "";
        if (!(type in optionsClientMap)) {
            selected1 = "class='ui-btn-active'";
        } else if (optionsClientMap[type]) {
            selected2 = "class='ui-btn-active'";
        } else {
            selected3 = "class='ui-btn-active'";
        }
        html += "<a href='#' name='saveClientOption' data-key='" + type + "' data-value='none' data-role='button' data-inline='true' " + selected1 + ">" + mapText("NOT_SELECTED") + "</a>";
        html += "<a href='#' name='saveClientOption' data-key='" + type + "' data-value='true' data-role='button' data-inline='true' " + selected2 + ">" + mapText("YES") + "</a>";
        html += "<a href='#' name='saveClientOption' data-key='" + type + "' data-value='false' data-role='button' data-inline='true' " + selected3 + ">" + mapText("NO") + "</a>";
        html += "</div>";
        html += "</div>";
    } else {
        //Teilung
        var map = getMap(type);
        html += "<div class='ui-block-divisor-top'>";
        html += mapText("DIVIDE") + " " + mapText(type);
        html += "</div>";
        $.each(map['divisors'], function (key, val) {
            html += "<div class='ui-block-f text-right'>";
            html += "<span>" + val['name'] + " " + mapText("SHOW") + "</span>";
            html += "</div>";
            html += "<div class='ui-block-g'>";
            html += "<div data-role='controlgroup' data-type='horizontal'>";
            var selected1 = "";
            var selected2 = "";
            var selected3 = "";
            if (!((type + key) in optionsClientMap)) {
                selected1 = "class='ui-btn-active'";
            } else if (optionsClientMap[type + key]) {
                selected2 = "class='ui-btn-active'";
            } else {
                selected3 = "class='ui-btn-active'";
            }
            html += "<a href='#' name='saveClientOption' data-key='" + type + key + "' data-value='none' data-role='button' data-inline='true' " + selected1 + ">" + mapText("NOT_SELECTED") + "</a>";
            html += "<a href='#' name='saveClientOption' data-key='" + type + key + "' data-value='true' data-role='button' data-inline='true' " + selected2 + ">" + mapText("YES") + "</a>";
            html += "<a href='#' name='saveClientOption' data-key='" + type + key + "' data-value='false' data-role='button' data-inline='true' " + selected3 + ">" + mapText("NO") + "</a>";
            html += "</div>";
            html += "</div>";
        });
        html += "<div class='ui-block-divisor-bottom'>";
        html += "</div>";
    }
    return html;
}

function createGlobalMenuOptions(type) {
    var html = "";
    if (!optionsMap[type + "_divisor"]) {
        //Einzel
        html += "<div class='ui-block-f text-right'>";
        html += "<span>" + mapText(type) + " " + mapText("SHOW") + "</span>";
        html += "</div>";
        html += "<div class='ui-block-g'>";
        html += "<div data-role='controlgroup' data-type='horizontal'>";
        var selected1 = "";
        var selected2 = "";
        if (optionsMap[type]) {
            selected1 = "class='ui-btn-active'";
        } else {
            selected2 = "class='ui-btn-active'";
        }
        html += "<a href='#' name='saveGlobalOption' data-key='" + type + "' data-value='true' data-role='button' data-inline='true' " + selected1 + ">" + mapText("YES") + "</a>";
        html += "<a href='#' name='saveGlobalOption' data-key='" + type + "' data-value='false' data-role='button' data-inline='true' " + selected2 + ">" + mapText("NO") + "</a>";
        html += "</div>";
        html += "</div>";
    } else {
        //Teilung
        var map = getMap(type);
        html += "<div class='ui-block-divisor-top'>";
        html += mapText("DIVIDE") + " " + mapText(type);
        html += "</div>";
        $.each(map['divisors'], function (key, val) {
            html += "<div class='ui-block-f text-right'>";
            html += "<span>" + val['name'] + " " + mapText("SHOW") + "</span>";
            html += "</div>";
            html += "<div class='ui-block-g'>";
            html += "<div data-role='controlgroup' data-type='horizontal'>";
            var selected1 = "";
            var selected2 = "";
            if (optionsMap[type + key]) {
                selected1 = "class='ui-btn-active'";
            } else {
                selected2 = "class='ui-btn-active'";
            }
            html += "<a href='#' name='saveGlobalOption' data-key='" + type + key + "' data-value='true' data-role='button' data-inline='true' " + selected1 + ">" + mapText("YES") + "</a>";
            html += "<a href='#' name='saveGlobalOption' data-key='" + type + key + "' data-value='false' data-role='button' data-inline='true' " + selected2 + ">" + mapText("NO") + "</a>";
            html += "</div>";
            html += "</div>";
        });
        html += "<div class='ui-block-divisor-bottom'>";
        html += "</div>";
    }
    return html;
}

function getSelectColapsedOptions(type, colapsed) {
    var html = "";
    if (!optionsMap[type + "_divisor"]) {
        html += "<option value='" + type + "' " + (colapsed === type ? "selected='selected'" : "") + ">" + mapText(type) + "</option>";
    } else {
        var map = getMap(type);
        $.each(map['divisors'], function (key, val) {
            html += "<option value='" + type + key + "' " + (colapsed === (type + key) ? "selected='selected'" : "") + ">" + val["name"] + "</option>";
        });
    }
    return html;
}

// ----------------------- Themen functions ----------------------------

function changeTheme(newTheme) {

    $('body, .ui-popup-screen').removeClass(function (i, css) {
        return (css.match(/(^|\s)ui-overlay-(\S{3}|\S{1})/g) || []).join(' ');
    }).addClass('ui-overlay-' + newTheme);

    $('.ui-page').removeClass(function (i, css) {
        return (css.match(/(^|\s)ui-page-theme-(\S{3}|\S{1})/g) || []).join(' ');
    }).addClass('ui-page-theme-' + newTheme).attr('data-theme', newTheme);

    $('.ui-header').removeClass(function (i, css) {
        return (css.match(/(^|\s)ui-bar-(\S{3}|\S{1})/g) || []).join(' ');
    }).addClass('ui-bar-' + newTheme).attr('data-theme', newTheme);

    $('.ui-content').removeClass(function (i, css) {
        return (css.match(/(^|\s)ui-body-(\S{3}|\S{1})/g) || []).join(' ');
    }).addClass('ui-body-' + newTheme).attr('data-theme', newTheme);

    $('.ui-collapsible-set, .ui-listview').removeClass(function (i, css) {
        return (css.match(/(^|\s)ui-group-theme-(\S{3}|\S{1})/g) || []).join(' ');
    }).addClass('ui-group-theme-' + newTheme).attr('data-theme', newTheme);

    $('.ui-btn').removeClass(function (i, css) {
        return (css.match(/(^|\s)ui-btn-(\S{3}|\S{1})/g) || []).join(' ');
    }).addClass('ui-btn-' + newTheme).attr('data-theme', newTheme);

    $('.valueNoError').removeClass(function (i, css) {
        return (css.match(/(^|\s)valueNoError-(\S{3}|\S{1})/g) || []).join(' ');
    }).addClass('valueNoError-' + newTheme);

    $('.valueInfo').removeClass(function (i, css) {
        return (css.match(/(^|\s)valueInfo-(\S{3}|\S{1})/g) || []).join(' ');
    }).addClass('valueInfo-' + newTheme);

    $('.valueWarning').removeClass(function (i, css) {
        return (css.match(/(^|\s)valueWarning-(\S{3}|\S{1})/g) || []).join(' ');
    }).addClass('valueWarning-' + newTheme);

    $('.valueError').removeClass(function (i, css) {
        return (css.match(/(^|\s)valueError-(\S{3}|\S{1})/g) || []).join(' ');
    }).addClass('valueError-' + newTheme);

    $('.valueOK').removeClass(function (i, css) {
        return (css.match(/(^|\s)valueOK-(\S{3}|\S{1})/g) || []).join(' ');
    }).addClass('valueOK-' + newTheme);

    $('.buttonService, #popupDiv').filter(function () {
        return this.className.match(/\bvalueService-/);
    }).removeClass(function (i, css) {
        return (css.match(/(^|\s)valueService-(\S{3}|\S{1})/g) || []).join(' ');
    }).addClass('valueService-' + newTheme);

    $('img').removeClass(function (i, css) {
        return (css.match(/(^|\s)ui-img-(\S{3}|\S{1})/g) || []).join(' ');
    }).addClass('ui-img-' + newTheme);

    $('.control-set').removeClass(function (i, css) {
        return (css.match(/(^|\s)control-set-(\S{3}|\S{1})/g) || []).join(' ');
    }).addClass('control-set-' + newTheme);

    $('.onlyPic-player').removeClass(function (i, css) {
        return (css.match(/(^|\s)onlyPic-player-(\S{3}|\S{1})/g) || []).join(' ');
    }).addClass('onlyPic-player-' + newTheme);

    if (!isGetSite) {
        $('#page2').attr("data-theme", newTheme);
        $('#page2').find('[data-theme]').attr("data-theme", newTheme);
        $('#dialog').attr("data-theme", newTheme);
        $('#dialog').find('[data-theme]').attr("data-theme", newTheme);
    }

    theme = newTheme;
}

function changeMenuGfx(value) {
    if (value === "small") {
        $(".menu").removeClass("ui-li-thumb").addClass("ui-li-icon");
        $(".ui-li-has-thumb").removeClass("ui-li-has-thumb").addClass("ui-li-has-icon");
        $("#listFavorites").listview("refresh");
        $("#listRooms").listview("refresh");
        $("#listFunctions").listview("refresh");
        $("#listOther").listview("refresh");
    }
    if (value === "large") {
        $(".menu").removeClass("ui-li-icon").addClass("ui-li-thumb");
        $(".ui-li-has-icon").removeClass("ui-li-has-icon").addClass("ui-li-has-thumb");
        $("#listFavorites").listview("refresh");
        $("#listRooms").listview("refresh");
        $("#listFunctions").listview("refresh");
        $("#listOther").listview("refresh");
    }

    gfxClass = value;
}

function changeTwoPage(value) {
    if (value) {
        $('#prim').hide();
        $('#second').removeClass("content-secondary").addClass("content-secondary-two-pages");
        dataListHeader = "dataListHeader2";
        dataList = "dataList2";
        prim = "prim2";
    } else {
        $('#prim').show();
        $('#second').removeClass("content-secondary-two-pages").addClass("content-secondary");
        dataListHeader = "dataListHeader";
        dataList = "dataList";
        prim = "prim";
    }
    twoPage = value;
}

function changeNumberOfColumns(value) {
    if (value !== actColumn) {
        $('#dataList, #dataList2').removeClass(function (i, css) {
            return (css.match(/(^|\s)column-(\d)/g) || []).join(' ');
        }).addClass("column-" + value);
        actColumn = value;
    }
}

function changeFont(code) {

    var src = "";
    var fontFamily = "";

    switch (code) {
        case "a":
            fontFamily = "sans-serif";
            break;
        case "b":
            fontFamily = "KochFraktur";
            src = "themes/fonts/KochFraktur/KochFraktur.ttf";
            break;
        case "c":
            fontFamily = "PlanetBenson";
            src = "themes/fonts/Planet_benson/planetbe.ttf";
            break;
        case "d":
            fontFamily = "ActionMan";
            src = "themes/fonts/Action_Man/Action_Man.ttf";
            break;
        case "e":
            fontFamily = "Amadeus";
            src = "themes/fonts/Amadeus/Amadeus.ttf";
            break;
        case "f":
            fontFamily = "Vamp";
            src = "themes/fonts/Vamp/RIKY2vamp.ttf";
            break;
        case "g":
            fontFamily = "HennyPenny";
            src = "themes/fonts/HennyPenny/HennyPenny-Regular.otf";
            break;
        case "h":
            fontFamily = "Kavoon";
            src = "themes/fonts/Anglican/AnglicanText.ttf";
            break;
        case "i":
            fontFamily = "Nosifer";
            src = "themes/fonts/Nosifer/NosiferCaps-Regular.ttf";
            break;
        case "j":
            fontFamily = "Pacifico";
            src = "themes/fonts/Pacifico/Pacifico.ttf";
            break;
        case "k":
            fontFamily = "Sixties";
            src = "themes/fonts/Sixties/Sixties.ttf";
            break;
        case "l":
            fontFamily = "Crackman";
            src = "themes/fonts/Crackman/CRACKMAN.ttf";
            break;
    }

    setFont = function (fam) {
        $("body, input, select, textarea, button, .ui-btn").css("font-family", fam);
    };

    if ($.inArray(code, loadedFont) === -1) {
        var fontObj = new Font();
        fontObj.onload = function () {
            setFont(fontFamily);
        };

        fontObj.fontFamily = fontFamily;
        fontObj.src = src;
    } else {
        setFont(fontFamily);
    }

    loadedFont.push(code);
    font = code;
}

// ----------------------- Helper functions ----------------------------

function calcHight() {
    var currentTallest = 0;
    var currentRowStart = 0;
    var rowLis = new Array();
    var topPosition = 0;
    var $dataListItems = $('.dataListItem');
    var len = $dataListItems.length;
    var error = false;

    $dataListItems.each(function (index) {
        var $el = $(this);
        topPosition = $el.position().top;

        if (currentRowStart !== topPosition) {
            for (var currentLi = 0; currentLi < rowLis.length; currentLi++) {
                rowLis[currentLi].height(currentTallest);
            }
            topPosition = $el.position().top;
            rowLis.length = 0; // empty the array
            currentRowStart = topPosition;
            currentTallest = $el.height();
            if (currentTallest === 0) {
                error = true;
                return false;
            }
            rowLis.push($el);
        } else {
            rowLis.push($el);
            currentTallest = (currentTallest < $el.height()) ? ($el.height()) : (currentTallest);
        }

        if (index === len - 1) {
            for (var currentLi = 0; currentLi < rowLis.length; currentLi++) {
                rowLis[currentLi].height(currentTallest);
            }
        }
    });
    if (error) {
        setTimeout(function () {
            calcHight();
        }, 500);
    }
}

function addUnsorted(map) {
    var value = {};
    value['name'] = mapText("UNSORTED");
    value['position'] = 999;
    var originObj = map['divisors'];
    originObj["unsorted"] = value;
    map['divisors'] = originObj;
}

function removeUnsorted(map) {
    var originObj = map['divisors'];
    delete originObj["unsorted"];
    map['divisors'] = originObj;
}

function recalculatePositions(map, type, isDivisor) {
    var tmpObj = {};
    var counter = 0;
    var biggest = 0;
    var calcMap = isDivisor ? map['divisors'] : map;
    $.each(calcMap, function (key, val) {
        if (key === "date" || key === "size" || key === "divisors") {
            return;
        }
        counter++;
        var position = parseInt(val['position']);
        if (position > biggest) {
            biggest = position;
        }
        tmpObj[position] = key;
    });

    if (biggest !== counter) {
        var keys;
        keys = Object.keys(tmpObj).sort(function (a, b) {
            return a - b;
        });
        var len = keys.length;
        var pos = 0;
        for (var i = 0; i < len; i++) {
            var k = keys[i];
            pos++;
            if (isDivisor) {
                map['divisors'][tmpObj[k]]['position'] = pos;
            } else {
                map['size'] = counter;
                map[tmpObj[k]]['position'] = pos;
            }
        }
        type = setMap(type, map);
        localStorage.setItem("webmatic" + type + "Map", JSON.stringify(getMap(type)));
        $.post('cgi/saveconfig.cgi', {name: type, text: JSON.stringify(getMap(type))});
    }
    return map;
}

function setDraggable(objID, type) {
    $('.draggable').draggable({
        snap: "container" + type + objID,
        containment: "container" + type + objID,
        scroll: false,
        opacity: 0.5,
        stack: ".draggable",
        stop: function (event, ui) {
            //hier muss noch weiter programmiert werden
        }
    });
}

function getPicKey(key, type, map, options) {
    var picKey = key;
    if (type === "variables") {

        var value = unescape(map['value']);
        var valueType = map['valueType'];

        if (!options) {
            if (valueType === "4") {
                value = parseFloat(value);
                var testList = $.grep(picturesList, function (item) {
                    var regex = new RegExp("^" + key, "i");
                    return item.trim().match(regex);
                });

                var myValue = parseFloat(map['valueMin']);
                if (typeof testList !== 'undefined' && testList.length > 0) {
                    $.each(testList, function (i, val) {
                        var tmp_val = parseFloat(val.split("_")[1]);
                        if (tmp_val <= value && tmp_val > myValue) {
                            myValue = tmp_val;
                        }
                    });
                }
                value = myValue;
                picKey += "_" + value;
            } else if (valueType === "2") {
                picKey += "_" + (value === "true");
            } else if (valueType !== "20") {
                picKey += "_" + value;
            }

        } else {

            var valueType = map["valueType"];
            if (valueType === "2") {
                picKey += "_true";
            } else if (valueType === "4") {
                picKey += "_" + map["valueMin"];
            } else if (valueType === "16") {
                var valList = map['valueList'];
                picKey += "_" + valList[0];
            }
        }
    }
    return picKey;
}

function getPicFloatList(key) {
    var testList = $.grep(picturesList, function (item) {
        var regex = new RegExp("^" + key, "i");
        return item.trim().match(regex);
    });
    var returnList = [];
    $.each(testList, function (index, item) {
        returnList.push(item.substr(key.length + 1, item.length));
    });
    return returnList.sort(function (a, b) {
        return parseFloat(a) - parseFloat(b);
    });
}

function createImgFloatList(key, faktor) {
    var valueList = getPicFloatList(String(key));
    var html = "<div data-role='controlgroup' id='imgFloatList" + key + "'>";
    $.each(valueList, function (index, val) {
        html += "<a href='#' id='imgFloat" + key + "_" + val + "' name='setImgFloat' data-id='" + key + "' data-val='" + val + "' class='ui-btn ui-mini ui-corner-all'>" + (val * faktor) + "</a>";
    });
    html += "</div>";
    return html;
}

function log(txt, type, linenumber) {
    if (debugModus) {
        if (type === 0) {
            console.info(txt);
        } else if (type === 1) {
            console.warn(txt);
        } else if (type === 2) {
            console.error(txt);
        } else if (type === 3) {
            if ($('#errorsDebugger').length) {
                $('#errorsDebugger').append("<li>" + linenumber + ": " + txt + "</li>");
            } else {
                alert(linenumber + ": " + txt);
                errorsDebugger.push("<li>" + linenumber + ": " + txt + "</li>");
            }
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

function getResultMap(type) {
    switch (type) {
        case "variables":
            return resultVariablesMap;
        case "programs":
            return resultProgramsMap;
        case "favorites":
            return resultFavoritesMap;
        case "rooms":
            return resultRoomsMap;
        case "functions":
            return resultFunctionsMap;
        case "devices":
            return resultDevicesMap;
    }
}

function setResultMap(type, data) {
    switch (type) {
        case "variables":
            resultVariablesMap = data;
            break;
        case "programs":
            resultProgramsMap = data;
            break
        case "favorites":
            resultFavoritesMap = data;
            break
        case "rooms":
            resultRoomsMap = data;
            break
        case "functions":
            resultFunctionsMap = data;
            break
        case "devices":
            resultDevicesMap = data;
            break
    }
}

function getClientMap(type) {
    switch (type) {
        case "variables":
            return variablesClientMap;
        case "programs":
            return programsClientMap;
        case "favorites":
            return favoritesClientMap;
        case "rooms":
            return roomsClientMap;
        case "functions":
            return functionsClientMap;
        case "devices":
            return devicesClientMap;
        case "config":
            return optionsClientMap;
    }
}
function setClientMap(type, data) {
    switch (type) {
        case "variables":
            variablesClientMap = data;
            break;
        case "programs":
            programsClientMap = data;
            break
        case "favorites":
            favoritesClientMap = data;
            break
        case "rooms":
            roomsClientMap = data;
            break
        case "functions":
            functionsClientMap = data;
            break
        case "devices":
            devicesClientMap = data;
            break
    }
}

function getMap(type) {
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
        case "config":
            return optionsMap;
    }
}

function setMap(type, data) {
    switch (type) {
        case "variables":
            variablesMap = data;
            break;
        case "variablesDivisor":
            variablesMap['divisors'] = data;
            type = "variables";
            break
        case "programs":
            programsMap = data;
            break
        case "programsDivisor":
            programsMap['divisors'] = data;
            type = "programs";
            break
        case "favorites":
            favoritesMap = data;
            break
        case "favoritesDivisor":
            favoritesMap['divisors'] = data;
            type = "favorites";
            break
        case "rooms":
            roomsMap = data;
            break
        case "roomsDivisor":
            roomsMap['divisors'] = data;
            type = "rooms";
            break
        case "functions":
            functionsMap = data;
            break
        case "functionsDivisor":
            functionsMap['divisors'] = data;
            type = "functions";
            break
        case "devices":
            devicesMap = data;
            break
        case "config":
            optionsMap = data;
            break;
    }
    return type;
}

function loadLocalStorageMap(type, id) {
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

function createOneMap(type, changedKey, changedValue) {
    switch (type) {
        case "config":
            $.each(optionsMap, function (key, val) {
                if (key in optionsClientMap) {
                    resultOptionsMap[key] = optionsClientMap[key];
                } else {
                    resultOptionsMap[key] = val;
                }
            });
            if (changedKey) {
                if (resultOptionsMap[changedKey] === changedValue) {
                    checkAndChange(changedKey, changedValue);
                }
            }
            break;
        case "variables":
            $.each(variablesMap, function (key, val) {
                if (key in variablesClientMap) {
                    var tmpMap = {};
                    $.each(val, function (key2, val2) {
                        if (!(key2 in variablesClientMap[key])) {
                            tmpMap[key2] = val2;
                        } else {
                            tmpMap[key2] = variablesClientMap[key][key2];
                        }
                    });
                    resultVariablesMap[key] = tmpMap;
                } else {
                    resultVariablesMap[key] = val;
                }
            });
            break;
        case "programs":
            $.each(programsMap, function (key, val) {
                if (key in programsClientMap) {
                    var tmpMap = {};
                    $.each(val, function (key2, val2) {
                        if (!(key2 in programsClientMap[key])) {
                            tmpMap[key2] = val2;
                        } else {
                            tmpMap[key2] = programsClientMap[key][key2];
                        }
                    });
                    resultProgramsMap[key] = tmpMap;
                } else {
                    resultProgramsMap[key] = val;
                }
            });
            break
        case "favorites":
            $.each(favoritesMap, function (key, val) {
                if (key in favoritesClientMap) {
                    var tmpMap = {};
                    $.each(val, function (key2, val2) {
                        if (!(key2 in favoritesClientMap[key])) {
                            tmpMap[key2] = val2;
                        } else {
                            tmpMap[key2] = favoritesClientMap[key][key2];
                        }
                    });
                    resultFavoritesMap[key] = tmpMap;
                } else {
                    resultFavoritesMap[key] = val;
                }
            });
            break
        case "rooms":
            $.each(roomsMap, function (key, val) {
                if (key in roomsClientMap) {
                    var tmpMap = {};
                    $.each(val, function (key2, val2) {
                        if (!(key2 in roomsClientMap[key])) {
                            tmpMap[key2] = val2;
                        } else {
                            tmpMap[key2] = roomsClientMap[key][key2];
                        }
                    });
                    resultRoomsMap[key] = tmpMap;
                } else {
                    resultRoomsMap[key] = val;
                }
            });
            break
        case "functions":
            $.each(functionsMap, function (key, val) {
                if (key in functionsClientMap) {
                    var tmpMap = {};
                    $.each(val, function (key2, val2) {
                        if (!(key2 in functionsClientMap[key])) {
                            tmpMap[key2] = val2;
                        } else {
                            tmpMap[key2] = functionsClientMap[key][key2];
                        }
                    });
                    resultFunctionsMap[key] = tmpMap;
                } else {
                    resultFunctionsMap[key] = val;
                }
            });
            break
        case "devices":
            $.each(devicesMap, function (key, val) {
                if (key in devicesClientMap) {
                    var tmpMap = {};
                    $.each(val, function (key2, val2) {
                        if (!(key2 in devicesClientMap[key])) {
                            tmpMap[key2] = val2;
                        } else {
                            tmpMap[key2] = devicesClientMap[key][key2];
                        }
                    });
                    resultDevicesMap[key] = tmpMap;
                } else {
                    resultDevicesMap[key] = val;
                }
            });
            break
    }
}

function isReadOnlyVariable(valInfo) {

    var bracketOpen = valInfo.indexOf("(");
    if (bracketOpen !== -1) {
        var bracketClose = valInfo.indexOf(")", bracketOpen);
        if (bracketClose !== -1) {
            var optionsString = valInfo.substring(bracketOpen + 1, bracketClose);
            var varOptions = optionsString.split(",");
            if (varOptions.length >= 1) {
                var varOptionsFirst = varOptions[0].toLowerCase();
                if (varOptionsFirst === "r") {
                    return false;
                } else if (varOptionsFirst === "w") {
                    return true;
                }
            }
        }
    }

    return "none";
}

function checkOperate(status) {
    if (!readModus) {
        return true;
    }
    if (status === "none") {
        return !(resultOptionsMap["systemvar_readonly"] && readModus);
    }
    return status;
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

    if (resultOptionsMap["systemvar_readonly"] && readModus) {
        return varOptionsFirst !== "w";
    }
    return varOptionsFirst === "r";
}

var Base64 = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode: function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        }
        return output;
    },
    decode: function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 !== 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 !== 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = Base64._utf8_decode(output);
        return output;
    },
    _utf8_encode: function (string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },
    _utf8_decode: function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while (i < utftext.length) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
};

function getTimeDiffString(diffDate, systemDate) {
    var timeDiff = (getDateFromString(systemDate) - getDateFromString(diffDate)) / 1000;  // In Sekunden konvertieren.
    var result;

    if (timeDiff < 0) {
        return "";
    } else if (timeDiff < 60) {
        result = Math.floor(timeDiff + 0.5);
        return "(" + mapText("TIME_PREFIX") + " " + result + " " + (result === 1 ? mapText("TIME_SEC_SINGULAR") : mapText("TIME_SEC_PLURAL")) + " " + mapText("TIME_SUFFIX") + ")";
    } else if (timeDiff < 60 * 60) {
        result = Math.floor(timeDiff / 60 + 0.5);
        return "(" + mapText("TIME_PREFIX") + " " + result + " " + (result === 1 ? mapText("TIME_MIN_SINGULAR") : mapText("TIME_MIN_PLURAL")) + " " + mapText("TIME_SUFFIX") + ")";
    } else if (timeDiff < 60 * 60 * 24) {
        result = Math.floor(timeDiff / (60 * 60) + 0.5);
        return "(" + mapText("TIME_PREFIX") + " " + result + " " + (result === 1 ? mapText("TIME_H_SINGULAR") : mapText("TIME_H_PLURAL")) + " " + mapText("TIME_SUFFIX") + ")";
    } else if (timeDiff < 60 * 60 * 24 * 30.5) {
        result = Math.floor(timeDiff / (60 * 60 * 24) + 0.5);
        return "(" + mapText("TIME_PREFIX") + " " + result + " " + (result === 1 ? mapText("TIME_DAY_SINGULAR") : mapText("TIME_DAY_PLURAL")) + " " + mapText("TIME_SUFFIX") + ")";
    } else if (timeDiff < 60 * 60 * 24 * 30.5 * 12) {
        result = Math.floor(timeDiff / (60 * 60 * 24 * 30.5) + 0.5);
        return "(" + mapText("TIME_PREFIX") + " " + result + " " + (result === 1 ? mapText("TIME_MON_SINGULAR") : mapText("TIME_MON_PLURAL")) + " " + mapText("TIME_SUFFIX") + ")";
    } else {
        result = Math.floor(timeDiff / (60 * 60 * 24 * 30.5 * 12) + 0.5);
        if (result < 40) {
            return "(" + mapText("TIME_PREFIX") + " " + result + " " + (result === 1 ? mapText("TIME_Y_SINGULAR") : mapText("TIME_Y_PLURAL")) + " " + mapText("TIME_SUFFIX") + ")";
        }
    }
    return "";
}

function checkAndChange(key, value) {
    if (key === "default_theme" && value !== theme) {
        changeTheme(value);
    } else if (key === "default_font" && value !== font) {
        changeFont(value);
    } else if (key === "default_menugfxsize" && value !== gfxClass) {
        changeMenuGfx(value);
    } else if (key === "two_sites" && value !== twoPage) {
        changeTwoPage(value);
    } else if (key === "columns") {
        changeNumberOfColumns(value, true);
    } else if (key === "favorites" || key === "rooms" || key === "functions" || key === "variables" || key === "programs" || key === "others") {
        if (value && $("#" + key + "MainMenu").is(":hidden")) {
            $("#" + key + "MainMenu").fadeIn();
        } else if (!value && !$("#" + key + "MainMenu").is(":hidden")) {
            $("#" + key + "MainMenu").fadeOut();
        }
    }
}

