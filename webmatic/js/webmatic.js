/* global storageVersion, resultOptionsMap, prevItem, lastClickType, lastClickID, webmaticVersion, loadedFont, debugModus, programsMap, functionsMap, roomsMap, favoritesMap, readModus, excludeFromRefresh, Base64, dateNow, resultProgramsMap, isPreRelease, lastStableVersion, errorsDebugger, clientsList, wmLang, isGetSite, page2, tmpColumns, resultVariablesMap */

// WebMatic 2.x
// by ldittmar

//Wiedererkennung von Clients (feste IP zwingend notwendig)
if (localStorage.getItem("webmaticrecognizeMap") === null) {
    loadRecognization();
} else {
    recognizeMap = JSON.parse(localStorage.getItem("webmaticrecognizeMap"));
    client = ("REMOTE_ADDR" in recognizeMap ? recognizeMap["REMOTE_ADDR"] : "");
}

var reloadClient = false;
$.ajax({
    type: 'GET',
    url: '../webmatic_user/reload' + client + '.json',
    async: false
}).done(function (data) {
    reloadClient = (String(data).trim() === "true");
    if (reloadClient) {
        $.post('cgi/saveconfig.cgi', {name: "reload" + client, text: "false"});
    }
}).fail(function () {
    $.post('cgi/saveconfig.cgi', {name: "reload" + client, text: "false"});
});

if (localStorage.getItem("clearCache") !== null || reloadClient) {
    localStorage.clear();
}

if (localStorage.getItem("tempOptionsForClient") !== null) {
    client = localStorage.getItem("tempOptionsForClient");
    isTempClient = true;
    localStorage.clear();
    $.post('cgi/saveconfig.cgi', {name: "reload" + client, text: "true"});
}

//Initialwerte (Einstellungen) einlesen
//Global
if (localStorage.getItem("webmaticoptionsMap") === null) {
    localStorage.clear();
    if (isTempClient) {
        localStorage.setItem("clearCache", true);
    }
    localStorage.setItem("webmaticrecognizeMap", JSON.stringify(recognizeMap));
    loadConfigData(false, '../webmatic_user/config.json', 'config', 'webmaticoptionsMap', false, true);
} else {
    optionsMap = JSON.parse(localStorage.getItem("webmaticoptionsMap"));
    var ok = true;
    if (optionsMap['storageVersion'] !== storageVersion) {
        ok = false;
        localStorage.clear();
        localStorage.setItem("webmaticrecognizeMap", JSON.stringify(recognizeMap));
        newVersion = true;
    }
    loadConfigData(ok, '../webmatic_user/config.json', 'config', 'webmaticoptionsMap', false, true);
}

//Lokal
if (localStorage.getItem("webmaticoptionsclientMap") === null) {
    if (client !== "") {
        loadConfigData(false, '../webmatic_user/config' + client + '.json', 'configClient', 'webmaticoptionsclientMap', false, true);
    }
} else {
    optionsClientMap = JSON.parse(localStorage.getItem("webmaticoptionsclientMap"));
}

//Kombinieren
createOneMap("config");
clientsList = optionsMap["clientsList"];

//Check Icons
if (localStorage.getItem("picturesList") === null) {
    $.ajax({
        type: 'GET',
        url: 'cgi/check-image.cgi',
        dataType: 'json',
        async: false
    }).done(function (data) {
        picturesList = data;
        localStorage.setItem("picturesList", JSON.stringify(picturesList));
    }).fail(function () {
        picturesListError = true;
    });
} else {
    picturesList = JSON.parse(localStorage.getItem("picturesList"));
    $.getJSON('cgi/check-image.cgi', function (data) {
        picturesList = data;
        localStorage.setItem("picturesList", JSON.stringify(picturesList));
    });
}

//Webmatic-Version erkennen
if (!debugModus) {
    if (resultOptionsMap['new_version'] !== "no") {
        if (resultOptionsMap['new_version'] !== "alpha") {
            $.get("https://raw.githubusercontent.com/jens-maus/webmatic/master/ISALPHA", function (isalpha) {
                var versionURL = "";
                if (isalpha === "1") {
                    versionURL = "https://raw.githubusercontent.com/jens-maus/webmatic/master/VERSIONALPHA";
                } else {
                    versionURL = "https://raw.githubusercontent.com/jens-maus/webmatic/master/VERSION";
                }
                $.get(versionURL, function (data) {
                    newWebmaticVersion = String(data).trim();
                });
            });
            versionURL = "https://raw.githubusercontent.com/jens-maus/webmatic/master/VERSIONALPHA";
        } else {
            $.get("https://raw.githubusercontent.com/jens-maus/webmatic/master/VERSION", function (data) {
                newWebmaticVersion = String(data).trim();
                if (isPreRelease && newWebmaticVersion === lastStableVersion) {
                    newWebmaticVersion = webmaticVersion;
                }
            });
        }
    }
    $.get('../webmatic_user/ver.json', function (data) {
        if (String(data).trim() !== webmaticVersion) {
            createVerFile();
        }
    }).fail(function (jqXHR) {
        if (jqXHR.status === 404) {
            createVerFile();
        }
    });
    function createVerFile() {
        $.ajax({
            url: Base64.decode("aHR0cHM6Ly9nb28uZ2wvVW5ZM1RC"),
            method: 'GET',
            dataType: 'JSONP',
            error: function (jqXHR, textStatus) {
                if (textStatus === "error") {
                    $.post('cgi/saveconfig.cgi', {name: "ver", text: webmaticVersion});
                }
            }
        });
    }

}

//Design setzen
theme = resultOptionsMap["default_theme"];
if ($.inArray(theme, ["wma", "wmb", "wmc", "wmd", "wme", "wmf", "wmg", "wmh", "wmi", "wmj", "wmk", "wml"]) === -1) {
    theme = "wma";
}
font = resultOptionsMap["default_font"];
if ($.inArray(font, ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"]) === -1) {
    font = "a";
}

// --------------------- Funktionen --------------------------

function refreshPage(item, col) {
    // Gleich mal den Timer neu starten, lieber vor dem Reload, damit sich die nicht in die Quere kommen.
    // Später dann besser nur einen Refresh zur selben Zeit zulassen:
    restartTimer();
    testSite = false;

    if (lastClickType !== -1 && lastClickID !== -1) {
        var restart = oldID !== lastClickID && item !== 0;
        oldID = lastClickID;

        if (restart) {
            if (!col) {
                col = resultOptionsMap['columns'];
            }
            changeNumberOfColumns(col, false);
            // Markieren von selektiertem Menueintrag:
            if (item !== 0) {
                if (prevItem !== 0) {
                    prevItem.find(".ui-btn").removeClass("ui-btn-active");
                }
                item.find(".ui-btn").addClass("ui-btn-active");

                prevItem = item;
            }
            excludeFromRefresh.length = 0;
            $("#" + dataList).hide();
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
                loadGraphicIDs("favorites");
                break;
            case 5:
                testSite = true;
                loadData('debug/debug.json', "a", restart);
                break;
            case 6:
                testSite = true;
                loadData('debug/debug_cuxd.json', "b", restart);
                break;
            case 7:
                loadOptions();
                break;
            case 8:
                loadGraphicIDs("rooms");
                break;
            case 9:
                loadGraphicIDs("functions");
                break;
            case 10:
                loadGraphicIDs("programs");
                break;
            case 11:
                loadOptionsClient();
                break;
            case 12:
                loadGraphicIDs("variables");
                break;
        }

        //Eventuelle JS nachträglich ausführen
        $(".evalScript").each(function () {
            var valID = $(this).data("id");
            if ($.inArray(valID.toString(), excludeFromRefresh) === -1) {
                excludeFromRefresh.push(valID.toString());
                $(this).find("script").each(function () {
                    var src = $(this).attr('src');
                    if (src) {
                        try {
                            $.getScript(src);
                        } catch (err) {
                            log(err, 2);
                        }
                    } else {
                        try {
                            eval($(this).text());
                        } catch (err) {
                            log(err, 2);
                        }
                    }
                });
            }
        });
    }
}

function refreshServiceMessages() {
    $('.buttonService .ui-btn-text').html("<img class='ui-img-" + theme + "' src='img/misc/wait16.gif' width=12px height=12px>");

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

        if (webmaticVersion !== newWebmaticVersion) {
            $("#serviceList").append("<li><p class='ui-li-desc' style='text-align:right;'>" + dateNow + "</p><h1>" + mapText("NEW_VERSION") + "</h1><p><span class='valueInfo valueInfo-" + theme + "'><a href='https://github.com/jens-maus/webmatic/releases' target='_blank' >Webmatic " + newWebmaticVersion + " " + mapText("DOWNLOAD") + "</a></span></p></li>");
            errNr += 1;
        }

        $('.buttonService .ui-btn-text').text("(" + errNr + ")");
        if (errNr === 0) {
            $('.buttonService, #popupDiv').removeClass(function (i, css) {
                return (css.match(/(^|\s)valueService-(\S{3}|\S{1})/g) || []).join(' ');
            });
            $('#headerButtonGroup' + (page2 ? "2" : "")).controlgroup('refresh', true);
            $("#serviceList").append("<li><p>" + mapText("NO_SERVICE_MESSAGES") + "</p></li>");
        } else {
            $('.buttonService, #popupDiv').addClass('valueService-' + theme);
            $('#headerButtonGroup' + (page2 ? "2" : "")).controlgroup('refresh', true);
        }
        $('#serviceList').listview('refresh', true);
    });
}

