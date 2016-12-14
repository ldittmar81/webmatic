/* global theme, dataListHeader, isPreRelease, userFolder, client, resultDevicesMap, dataList, newVersion, picturesList, clientsList, resultOptionsMap */

function editRFF(id, isClient, type) {
    var rffMap = getResultMap(type);

    clearScreen();
    $("#" + dataListHeader).append("<li><img src='img/misc/wait16.gif' width=12px height=12px class='ui-li-icon ui-img-" + theme + "'>" + mapText("LOADING") + "...</li>").listview("refresh");
    $('.buttonRefresh .ui-btn-text').html("<img class='ui-img-" + theme + "' src='img/misc/wait16.gif' width=12px height=12px>");


    if (localStorage.getItem(isPreRelease + "webmaticdevicesMap" + id) === null || localStorage.getItem(isPreRelease + "webmaticdevicesMap" + id) === "undefined") {
        if (newVersion) {
            saveDataToFile = true;
        }
        loadConfigData(false, '../' + userFolder + '/devices' + id + '.json', 'devices', 'webmaticdevicesMap' + id, false, false);
    } else {
        loadLocalStorageMap("devices", id);
    }
    //Lokal
    if (localStorage.getItem(isPreRelease + "webmaticdevicesclientMap" + id) === null || localStorage.getItem(isPreRelease + "webmaticdevicesclientMap") === "undefined") {
        if (client !== "") {
            loadConfigData(false, '../' + userFolder + '/devices' + id + client + '.json', 'devicesClient', 'webmaticdevicesclientMap' + id, false, true);
        }
    } else {
        devicesClientMap = JSON.parse(localStorage.getItem(isPreRelease + "webmaticdevicesclientMap" + id));
    }

    createOneMap("devices");

    loadConfigData(true, 'cgi/list.cgi?list=' + id, 'devices', 'webmaticdevicesMap' + id, false, true, function () {
        createOneMap("devices");
    });

    var deviceMap = isClient ? getClientMap("devices") : getMap("devices");
    var systemDate = deviceMap['date'];

    $.each(deviceMap.entries, function (i, device) {
        var options = new Object();
        options['addOptionsDiagram'] = false;
        options['diagramData'] = "";
        options['diagramID'] = "";
        options['diagramUnit'] = "";
        options['varOptions'] = {};
        options['varOptionsFirst'] = "";
        $("#" + dataList).append(processOptionsDevices(device, systemDate, options, device['operate'] !== "false"));
        addOptionsDiagram(options);
    });

    var backButton = "<a href='#' class='ui-btn ui-btn-inline ui-icon-back ui-btn-icon-notext ui-corner-all' name='goBackToOptions' data-type='" + type + "' data-client='" + isClient + "' />";
    reloadList(rffMap[id]['name'], backButton, true, resultDevicesMap['description']);

    $("#" + dataList).trigger("fertig");

    // Animated Icon aus Refresh wieder entfernen:
    $('.buttonRefresh .ui-btn-text').html("&nbsp;");
    // Filter Update:
    $(".ui-input-search .ui-input-text").trigger("change");

    $("[id^=button]").enhanceWithin();
    $("[id^=input]").enhanceWithin();
    $("textarea").textinput("refresh");
    $("img.lazyLoadImage").lazyload({event: "lazyLoadInstantly"});
    $("img").trigger("lazyLoadInstantly");

}

