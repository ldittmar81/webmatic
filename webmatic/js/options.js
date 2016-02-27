/* global dataList, dataListHeader, optionsMap, theme, wmLang, clientsList, isTempClient, client, optionsClientMap, resultOptionsMap, debugModus, favoritesMap, roomsMap, functionsMap, programsMap, variablesMap, mustBeSaved, newVersion, picturesList, resultRoomsMap, mustReload */

// ----------------------- Helper functions ----------------------------

function activateSettingSaveButton(reload) {
    $('[name="saveAllChanges"]').removeClass('ui-state-disabled');
    mustBeSaved = true;
    mustReload = reload;
}

function saveOptionsToServer(key, value, reload) {
    localStorage.setItem("webmaticoptionsMap", JSON.stringify(optionsMap));
    $.post('cgi/saveconfig.cgi', {name: "config", text: JSON.stringify(optionsMap)}).done(function () {
        if (reload) {
            location.reload(true);
        }
    });
    createOneMap("config", key, value);
}

function saveClientOptionsToServer(key, value) {
    localStorage.setItem("webmaticoptionsclientMap", JSON.stringify(optionsClientMap));
    if (client !== "") {
        $.post('cgi/saveconfig.cgi', {name: "config" + client, text: JSON.stringify(optionsClientMap)});
    }
    if (key) {
        checkAndChange(key, value);
    }
}

function saveAllDatasToServer() {

    localStorage.setItem("webmaticfavoritesMap", JSON.stringify(favoritesMap));
    localStorage.setItem("webmaticroomsMap", JSON.stringify(roomsMap));
    localStorage.setItem("webmaticfunctionsMap", JSON.stringify(functionsMap));
    localStorage.setItem("webmaticprogramsMap", JSON.stringify(programsMap));
    localStorage.setItem("webmaticvariablesMap", JSON.stringify(variablesMap));

    $.post('cgi/saveconfig.cgi', {name: "favorites", text: JSON.stringify(favoritesMap)});
    $.post('cgi/saveconfig.cgi', {name: "rooms", text: JSON.stringify(roomsMap)});
    $.post('cgi/saveconfig.cgi', {name: "functions", text: JSON.stringify(functionsMap)});
    $.post('cgi/saveconfig.cgi', {name: "programs", text: JSON.stringify(programsMap)});
    $.post('cgi/saveconfig.cgi', {name: "variables", text: JSON.stringify(variablesMap)});

    if (mustReload) {
        location.reload(true);
    }
    mustBeSaved = false;
    $('[name="saveAllChanges"]').addClass('ui-state-disabled');
}

function createExecutationField(key, map) {
    var valueType = map["valueType"];
    var valueUnit = map["valueUnit"];

    if (valueType === "2") {
        return addSetBoolButtonList(0, key, "false", map["valueName0"], map["valueName1"], valueUnit, "", false, true, true);
    } else if (valueType === "4") {
        return addSetNumber(0, key, parseFloat(map["valueMin"]), valueUnit, parseFloat(map["valueMin"]), parseFloat(map["valueMax"]), map["step"] ? map["step"] : 1, map["faktor"] ? map["faktor"] : 1, "", false, true, true);
    } else if (valueType === "16") {
        return addSetValueList(0, key, "0", map['valueList'], valueUnit, "", false, true, map['listType'], true);
    }
}

// ----------------------- Data loading functions ----------------------------

function loadOptions() {
    $("#" + dataList).empty();
    $("#" + dataListHeader).empty();

    $("#" + dataListHeader).append("<li data-role='list-divider' role='heading'>" + mapText("OPTIONS") + "</li>");

    $("#" + dataList).append(processOptionsGlobalTheme());
    $("#" + dataList).append(processOptionsGlobalAnzeige());
    $("#" + dataList).append(processOptionsGlobalVariables());
    $("#" + dataList).append(processOptionsGlobalClients());
    $("#" + dataList).append(processOptionsGlobalHistorian());
    $("#" + dataList).append(processOptionsGlobalOthers());

    $("#" + dataListHeader).listview("refresh");
    $("#" + dataList).listview("refresh");
    $("#" + dataList).fadeIn().enhanceWithin().trigger("fertig");
}

function loadOptionsClient() {
    $("#" + dataList).empty();
    $("#" + dataListHeader).empty();

    $("#" + dataListHeader).append("<li data-role='list-divider' role='heading'>" + mapText("OPTIONS_CLIENT") + " (" + clientsList[client] + ")</li>");

    if (isTempClient) {
        $("#" + dataList).append("<li sytle='text-align:center;'><a href='#' data-role='button' data-inline='true' onclick='location.reload(true);' data-icon='refresh'>" + mapText("END_CLIENT_MODUS") + "</a></li>");
    }

    $("#" + dataList).append(processOptionsClientTheme());
    $("#" + dataList).append(processOptionsClientAnzeige());
    $("#" + dataList).append(processOptionsClientVariables());

    $("#" + dataListHeader).listview("refresh");
    $("#" + dataList).listview("refresh");
    $("#" + dataList).fadeIn().enhanceWithin().trigger("fertig");
}