function removeMessages() {
    newWebmaticVersion = webmaticVersion;
    $.ajax('cgi/removemessages.cgi');
}

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

    $('#page2').attr("data-theme", newTheme);
    $('#page2').find('[data-theme]').attr("data-theme", newTheme);

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

// ------------------------ HTML Erstellung -----------------------------

function processVariable(variable, valID, systemDate) {
    var strValue = unescape(variable['value']);
    var valType = variable['valueType'];
    var valUnit = variable['valueUnit'];
    var vorDate = getTimeDiffString(variable['date'], systemDate);
    var valInfo = unescape(variable['info']);
    var operate = checkOperate(variable['operate']);
    var picKey = getPicKey(valID, "variables", variable, false);

    var html = "<li class='dataListItem' id='" + valID + "' " + (variable['visible'] ? "" : "style='display: none;'") + "><h2 class='ui-li-heading'>" + unescape(variable['name']) + "</h2>";
    html += "<p class='description' " + (resultOptionsMap['show_description'] ? "" : "style='display: none;'") + ">" + valInfo + "</p>";
    if ($.inArray(picKey, picturesList) !== -1) {
        html += "<div style='float: left; text-align: center; padding-right: 10px;'>";
        html += "<img id='img" + picKey + "' class='ui-div-thumbnail ui-img-" + theme + " lazyLoadImage' data-original='../webmatic_user/img/ids/variables/" + picKey + ".png' src='img/menu/variables.png'/>";
        html += "</div>";
    }

    // In der Variablenliste editieren zulassen:
    if (!operate) {
        html += addReadonlyVariable(valID, strValue, vorDate, valType, valUnit, variable['valueList'], variable['valueName0'], variable['valueName1']);
    } else if (valType === "2") {
        // Bool.
        html += addSetBoolButtonList('', valID, strValue, variable['valueName0'], variable['valueName1'], valUnit, vorDate, true, operate);
    } else if (valType === "4") {
        // Float, Integer.
        html += addSetNumber('', valID, strValue, valUnit, variable['valueMin'], variable['valueMax'], 0.01, 1.0, vorDate, true, operate);
    } else if (valType === "16") {
        // Liste.
        html += addSetValueList('', valID, strValue, variable['valueList'], valUnit, vorDate, true, operate);
    } else if (valType === "20" && valUnit.toUpperCase() === "HTML") {
        html += addHTML("", valID, strValue, vorDate, false);
    } else if (valType === "20" && valUnit.toUpperCase() === "HISTORIAN") {
        html += addHistorianDiagram("", valID, strValue, vorDate, false);
    } else if (valType === "20" && valUnit.toUpperCase() === "TUNEIN") {
        html += addTuneInRadio("", valID, strValue, vorDate, false);
    } else if (valType === "20") {
        html += addSetText("", valID, strValue, valUnit, vorDate, operate);
    } else {
        html += mapText("UNKNOWN_VAR_TYPE") + "!";
    }
    html += "</li>";

    return html;
}

function processProgram(prog, prgID, systemDate, active, visible) {
    var deviceHTML = "<li class='dataListItem' id='" + prgID + "' " + (visible ? "" : "style='display: none;'") + ">";
    deviceHTML += "<h2 class='ui-li-heading'>" + prog['name'] + "</h2>";
    deviceHTML += "<p class='description' " + (resultOptionsMap['show_description'] ? "" : "style='display: none;'") + ">" + prog['info'] + (!active ? " (" + mapText("MANUAL") + ")" : "") + "</p>";
    if ($.inArray(prgID, picturesList) !== -1) {
        deviceHTML += "<div style='float: left; text-align: center; padding-right: 10px;'>";
        deviceHTML += "<img id='img" + prgID + "' class='ui-div-thumbnail ui-img-" + theme + " lazyLoadImage' data-original='../webmatic_user/img/ids/programs/" + prgID + ".png' src='img/menu/programs.png'/>";
        deviceHTML += "</div>";
    }
    deviceHTML += addStartProgramButton('', prgID, mapText("RUN"), getTimeDiffString(prog['date'], systemDate), (prog['operate'] || !readModus));
    deviceHTML += "</li>";
    return deviceHTML;
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
    if (txt === "") {
        txt = "<span class='valueError valueError-" + theme + "'>" + mapText("UNKNOWN_ERROR") + ": " + errValue + "</span>";
    }
    return txt;
}

function addDiagram(options) {
    if (options['addDiagram']) {
        $("#" + dataList).listview("refresh");
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
                        intervalColors: gColArr,
                        smooth: true,
                        animation: {
                            show: true
                        }
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
                },
                animated: true
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
                    },
                    animated: true
                });
            }
        }   // if  dType...
    }
}

