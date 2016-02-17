/* global errorsDebugger */

//Variablen
var webmaticVersion = "0";
var isPreRelease = 0;
var lastStableVersion = "2.1.4";
var newWebmaticVersion = webmaticVersion;
var storageVersion = 21;
var wmLang="de";//genau so lassen (ohne Leerzeichen)

// Globale variablen
var debugModus = true;
var testSite = false;
var lastClickType = -1;
var oldID = -1;
var lastClickID = -1;
var readModus = false;
var prevItem = 0;
var saveDataToFile = false;
var newVersion = false;
var mustBeSaved = false;
var isGetSite = false;
var client = "";
var isTempClient = false;
var clientsList = {};

var picturesList = [];
var picturesListError = false;

var excludeFromRefresh = [];
var tempExcludeFromRefresh = 0;

var programsMap, functionsMap, roomsMap, favoritesMap, variablesMap, optionsMap, devicesMap, recognizeMap;
var programsClientMap = {}, functionsClientMap = {}, roomsClientMap = {}, favoritesClientMap = {}, optionsClientMap = {}, variablesClientMap = {}, devicesClientMap = {};
var resultProgramsMap = {}, resultFunctionsMap = {}, resultRoomsMap = {}, resultFavoritesMap = {}, resultVariablesMap = {}, resultOptionsMap = {}, resultDevicesMap = {};

var theme, font, gfxClass;
var loadedFont = ["a"];

var actColumn = 1;

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

// Initialize refresh timer:
var refreshTimer = setInterval(function () {
    checkrefreshPage();
}, 1000);
var lastTime = -1;

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

// ----------------------- HTML Creation Helper ------------------------------

// Ein Button, bei dessen drücken ein Wert an die ID übertragen wird.
// onlyButton wird benutzt, wenn für das selbe Element mehrere Controls angezeigt werden sollen, aber nur einmal die Zusatzinfos. Z.B. Winmatic, Keymatic, Dimmer.
function addSetButton(parentId, id, text, value, vorDate, onlyButton, noAction, refresh, operate, special) {
    var html = "";
    if (!onlyButton) {
        html += "<p class='ui-li-desc'>";
    }

    if (noAction) {
        html += "<a href='#' data-value='" + value + "' data-role='button' class='ui-btn-active' data-inline='true' data-theme='" + theme + "'>" + text + "</a>";
    } else {
        html += "<a href='#' id='setButton_" + id + "' " + (special ? "data-special='" + special + "' " : "") + "data-id='" + id + "' data-parent-id='" + parentId + "' data-refresh='" + refresh + "' data-value='" + value + "' " + (!operate ? "class='ui-link ui-btn ui-btn-inline ui-shadow ui-corner-all ui-state-disabled'" : "data-role='button' data-inline='true'") + ">" + text + "</a>";
    }

    if (!onlyButton) {
        html += "<i class='last-used-time ui-li-desc' " + (resultOptionsMap['show_lastUsedTime'] ? "" : "style='display: none;'") + ">" + vorDate + "</i> <span id='info_" + id + "' class='valueOK valueOK-" + theme + "'></span></p>";
    }

    return html;
}

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

// Ein Button, bei dessen drücken ein Programm ID ausgeführt wird.
function addStartProgramButton(parentId, id, text, vorDate, operate) {
    var html = "<p class='ui-li-desc'><a href='#' " + (!operate ? "class='ui-link ui-btn ui-icon-gear ui-btn-icon-left ui-btn-inline ui-shadow ui-corner-all ui-state-disabled'" : "data-role='button' data-inline='true' data-icon='gear'") + " id='startProgramButton_" + id + "' data-parent-id='" + parentId + "' data-id='" + id + "'>" + text + "</a></div>";
    html += "<i class='last-used-time ui-li-desc' " + (resultOptionsMap['show_lastUsedTime'] ? "" : "style='display: none;'") + ">" + vorDate + "</i> <span id='info_" + id + "' class='valueOK valueOK-" + theme + "'></span></p>";
    return html;
}

