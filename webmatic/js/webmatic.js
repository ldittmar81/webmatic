/* global storageVersion, resultOptionsMap, prevItem, lastClickType, lastClickID, webmaticVersion, loadedFont, debugModus, programsMap, functionsMap, roomsMap, favoritesMap, readModus, excludeFromRefresh, Base64, dateNow, resultProgramsMap, isPreRelease, lastStableVersion, errorsDebugger, clientsList, wmLang, isGetSite, page2, tmpColumns, resultVariablesMap, dataList, theme, dataListHeader, newVersion, devicesMap, picturesList, mustBeSaved, divisorClick, isDialog, client */

// WebMatic 2.x
// by ldittmar

// --------------------- Funktionen --------------------------

function refreshPage(item, col) {
    // Gleich mal den Timer neu starten, lieber vor dem Reload, damit sich die nicht in die Quere kommen.
    // Später dann besser nur einen Refresh zur selben Zeit zulassen:
    restartTimer();
    testSite = false;

    if (lastClickType !== -1 && lastClickID !== -1 && !isDialog) {
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
            loadColorPicker = false;
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
                loadGraphicIDs("favorites", true);
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
                loadGraphicIDs("rooms", true);
                break;
            case 9:
                loadGraphicIDs("functions", true);
                break;
            case 10:
                loadGraphicIDs("programs", true);
                break;
            case 11:
                loadOptionsClient();
                break;
            case 12:
                loadGraphicIDs("variables", true);
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

// ------------------------ HTML Erstellung -----------------------------

function processVariable(variable, valID, systemDate) {
    var strValue = unescape(variable['value']);
    var valType = variable['valueType'];
    var valUnit = variable['valueUnit'];
    var vorDate = getTimeDiffString(variable['date'], systemDate);
    var valInfo = unescape(variable['info']);
    var operate = checkOperate(variable['operate']);
    var picKey = getPicKey(valID, "variables", variable, false);

    var html = "<li class='dataListItem' id='" + valID + "' " + (variable['visible'] ? "" : "style='display: none;'") + ">";
    html += "<h2 class='ui-li-heading'>" + unescape(variable['name']) + "</h2>";
    if (variable['onlyPic']) {
        var isTextVariables = valType === "20";

        var data = "data-id='" + valID + "' data-type='variables" + valType + "' class='onlyPic" + (!operate && !isTextVariables ? " onlyPicDisabled" : "") + "' ";
        if (!isTextVariables) {
            data += "data-value='" + strValue + "' ";
        }

        if (valType === "4" && operate) {
            data += "data-faktor='" + variable['faktor'] + "' data-step='" + variable['step'] + "' data-min='" + variable['valueMin'] + "' data-max='" + variable['valueMax'] + "' ";
        } else if (valType === "16" && operate) {
            data += "data-list='" + variable['valueList'] + "' data-listtype='" + variable['listType'] + "' ";
        } else if (isTextVariables) {
            data += "data-operate='" + operate + "' ";
        }
        if ((operate && (valType === "4" || valType === "16")) || isTextVariables) {
            data += "data-name='" + unescape(variable['name']) + "' data-unit='" + valUnit + "' data-date='" + vorDate + "'";
        }

        html += "<div " + (operate || isTextVariables ? "class='onlyPicDiv'" : data) + ">";
        if (operate || isTextVariables) {
            html += "<a href='#' " + data + ">";
        }

        html += "<img id='img" + valID + "' class='ui-img-" + theme;
        if ($.inArray(picKey, picturesList) !== -1) {
            html += " lazyLoadImage' data-original='../webmatic_user/img/ids/variables/" + picKey + ".png";
        }
        html += "' src='img/menu/variables.png'/>";

        if (operate || isTextVariables) {
            html += "</a>";
        }
        if (operate) {
            html += "<div class='onlyPic-player onlyPic-player-" + theme + "' id='player" + valID + "'>&nbsp;</div>";
        } else if (isTextVariables) {
            html += "<div class='onlyPic-viewer onlyPic-viewer-" + theme + "'>&nbsp;</div>";
        }

        if (valType === "4") {
            html += "<div class='onlyPic-value valueInfo-" + theme + "'>" + parseFloat(strValue) + valUnit + "</div>";
        } else if (isTextVariables && valUnit && valUnit.toUpperCase() === "COLOR") {
            html += "<div class='onlyPic-color' style='background-color: " + strValue + ";'>&nbsp;</div>";
        } else if (isTextVariables && valUnit && (valUnit.toUpperCase() === "DATE" || valUnit.toUpperCase() === "TIME")) {
            html += "<div class='onlyPic-value valueInfo-" + theme + "'>" + strValue + "</div>";
        }

        if (isTextVariables) {
            html += "<span id='textValue" + valID + "' style='display: none;'>" + strValue + "</span>";
        }

        html += "</div>";
    } else {
        html += "<p class='description' " + (resultOptionsMap['show_description'] ? "" : "style='display: none;'") + ">" + valInfo + "</p>";
        if ($.inArray(picKey, picturesList) !== -1) {
            html += "<div style='float: left; text-align: center; padding-right: 10px;'>";
            html += "<img id='img" + picKey + "' class='ui-div-thumbnail ui-img-" + theme + " lazyLoadImage' data-original='../webmatic_user/img/ids/variables/" + picKey + ".png' src='img/menu/variables.png'/>";
            html += "</div>";
        }

        // In der Variablenliste editieren zulassen:
        html += addVariableField('', valID, variable, vorDate, !operate, operate);
    }
    html += "</li>";

    return html;
}

function processProgram(prog, prgID, systemDate, active, visible) {
    var html = "<li class='dataListItem' id='" + prgID + "' " + (visible ? "" : "style='display: none;'") + ">";
    html += "<h2 class='ui-li-heading'>" + prog['name'] + "</h2>";
    if (prog['onlyPic']) {
        var enabled = (prog['operate'] || !readModus);
        var data = "data-id='" + prgID + "' data-type='programs' class='onlyPic" + (!enabled ? " onlyPicDisabled" : "") + "'";
        html += "<div " + (enabled ? "class='onlyPicDiv'" : data) + ">";
        if (enabled) {
            html += "<a href='#' " + data + ">";
        }
        html += "<img id='img" + prgID + "' class='ui-img-" + theme;
        if ($.inArray(prgID, picturesList) !== -1) {
            html += " lazyLoadImage' data-original='../webmatic_user/img/ids/programs/" + prgID + ".png";
        }
        html += "' src='img/menu/programs.png'/>";
        if (enabled) {
            html += "<div class='onlyPic-player onlyPic-player-" + theme + "' id='player" + prgID + "'>&nbsp;</div>";
            html += "</a>";
        }
        html += "</div>";
    } else {
        html += "<p class='description' " + (resultOptionsMap['show_description'] ? "" : "style='display: none;'") + ">" + prog['info'] + (!active ? " (" + mapText("MANUAL") + ")" : "") + "</p>";
        if ($.inArray(prgID, picturesList) !== -1) {
            html += "<div style='float: left; text-align: center; padding-right: 10px;'>";
            html += "<img id='img" + prgID + "' class='ui-div-thumbnail ui-img-" + theme + " lazyLoadImage' data-original='../webmatic_user/img/ids/programs/" + prgID + ".png' src='img/menu/programs.png'/>";
            html += "</div>";
        }
        html += addStartProgramButton('', prgID, mapText("RUN"), getTimeDiffString(prog['date'], systemDate), (prog['operate'] || !readModus));
    }
    html += "</li>";
    return html;
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
            var valUnit = channel['valueUnit'];
            var channelDate = channel['date'];
            var vorDate = getTimeDiffString(channelDate, systemDate);
            var picKey = getPicKey(valID, "variables", channel, false);

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
                if ($.inArray(picKey, picturesList) !== -1) {
                    deviceHTML += "<div style='float: left; text-align: center; padding-right: 10px;'>";
                    deviceHTML += "<img id='img" + picKey + "' class='ui-div-thumbnail ui-img-" + theme + " lazyLoadImage' data-original='../webmatic_user/img/ids/variables/" + picKey + ".png' src='img/menu/variables.png'/>";
                    deviceHTML += "</div>";
                }
                if (options['varOptionsFirst'] === "d" || options['varOptionsFirst'] === "dk" || options['varOptionsFirst'] === "g" || options['varOptionsFirst'] === "h") {
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
                    deviceHTML += addVariableField(deviceID, valID, channel, vorDate, isReadOnly(valInfo), operate);
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
        var valUnit = device['valueUnit'];
        var channelDate = device['date'];
        var vorDate = getTimeDiffString(channelDate, systemDate);
        var picKey = getPicKey(valID, "variables", device, false);

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
        if ($.inArray(picKey, picturesList) !== -1) {
            deviceHTML += "<div style='float: left; text-align: center; padding-right: 10px;'>";
            deviceHTML += "<img id='img" + picKey + "' class='ui-div-thumbnail ui-img-" + theme + " lazyLoadImage' data-original='../webmatic_user/img/ids/variables/" + picKey + ".png' src='img/menu/variables.png'/>";
            deviceHTML += "</div>";
        }
        if (options['varOptionsFirst'] === "d" || options['varOptionsFirst'] === "dk" || options['varOptionsFirst'] === "g" || options['varOptionsFirst'] === "h") {
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
            deviceHTML += addVariableField('', valID, device, vorDate, isReadOnly(valInfo), operate);
        }
    } else if (device['type'] === "PROGRAM") {
        var prgID = device['id'];
        var prgInfo = device['info'];
        var prgDate = device['date'];
        vorDate = getTimeDiffString(prgDate, systemDate);
        operate = true;

        deviceHTML += "<p class='description' " + (resultOptionsMap['show_description'] ? "" : "style='display: none;'") + ">" + prgInfo + "</p>";
        if ($.inArray(prgID, picturesList) !== -1) {
            deviceHTML += "<div style='float: left; text-align: center; padding-right: 10px;'>";
            deviceHTML += "<img id='img" + prgID + "' class='ui-div-thumbnail ui-img-" + theme + " lazyLoadImage' data-original='../webmatic_user/img/ids/programs/" + prgID + ".png' src='img/menu/programs.png'/>";
            deviceHTML += "</div>";
        }
        deviceHTML += addStartProgramButton('', prgID, mapText("RUN"), vorDate, operate);
    }

    // Ist leer, wenn (nv) oder ein leerer Channel.
    if (deviceHTML !== "") {
        deviceHTML += "</li>";
    }

    return deviceHTML;
}

// ----------------------- Helper functions ----------------------------

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
        if (!isDialog) {
            if (refresh) {
                $("#" + infoID).text(mapText("TRANSFER_OK"));
                refreshPage(0);
            } else {
                $("#" + infoID).text(mapText("DELAY"));
            }
        } else {
            history.back();
        }

        if (durationVal > 0) {
            setTimeout(function () {
                refreshPage(0);
            }, (durationVal + 3) * 1000);
        }
    });
}