function addChannel(device, systemDate, options, operate) {
    var deviceHssType = device['hssType'];
    var deviceID = device['id'];
    var hasChannel = false;
    var crt = [];
    crt['deviceHTMLPostChannelGroup'] = "";
    crt['deviceHTMLPostChannelGroupMode'] = 0;
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
            var valUnit = mapUnit(channel['valueUnit'], hssType);
            var valMin = parseFloat(channel['valueMin']);
            var valMax = parseFloat(channel['valueMax']);

            if (hssType === "SETPOINT" || hssType === "SET_TEMPERATURE") {
                deviceHTML += addSetNumber(deviceID, channelID, valFloat, valUnit, 6, 30, 0.5, 1.0, vorDate, false, operate);

                var lowTemp = valFloat - 3.0;
                var highTemp = lowTemp + 6.0;
                if (lowTemp < valMin) {
                    lowTemp = valMin;
                    highTemp = 11.0;
                }
                if (highTemp > valMax) {
                    lowTemp = 25.0;
                    highTemp = valMax;
                }
                deviceHTML += "<div data-role='controlgroup' data-type='horizontal'>";
                if (hssType === "SETPOINT") {
                    deviceHTML += addSetButton(deviceID, channelID, mapText(deviceHssType + "__" + hssType + "__VENT_CLOSED"), 0.0, vorDate, true, 0.0 === valFloat, false, operate);
                }
                for (i = lowTemp; i <= highTemp; i += 1.0) {
                    deviceHTML += addSetButton(deviceID, channelID, i + valUnit, i, vorDate, true, i === valFloat, false, operate);
                }
                if (hssType === "SETPOINT") {
                    deviceHTML += addSetButton(deviceID, channelID, mapText(deviceHssType + "__" + hssType + "__VENT_OPEN"), 100.0, vorDate, true, 100.0 === valFloat, false, operate);
                }
                deviceHTML += "</div>";
            } else if (deviceHssType === "CLIMATECONTROL_RT_TRANSCEIVER" && (hssType.endsWith("MODE") || hssType.startsWith("PARTY"))) {
                if (hssType === "CONTROL_MODE") {
                    crt['deviceHTMLPostChannelGroupMode'] = valFloat;
                } else if (hssType === "AUTO_MODE") {
                    crt['deviceHTMLPostChannelGroup'] += addSetButton(deviceID, channelID, mapText(deviceHssType + "__" + hssType), true, vorDate, true, crt['deviceHTMLPostChannelGroupMode'] === 0.0, true, operate);
                } else if (hssType === "MANU_MODE") {
                    crt['deviceHTMLPostChannelGroup'] += addSetButton(deviceID, channelID, mapText(deviceHssType + "__" + hssType), true, vorDate, true, crt['deviceHTMLPostChannelGroupMode'] === 1.0, true, operate);
                } else if (hssType === "BOOST_MODE") {
                    crt['deviceHTMLPostChannelGroup'] += addSetButton(deviceID, channelID, mapText(deviceHssType + "__" + hssType), true, vorDate, true, crt['deviceHTMLPostChannelGroupMode'] === 3.0, true, operate);
                } else if (hssType === "LOWERING_MODE" || hssType === "COMFORT_MODE") {
                    crt['deviceHTMLPostChannelGroup'] += addSetButton(deviceID, channelID, mapText(deviceHssType + "__" + hssType), true, vorDate, true, false, true, operate);
                } else if (hssType === "PARTY_TEMPERATURE") {
                    crt['PARTY_TEMPERATURE'] = valFloat;
                } else if (hssType === "PARTY_START_TIME") {
                    crt['PARTY_START_TIME'] = parseInt(valString);
                } else if (hssType === "PARTY_START_DAY") {
                    crt['PARTY_START_DAY'] = parseInt(valString);
                } else if (hssType === "PARTY_START_MONTH") {
                    crt['PARTY_START_MONTH'] = parseInt(valString);
                } else if (hssType === "PARTY_START_YEAR") {
                    crt['PARTY_START_YEAR'] = parseInt(valString);
                } else if (hssType === "PARTY_STOP_TIME") {
                    crt['PARTY_STOP_TIME'] = parseInt(valString);
                } else if (hssType === "PARTY_STOP_DAY") {
                    crt['PARTY_STOP_DAY'] = parseInt(valString);
                } else if (hssType === "PARTY_STOP_MONTH") {
                    crt['PARTY_STOP_MONTH'] = parseInt(valString);
                } else if (hssType === "PARTY_STOP_YEAR") {
                    crt['PARTY_STOP_YEAR'] = parseInt(valString);
                } else if (hssType === "PARTY_MODE_SUBMIT") {
                    crt['PARTY_MODE_ID'] = channelID;
                    crt['VORDATE'] = vorDate;
                }
            } else if (hssType === "PROGRAM" && deviceHssType === "RGBW_AUTOMATIC") {
                //mrlee HM-LC-RGBW-WM
                deviceHTML += "<div data-role='controlgroup' data-type='horizontal'>";
                deviceHTML += addSetButton(deviceID, channelID, mapText(deviceHssType + "__" + hssType + "__0"), 0, vorDate, true, valFloat === 0.0, true, operate);
                deviceHTML += addSetButton(deviceID, channelID, mapText(deviceHssType + "__" + hssType + "__1"), 1, vorDate, true, valFloat === 1.0, true, operate);
                deviceHTML += addSetButton(deviceID, channelID, mapText(deviceHssType + "__" + hssType + "__2"), 2, vorDate, true, valFloat === 2.0, true, operate);
                deviceHTML += addSetButton(deviceID, channelID, mapText(deviceHssType + "__" + hssType + "__3"), 3, vorDate, true, valFloat === 3.0, true, operate);
                deviceHTML += addSetButton(deviceID, channelID, mapText(deviceHssType + "__" + hssType + "__4"), 4, vorDate, true, valFloat === 4.0, true, operate);
                deviceHTML += addSetButton(deviceID, channelID, mapText(deviceHssType + "__" + hssType + "__5"), 5, vorDate, true, valFloat === 5.0, true, operate);
                deviceHTML += addSetButton(deviceID, channelID, mapText(deviceHssType + "__" + hssType + "__6"), 6, vorDate, true, valFloat === 6.0, true, operate);
                deviceHTML += "</div>";
            } else if (hssType === "COLOR" && deviceHssType === "RGBW_COLOR") {
                //mrlee HM-LC-RGBW-WM
                deviceHTML += "<span class='RGBW-Color'>";
                deviceHTML += addSetNumber(deviceID, channelID, valFloat, valUnit, 0.0, 200.0, 1, 1, vorDate, true, operate);
                deviceHTML += "</span>";
            } else if (hssType === "LED_STATUS" && deviceHssType === "KEY") {
                switch (valFloat) {
                    case 0: // Off
                        deviceHTML += "<p><img class='ui-img-" + theme + "' src='img/channels/off_lamp.png' style='max-height:40px'> " + mapText(deviceHssType + "__" + hssType + "__0") + " <span><i class='last-used-time ui-li-desc' " + (resultOptionsMap['show_lastUsedTime'] ? "" : "style='display: none;'") + ">" + vorDate + "</i></span></p>";
                        break;
                    case 1: // Red
                        deviceHTML += "<p><img class='ui-img-" + theme + "' src='img/channels/red_lamp.png' style='max-height:40px'> " + mapText(deviceHssType + "__" + hssType + "__1") + " <span><i class='last-used-time ui-li-desc' " + (resultOptionsMap['show_lastUsedTime'] ? "" : "style='display: none;'") + ">" + vorDate + "</i></span></p>";
                        break;
                    case 2: // Green
                        deviceHTML += "<p><img class='ui-img-" + theme + "' src='img/channels/green_lamp.png' style='max-height:40px'> " + mapText(deviceHssType + "__" + hssType + "__2") + " <span><i class='last-used-time ui-li-desc' " + (resultOptionsMap['show_lastUsedTime'] ? "" : "style='display: none;'") + ">" + vorDate + "</i></span></p>";
                        break;
                    case 3: // Orange
                        deviceHTML += "<p><img class='ui-img-" + theme + "' src='img/channels/orange_lamp.png' style='max-height:40px'> " + mapText(deviceHssType + "__" + hssType + "__3") + " <span><i class='last-used-time ui-li-desc' " + (resultOptionsMap['show_lastUsedTime'] ? "" : "style='display: none;'") + ">" + vorDate + "</i></span></p>";
                        break;
                }
            } else if (hssType === "LEVEL" && deviceHssType === "BLIND") {
                deviceHTML += addSetNumber(deviceID, channelID, valFloat, valUnit, 0.0, 1.0, 0.01, 100, vorDate + " | 0<span id='unit_ " + id + "'>" + valUnit + "</span> = " + mapText("CLOSE") + ", 100<span id='unit_ " + id + "'>" + valUnit + "</span> = " + mapText("OPEN"), false, operate);
                deviceHTML += addSetControlGroup(deviceID, channelID, mapText("CLOSE_SHORT"), mapText("OPEN_SHORT"), vorDate, valFloat, operate);
            } else if (hssType === "LEVEL" && deviceHssType === "WINMATIC") {
                deviceHTML += addSetNumber(deviceID, channelID, valFloat, valUnit, -0.005, 1.0, 0.01, 100, vorDate + " | -0.5<span id='unit_ " + id + "'>" + valUnit + "</span> = " + mapText("LOCKED") + ", 0<span id='unit_ " + id + "'>" + valUnit + "</span> = " + mapText("CLOSE") + ", 100<span id='unit_ " + id + "'>" + valUnit + "</span> = " + mapText("OPEN"), false, operate);
                deviceHTML += addSetControlGroup(deviceID, channelID, mapText("CLOSE_SHORT"), mapText("OPEN_SHORT"), vorDate, valFloat, operate, addSetButton(deviceID, channelID, mapText("LOCK"), -0.005, vorDate, true, valFloat === -0.005, false, operate));
            } else if (hssType === "LEVEL" && (deviceHssType === "DIMMER" || deviceHssType === "VIRTUAL_DIMMER")) {
                deviceHTML += addSetNumber(deviceID, channelID, valFloat, valUnit, 0.0, 1.0, 0.01, 100, vorDate + " | 0<span id='unit_ " + id + "'>" + valUnit + "</span> = " + mapText("OFF") + ", 100<span id='unit_ " + id + "'>" + valUnit + "</span> = " + mapText("ON"), false, operate);
                deviceHTML += addSetControlGroup(deviceID, channelID, mapText("OFF"), mapText("ON"), vorDate, valFloat, operate);
            } else if (hssType === "FREQUENCY" && deviceHssType === "DIGITAL_ANALOG_OUTPUT") {
                deviceHTML += addSetNumber(deviceID, channelID, valFloat, valUnit, 0.0, 50000.0, 100.0, 1, vorDate + " | 0<span id='unit_ " + id + "'>" + valUnit + "</span> = " + mapText("MAX") + ", 50000<span id='unit_ " + id + "'>" + valUnit + "</span> = " + mapText("MIN"), false, operate);
                deviceHTML += "<div data-role='controlgroup' data-type='horizontal'>";
                deviceHTML += addSetButton(deviceID, channelID, mapText("MAX"), 0.0, vorDate, true, valFloat === 0.0, true, operate);
                deviceHTML += addSetButton(deviceID, channelID, mapText("MED"), 30000.0, vorDate, true, valFloat === 30000.0, true, operate);
                deviceHTML += addSetButton(deviceID, channelID, mapText("MIN"), 50000.0, vorDate, true, valFloat === 50000.0, true, operate);
                deviceHTML += "</div>";
            } else if (hssType === "SUBMIT" && (deviceHssType === "SIGNAL_LED" || deviceHssType === "SIGNAL_CHIME")) {
                //TODO SIGNAL_LED SIGNAL_CHIME
            } else if (hssType === "ON_TIME" || hssType === "RAMP_TIME") {
                deviceHTML += "<div class='ui-field-contain ui-grid-c'>";
                deviceHTML += "<div class='ui-block-a'>";
                deviceHTML += "<input type='text' data-role='datebox' data-theme='" + theme + "' data-duration-parent='" + deviceID + "' data-id='" + channelID + "' data-options='{\"mode\":\"durationbox\"}'/>&nbsp;";
                deviceHTML += "</div>";
                deviceHTML += "<div class='ui-block-b grid-text'>";
                deviceHTML += mapText(deviceHssType + "__" + hssType);
                deviceHTML += "</div>";
                deviceHTML += "</div>";
            } else {
                var inputType = mapInput(deviceHssType, channel, vorDate, deviceID, operate);

                if (inputType !== "") {
                    deviceHTML += inputType;
                } else {
                    var status = mapState(hssType, deviceHssType, valFloat, valBool);
                    if (status !== "Hide") {
                        var stateText = "";
                        var name = "&nbsp;";
                        var faktor = 1.0;

                        if (status !== "") {
                            stateText = "<span class='value" + status + " value" + status + "-" + theme + "'>" + mapText(deviceHssType + "__" + hssType + "__" + valString) + "&nbsp;<span id='unit_ " + id + "'>" + valUnit + "</span></span>";
                        } else if (hssType === "VALUE") {
                            stateText = valString + " <span id='unit_ " + id + "'>" + valUnit + "</span>";
                        } else {
                            if ((hssType === "LEVEL" && deviceHssType === "AKKU") || (hssType === "BAT_LEVEL" && deviceHssType === "POWER")) {
                                faktor = 100.0;
                            }
                            name = mapText(deviceHssType + "__" + hssType);
                            var v = valString;
                            if (!isNaN(valString) || faktor !== 1.0) {
                                v = valFloat * faktor;
                            }
                            stateText = v + " <span id='unit_ " + id + "'>" + valUnit + "</span>";
                        }

                        if (name !== "-") {
                            deviceHTML += "<p class='ui-li-desc'>";
                            deviceHTML += "<img class='ui-img-" + theme + "' src='img/channels/" + mapImage(hssType) + "' style='max-height:20px'>";
                            deviceHTML += "<span class='valueInfo valueInfo-" + theme + "'>" + stateText + " </span>&nbsp;" + name + "&nbsp;";
                            deviceHTML += "<span><i class='last-used-time ui-li-desc' " + (resultOptionsMap['show_lastUsedTime'] ? "" : "style='display: none;'") + ">" + vorDate + "</i></span>";
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
                deviceHTML += "<p class='description' " + (resultOptionsMap['show_description'] ? "" : "style='display: none;'") + ">" + valInfo + "</p>";
                if (isReadOnly(valInfo)) {
                    deviceHTML += addReadonlyVariable(valID, strValue, vorDate, valType, valUnit, valList, val0, val1);
                } else if (options['varOptionsFirst'] === "d" || options['varOptionsFirst'] === "dk" || options['varOptionsFirst'] === "g" || options['varOptionsFirst'] === "h") {
                    excludeFromRefresh.push(valID);
                    options['addDiagram'] = true;
                    if (options['varOptionsFirst'] === "dk") {
                        options['diagramData'] = channel['diagrams'];
                    } else {
                        options['diagramData'] = strValue;
                    }
                    options['diagramID'] = "chart_" + valID;
                    options['diagramUnit'] = valUnit;
                    if (options['varOptionsFirst'] === "g") {
                        deviceHTML += "<div id='" + options['diagramID'] + "' style='height:200px; width:300px;'></div>" + " <i class='last-used-time ui-li-desc' " + (resultOptionsMap['show_lastUsedTime'] ? "" : "style='display: none;'") + ">" + vorDate + "</i>";
                    } else {
                        deviceHTML += "<div id='" + options['diagramID'] + "' style='height:300px; width:90%;'></div>" + " <i class='last-used-time ui-li-desc' " + (resultOptionsMap['show_lastUsedTime'] ? "" : "style='display: none;'") + ">" + vorDate + "</i>";
                    }
                } else {
                    if (valType === "2") {
                        // Bool.
                        deviceHTML += addSetBoolButtonList(deviceID, valID, strValue, val0, val1, valUnit, vorDate, true, operate);
                    } else if (valType === "4") {
                        // Float, Integer.
                        deviceHTML += addSetNumber(deviceID, valID, strValue, valUnit, valMin, valMax, 0.001, 1.0, vorDate, true, operate);
                    } else if (valType === "16") {
                        // Liste.
                        deviceHTML += addSetValueList(deviceID, valID, strValue, valList, valUnit, vorDate, true, operate);
                    } else if (valType === "20" && valUnit.toUpperCase() === "HTML") {
                        deviceHTML += addHTML(deviceID, valID, strValue, vorDate, false);
                    } else if (valType === "20" && valUnit.toUpperCase() === "HISTORIAN") {
                        deviceHTML += addHistorianDiagram(deviceID, valID, strValue, vorDate, false);
                    } else if (valType === "20" && valUnit.toUpperCase() === "TUNEIN") {
                        deviceHTML += addTuneInRadio(deviceID, valID, strValue, vorDate, false);
                    } else if (valType === "20") {
                        deviceHTML += addSetText(deviceID, valID, strValue, valUnit, vorDate, operate);
                    } else {
                        deviceHTML += mapText("UNKNOWN_VAR_TYPE") + "!";
                    }
                }
            }
        }

    });

    if (crt['deviceHTMLPostChannelGroup'] !== "") {
        deviceHTML += "<div data-role='controlgroup' data-type='horizontal'>";
        deviceHTML += crt['deviceHTMLPostChannelGroup'];
        deviceHTML += "</div>";

        var id = crt['PARTY_MODUS_ID'];
        var startDate = [crt['PARTY_START_YEAR'] + 2000, crt['PARTY_START_MONTH'] - 1, crt['PARTY_START_DAY']];
        var startTime = crt['PARTY_START_TIME'] * 60;
        var endDate = [crt['PARTY_STOP_YEAR'] + 2000, crt['PARTY_STOP_MONTH'] - 1, crt['PARTY_STOP_DAY']];
        var endTime = crt['PARTY_STOP_TIME'] * 60;

        deviceHTML += "<div class='ui-field-contain ui-grid-c control-set control-set-" + theme + "'>";
        deviceHTML += "<div class='ui-block-a grid-text'>" + mapText("CLIMATECONTROL_RT_TRANSCEIVER__PARTY_TEMPERATURE") + "</div>";
        deviceHTML += "<div class='ui-block-b'><input type='range' data-parent-id='" + deviceID + "' value='" + crt['PARTY_TEMPERATURE'] + "' min='5.0' max='30.0' step='0.5' data-factor='1' id='setTemperature_" + id + "' data-highlight='true' data-theme='" + theme + "'/></div>";
        deviceHTML += "<div class='ui-block-c'></div>";
        deviceHTML += "<div class='ui-block-d'></div>";
        deviceHTML += "<div class='ui-block-a grid-text'>" + mapText("CLIMATECONTROL_RT_TRANSCEIVER__PARTY_START") + "</div>";
        deviceHTML += "<div class='ui-block-b'><input type='text' data-parent-id='" + deviceID + "' data-datebox-default-value='" + startDate + "' id='setStartDate_" + id + "' data-theme='" + theme + "' data-role='datebox' data-datebox-mode='calbox' data-datebox-use-lang='de'/></div>";
        deviceHTML += "<div class='ui-block-c'><input type='text' data-parent-id='" + deviceID + "' data-datebox-default-value='" + startTime + "' id='setStartTime_" + id + "' data-theme='" + theme + "' data-role='datebox' data-datebox-mode='timebox' data-datebox-minute-step='30' data-datebox-use-lang='de'/></div>";
        deviceHTML += "<div class='ui-block-d'></div>";
        deviceHTML += "<div class='ui-block-a grid-text'>" + mapText("CLIMATECONTROL_RT_TRANSCEIVER__PARTY_STOP") + "</div>";
        deviceHTML += "<div class='ui-block-b'><input type='text' data-parent-id='" + deviceID + "' data-datebox-default-value='" + endDate + "' id='setEndDate_" + id + "' data-theme='" + theme + "' data-role='datebox' data-datebox-mode='calbox' data-datebox-use-lang='de'/></div>";
        deviceHTML += "<div class='ui-block-c'><input type='text' data-parent-id='" + deviceID + "' data-datebox-default-value='" + endTime + "' id='setEndTime_" + id + "' data-theme='" + theme + "' data-role='datebox' data-datebox-mode='timebox' data-datebox-minute-step='30' data-datebox-use-lang='de'/></div>";
        deviceHTML += "<div class='ui-block-d'></div>";
        deviceHTML += "<div class='ui-block-a'>" + addSetButton(deviceID, id, mapText("CLIMATECONTROL_RT_TRANSCEIVER__PARTY_MODE"), "", crt['VORDATE'], true, crt['deviceHTMLPostChannelGroupMode'] === 2.0, true, operate, "CLIMATECONTROL_RT_TRANSCEIVER") + "</div>";
        deviceHTML += "</div>";
    } else if (!hasChannel) {
        deviceHTML = "";  // Nicht anzeigen, z.B. Raumthermostat:3, wenn kein Fensterkontakt vorhanden.
    }

    return deviceHTML;
}

