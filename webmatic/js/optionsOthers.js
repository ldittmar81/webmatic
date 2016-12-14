/* global dataList, dataListHeader, theme, isPreRelease, newVersion, userFolder, client, clientsList, optionsMap, resultOptionsMap, specialTextVariables, specialTextVariablesOnlypic, picturesList, favoritesMap, roomsMap, functionsMap, programsMap, variablesMap, optionsClientMap, orgBgPic */

// ----------------------- Data loading functions ----------------------------

function loadGraphicIDs(type, global) {
    clearScreen();
    // "Lade..." anzeigen:
    $("#" + dataListHeader).append("<li><img src='img/misc/wait16.gif' width=12px height=12px class='ui-li-icon ui-img-" + theme + "'>" + mapText("LOADING") + "...</li>").listview("refresh");
    // Icon Animation in Refresh Button:
    $('.buttonRefresh .ui-btn-text').html("<img class='ui-img-" + theme + "' src='img/misc/wait16.gif' width=12px height=12px>");

    //Global
    if (localStorage.getItem(isPreRelease + "webmatic" + type + "Map") === null || localStorage.getItem(isPreRelease + "webmatic" + type + "Map") === "undefined") {
        if (newVersion) {
            saveDataToFile = true;
        }
        loadConfigData(false, '../' + userFolder + '/' + type + '.json', type, 'webmatic' + type + 'Map', false, false);
    } else {
        loadLocalStorageMap(type);
    }
    //Lokal
    if (localStorage.getItem(isPreRelease + "webmatic" + type + "clientMap") === null || localStorage.getItem(isPreRelease + "webmatic" + type + "clientMap") === "undefined") {
        if (client !== "") {
            loadConfigData(false, '../' + userFolder + '/' + type + client + '.json', type + "Client", 'webmatic' + type + 'clientMap', false, true);
        }
    } else {
        setClientMap(type, JSON.parse(localStorage.getItem(isPreRelease + "webmatic" + type + "clientMap")));
    }
    //Kombinieren
    createOneMap(type);

    loadConfigData(true, 'cgi/' + type + '.cgi', type, 'webmatic' + type + 'Map', false, true, function () {
        createOneMap(type);
    });

    var titleHtml = "<li data-role='list-divider' role='heading'>";
    if (global) {
        titleHtml += "<div style='float:left;'>" + mapText(type) + " (" + mapText("NOT_SELECTED") + ")</div>";
    } else {
        titleHtml += "<div style='float:left;'>" + mapText(type) + " (" + clientsList[client] + ")</div>";
    }
    if (client !== "") {
        titleHtml += "<div style='float:right;'>";
        titleHtml += "<a href='#' class='ui-btn ui-btn-inline ui-corner-all' name='changeGraphicIDEditModus' data-type='" + type + "' data-global='" + global + "'>" + (global ? clientsList[client] : mapText("NOT_SELECTED")) + "</a>";
        titleHtml += "</div>";
    }
    titleHtml += "</li>";

    $("#" + dataList).append(titleHtml);
    if (global) {
        processGraphicIDGlobal(type);
    } else {
        processGraphicIDClient(type);
    }

    $("#" + dataList).listview("refresh");
    $("img.lazyLoadImage").lazyload({event: "lazyLoadInstantly"});
    $("img").trigger("lazyLoadInstantly");

    // "Lade..." wieder entfernen und Überschrift anzeigen:
    $("#" + dataListHeader).empty();
    $("#" + dataListHeader).append("<li data-role='list-divider' role='heading'>" + mapText("EDIT") + "</li>");
    $("#" + dataListHeader).listview("refresh");

    // Animated Icon aus Refresh wieder entfernen:
    $('.buttonRefresh .ui-btn-text').html("&nbsp;");

    $("#" + dataList).listview("refresh");
    $("#" + dataList).fadeIn().enhanceWithin().trigger("fertig");
}

// ------------------------- Prozessors ---------------------------------