function loadGraphicIDs(type) {
    $("#" + dataList).empty();
    $("#" + dataListHeader).empty();
    // "Lade..." anzeigen:
    $("#" + dataListHeader).append("<li><img src='img/misc/wait16.gif' width=12px height=12px class='ui-li-icon ui-img-" + theme + "'>" + mapText("LOADING") + "...</li>").listview("refresh");
    // Icon Animation in Refresh Button:
    $('.buttonRefresh .ui-btn-text').html("<img class='ui-img-" + theme + "' src='img/misc/wait16.gif' width=12px height=12px>");

    $("#" + dataList).append("<li sytle='text-align:center;'><a href='#' " + (!mustBeSaved ? "class='ui-btn ui-btn-inline ui-icon-check ui-btn-icon-left ui-shadow ui-corner-all ui-state-disabled'" : "data-role='button' data-inline='true' data-icon='check'") + " name='saveAllChanges'>" + mapText("SAVE") + "</a></li>");

    //Global
    if (localStorage.getItem("webmatic" + type + "Map") === null || localStorage.getItem("webmatic" + type + "Map") === "undefined") {
        if (newVersion) {
            saveDataToFile = true;
        }
        loadConfigData(false, '../webmatic_user/' + type + '.json', type, 'webmatic' + type + 'Map', false, false);
    } else {
        loadLocalStorageMap(type);
    }
    //Lokal
    if (localStorage.getItem("webmatic" + type + "clientMap") === null || localStorage.getItem("webmatic" + type + "clientMap") === "undefined") {
        if (client !== "") {
            loadConfigData(false, '../webmatic_user/' + type + client + '.json', type + "Client", 'webmatic' + type + 'clientMap', false, true);
        }
    } else {
        setResultMap(type, JSON.parse(localStorage.getItem("webmatic" + type + "clientMap")));
    }
    //Kombinieren
    createOneMap(type);

    loadConfigData(true, 'cgi/' + type + '.cgi', type, 'webmatic' + type + 'Map', false, true, function () {
        createOneMap(type);
    });

    $("#" + dataList).append("<li data-role='list-divider' role='heading'>" + mapText(type) + "</li>");
    processGraphicID(type);

    $("#" + dataList).append("<li sytle='text-align:center;'><a href='#' " + (!mustBeSaved ? "class='ui-btn ui-btn-inline ui-icon-check ui-btn-icon-left ui-shadow ui-corner-all ui-state-disabled'" : "data-role='button' data-inline='true' data-icon='check'") + " name='saveAllChanges'>" + mapText("SAVE") + "</a></li>");

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

function processOptionsGlobalTheme() {

    //Themeauswahl
    var html = "<li><h1>" + mapText("CHOOSE_THEME") + "</h1>";
    html += "<div class='ui-field-contain'>";
    html += "<div class='ui-grid-b'>";
    //Aussehen
    html += "<div class='ui-block-f text-right'>";
    html += "<span>" + mapText("DESIGN") + "</span>";
    html += "</div>";
    html += "<div class='ui-block-g'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    html += "<select id='global_default_theme' data-theme='" + theme + "'>";
    var globalTheme = optionsMap["default_theme"];
    html += "<option value='wma' " + (globalTheme === "wma" ? "selected='selected'" : "") + ">" + mapText("DEFAULT") + "</option>";
    html += "<option value='wmb' " + (globalTheme === "wmb" ? "selected='selected'" : "") + ">" + mapText("BLACK") + "</option>";
    html += "<option value='wmc' " + (globalTheme === "wmc" ? "selected='selected'" : "") + ">" + mapText("PINK") + "</option>";
    html += "<option value='wmd' " + (globalTheme === "wmd" ? "selected='selected'" : "") + ">" + mapText("GREEN") + "</option>";
    html += "<option value='wme' " + (globalTheme === "wme" ? "selected='selected'" : "") + ">" + mapText("YELLOW") + "</option>";
    html += "<option value='wmf' " + (globalTheme === "wmf" ? "selected='selected'" : "") + ">" + mapText("GREY") + "</option>";
    html += "<option value='wmg' " + (globalTheme === "wmg" ? "selected='selected'" : "") + ">" + mapText("BLUE") + "</option>";
    html += "<option value='wmh' " + (globalTheme === "wmh" ? "selected='selected'" : "") + ">" + mapText("RED") + "</option>";
    html += "<option value='wmi' " + (globalTheme === "wmi" ? "selected='selected'" : "") + ">" + mapText("BROWN") + "</option>";
    html += "<option value='wmj' " + (globalTheme === "wmj" ? "selected='selected'" : "") + ">" + mapText("WHITE") + "</option>";
    html += "<option value='wmk' " + (globalTheme === "wmk" ? "selected='selected'" : "") + ">" + mapText("BRAZIL") + "</option>";
    html += "<option value='wml' " + (globalTheme === "wml" ? "selected='selected'" : "") + ">" + mapText("GERMANY") + "</option>";
    html += "</select>";
    html += "<a href='#' name='saveGlobalOption' data-key='default_theme' data-role='button' data-inline='true' data-icon='check'>&nbsp;</a>";
    html += "</div>";
    html += "</div>";
    //Schriftart
    html += "<div class='ui-block-f text-right'>";
    html += "<span>" + mapText("FONT") + "</span>";
    html += "</div>";
    html += "<div class='ui-block-g'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    html += "<select id='global_default_font' data-theme='" + theme + "'>";
    var globalFont = optionsMap["default_font"];
    html += "<option value='a' " + (globalFont === "a" ? "selected='selected'" : "") + ">Normal</option>";
    html += "<option value='b' " + (globalFont === "b" ? "selected='selected'" : "") + ">Koch Fraktur</option>";
    html += "<option value='c' " + (globalFont === "c" ? "selected='selected'" : "") + ">Planet Benson</option>";
    html += "<option value='d' " + (globalFont === "d" ? "selected='selected'" : "") + ">Action Man</option>";
    html += "<option value='e' " + (globalFont === "e" ? "selected='selected'" : "") + ">Amadeus</option>";
    html += "<option value='f' " + (globalFont === "f" ? "selected='selected'" : "") + ">Vamp</option>";
    html += "<option value='g' " + (globalFont === "g" ? "selected='selected'" : "") + ">HennyPenny</option>";
    html += "<option value='h' " + (globalFont === "h" ? "selected='selected'" : "") + ">Anglican</option>";
    html += "<option value='i' " + (globalFont === "i" ? "selected='selected'" : "") + ">Nosifer</option>";
    html += "<option value='j' " + (globalFont === "j" ? "selected='selected'" : "") + ">Pacifico</option>";
    html += "<option value='k' " + (globalFont === "k" ? "selected='selected'" : "") + ">Sixties</option>";
    html += "<option value='l' " + (globalFont === "l" ? "selected='selected'" : "") + ">Crackman</option>";
    html += "</select>";
    html += "<a href='#' name='saveGlobalOption' data-key='default_font' data-role='button' data-inline='true' data-icon='check'>&nbsp;</a>";
    html += "</div>";
    html += "</div>";
    //Sprache
    html += "<div class='ui-block-f text-right'>";
    html += "<span>" + mapText("LANGUAGE") + "</span>";
    html += "</div>";
    html += "<div class='ui-block-g'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    html += "<select id='change_lang' data-theme='" + theme + "'>";
    html += "<option value='de' " + (wmLang === "de" ? "selected='selected'" : "") + ">" + mapText("DE") + "</option>";
    html += "<option value='en' " + (wmLang === "en" ? "selected='selected'" : "") + ">" + mapText("EN") + "</option>";
    html += "<option value='es' " + (wmLang === "es" ? "selected='selected'" : "") + ">" + mapText("ES") + "</option>";
    html += "<option value='fr' " + (wmLang === "fr" ? "selected='selected'" : "") + ">" + mapText("FR") + "</option>";
    html += "<option value='pt' " + (wmLang === "pt" ? "selected='selected'" : "") + ">" + mapText("PT") + "</option>";
    html += "<option value='ru' " + (wmLang === "ru" ? "selected='selected'" : "") + ">" + mapText("RU") + "</option>";
    html += "<option value='tr' " + (wmLang === "tr" ? "selected='selected'" : "") + ">" + mapText("TR") + "</option>";
    html += "<option value='zh' " + (wmLang === "zh" ? "selected='selected'" : "") + ">" + mapText("ZH") + "</option>";
    html += "</select>";
    html += "<a href='#' name='change_lang' data-role='button' data-inline='true' data-icon='refresh'>" + mapText("RELOAD") + "</a>";
    html += "</div>";
    html += "<a href='http://homematic-forum.de/forum/viewtopic.php?f=39&t=28751' target='_blank' class='ui-btn ui-btn-inline ui-icon-info ui-btn-icon-notext ui-corner-all' />";
    html += "</div>";
    //Größe der Menübilder
    html += "<div class='ui-block-f text-right'>";
    html += "<span>" + mapText("GRAPHICS_SIZE") + "</span>";
    html += "</div>";
    html += "<div class='ui-block-g'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    var gfxSize = optionsMap["default_menugfxsize"];
    var selected1 = "";
    var selected2 = "";
    if (gfxSize === "small") {
        selected1 = "class='ui-btn-active'";
    } else {
        selected2 = "class='ui-btn-active'";
    }
    html += "<a href='#' name='saveGlobalOption' data-key='default_menugfxsize' data-value='small' data-role='button' data-inline='true' " + selected1 + ">" + mapText("SMALL") + "</a>";
    html += "<a href='#' name='saveGlobalOption' data-key='default_menugfxsize' data-value='large' data-role='button' data-inline='true' " + selected2 + ">" + mapText("BIG") + "</a>";
    html += "</div>";
    html += "</div>";
    //Zwei Seiten Version
    html += "<div class='ui-block-f text-right'>";
    html += "<span>" + mapText("TWO_SITES_VERSION") + "</span>";
    html += "</div>";
    html += "<div class='ui-block-g'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    var selected1 = "";
    var selected2 = "";
    var globalTwoSites = optionsMap["two_sites"];
    if (globalTwoSites) {
        selected1 = "class='ui-btn-active'";
    } else {
        selected2 = "class='ui-btn-active'";
    }
    html += "<a href='#' name='saveGlobalOption' data-key='two_sites' data-value='true' data-role='button' data-inline='true' " + selected1 + ">" + mapText("YES") + "</a>";
    html += "<a href='#' name='saveGlobalOption' data-key='two_sites' data-value='false' data-role='button' data-inline='true' " + selected2 + ">" + mapText("NO") + "</a>";
    html += "</div>";
    html += "</div>";
    //Two Sites Transition
    html += "<div name='globalTwoSitesTransitionDiv' class='ui-block-f text-right' " + (globalTwoSites ? "" : "style='display: none;'") + ">";
    html += "<span>" + mapText("TWO_SITES_TRANSITION") + "</span>";
    html += "</div>";
    html += "<div name='globalTwoSitesTransitionDiv' class='ui-block-g' " + (globalTwoSites ? "" : "style='display: none;'") + ">";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    html += "<select id='global_transition' data-theme='" + theme + "'>";
    var globalTransition = optionsMap["transition"];
    html += "<option value='flip' " + (globalTransition === "flip" ? "selected='selected'" : "") + ">flip</option>";
    html += "<option value='slide' " + (globalTransition === "slide" ? "selected='selected'" : "") + ">slide</option>";
    html += "<option value='slideup' " + (globalTransition === "slideup" ? "selected='selected'" : "") + ">slideup</option>";
    html += "<option value='slidedown' " + (globalTransition === "slidedown" ? "selected='selected'" : "") + ">slidedown</option>";
    html += "<option value='pop' " + (globalTransition === "pop" ? "selected='selected'" : "") + ">pop</option>";
    html += "<option value='fade' " + (globalTransition === "fade" ? "selected='selected'" : "") + ">fade</option>";
    html += "</select>";
    html += "<a href='#' name='saveGlobalOption' data-key='transition' data-role='button' data-inline='true' data-icon='check'>&nbsp;</a>";
    html += "</div>";
    html += "</div>";
    //Columns
    html += "<div class='ui-block-f text-right'>";
    html += "<span>" + mapText("NUMBER_OF_COLUMNS") + "</span>";
    html += "</div>";
    html += "<div class='ui-block-g'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    html += "<select id='global_columns' data-theme='" + theme + "'>";
    var globalColumns = optionsMap["columns"];
    html += "<option value='1' " + (globalColumns === 1 ? "selected='selected'" : "") + ">1</option>";
    html += "<option value='2' " + (globalColumns === 2 ? "selected='selected'" : "") + ">2</option>";
    html += "<option value='3' " + (globalColumns === 3 ? "selected='selected'" : "") + ">3</option>";
    html += "<option value='4' " + (globalColumns === 4 ? "selected='selected'" : "") + ">4</option>";
    html += "<option value='5' " + (globalColumns === 5 ? "selected='selected'" : "") + ">auto</option>";
    html += "</select>";
    html += "<a href='#' name='saveGlobalOption' data-key='columns' data-role='button' data-inline='true' data-icon='check'>&nbsp;</a>";
    html += "</div>";
    html += "</div>";

    html += "</div></div></li>";
    return html;

}

function processOptionsGlobalAnzeige() {
    //Anzeige
    var html = "<li><h1>" + mapText("MENU") + "</h1>";
    html += "<div class='ui-field-contain'>";
    html += "<div class='ui-grid-b'>";
    html += createGlobalMenuOptions("favorites");
    html += createGlobalMenuOptions("rooms");
    html += createGlobalMenuOptions("functions");
    html += createGlobalMenuOptions("variables");
    html += createGlobalMenuOptions("programs");
    //Einstellungen anzeigen
    html += "<div class='ui-block-f text-right'>";
    html += "<span style='color: red;'>" + mapText("SETTINGS") + " " + mapText("SHOW") + "</span>";
    html += "</div>";
    html += "<div class='ui-block-g'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    var selected1 = "class='" + (optionsMap["others"] ? "ui-btn-active" : "") + (optionsMap["no_more_settings"] === 0 ? " ui-state-disabled" : "") + "'";
    var selected2 = "class='" + (!optionsMap["others"] ? "ui-btn-active" : "") + (optionsMap["no_more_settings"] === 0 ? " ui-state-disabled" : "") + "'";
    html += "<a href='#' name='saveGlobalOption' data-key='others' data-value='true' data-role='button' data-inline='true' " + selected1 + ">" + mapText("YES") + "</a>";
    html += "<a href='#' name='saveGlobalOption' data-key='others' data-value='false' data-role='button' data-inline='true' " + selected2 + ">" + mapText("NO") + "</a>";
    html += "</div>";
    html += "</div>";
    //Was ist standardmäßig auf
    html += "<div class='ui-block-f text-right'>";
    html += "<span>" + mapText("DEFAULT_OPEN") + "</span>";
    html += "</div>";
    html += "<div class='ui-block-g'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    html += "<select id='global_collapsed' data-theme='" + theme + "'>";
    var globalColapsed = optionsMap["collapsed"];
    html += getSelectColapsedOptions("favorites", globalColapsed);
    html += getSelectColapsedOptions("rooms", globalColapsed);
    html += getSelectColapsedOptions("functions", globalColapsed);
    html += getSelectColapsedOptions("variables", globalColapsed);
    html += getSelectColapsedOptions("programs", globalColapsed);
    html += "<option value='others' " + (globalColapsed === "others" ? "selected='selected'" : "") + ">" + mapText("SETTINGS") + "</option>";
    html += "</select>";
    html += "<a href='#' name='saveGlobalOption' data-key='collapsed' data-role='button' data-inline='true' data-icon='check'>&nbsp;</a>";
    html += "</div>";
    html += "</div>";
    //Standardmäßig nur lesend
    html += "<div class='ui-block-f text-right'>";
    html += "<span>" + mapText("DEFAULT_SORT") + "</span>";
    html += "</div>";
    html += "<div class='ui-block-g'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    selected1 = "";
    selected2 = "";
    if (optionsMap["default_sort_manually"]) {
        selected1 = "class='ui-btn-active'";
    } else {
        selected2 = "class='ui-btn-active'";
    }
    html += "<a href='#' name='saveGlobalOption' data-key='default_sort_manually' data-reload='true' data-value='true' data-role='button' data-icon='refresh' data-inline='true' " + selected1 + ">" + mapText("MANUALLY") + "</a>";
    html += "<a href='#' name='saveGlobalOption' data-key='default_sort_manually' data-reload='true' data-value='false' data-role='button' data-icon='refresh' data-inline='true' " + selected2 + ">" + mapText("ALPHABETICAL") + "</a>";
    html += "</div>";
    html += "</div>";

    html += "</div></div></li>";
    return html;

}

function processOptionsGlobalVariables() {

    //Variablen
    var html = "<li><h1>" + mapText("WORKSPACE") + "</h1>";
    html += "<div class='ui-field-contain'>";
    html += "<div class='ui-grid-b'>";
    //Standardmäßig nur lesend
    html += "<div class='ui-block-f text-right'>";
    html += "<span>" + mapText("DEFAULT_READONLY") + "</span>";
    html += "</div>";
    html += "<div class='ui-block-g'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    var selected1 = "";
    var selected2 = "";
    if (optionsMap["systemvar_readonly"]) {
        selected1 = "class='ui-btn-active'";
    } else {
        selected2 = "class='ui-btn-active'";
    }
    html += "<a href='#' name='saveGlobalOption' data-key='systemvar_readonly' data-value='true' data-role='button' data-inline='true' " + selected1 + ">" + mapText("YES") + "</a>";
    html += "<a href='#' name='saveGlobalOption' data-key='systemvar_readonly' data-value='false' data-role='button' data-inline='true' " + selected2 + ">" + mapText("NO") + "</a>";
    html += "</div>";
    html += "</div>";
    //Beschreibung ausblenden
    html += "<div class='ui-block-f text-right'>";
    html += "<span>" + mapText("SHOW_DESCRIPTION") + "</span>";
    html += "</div>";
    html += "<div class='ui-block-g'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    var selected1 = "";
    var selected2 = "";
    if (optionsMap["show_description"]) {
        selected1 = "class='ui-btn-active'";
    } else {
        selected2 = "class='ui-btn-active'";
    }
    html += "<a href='#' name='saveGlobalOption' data-key='show_description' data-value='true' data-role='button' data-inline='true' " + selected1 + ">" + mapText("YES") + "</a>";
    html += "<a href='#' name='saveGlobalOption' data-key='show_description' data-value='false' data-role='button' data-inline='true' " + selected2 + ">" + mapText("NO") + "</a>";
    html += "</div>";
    html += "</div>";
    //Beschreibung ausblenden
    html += "<div class='ui-block-f text-right'>";
    html += "<span>" + mapText("SHOW_LAST_TIME_USED") + "</span>";
    html += "</div>";
    html += "<div class='ui-block-g'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    var selected1 = "";
    var selected2 = "";
    if (optionsMap["show_lastUsedTime"]) {
        selected1 = "class='ui-btn-active'";
    } else {
        selected2 = "class='ui-btn-active'";
    }
    html += "<a href='#' name='saveGlobalOption' data-key='show_lastUsedTime' data-value='true' data-role='button' data-inline='true' " + selected1 + ">" + mapText("YES") + "</a>";
    html += "<a href='#' name='saveGlobalOption' data-key='show_lastUsedTime' data-value='false' data-role='button' data-inline='true' " + selected2 + ">" + mapText("NO") + "</a>";
    html += "</div>";
    html += "</div>";

    html += "</div></div></li>";
    return html;
}

function processOptionsGlobalClients() {
    var html = "";
    //Clients
    if (Object.keys(clientsList).length > 1) {
        html = "<li><h1>Clients</h1>";
        html += "<div class='ui-field-contain'>";
        html += "<div class='ui-grid-b'>";

        $.each(clientsList, function (key, value) {
            html += "<div class='ui-block-a text-right' name='title_client_div_" + key.replace(/\./g, "_") + "'>";
            html += "<span>" + mapText("CLIENT_TITLE") + ": " + key + "</span>";
            html += "</div>";
            html += "<div class='ui-block-b' name='title_client_div_" + key.replace(/\./g, "_") + "'>";
            html += "<input type='text' id='title_client_" + key.replace(/\./g, "_") + "' value='" + value + "' />";
            html += "</div>";
            html += "<div class='ui-block-c' name='title_client_div_" + key.replace(/\./g, "_") + "'>";
            html += "<a href='#' name='title_client' data-key='" + key + "' data-role='button' data-inline='true'>" + mapText("SAVE") + "</a>";
            html += "</div>";
        });

        html += "<div class='ui-block-f text-right'>";
        html += "<span>" + mapText("CLIENT_SETTINGS") + "</span>";
        html += "</div>";
        html += "<div class='ui-block-g'>";
        html += "<div data-role='controlgroup' data-type='horizontal'>";
        html += "<select id='choose_tmp_client' data-theme='" + theme + "'>";
        html += "<option value=''>" + mapText("CHOOSE") + "</option>";
        $.each(clientsList, function (key, value) {
            html += "<option value='" + key + "' " + (client === key ? "selected='selected'" : "") + ">" + value + "</option>";
        });
        html += "</select>";
        html += "<a href='#' name='choose_tmp_client' data-role='button' data-inline='true' data-icon='refresh'>" + mapText("RELOAD") + "</a>";
        html += "</div>";
        html += "</div>";

        html += "<div class='ui-block-f text-right'>";
        html += "<span>" + mapText("DELETE_SETTINGS") + "</span>";
        html += "</div>";
        html += "<div class='ui-block-g'>";
        html += "<div data-role='controlgroup' data-type='horizontal'>";
        html += "<select id='delete_client' data-theme='" + theme + "'>";
        html += "<option value=''>" + mapText("CHOOSE") + "</option>";
        $.each(clientsList, function (key, value) {
            html += "<option value='" + key + "'>" + value + "</option>";
        });
        html += "</select>";
        html += "<a href='#' name='delete_client' data-role='button' data-inline='true' data-icon='delete'>" + mapText("DELETE") + "</a>";
        html += "</div>";
        html += "</div>";

        html += "</div></div></li>";
    }
    return html;
}

function processOptionsGlobalHistorian() {

    //CCU-Historian
    var html = "<li><h1>CCU-Historian</h1>";
    html += "<p>&nbsp;</p>";
    html += "<div class='ui-field-contain'>";
    html += "<div class='editButton'>";
    html += "<a href='http://homematic-forum.de/forum/viewtopic.php?f=39&t=28274' target='_blank' class='ui-btn ui-btn-inline ui-icon-info ui-btn-icon-notext ui-corner-all' />";
    html += "</div>";
    html += "<div class='ui-grid-b'>";
    html += "<div class='ui-block-a text-right'>";
    html += "CCU-Historian Link";
    html += "</div>";
    html += "<div class='ui-block-b'>";
    html += "<input type='text' id='global_ccu_historian' value='" + optionsMap['ccu_historian'] + "' placeholder='http://192.168.xx.xxx' />";
    html += "</div>";
    html += "<div class='ui-block-c'>";
    html += "/historian/index.html ";
    html += "<a href='#' name='saveGlobalOption' data-key='ccu_historian' data-role='button' data-inline='true'>" + mapText("SAVE") + "</a>";
    html += "</div>";

    html += "</div></div></li>";

    return html;
}

function processOptionsGlobalOthers() {

    //Sonstiges
    var html = "<li><h1>" + mapText("OTHERS") + "</h1>";
    html += "<div class='ui-field-contain'>";
    html += "<div class='ui-grid-b'>";
    //Meldung über neue Updates
    html += "<div class='ui-block-f text-right'>";
    html += "<span>" + mapText("NEW_UPDATES_WARNING") + "</span>";
    html += "</div>";
    html += "<div class='ui-block-g'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    html += "<select id='global_new_version' data-theme='" + theme + "'>";
    var globalNewUpdates = optionsMap["new_version"];
    html += "<option value='no'>" + mapText("NO") + "</option>";
    html += "<option value='stable' " + (globalNewUpdates === "stable" ? "selected='selected'" : "") + ">" + mapText("STABLE") + "</option>";
    html += "<option value='alpha' " + (globalNewUpdates === "alpha" ? "selected='selected'" : "") + ">" + mapText("ALPHA") + "</option>";
    html += "</select>";
    html += "<a href='#' name='saveGlobalOption' data-key='new_version' data-role='button' data-inline='true' data-icon='check'>&nbsp;</a>";
    html += "</div>";
    html += "</div>";
    //Versehentliches Verlassen der Seite verhindern
    html += "<div class='ui-block-f text-right'>";
    html += "<span>" + mapText("DONT_LEAVE") + "</span>";
    html += "</div>";
    html += "<div class='ui-block-g'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    var selected1 = "";
    var selected2 = "";
    if (optionsMap["dont_leave"]) {
        selected1 = "class='ui-btn-active'";
    } else {
        selected2 = "class='ui-btn-active'";
    }
    html += "<a href='#' name='saveGlobalOption' data-key='dont_leave' data-value='true' data-role='button' data-inline='true' " + selected1 + ">" + mapText("YES") + "</a>";
    html += "<a href='#' name='saveGlobalOption' data-key='dont_leave' data-value='false' data-role='button' data-inline='true' " + selected2 + ">" + mapText("NO") + "</a>";
    html += "</div>";
    html += "</div>";

    html += "</div></div></li>";
    return html;

}

function processOptionsClientTheme() {

    //Themeauswahl
    var html = "<li><h1>" + mapText("CHOOSE_THEME") + "</h1>";
    html += "<div class='ui-field-contain'>";
    html += "<div class='ui-grid-b'>";
    //Aussehen
    html += "<div class='ui-block-f text-right'>";
    html += "<span>" + mapText("DESIGN") + "</span>";
    html += "</div>";
    html += "<div class='ui-block-g'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    html += "<select id='client_default_theme' data-theme='" + theme + "'>";
    var clientTheme = optionsClientMap["default_theme"];
    html += "<option value='none'>" + mapText("NOT_SELECTED") + "</option>";
    html += "<option value='wma' " + (clientTheme === "wma" ? "selected='selected'" : "") + ">" + mapText("DEFAULT") + "</option>";
    html += "<option value='wmb' " + (clientTheme === "wmb" ? "selected='selected'" : "") + ">" + mapText("BLACK") + "</option>";
    html += "<option value='wmc' " + (clientTheme === "wmc" ? "selected='selected'" : "") + ">" + mapText("PINK") + "</option>";
    html += "<option value='wmd' " + (clientTheme === "wmd" ? "selected='selected'" : "") + ">" + mapText("GREEN") + "</option>";
    html += "<option value='wme' " + (clientTheme === "wme" ? "selected='selected'" : "") + ">" + mapText("YELLOW") + "</option>";
    html += "<option value='wmf' " + (clientTheme === "wmf" ? "selected='selected'" : "") + ">" + mapText("GREY") + "</option>";
    html += "<option value='wmg' " + (clientTheme === "wmg" ? "selected='selected'" : "") + ">" + mapText("BLUE") + "</option>";
    html += "<option value='wmh' " + (clientTheme === "wmh" ? "selected='selected'" : "") + ">" + mapText("RED") + "</option>";
    html += "<option value='wmi' " + (clientTheme === "wmi" ? "selected='selected'" : "") + ">" + mapText("BROWN") + "</option>";
    html += "<option value='wmj' " + (clientTheme === "wmj" ? "selected='selected'" : "") + ">" + mapText("WHITE") + "</option>";
    html += "<option value='wmk' " + (clientTheme === "wmk" ? "selected='selected'" : "") + ">" + mapText("BRAZIL") + "</option>";
    html += "<option value='wml' " + (clientTheme === "wml" ? "selected='selected'" : "") + ">" + mapText("GERMANY") + "</option>";
    html += "</select>";
    html += "<a href='#' name='saveClientOption' data-key='default_theme' data-role='button' data-inline='true' data-icon='check'>&nbsp;</a>";
    html += "</div>";
    html += "</div>";
    //Schriftart
    html += "<div class='ui-block-f text-right'>";
    html += "<span>" + mapText("FONT") + "</span>";
    html += "</div>";
    html += "<div class='ui-block-g'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    html += "<select id='client_default_font' data-theme='" + theme + "'>";
    var clientFont = optionsClientMap["default_font"];
    html += "<option value='none'>" + mapText("NOT_SELECTED") + "</option>";
    html += "<option value='a' " + (clientFont === "a" ? "selected='selected'" : "") + ">Normal</option>";
    html += "<option value='b' " + (clientFont === "b" ? "selected='selected'" : "") + ">Koch Fraktur</option>";
    html += "<option value='c' " + (clientFont === "c" ? "selected='selected'" : "") + ">Planet Benson</option>";
    html += "<option value='d' " + (clientFont === "d" ? "selected='selected'" : "") + ">Action Man</option>";
    html += "<option value='e' " + (clientFont === "e" ? "selected='selected'" : "") + ">Amadeus</option>";
    html += "<option value='f' " + (clientFont === "f" ? "selected='selected'" : "") + ">Vamp</option>";
    html += "<option value='g' " + (clientFont === "g" ? "selected='selected'" : "") + ">HennyPenny</option>";
    html += "<option value='h' " + (clientFont === "h" ? "selected='selected'" : "") + ">Anglican</option>";
    html += "<option value='i' " + (clientFont === "i" ? "selected='selected'" : "") + ">Nosifer</option>";
    html += "<option value='j' " + (clientFont === "j" ? "selected='selected'" : "") + ">Pacifico</option>";
    html += "<option value='k' " + (clientFont === "k" ? "selected='selected'" : "") + ">Sixties</option>";
    html += "<option value='l' " + (clientFont === "l" ? "selected='selected'" : "") + ">Crackman</option>";
    html += "</select>";
    html += "<a href='#' name='saveClientOption' data-key='default_font' data-role='button' data-inline='true' data-icon='check'>&nbsp;</a>";
    html += "</div>";
    html += "</div>";
    //Größe der Menübilder
    html += "<div class='ui-block-f text-right'>";
    html += "<span>" + mapText("GRAPHICS_SIZE") + "</span>";
    html += "</div>";
    html += "<div class='ui-block-g'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    var gfxSize = optionsClientMap["default_menugfxsize"];
    var selected1 = "";
    var selected2 = "";
    var selected3 = "";
    if (gfxSize === "large") {
        selected3 = "class='ui-btn-active'";
    } else if (gfxSize === "small") {
        selected2 = "class='ui-btn-active'";
    } else {
        selected1 = "class='ui-btn-active'";
    }
    html += "<a href='#' name='saveClientOption' data-key='default_menugfxsize' data-value='none' data-role='button' data-inline='true' " + selected1 + ">" + mapText("NOT_SELECTED") + "</a>";
    html += "<a href='#' name='saveClientOption' data-key='default_menugfxsize' data-value='small' data-role='button' data-inline='true' " + selected2 + ">" + mapText("SMALL") + "</a>";
    html += "<a href='#' name='saveClientOption' data-key='default_menugfxsize' data-value='large' data-role='button' data-inline='true' " + selected3 + ">" + mapText("BIG") + "</a>";
    html += "</div>";
    html += "</div>";
    //Zwei Seiten Version
    html += "<div class='ui-block-f text-right'>";
    html += "<span>" + mapText("TWO_SITES_VERSION") + "</span>";
    html += "</div>";
    html += "<div class='ui-block-g'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    selected1 = "";
    selected2 = "";
    selected3 = "";
    var clientTwoSites = false;
    if (!("two_sites" in optionsClientMap)) {
        selected1 = "class='ui-btn-active'";
    } else if (optionsClientMap["two_sites"]) {
        selected2 = "class='ui-btn-active'";
        clientTwoSites = true;
    } else {
        selected3 = "class='ui-btn-active'";
    }
    html += "<a href='#' name='saveClientOption' data-key='two_sites' data-value='none' data-role='button' data-inline='true' " + selected1 + ">" + mapText("NOT_SELECTED") + "</a>";
    html += "<a href='#' name='saveClientOption' data-key='two_sites' data-value='true' data-role='button' data-inline='true' " + selected2 + ">" + mapText("YES") + "</a>";
    html += "<a href='#' name='saveClientOption' data-key='two_sites' data-value='false' data-role='button' data-inline='true' " + selected3 + ">" + mapText("NO") + "</a>";
    html += "</div>";
    html += "</div>";
    //Two Sites Transition
    html += "<div name='clientTwoSitesTransitionDiv' class='ui-block-f text-right' " + (clientTwoSites ? "" : "style='display: none;'") + ">";
    html += "<span>" + mapText("TWO_SITES_TRANSITION") + "</span>";
    html += "</div>";
    html += "<div name='clientTwoSitesTransitionDiv' class='ui-block-g' " + (clientTwoSites ? "" : "style='display: none;'") + ">";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    html += "<select id='client_transition' data-theme='" + theme + "'>";
    var clientTransition = optionsClientMap["transition"];
    html += "<option value='none'>" + mapText("NOT_SELECTED") + "</option>";
    html += "<option value='flip' " + (clientTransition === "flip" ? "selected='selected'" : "") + ">flip</option>";
    html += "<option value='slide' " + (clientTransition === "slide" ? "selected='selected'" : "") + ">slide</option>";
    html += "<option value='slideup' " + (clientTransition === "slideup" ? "selected='selected'" : "") + ">slideup</option>";
    html += "<option value='slidedown' " + (clientTransition === "slidedown" ? "selected='selected'" : "") + ">slidedown</option>";
    html += "<option value='pop' " + (clientTransition === "pop" ? "selected='selected'" : "") + ">pop</option>";
    html += "<option value='fade' " + (clientTransition === "fade" ? "selected='selected'" : "") + ">fade</option>";
    html += "</select>";
    html += "<a href='#' name='saveClientOption' data-key='transition' data-role='button' data-inline='true' data-icon='check'>&nbsp;</a>";
    html += "</div>";
    html += "</div>";
    //Columns
    html += "<div class='ui-block-f text-right'>";
    html += "<span>" + mapText("NUMBER_OF_COLUMNS") + "</span>";
    html += "</div>";
    html += "<div class='ui-block-g'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    html += "<select id='client_columns' data-theme='" + theme + "'>";
    var clientColumns = optionsClientMap["columns"];
    html += "<option value='none'>" + mapText("NOT_SELECTED") + "</option>";
    html += "<option value='1' " + (clientColumns === "1" ? "selected='selected'" : "") + ">1</option>";
    html += "<option value='2' " + (clientColumns === "2" ? "selected='selected'" : "") + ">2</option>";
    html += "<option value='3' " + (clientColumns === "3" ? "selected='selected'" : "") + ">3</option>";
    html += "<option value='4' " + (clientColumns === "4" ? "selected='selected'" : "") + ">4</option>";
    html += "<option value='5' " + (clientColumns === "5" ? "selected='selected'" : "") + ">auto</option>";
    html += "</select>";
    html += "<a href='#' name='saveClientOption' data-key='columns' data-role='button' data-inline='true' data-icon='check'>&nbsp;</a>";
    html += "</div>";
    html += "</div>";

    html += "</div></div></li>";
    return html;
}

function processOptionsClientAnzeige() {

    //Anzeige
    var html = "<li><h1>" + mapText("MENU") + "</h1>";
    html += "<div class='ui-field-contain'>";
    html += "<div class='ui-grid-b'>";
    html += createClientMenuOptions("favorites");
    html += createClientMenuOptions("rooms");
    html += createClientMenuOptions("functions");
    html += createClientMenuOptions("variables");
    html += createClientMenuOptions("programs");
    //Einstellungen anzeigen
    html += "<div class='ui-block-f text-right'>";
    html += "<span>" + mapText("SETTINGS") + " " + mapText("SHOW") + "</span>";
    html += "</div>";
    html += "<div class='ui-block-g'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    selected1 = "class='";
    selected2 = "class='";
    selected3 = "class='";
    var data_no_more_settings = "false";
    if (!("others" in optionsClientMap)) {
        selected1 += "ui-btn-active";
    } else if (optionsClientMap["others"]) {
        selected2 += "ui-btn-active";
        data_no_more_settings = "true";
        if (optionsMap["no_more_settings"] === 1 && !optionsMap["others"]) {
            selected1 += "ui-state-disabled";
            selected2 += " ui-state-disabled";
            selected3 += "ui-state-disabled";
        }
    } else {
        selected3 += "ui-btn-active";
    }
    selected1 += "'";
    selected2 += "'";
    selected3 += "'";

    html += "<a href='#' name='saveClientOption' data-key='others' data-value='none' id='others_none_selector' data-nms='" + data_no_more_settings + "' data-role='button' data-inline='true' " + selected1 + ">" + mapText("NOT_SELECTED") + "</a>";
    html += "<a href='#' name='saveClientOption' data-key='others' data-value='true' data-role='button' data-inline='true' " + selected2 + ">" + mapText("YES") + "</a>";
    html += "<a href='#' name='saveClientOption' data-key='others' data-value='false' id='others_no_selector' data-nms='" + data_no_more_settings + "' data-role='button' data-inline='true' " + selected3 + ">" + mapText("NO") + "</a>";
    html += "</div>";
    html += "</div>";
    //Was ist standardmäßig auf
    html += "<div class='ui-block-f text-right'>";
    html += "<span>" + mapText("DEFAULT_OPEN") + "</span>";
    html += "</div>";
    html += "<div class='ui-block-g'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    html += "<select id='client_collapsed' data-theme='" + theme + "'>";
    var clientColapsed = optionsClientMap["collapsed"];
    html += "<option value='none'>" + mapText("NOT_SELECTED") + "</a>";
    html += "<option value=''>" + mapText("NO_VALUE") + "</option>";
    html += getSelectColapsedOptions('favorites', clientColapsed);
    html += getSelectColapsedOptions('rooms', clientColapsed);
    html += getSelectColapsedOptions('functions', clientColapsed);
    html += getSelectColapsedOptions('variables', clientColapsed);
    html += getSelectColapsedOptions('programs', clientColapsed);
    html += "<option value='others' " + (clientColapsed === "others" ? "selected='selected'" : "") + ">" + mapText("SETTINGS") + "</option>";
    html += "</select>";
    html += "<a href='#' name='saveClientOption' data-key='collapsed' data-role='button' data-inline='true' data-icon='check'>&nbsp;</a>";
    html += "</div>";
    html += "</div>";

    html += "</div></div></li>";
    return html;
}

function processOptionsClientVariables() {

    //Variablen
    var html = "<li><h1>" + mapText("WORKSPACE") + "</h1>";
    html += "<div class='ui-field-contain'>";
    html += "<div class='ui-grid-b'>";
    //Standardmäßig nur lesend
    html += "<div class='ui-block-f text-right'>";
    html += "<span>" + mapText("DEFAULT_READONLY") + "</span>";
    html += "</div>";
    html += "<div class='ui-block-g'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    var selected1 = "";
    var selected2 = "";
    var selected3 = "";
    if (!("systemvar_readonly" in optionsClientMap)) {
        selected1 = "class='ui-btn-active'";
    } else if (optionsClientMap["systemvar_readonly"]) {
        selected2 = "class='ui-btn-active'";
    } else {
        selected3 = "class='ui-btn-active'";
    }
    html += "<a href='#' name='saveClientOption' data-key='systemvar_readonly' data-value='none' data-role='button' data-inline='true' " + selected1 + ">" + mapText("NOT_SELECTED") + "</a>";
    html += "<a href='#' name='saveClientOption' data-key='systemvar_readonly' data-value='true' data-role='button' data-inline='true' " + selected2 + ">" + mapText("YES") + "</a>";
    html += "<a href='#' name='saveClientOption' data-key='systemvar_readonly' data-value='false' data-role='button' data-inline='true' " + selected3 + ">" + mapText("NO") + "</a>";
    html += "</div>";
    html += "</div>";
    //Beschreibung ausblenden
    html += "<div class='ui-block-f text-right'>";
    html += "<span>" + mapText("SHOW_DESCRIPTION") + "</span>";
    html += "</div>";
    html += "<div class='ui-block-g'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    selected1 = "";
    selected2 = "";
    selected3 = "";
    if (!("show_description" in optionsClientMap)) {
        selected1 = "class='ui-btn-active'";
    } else if (optionsClientMap["show_description"]) {
        selected2 = "class='ui-btn-active'";
    } else {
        selected3 = "class='ui-btn-active'";
    }
    html += "<a href='#' name='saveClientOption' data-key='show_description' data-value='none' data-role='button' data-inline='true' " + selected1 + ">" + mapText("NOT_SELECTED") + "</a>";
    html += "<a href='#' name='saveClientOption' data-key='show_description' data-value='true' data-role='button' data-inline='true' " + selected2 + ">" + mapText("YES") + "</a>";
    html += "<a href='#' name='saveClientOption' data-key='show_description' data-value='false' data-role='button' data-inline='true' " + selected3 + ">" + mapText("NO") + "</a>";
    html += "</div>";
    html += "</div>";
    //Beschreibung ausblenden
    html += "<div class='ui-block-f text-right'>";
    html += "<span>" + mapText("SHOW_LAST_TIME_USED") + "</span>";
    html += "</div>";
    html += "<div class='ui-block-g'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    selected1 = "";
    selected2 = "";
    selected3 = "";
    if (!("show_lastUsedTime" in optionsClientMap)) {
        selected1 = "class='ui-btn-active'";
    } else if (optionsClientMap["show_lastUsedTime"]) {
        selected2 = "class='ui-btn-active'";
    } else {
        selected3 = "class='ui-btn-active'";
    }
    html += "<a href='#' name='saveClientOption' data-key='show_lastUsedTime' data-value='none' data-role='button' data-inline='true' " + selected1 + ">" + mapText("NOT_SELECTED") + "</a>";
    html += "<a href='#' name='saveClientOption' data-key='show_lastUsedTime' data-value='true' data-role='button' data-inline='true' " + selected2 + ">" + mapText("YES") + "</a>";
    html += "<a href='#' name='saveClientOption' data-key='show_lastUsedTime' data-value='false' data-role='button' data-inline='true' " + selected3 + ">" + mapText("NO") + "</a>";
    html += "</div>";
    html += "</div>";

    html += "</div></div></li>";
    return html;
}

function processGraphicID(type) {
    var map = getResultMap(type);
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
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    var selected1 = "";
    var selected2 = "";
    if (optionsMap[type + "_divisor"]) {
        selected1 = "class='ui-btn-active'";
    } else {
        selected2 = "class='ui-btn-active'";
    }
    html += "<a href='#' name='saveGlobalOption' data-reload='true' data-key='" + type + "_divisor' data-value='true' data-role='button' data-inline='true' " + selected1 + ">" + mapText("YES") + "</a>";
    html += "<a href='#' name='saveGlobalOption' data-reload='true' data-key='" + type + "_divisor' data-value='false' data-role='button' data-inline='true' " + selected2 + ">" + mapText("NO") + "</a>";
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
    html += "<a href='#' data-role='button' id='addDivider' data-type='" + type +"' data-size='" + size + "' data-inline='true' data-icon='plus'>&nbsp;</a>";
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
    $.each(map, function (key, val) {
        if (key === "date" || key === "size" || key === "divisors") {
            return;
        }
        isTextVariables = isVariables && val["valueType"] === "20";
        isListVariables = isVariables && val["valueType"] === "16";
        isFloatVariables = isVariables && val["valueType"] === "4";

        var picKey = getPicKey(key, type, val, true);
        html = "<li id='list" + key + "' data-id='" + key + "'>";
        html += "<div style='float: left; text-align: center;'>";
        html += "<img id='img" + key + "' class='ui-div-thumbnail ui-img-" + theme;
        if ($.inArray(picKey, picturesList) !== -1) {
            html += " lazyLoadImage' data-original='../webmatic_user/img/ids/" + type + "/" + picKey + ".png";
        }
        html += "' src='img/menu/" + type + ".png' data-type='" + type + "'/>";
        html += "<a href='#' " + ($.inArray(key, picturesList) === -1 ? "class='ui-btn ui-mini ui-icon-delete ui-btn-icon-left ui-shadow ui-corner-all ui-state-disabled'" : "data-role='button' data-mini='true' data-icon='delete'") + " name='deletePic' id='deletePic" + key + "' data-id='" + key + "' data-type='" + type + "'>" + mapText("DELETE") + "</a>";
        html += "<h1>(";
        if (isRFF) {
            html += "<a href='get.html?id=" + key + "' target='_blank'>" + key + "</a>";
        } else {
            html += key;
        }
        html += ")</h1>";
        html += "</div>";
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
        if ((isVariables && !isTextVariables) || isPrograms) {
            html += "<div class='ui-block-b'>";
            html += "<label>" + mapText("ONLY_PIC") + ":&nbsp;";
            html += "<input type='checkbox' data-role='flipswitch' name='flipswitch' data-type='" + type + "' data-key='onlyPic' data-id='" + key + "' data-on-text='" + mapText("YES") + "' data-off-text='" + mapText("NO") + "' " + (val['onlyPic'] ? "checked" : "") + "/>";
            html += "</div>";            
        }
        if(isVariables){
            if(isTextVariables){
                html += "<div class='ui-block-b small-hidden'></div>";
            }
            if(optionsMap["variables_divisor"]){
                html += "<div class='ui-block-c'>";
                html += getDivisorSelectbox(type, val[type + "_divisor"], key);
                html += "</div>";
            }else{
                html += "<div class='ui-block-c small-hidden'></div>";
            }            
        }
        if (isVariables && !isTextVariables) {
            html += "<div class='ui-block-a'>" + createExecutationField(key, val) + "</div>";
        } else if (isPrograms) {
            html += "<div class='ui-block-a small-hidden'></div>";
        }
        html += "<div class='ui-block-b'>";
        html += "<input name='file' id='file" + key + "' data-pickey='" + picKey + "' type='file' accept='image/*' />";
        html += "</div>";
        html += "<div class='ui-block-c'><a href='#' name='uploadPicture' data-type='" + type + "' id='uploadPicture" + key + "' class='ui-link ui-btn ui-icon-check ui-btn-icon-left ui-btn-inline ui-shadow ui-corner-all ui-state-disabled'>" + mapText("UPLOAD") + "</a></div>";
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

// ------------------------- OnDocumentReady -----------------------------

$(function () {

    // Settings  
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

        switch (type) {
            case "favorites":
                favoritesMap[thisId]['position'] = newPosition;
                favoritesMap[beforeId]['position'] = oldPosition;
                break
            case "favoritesDivisor":
                var originObj = favoritesMap['divisors'];
                originObj[thisId]['position'] = newPosition;
                originObj[beforeId]['position'] = oldPosition;
                favoritesMap['divisors'] = originObj;
                type = "favorites";
                break
            case "rooms":
                roomsMap[thisId]['position'] = newPosition;
                roomsMap[beforeId]['position'] = oldPosition;
                break
            case "roomsDivisor":
                var originObj = roomsMap['divisors'];
                originObj[thisId]['position'] = newPosition;
                originObj[beforeId]['position'] = oldPosition;
                roomsMap['divisors'] = originObj;
                type = "rooms";
                break
            case "functions":
                functionsMap[thisId]['position'] = newPosition;
                functionsMap[beforeId]['position'] = oldPosition;
                break
            case "functionsDivisor":
                var originObj = functionsMap['divisors'];
                originObj[thisId]['position'] = newPosition;
                originObj[beforeId]['position'] = oldPosition;
                functionsMap['divisors'] = originObj;
                type = "functions";
                break
            case "programs":
                programsMap[thisId]['position'] = newPosition;
                programsMap[beforeId]['position'] = oldPosition;
                break
            case "programsDivisor":
                var originObj = programsMap['divisors'];
                originObj[thisId]['position'] = newPosition;
                originObj[beforeId]['position'] = oldPosition;
                programsMap['divisors'] = originObj;
                type = "programs";
                break
            case "variables":
                variablesMap[thisId]['position'] = newPosition;
                variablesMap[beforeId]['position'] = oldPosition;
                break
            case "variablesDivisor":
                var originObj = variablesMap['divisors'];
                originObj[thisId]['position'] = newPosition;
                originObj[beforeId]['position'] = oldPosition;
                variablesMap['divisors'] = originObj;
                type = "variables";
                break
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

        switch (type) {
            case "favorites":
                favoritesMap[thisId]['position'] = newPosition;
                favoritesMap[afterId]['position'] = oldPosition;
                break
            case "favoritesDivisor":
                var originObj = favoritesMap['divisors'];
                originObj[thisId]['position'] = newPosition;
                originObj[afterId]['position'] = oldPosition;
                favoritesMap['divisors'] = originObj;
                type = "favorites";
                break
            case "rooms":
                roomsMap[thisId]['position'] = newPosition;
                roomsMap[afterId]['position'] = oldPosition;
                break
            case "roomsDivisor":
                var originObj = roomsMap['divisors'];
                originObj[thisId]['position'] = newPosition;
                originObj[afterId]['position'] = oldPosition;
                roomsMap['divisors'] = originObj;
                type = "rooms";
                break
            case "functions":
                functionsMap[thisId]['position'] = newPosition;
                functionsMap[afterId]['position'] = oldPosition;
                break
            case "functionsDivisor":
                var originObj = functionsMap['divisors'];
                originObj[thisId]['position'] = newPosition;
                originObj[afterId]['position'] = oldPosition;
                functionsMap['divisors'] = originObj;
                type = "functions";
                break
            case "programs":
                programsMap[thisId]['position'] = newPosition;
                programsMap[afterId]['position'] = oldPosition;
                break
            case "programsDivisor":
                var originObj = programsMap['divisors'];
                originObj[thisId]['position'] = newPosition;
                originObj[afterId]['position'] = oldPosition;
                programsMap['divisors'] = originObj;
                type = "programs";
                break
            case "variables":
                variablesMap[thisId]['position'] = newPosition;
                variablesMap[afterId]['position'] = oldPosition;
                break
            case "variablesDivisor":
                var originObj = variablesMap['divisors'];
                originObj[thisId]['position'] = newPosition;
                originObj[afterId]['position'] = oldPosition;
                variablesMap['divisors'] = originObj;
                type = "variables";
                break
        }

        createOneMap(type);

        activateSettingSaveButton();
    });

    //Client Optionen
    $(document.body).on("click", "[name='saveClientOption']", function () {
        var key = $(this).data("key");
        var value = "";
        if ($('#client_' + key).length) {
            value = $('#client_' + key).val();
        } else {
            $(this).parent().find('.ui-btn-active').removeClass('ui-btn-active');
            value = $(this).addClass('ui-btn-active').data("value");
        }

        if ("others" === key) {
            var nms = optionsMap["no_more_settings"];
            if (value) {
                nms++;
                optionsMap["no_more_settings"] = nms;
                saveOptionsToServer();
            } else {
                if ($(this).data("nms") === "true") {
                    $("#others_none_selector").attr("data-nms", "false");
                    $("#others_no_selector").attr("data-nms", "false");
                    nms--;
                    optionsMap["no_more_settings"] = nms;
                    saveOptionsToServer();
                }
            }
        }

        if ("two_sites" === key) {
            if (value === "true") {
                $('[name=clientTwoSitesTransitionDiv]').show();
            } else {
                $('[name=clientTwoSitesTransitionDiv]').hide();
            }
        }

        if (value !== "") {

            if (value === "true") {
                value = true;
            } else if (value === "false") {
                value = false;
            } else if ($.isNumeric(value)) {
                value = parseInt(value);
            }

            if (value === "none") {
                delete optionsClientMap[key];
                resultOptionsMap[key] = optionsMap[key];
                value = optionsMap[key];
            } else {
                optionsClientMap[key] = value;
                resultOptionsMap[key] = value;
            }
            saveClientOptionsToServer(key, value);
        }
    });

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

    //Globale Optionen
    $(document.body).on("click", "[name='saveGlobalOption']", function () {
        var key = $(this).data("key");
        var value = "";
        if ($('#global_' + key).length) {
            value = $('#global_' + key).val();
        } else {
            $(this).parent().find('.ui-btn-active').removeClass('ui-btn-active');
            value = $(this).addClass('ui-btn-active').data("value");
        }

        if ("two_sites" === key) {
            if (value === "true") {
                $('[name=globalTwoSitesTransitionDiv]').show();
            } else {
                $('[name=globalTwoSitesTransitionDiv]').hide();
            }
        }

        if (value !== "") {
            if (value === "true") {
                value = true;
            } else if (value === "false") {
                value = false;
            } else if ($.isNumeric(value)) {
                value = parseInt(value);
            }
            var reload = $(this).data("reload");
            optionsMap[key] = value;
            saveOptionsToServer(key, value, reload);
        }
    });

    //Language
    $(document.body).on("click", "[name='change_lang']", function () {
        $.get("cgi/changeLang.cgi", {old: wmLang, new : $('#change_lang').val(), debug: debugModus})
                .done(function () {
                    location.reload(true);
                });
    });

    //Clients
    $(document.body).on("click", "[name='title_client']", function () {
        var key = $(this).data("key");
        var title = $('#title_client_' + key.replace(/\./g, "_")).val();
        if (!title) {
            title = key;
        }

        $("#delete_client option[value='" + key + "']").text(title);
        $("#choose_tmp_client option[value='" + key + "']").text(title);

        clientsList[key] = title;
        optionsMap["clientsList"] = clientsList;
        saveOptionsToServer("clientsList", clientsList);
    });
    $(document.body).on("click", "[name='choose_tmp_client']", function () {
        var ip = $('#choose_tmp_client').val();
        if (ip) {
            localStorage.setItem("tempOptionsForClient", ip);
            location.reload(true);
        }
    });

    $(document.body).on("click", "[name='delete_client']", function () {
        var ip = $('#delete_client').val();
        if (ip) {
            if (confirm(mapText("DELETE_SETTINGS_WARNING"))) {
                $.get("cgi/deleteOptions.cgi", {client: ip})
                        .done(function () {
                            delete clientsList[ip];
                            optionsMap["clientsList"] = clientsList;
                            if (ip === client) {
                                saveOptionsToServer("clientsList", clientsList, true);
                            } else {
                                $("#delete_client option[value='" + ip + "']").remove();
                                $("#choose_tmp_client option[value='" + ip + "']").remove();
                                $("[name='title_client_div_" + ip.replace(/\./g, "_") + "']").remove();
                                $("#delete_client").val("").selectmenu('refresh');
                                saveOptionsToServer("clientsList", clientsList);
                            }
                        });
            }
        }
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

        switch (type) {
            case "favorites":
                favoritesMap[id][key] = checked;
                break
            case "rooms":
                roomsMap[id][key] = checked;
                break
            case "functions":
                functionsMap[id][key] = checked;
                break
            case "programs":
                programsMap[id][key] = checked;
                break
            case "variables":
                variablesMap[id][key] = checked;
                break
        }

        createOneMap(type);

        activateSettingSaveButton();
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

    $(document.body).on("click", "[name='saveDivisor']", function () {
        var obj = $(this);
        var id = obj.data("id");
        var key = obj.data("key");
        var type = obj.data("type");
        var selected = $('#select_divisor' + id).val();

        if($.isNumeric(selected)){
            selected = parseInt(selected);
        }
        var map = getMap(type);
        map[id][key] = selected;

        createOneMap(type);

        activateSettingSaveButton(true);
    });
    
    $(document.body).on("click", "[nam='editDivider']", function(){
       alert("Geht noch nicht!"); 
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

    $(document.body).on("click", "[name='saveAllChanges']", function () {
        saveAllDatasToServer();
    });

    $(document.body).on("change", "[name='editName']", function () {
        var obj = $(this);
        var id = obj.data("id");
        var name = obj.val();
        var type = obj.data("type");

        switch (type) {
            case "favorites":
                favoritesMap[id]['name'] = name;
                break
            case "rooms":
                roomsMap[id]['name'] = name;
                break
            case "functions":
                functionsMap[id]['name'] = name;
                break
            case "programs":
                programsMap[id]['name'] = name;
                break
            case "variables":
                variablesMap[id]['name'] = name;
                break
        }

        $("#menuText" + id).fadeOut(500, function () {
            $("#menuText" + id).text(name).fadeIn(1000);
        });

        createOneMap(type);

        activateSettingSaveButton();
    });

    // ------------------------- Bilder -----------------------------

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
                orgValue = parseFloat(orgValue);
                factor = parseFloat(factor);
                orgValue = orgValue / factor;
                value = orgValue;
                var testList = $.grep(picturesList, function (item) {
                    var regex = new RegExp("^" + dataID, "i");
                    return item.trim().match(regex);
                });

                var myValue = 0;
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
            var url = "img/menu/" + type + ".png";
            if ($.inArray(picKey, picturesList) !== -1) {
                url = "../webmatic_user/img/ids/" + type + "/" + picKey + ".png";
            }
            $("#img" + dataID).attr("src", url).fadeIn(1000);
        });
    });

    $(document.body).on("click", "[name='deletePic']", function () {
        var obj = $(this);
        var type = obj.data("type");
        var id = obj.data("id");

        $.get('cgi/delete.cgi?type=' + type + '&name=' + id, function () {
            $("#img" + id).fadeOut(500, function () {
                $("#img" + id).attr("src", "img/menu/" + type + ".png").fadeIn(1000);
            });
            $("#menuImg" + id).fadeOut(500, function () {
                $("#menuImg" + id).attr("src", "img/menu/" + type + ".png").fadeIn(1000);
            });

            obj.addClass("ui-state-disabled");
        });
    });

    $(document.body).on("change", ":file", function () {
        var file = this.files[0];

        if (file.name.length < 1) {
        } else if (file.type !== 'image/png' && file.type !== 'image/jpg' && !file.type !== 'image/gif' && file.type !== 'image/jpeg') {
            //TODO alert ist nicht schön... muss noch ersetzt werden
            $.mobile.alert(mapText("IMAGE_UPLOAD"));
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
        var picKey = $("#file" + key).attr("data-pickey");

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

                formData.append('file', blob, picKey + '.png');
                formData.append('filename', picKey + '.png');
                formData.append('path', '/usr/local/etc/config/addons/www/webmatic_user/img/ids/' + type + '/');

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
                    }
                });

            };
            $("#uploadPicture" + key).addClass("ui-state-disabled");
            $("#deletePic" + key).removeClass("ui-state-disabled");
        };
        reader.readAsDataURL(file);
    });

});