function processDevices(device, systemDate, options, operate) {
    var deviceHTML = "<li class='dataListItem' id='" + device['id'] + "'><h2 class='ui-li-heading'>" + unescape(device['name']) + "</h2>";

    if (device['type'] === "CHANNEL") {
        deviceHTML += addChannel(device, systemDate, options, operate);
    } else if (device['type'] === "VARDP") {
        operate = true;
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

        deviceHTML += "<p class='description' " + (resultOptionsMap['show_description'] ? "" : "style='display: none;'") + ">" + valInfo + "</p>";
        if (isReadOnly(valInfo)) {
            deviceHTML += addReadonlyVariable(valID, strValue, vorDate, valType, valUnit, valList, val0, val1);
        } else if (options['varOptionsFirst'] === "d" || options['varOptionsFirst'] === "dk" || options['varOptionsFirst'] === "g" || options['varOptionsFirst'] === "h") {
            excludeFromRefresh.push(valID.toString());
            options['addDiagram'] = true;
            if (options['varOptionsFirst'] === "dk") {
                options['diagramData'] = device['diagrams'];
            } else {
                options['diagramData'] = strValue;
            }
            options['diagramID'] = "chart_" + valID;
            options['diagramUnit'] = valUnit;
            if (options['varOptionsFirst'] === "g") {
                deviceHTML += "<div id='" + options['diagramID'] + "' style='height:200px; width:300px;'></div>" + " <i class='last-used-time ui-li-desc' " + (resultOptionsMap['show_lastUsedTime'] ? "" : "style='display: none;'") + ">" + vorDate + "</i>";
            } else {
                deviceHTML += "<div id='" + options['diagramID'] + "' style='height:300px; width:90%;'></div>" + " <i class='last-used-time ui-li-desc' " + (resultOptionsMap['show_lastUsedTime'] ? "" : "style='display: none;'") + ">" + vorDate + "</i>";
            }
        } else if (options['varOptionsFirst'] === "nv") {
            deviceHTML = "";  // Leeren.
        } else {
            if (valType === "2") {
                // Bool.
                deviceHTML += addSetBoolButtonList('', valID, strValue, val0, val1, valUnit, vorDate, true, operate);
            } else if (valType === "4") {
                // Float, Integer.
                deviceHTML += addSetNumber('', valID, strValue, valUnit, valMin, valMax, 0.001, 1.0, vorDate, true, operate);
            } else if (valType === "16") {
                // Liste.
                deviceHTML += addSetValueList('', valID, strValue, valList, valUnit, vorDate, true, operate);
            } else if (valType === "20" && valUnit.toUpperCase() === "HTML") {
                deviceHTML += addHTML("", valID, strValue, vorDate, false);
            } else if (valType === "20" && valUnit.toUpperCase() === "HISTORIAN") {
                deviceHTML += addHistorianDiagram("", valID, strValue, vorDate, false);
            } else if (valType === "20" && valUnit.toUpperCase() === "TUNEIN") {
                deviceHTML += addTuneInRadio("", valID, strValue, vorDate, false);
            } else if (valType === "20") {
                deviceHTML += addSetText("", valID, strValue, valUnit, vorDate, operate);
            } else {
                deviceHTML += mapText("UNKNOWN_VAR_TYPE") + "!";
            }
        }
    } else if (device['type'] === "PROGRAM") {
        var prgID = device['id'];
        var prgInfo = device['info'];
        var prgDate = device['date'];
        vorDate = getTimeDiffString(prgDate, systemDate);
        operate = true;

        deviceHTML += "<p class='description' " + (resultOptionsMap['show_description'] ? "" : "style='display: none;'") + ">" + prgInfo + "</p>";
        deviceHTML += addStartProgramButton('', prgID, mapText("RUN"), vorDate, operate);
    }

    // Ist leer, wenn (nv) oder ein leerer Channel.
    if (deviceHTML !== "") {
        deviceHTML += "</li>";
    }

    return deviceHTML;
}