function processGraphicIDGlobal(type) {
    var map = getMap(type);
    var globalMap = getMap(type);

    var isVariables = type === "variables";
    var isTextVariables = false;
    var isListVariables = false;
    var isFloatVariables = false;
    var isPrograms = type === "programs";
    var isRoom = type === "rooms";
    var isFunction = type === "functions";
    var isFavorite = type === "favorites";
    var isRFF = isRoom || isFunction || isFavorite;
    var html = "";

    html += "<li><h1>" + mapText("SETTINGS") + "</h1>";
    html += "<div class='ui-field-contain'>";

    html += "<div class='ui-grid-b'>";
    html += "<div class='ui-block-f text-right'>";
    html += "<span>" + mapText("DIVIDE") + "</span>";
    html += "</div>";
    html += "<div class='ui-block-g'>";
    html += "<div data-role='controlgroup' data-type='horizontal' style='vertical-align:middle;'>";
    var selected1 = "";
    var selected2 = "";
    if (optionsMap[type + "_divisor"]) {
        selected1 = "class='ui-btn-active'";
    } else {
        selected2 = "class='ui-btn-active'";
    }
    html += "<a href='#' name='saveGlobalOption' data-reload='true' data-key='" + type + "_divisor' data-value='true' data-role='button' data-inline='true' " + selected1 + ">" + mapText("YES") + "</a>";
    html += "<a href='#' name='saveGlobalOption' data-reload='true' data-key='" + type + "_divisor' data-value='false' data-role='button' data-inline='true' " + selected2 + ">" + mapText("NO") + "</a>";
    html += "&nbsp;(" + mapText("RELOAD") + ")";
    html += "</div>";
    html += "</div>";
    html += "</div>";

    var size = $.isEmptyObject(globalMap['divisors']) ? 0 : $.keys(globalMap['divisors']).length;
    html += "<div class='ui-grid-b' id='dividerOptions' style='" + (optionsMap[type + "_divisor"] ? "" : "display: none;") + "'>";
    html += "<div class='ui-block-f text-right'>";
    html += "<span>" + mapText("ADD_DIVIDER") + "</span>";
    html += "</div>";
    html += "<div class='ui-block-g'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    html += "<input type='text' id='addDividerInput' value='' class='ui-no-corner-right' data-wrapper-class='controlgroup-textinput ui-btn'/>";
    html += "<a href='#' data-role='button' id='addDivider' data-type='" + type + "' data-size='" + size + "' data-inline='true' data-icon='plus'>&nbsp;</a>";
    html += "</div>";
    html += "</div>";
    html += "</div>";

    html += "<ul id='dataListDivisors' data-role='listview' data-inset='true' style='" + (optionsMap[type + "_divisor"] ? "" : "display: none;") + "'>";
    html += addDivisor(size, type);
    html += "</ul>";

    html += "</div>";
    html += "</li>";

    $("#" + dataList).append(html);

    var tmpObj = {};
    var size = map["size"];
    if (resultOptionsMap['default_sort_manually']) {
        map = recalculatePositions(map, type, false);
    }
    $.each(map, function (key, val) {
        if (key === "date" || key === "size" || key === "divisors") {
            return;
        }
        isTextVariables = isVariables && val["valueType"] === "20";
        isListVariables = isVariables && val["valueType"] === "16";
        isFloatVariables = isVariables && val["valueType"] === "4";
        var isSpecialTextVariables = isVariables && isTextVariables && ($.inArray(val["valueUnit"].toUpperCase(), specialTextVariables) !== -1);
        var hasOnlyPicVersion = isVariables && isTextVariables && ($.inArray(val["valueUnit"].toUpperCase(), specialTextVariablesOnlypic) !== -1);

        var picKey = getPicKey(key, type, val, true);
        html = "<li id='list" + key + "' data-id='" + key + "'>";
        html += "<div style='float: left;'>";
        html += "<div class='bgImgRow" + picKey + "' style='text-align: center; padding-right: 5px; " + (val['bgPic'] ? "" : "display:none;") + "'>";
        html += "<img id='imgBg" + key + "' class='ui-div-thumbnail ui-img-" + theme;
        if ($.inArray("imgBg" + picKey, picturesList) !== -1) {
            html += " lazyLoadImage' data-original='../" + userFolder + "/img/ids/" + type + "/imgBg" + picKey + ".png?" + val['picdate'];
        }
        html += "' src='img/misc/imgBg.png' data-type='" + type + "'/>";
        html += "<a href='#' " + ($.inArray("imgBg" + picKey, picturesList) === -1 ? "class='ui-btn ui-mini ui-icon-delete ui-btn-icon-left ui-shadow ui-corner-all ui-state-disabled'" : "data-role='button' data-mini='true' data-icon='delete'") + " name='deletePic' id='deletePicBg" + key + "' data-id='" + key + "' data-pickey='imgBg" + picKey + "' data-type='" + type + "' data-bg='true'>" + mapText("DELETE") + "</a>";
        html += "</div>";
        html += "<div style='text-align: center; padding-right: 5px;'>";
        html += "<img id='img" + key + "' class='ui-div-thumbnail ui-img-" + theme;
        if ($.inArray(picKey, picturesList) !== -1) {
            html += " lazyLoadImage' data-original='../" + userFolder + "/img/ids/" + type + "/" + picKey + ".png?" + val['picdate'];
        }
        html += "' src='img/menu/" + type + ".png' data-type='" + type + "'/>";
        html += "<a href='#' " + ($.inArray(picKey, picturesList) === -1 ? "class='ui-btn ui-mini ui-icon-delete ui-btn-icon-left ui-shadow ui-corner-all ui-state-disabled'" : "data-role='button' data-mini='true' data-icon='delete'") + " name='deletePic' id='deletePic" + key + "' data-id='" + key + "' data-pickey='" + picKey + "' data-type='" + type + "' data-faktor='" + val["faktor"] + "'>" + mapText("DELETE") + "</a>";
        html += "<h1>(";
        if (isRFF) {
            html += "<a href='get.html?id=" + key + "' target='_blank'>" + key + "</a>";
        } else {
            html += key;
        }
        html += ")</h1>";
        if (isFloatVariables) {
            html += createImgFloatList(key, val["faktor"] ? val["faktor"] : 1);
        }
        html += "</div>";
        html += "</div>";

        if (isRFF) {
            html += "<div class='top-right'>";
            html += "<a data-id='" + key + "' name='editRFF' data-client='false' data-type='" + type + "' class='ui-btn ui-btn-inline ui-icon-edit ui-btn-icon-notext ui-corner-all' />";
            html += "</div>";
        }

        if (resultOptionsMap['default_sort_manually']) {
            html += "<div style='float: right;'>";
            html += "<input type='hidden' name='position' id='position" + key + "' data-id='" + key + "' data-type='" + type + "' value='" + val['position'] + "' data-last='" + (size === val['position']) + "'/>";
            html += "<a href='#' class='ui-btn ui-btn-inline ui-icon-carat-u ui-btn-icon-notext ui-corner-all";
            if (val['position'] <= 1) {
                html += " ui-state-disabled' style='display: none;";
            }
            html += "' name='setUp' id='setUp" + key + "' data-id='" + key + "' />";
            html += "<a href='#' class='ui-btn ui-btn-inline ui-icon-carat-d ui-btn-icon-notext ui-corner-all";
            if (val['position'] >= size) {
                html += " ui-state-disabled' style='display: none;";
            }
            html += "' name='setDown' id='setDown" + key + "' data-id='" + key + "' />";
            html += "</div>";
        }

        html += "<form method='post' enctype='multipart/form-data' action='#' id='form" + key + "'>";
        html += "<div class='ui-grid-b'>";
        html += "<div class='ui-block-a'><input name='editName' data-id='" + key + "' data-type='" + type + "' type='text' value='" + val['name'] + "' /></div>";

        if ((isVariables && (!isSpecialTextVariables || hasOnlyPicVersion)) || isPrograms) {
            html += "<div class='ui-block-b'>";
            html += getHelpPage("Anzeige");
            html += "<label>" + mapText("ONLY_PIC") + ":&nbsp;";
            html += "<input type='checkbox' data-role='flipswitch' name='flipswitch' data-type='" + type + "' data-key='onlyPic' data-id='" + key + "' data-on-text='" + mapText("YES") + "' data-off-text='" + mapText("NO") + "' " + (val['onlyPic'] ? "checked" : "") + "/>";
            html += "</label>";
            html += "</div>";
        } else if (isSpecialTextVariables) {
            html += "<div class='ui-block-b small-hidden'></div>";
        } else if (isRFF) {
            html += "<div class='ui-block-b'>";
            html += "<label>" + mapText("BG_PIC") + ":&nbsp;";
            html += "<input type='checkbox' data-role='flipswitch' name='flipswitch' data-type='" + type + "' onchange='$(\".bgImgRow" + picKey + "\").toggle();' data-key='bgPic' data-id='" + key + "' data-on-text='" + mapText("YES") + "' data-off-text='" + mapText("NO") + "' " + (val['bgPic'] ? "checked" : "") + "/>";
            html += "</label>";
            html += "</div>";
            html += "<div class='ui-block-c small-hidden'></div>";
            html += "<div class='ui-block-a bgImgRow" + picKey + " text-right' style='" + (val['bgPic'] ? "" : "display:none;") + "'>";
            html += mapText(type + "_BGPIC") + ":";
            html += "</div>";
            html += "<div class='ui-block-b bgImgRow" + picKey + "' style='" + (val['bgPic'] ? "" : "display:none;") + "'>";
            html += "<input name='bgfile' id='bgfile" + key + "' data-pickey='imgBg " + picKey + "' type='file' accept='image/*' />";
            html += "</div>";
            html += "<div class='ui-block-c bgImgRow" + picKey + "' style='" + (val['bgPic'] ? "" : "display:none;") + "'><a href='#' name='uploadPicture' data-bg='true' data-type='" + type + "' id='uploadPictureBg" + key + "' class='ui-link ui-btn ui-icon-check ui-btn-icon-left ui-btn-inline ui-shadow ui-corner-all ui-state-disabled'>" + mapText("UPLOAD") + "</a></div>";

        }

        if (isVariables) {
            if (optionsMap["variables_divisor"]) {
                html += "<div class='ui-block-c'>";
                html += getDivisorSelectbox(type, val[type + "_divisor"], key);
                html += "</div>";
            } else {
                html += "<div class='ui-block-c small-hidden'></div>";
            }
        }
        if (isVariables && !isTextVariables) {
            html += "<div class='ui-block-a'>" + createExecutationField(key, val) + "</div>";
        } else if (isPrograms || isRFF) {
            html += "<div class='ui-block-a text-right'>" + mapText(type + "_PIC") + ":</div>";
        }
        html += "<div class='ui-block-b'>";
        html += "<input name='file' id='file" + key + "' data-pickey='" + picKey + "' type='file' accept='image/*' />";
        html += "</div>";
        html += "<div class='ui-block-c'><a href='#' name='uploadPicture' data-type='" + type + "' data-faktor='" + val["faktor"] + "' id='uploadPicture" + key + "' class='ui-link ui-btn ui-icon-check ui-btn-icon-left ui-btn-inline ui-shadow ui-corner-all ui-state-disabled'>" + mapText("UPLOAD") + "</a></div>";
        if (isListVariables) {
            html += "<div class='ui-block-a'>";
            html += "<div data-role='controlgroup' data-type='horizontal'>";
            html += "<select id='listType" + key + "' data-theme='" + theme + "'>";
            html += "<option value='auto' " + (val['listType'] === "auto" ? "selected='selected'" : "") + ">auto</option>";
            html += "<option value='small' " + (val['listType'] === "small" ? "selected='selected'" : "") + ">button</option>";
            html += "<option value='big' " + (val['listType'] === "big" ? "selected='selected'" : "") + ">select</option>";
            html += "</select>";
            html += "<a href='#' data-role='button' name='changeFloatSF' data-change='listType' data-id='" + key + "' data-inline='true' data-icon='check'>&nbsp;</a>";
            html += "</div>";
            html += "</div>";
        } else if (isFloatVariables) {
            html += "<div class='ui-block-a'>";
            html += "<div class='ui-grid-a'>";
            html += "<div class='ui-block-a'>";
            html += mapText('STEP') + ":&nbsp;";
            html += "<div data-role='controlgroup' data-type='horizontal'>";
            html += "<input type='number' id='step" + key + "' class='ui-no-corner-right' style='width: 50px;' value='" + val["step"] + "' data-wrapper-class='controlgroup-textinput ui-btn'/>";
            html += "<a href='#' data-role='button' name='changeFloatSF' data-change='step' data-id='" + key + "' data-inline='true' data-icon='check'>&nbsp;</a>";
            html += "</div>";
            html += "</div>";
            html += "<div class='ui-block-b'>";
            html += mapText('FACTOR') + ":&nbsp;";
            html += "<div data-role='controlgroup' data-type='horizontal'>";
            html += "<input type='number' id='faktor" + key + "' class='ui-no-corner-left' style='width: 50px;' value='" + val["faktor"] + "' data-wrapper-class='controlgroup-textinput ui-btn'/>";
            html += "<a href='#' data-role='button' name='changeFloatSF' data-change='faktor' data-id='" + key + "' data-inline='true' data-icon='check'>&nbsp;</a>";
            html += "</div>";
            html += "</div>";
            html += "<div class='ui-block-c'>";
            html += "<span>&nbsp;</span>";

            html += "</div>";
            html += "</div>";
            html += "</div>";
        } else if (optionsMap[type + "_divisor"] && !isVariables) {
            html += "<div class='ui-block-a'>";
            html += getDivisorSelectbox(type, val[type + "_divisor"], key);
            html += "</div>";
        } else {
            html += "<div class='ui-block-a small-hidden'></div>";
        }
        html += "<div class='ui-block-b";
        if (isPrograms || isVariables) {
            html += "'>";
            html += "<label>" + mapText("OPERATABLE") + ":&nbsp;";
            if (!isVariables) {
                html += "<input type='checkbox' data-role='flipswitch' name='flipswitch' data-key='operate' data-type='" + type + "' data-id='" + key + "' data-on-text='" + mapText("YES") + "' data-off-text='" + mapText("NO") + "' " + (val['operate'] ? "checked" : "") + "/>";
            } else {
                html += "<div data-role='controlgroup' data-type='horizontal'>";
                var selected1 = "";
                var selected2 = "";
                var selected3 = "";
                if (val['operate'] === "none") {
                    selected1 = "class='ui-btn-active'";
                } else if (val['operate']) {
                    selected2 = "class='ui-btn-active'";
                } else {
                    selected3 = "class='ui-btn-active'";
                }
                html += "<a href='#' name='editVarOperate' data-type='" + type + "' data-id='" + key + "' data-value='none' data-role='button' data-inline='true' " + selected1 + ">" + mapText("DEFAULT") + "</a>";
                html += "<a href='#' name='editVarOperate' data-type='" + type + "' data-id='" + key + "' data-value='true' data-role='button' data-inline='true' " + selected2 + ">" + mapText("YES") + "</a>";
                html += "<a href='#' name='editVarOperate' data-type='" + type + "' data-id='" + key + "' data-value='false' data-role='button' data-inline='true' " + selected3 + ">" + mapText("NO") + "</a>";
                html += "</div>";
            }
            html += "</label>";
        } else {
            html += " small-hidden'>";
        }
        html += "</div>";
        html += "<div class='ui-block-c'>";
        html += "<label>" + mapText("VISIBILITY") + ":&nbsp;";
        html += "<input type='checkbox' data-role='flipswitch' name='flipswitch' data-key='visible' data-type='" + type + "' data-id='" + key + "' data-on-text='" + mapText("YES") + "' data-off-text='" + mapText("NO") + "' " + (val['visible'] ? "checked" : "") + "/>";
        html += "</label>";
        html += "</div>";
        html += "</div>";
        html += "</form>";
        html += "</li>";
        if (resultOptionsMap['default_sort_manually']) {
            tmpObj[parseInt(val['position'])] = html;
        } else {
            tmpObj[val['name'].toLowerCase()] = html;
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
}

function processGraphicIDClient(type) {
    var map = getMap(type);
    var clientMap = getClientMap(type);

    var isVariables = type === "variables";
    var isTextVariables = false;
    var isListVariables = false;
    var isPrograms = type === "programs";
    var isRoom = type === "rooms";
    var isFunction = type === "functions";
    var isFavorite = type === "favorites";
    var isRFF = isRoom || isFunction || isFavorite;
    var html = "";

    var tmpObj = {};
    if (resultOptionsMap['default_sort_manually']) {
        map = recalculatePositions(map, type, false);
    }
    $.each(map, function (key, val) {
        if (key === "date" || key === "size" || key === "divisors") {
            return;
        }
        var clientVal = clientMap[key];
        isTextVariables = isVariables && val["valueType"] === "20";
        isListVariables = isVariables && val["valueType"] === "16";
        var isSpecialTextVariables = isVariables && isTextVariables && ($.inArray(val["valueUnit"].toUpperCase(), specialTextVariables) !== -1);
        var hasOnlyPicVersion = isVariables && isTextVariables && ($.inArray(val["valueUnit"].toUpperCase(), specialTextVariablesOnlypic) !== -1);

        var picKey = getPicKey(key, type, val, true);
        html = "<li id='list" + key + "' data-id='" + key + "'>";
        html += "<div style='float: left; text-align: center;'>";
        html += "<img id='img" + key + "' class='ui-div-thumbnail ui-img-" + theme;
        if ($.inArray(picKey, picturesList) !== -1) {
            html += " lazyLoadImage' data-original='../" + userFolder + "/img/ids/" + type + "/" + picKey + ".png?" + val['picdate'];
        }
        html += "' src='img/menu/" + type + ".png' data-type='" + type + "'/>";
        html += "<h1>(";
        if (isRFF) {
            html += "<a href='get.html?id=" + key + "' target='_blank'>" + key + "</a>";
        } else {
            html += key;
        }
        html += ")</h1>";
        html += "</div>";

        if (isRFF) {
            html += "<div class='top-right'>";
            html += "<a data-id=" + key + " name='editRFF' data-client='true' data-type='" + type + "' class='ui-btn ui-btn-inline ui-icon-edit ui-btn-icon-notext ui-corner-all' />";
            html += "</div>";
        }

        html += "<form method='post' action='#' id='form" + key + "'>";
        html += "<div class='ui-grid-b'>";
        html += "<div class='ui-block-a'><strong>" + val['name'] + "</strong></div>";
        if ((isVariables && (!isSpecialTextVariables || hasOnlyPicVersion)) || isPrograms) {
            html += "<div class='ui-block-b'>";
            html += getHelpPage("Anzeige");
            html += "<label>" + mapText("ONLY_PIC") + ":&nbsp;";
            html += "<div data-role='controlgroup' data-type='horizontal'>";
            var selected1 = "";
            var selected2 = "";
            var selected3 = "";
            if (clientVal === undefined || clientVal['onlyPic'] === undefined) {
                selected1 = "class='ui-btn-active'";
            } else if (clientVal['onlyPic'] === true) {
                selected2 = "class='ui-btn-active'";
            } else if (clientVal['onlyPic'] === false) {
                selected3 = "class='ui-btn-active'";
            }
            html += "<a href='#' name='flipswitchClient' data-type='" + type + "' data-id='" + key + "' data-key='onlyPic' data-value='global' data-role='button' data-inline='true' " + selected1 + ">" + mapText("NOT_SELECTED") + "</a>";
            html += "<a href='#' name='flipswitchClient' data-type='" + type + "' data-id='" + key + "' data-key='onlyPic' data-value='true' data-role='button' data-inline='true' " + selected2 + ">" + mapText("YES") + "</a>";
            html += "<a href='#' name='flipswitchClient' data-type='" + type + "' data-id='" + key + "' data-key='onlyPic' data-value='false' data-role='button' data-inline='true' " + selected3 + ">" + mapText("NO") + "</a>";
            html += "</div>";
            html += "</label>";
            html += "</div>";
        } else if (isSpecialTextVariables) {
            html += "<div class='ui-block-b small-hidden'></div>";
        } else if (isRFF) {
            html += "<div class='ui-block-b'>";
            html += "<label>" + mapText("BG_PIC") + ":&nbsp;";
            html += "<div data-role='controlgroup' data-type='horizontal'>";
            var selected1 = "";
            var selected2 = "";
            var selected3 = "";
            if (clientVal === undefined || clientVal['bgPic'] === undefined) {
                selected1 = "class='ui-btn-active'";
            } else if (clientVal['bgPic'] === true) {
                selected2 = "class='ui-btn-active'";
            } else if (clientVal['bgPic'] === false) {
                selected3 = "class='ui-btn-active'";
            }
            html += "<a href='#' name='flipswitchClient' data-type='" + type + "' data-id='" + key + "' onclick='$('.bgImgRow" + picKey + "').hide();' data-key='bgPic' data-value='global' data-role='button' data-inline='true' " + selected1 + ">" + mapText("NOT_SELECTED") + "</a>";
            html += "<a href='#' name='flipswitchClient' data-type='" + type + "' data-id='" + key + "' onclick='$('.bgImgRow" + picKey + "').show();' data-key='bgPic' data-value='true' data-role='button' data-inline='true' " + selected2 + ">" + mapText("YES") + "</a>";
            html += "<a href='#' name='flipswitchClient' data-type='" + type + "' data-id='" + key + "' onclick='$('.bgImgRow" + picKey + "').hide();' data-key='bgPic' data-value='false' data-role='button' data-inline='true' " + selected3 + ">" + mapText("NO") + "</a>";
            html += "</div>";
            html += "</label>";
            html += "</div>";
            html += "<div class='ui-block-c small-hidden'></div>";
        }

        if (isRFF) {
            var hasClientBg = !(clientVal === undefined || clientVal['bgPic'] === undefined || clientVal['bgPic'] === false);
            html += "<div class='ui-block-a bgImgRow" + picKey + "' style='" + (hasClientBg ? "" : "display:none;") + "'>";
            html += "<div style='float: left; text-align: center; padding-right: 5px;'>";
            html += "<img id='imgBg" + key + "' class='ui-div-thumbnail ui-img-" + theme;
            if ($.inArray("imgBg" + picKey + client, picturesList) !== -1) {
                html += " lazyLoadImage' data-original='../" + userFolder + "/img/ids/" + type + "/imgBg" + picKey + client + ".png?" + val['picdate'];
            }
            html += "' src='img/misc/imgBg.png' data-type='" + type + "'/>";
            html += "<a href='#' " + ($.inArray("imgBg" + picKey + client, picturesList) === -1 ? "class='ui-btn ui-mini ui-icon-delete ui-btn-icon-left ui-shadow ui-corner-all ui-state-disabled'" : "data-role='button' data-mini='true' data-icon='delete'") + " name='deletePic' id='deletePicBg" + key + "' data-id='" + key + "' data-pickey='imgBg" + picKey + client + "' data-type='" + type + "' data-client='true' data-bg='true'>" + mapText("DELETE") + "</a>";
            html += "</div>";
            html += "</div>";
            html += "<div class='ui-block-b bgImgRow" + picKey + "' style='" + (hasClientBg ? "" : "display:none;") + "'>";
            html += "<input name='bgfile' id='bgfile" + key + "' type='file' data-pickey='imgBg " + picKey + client + "' accept='image/*' />";
            html += "</div>";
            html += "<div class='ui-block-c bgImgRow" + picKey + "' style='" + (hasClientBg ? "" : "display:none;") + "'><a href='#' name='uploadPicture' data-bg='true' data-client='true' data-type='" + type + "' id='uploadPictureBg" + key + "' class='ui-link ui-btn ui-icon-check ui-btn-icon-left ui-btn-inline ui-shadow ui-corner-all ui-state-disabled'>" + mapText("UPLOAD") + "</a></div>";
        }

        if (isVariables) {
            if (optionsMap["variables_divisor"]) {
                html += "<div class='ui-block-c'>";
                html += getDivisorSelectbox(type, val[type + "_divisor"], key, true, clientVal);
                html += "</div>";
            } else {
                html += "<div class='ui-block-c small-hidden'></div>";
            }
        }

        if (isVariables && !isTextVariables) {
            html += "<div class='ui-block-a'>" + createExecutationField(key, val) + "</div>";
        } else {
            html += "<div class='ui-block-a small-hidden'></div>";
        }

        html += "<div class='ui-block-b";
        if (isPrograms || isVariables) {
            html += "'>";
            html += "<label>" + mapText("OPERATABLE") + ":&nbsp;";
            if (!isVariables) {
                html += "<div data-role='controlgroup' data-type='horizontal'>";
                var selected1 = "";
                var selected2 = "";
                var selected3 = "";
                if (clientVal === undefined || clientVal['operate'] === undefined) {
                    selected1 = "class='ui-btn-active'";
                } else if (clientVal['operate'] === true) {
                    selected2 = "class='ui-btn-active'";
                } else if (clientVal['operate'] === false) {
                    selected3 = "class='ui-btn-active'";
                }
                html += "<a href='#' name='flipswitchClient' data-type='" + type + "' data-id='" + key + "' data-key='operate' data-value='global' data-role='button' data-inline='true' " + selected1 + ">" + mapText("NOT_SELECTED") + "</a>";
                html += "<a href='#' name='flipswitchClient' data-type='" + type + "' data-id='" + key + "' data-key='operate' data-value='true' data-role='button' data-inline='true' " + selected2 + ">" + mapText("YES") + "</a>";
                html += "<a href='#' name='flipswitchClient' data-type='" + type + "' data-id='" + key + "' data-key='operate' data-value='false' data-role='button' data-inline='true' " + selected3 + ">" + mapText("NO") + "</a>";
                html += "</div>";
            } else {
                html += "<div data-role='controlgroup' data-mini='true' data-type='horizontal'>";
                var selected0 = "";
                var selected1 = "";
                var selected2 = "";
                var selected3 = "";
                if (clientVal === undefined || clientVal['operate'] === undefined) {
                    selected0 = "class='ui-btn-active'";
                } else if (clientVal['operate'] === "none") {
                    selected1 = "class='ui-btn-active'";
                } else if (clientVal['operate'] === true) {
                    selected2 = "class='ui-btn-active'";
                } else if (clientVal['operate'] === false) {
                    selected3 = "class='ui-btn-active'";
                }
                html += "<a href='#' name='editVarOperateClient' data-type='" + type + "' data-id='" + key + "' data-value='global' data-role='button' data-inline='true' " + selected0 + ">" + mapText("NOT_SELECTED") + "</a>";
                html += "<a href='#' name='editVarOperateClient' data-type='" + type + "' data-id='" + key + "' data-value='none' data-role='button' data-inline='true' " + selected1 + ">" + mapText("DEFAULT") + "</a>";
                html += "<a href='#' name='editVarOperateClient' data-type='" + type + "' data-id='" + key + "' data-value='true' data-role='button' data-inline='true' " + selected2 + ">" + mapText("YES") + "</a>";
                html += "<a href='#' name='editVarOperateClient' data-type='" + type + "' data-id='" + key + "' data-value='false' data-role='button' data-inline='true' " + selected3 + ">" + mapText("NO") + "</a>";
                html += "</div>";
            }
            html += "</label>";
        } else {
            html += " small-hidden'>";
        }
        html += "</div>";

        html += "<div class='ui-block-c'>";
        html += "<label>" + mapText("VISIBILITY") + ":&nbsp;";
        html += "<div data-role='controlgroup' data-type='horizontal'>";
        var selected1 = "";
        var selected2 = "";
        var selected3 = "";
        if (clientVal === undefined || clientVal['visible'] === undefined) {
            selected1 = "class='ui-btn-active'";
        } else if (clientVal['visible'] === true) {
            selected2 = "class='ui-btn-active'";
        } else if (clientVal['visible'] === false) {
            selected3 = "class='ui-btn-active'";
        }
        html += "<a href='#' name='flipswitchClient' data-type='" + type + "' data-id='" + key + "' data-key='visible' data-value='global' data-role='button' data-inline='true' " + selected1 + ">" + mapText("NOT_SELECTED") + "</a>";
        html += "<a href='#' name='flipswitchClient' data-type='" + type + "' data-id='" + key + "' data-key='visible' data-value='true' data-role='button' data-inline='true' " + selected2 + ">" + mapText("YES") + "</a>";
        html += "<a href='#' name='flipswitchClient' data-type='" + type + "' data-id='" + key + "' data-key='visible' data-value='false' data-role='button' data-inline='true' " + selected3 + ">" + mapText("NO") + "</a>";
        html += "</div>";
        html += "</label>";
        html += "</div>";

        if (isListVariables) {
            html += "<div class='ui-block-a'>";
            html += "<div data-role='controlgroup' data-type='horizontal'>";
            html += "<select id='listType" + key + "' data-theme='" + theme + "'>";
            var gs = "global";
            if (clientVal === undefined || clientVal['listType'] === undefined) {
                gs = "global";
            } else {
                gs = clientVal['listType'];
            }
            html += "<option value='global' " + (gs === "global" ? "selected='selected'" : "") + ">Global: " + val['listType'] + "</option>";
            html += "<option value='auto' " + (gs === "auto" ? "selected='selected'" : "") + ">auto</option>";
            html += "<option value='small' " + (gs === "small" ? "selected='selected'" : "") + ">button</option>";
            html += "<option value='big' " + (gs === "big" ? "selected='selected'" : "") + ">select</option>";
            html += "</select>";
            html += "<a href='#' data-role='button' name='changeFloatSFClient' data-change='listType' data-id='" + key + "' data-inline='true' data-icon='check'>&nbsp;</a>";
            html += "</div>";
            html += "</div>";
        } else if (optionsMap[type + "_divisor"] && !isVariables) {
            html += "<div class='ui-block-a'>";
            html += getDivisorSelectbox(type, val[type + "_divisor"], key, true, clientVal);
            html += "</div>";
        }


        html += "</div>";
        html += "</form>";
        html += "</li>";

        if (resultOptionsMap['default_sort_manually']) {
            tmpObj[parseInt(val['position'])] = html;
        } else {
            tmpObj[val['name'].toLowerCase()] = html;
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
}

// ------------------------- OnDocumentReady -----------------------------

$(function () {

    //Settings  
    $(document.body).on("click", "[id^=setUp]", function () {
        var thisId = $(this).data("id");
        var thisList = $("#list" + thisId);
        var height = thisList.height();

        var before = thisList.prev();
        var beforeId = before.data("id");

        var oldPosition = parseInt($("#position" + thisId).val());
        var isLast = $("#position" + thisId).data("last");
        var newPosition = parseInt($("#position" + beforeId).val());
        $("#position" + thisId).val(newPosition);
        $("#position" + beforeId).val(oldPosition);
        if (newPosition === 1) {
            $("#setUp" + thisId).addClass("ui-state-disabled").hide();
            $("#setUp" + beforeId).removeClass("ui-state-disabled").show();
        }
        if (isLast) {
            $("#position" + thisId).data("last", false);
            $("#position" + beforeId).data("last", true);
            $("#setDown" + thisId).removeClass("ui-state-disabled").show();
            $("#setDown" + beforeId).addClass("ui-state-disabled").hide();
        }

        thisList.animate({top: '-' + height + 'px'}, 500, function () {
            before.animate({top: height + 'px'}, 500, function () {
                thisList.css('top', '0px');
                before.css('top', '0px');
                thisList.insertBefore(before);
            });
        });

        var type = $("#position" + thisId).data("type");

        var reorderMenu = false;
        if (type.endsWith("Divisor")) {
            type = type.substring(0, type.length - 7);
            var mapDiv = getMap(type);
            var originObj = mapDiv['divisors'];
            originObj[thisId]['position'] = newPosition;
            originObj[beforeId]['position'] = oldPosition;
            mapDiv['divisors'] = originObj;
            reorderMenu = type === "favorites" || type === "rooms" || type === "functions";
        } else {
            var map = getMap(type);
            map[thisId]['position'] = newPosition;
            map[beforeId]['position'] = oldPosition;
        }

        if (reorderMenu) {
            var thisList2 = $("#" + type + thisId + "MainMenu");
            var before2 = thisList2.prev();
            thisList2.insertBefore(before2);
        }

        createOneMap(type);

        activateSettingSaveButton();
    });

    $(document.body).on("click", "[id^=setDown]", function () {
        var thisId = $(this).data("id");
        var thisList = $("#list" + thisId);
        var height = thisList.height();

        var after = thisList.next();
        var afterId = after.data("id");

        var oldPosition = parseInt($("#position" + thisId).val());
        var isLast = $("#position" + afterId).data("last");
        var newPosition = parseInt($("#position" + afterId).val());
        $("#position" + thisId).val(newPosition);
        $("#position" + afterId).val(oldPosition);

        if (oldPosition === 1) {
            $("#setUp" + afterId).addClass("ui-state-disabled").hide();
            $("#setUp" + thisId).removeClass("ui-state-disabled").show();
        }
        if (isLast) {
            $("#position" + thisId).data("last", true);
            $("#position" + afterId).data("last", false);
            $("#setDown" + thisId).addClass("ui-state-disabled").hide();
            $("#setDown" + afterId).removeClass("ui-state-disabled").show();
        }

        thisList.animate({top: height + 'px'}, 500, function () {
            after.animate({top: '-' + height + 'px'}, 500, function () {
                thisList.css('top', '0px');
                after.css('top', '0px');
                thisList.insertAfter(after);
            });
        });

        var type = $("#position" + thisId).data("type");

        var reorderMenu = false;
        if (type.endsWith("Divisor")) {
            type = type.substring(0, type.length - 7);
            var mapDiv = getMap(type);
            var originObj = mapDiv['divisors'];
            originObj[thisId]['position'] = newPosition;
            originObj[afterId]['position'] = oldPosition;
            mapDiv['divisors'] = originObj;
            reorderMenu = type === "favorites" || type === "rooms" || type === "functions";
        } else {
            var map = getMap(type);
            map[thisId]['position'] = newPosition;
            map[afterId]['position'] = oldPosition;
        }

        if (reorderMenu) {
            var thisList2 = $("#" + type + thisId + "MainMenu");
            var before2 = thisList2.prev();
            thisList2.insertAfter(before2);
        }

        createOneMap(type);

        activateSettingSaveButton();
    });

    //Divisor
    $(document.body).on("click", "#addDivider", function () {
        var $elem = $(this);
        var sizeNew = parseInt($elem.attr('data-size')) + 1;
        var type = $elem.data("type");
        var key = 0;
        var map = getMap(type);
        if ($.isEmptyObject(map['divisors'])) {
            key = 1;
        } else {
            key = Math.max.apply(Math, $.keys(map['divisors'])) + 1;
        }
        var value = {};
        var $input = $("#addDividerInput");
        value['name'] = $input.val();
        value['position'] = sizeNew;
        var originObj = map['divisors'];
        originObj[key] = value;
        map['divisors'] = originObj;
        $input.val('');

        createOneMap(type);

        optionsMap[type + key] = true;
        saveOptionsToServer(type + key, true, false);

        $('#dataListDivisors').html(addDivisor(sizeNew, type)).enhanceWithin();
        $elem.attr("data-size", sizeNew);

        activateSettingSaveButton(true);
    });

    $(document.body).on("change", "[name='saveDivisor']", function () {
        var obj = $(this);
        var id = obj.data("id");
        var key = obj.data("key");
        var type = obj.data("type");
        var selected = obj.val();

        if ($.isNumeric(selected)) {
            selected = parseInt(selected);
        }
        var map = getMap(type);
        map[id][key] = selected;

        createOneMap(type);

        activateSettingSaveButton(true);
    });

    $(document.body).on("click", "[name='deleteDivider']", function () {
        var obj = $(this);
        var id = obj.data("id");
        var type = obj.data("type").substring(0, type.length - 7);

        var mapDiv = getMap(type);
        var originObj = mapDiv['divisors'];
        delete  originObj[id];
        mapDiv['divisors'] = originObj;
        $.each(mapDiv, function (key, val) {
            if (key === "date" || key === "size" || key === "divisors") {
                return;
            }
            if (val[type + '_divisor'] === id) {
                mapDiv[key][type + '_divisor'] = "unsorted";
            }
        });

        recalculatePositions(mapDiv, type, true);

        $("#" + type + id + "MainMenu").fadeOut(500).remove();
        $("#list" + id).fadeOut(500).remove();

        createOneMap(type);

        activateSettingSaveButton(true);

    });

    $(document.body).on("change", "[name='flipswitch']", function () {
        var obj = $(this);
        var id = obj.data("id");
        var type = obj.data("type");
        var key = obj.data("key");
        var checked = obj.prop('checked');

        if (type === "favorites" || type === "rooms" || type === "functions") {
            if (checked) {
                $("#" + id).fadeIn(1000);
            } else {
                $("#" + id).fadeOut(1000);
            }
        }

        var map = getMap(type);
        map[id][key] = checked;

        createOneMap(type);

        activateSettingSaveButton();
    });

    $(document.body).on("click", "[name='flipswitchClient']", function () {
        var obj = $(this);
        var id = obj.data("id");
        var type = obj.data("type");
        var key = obj.data("key");
        var value = obj.data('value');

        $(this).parent().children().removeClass("ui-btn-active");
        $(this).addClass("ui-btn-active");

        if (type === "favorites" || type === "rooms" || type === "functions") {
            var show = value;
            if (value === "global") {
                var tmpMap = getMap(type);
                show = tmpMap[id][key];
            }
            if (show) {
                $("#" + id).fadeIn(1000);
            } else {
                $("#" + id).fadeOut(1000);
            }
        }

        var clientMap = getClientMap(type);
        if (clientMap === undefined) {
            clientMap = {};
        }
        if (value === "global") {
            if (clientMap[id] !== undefined) {
                var tmpMap = clientMap[id];
                delete tmpMap[key];
                clientMap[id] = tmpMap;
            }
        } else {
            var tmpMap = clientMap[id];
            if (tmpMap === undefined) {
                tmpMap = {};
            }
            tmpMap[key] = value;
            clientMap[id] = tmpMap;
        }

        createOneMap(type);

        activateSettingSaveButton(false, true);
    });

    $(document.body).on("click", "[name='editVarOperate']", function () {
        var obj = $(this);
        var id = obj.data("id");
        var checked = obj.data('value');

        $(this).parent().children().removeClass("ui-btn-active");
        $(this).addClass("ui-btn-active");

        variablesMap[id]['operate'] = checked;

        createOneMap("variables");

        activateSettingSaveButton();
    });

    $(document.body).on("click", "[name='changeFloatSF']", function () {
        var obj = $(this);
        var id = obj.data("id");
        var toChange = obj.data("change");
        var value = $("#" + toChange + id).val();

        variablesMap[id][toChange] = value;

        var tmpMap = variablesMap[id];
        if ("faktor" === toChange || "step" === toChange) {
            $('#mainNumber' + id).replaceWith(addSetNumber(0, id, parseFloat(tmpMap["valueMin"]), tmpMap['valueUnit'], parseFloat(tmpMap["valueMin"]), parseFloat(tmpMap["valueMax"]), tmpMap["step"] ? tmpMap["step"] : 1, tmpMap["faktor"] ? tmpMap["faktor"] : 1, "", false, true, true));
        } else if ("listType" === toChange) {
            $('#mainNumber' + id).replaceWith(addSetValueList(0, id, "0", tmpMap['valueList'], tmpMap['valueUnit'], "", false, true, tmpMap['listType'], true));
        }
        $('#mainNumber' + id).enhanceWithin();

        createOneMap("variables");

        activateSettingSaveButton();
    });

    $(document.body).on("change", "[name='editName']", function () {
        var obj = $(this);
        var id = obj.data("id");
        var name = obj.val();
        var type = obj.data("type");

        var renameMenu = false;
        if (type.endsWith("Divisor")) {
            type = type.substring(0, type.length - 7);
            var mapDiv = getMap(type);
            var originObj = mapDiv['divisors'];
            originObj[id]['name'] = name;
            mapDiv['divisors'] = originObj;
            renameMenu = type === "favorites" || type === "rooms" || type === "functions";
        } else {
            var map = getMap(type);
            map[id]['name'] = name;
        }

        $("#menuText" + type + id).fadeOut(500, function () {
            $("#menuText" + type + id).text(name).fadeIn(1000);
        });

        if (renameMenu) {
            $('#' + type + id + "MainMenu").find(".ui-collapsible-heading-toggle").text(name);
        }

        createOneMap(type);

        activateSettingSaveButton();
    });

    $(document.body).on("click", "[name='changeGraphicIDEditModus']", function () {
        var obj = $(this);
        var global = obj.data("global");
        var type = obj.data("type");
        loadGraphicIDs(type, !global);
    });

    // ------------------------- Bilder -----------------------------

    $(document.body).on("click", "[name=setImgFloat]", function () {
        $("#optionssetValue_" + $(this).data("id")).val($(this).text()).slider("refresh");
        $("#optionssetButton_" + $(this).data("id")).click();
    });

    $(document.body).on("click", "[id^=optionssetButton],[id^=optionssetValueBigList]", function () {
        var dataID = $(this).data("id");
        var orgValue = $(this).data("value");
        var value = orgValue;
        if (typeof orgValue === "undefined") {
            var valueID = "optionssetValue_" + dataID;
            orgValue = $("#" + valueID).val();
            value = orgValue;
            if (typeof orgValue === "undefined") {
                orgValue = $('#selector_' + dataID).val();
                value = orgValue;
            }
            var factor = $("#" + valueID).data("factor");
            if (typeof factor !== "undefined") {
                $('#optionsValueSpan' + dataID).text(value);
                orgValue = parseFloat(orgValue);
                factor = parseFloat(factor);
                orgValue = orgValue / factor;
                value = orgValue;
                var testList = $.grep(picturesList, function (item) {
                    var regex = new RegExp("^" + dataID, "i");
                    return item.trim().match(regex);
                });

                var myValue = parseFloat($("#" + valueID).attr("min"));
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
        }
        var picKey = dataID + "_" + value;
        $("#file" + dataID).attr("data-pickey", dataID + "_" + orgValue);
        var type = $("#img" + dataID).data("type");

        if ($(this).data("icon") !== "check") {
            $(this).parent().children().removeClass("ui-btn-active");
            $(this).addClass("ui-btn-active");
        }

        $("#img" + dataID).fadeOut(500, function () {
            var date = new Date();
            var url = "img/menu/" + type + ".png";
            if ($.inArray(picKey, picturesList) !== -1) {
                url = "../" + userFolder + "/img/ids/" + type + "/" + picKey + ".png?" + date.getTime();
                $("#deletePic" + dataID).removeClass("ui-state-disabled");
            } else {
                $("#deletePic" + dataID).addClass("ui-state-disabled");
            }
            $("#img" + dataID).attr("src", url).fadeIn(1000);
            $("#deletePic" + dataID).attr("data-pickey", picKey);
        });
    });

    $(document.body).on("click", "[name='deletePic']", function () {
        var obj = $(this);
        var type = obj.data("type");
        var id = obj.data("id");
        var picKey = obj.attr("data-pickey");
        var faktor = obj.data("faktor");
        var isBg = obj.data('bg');
        var isClient = obj.data('client');

        $.get('cgi/delete.cgi?type=' + type + '&name=' + picKey + '&folder=' + userFolder, function () {
            $("#img" + (isBg ? "Bg" : "") + id).fadeOut(500, function () {
                $("#img" + (isBg ? "Bg" : "") + id).attr("src", "img/menu/" + type + ".png").fadeIn(1000);
            });
            if (!isBg) {
                $("#menuImg" + id).fadeOut(500, function () {
                    $("#menuImg" + id).attr("src", "img/menu/" + type + ".png").fadeIn(1000);
                });
            }

            var i = picturesList.indexOf(picKey);
            if (i !== -1) {
                picturesList.splice(i, 1);
            }

            if (faktor !== "undefined") {
                $("#imgFloatList" + id).replaceWith(createImgFloatList(id, parseFloat(faktor)));
                $("#" + dataList).listview("refresh");
                $("#" + dataList).enhanceWithin();
            }

            if (isBg) {
                var map = getMap(type);
                if (isClient) {
                    var clientMap = getClientMap(type);
                    delete clientMap['bgPicSize'];
                    var resultMap = getResultMap(type);
                    resultMap['bgPicSize'] = map['bgPicSize'];
                    saveClientOptionsToServer();
                } else {
                    map['bgPicSize'] = orgBgPic;
                    saveOptionsToServer('bgPicSize', orgBgPic, false);
                }
            }

            obj.addClass("ui-state-disabled");
        });
    });

    $(document.body).on("change", ":file", function () {
        var file = this.files[0];

        if (file.name.length < 1) {
        } else if (file.type !== 'image/png' && file.type !== 'image/jpg' && !file.type !== 'image/gif' && file.type !== 'image/jpeg') {
            //TODO alert ist nicht schön... muss noch ersetzt werden
            alert(mapText("IMAGE_UPLOAD"));
        } else {
            var id = $(this).attr('id');
            var isBg = id.startsWith("bg");
            var key = id.substr(isBg ? 6 : 4, id.length);
            $("#uploadPicture" + (isBg ? "Bg" : "") + key).removeClass("ui-state-disabled");
        }
    });

    $(document.body).on("click", 'a[name=uploadPicture]', function () {
        var obj = $(this);
        var id = obj.attr('id');
        var isBg = obj.data('bg');
        var key = id.substr(isBg ? 15 : 13, id.length);
        var type = obj.data('type');
        var isClient = obj.data('client');
        var picKey = $("#" + (isBg ? "bg" : "") + "file" + key).attr("data-pickey");
        var faktor = obj.data("faktor");

        var formData = new FormData();

        var file = document.getElementById((isBg ? "bg" : "") + 'file' + key).files[0];
        var reader = new FileReader();
        reader.onloadend = function () {
            var tempImg = new Image();
            tempImg.src = reader.result;
            tempImg.onload = function () {

                var tempW = tempImg.width;
                var tempH = tempImg.height;
                var orgImgSize = {"width": tempW, "height": tempH};

                if (!isBg) {
                    var MAX_WIDTH = 160;
                    var MAX_HEIGHT = 160;

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

                $("#img" + (isBg ? "Bg" : "") + key).fadeOut(500, function () {
                    $("#img" + (isBg ? "Bg" : "") + key).attr("src", dataURL).fadeIn(1000);
                });

                if (!isBg) {
                    $("#menuImg" + key).fadeOut(500, function () {
                        $("#menuImg" + key).attr("src", dataURL).fadeIn(1000);
                    });
                }

                formData.append('file', blob, (isBg ? "imgBg" : "") + picKey + '.png');
                formData.append('filename', (isBg ? "imgBg" : "") + picKey + '.png');
                formData.append('path', '/usr/local/etc/config/addons/www/' + userFolder + '/img/ids/' + type + '/');

                $.ajax({
                    url: 'cgi/upload.cgi', //server script to process data
                    type: 'POST',
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false
                }, 'json').done(function () {
                    if ($.inArray(picKey, picturesList) === -1) {
                        picturesList.push(picKey);
                        if (faktor !== "undefined") {
                            $("#imgFloatList" + key).replaceWith(createImgFloatList(key, parseFloat(faktor)));
                            $("#" + dataList).listview("refresh");
                            $("#" + dataList).enhanceWithin();
                        }
                        if (isBg) {
                            if (isClient) {
                                var clientMap = getClientMap(type);
                                clientMap['bgPicSize'] = orgImgSize;
                                var resultMap = getResultMap(type);
                                resultMap['bgPicSize'] = orgImgSize;
                                saveClientOptionsToServer('bgPicSize', orgImgSize);
                            } else {
                                var map = getMap(type);
                                map['bgPicSize'] = orgImgSize;
                                saveOptionsToServer('bgPicSize', orgImgSize, false);
                            }
                        }
                    }
                    reloadDatePicCache(type, key);
                });

            };
            $("#uploadPicture" + (isBg ? "Bg" : "") + key).addClass("ui-state-disabled");
            $("#deletePic" + (isBg ? "Bg" : "") + key).removeClass("ui-state-disabled");
        };
        reader.readAsDataURL(file);
    });

});