function reloadList(txt, systemDate, restart, description) {
    if (txt.startsWith("room") || txt.startsWith("func")) {
        txt = mapText(txt);
    } else if (txt.startsWith("%24%7B")) {
        txt = mapText(txt.substring(6, txt.length - 3));
    } else if (txt.startsWith("${")) {
        txt = mapText(txt.substring(2, txt.length - 1));
    }
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

        if (localStorage.getItem("webmaticdevicesMap" + id) === null || localStorage.getItem("webmaticdevicesMap" + id) === "undefined") {
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
            $("img.lazyLoadImage").lazyload({event: "lazyLoadInstantly"});
            $("img").trigger("lazyLoadInstantly");

            if (loadColorPicker) {
                $(".colorPicker").colorPicker();
            }
        });

    }

    // Animated Icon aus Refresh wieder entfernen:
    $('.buttonRefresh .ui-btn-text').html("&nbsp;");
    // Filter Update:
    $(".ui-input-search .ui-input-text").trigger("change");

    $("[id^=button]").enhanceWithin();
    $("[id^=input]").enhanceWithin();
    $("textarea").textinput("refresh");
    $("img.lazyLoadImage").lazyload({event: "lazyLoadInstantly"});
    $("img").trigger("lazyLoadInstantly");

    if (loadColorPicker) {
        $(".colorPicker").colorPicker();
    }
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
        if (localStorage.getItem("webmaticvariablesMap") === null || localStorage.getItem("webmaticvariablesMap") === "undefined") {
            if (newVersion) {
                saveDataToFile = true;
            }
            loadConfigData(false, '../webmatic_user/variables.json', 'variables', 'webmaticvariablesMap', false, false);
        } else {
            loadLocalStorageMap("variables");
        }
        //Lokal
        if (localStorage.getItem("webmaticvariablesclientMap") === null || localStorage.getItem("webmaticvariablesclientMap") === "undefined") {
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
            if (key === "date" || key === "size" || key === "divisors" || (divisorClick && variable['variables_divisor'] !== lastClickID)) {
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

        reloadList(mapText("VARIABLES"), systemDate, restart, "");
    }

    loadConfigData(true, 'cgi/variables.cgi', 'variables', 'webmaticvariablesMap', false, true, function () {
        createOneMap("variables");

        var systemDate = resultVariablesMap['date'];
        $.each(resultVariablesMap, function (key, variable) {
            if (key === "date" || key === "size" || key === "divisors" || (divisorClick && variable['variables_divisor'] !== lastClickID)) {
                return;
            }

            if ($('#' + key).length === 0) {
                $("#" + dataList).append(processVariable(variable, key, systemDate));
            } else {
                $('#' + key).replaceWith(processVariable(variable, key, systemDate));
            }

        });
        reloadList(mapText("VARIABLES"), systemDate, restart, "");
        $("img.lazyLoadImage").lazyload({event: "lazyLoadInstantly"});
        $("img").trigger("lazyLoadInstantly");

        if (loadColorPicker) {
            $(".colorPicker").colorPicker();
        }
    });

    // Animated Icon aus Refresh wieder entfernen:
    $('.buttonRefresh .ui-btn-text').html("&nbsp;");
    // Filter Update:
    $(".ui-input-search .ui-input-text").trigger("change");
    $("textarea").textinput("refresh");
    $("img.lazyLoadImage").lazyload({event: "lazyLoadInstantly"});
    $("img").trigger("lazyLoadInstantly");

    if (loadColorPicker) {
        $(".colorPicker").colorPicker();
    }
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
        if (localStorage.getItem("webmaticprogramsMap") === null || localStorage.getItem("webmaticprogramsMap") === "undefined") {
            if (newVersion) {
                saveDataToFile = true;
            }
            loadConfigData(false, '../webmatic_user/programs.json', 'programs', 'webmaticprogramsMap', false, false);
        } else {
            loadLocalStorageMap("programs");
        }
        //Lokal
        if (localStorage.getItem("webmaticprogramsclientMap") === null || localStorage.getItem("webmaticprogramsclientMap") === "undefined") {
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
            if (key === "date" || key === "size" || key === "divisors" || (divisorClick && prog['programs_divisor'] !== lastClickID)) {
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
            if (key === "date" || key === "size" || key === "divisors" || (divisorClick && prog['programs_divisor'] !== lastClickID)) {
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
            if (!isDialog) {
                $("#" + infoID).text(mapText("TRANSFER_OK"));
                refreshPage(0);
            } else {
                history.back();
            }
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

    $(document.body).on("click", ".onlyPic:not(.onlyPicDisabled)", function () {
        var dataID = $(this).data("id");
        $('#player' + dataID).removeClass('onlyPic-player-' + theme).addClass('onlyPic-playerani-' + theme);
        var type = $(this).data("type");
        var unit = $(this).data("unit");

        var urlAttr = testSite ? "&debug=true" : "";
        if (testSite) {
            urlAttr += '&debug=true';
        }

        var value = $(this).data("value");
        var name = $(this).data("name");
        var vorDate = $(this).data("date");

        if (type === "programs") {
            $.get('cgi/startprogram.cgi?id=' + dataID + urlAttr, function () {
                $('#player' + dataID).delay(3000).removeClass('onlyPic-playerani-' + theme).addClass('onlyPic-player-' + theme);
            });
        } else if (type === "variables2") {
            if (value === "") {
                value = false;
            }
            $.get('cgi/set.cgi?id=' + dataID + '&value=' + !value + urlAttr, function () {
                refreshPage(0);
            });
        } else if (type === "variables4") {
            var faktor = $(this).data("faktor");
            if (!faktor) {
                faktor = 1;
            }
            var valMin = $(this).data("min");
            var valMax = $(this).data("max");
            var step = $(this).data("step");
            if (!step) {
                step = 1;
            }

            openOnlyPicDialog(name, addSetNumber('', dataID, value, unit, valMin, valMax, step, faktor, vorDate, true, true));
        } else if (type === "variables16") {
            var list = $(this).data("list");
            var listtype = $(this).data("listtype");
            if (!listtype) {
                listtype = "auto";
            }

            openOnlyPicDialog(name, addSetValueList('', dataID, value, list, unit, vorDate, true, true, listtype, false));
        } else if (type === "variables20") {
            value = $("#textValue" + dataID).text();

            var operate = $(this).data("operate");

            var html = "";
            var callback;
            if (operate) {
                if (unit && unit.toUpperCase() === "COLOR") {
                    html = addColorPicker('', dataID, value, vorDate, operate);
                    callback = function () {
                        $(".colorPicker").colorPicker();
                    };
                } else if (unit && unit.toUpperCase() === "DATE") {
                    html = addDatePicker('', dataID, value, vorDate, operate, "datebox");
                } else if (unit && unit.toUpperCase() === "TIME") {
                    html = addDatePicker('', dataID, value, vorDate, operate, "timebox");
                } else {
                    html = addSetText('', dataID, value, unit, vorDate, operate);
                }
            } else {
                html = addReadonlyVariable(dataID, value, vorDate, "20", unit);
            }

            openOnlyPicDialog(name, html, callback);
        }
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

    $(window).on('beforeunload', function () {
        if (mustBeSaved) {
            saveAllDatasToServer();
        }
        if (!debugModus && resultOptionsMap['dont_leave']) {
            return "Don't leave me!";
        }
    });

    //ScrolltoTop
    $(document).on("scroll", window, function () {
        ($(this).scrollTop() > 300) ? $('.cd-top').addClass('cd-is-visible') : $('.cd-top').removeClass('cd-is-visible cd-fade-out');
        if ($(this).scrollTop() > 1200) {
            $('.cd-top').addClass('cd-fade-out');
        }
    });

    //smooth scroll to top
    $('.cd-top').on('click', function (event) {
        event.preventDefault();
        $('body,html').animate({scrollTop: 0}, 700);
    });

});