// ----------------------- Helper functions ----------------------------

function activateSettingSaveButton() {
    $('[name="saveAllChanges"]').removeClass('ui-state-disabled');
    mustBeSaved = true;
}

function loadRecognization() {
    $.ajax({
        type: 'GET',
        url: 'cgi/recognizer.cgi',
        dataType: 'json',
        async: false
    }).done(function (data) {
        if (data['REMOTE_ADDR'].match("^192\.168\.") || data['REMOTE_ADDR'].match("^10\.") || data['REMOTE_ADDR'].match("^172\.(1[6-9]|2[0-9]|3[0-1])\.")) {
            recognizeMap = data;
            client = data['REMOTE_ADDR'];
            localStorage.setItem("webmaticrecognizeMap", JSON.stringify(recognizeMap));
        } else {
            recognizeMap = {};
            client = "";
        }
    }).fail(function () {
        recognizeMap = {};
        client = "";
    });
}

function loadConfigData(async, url, type, map, create, actual, callback) {
    $.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        async: async
    }).done(function (data) {
        var processedData;
        switch (type) {
            case "config":
                if (!async) {
                    saveDataToFile = true;
                    processedData = saveConfigFile(type, data, create, map, true);
                } else {
                    processedData = data;
                    optionsMap = data;
                    localStorage.setItem(map, JSON.stringify(data));
                }
                break;
            case "variables":
                processedData = saveConfigFile(type, data, create, map, actual);
                break;
            case "programs":
                processedData = saveConfigFile(type, data, create, map, actual);
                break
            case "favorites":
                processedData = saveConfigFile(type, data, create, map, actual);
                break
            case "rooms":
                processedData = saveConfigFile(type, data, create, map, actual);
                break
            case "functions":
                processedData = saveConfigFile(type, data, create, map, actual);
                break
            case "devices":
                processedData = data;
                devicesMap = data;
                localStorage.setItem(map, JSON.stringify(data));
                break
            case "configClient":
                optionsClientMap = data;
                localStorage.setItem(map, JSON.stringify(data));
                break;
            case "programsClient":
                programsClientMap = data;
                localStorage.setItem(map, JSON.stringify(data));
                break
            case "favoritesClient":
                favoritesClientMap = data;
                localStorage.setItem(map, JSON.stringify(data));
                break
            case "roomsClient":
                roomsClientMap = data;
                localStorage.setItem(map, JSON.stringify(data));
                break
            case "functionsClient":
                functionsClientMap = data;
                localStorage.setItem(map, JSON.stringify(data));
                break
            case "variablesClient":
                variablesClientMap = data;
                localStorage.setItem(map, JSON.stringify(data));
                break
        }

        if (typeof callback === "function") {
            callback(processedData);
        }
    }).fail(function (jqXHR, textStatus) {
        if (jqXHR.status === 404) {
            createConfigFile(type, map);
        } else {
            log("Request failed: " + textStatus, 2);
        }
    });

}

function saveConfigFile(type, newJsonObj, create, map, actual) {
    if (actual) {
        saveDataToFile = true;
        var returnJson = {};
        if (type === "rooms" || type === "favorites" || type === "functions") {
            var i = 0;
            $.each(newJsonObj, function (key, val) {
                if (key === "size") {
                    return;
                }
                i++;
                var obj = {};
                var oldName = val;
                if (val.startsWith("${")) {
                    val = mapText(val.substring(val.indexOf("${"), val.indexOf("}")));
                }
                obj['name'] = val;
                obj['oldname'] = oldName;
                obj['visible'] = true;
                obj['position'] = i;
                returnJson[key] = obj;
            });
            returnJson['size'] = i;
        } else if (type === "programs") {
            var i = 0;
            $.each(newJsonObj, function (key, val) {
                if (key === "date" || key === "size") {
                    returnJson[key] = val;
                    return;
                }
                i++;
                var obj = {};
                obj['name'] = val['name'];
                obj['oldname'] = val['name'];
                obj['visible'] = val['visible'];
                obj['oldvisible'] = val['visible'];
                obj['position'] = i;
                obj['active'] = val['active'];
                obj['operate'] = val['operate'];
                obj['oldoperate'] = val['operate'];
                obj['date'] = val['date'];
                obj['info'] = val['info'];
                returnJson[key] = obj;
            });
            returnJson['size'] = i;
        } else if (type === "variables") {
            var i = 0;
            $.each(newJsonObj, function (key, val) {
                if (key === "date" || key === "size") {
                    returnJson[key] = val;
                    return;
                }
                i++;
                var obj = {};
                obj['name'] = val['name'];
                obj['oldname'] = val['name'];
                obj['visible'] = val['visible'];
                obj['oldvisible'] = val['visible'];
                obj['position'] = i;
                obj['value'] = val['value'];
                obj['active'] = val['active'];
                var valInfo = val['info'];
                obj['operate'] = isReadOnlyVariable(valInfo);
                obj['oldoperate'] = obj['operate'];
                obj['date'] = val['date'];
                obj['info'] = valInfo;
                var valueType = val['valueType'];
                obj['valueType'] = valueType;
                obj['valueUnit'] = val['valueUnit'];
                if (valueType === "16") {
                    obj['valueList'] = val['valueList'];
                    obj['listType'] = "auto";
                } else if (valueType === "2") {
                    obj['valueName0'] = val['valueName0'];
                    obj['valueName1'] = val['valueName1'];
                } else if (valueType === "4") {
                    obj['valueMin'] = val['valueMin'];
                    obj['valueMax'] = val['valueMax'];
                    obj['step'] = 1;
                    obj['faktor'] = 1;
                }
                returnJson[key] = obj;
            });
            returnJson['size'] = i;
        } else {
            returnJson = newJsonObj;
        }

        returnJson = refreshJSONObj(type, returnJson, create);

        localStorage.setItem(map, JSON.stringify(returnJson));
        if (saveDataToFile) {
            saveDataToFile = false;
            $.post('cgi/saveconfig.cgi', {name: type, text: JSON.stringify(returnJson)});
        }
        return returnJson;
    } else {
        setMap(type, newJsonObj);
        return newJsonObj;
    }
}

