/* global optionsMap, isPreRelease, userFolder, dataList, dataListHeader, theme, wmLang, manClient, clientsList, client, debugModus */

// ----------------------- Helper functions ----------------------------

function saveOptionsToServer(key, value, reload) {
    localStorage.setItem(isPreRelease + "webmaticoptionsMap", JSON.stringify(optionsMap));
    $.post('cgi/saveconfig.cgi', {name: "config", text: JSON.stringify(optionsMap), folder: userFolder}).done(function () {
        if (reload) {
            location.reload(true);
        }
    });
    createOneMap("config", key, value);
}

function createGlobalMenuOptions(type) {
    var html = "";
    if (!optionsMap[type + "_divisor"]) {
        //Einzel
        html += "<div class='ui-block-f text-right'>";
        html += getHelpPage("Optionen", type + "_anzeigen");
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
        html += getHelpPage("Optionen", type + "_anzeigen");
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

// ----------------------- Data loading functions ----------------------------

function loadOptions() {
    clearScreen();

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

// ------------------------- Prozessors ---------------------------------

function processOptionsGlobalTheme() {

    //Themeauswahl
    var html = "<li><h1>" + mapText("CHOOSE_THEME") + "</h1>";
    html += "<div class='ui-field-contain'>";
    html += "<div class='ui-grid-b'>";
    //Aussehen
    html += "<div class='ui-block-f text-right'>";
    html += getHelpPage("Optionen", "Aussehen");
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
    html += getHelpPage("Optionen", "Schriftart");
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
    html += getHelpPage("Optionen", "Sprache");
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
    html += getHelpPage("Optionen", "Gr_e_der_Men_grafiken");
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
    html += getHelpPage("Optionen", "Anzeige_auf_2_Seiten");
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
    html += getHelpPage("Optionen", "Effekt_beim_Seitenwechsel");
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
    html += getHelpPage("Optionen", "Anzahl_der_Spalten");
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
    html += getHelpPage("Optionen", "Einstellungen_anzeigen");
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
    html += getHelpPage("Optionen", "Anzeige_beim_ersten_Aufruf");
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
    html += getHelpPage("Optionen", "Standardsortierung");
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
    html += getHelpPage("Optionen", "Variablen_Standard_nur_lesbar");
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
    html += getHelpPage("Optionen", "Beschreibung_anzeigen");
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
    html += getHelpPage("Optionen", "Letztes_Mal_benutzt_anzeigen");
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
    //Clients
    var html = "<li><h1>Clients</h1>";
    html += "<div class='ui-field-contain'>";
    html += "<div class='ui-grid-b'>";

    //Clientserkennung
    html += "<div class='ui-block-f text-right'>";
    html += getHelpPage("Optionen", "Clienterkennung");
    html += "<span>" + mapText("CLIENT_RECOGNITION") + "</span>";
    html += "</div>";
    html += "<div class='ui-block-g'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    var selected1 = "";
    var selected2 = "";
    if (manClient) {
        selected1 = "class='ui-btn-active'";
    } else {
        selected2 = "class='ui-btn-active'";
    }
    html += "<a href='#' name='saveRecognizeClient' data-value='true' data-icon='refresh' data-role='button' data-inline='true' " + selected1 + ">" + mapText("CLIENT_MANU") + "</a>";
    html += "<a href='#' name='saveRecognizeClient' data-value='false' data-icon='refresh' data-role='button' data-inline='true' " + selected2 + ">" + mapText("CLIENT_AUTO") + "</a>";
    html += "</div>";
    html += "</div>";

    if (Object.keys(clientsList).length > 1) {

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
        html += getHelpPage("Optionen", "Einstellungen_der_Clients");
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
        html += getHelpPage("Optionen", "Einstellungen_l_schen");
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
    }
    html += "</div></div></li>";


    return html;
}

function processOptionsGlobalHistorian() {

    //CCU-Historian
    var html = "<li><h1>CCU-Historian</h1>";
    html += "<p>&nbsp;</p>";
    html += "<div class='ui-field-contain'>";
    html += getHelpPage("Optionen", "CCU-Historian");
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
    html += getHelpPage("Optionen", "Informationen_ber_neue_Versionen");
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
    html += getHelpPage("Optionen", "Versehentliches_Verlassen_der_Seite_verhindern");
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

// ------------------------- OnDocumentReady -----------------------------

$(function () {

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
        $.get("cgi/changeLang.cgi", {old: wmLang, new : $('#change_lang').val(), debug: debugModus, folder: userFolder})
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
            localStorage.setItem(isPreRelease + "tempOptionsForClient", ip);
            location.reload(true);
        }
    });

    $(document.body).on("click", "[name='delete_client']", function () {
        var ip = $('#delete_client').val();
        if (ip) {
            if (confirm(mapText("DELETE_SETTINGS_WARNING"))) {
                $.get("cgi/deleteOptions.cgi", {client: ip, folder: userFolder})
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

    $(document.body).on("click", "[name='saveAllChanges']", function () {
        saveAllDatasToServer();
    });

    $(document.body).on("click", "[name='saveRecognizeClient']", function () {
        $.post('cgi/saveconfig.cgi', {name: "manClient", text: $(this).data("value"), folder: userFolder}).done(function () {
            location.reload(true);
        });
    });

});