// Ein Slider und Button, bei dessen drücken der neue Wert an die ID übertragen wird.
// Factor wird für das Setzen verwendet, z.B. bei Jalousien muss 0-1 gesetzt werden, für die Anzeige
// ist aber 0 - 100 schöner.
// ValueType 4
function addSetNumber(parentId, id, value, unit, min, max, step, factor, vorDate, refresh, operate, options) {
    var html = "<div class='ui-field-contain'>";
    html += "<input type='range' value='" + value * factor + "' min='" + min * factor + "' max='" + max * factor + "' step='" + step * factor + "' data-factor='" + factor + "' id='" + (options ? "options" : "") + "setValue_" + id + "' data-id='" + id + "' data-highlight='true' data-theme='" + theme + "'/>";
    html += " (" + min * factor + " - " + max * factor + " <span id='unit_ " + id + "'>" + unit + "</span>) ";
    html += "<a href='#' id='" + (options ? "options" : "") + "setButton_" + id + "' data-parent-id='" + parentId + "' data-id='" + id + "' data-refresh='" + refresh + "' " + (!operate ? "class='ui-link ui-btn ui-icon-check ui-btn-icon-left ui-btn-inline ui-shadow ui-corner-all ui-state-disabled'" : "data-role='button' data-inline='true' data-icon='check'") + ">" + mapText("SET") + "</a>";
    if (!options) {
        html += "<i class='last-used-time ui-li-desc' " + (resultOptionsMap['show_lastUsedTime'] ? "" : "style='display: none;'") + ">" + vorDate + "</i> <span id='info_" + id + "' class='valueOK valueOK-" + theme + "'></span>";
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
    var html = "<div class='ui-field-contain'>";
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
    var html = "<div data-role='controlgroup' data-type='horizontal'>";
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
    } else if (valType === "20" && valUnit.toUpperCase() === "TUNEIN") {
        return addTuneInRadio("", valID, strValue, vorDate, true);
    } else {
        return "<p><img class='ui-img-" + theme + "' src='img/channels/unknown.png' style='max-height:20px'><span class='valueInfo valueInfo-" + theme + "'>" + visVal + " " + valUnit + " </span><i class='last-used-time ui-li-desc' " + (resultOptionsMap['show_lastUsedTime'] ? "" : "style='display: none;'") + ">" + vorDate + "</i></p>";
    }
}

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
        html += "<div id='chart_" + valID + "' ></div>";
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

// ----------------------- Helper functions ----------------------------

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

                var myValue = "not_exist";
                if (typeof testList !== 'undefined' && testList.length > 0) {
                    $.each(testList, function (i, val) {
                        var tmp_val = parseFloat(val.split("_")[1]);
                        if (tmp_val <= value && tmp_val > myValue) {
                            myValue = tmp_val;
                        }
                    });
                }
                value = myValue;
            }
            else if(valueType === "2"){
                picKey += "_" + (value === "true");
            }else if (valueType !== "20") {
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
        case "config":
            optionsMap = data;
            break;
    }
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
                    resultVariablesMap[key] = variablesClientMap[key];
                } else {
                    resultVariablesMap[key] = val;
                }
            });
            break;
        case "programs":
            $.each(programsMap, function (key, val) {
                if (key in programsClientMap) {
                    resultProgramsMap[key] = programsClientMap[key];
                } else {
                    resultProgramsMap[key] = val;
                }
            });
            break
        case "favorites":
            $.each(favoritesMap, function (key, val) {
                if (key in favoritesClientMap) {
                    resultFavoritesMap[key] = favoritesClientMap[key];
                } else {
                    resultFavoritesMap[key] = val;
                }
            });
            break
        case "rooms":
            $.each(roomsMap, function (key, val) {
                if (key in roomsClientMap) {
                    resultRoomsMap[key] = roomsClientMap[key];
                } else {
                    resultRoomsMap[key] = val;
                }
            });
            break
        case "functions":
            $.each(functionsMap, function (key, val) {
                if (key in functionsClientMap) {
                    resultFunctionsMap[key] = functionsClientMap[key];
                } else {
                    resultFunctionsMap[key] = val;
                }
            });
            break
        case "devices":
            $.each(devicesMap, function (key, val) {
                if (key in devicesClientMap) {
                    resultDevicesMap[key] = devicesClientMap[key];
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
    if(!readModus){
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