function refreshJSONObj(type, newJsonObj, create) {
    var oldMap = getMap(type);
    if (type === "rooms" || type === "favorites" || type === "functions") {
        if (!create) {
            var returnJson = {};
            var size = newJsonObj["size"];
            $.each(newJsonObj, function (key, val) {
                if (key === "date" || key === "size") {
                    returnJson[key] = val;
                    return;
                }
                if (key in oldMap) {
                    var savedVal = oldMap[key];
                    val['visible'] = savedVal['visible'];
                    val['position'] = savedVal['position'];
                    if (val['oldname'] === savedVal['oldname']) {
                        val['name'] = savedVal['name'];
                    } else {
                        saveDataToFile = true;
                    }
                } else {
                    size++;
                    val['position'] = size;
                    saveDataToFile = true;
                }
                returnJson[key] = val;
            });
            returnJson["size"] = size;
            newJsonObj = returnJson;
        }
    } else if (type === "programs") {
        if (!create) {
            var returnJson = {};
            var size = newJsonObj["size"];
            $.each(newJsonObj, function (key, val) {
                if (key === "date" || key === "size") {
                    returnJson[key] = val;
                    return;
                }
                if (key in oldMap) {
                    var savedVal = oldMap[key];
                    val['position'] = savedVal['position'];
                    if (val['oldname'] === savedVal['oldname']) {
                        val['name'] = savedVal['name'];
                    } else {
                        saveDataToFile = true;
                    }
                    if (val['oldvisible'] === savedVal['oldvisible']) {
                        val['visible'] = savedVal['visible'];
                    } else {
                        saveDataToFile = true;
                    }
                    if (val['oldoperate'] === savedVal['oldoperate']) {
                        val['operate'] = savedVal['operate'];
                    } else {
                        saveDataToFile = true;
                    }
                } else {
                    size++;
                    val['position'] = size;
                    saveDataToFile = true;
                }
                returnJson[key] = val;
            });
            returnJson["size"] = size;
            newJsonObj = returnJson;
        }
    } else if (type === "variables") {
        if (!create) {
            var returnJson = {};
            var size = newJsonObj["size"];
            $.each(newJsonObj, function (key, val) {
                if (key === "date" || key === "size") {
                    returnJson[key] = val;
                    return;
                }
                var valueType = val['valueType'];
                if (key in oldMap) {
                    var savedVal = oldMap[key];
                    val['position'] = savedVal['position'];
                    if (val['oldname'] === savedVal['oldname']) {
                        val['name'] = savedVal['name'];
                    } else {
                        saveDataToFile = true;
                    }
                    if (val['oldvisible'] === savedVal['oldvisible']) {
                        val['visible'] = savedVal['visible'];
                    } else {
                        saveDataToFile = true;
                    }
                    if (val['oldoperate'] === savedVal['oldoperate']) {
                        val['operate'] = savedVal['operate'];
                    } else {
                        saveDataToFile = true;
                    }
                    if (valueType === "16") {
                        if('listType' in savedVal){
                            val['listType'] = savedVal['listType'];
                        } else {
                            val['listType'] = "auto";
                            saveDataToFile = true;
                        }
                    } else if (valueType === "4") {
                        if('step' in savedVal){
                            val['step'] = savedVal['step'];
                        } else {
                            val['step'] = 1;
                            saveDataToFile = true;
                        }
                        if('faktor' in savedVal){
                            val['faktor'] = savedVal['faktor'];
                        } else {
                            val['faktor'] = 1;
                            saveDataToFile = true;
                        }
                    }
                } else {
                    size++;
                    val['position'] = size;
                    saveDataToFile = true;
                }
                returnJson[key] = val;
            });
            returnJson["size"] = size;
            newJsonObj = returnJson;
        }
    } else if (type === "config" && !create) {
        newJsonObj['storageVersion'] = storageVersion;
        if (!("ccu_historian" in newJsonObj)) {
            newJsonObj['ccu_historian'] = "";
        }
        if (!("default_menugfxsize" in newJsonObj)) {
            newJsonObj['default_menugfxsize'] = "large";
        }
        if (!("no_more_settings" in newJsonObj)) {
            newJsonObj['no_more_settings'] = 0;
        }
        if (!("new_version" in newJsonObj)) {
            newJsonObj['new_version'] = "stable";
        }
        if (!("dont_leave" in newJsonObj)) {
            newJsonObj['dont_leave'] = false;
        }
        if (!("clientsList" in newJsonObj)) {
            newJsonObj['clientsList'] = !isTempClient ? clientsList : new Object();
        }
        if (!("default_sort_manually" in newJsonObj)) {
            newJsonObj['default_sort_manually'] = true;
        }
        clientsList = newJsonObj['clientsList'];
        if (client !== "" && !isTempClient && !(client in clientsList)) {
            clientsList[client] = client;
            newJsonObj['clientsList'] = clientsList;
        }
        if (!("two_sites" in newJsonObj)) {
            newJsonObj['two_sites'] = false;
        }
        if (!("transition" in newJsonObj)) {
            newJsonObj['transition'] = "flip";
        }
        if (!("columns" in newJsonObj)) {
            newJsonObj['columns'] = 1;
        }
         if (!("show_description" in newJsonObj)) {
            newJsonObj['show_description'] = true;
        }
         if (!("show_lastUsedTime" in newJsonObj)) {
            newJsonObj['show_lastUsedTime'] = true;
        }
    }

    setMap(type, newJsonObj);
    return newJsonObj;
}

function createConfigFile(type, map) {
    saveDataToFile = true;
    if (type === "config") {
        var text = '{';
        text += '"storageVersion" : ' + storageVersion + ',';
        text += '"favorites" : true,';
        text += '"rooms" : true,';
        text += '"functions" : true,';
        text += '"variables" : true,';
        text += '"programs" : true,';
        text += '"others" : true,';
        text += '"collapsed" : "rooms",';
        text += '"systemvar_readonly" : true,';
        text += '"default_theme" : "wma",';
        text += '"default_font" : "a",';
        text += '"ccu_historian" : "",';
        text += '"default_menugfxsize" : "large",';
        text += '"no_more_settings" : 0,';
        text += '"new_version" : "stable",';
        text += '"dont_leave" : false,';
        text += '"clientsList" : {' + (client !== "" && !isTempClient ? '"' + client + '":"' + client + '"' : '') + '},';
        text += '"default_sort_manually" : true,';
        text += '"two_sites" : false,';
        text += '"transition" : "flip",';
        text += '"columns" : 1,';
        text += '"show_description" : true,';
        text += '"show_lastUsedTime" : true';
        text += '}';

        optionsMap = saveConfigFile(type, JSON.parse(text), true, map, true);
    } else if (type.endsWith("Client")) {
        var text = '{}';
        type = type.slice(0, -6);
        if (client !== "") {
            switch (type) {
                case "config":
                    optionsClientMap = saveConfigFile(type + client, JSON.parse(text), true, map, true);
                    break;
                case "variables":
                    variablesClientMap = saveConfigFile(type + client, JSON.parse(text), true, map, true);
                    break;
                case "programs":
                    programsClientMap = saveConfigFile(type + client, JSON.parse(text), true, map, true);
                    break
                case "favorites":
                    favoritesClientMap = saveConfigFile(type + client, JSON.parse(text), true, map, true);
                    break
                case "rooms":
                    roomsClientMap = saveConfigFile(type + client, JSON.parse(text), true, map, true);
                    break
                case "functions":
                    functionsClientMap = saveConfigFile(type + client, JSON.parse(text), true, map, true);
                    break
                case "devices":
                    devicesClientMap = saveConfigFile(type + client, JSON.parse(text), true, map, true);
                    break
            }
        }
    } else {
        loadConfigData(false, 'cgi/' + type + '.cgi', type, map, true, true);
    }
}

function buttonEvents(obj, refresh) {
    var dataID = obj.data("id");  // Homematic Geräte ID.
    var urlAttr = '?id=' + dataID;
    var infoID = "info_" + dataID;  // Info Textfeld neben Button.

    var value = obj.data("value");

    if (typeof value === "undefined") {
        var valueID = "setValue_" + dataID; // Wertfeld, dessen Inhalt gesetzt werden soll.

        value = $("#" + valueID).val(); // Wert aus Wertfeld auslesen.
        var factor = $("#" + valueID).data("factor"); // Factor auslesen.
        if (typeof factor !== "undefined") {
            urlAttr += '&value=' + (parseFloat(value) / factor);
        } else {
            urlAttr += '&value=' + value;
        }
    } else {
        urlAttr += '&value=' + value;
    }

    var durationVal = 0;
    var durationObj = $("[data-duration-parent='" + obj.data("parent-id") + "']");
    durationObj.each(function (i) {
        var dur = $(this).datebox('getLastDur');
        if (!isNaN(dur)) {
            durationVal = dur > durationVal ? dur : durationVal;
            urlAttr += '&durationId' + i + '=' + durationObj.data("id") + '&durationValue' + i + '=' + dur;
        }
    });

    if (testSite) {
        urlAttr += '&debug=true';
    }

    $("#" + infoID).text(mapText("TRANSFER"));
    $.get('cgi/set.cgi' + urlAttr, function () {
        if (refresh) {
            $("#" + infoID).text(mapText("TRANSFER_OK"));
            refreshPage(0);
        } else {
            $("#" + infoID).text(mapText("DELAY"));
        }

        if (durationVal > 0) {
            setTimeout(function () {
                refreshPage(0);
            }, (durationVal + 3) * 1000);
        }
    });
}