function addOptionsDiagram(options) {
    if (options['addOptionsDiagram']) {
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

                var autoscaleLow = false;
                var autoscaleHigh = false;

                var lowVal;
                if (dLow === "") {
                    lowVal = 15.0;
                    autoscaleLow = true;
                } else {
                    lowVal = parseFloat(dLow);
                }

                var highVal;
                if (dHigh === "") {
                    highVal = 23.0;
                    autoscaleHigh = true;
                } else {
                    highVal = parseFloat(dHigh);
                }
                var lowDate = "";
                var highDate = "";
                // Werte in Array aus 2-dim Arrays umwandeln:
                // i 0..al ist index von scrDiagArr, also ueber alle Tupel
                // j  0.. ist index von diagArr, also alle Werte innerhalb des Tupels

                var minTemp = 100.0;
                var maxTemp = -100.0;

                for (var i = 1; i <= al; i++) {
                    var t = srcDiagArr[i];
                    var tArr = t.split(",");
                    var v1 = tArr[0];
                    if (lowDate === "" || v1 < lowDate) {
                        lowDate = v1;
                    }
                    if (highDate === "" || v1 > highDate) {
                        highDate = v1;
                    }

                    var vh = parseFloat(tArr[2]);
                    if (vh < minTemp) {
                        minTemp = vh;
                    }
                    if (vh > maxTemp) {
                        maxTemp = vh;
                    }

                    for (j = 1; j < tArr.length; j++) {
                        var vArr = new Array();
                        vArr[0] = v1;
                        var v2 = tArr[j];
                        vArr[1] = v2;
                        diagArr[j - 1][i - 1] = vArr;
                    }
                }

                if (autoscaleLow) {
                    lowVal = minTemp - 1.0;
                    lowVal = Math.floor(lowVal);
                }
                if (autoscaleHigh) {
                    highVal = maxTemp + 1.0;
                    highVal = Math.ceil(highVal);
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

function addOptionsChannel(device, systemDate, options, operate) {
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
        deviceHTML += "<div class='ui-grid-b' style='border-top: dashed 1px;'>";
        deviceHTML += "<div class='ui-block-a'>";

        if (type === "HSSDP") {

            var channelID = channel['id'];
            var hssType = channel['hssType'];
            var channelDate = channel['date'];
            var vorDate = getTimeDiffString(channelDate, systemDate);
            var valString = channel['value'];
            var valBool = (valString === "true");
            var valUnit = mapUnit(channel['valueUnit'], hssType);
            var valMin = parseFloat(channel['valueMin']);
            var valMax = parseFloat(channel['valueMax']);

            if (hssType === "SETPOINT" || hssType === "SET_TEMPERATURE") {
                deviceHTML += addSetNumber(deviceID, channelID, 6.0, valUnit, 6, 30, 0.5, 1.0, "", false, true, true);

                var lowTemp = 3.0;
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
                    deviceHTML += addSetButton(deviceID, channelID, mapText(deviceHssType + "__" + hssType + "__VENT_CLOSED"), 0.0, "", true, false, false, true, false);
                }
                for (i = lowTemp; i <= highTemp; i += 1.0) {
                    deviceHTML += addSetButton(deviceID, channelID, i + valUnit, i, "", true, false, false, true, false);
                }
                if (hssType === "SETPOINT") {
                    deviceHTML += addSetButton(deviceID, channelID, mapText(deviceHssType + "__" + hssType + "__VENT_OPEN"), 100.0, "", true, false, false, true, false);
                }
                deviceHTML += "</div>";
            } else if (deviceHssType === "CLIMATECONTROL_RT_TRANSCEIVER" && (hssType.endsWith("MODE") || hssType.startsWith("PARTY"))) {
                if (hssType === "CONTROL_MODE") {
                    crt['deviceHTMLPostChannelGroupMode'] = valMin;
                } else if (hssType === "AUTO_MODE") {
                    crt['deviceHTMLPostChannelGroup'] += addSetButton(deviceID, channelID, mapText(deviceHssType + "__" + hssType), true, "", true, false, false, true);
                } else if (hssType === "MANU_MODE") {
                    crt['deviceHTMLPostChannelGroup'] += addSetButton(deviceID, channelID, mapText(deviceHssType + "__" + hssType), true, "", true, false, false, true);
                } else if (hssType === "BOOST_MODE") {
                    crt['deviceHTMLPostChannelGroup'] += addSetButton(deviceID, channelID, mapText(deviceHssType + "__" + hssType), true, "", true, false, false, true);
                } else if (hssType === "LOWERING_MODE" || hssType === "COMFORT_MODE") {
                    crt['deviceHTMLPostChannelGroup'] += addSetButton(deviceID, channelID, mapText(deviceHssType + "__" + hssType), true, "", true, false, false, true);
                } else if (hssType === "PARTY_TEMPERATURE") {
                    crt['PARTY_TEMPERATURE'] = valMin;
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
                deviceHTML += addSetButton(deviceID, channelID, mapText(deviceHssType + "__" + hssType + "__0"), 0, "", true, false, false, true);
                deviceHTML += addSetButton(deviceID, channelID, mapText(deviceHssType + "__" + hssType + "__1"), 1, "", true, false, false, true);
                deviceHTML += addSetButton(deviceID, channelID, mapText(deviceHssType + "__" + hssType + "__2"), 2, "", true, false, false, true);
                deviceHTML += addSetButton(deviceID, channelID, mapText(deviceHssType + "__" + hssType + "__3"), 3, "", true, false, false, true);
                deviceHTML += addSetButton(deviceID, channelID, mapText(deviceHssType + "__" + hssType + "__4"), 4, "", true, false, false, true);
                deviceHTML += addSetButton(deviceID, channelID, mapText(deviceHssType + "__" + hssType + "__5"), 5, "", true, false, false, true);
                deviceHTML += addSetButton(deviceID, channelID, mapText(deviceHssType + "__" + hssType + "__6"), 6, "", true, false, false, true);
                deviceHTML += "</div>";
            } else if (hssType === "COLOR" && deviceHssType === "RGBW_COLOR") {
                //mrlee HM-LC-RGBW-WM
                deviceHTML += "<span class='RGBW-Color'>";
                deviceHTML += addSetNumber(deviceID, channelID, valMin, valUnit, 0.0, 200.0, 1, 1, "", false, true, true);
                deviceHTML += "</span>";
            } else if (hssType === "LED_STATUS" && deviceHssType === "KEY") {
                switch (0) {
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
                deviceHTML += addSetNumber(deviceID, channelID, valMin, valUnit, 0.0, 1.0, 0.01, 100, "" + " | 0<span id='unit_ " + id + "'>" + valUnit + "</span> = " + mapText("CLOSE") + ", 100<span id='unit_ " + id + "'>" + valUnit + "</span> = " + mapText("OPEN"), false, true, true);
                deviceHTML += addSetControlGroup(deviceID, channelID, mapText("CLOSE_SHORT"), mapText("OPEN_SHORT"), "", valMin, true);
            } else if (hssType === "LEVEL" && deviceHssType === "WINMATIC") {
                deviceHTML += addSetNumber(deviceID, channelID, valMin, valUnit, -0.005, 1.0, 0.01, 100, "" + " | -0.5<span id='unit_ " + id + "'>" + valUnit + "</span> = " + mapText("LOCKED") + ", 0<span id='unit_ " + id + "'>" + valUnit + "</span> = " + mapText("CLOSE") + ", 100<span id='unit_ " + id + "'>" + valUnit + "</span> = " + mapText("OPEN"), false, true, true);
                deviceHTML += addSetControlGroup(deviceID, channelID, mapText("CLOSE_SHORT"), mapText("OPEN_SHORT"), "", valMin, true, addSetButton(deviceID, channelID, mapText("LOCK"), -0.005, "", true, false, false, true, false));
            } else if (hssType === "LEVEL" && (deviceHssType === "DIMMER" || deviceHssType === "VIRTUAL_DIMMER")) {
                deviceHTML += addSetNumber(deviceID, channelID, valMin, valUnit, 0.0, 1.0, 0.01, 100, "" + " | 0<span id='unit_ " + id + "'>" + valUnit + "</span> = " + mapText("OFF") + ", 100<span id='unit_ " + id + "'>" + valUnit + "</span> = " + mapText("ON"), false, true, true);
                deviceHTML += addSetControlGroup(deviceID, channelID, mapText("OFF"), mapText("ON"), "", valMin, true);
            } else if (hssType === "FREQUENCY" && deviceHssType === "DIGITAL_ANALOG_OUTPUT") {
                deviceHTML += addSetNumber(deviceID, channelID, valMin, valUnit, 0.0, 50000.0, 100.0, 1, "" + " | 0<span id='unit_ " + id + "'>" + valUnit + "</span> = " + mapText("MAX") + ", 50000<span id='unit_ " + id + "'>" + valUnit + "</span> = " + mapText("MIN"), false, true, true);
                deviceHTML += "<div data-role='controlgroup' data-type='horizontal'>";
                deviceHTML += addSetButton(deviceID, channelID, mapText("MAX"), 0.0, "", true, false, false, true);
                deviceHTML += addSetButton(deviceID, channelID, mapText("MED"), 30000.0, "", true, false, false, true);
                deviceHTML += addSetButton(deviceID, channelID, mapText("MIN"), 50000.0, "", true, false, false, true);
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
                    var status = mapState(hssType, deviceHssType, valMin, valBool);
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
                                v = valMin * faktor;
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
                    deviceHTML += "<img id='img" + picKey + "' class='ui-div-thumbnail ui-img-" + theme + " lazyLoadImage' data-original='../" + userFolder + "/img/ids/variables/" + picKey + ".png?" + channel['picdate'] + "' src='img/menu/variables.png'/>";
                    deviceHTML += "</div>";
                }
                if (options['varOptionsFirst'] === "d" || options['varOptionsFirst'] === "dk" || options['varOptionsFirst'] === "g" || options['varOptionsFirst'] === "h") {
                    options['addOptionsDiagram'] = true;
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

        deviceHTML += "</div>";
        if ((type === "HSSDP" && channel['writeable']) || type !== "HSSDP") {
            deviceHTML += "<div class='ui-block-b'>";
            deviceHTML += "<label>" + mapText("OPERATABLE") + ":&nbsp;";
            deviceHTML += "<input type='checkbox' data-role='flipswitch' name='flipswitch' data-key='operate' data-type='" + type + "' data-id='" + channel['id'] + "' data-on-text='" + mapText("YES") + "' data-off-text='" + mapText("NO") + "' " + (channel['operate'] ? "checked" : "") + "/>";
            deviceHTML += "</label>";
            deviceHTML += "</div>";
        } else {
            deviceHTML += "<div class='ui-block-b small-hidden'></div>";
        }
        deviceHTML += "<div class='ui-block-c'>";
        deviceHTML += "<label>" + mapText("VISIBILITY") + ":&nbsp;";
        deviceHTML += "<input type='checkbox' data-role='flipswitch' name='flipswitch' data-key='visible' data-type='devices' data-id='" + channel['id'] + "' data-on-text='" + mapText("YES") + "' data-off-text='" + mapText("NO") + "' " + (channel['visible'] ? "checked" : "") + "/>";
        deviceHTML += "</label>";
        deviceHTML += "</div>";
        deviceHTML += "</div>";
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

function processOptionsDevices(device, systemDate, options, operate) {
    var picKey = getPicKey(device['id'], "devices", null, true);
    var deviceHTML = "<li id='list" + device['id'] + "' style='display: table;' data-id='" + device['id'] + "'>";
    deviceHTML += "<div style='display: table-cell; width: 120px; vertical-align: top;'>";
    deviceHTML += "<div style='text-align: center; padding-right: 5px;'>";
    deviceHTML += "<img id='img" + device['id'] + "' class='ui-div-thumbnail ui-img-" + theme;
    if ($.inArray(picKey, picturesList) !== -1) {
        deviceHTML += " lazyLoadImage' data-original='../" + userFolder + "/img/ids/devices/" + picKey + ".png?" + device['picdate'];
    }
    deviceHTML += "' src='img/menu/devices.png' data-type='devices'/>";
    deviceHTML += "<a href='#' " + ($.inArray(picKey, picturesList) === -1 ? "class='ui-btn ui-mini ui-icon-delete ui-btn-icon-left ui-shadow ui-corner-all ui-state-disabled'" : "data-role='button' data-mini='true' data-icon='delete'") + " name='deletePic' id='deletePic" + device['id'] + "' data-id='" + device['id'] + "' data-pickey='" + picKey + "' data-type='devices'>" + mapText("DELETE") + "</a>";
    deviceHTML += "<h1>(" + device['id'] + ")</h1>";
    deviceHTML += "</div>";
    deviceHTML += "</div>";

    deviceHTML += "<form method='post' enctype='multipart/form-data' action='#' id='form" + device['id'] + "' style='display: table-cell; width: 100%;'>";
    deviceHTML += "<div class='ui-grid-b'>";
    deviceHTML += "<div class='ui-block-a'><input name='editName' data-id='" + device['id'] + "' data-type='devices' type='text' value='" + device['name'] + "' /></div>";
    deviceHTML += "<div class='ui-block-b small-hidden'></div>";
    deviceHTML += "<div class='ui-block-c'>";
    deviceHTML += "<label>" + mapText("VISIBILITY") + ":&nbsp;";
    deviceHTML += "<input type='checkbox' data-role='flipswitch' name='flipswitch' data-key='visible' data-type='devices' data-id='" + device['id'] + "' data-on-text='" + mapText("YES") + "' data-off-text='" + mapText("NO") + "' " + (device['visible'] ? "checked" : "") + "/>";
    deviceHTML += "</label>";
    deviceHTML += "</div>";
    deviceHTML += "</div>";

    if (device['type'] === "CHANNEL") {
        deviceHTML += addOptionsChannel(device, systemDate, options, operate);
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
        var float = false;
        if ($.inArray(picKey, picturesList) !== -1) {
            deviceHTML += "<div style='float: left; text-align: center; padding-right: 10px;'>";
            deviceHTML += "<img id='img" + picKey + "' class='ui-div-thumbnail ui-img-" + theme + " lazyLoadImage' data-original='../" + userFolder + "/img/ids/variables/" + picKey + ".png?" + device['picdate'] + "' src='img/menu/variables.png'/>";
            deviceHTML += "</div>";
        }
        if (options['varOptionsFirst'] === "d" || options['varOptionsFirst'] === "dk" || options['varOptionsFirst'] === "g" || options['varOptionsFirst'] === "h") {
            options['addOptionsDiagram'] = true;
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
            deviceHTML += addVariableField('', valID, device, vorDate, isReadOnly(valInfo), operate, float);
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
            deviceHTML += "<img id='img" + prgID + "' class='ui-div-thumbnail ui-img-" + theme + " lazyLoadImage' data-original='../" + userFolder + "/img/ids/programs/" + prgID + ".png?" + device['picdate'] + "' src='img/menu/programs.png'/>";
            deviceHTML += "</div>";
        }
        deviceHTML += addStartProgramButton('', prgID, mapText("RUN"), vorDate, operate);
    }

    // Ist leer, wenn (nv) oder ein leerer Channel.
    if (deviceHTML !== "") {
        deviceHTML += "</form>";
        deviceHTML += "</li>";
    }

    return deviceHTML;
}

$(function () {
    //Edit RFF  
    $(document.body).on("click", "[name='editRFF']", function () {
        var elem = $(this);
        editRFF(elem.data("id"), elem.data("client"), elem.data("type"));
    });
});


