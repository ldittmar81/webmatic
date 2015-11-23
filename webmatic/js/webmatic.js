// WebMatic
// (c) Frank Epple
// h-Diagrams by Goglo
// Ab Version 2.0 by ldittmar
// ----------------------- Click function handlers ----------------------------

// Globale variablen
var lastClickType = -1;
var oldID = -1;
var lastClickID = -1;
var readModus = false;
var prevItem = 0;

var programsMap, functionsMap, roomsMap, favoritesMap, variablesMap, optionsMap, devicesMap;

var theme, font;
var loadedFont = ["a"];

// Initialize refresh timer:
var refreshTimer = setInterval(function () {
    checkrefreshPage();
}, 1000);
var lastTime = -1;

//Initialwerte einlesen
if (localStorage.getItem("webmaticOptionsMap") === null) {
    loadConfigData(false, '../webmatic_user/config.json', 'config', 'webmaticOptionsMap');
} else {
    optionsMap = JSON.parse(localStorage.getItem("webmaticOptionsMap"));
    loadConfigData(true, '../webmatic_user/config.json', 'config', 'webmaticOptionsMap');
}

//Design setzen
if (localStorage.getItem("optionsMenuGfxTheme") === null) {
    theme = optionsMap["default_theme"];
    localStorage.setItem("optionsMenuGfxTheme", theme);
} else {
    theme = localStorage.getItem("optionsMenuGfxTheme");
}
if (theme === "undefined" || $.inArray(theme, ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"]) === -1) {
    theme = "a";
}
if (localStorage.getItem("optionsMenuGfxFont") === null) {
    font = optionsMap["default_font"];
    localStorage.setItem("optionsMenuGfxFont", font);
} else {
    font = localStorage.getItem("optionsMenuGfxFont");
}
if (font === "undefined" || $.inArray(font, ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"]) === -1) {
    font = "a";
}

// --------------------- Funktionen --------------------------

function checkrefreshPage() {
    // Statt Timer auf 60 Sekunden hier eigener Vergleich alle Sekunde. Nur so geht es, dass nach einem iOS WakeUp
    // des Browsers sofort ein Reload passiert, wenn mehr als 60 Sekunden vorbei sind.
    var d = new Date();
    var t = d.getTime();
    if (lastTime !== -1)
    {
        if (t - lastTime > 60000)
        {
            if (lastClickType !== 4 && lastClickType !== 7) {
                refreshPage(0); // Kein Refresh bei GrafikIDs und Optionen.
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

function refreshPage(item) {
    // Gleich mal den Timer neu starten, lieber vor dem Reload, damit sich die nicht in die Quere kommen.
    // Später dann besser nur einen Refresh zur selben Zeit zulassen:
    restartTimer();

    // Markieren von selektiertem Menueintrag:
    if (item !== 0) {
        if (prevItem !== 0) {
            prevItem.removeClass("ui-btn-down-" + theme);
            prevItem.addClass("ui-btn-up-" + theme);
            prevItem.attr("data-theme", theme);
        }
        item.removeClass("ui-btn-up-" + theme);
        item.addClass("ui-btn-down-" + theme);
        item.attr("data-theme", theme);

        prevItem = item;
    }

    if (lastClickType !== -1 && lastClickID !== -1) {
        var restart = oldID !== lastClickID;
        oldID = lastClickID;
        
        if(restart){
            $("#dataList").hide();
        }
        
        switch (lastClickType) {
            case 1:
                loadData('cgi/list.cgi', lastClickID, restart);
                break;
            case 2:
                loadVariables(restart);
                break;
            case 3:
                loadPrograms(restart);
                break;
            case 4:
                loadGraphicIDs();
                break;
            case 5:
                loadData('debug/debug.json', "a", restart);
                break;
            case 6:
                loadData('debug/debug_cuxd.json', "b", restart);
                break;
            case 7:
                loadOptions();
        }

        $(".evalScript").find("script").each(function () {
            var src = $(this).attr('src');
            if (src) {
                $.getScript(src);
            } else {
                eval($(this).text());
            }
        });

    }
}

function refreshServiceMessages() {
    $('#buttonService .ui-btn-text').html("<img class='ui-img-" + theme + "' src='img/misc/wait16.gif' width=12px height=12px>");

    $.getJSON('cgi/service.cgi', function (data) {
        $("#serviceList").empty();
        var errNr = 0;
        $.each(data.entries, function (i, msg) {
            var msgName = msg['name'];
            var msgType = msg['type'];
            var msgDevice = msg['device'];
            var msgError = msg['error'];
            var msgValue = msg['value'];
            var msgDate = msg['date'];
            var msgReadable = getErrorMessage(msgType, msgError, msgValue, msgDevice);

            $("#serviceList").append("<li><p class='ui-li-desc' style='text-align:right;'>" + msgDate + "</p><h1>" + msgName + "</h1><p>" + msgReadable + "</p></li>");
            errNr += 1;
        });
        $('#buttonService .ui-btn-text').text("(" + errNr + ")");
        if (errNr === 0) {
            $('#buttonService, #popupDiv').removeClass(function (i, css) {
                return (css.match(/(^|\s)valueService-\S{1}/g) || []).join(' ');
            });
            $('#headerButtonGroup').controlgroup('refresh', true);
            $("#serviceList").append("<li><p>Keine Servicemeldungen vorhanden.</p></li>");
        } else {
            $('#buttonService, #popupDiv').addClass('valueService-' + theme);
            $('#headerButtonGroup').controlgroup('refresh', true);
        }
        $('#serviceList').listview('refresh', true);
    });
}

function removeMessages() {
    $.ajax('cgi/removemessages.cgi');
}

function changeTheme(newTheme) {

    $('body, .ui-popup-screen').removeClass(function (i, css) {
        return (css.match(/(^|\s)ui-overlay-\S{1}/g) || []).join(' ');
    }).addClass('ui-overlay-' + newTheme);

    $('.ui-page').removeClass(function (i, css) {
        return (css.match(/(^|\s)ui-page-theme-\S{1}/g) || []).join(' ');
    }).addClass('ui-page-theme-' + newTheme).attr('data-theme', newTheme);

    $('.ui-header').removeClass(function (i, css) {
        return (css.match(/(^|\s)ui-bar-\S{1}/g) || []).join(' ');
    }).addClass('ui-bar-' + newTheme).attr('data-theme', newTheme);

    $('.ui-content').removeClass(function (i, css) {
        return (css.match(/(^|\s)ui-body-\S{1}/g) || []).join(' ');
    }).addClass('ui-body-' + newTheme).attr('data-theme', newTheme);

    $('.ui-collapsible-set, .ui-listview').removeClass(function (i, css) {
        return (css.match(/(^|\s)ui-group-theme-\S{1}/g) || []).join(' ');
    }).addClass('ui-group-theme-' + newTheme).attr('data-theme', newTheme);

    $('.ui-btn').removeClass(function (i, css) {
        return (css.match(/(^|\s)ui-btn-\S{1}/g) || []).join(' ');
    }).addClass('ui-btn-' + newTheme).attr('data-theme', newTheme);

    $('.valueNoError').removeClass(function (i, css) {
        return (css.match(/(^|\s)valueNoError-\S{1}/g) || []).join(' ');
    }).addClass('valueNoError-' + newTheme);

    $('.valueInfo').removeClass(function (i, css) {
        return (css.match(/(^|\s)valueInfo-\S{1}/g) || []).join(' ');
    }).addClass('valueInfo-' + newTheme);

    $('.valueWarning').removeClass(function (i, css) {
        return (css.match(/(^|\s)valueWarning-\S{1}/g) || []).join(' ');
    }).addClass('valueWarning-' + newTheme);

    $('.valueError').removeClass(function (i, css) {
        return (css.match(/(^|\s)valueError-\S{1}/g) || []).join(' ');
    }).addClass('valueError-' + newTheme);

    $('.valueOK').removeClass(function (i, css) {
        return (css.match(/(^|\s)valueOK-\S{1}/g) || []).join(' ');
    }).addClass('valueOK-' + newTheme);

    $('#buttonService, #popupDiv').removeClass(function (i, css) {
        return (css.match(/(^|\s)valueService-\S{1}/g) || []).join(' ');
    }).addClass('valueService-' + newTheme);

    $('img').removeClass(function (i, css) {
        return (css.match(/(^|\s)ui-img-\S{1}/g) || []).join(' ');
    }).addClass('ui-img-' + newTheme);

    theme = newTheme;
    localStorage.setItem("optionsMenuGfxTheme", theme);
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

    localStorage.setItem("optionsMenuGfxFont", font);
}

// ----------------------- HTML Creation Helper ------------------------------

// Ein Button, bei dessen drücken ein Wert an die ID übertragen wird.
// onlyButton wird benutzt, wenn für das selbe Element mehrere Controls angezeigt werden sollen, aber nur einmal die Zusatzinfos. Z.B. Winmatic, Keymatic, Dimmer.
function addSetButton(id, text, value, vorDate, onlyButton, noAction, refresh) {
    var html = "";
    if (!onlyButton) {
        html += "<p class='ui-li-desc'>";
    }

    if (noAction) {
        html += "<a href='#' data-value='" + value + "' data-role='button' class='ui-btn-active' data-inline='true' data-theme='" + theme + "'>" + text + "</a>";
    } else {
        html += "<a href='#' id='setButton_" + id + "' data-id='" + id + "' data-refresh='" + refresh + "' data-value='" + value + "' data-role='button' data-inline='true'>" + text + "</a>";
    }

    if (!onlyButton) {
        html += "<i>" + vorDate + "</i> <span id='info_" + id + "' class='valueOK valueOK-" + theme + "'></span></p>";
    }

    return html;
}

function addSetControlGroup(id, txt0, txt1, vorDate, valFloat, addFirst, addLast) {
    var html = "";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    if (addFirst) {
        html += addFirst;
    }
    html += addSetButton(id, txt0, 0.0, vorDate, true, valFloat === 0.0, false);
    html += addSetButton(id, "20%", 0.2, vorDate, true, valFloat === 0.2, false);
    html += addSetButton(id, "40%", 0.4, vorDate, true, valFloat === 0.4, false);
    html += addSetButton(id, "60%", 0.6, vorDate, true, valFloat === 0.6, false);
    html += addSetButton(id, "80%", 0.8, vorDate, true, valFloat === 0.8, false);
    html += addSetButton(id, txt1, 1.0, vorDate, true, valFloat === 1.0, false);
    if (addLast) {
        html += addLast;
    }
    html += "</div>";

    return html;
}

// Ein Button, bei dessen drücken ein Programm ID ausgeführt wird.
function addStartProgramButton(id, text, vorDate, operate) {
    var html = "<p class='ui-li-desc'><a href='#' " + (!operate ? "class='ui-link ui-btn ui-icon-gear ui-btn-icon-left ui-btn-inline ui-shadow ui-corner-all ui-state-disabled'" : "data-role='button' data-inline='true' data-icon='gear'") + " id='startProgramButton_" + id + "' data-id='" + id + "'>" + text + "</a></div>";
    html += "<i>" + vorDate + "</i> <span id='info_" + id + "' class='valueOK valueOK-" + theme + "'></span></p>";
    return html;
}

// Ein Slider und Button, bei dessen drücken der neue Wert an die ID übertragen wird.
// Factor wird für das Setzen verwendet, z.B. bei Jalousien muss 0-1 gesetzt werden, für die Anzeige
// ist aber 0 - 100 schöner.
//
// TODO: Was mit Float/Integer Unterscheidung? Slider evtl. aus, wenn der Bereich zu groß ist?
function addSetNumber(id, value, unit, min, max, step, factor, vorDate, refresh) {
    var html = "<div class='ui-field-contain'>";
    html += "<input type='range' value='" + value * factor + "' min='" + min * factor + "' max='" + max * factor + "' step='" + step * factor + "' data-factor='" + factor + "' id='setValue_" + id + "' data-id='" + id + "' data-highlight='true' data-theme='" + theme + "'/>";
    html += " (" + min * factor + " - " + max * factor + " " + unit + ") ";
    html += "<a href='#' id='setNumberButton_" + id + "' data-id='" + id + "' data-refresh='" + refresh + "' data-role='button' data-inline='true' data-icon='check'>Setzen</a>";
    html += "<i class='ui-li-desc'>" + vorDate + "</i> <span id='info_" + id + "' class='valueOK valueOK-" + theme + "'></span>";
    html += "</div>";
    return html;    
}

function addSetBoolButtonList(valID, strValue, val0, val1, valUnit, vorDate, refresh) {
    var html = "<div data-role='fieldcontain'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";

    var idString = "";
    // Leerstring heißt wohl auch false, z.B. bei Alarmzone.
    if (strValue === "false" || strValue === "") {
        idString = "class='ui-btn-active'";
    } else {
        idString = "id='setButton_" + valID + "' data-id='" + valID + "' data-refresh='" + refresh + "'";
    }
    html += "<a href='#' " + idString + " data-value='false' data-role='button' data-inline='true' data-theme='" + theme + "'>" + val0 + "</a>";

    if (strValue === "true") {
        idString = "class='ui-btn-active'";
    } else {
        idString = "id='setButton_" + valID + "' data-id='" + valID + "' data-refresh='" + refresh + "'";
    }
    html += "<a href='#' " + idString + " data-value='true' data-role='button' data-inline='true' data-theme='" + theme + "'>" + val1 + "</a>";

    html += "</div>";
    html += "</div>";
    html += " " + valUnit + " ";//<a href='#' id='setBoolButton_" + valID + "' data-id='" + valID + "' data-role='button' data-inline='true' data-icon='check'>Setzen</a>";
    html += "<i class='ui-li-desc'>" + vorDate + "</i> <span id='info_" + valID + "' class='valueOK valueOK-" + theme + "'></span>";

    return html;
}

function addSetValueList(valID, strValue, valList, valUnit, vorDate, refresh) {
    var html = "<div data-role='fieldcontain'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    var selIndex = parseInt(strValue);
    var optionsArray = valList.split(";");
    for (var i = 0; i < optionsArray.length; i++) {
        if (selIndex === i) {
            html += "<a href='#' data-value='" + i + "' data-role='button' data-inline='true' class='ui-btn-active' data-theme='" + theme + "'>" + optionsArray[i] + "</a>";
        } else {
            html += "<a href='#' id='setButton_" + valID + "' data-id='" + valID + "' data-refresh='" + refresh + "' data-value='" + i + "' data-role='button' data-inline='true'>" + optionsArray[i] + "</a>";
        }
    }
    html += "</div>";
    html += "</div>";
    html += " " + valUnit + " "; //<a href='#' id='setValueListButton_" + valID + "' data-id='" + valID + "' data-role='button' data-inline='true' data-icon='check'>Setzen</a>";
    html += "<i class='ui-li-desc'>" + vorDate + "</i> <span id='info_" + valID + "' class='valueOK valueOK-" + theme + "'></span>";

    return html;
}

function addSetText(valID, val, valUnit, vorDate) {
    var html = "<div data-role='fieldcontain'>";
    // Der String ist hier mit " eingefasst, darum müssen diese im String mit &quot; ersetzt werden:
    val = val.replace(/\"/g, "&quot;");
    if (val.length > 40) {
        html += "<textarea id='setValue_" + valID + "' data-id='" + valID + "' style='width:20em; display:inline-block;'>" + val + "</textarea>";
    } else {
        html += "<input type='text' id='setValue_" + valID + "' data-id='" + valID + "' value=\"" + val + "\" style='width:20em; display:inline-block;'/>";
    }
    html += " " + valUnit + " <a href='#' id='setTextButton_" + valID + "' data-id='" + valID + "' data-role='button' data-inline='true' data-icon='check'>Setzen</a>";
    html += "<i class='ui-li-desc'>" + vorDate + "</i> <span id='info_" + valID + "' class='valueOK valueOK-" + theme + "'></span>";
    html += "</div>";
    return html;
}

function addHTML(valID, val, vorDate, readonly) {
    var html = "<div data-role='fieldcontain' class='" + (readonly ? "" : "ui-grid-a") + "'>";
    html += "<div class='evalScript" + (readonly ? "" : " ui-block-a") + "'>" + val + "</div>";
    if (!readonly) {
        html += "<div class='ui-block-b'><textarea id='setValue_" + valID + "' data-id='" + valID + "' style='width:20em; display:inline-block;'>" + val + "</textarea>";
        html += "<a href='#' id='setTextButton_" + valID + "' data-id='" + valID + "' data-role='button' data-inline='true' data-icon='check'>Setzen</a>";
        html += "<i class='ui-li-desc'>" + vorDate + "</i> <span id='info_" + valID + "' class='valueOK valueOK-" + theme + "'></span>";
        html += "</div>";
        html += "</div>";
    }
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
    if (valType === "20" && valUnit === "html") {
        return addHTML(valID, strValue, vorDate, true);
    } else {
        return "<p><img class='ui-img-" + theme + "' src='img/channels/unknown.png' style='max-height:20px'><span class='valueInfo valueInfo-" + theme + "'>" + visVal + " " + valUnit + " </span></p><i class='ui-li-desc'>" + vorDate + "</i>";
    }
}

// ------------------------ HTML Erstellung -----------------------------

function processVariable(variable, valID, systemDate) {
    var strValue = unescape(variable['value']);
    var valType = variable['valueType'];
    var valUnit = variable['valueUnit'];
    var valList = variable['valueList'];
    var vorDate = getTimeDiffString(variable['date'], systemDate);
    var valInfo = unescape(variable['info']);
    var val0 = variable['valueName0'];
    var val1 = variable['valueName1'];

    var html = "<li class='dataListItem' id='" + valID + "'><h2 class='ui-li-heading'>" + unescape(variable['name']) + "</h2>";
    html += "<p>" + valInfo + "</p>";

    // In der Variablenliste editieren zulassen:
    if (isReadOnly(valInfo)) {
        html += addReadonlyVariable(valID, strValue, vorDate, valType, valUnit, valList, val0, val1);
    } else if (valType === "2") {
        // Bool.
        html += addSetBoolButtonList(valID, strValue, val0, val1, valUnit, vorDate, true);
    } else if (valType === "4") {
        // Float, Integer.
        html += addSetNumber(valID, strValue, valUnit, variable['valueMin'], variable['valueMax'], 0.001, 1.0, vorDate, true);
    } else if (valType === "16") {
        // Liste.
        html += addSetValueList(valID, strValue, valList, valUnit, vorDate, true);
    } else if (valType === "20" && valUnit === "html") {
        html += addHTML(valID, strValue, vorDate, false);
    } else if (valType === "20") {
        html += addSetText(valID, strValue, valUnit, vorDate);
    } else {
        html += "Unbekannter Variablentyp!";
    }
    html += "</li>";

    return html;
}

function processProgram(prog, prgID, systemDate) {
    var deviceHTML = "<li class='dataListItem' id='" + prgID + "'><h2 class='ui-li-heading'>" + prog['name'] + "</h2><p>" + prog['info'] + "</p>";
    deviceHTML += addStartProgramButton(prgID, "Ausf&uuml;hren", getTimeDiffString(prog['date'], systemDate), prog['operate'] === "true");
    deviceHTML += "</li>";
    return deviceHTML;
}

function processGraphicID(type, map) {
    $.each(map, function (key, val) {
        var html = "<li>";
        html += "<img id='img" + key + "' class='lazyLoadImage ui-li-thumbnail ui-img-" + theme + "' data-original='../webmatic_user/img/ids/" + type + "/" + key + ".png' src='img/menu/" + type + ".png'/>";
        html += "<form method='post' enctype='multipart/form-data' action='#' id='form" + key + "'>";
        html += "<div class='ui-grid-b'>";
        html += "<div class='ui-block-a'><h1>" + val + " (<a href='get.html?id=" + key + "' target='_blank'>" + key + "</a>)</h1></div>";
        html += "<div class='ui-block-b'><input name='file' id='file" + key + "' type='file' accept='image/*' /></div>";
        html += "<div class='ui-block-c'><a href='#' name='uploadPicture' data-type='" + type + "' id='uploadPicture" + key + "' class='ui-link ui-btn ui-icon-check ui-btn-icon-left ui-btn-inline ui-shadow ui-corner-all ui-state-disabled'>Speichern</a></div>";
        html += "</div>";
        html += "</form>";
        html += "</li>";
        $("#dataList").append(html);
    });
}

function getErrorMessage(errType, error, errValue, deviceHssType) {
    var txt = "";

    if (errType === "ALARMDP") {
        var type;
        if (error === "CONFIG_PENDING" || error === "STICKY_UNREACH") {
            type = "Info";
        } else if (error === "LOWBAT") {
            type = "Warning";
        } else {
            type = "Error";
        }
        return "<span class='value" + type + " value" + type + "-" + theme + "'>" + mapText(errType + "__" + error) + "</span>";
    } else if (errType === "HSSDP") {
        txt = mapText(deviceHssType + "__" + error + "__" + errValue);
        if (txt !== "" && txt !== "-") {
            return "<span class='valueError valueError-" + theme + "'>" + txt + "</span>";
        }
    }

    // Konnte kein Text ermittelt werden, dann "Unbekannter Fehler" anzeigen:
    if (txt === "" ) {
        txt = "<span class='valueError valueError-" + theme + "'>" + mapText("UNKNOWN_ERROR") + ": " + errValue + "</span>";
    }
    return txt;
}

function addDiagram(options) {
    if (options['addDiagram']) {
        $("#dataList").listview("refresh");
        // Diagrammoptionen Defaults setzen:
        var dType = "l"; // Typ = Line.
        var dColor = "69A5CF"; // Farbe.
        var dLow = ""; // Kleinster Werte 10% unter Minimum.
        var dHigh = ""; // Größter Wert 10% über Maximum.
        var dKomma = 1; // Eine Nachkommastellen.
        var dStart = "0/#008800"; // Startwert für Gauge.
        var dEnd = "30/#AA4400";  // Endwert für Gauge.

        // Diagrammoptionen prüfen:
        for (var i = 0; i < options['varOptions'].length; i++) {
            var dA = options['varOptions'][i].split("=");
            if (dA.length === 2) {
                if (dA[0] === "t") {
                    dType = dA[1];
                } else if (dA[0] === "c") {
                    dColor = dA[1];
                } else if (dA[0] === "l") {
                    dLow = dA[1];
                } else if (dA[0] === "h") {
                    dHigh = dA[1];
                } else if (dA[0] === "k") {
                    dKomma = parseInt(dA[1]);
                } else if (dA[0] === "s") {
                    dStart = dA[1];
                } else if (dA[0] === "e") {
                    dEnd = dA[1];
                }
            }
        }

        if (options['varOptionsFirst'] === "g") {
            // Gauge
            // In Number Array verwandeln:
            var gaugeVal = parseFloat(options['diagramData']);

            // Start ermitteln:
            var startArr = dStart.split("/");
            var gaugeMin = parseFloat(startArr[0]);
            var gaugeMinCol = startArr[1];
            if (gaugeVal < gaugeMin) {
                gaugeMin = gaugeVal;
            }

            // Ende ermitteln:
            var endArr = dEnd.split("/");
            var gaugeMax = parseFloat(endArr[0]);
            var gaugeMaxCol = endArr[1];
            if (gaugeVal > gaugeMax) {
                gaugeMax = gaugeVal;
            }

            // Farben teilen:
            var rStart = parseInt(gaugeMinCol.substring(1, 3), 16);
            var gStart = parseInt(gaugeMinCol.substring(3, 5), 16);
            var bStart = parseInt(gaugeMinCol.substring(5, 7), 16);
            var rEnd = parseInt(gaugeMaxCol.substring(1, 3), 16);
            var gEnd = parseInt(gaugeMaxCol.substring(3, 5), 16);
            var bEnd = parseInt(gaugeMaxCol.substring(5, 7), 16);

            // Farbinterpolation:
            var gValArr = [];
            var gColArr = [];
            var resolution = 10;
            for (var i = 1; i <= resolution; i++) {
                // Interpoliert von 1/4 bis 1:
                var f = i / resolution;
                var v = gaugeMin + f * (gaugeMax - gaugeMin);
                gValArr.push(v);

                // Interpoliert von 0/resolution bis 1:
                f = (i - 1) / (resolution - 1);
                var cr = Math.floor(rStart + f * (rEnd - rStart)).toString(16);
                if (cr.length < 2) {
                    cr = "0" + cr;
                }
                var cg = Math.floor(gStart + f * (gEnd - gStart)).toString(16);
                if (cg.length < 2) {
                    cg = "0" + cg;
                }
                var cb = Math.floor(bStart + f * (bEnd - bStart)).toString(16);
                if (cb.length < 2) {
                    cb = "0" + cb;
                }
                var c = "#" + cr + cg + cb;
                gColArr.push(c);
            }

            // Gauge erstellen:
            var gData = [options['diagramData']];
            $.jqplot(options['diagramID'], [gData], {
                seriesDefaults: {
                    renderer: $.jqplot.MeterGaugeRenderer,
                    rendererOptions: {
                        label: options['diagramData'] + " " + options['diagramUnit'],
                        labelPosition: 'bottom',
                        labelHeightAdjust: -5,
                        min: gaugeMin,
                        max: gaugeMax,
                        intervals: gValArr,
                        intervalColors: gColArr
                    }
                },
                grid: {
                    backgroundColor: "transparent"
                }
            });
        } else if (options['varOptionsFirst'] === "h") {
            //------------------------------------ begin Goglo
            //wir erwarten die Werte in der Form n;t1;t2;t3...
            // mit t in der Form date,v1,v2,v3...
            var srcDiagArr = options['diagramData'].split(";");
            // Erstes Element muss weg, dann ist immer alle numValues wieder ein Datum
            var al = srcDiagArr[0];
            if (al > 0) {
                // Felder: Datum, Soll-Temp, Ist-Temp, Luftfeucht, Stell1, Stell2
                var diagArr = new Array();  // Neues, n-dimensionales Array.
                diagArr[0] = new Array();
                diagArr[1] = new Array();
                diagArr[2] = new Array();
                diagArr[3] = new Array();
                diagArr[4] = new Array();
                var j = 0;

                var lowVal;
                if (dLow === "") {
                    lowVal = 15.0;
                } else {
                    lowVal = parseFloat(dLow);
                }

                var highVal;
                if (dHigh === "") {
                    highVal = 23.0;
                } else {
                    highVal = parseFloat(dHigh);
                }
                var lowDate = "";
                var highDate = "";
                // Werte in Array aus 2-dim Arrays umwandeln:
                // i 0..al ist index von scrDiagArr, also ueber alle Tupel
                // j  0.. ist index von diagArr, also alle Werte innerhalb des Tupels

                for (var i = 1; i <= al; i++)
                {
                    var t = srcDiagArr[i];
                    var tArr = t.split(",");
                    var v1 = tArr[0];
                    if (lowDate === "" || v1 < lowDate) {
                        lowDate = v1;
                    }
                    if (highDate === "" || v1 > highDate) {
                        highDate = v1;
                    }

                    for (j = 1; j < tArr.length; j++)
                    {
                        var vArr = new Array();
                        vArr[0] = v1;
                        var v2 = tArr[j];
                        vArr[1] = v2;
                        diagArr[j - 1][i - 1] = vArr;
                    }
                }
            }
            $.jqplot(options['diagramID'], [diagArr[0], diagArr[1], diagArr[2], diagArr[3], diagArr[4]], {
                axes: {
                    xaxis: {
                        renderer: $.jqplot.DateAxisRenderer,
                        tickRenderer: $.jqplot.CanvasAxisTickRenderer,
                        tickOptions: {formatString: '%a, %#d %#H:%M', angle: 20},
                        min: lowDate,
                        max: highDate
                    },
                    yaxis: {
                        min: lowVal,
                        max: highVal,
                        showLabel: true,
                        tickOptions: {
                            formatString: '%.' + dKomma + 'f' + '&deg;C'
                        }
                    },
                    y2axis: {
                        min: 0.0,
                        max: 100.0,
                        showLabel: true,
                        tickOptions: {
                            formatString: '%d' + "%"
                        }
                    }
                },
                legend: {
                    show: false,
                    fontSize: 23,
                    placement: 'outside',
                    location: 'e'
                },
                seriesDefaults: {
                    lineWidth: 2,
                    showMarker: false,
                    fill: false,
                    shadow: false
                },
                series: [{
                        label: "Soll",
                        color: "#555555", //+ dColor,
                        fill: true,
                        fillAlpha: 0.1
                    }, {
                        label: "Ist",
                        color: "#DD0000"// Farbe Ist-Temperatur
                    }, {
                        label: "relF%",
                        color: "#0174DF", // Farbe rel. Luftfeuchtigkeit
                        yaxis: 'y2axis',
                        lineWidth: 1
                    }, {
                        label: "Ventil",
                        color: "#777777", // Farbe Ventil 1
                        yaxis: 'y2axis',
                        lineWidth: 1
                    }, {
                        label: "Ventil",
                        color: "#777777", // Farbe Ventil 2
                        yaxis: 'y2axis'
                    }],
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
                }
            });
            //------------------------------------ end Goglo
        } else if (dType === "l" || dType === "f") {
            srcDiagArr = options['diagramData'].split(",");
            // Erstes Element muss weg, dann immer zwei, also min = 3:
            al = srcDiagArr.length;
            if (al >= 3) {
                diagArr = new Array();  // Neues, zweidimensionales Array.
                j = 0;
                lowVal = 1e6;
                highVal = -1e6;
                lowDate = "";
                highDate = "";
                // Werte in Array aus 2-dim Arrays umwandeln:
                for (var i = 1; i < al; i = i + 2)
                {
                    v1 = srcDiagArr[i];
                    v2 = srcDiagArr[i + 1];
                    var smallArr = new Array();
                    smallArr[0] = v1;
                    v;
                    if (v2 === "true") {
                        v = 1;
                    } else if (v2 === "false") {
                        v = 0;
                    } else {
                        v = parseFloat(v2);
                    }
                    smallArr[1] = v;

                    if (v < lowVal) {
                        lowVal = v;
                    }
                    if (v > highVal) {
                        highVal = v;
                    }

                    if (lowDate === "" || v1 < lowDate) {
                        lowDate = v1;
                    }
                    if (highDate === "" || v1 > highDate) {
                        highDate = v1;
                    }
                    diagArr[j] = smallArr;
                    j++;
                }

                // Low Values anpassen:
                if (dLow === "") {
                    lowVal = lowVal - 0.1 * (highVal - lowVal);
                } else if (dLow === "m") {
                    // lowVal ist schon Minimum;
                } else {
                    var sugLowVal = parseFloat(dLow);
                    if (sugLowVal < lowVal) {
                        lowVal = sugLowVal;
                    }
                }
                // High Values anpassen:
                if (dHigh === "") {
                    highVal = highVal + 0.1 * (highVal - lowVal);
                } else if (dHigh === "m") {
                    // highVal ist schon Maximum;
                } else {
                    var sugHighVal = parseFloat(dHigh);
                    if (sugHighVal > highVal) {
                        highVal = sugHighVal;
                    }
                }

                // Fill/Line:
                var diagFill;
                if (dType === "l") {
                    diagFill = false;
                } else {
                    diagFill = true;
                }

                $.jqplot(options['diagramID'], [diagArr], {
                    axes: {
                        xaxis: {
                            renderer: $.jqplot.DateAxisRenderer,
                            tickRenderer: $.jqplot.CanvasAxisTickRenderer,
                            tickOptions: {formatString: '%b %#d, %#H:%M', angle: 20},
                            min: lowDate,
                            max: highDate
                        },
                        yaxis: {
                            min: lowVal,
                            max: highVal,
                            tickOptions: {
                                formatString: '%.' + dKomma + 'f' + options['diagramUnit']
                            }
                        }
                    },
                    seriesDefaults: {
                        rendererOptions: {
                            smooth: true
                        }
                    },
                    series: [{
                            color: "#" + dColor,
                            lineWidth: 2,
                            showMarker: false,
                            fill: diagFill
                        }],
                    highlighter: {
                        show: true,
                        sizeAdjust: 5.5
                    },
                    cursor: {
                        show: false
                    },
                    grid: {
                        backgroundColor: "#F4F4F4"
                    }
                });
            }
        }   // if  dType...
    }
}

function addChannel(device, systemDate, options) {
    var deviceHssType = device['hssType'];
    var hasChannel = false;
    var deviceHTMLPostChannelGroup = "";
    var deviceHTMLPostChannelGroupMode = 0;
    var deviceHTML = "";

    $.each(device.channels, function (j, channel) {
        hasChannel = true;
        var type = channel['type'];

        if (type === "HSSDP") {

            var channelID = channel['id'];
            var hssType = channel['hssType'];
            var channelDate = channel['date'];
            var vorDate = getTimeDiffString(channelDate, systemDate);
            var valString = channel['value'];
            var valFloat = parseFloat(channel['value']);
            var valBool = (valString === "true");
            var valUnit = channel['valueUnit'];
            var valMin = parseFloat(channel['valueMin']);
            var valMax = parseFloat(channel['valueMax']);
            
            if (typeof (valUnit) === "undefined") {
                valUnit = "";
            } else if (valUnit === "100%") {
                valUnit = "%";  // Manche Geräte haben als Einheit 100%. Würde zu seltsamen Darstellungen führen.
            }

            if (hssType === "SETPOINT" || hssType === "SET_TEMPERATURE") {
                deviceHTML += addSetNumber(channelID, valFloat, valUnit, 6, 30, 0.5, 1.0, vorDate, false);
                var lowTemp = valFloat - 3.0;
                var highTemp = lowTemp + 6.0;
                if (lowTemp < 6.0) {
                    lowTemp = 6.0;
                    highTemp = 11.0;
                }
                if (highTemp > 30.0) {
                    lowTemp = 25.0;
                    highTemp = 30.0;
                }
                deviceHTML += "<div data-role='controlgroup' data-type='horizontal'>";
                for (i = lowTemp; i <= highTemp; i += 1.0) {
                    deviceHTML += addSetButton(channelID, i + valUnit, i, vorDate, true, i === valFloat, false);
                }
                deviceHTML += "</div>";
            } else if (deviceHssType === "CLIMATECONTROL_RT_TRANSCEIVER") {
                if (hssType === "CONTROL_MODE") {
                    // save control_mode 
                    deviceHTMLPostChannelGroupMode = valFloat;
                } else if (hssType === "AUTO_MODE") {
                    // collect post buttons
                    deviceHTMLPostChannelGroup += addSetButton(channel['id'], mapText(deviceHssType + "__" + hssType), true, vorDate, true, deviceHTMLPostChannelGroupMode === 0.0, true);
                } else if (hssType === "MANU_MODE") {
                    // collect post buttons
                    deviceHTMLPostChannelGroup += addSetButton(channel['id'], mapText(deviceHssType + "__" + hssType), true, vorDate, true, deviceHTMLPostChannelGroupMode === 1.0, true);
                } else if (hssType === "BOOST_MODE") {
                    // collect post buttons
                    deviceHTMLPostChannelGroup += addSetButton(channel['id'], mapText(deviceHssType + "__" + hssType), true, vorDate, true, deviceHTMLPostChannelGroupMode === 3.0, true);
                } else if (hssType === "LOWERING_MODE" || hssType === "COMFORT_MODE") {
                    // collect post buttons
                    deviceHTMLPostChannelGroup += addSetButton(channel['id'], mapText(deviceHssType + "__" + hssType), true, vorDate, true, false, true);
                }
            } else if (hssType === "PROGRAM" && deviceHssType === "RGBW_AUTOMATIC") {
                //mrlee HM-LC-RGBW-WM
                deviceHTML += "<div data-role='controlgroup' data-type='horizontal'>";
                deviceHTML += addSetButton(channelID, mapText(deviceHssType + "__" + hssType + "__0"), 0, vorDate, true, valFloat === 0.0, true);
                deviceHTML += addSetButton(channelID, mapText(deviceHssType + "__" + hssType + "__1"), 1, vorDate, true, valFloat === 1.0, true);
                deviceHTML += addSetButton(channelID, mapText(deviceHssType + "__" + hssType + "__2"), 2, vorDate, true, valFloat === 2.0, true);
                deviceHTML += addSetButton(channelID, mapText(deviceHssType + "__" + hssType + "__3"), 3, vorDate, true, valFloat === 3.0, true);
                deviceHTML += addSetButton(channelID, mapText(deviceHssType + "__" + hssType + "__4"), 4, vorDate, true, valFloat === 4.0, true);
                deviceHTML += addSetButton(channelID, mapText(deviceHssType + "__" + hssType + "__5"), 5, vorDate, true, valFloat === 5.0, true);
                deviceHTML += addSetButton(channelID, mapText(deviceHssType + "__" + hssType + "__6"), 6, vorDate, true, valFloat === 6.0, true);
                deviceHTML += "</div>";
            } else if (hssType === "COLOR" && deviceHssType === "RGBW_COLOR") {
                //mrlee HM-LC-RGBW-WM
                deviceHTML += "<span class='RGBW-Color'>";
                deviceHTML += addSetNumber(channelID, valFloat, valUnit, 0.0, 200.0, 1, 1, vorDate, true);
                deviceHTML += "</span>";
            } else if (hssType === "LED_STATUS" && deviceHssType === "KEY") {
                switch (valFloat) {
                    case 0: // Off
                        deviceHTML += "<p><img class='ui-img-" + theme + "' src='img/channels/off_lamp.png' style='max-height:40px'> " + mapText(deviceHssType + "__" + hssType + "__0") + " | <span><i>" + vorDate + "</i></span></p>";
                        break;
                    case 1: // Red
                        deviceHTML += "<p><img class='ui-img-" + theme + "' src='img/channels/red_lamp.png' style='max-height:40px'> " + mapText(deviceHssType + "__" + hssType + "__1") + " | <span><i>" + vorDate + "</i></span></p>";
                        break;
                    case 2: // Green
                        deviceHTML += "<p><img class='ui-img-" + theme + "' src='img/channels/green_lamp.png' style='max-height:40px'> " + mapText(deviceHssType + "__" + hssType + "__2") + " | <span><i>" + vorDate + "</i></span></p>";
                        break;
                    case 3: // Orange
                        deviceHTML += "<p><img class='ui-img-" + theme + "' src='img/channels/orange_lamp.png' style='max-height:40px'> " + mapText(deviceHssType + "__" + hssType + "__3") + " | <span><i>" + vorDate + "</i></span></p>";
                        break;
                }
            } else if (hssType === "LEVEL" && deviceHssType === "BLIND") {
                deviceHTML += addSetNumber(channelID, valFloat, valUnit, valMin, valMax, 0.01, 100.0, vorDate + " | 0" + valUnit + " = " + mapText("CLOSE") + ", 100" + valUnit + " = " + mapText("OPEN"), false);
                deviceHTML += addSetControlGroup(channelID, mapText("CLOSE_SHORT"), mapText("OPEN_SHORT"), vorDate, valFloat);
            } else if (hssType === "LEVEL" && deviceHssType === "WINMATIC") {
                deviceHTML += addSetNumber(channelID, valFloat, valUnit, valMin, valMax, 0.01, 100.0, vorDate + " | -0.5" + valUnit + " = " + mapText("LOCKED") + ", 0" + valUnit + " = " + mapText("CLOSE") + ", 100" + valUnit + " = " + mapText("OPEN"), false);
                deviceHTML += addSetControlGroup(channelID, mapText("CLOSE_SHORT"), mapText("OPEN_SHORT"), vorDate, valFloat, addSetButton(channelID, mapText("LOCK"), -0.005, vorDate, true, valFloat === -0.005, false));
            } else if (hssType === "LEVEL" && (deviceHssType === "DIMMER" || deviceHssType === "VIRTUAL_DIMMER")) {
                deviceHTML += addSetNumber(channelID, valFloat, valUnit, valMax, valMax, 0.01, 100.0, vorDate + " | 0" + valUnit + " = " + mapText("OFF") + ", 100" + valUnit + " = " + mapText("ON"), false);
                deviceHTML += addSetControlGroup(channelID, mapText("OFF"), mapText("ON"), vorDate, valFloat);
            } else if (hssType === "FREQUENCY" && deviceHssType === "DIGITAL_ANALOG_OUTPUT") {
                deviceHTML += addSetNumber(channelID, valFloat, valUnit, 0.0, 50000.0, 1.0, 1, vorDate + " | 0" + valUnit + " = " + mapText("MAX") + ", 50000" + valUnit + " = " + mapText("MIN"), false);
                deviceHTML += "<div data-role='controlgroup' data-type='horizontal'>";
                deviceHTML += addSetButton(channelID, mapText("MAX"), 0.0, vorDate, true, valFloat === 0.0, true);
                deviceHTML += addSetButton(channelID, mapText("MED"), 30000.0, vorDate, true, valFloat === 30000.0, true);
                deviceHTML += addSetButton(channelID, mapText("MIN"), 50000.0, vorDate, true, valFloat === 50000.0, true);
                deviceHTML += "</div>"; 
            } else {
                var inputType = mapInput(deviceHssType, channel, vorDate);

                if (inputType !== "") {
                    deviceHTML += inputType;
                } else {
                    var status = mapState(hssType, deviceHssType, valFloat, valBool);
                    if (status !== "Hide") {
                        var stateText = "";
                        var name = "&nbsp;";
                        var faktor = 1.0;

                        if (status !== "") {
                            stateText = "<span class='value" + status + " value" + status + "-" + theme + "'>" + mapText(deviceHssType + "__" + hssType + "__" + valString) + "&nbsp;" + valUnit + "</span>";
                        } else if (hssType === "VALUE") {
                            stateText = valString + " " + valUnit;
                        } else {
                            if ((hssType === "LEVEL" && deviceHssType === "AKKU") || (hssType === "BAT_LEVEL" && deviceHssType === "POWER")) {
                                faktor = 100.0;
                            }
                            name = mapText(deviceHssType + "__" + hssType);
                            var v = valString;
                            if (!isNaN(valString) || faktor !== 1.0) {
                                v = valFloat * faktor;
                            }
                            stateText = v + " " + valUnit;
                        }

                        if (name !== "-") {
                            deviceHTML += "<p class='ui-li-desc'>";
                            deviceHTML += "<img class='ui-img-" + theme + "' src='img/channels/" + mapImage(hssType) + "' style='max-height:20px'>";
                            deviceHTML += "<span class='valueInfo valueInfo-" + theme + "'>" + stateText + " </span>&nbsp;" + name + "&nbsp;|&nbsp;";
                            deviceHTML += "<span><i>" + vorDate + "</i></span>";
                            deviceHTML += "</p>";
                        }
                    }
                }
            }
        } else if (type === "VARDP") {
            var valID = channel['id'];
            var valInfo = unescape(channel['info']);
            var strValue = unescape(channel['value']);
            var valType = channel['valueType'];
            valUnit = channel['valueUnit'];
            var val0 = channel['valueName0'];
            var val1 = channel['valueName1'];
            var valMin = channel['valueMin'];
            var valMax = channel['valueMax'];
            var valList = channel['valueList'];
            channelDate = channel['date'];
            vorDate = getTimeDiffString(channelDate, systemDate);

            // Wenn die Variable hinten (r) hat, dann ist sie Read-Only in den Favoriten,
            // bei (d) / (dk) ist es ein Diagramm in den Favoriten,
            // bei (g) eine Tankuhr,
            // bei (nv) soll der Wert ausgeblendet werden (Sollwertscript). Nur bei Variablen in Geräten verknüpft.
            // ( finden:
            options['varOptionsFirst'] = "";
            options['varOptions'] = [];
            var bracketOpen = valInfo.indexOf("(");
            if (bracketOpen !== -1) {
                // ) finden:
                var bracketClose = valInfo.indexOf(")", bracketOpen);
                if (bracketClose !== -1) {
                    var optionsString = valInfo.substring(bracketOpen + 1, bracketClose);
                    options['varOptions'] = optionsString.split(",");

                    if (options['varOptions'].length >= 1) {
                        options['varOptionsFirst'] = options['varOptions'][0].toLowerCase();
                    }
                }
            }

            if (options['varOptionsFirst'] !== "nv") {
                // <br> davor, weil es an der Stelle eine mit Gerät verknüpfte Variable ist:
                deviceHTML += "<br><h2 class='ui-li-heading'>" + unescape(channel['name']) + "</h2>";
                deviceHTML += "<p>" + valInfo + "</p>";
                if (isReadOnly(valInfo)) {
                    deviceHTML += addReadonlyVariable(valID, strValue, vorDate, valType, valUnit, valList, val0, val1);
                } else if (options['varOptionsFirst'] === "d" || options['varOptionsFirst'] === "dk" || options['varOptionsFirst'] === "g" || options['varOptionsFirst'] === "h") {
                    // Goglo
                    options['addDiagram'] = true;
                    if (options['varOptionsFirst'] === "dk") {
                        options['diagramData'] = channel['diagrams'];
                    } else {
                        options['diagramData'] = strValue;
                    }
                    options['diagramID'] = "chart_" + valID;
                    options['diagramUnit'] = valUnit;
                    if (options['varOptionsFirst'] === "g") {
                        deviceHTML += "<div id='" + options['diagramID'] + "' style='height:200px; width:300px;'></div>" + " <i class='ui-li-desc'>" + vorDate + "</i>";
                    } else {
                        deviceHTML += "<div id='" + options['diagramID'] + "' style='height:300px; width:90%;'></div>" + " <i class='ui-li-desc'>" + vorDate + "</i>";
                    }
                } else {
                    if (valType === "2") {
                        // Bool.
                        deviceHTML += addSetBoolButtonList(valID, strValue, val0, val1, valUnit, vorDate, true);
                    } else if (valType === "4") {
                        // Float, Integer.
                        deviceHTML += addSetNumber(valID, strValue, valUnit, valMin, valMax, 0.001, 1.0, vorDate, true);
                    } else if (valType === "16") {
                        // Liste.
                        deviceHTML += addSetValueList(valID, strValue, valList, valUnit, vorDate, true);
                    } else if (valType === "20" && valUnit === "html") {
                        deviceHTML += addHTML(valID, strValue, vorDate, false);
                    } else if (valType === "20") {
                        deviceHTML += addSetText(valID, strValue, valUnit, vorDate);
                    } else {
                        deviceHTML += "Unbekannter Variablentyp!";
                    }
                }
            }
        }

    });

    if (deviceHTMLPostChannelGroup !== "") {
        deviceHTML += "<div data-role='controlgroup' data-type='horizontal'>";
        deviceHTML += deviceHTMLPostChannelGroup;
        deviceHTML += "</div>";
    }
    if (!hasChannel) {
        deviceHTML = "";  // Nicht anzeigen, z.B. Raumthermostat:3, wenn kein Fensterkontakt vorhanden.
    }

    return deviceHTML;
}

// ----------------------- Helper functions ----------------------------

function getDateFromString(strDate) {
    var dy = strDate.substring(0, 2);
    var mn = strDate.substring(3, 5) - 1; // -1, da 0 basiert.
    var yr = strDate.substring(6, 10);
    var hr = strDate.substring(11, 13);
    var mi = strDate.substring(14, 16);
    var sc = strDate.substring(17, 19);
    return new Date(yr, mn, dy, hr, mi, sc);
}

function loadConfigData(async, url, type, map, callback) {
    $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        async: async
    })
    .done(function (data) {
        switch (type) {
            case "config":
                optionsMap = data;
                break;
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

        localStorage.setItem(map, JSON.stringify(data));
        if (typeof callback === "function") {
            callback(data);
        }
    })
    .fail(function( jqXHR, textStatus ) {
        alert( "Request failed: " + textStatus );
    });
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
    
    if(varOptionsFirst === "h" || varOptionsFirst === "dk" || varOptionsFirst === "d" || varOptionsFirst === "g"){
        return false;
    }

    if (optionsMap["systemvar_readonly"] && readModus) {
        return varOptionsFirst !== "w";
    }
    return varOptionsFirst === "r";
}

function getTimeDiffString(diffDate, systemDate) {
    var timeDiff = (getDateFromString(systemDate) - getDateFromString(diffDate)) / 1000;  // In Sekunden konvertieren.

    if(timeDiff < 0) {
        return "";
    }else if (timeDiff < 60) {
        return "Vor " + Math.floor(timeDiff + 0.5) + " Sekunde/n";
    } else if (timeDiff < 60 * 60) {
        return "Vor " + Math.floor(timeDiff / 60 + 0.5) + " Minute/n";
    } else if (timeDiff < 60 * 60 * 24) {
        return "Vor " + Math.floor(timeDiff / (60 * 60) + 0.5) + " Stunde/n";
    } else if (timeDiff < 60 * 60 * 24 * 30.5) {
        return "Vor " + Math.floor(timeDiff / (60 * 60 * 24) + 0.5) + " Tag/en";
    } else if (timeDiff < 60 * 60 * 24 * 30.5 * 12) {
        return "Vor " + Math.floor(timeDiff / (60 * 60 * 24 * 30.5) + 0.5) + " Monat/en";
    } else {
        var y = Math.floor(timeDiff / (60 * 60 * 24 * 30.5 * 12) + 0.5);
        if (y > 40) {
            return "Noch nicht ver&auml;ndert";
        } else {
            return "Vor " + y + " Jahr/en";
        }
    }
}

function reloadList(txt, systemDate, restart) {
    $("#dataListHeader").empty();
    $("#dataListHeader").append("<li data-role='list-divider' role='heading'>" + txt + "<p style='float:right;'>" + systemDate + "</p></li>").listview("refresh");
    $("#dataList").listview("refresh");
    $("#dataList").trigger("create");
    if(restart){
        $("#dataList").fadeIn();
    }
}

function processDevices(device, systemDate, options) {
    var deviceHTML = "<li class='dataListItem' id='" + device['id'] + "'><h2 class='ui-li-heading'>" + unescape(device['name']) + "</h2>";

    if (device['type'] === "CHANNEL") {
        deviceHTML += addChannel(device, systemDate, options);
    } else if (device['type'] === "VARDP") {
        var valID = device['id'];
        var valInfo = unescape(device['info']);
        var strValue = unescape(device['value']);
        var valType = device['valueType'];
        var valUnit = device['valueUnit'];
        var val0 = device['valueName0'];
        var val1 = device['valueName1'];
        var valMin = device['valueMin'];
        var valMax = device['valueMax'];
        var valList = device['valueList'];
        var channelDate = device['date'];
        var vorDate = getTimeDiffString(channelDate, systemDate);
        // Wenn die Variable hinten (r) hat, dann ist sie Read-Only in den Favoriten:
        options['varOptionsFirst'] = "";
        options['varOptions'] = [];
        // ( finden:
        var bracketOpen = valInfo.indexOf("(");
        if (bracketOpen !== -1) {
            // ) finden:
            var bracketClose = valInfo.indexOf(")", bracketOpen);
            if (bracketClose !== -1) {
                var optionsString = valInfo.substring(bracketOpen + 1, bracketClose);
                options['varOptions'] = optionsString.split(",");

                if (options['varOptions'].length >= 1) {
                    options['varOptionsFirst'] = options['varOptions'][0].toLowerCase();
                }
            }
        }

        deviceHTML += "<p>" + valInfo + "</p>";
        if (isReadOnly(valInfo)) {
            deviceHTML += addReadonlyVariable(valID, strValue, vorDate, valType, valUnit, valList, val0, val1);
        } else if (options['varOptionsFirst'] === "d" || options['varOptionsFirst'] === "dk" || options['varOptionsFirst'] === "g" || options['varOptionsFirst'] === "h") {
            // Goglo
            options['addDiagram'] = true;
            if (options['varOptionsFirst'] === "dk") {
                options['diagramData'] = device['diagrams'];
            } else {
                options['diagramData'] = strValue;
            }
            options['diagramID'] = "chart_" + valID;
            options['diagramUnit'] = valUnit;
            if (options['varOptionsFirst'] === "g") {
                deviceHTML += "<div id='" + options['diagramID'] + "' style='height:200px; width:300px;'></div>" + " <i class='ui-li-desc'>" + vorDate + "</i>";
            } else {
                deviceHTML += "<div id='" + options['diagramID'] + "' style='height:300px; width:90%;'></div>" + " <i class='ui-li-desc'>" + vorDate + "</i>";
            }
        } else if (options['varOptionsFirst'] === "nv") {
            deviceHTML = "";  // Leeren.
        } else {
            if (valType === "2") {
                // Bool.
                deviceHTML += addSetBoolButtonList(valID, strValue, val0, val1, valUnit, vorDate, true);
            } else if (valType === "4") {
                // Float, Integer.
                deviceHTML += addSetNumber(valID, strValue, valUnit, valMin, valMax, 0.001, 1.0, vorDate, true);
            } else if (valType === "16") {
                // Liste.
                deviceHTML += addSetValueList(valID, strValue, valList, valUnit, vorDate, true);
            } else if (valType === "20" && valUnit === "html") {
                deviceHTML += addHTML(valID, strValue, vorDate, false);
            } else if (valType === "20") {
                deviceHTML += addSetText(valID, strValue, valUnit, vorDate);
            } else {
                deviceHTML += "Unbekannter Variablentyp!";
            }
        }
    } else if (device['type'] === "PROGRAM") {
        var prgID = device['id'];
        var prgInfo = device['info'];
        var prgDate = device['date'];
        vorDate = getTimeDiffString(prgDate, systemDate);

        deviceHTML += "<p>" + prgInfo + "</p>";
        deviceHTML += addStartProgramButton(prgID, "Ausf&uuml;hren", vorDate, device['operate'] === "true");
    }

    // Ist leer, wenn (nv) oder ein leerer Channel.
    if (deviceHTML !== "") {
        deviceHTML += "</li>";
    }

    return deviceHTML;
}

// ----------------------- Data loading functions ----------------------------

function loadData(url, id, restart) {

    $('#buttonRefresh .ui-btn-text').html("<img class='ui-img-" + theme + "' src='img/misc/wait16.gif' width=12px height=12px>");
    var isActual = false;

    if (restart) {
        // Listen leeren:
        $("#dataList").empty();
        $("#dataListHeader").empty();
        // "Lade..." anzeigen:
        $("#dataListHeader").append("<li><img src='img/misc/wait16.gif' width=12px height=12px class='ui-li-icon ui-img-" + theme + "'>Lade...</li>").listview("refresh");

        if (localStorage.getItem("webmaticDevicesMap" + id) === null) {
            loadConfigData(false, url + '?list=' + id, 'devices', 'webmaticDevicesMap' + id);
            isActual = true;
        } else {
            devicesMap = JSON.parse(localStorage.getItem("webmaticDevicesMap" + id));
        }

        var systemDate = devicesMap['date'];

        $.each(devicesMap.entries, function (i, device) {
            var options = new Object();
            options['addDiagram'] = false;
            options['diagramData'] = "";
            options['diagramID'] = "";
            options['diagramUnit'] = "";
            options['varOptions'] = {};
            options['varOptionsFirst'] = "";
            if (device['visible'] !== "false") {
                var html = processDevices(device, systemDate, options);
                if (html !== "") {
                    $("#dataList").append(html);
                }
            }
            addDiagram(options);
        });

        reloadList(devicesMap['name'], systemDate, restart);
    }

    if (!isActual) {
        loadConfigData(true, url + '?list=' + id, 'devices', 'webmaticDevicesMap' + id, function (dta) {
            var systemDate = dta['date'];

            $.each(dta.entries, function (i, device) {
                var options = new Object();
                options['addDiagram'] = false;
                options['diagramData'] = "";
                options['diagramID'] = "";
                options['diagramUnit'] = "";
                options['varOptions'] = {};
                options['varOptionsFirst'] = "";

                var html = processDevices(device, systemDate, options);

                if (html !== "") {
                    var devVisible = device['visible'] !== "false";
                    var devID = device['id'];

                    if ($('#' + devID).length === 0 && devVisible) {
                        $("#dataList").append(html);
                    } else if (devVisible) {
                        $('#' + devID).replaceWith(html);
                    } else if ($('#' + devID).length !== 0) {
                        $('#' + devID).remove();
                    }
                }

                addDiagram(options);
            });

            reloadList(dta['name'], systemDate, restart);

        });

    }

    // Animated Icon aus Refresh wieder entfernen:
    $('#buttonRefresh .ui-btn-text').html("&nbsp;");
    // Filter Update:
    $(".ui-input-search .ui-input-text").trigger("change");

    $("[id^=button]").trigger("create");
    $("[id^=input]").trigger("create");
    $("textarea").textinput("refresh");
}

function loadVariables(restart) {

    // Icon Animation in Refresh Button:
    $('#buttonRefresh .ui-btn-text').html("<img class='ui-img-" + theme + "' src='img/misc/wait16.gif' width=12px height=12px>");
    var isActual = false;
    if (restart) {
        $("#dataList").empty();
        $("#dataListHeader").empty();
        // "Lade..." anzeigen:
        $("#dataListHeader").append("<li><img src='img/misc/wait16.gif' width=12px height=12px class='ui-li-icon ui-img-" + theme + "'>Lade...</li>").listview("refresh");

        if (localStorage.getItem("webmaticVariablesMap") === null) {
            loadConfigData(false, 'cgi/systemvariables.cgi', 'variables', 'webmaticVariablesMap');
            isActual = true;
        } else {
            variablesMap = JSON.parse(localStorage.getItem("webmaticVariablesMap"));
        }

        var systemDate = variablesMap['date'];
        $.each(variablesMap.entries, function (i, variable) {
            var valVisible = variable['visible'] === "true";
            var valID = variable['id'];
            if ((readModus && valVisible) || !readModus) {
                $("#dataList").append(processVariable(variable, valID, systemDate));
            }
        });
        reloadList("Systemvariablen", systemDate, restart);
    }

    if (!isActual) {
        loadConfigData(true, 'cgi/systemvariables.cgi', 'variables', 'webmaticVariablesMap', function (dta) {
            var systemDate = dta['date'];
            $.each(dta.entries, function (i, variable) {
                var valVisible = variable['visible'] === "true";
                var valID = variable['id'];
                if ($('#' + valID).length === 0 && ((readModus && valVisible) || !readModus)) {
                    $("#dataList").append(processVariable(variable, valID, systemDate));
                } else if ((readModus && valVisible) || !readModus) {
                    $('#' + valID).replaceWith(processVariable(variable, valID, systemDate));
                } else if ($('#' + valID).length !== 0) {
                    $('#' + valID).remove();
                }
            });
            reloadList("Systemvariablen", systemDate, restart);
        });
    }
    // Animated Icon aus Refresh wieder entfernen:
    $('#buttonRefresh .ui-btn-text').html("&nbsp;");
    // Filter Update:
    $(".ui-input-search .ui-input-text").trigger("change");
    $("textarea").textinput("refresh");
}

function loadPrograms(restart) {

    // Icon Animation in Refresh Button:
    $('#buttonRefresh .ui-btn-text').html("<img class='ui-img-" + theme + "' src='img/misc/wait16.gif' width=12px height=12px>");
    var isActual = false;
    if (restart) {
        $("#dataList").empty();
        $("#dataListHeader").empty();
        // "Lade..." anzeigen:
        $("#dataListHeader").append("<li><img src='img/misc/wait16.gif' width=12px height=12px class='ui-li-icon ui-img-" + theme + "'>Lade...</li>").listview("refresh");

        if (localStorage.getItem("webmaticProgramsMap") === null) {
            loadConfigData(false, 'cgi/programs.cgi', 'programs', 'webmaticProgramsMap');
            isActual = true;
        } else {
            programsMap = JSON.parse(localStorage.getItem("webmaticProgramsMap"));
        }

        var systemDate = programsMap['date'];
        $.each(programsMap.entries, function (i, prog) {
            var prgVisible = prog['visible'] === "true";
            var prgActive = prog['active'] === "true";
            var prgID = prog['id'];

            if ((readModus && prgVisible && prgActive) || !readModus) {
                $("#dataList").append(processProgram(prog, prgID, systemDate));
            }
        });
        reloadList("Programme", systemDate, restart);
        $("#dataList").find(".btnDisabled").button('disable');
    }

    if (!isActual) {
        loadConfigData(true, 'cgi/programs.cgi', 'programs', 'webmaticProgramsMap', function (dta) {
            var systemDate = dta['date'];
            $.each(dta.entries, function (i, prog) {
                var prgVisible = prog['visible'] === "true";
                var prgActive = prog['active'] === "true";
                var prgID = prog['id'];

                if ($('#' + prgID).length === 0 && ((readModus && prgVisible && prgActive) || !readModus)) {
                    $("#dataList").append(processProgram(prog, prgID, systemDate));
                } else if ((readModus && prgVisible && prgActive) || !readModus) {
                    $('#' + prgID).replaceWith(processProgram(prog, prgID, systemDate));
                } else if ($('#' + prgID).length !== 0) {
                    $('#' + prgID).remove();
                }
            });
            reloadList("Programme", systemDate, restart);
            $("#dataList").find(".btnDisabled").button('disable');
        });
    }
    // Animated Icon aus Refresh wieder entfernen:
    $('#buttonRefresh .ui-btn-text').html("&nbsp;");
    // Filter Update:
    $(".ui-input-search .ui-input-text").trigger("change");
}

function loadGraphicIDs() {
    $("#dataList").empty();
    $("#dataListHeader").empty();
    // "Lade..." anzeigen:
    $("#dataListHeader").append("<li><img src='img/misc/wait16.gif' width=12px height=12px class='ui-li-icon ui-img-" + theme + "'>Lade...</li>").listview("refresh");
    // Icon Animation in Refresh Button:
    $('#buttonRefresh .ui-btn-text').html("<img class='ui-img-" + theme + "' src='img/misc/wait16.gif' width=12px height=12px>");

    if (localStorage.getItem("webmaticFavoritesMap") === null) {
        loadConfigData(false, 'cgi/favorites.cgi', 'favorites', 'webmaticFavoritesMap');
    } else {
        favoritesMap = JSON.parse(localStorage.getItem("webmaticFavoritesMap"));
        loadConfigData(true, 'cgi/favorites.cgi', 'favorites', 'webmaticFavoritesMap');
    }

    $("#dataList").append("<li data-role='list-divider' role='heading'>Favoriten</li>");
    processGraphicID('favorites', favoritesMap);

    if (localStorage.getItem("webmaticRoomsMap") === null) {
        loadConfigData(false, 'cgi/rooms.cgi', 'rooms', 'webmaticRoomsMap');
    } else {
        roomsMap = JSON.parse(localStorage.getItem("webmaticRoomsMap"));
        loadConfigData(true, 'cgi/rooms.cgi', 'rooms', 'webmaticRoomsMap');
    }

    $("#dataList").append("<li data-role='list-divider' role='heading'>R&auml;ume</li>");
    processGraphicID('rooms', roomsMap);

    if (localStorage.getItem("webmaticFunctionsMap") === null) {
        loadConfigData(false, 'cgi/functions.cgi', 'functions', 'webmaticFunctionsMap');
    } else {
        functionsMap = JSON.parse(localStorage.getItem("webmaticFunctionsMap"));
        loadConfigData(true, 'cgi/functions.cgi', 'functions', 'webmaticFunctionsMap');
    }

    $("#dataList").append("<li data-role='list-divider' role='heading'>Gewerke</li>");
    processGraphicID('functions', functionsMap);

    $("#dataList").listview("refresh");
    $("img.lazyLoadImage").lazyload({event: "lazyLoadInstantly"});
    $("img").trigger("lazyLoadInstantly");

    // "Lade..." wieder entfernen und Überschrift anzeigen:
    $("#dataListHeader").empty();
    $("#dataListHeader").append("<li data-role='list-divider' role='heading'>Grafik IDs</li>");
    $("#dataListHeader").listview("refresh");

    // Animated Icon aus Refresh wieder entfernen:
    $('#buttonRefresh .ui-btn-text').html("&nbsp;");

    $("#dataList").listview("refresh");
    $("#dataList").trigger("create").fadeIn();

}

function loadOptions() {
    $("#dataList").empty();
    $("#dataListHeader").empty();

    $("#dataListHeader").append("<li data-role='list-divider' role='heading'>Optionen</li>");
    var html = "<li><h1>Gr&ouml;&szlig;e der Menugrafiken</h1><p><div data-role='fieldcontain'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    var gfxSize = localStorage.getItem("optionsMenuGfxSize");
    var theme1 = "";
    var theme2 = "";
    if (!gfxSize || gfxSize === "" || gfxSize === "large") {
        theme2 = "class='ui-btn-active'";
    } else {
        theme1 = "class='ui-btn-active'";
    }
    html += "<a href='#' id='optionsMenuGfxSizeSmall' data-id='optionsMenuGfxSizeSmall' data-role='button' data-inline='true' " + theme1 + ">Klein</a>";
    html += "<a href='#' id='optionsMenuGfxSizeLarge' data-id='optionsMenuGfxSizeLarge' data-role='button' data-inline='true' " + theme2 + ">Gro&szlig;</a>";
    html += "</div></li>";
    $("#dataList").append(html);

    html = "<li><h1>Testseiten anzeigen</h1><p><div data-role='fieldcontain'>";
    var showTestPages = localStorage.getItem("optionsMenuShowTestpages");
    if (!showTestPages || showTestPages === "" || showTestPages === "false") {
        theme1 = "";
        theme2 = "class='ui-btn-active'";
    } else {
        theme1 = "class='ui-btn-active'";
        theme2 = "";
    }
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    html += "<a href='#' id='optionsMenuShowTestpages' data-id='optionsMenuShowTestpages' data-role='button' data-inline='true' " + theme1 + ">Anzeigen</a>";
    html += "<a href='#' id='optionsMenuHideTestpages' data-id='optionsMenuHideTestpages' data-role='button' data-inline='true' " + theme2 + ">Verstecken</a>";
    html += "</div></li>";
    $("#dataList").append(html);

    html = "<li><h1>Theme ausw&auml;hlen</h1><p><div data-role='fieldcontain'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    html += "<a href='#' name='optionsMenuGfxThemeChooser' data-value='a' class='" + (theme === 'a' ? 'ui-btn-active' : '') + "' data-role='button' data-inline='true'>Normal</a>";
    html += "<a href='#' name='optionsMenuGfxThemeChooser' data-value='b' class='" + (theme === 'b' ? 'ui-btn-active' : '') + "' data-role='button' data-inline='true'>Schwarz</a>";
    html += "<a href='#' name='optionsMenuGfxThemeChooser' data-value='c' class='" + (theme === 'c' ? 'ui-btn-active' : '') + "' data-role='button' data-inline='true'>Rosa</a>";
    html += "<a href='#' name='optionsMenuGfxThemeChooser' data-value='d' class='" + (theme === 'd' ? 'ui-btn-active' : '') + "' data-role='button' data-inline='true'>Gr&uuml;n</a>";
    html += "<a href='#' name='optionsMenuGfxThemeChooser' data-value='e' class='" + (theme === 'e' ? 'ui-btn-active' : '') + "' data-role='button' data-inline='true'>Gelb</a>";
    html += "<a href='#' name='optionsMenuGfxThemeChooser' data-value='f' class='" + (theme === 'f' ? 'ui-btn-active' : '') + "' data-role='button' data-inline='true'>Grau</a>";
    html += "<a href='#' name='optionsMenuGfxThemeChooser' data-value='g' class='" + (theme === 'g' ? 'ui-btn-active' : '') + "' data-role='button' data-inline='true'>Blau</a>";
    html += "<a href='#' name='optionsMenuGfxThemeChooser' data-value='h' class='" + (theme === 'h' ? 'ui-btn-active' : '') + "' data-role='button' data-inline='true'>Rot</a>";
    html += "<a href='#' name='optionsMenuGfxThemeChooser' data-value='i' class='" + (theme === 'i' ? 'ui-btn-active' : '') + "' data-role='button' data-inline='true'>Braun</a>";
    html += "<a href='#' name='optionsMenuGfxThemeChooser' data-value='j' class='" + (theme === 'j' ? 'ui-btn-active' : '') + "' data-role='button' data-inline='true'>Wei&szlig;</a>";
    html += "<a href='#' name='optionsMenuGfxThemeChooser' data-value='k' class='" + (theme === 'k' ? 'ui-btn-active' : '') + "' data-role='button' data-inline='true'>Brazil</a>";
    html += "<a href='#' name='optionsMenuGfxThemeChooser' data-value='l' class='" + (theme === 'l' ? 'ui-btn-active' : '') + "' data-role='button' data-inline='true'>Deutschland</a>";
    html += "</div><br/><br/><br/>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    html += "<a href='#' name='optionsMenuGfxFontChooser' data-value='a' class='" + (font === 'a' ? 'ui-btn-active' : '') + "' data-role='button' data-inline='true'>Normal</a>";
    html += "<a href='#' name='optionsMenuGfxFontChooser' data-value='b' class='" + (font === 'b' ? 'ui-btn-active' : '') + "' data-role='button' data-inline='true'>Koch Fraktur</a>";
    html += "<a href='#' name='optionsMenuGfxFontChooser' data-value='c' class='" + (font === 'c' ? 'ui-btn-active' : '') + "' data-role='button' data-inline='true'>Planet Benson</a>";
    html += "<a href='#' name='optionsMenuGfxFontChooser' data-value='d' class='" + (font === 'd' ? 'ui-btn-active' : '') + "' data-role='button' data-inline='true'>Action Man</a>";
    html += "<a href='#' name='optionsMenuGfxFontChooser' data-value='e' class='" + (font === 'e' ? 'ui-btn-active' : '') + "' data-role='button' data-inline='true'>Amadeus</a>";
    html += "<a href='#' name='optionsMenuGfxFontChooser' data-value='f' class='" + (font === 'f' ? 'ui-btn-active' : '') + "' data-role='button' data-inline='true'>Vamp</a>";
    html += "<a href='#' name='optionsMenuGfxFontChooser' data-value='g' class='" + (font === 'g' ? 'ui-btn-active' : '') + "' data-role='button' data-inline='true'>HennyPenny</a>";
    html += "<a href='#' name='optionsMenuGfxFontChooser' data-value='h' class='" + (font === 'h' ? 'ui-btn-active' : '') + "' data-role='button' data-inline='true'>Anglican</a>";
    html += "<a href='#' name='optionsMenuGfxFontChooser' data-value='i' class='" + (font === 'i' ? 'ui-btn-active' : '') + "' data-role='button' data-inline='true'>Nosifer</a>";
    html += "<a href='#' name='optionsMenuGfxFontChooser' data-value='j' class='" + (font === 'j' ? 'ui-btn-active' : '') + "' data-role='button' data-inline='true'>Pacifico</a>";
    html += "<a href='#' name='optionsMenuGfxFontChooser' data-value='k' class='" + (font === 'k' ? 'ui-btn-active' : '') + "' data-role='button' data-inline='true'>Sixties</a>";
    html += "<a href='#' name='optionsMenuGfxFontChooser' data-value='l' class='" + (font === 'l' ? 'ui-btn-active' : '') + "' data-role='button' data-inline='true'>Crackman</a>";
    html += "</div></li>";
    $("#dataList").append(html);

    html = "<li><h1>WebMatic neu laden, damit alle Einstellungen wirksam werden</h1><p><div data-role='fieldcontain'>";
    html += "<a href='#' id='reloadWebMatic' data-id='reloadWebMatic' data-role='button' data-inline='true'>Neu laden</a>";
    html += "</li>";
    $("#dataList").append(html);

    $("#dataListHeader").listview("refresh");
    $("#dataList").listview("refresh");
    $("#dataList").trigger("create").fadeIn();
}

// ------------------------- OnDocumentReady -----------------------------

$(function () {

    $(document).bind("mobileinit", function () {
        $.mobile.listview.prototype.options.filterPlaceholder = "Daten filtern...";
    });

    // Ein Button, bei dessen drücken ein Wert an die ID übertragen wird.
    $(document.body).on("click", "[id^=setButton]", function () {
        var dataID = $(this).data("id");    // Homematic Geräte ID.
        var refresh = $(this).data("refresh");  // Hinweis, ob ein Refresh stattfinden soll.
        var value = $(this).data("value"); // Wert.
        var infoID = "info_" + dataID;      // Info Textfeld neben Button.

        $("#" + infoID).text("Übertrage...");
        $.get('cgi/set.cgi?id=' + dataID + '&value=' + value, function () {
            if (refresh) {
                $("#" + infoID).text("OK!");
                refreshPage(0);
            } else {
                $("#" + infoID).text("Wert wird noch an Gerät übertragen und erst verzögert hier dargestellt.");
            }
        });
    });

    // Ein Button, bei dessen drücken ein Wert an die ID übertragen wird.
    $(document.body).on("click", "[id^=setNumberButton]", function () {
        var dataID = $(this).data("id");  // Homematic Geräte ID.
        var refresh = $(this).data("refresh");  // Hinweis, ob ein Refresh stattfinden soll.
        var valueID = "setValue_" + dataID; // Wertfeld, dessen Inhalt gesetzt werden soll.
        var infoID = "info_" + dataID;  // Info Textfeld neben Button.
        var value = $("#" + valueID).val(); // Wert aus Wertfeld auslesen.
        var factor = $("#" + valueID).data("factor"); // Factor auslesen.

        var valueDivided = parseFloat(value) / factor;
        $("#" + infoID).text("Übertrage...");
        $.get('cgi/set.cgi?id=' + dataID + '&value=' + valueDivided, function () {
            if (refresh) {
                $("#" + infoID).text("OK!");
                refreshPage(0);
            } else {
                $("#" + infoID).text("Wert wird noch an Gerät übertragen und erst verzögert hier dargestellt.");
            }
        });
    });

    // Ein Button, bei dessen drücken ein Bool an die ID übertragen wird.
    $(document.body).on("click", "[id^=setBoolButton]", function () {
        var dataID = $(this).data("id");  // Homematic Geräte ID.
        var valueID = "setValue_" + dataID; // Wertfeld, dessen Inhalt gesetzt werden soll.
        var infoID = "info_" + dataID;  // Info Textfeld neben Button.
        var value = $("#" + valueID).val(); // Wert aus Wertfeld auslesen.

        $("#" + infoID).text("Übertrage...");
        $.get('cgi/set.cgi?id=' + dataID + '&value=' + value, function () {
            $("#" + infoID).text("OK!");
            refreshPage(0);
        });
    });

    // Ein Button, bei dessen drücken ein ValueList Item an die ID übertragen wird.
    $(document.body).on("click", "[id^=setValueListButton]", function () {
        var dataID = $(this).data("id");  // Homematic Geräte ID.
        var valueID = "setValue_" + dataID; // Wertfeld, dessen Inhalt gesetzt werden soll.
        var infoID = "info_" + dataID;  // Info Textfeld neben Button.
        var value = $("#" + valueID).val(); // Wert aus Wertfeld auslesen.

        $("#" + infoID).text("Übertrage...");
        $.get('cgi/set.cgi?id=' + dataID + '&value=' + value, function () {
            $("#" + infoID).text("OK!");
            refreshPage(0);
        });
    });

    // Ein Button, bei dessen drücken ein Bool an die ID übertragen wird.
    $(document.body).on("click", "[id^=setTextButton]", function () {
        var dataID = $(this).data("id");  // Homematic Geräte ID.
        var valueID = "setValue_" + dataID; // Wertfeld, dessen Inhalt gesetzt werden soll.
        var infoID = "info_" + dataID;  // Info Textfeld neben Button.
        var value = $("#" + valueID).val(); // Wert aus Wertfeld auslesen.
        // Alle " durch ' ersetzen, da sonst Probleme an verschiedenen Stellen:
        value = value.replace(/\"/g, "'");
        // Dann noch enocden, damit alles übertragen wird:
        value = encodeURIComponent(value);

        $("#" + infoID).text("Übertrage...");
        $.get('cgi/set.cgi?id=' + dataID + '&value=' + value, function () {
            $("#" + infoID).text("OK!");
            refreshPage(0);
        });
    });

    // Ein Button, bei dessen drücken ein "true" an die ID übertragen wird.
    $(document.body).on("click", "[id^=startProgramButton]", function () {
        var dataID = $(this).data("id");  // Homematic Geräte ID.
        var infoID = "info_" + dataID;  // Info Textfeld neben Button.

        $("#" + infoID).text("Starte...");
        $.get('cgi/startprogram.cgi?id=' + dataID, function () {
            $("#" + infoID).text("OK!");
        });
    });

    $(document.body).on("change", ":file", function () {
        var file = this.files[0];

        if (file.name.length < 1) {
        } else if (file.type !== 'image/png' && file.type !== 'image/jpg' && !file.type !== 'image/gif' && file.type !== 'image/jpeg') {
            //TODO alert ist nicht schön... muss noch ersetzt werden
            $.mobile.alert("Es können nur JPG, GIF oder PNG hochgeladen werden!");
        } else {
            var id = $(this).attr('id');
            var key = id.substr(4, id.length);
            $("#uploadPicture" + key).removeClass("ui-state-disabled");
        }
    });

    $(document.body).on("click", 'a[name=uploadPicture]', function () {
        var id = $(this).attr('id');
        var key = id.substr(13, id.length);
        var type = $(this).data('type');

        var formData = new FormData();

        var file = document.getElementById('file' + key).files[0];
        var reader = new FileReader();
        reader.onloadend = function () {
            var tempImg = new Image();
            tempImg.src = reader.result;
            tempImg.onload = function () {
                var MAX_WIDTH = 160;
                var MAX_HEIGHT = 160;
                var tempW = tempImg.width;
                var tempH = tempImg.height;
                if (tempW > tempH) {
                    if (tempW > MAX_WIDTH) {
                        tempH *= MAX_WIDTH / tempW;
                        tempW = MAX_WIDTH;
                    }
                } else {
                    if (tempH > MAX_HEIGHT) {
                        tempW *= MAX_HEIGHT / tempH;
                        tempH = MAX_HEIGHT;
                    }
                }

                var canvas = document.createElement('canvas');
                canvas.width = tempW;
                canvas.height = tempH;

                var ctx = canvas.getContext("2d");
                ctx.drawImage(this, 0, 0, tempW, tempH);
                var dataURL = canvas.toDataURL("image/png");

                var image_data = atob(dataURL.split(',')[1]);
                var arraybuffer = new ArrayBuffer(image_data.length);
                var view = new Uint8Array(arraybuffer);
                for (var i = 0; i < image_data.length; i++) {
                    view[i] = image_data.charCodeAt(i) & 0xff;
                }
                var blob;
                try {
                    blob = new Blob([arraybuffer], {type: 'image/png'});
                } catch (e) {
                    var bb = new (window.WebKitBlobBuilder || window.MozBlobBuilder);
                    bb.append(arraybuffer);
                    blob = bb.getBlob('image/png');
                }

                $("#img" + key).fadeOut(500, function () {
                    $("#img" + key).attr("src", dataURL).fadeIn(1000);
                });

                $("#menuImg" + key).fadeOut(500, function () {
                    $("#menuImg" + key).attr("src", dataURL).fadeIn(1000);
                });

                formData.append('file', blob, key + '.png');
                formData.append('filename', key + '.png');
                formData.append('path', '/usr/local/etc/config/addons/www/webmatic_user/img/ids/' + type + '/');

                $.ajax({
                    url: 'cgi/upload.cgi', //server script to process data
                    type: 'POST',
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false
                }, 'json');

            };
            $("#uploadPicture" + key).addClass("ui-state-disabled");
        };
        reader.readAsDataURL(file);
    });

});