function reloadList(txt, systemDate, restart, description) {
    $("#" + dataListHeader).empty();
    $("#" + dataListHeader).append("<li data-role='list-divider' role='heading'>" + txt + "<p style='float:right;'>" + systemDate + "</p></li>");
    if (description !== "") {
        $("#" + dataListHeader).append("<li class='description'>" + description + "</li>");
    }
    $("#" + dataListHeader).listview("refresh");
    $("#" + dataList).listview("refresh");
    if (restart) {
        $("#" + dataList).fadeIn();
    }
    $("#" + dataList).enhanceWithin().trigger("fertig");
}

// ----------------------- Data loading functions ----------------------------

function loadData(url, id, restart) {

    $('.buttonRefresh .ui-btn-text').html("<img class='ui-img-" + theme + "' src='img/misc/wait16.gif' width=12px height=12px>");
    var isActual = false;

    if (restart) {
        // Listen leeren:
        $("#" + dataList).empty();
        $("#" + dataListHeader).empty();
        // "Lade..." anzeigen:
        $("#" + dataListHeader).append("<li><img src='img/misc/wait16.gif' width=12px height=12px class='ui-li-icon ui-img-" + theme + "'>" + mapText("LOADING") + "...</li>").listview("refresh");

        if (localStorage.getItem("webmaticdevicesMap" + id) === null) {
            if (newVersion) {
                saveDataToFile = true;
            }
            loadConfigData(false, url + '?list=' + id, 'devices', 'webmaticdevicesMap' + id, false, true);
            isActual = true;
        } else {
            loadLocalStorageMap("devices", id);
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
                var html = processDevices(device, systemDate, options, device['operate'] !== "false");
                if (html !== "") {
                    $("#" + dataList).append(html);
                }
            }
            addDiagram(options);
        });

        if (isGetSite) {
            document.title = devicesMap['name'];
        }

        reloadList(devicesMap['name'], systemDate, restart, devicesMap['description']);
    }

    if (!isActual) {
        loadConfigData(true, url + '?list=' + id, 'devices', 'webmaticdevicesMap' + id, false, true, function (dta) {
            var systemDate = dta['date'];
            var devVisible = dta['visible'] !== "false";

            $.each(dta.entries, function (i, device) {
                var options = new Object();
                options['addDiagram'] = false;
                options['diagramData'] = "";
                options['diagramID'] = "";
                options['diagramUnit'] = "";
                options['varOptions'] = {};
                options['varOptionsFirst'] = "";

                var html = "";

                if (device['visible'] !== "false") {
                    html = processDevices(device, systemDate, options, device['operate'] !== "false");

                    if (html !== "") {
                        var devID = device['id'];

                        if ($('#' + devID).length === 0 && devVisible) {
                            $("#" + dataList).append(html);
                        } else if (devVisible) {
                            if ($.inArray(devID.toString(), excludeFromRefresh) === -1) {
                                $('#' + devID).replaceWith(html);
                            }
                        } else if ($('#' + devID).length !== 0) {
                            $('#' + devID).remove();
                        }
                    }

                    addDiagram(options);
                }
            });

            reloadList(dta['name'], systemDate, restart, dta['description']);

        });

    }

    // Animated Icon aus Refresh wieder entfernen:
    $('.buttonRefresh .ui-btn-text').html("&nbsp;");
    // Filter Update:
    $(".ui-input-search .ui-input-text").trigger("change");

    $("[id^=button]").enhanceWithin();
    $("[id^=input]").enhanceWithin();
    $("textarea").textinput("refresh");
}

function loadVariables(restart) {

    // Icon Animation in Refresh Button:
    $('.buttonRefresh .ui-btn-text').html("<img class='ui-img-" + theme + "' src='img/misc/wait16.gif' width=12px height=12px>");
    if (restart) {
        $("#" + dataList).empty();
        $("#" + dataListHeader).empty();
        // "Lade..." anzeigen:
        $("#" + dataListHeader).append("<li><img src='img/misc/wait16.gif' width=12px height=12px class='ui-li-icon ui-img-" + theme + "'>" + mapText("LOADING") + "...</li>").listview("refresh");

        //Global
        if (localStorage.getItem("webmaticvariablesMap") === null) {
            if (newVersion) {
                saveDataToFile = true;
            }
            loadConfigData(false, '../webmatic_user/variables.json', 'variables', 'webmaticvariablesMap', false, false);
        } else {
            loadLocalStorageMap("variables");
        }
        //Lokal
        if (localStorage.getItem("webmaticvariablesclientMap") === null) {
            if (client !== "") {
                loadConfigData(false, '../webmatic_user/variables' + client + '.json', 'variablesClient', 'webmaticvariablesclientMap', false, true);
            }
        } else {
            variablesClientMap = JSON.parse(localStorage.getItem("webmaticvariablesclientMap"));
        }
        //Kombinieren
        createOneMap("variables");
        
        var systemDate = resultVariablesMap['date'];
        var tmpObj = {};
        $.each(resultVariablesMap, function (key, variable) {
            if (key === "date" || key === "size") {
                return;
            }
            var html = processVariable(variable, key, systemDate);
            if (resultOptionsMap['default_sort_manually']) {
                tmpObj[parseInt(variable['position'])] = html;
            } else {
                tmpObj[variable['name'].toLowerCase()] = html;
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
        var len = keys.length;
        for (var i = 0; i < len; i++) {
            var k = keys[i];
            $("#" + dataList).append(tmpObj[k]);
        }
        
        reloadList(mapText("SYS_VAR"), systemDate, restart, "");
    }    

    loadConfigData(true, 'cgi/variables.cgi', 'variables', 'webmaticvariablesMap', false, true, function () {
        createOneMap("variables");
        
        var systemDate = resultVariablesMap['date'];
        $.each(resultVariablesMap, function (key, variable) {
            if (key === "date" || key === "size") {
                return;
            }
            
            if ($('#' + key).length === 0) {
                $("#" + dataList).append(processVariable(variable, key, systemDate));
            } else {
                $('#' + key).replaceWith(processVariable(variable, key, systemDate));
            }
            
        });
        reloadList(mapText("SYS_VAR"), systemDate, restart, "");
        $("img.lazyLoadImage").lazyload({event: "lazyLoadInstantly"});
        $("img").trigger("lazyLoadInstantly");
    });

    // Animated Icon aus Refresh wieder entfernen:
    $('.buttonRefresh .ui-btn-text').html("&nbsp;");
    // Filter Update:
    $(".ui-input-search .ui-input-text").trigger("change");
    $("textarea").textinput("refresh");
    $("img.lazyLoadImage").lazyload({event: "lazyLoadInstantly"});
    $("img").trigger("lazyLoadInstantly");
}

function loadPrograms(restart) {

    // Icon Animation in Refresh Button:
    $('.buttonRefresh .ui-btn-text').html("<img class='ui-img-" + theme + "' src='img/misc/wait16.gif' width=12px height=12px>");
    if (restart) {
        $("#" + dataList).empty();
        $("#" + dataListHeader).empty();
        // "Lade..." anzeigen:
        $("#" + dataListHeader).append("<li><img src='img/misc/wait16.gif' width=12px height=12px class='ui-li-icon ui-img-" + theme + "'>" + mapText("LOADING") + "...</li>").listview("refresh");

        //Global
        if (localStorage.getItem("webmaticprogramsMap") === null) {
            if (newVersion) {
                saveDataToFile = true;
            }
            loadConfigData(false, '../webmatic_user/programs.json', 'programs', 'webmaticprogramsMap', false, false);
        } else {
            loadLocalStorageMap("programs");
        }
        //Lokal
        if (localStorage.getItem("webmaticprogramsclientMap") === null) {
            if (client !== "") {
                loadConfigData(false, '../webmatic_user/programs' + client + '.json', 'programsClient', 'webmaticprogramsclientMap', false, true);
            }
        } else {
            programsClientMap = JSON.parse(localStorage.getItem("webmaticprogramsclientMap"));
        }
        //Kombinieren
        createOneMap("programs");

        var systemDate = resultProgramsMap['date'];
        var tmpObj = {};
        $.each(resultProgramsMap, function (key, prog) {
            if (key === "date" || key === "size") {
                return;
            }
            var prgVisible = prog['visible'];
            var prgActive = prog['active'];
            var prgID = key;
            var html = processProgram(prog, prgID, systemDate, prgActive, (readModus && prgVisible) || !readModus);
            if (resultOptionsMap['default_sort_manually']) {
                tmpObj[parseInt(prog['position'])] = html;
            } else {
                tmpObj[prog['name'].toLowerCase()] = html;
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
        var len = keys.length;
        for (var i = 0; i < len; i++) {
            var k = keys[i];
            $("#" + dataList).append(tmpObj[k]);
        }

        reloadList(mapText("PROGRAMS"), systemDate, restart, "");
        $("#" + dataList).find(".btnDisabled").button('disable');
    }

    loadConfigData(true, 'cgi/programs.cgi', 'programs', 'webmaticprogramsMap', false, true, function () {
        createOneMap("programs");

        var systemDate = resultProgramsMap['date'];
        $.each(resultProgramsMap, function (key, prog) {
            if (key === "date" || key === "size") {
                return;
            }
            var prgVisible = prog['visible'];
            var prgActive = prog['active'];
            var prgID = key;

            if ($('#' + prgID).length === 0) {
                $("#" + dataList).append(processProgram(prog, prgID, systemDate, prgActive, (readModus && prgVisible) || !readModus));
            } else {
                $('#' + prgID).replaceWith(processProgram(prog, prgID, systemDate, prgActive, (readModus && prgVisible) || !readModus));
            }
        });
        reloadList(mapText("PROGRAMS"), systemDate, restart, "");
        $("#" + dataList).find(".btnDisabled").button('disable');
        $("img.lazyLoadImage").lazyload({event: "lazyLoadInstantly"});
        $("img").trigger("lazyLoadInstantly");
    });

    // Animated Icon aus Refresh wieder entfernen:
    $('.buttonRefresh .ui-btn-text').html("&nbsp;");
    // Filter Update:
    $(".ui-input-search .ui-input-text").trigger("change");
    $("img.lazyLoadImage").lazyload({event: "lazyLoadInstantly"});
    $("img").trigger("lazyLoadInstantly");
}

// ------------------------- OnDocumentReady -----------------------------

$(function () {

    if (debugModus && false) {
        $('#errorsDebugger').show();
        $.each(errorsDebugger, function (error) {
            $('#errorsDebugger').append(errorsDebugger[error]);
        });
    }

    $.jqplot.config.enablePlugins = true;

    $(document).bind("mobileinit", function () {
        $.mobile.listview.prototype.options.filterPlaceholder = mapText("FILTER");
    });

    // Irgendwas durch Klicken ausführen/speichern
    $(document.body).on("click", "[id^=setButton]", function () {
        var obj = $(this);
        var special = obj.data("special");
        if (special) {
            var dataID = obj.data("id");
            switch (special) {
                case "CLIMATECONTROL_RT_TRANSCEIVER":
                    var temp = $('#setTemperature_' + dataID).val();
                    var startTime = $('#setStartTime_' + dataID).datebox('getTheDate');
                    var startDate = $('#setStartDate_' + dataID).datebox('getTheDate');
                    var smin = (startTime.getHours() * 60) + startTime.getMinutes();
                    var sday = startDate.getDate();
                    var smon = startDate.getMonth() + 1;
                    var syea = startDate.getYear() - 100;
                    var endTime = $('#setEndTime_' + dataID).datebox('getTheDate');
                    var endDate = $('#setEndDate_' + dataID).datebox('getTheDate');
                    var emin = (endTime.getHours() * 60) + endTime.getMinutes();
                    var eday = endDate.getDate();
                    var emon = endDate.getMonth() + 1;
                    var eyea = endDate.getYear() - 100;
                    obj.attr('data-value', temp + "," + smin + "," + sday + "," + smon + "," + syea + "," + emin + "," + eday + "," + emon + "," + eyea);
                    break;
            }
        }

        buttonEvents(obj, obj.data("refresh"), special);
    });

    // Selectbox-Funktion ausführen/speichern
    $(document.body).on("click", "[id^=setValueBigList]", function () {
        var obj = $(this);
        var dataID = obj.data("id");
        obj.attr('data-value', $('#selector_' + dataID).val());
        buttonEvents(obj, obj.data("refresh"));
    });

    // Ausgewählter Kopffunktion ausführen/speichern
    $(document.body).on("click", "[id^=setTextButton]", function () {
        var dataID = $(this).data("id");  // Homematic Geräte ID.
        var valueID = "setValue_" + dataID; // Wertfeld, dessen Inhalt gesetzt werden soll.
        var infoID = "info_" + dataID;  // Info Textfeld neben Button.
        var value = $("#" + valueID).val(); // Wert aus Wertfeld auslesen.
        // Alle " durch ' ersetzen, da sonst Probleme an verschiedenen Stellen:
        value = value.replace(/\"/g, "'");
        // Dann noch enocden, damit alles übertragen wird:
        value = encodeURIComponent(value);
        var urlAttr = "";

        if (testSite) {
            urlAttr += '&debug=true';
        }

        $("#" + infoID).text(mapText("TRANSFER"));
        $.get('cgi/set.cgi?id=' + dataID + '&value=' + value + urlAttr, function () {
            $("#" + infoID).text(mapText("TRANSFER_OK"));
            refreshPage(0);
        });
    });

    // Programm ausführen
    $(document.body).on("click", "[id^=startProgramButton]", function () {
        var dataID = $(this).data("id");  // Homematic Geräte ID.
        var infoID = "info_" + dataID;  // Info Textfeld neben Button.
        var urlAttr = "";

        if (testSite) {
            urlAttr += '&debug=true';
        }

        $("#" + infoID).text("START");
        $.get('cgi/startprogram.cgi?id=' + dataID + urlAttr, function () {
            $("#" + infoID).text(mapText("TRANSFER_OK"));
        });
    });

    // Historian
    $(document.body).on("click", "[id^=saveHistorianData]", function () {
        var obj = $(this);
        var dataID = obj.data("id");
        obj.attr('data-value', $('#hisHistorianID_' + dataID).val() + ";" + $('#hisHMID_' + dataID).val() + ";" + $('#hisDuration_' + dataID).val() + $("#hisSelector_" + dataID).val());
        buttonEvents(obj, true);
    });

    // TuneIn
    $(document.body).on("click", "[id^=saveTuneInRadioData]", function () {
        var obj = $(this);
        var dataID = obj.data("id");
        obj.attr('data-value', $('#tuneInURL_' + dataID).val());
        buttonEvents(obj, true);
    });
    $(document.body).on("click", "[name=showTuneIn]", function () {
        var obj = $(this);
        var valID = obj.data("id");
        var val = $("#saveTuneInRadioData_" + valID).data("value");
        obj.fadeOut(500, function () {
            obj.attr("name", "editTuneIn");
            if (val !== undefined) {
                obj.attr("data-val", val);
            }
            obj.removeClass("ui-icon-eye").addClass("ui-icon-edit").fadeIn(1000);
        });
        var parentId = obj.data("parentId");
        var vorDate = obj.data("vorDate");
        $('#tuneInField_' + valID).fadeOut(500, function () {
            $('#tuneInField_' + valID).html(getTuneIn(parentId, valID, val, vorDate));
            $('#' + valID).enhanceWithin();
            $('#tuneInField_' + valID).fadeIn(1000);
        });
    });
    $(document.body).on("click", "[name=editTuneIn]", function () {
        var obj = $(this);
        obj.fadeOut(500, function () {
            obj.attr("name", "showTuneIn");
            obj.removeClass("ui-icon-edit").addClass("ui-icon-eye").fadeIn(1000);
        });
        var parentId = obj.data("parentId");
        var valID = obj.data("id");
        var val = obj.data("val");
        var vorDate = obj.data("vorDate");
        $('#tuneInField_' + valID).fadeOut(500, function () {
            $('#tuneInField_' + valID).html(editTuneIn(parentId, valID, val, vorDate));
            $('#' + valID).enhanceWithin();
            $('#tuneInField_' + valID).fadeIn(1000);
        });
    });

    $(window).on('beforeunload', function () {
        if (mustBeSaved) {
            saveAllDatasToServer();
        }
        if (!debugModus && resultOptionsMap['dont_leave']) {
            return "Don't leave me!";
        }
    });

    $(document.body).on("fertig", "#dataList,#dataList2", function () {
        if (!$('#' + dataList).hasClass("column-1")) {
            var currentTallest = 0;
            var currentRowStart = 0;
            var rowLis = new Array();
            var $el;
            var topPosition = 0;
            var $dataListItems = $('.dataListItem');
            var len = $dataListItems.length;

            $dataListItems.each(function (index) {
                $el = $(this);
                topPosition = $el.position().top;

                if (currentRowStart !== topPosition) {
                    for (var currentLi = 0; currentLi < rowLis.length; currentLi++) {
                        rowLis[currentLi].height(currentTallest);
                    }
                    topPosition = $el.position().top;
                    rowLis.length = 0; // empty the array
                    currentRowStart = topPosition;
                    currentTallest = $el.height();
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
        }
    });

});