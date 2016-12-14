/* global optionsClientMap, client, isPreRelease, userFolder, dataList, dataListHeader, isTempClient, clientsList, theme, optionsMap, resultOptionsMap, specialTextVariables, specialTextVariablesOnlypic, picturesList, variablesMap */

// ----------------------- Helper functions ----------------------------

function saveClientOptionsToServer(key, value) {
    localStorage.setItem(isPreRelease + "webmaticoptionsclientMap", JSON.stringify(optionsClientMap));
    if (client !== "") {
        $.post('cgi/saveconfig.cgi', {name: "config" + client, text: JSON.stringify(optionsClientMap), folder: userFolder});
    }
    if (key) {
        checkAndChange(key, value);
    }
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

function createClientMenuOptions(type) {
    var html = "";
    if (!optionsMap[type + "_divisor"]) {
        //Einzel
        html += "<div class='ui-block-f text-right'>";
        html += getHelpPage("Optionen", type + "_ansehen");
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
        html += getHelpPage("Optionen", type + "_ansehen");
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

// ----------------------- Data loading functions ----------------------------

function loadOptionsClient() {
    clearScreen();

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

// ------------------------- Prozessors ---------------------------------

function processOptionsClientTheme() {

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
    html += getHelpPage("Optionen", "Schriftart");
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
    html += getHelpPage("Optionen", "Gr_e_der_Men_grafiken");
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
    html += getHelpPage("Optionen", "Anzeige_auf_2_Seiten");
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
    html += getHelpPage("Optionen", "Effekt_beim_Seitenwechsel");
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
    html += getHelpPage("Optionen", "Anzahl_der_Spalten");
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
    html += getHelpPage("Optionen", "Einstellungen_anzeigen");
    html += "<span>" + mapText("SETTINGS") + " " + mapText("SHOW") + "</span>";
    html += "</div>";
    html += "<div class='ui-block-g'>";
    html += "<div data-role='controlgroup' data-type='horizontal'>";
    var selected1 = "class='";
    var selected2 = "class='";
    var selected3 = "class='";
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
    html += getHelpPage("Optionen", "Anzeige_beim_ersten_Aufruf");
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
    html += getHelpPage("Optionen", "Variablen_Standard_nur_lesbar");
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
    html += getHelpPage("Optionen", "Beschreibung_anzeigen");
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
    html += getHelpPage("Optionen", "Letztes_Mal_benutzt_anzeigen");
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

// ------------------------- OnDocumentReady -----------------------------

$(function () {

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

    $(document.body).on("click", "[name='editVarOperateClient']", function () {
        var obj = $(this);
        var id = obj.data("id");
        var checked = obj.data('value');

        $(this).parent().children().removeClass("ui-btn-active");
        $(this).addClass("ui-btn-active");

        if (variablesClientMap === undefined) {
            variablesClientMap = {};
        }

        if (checked === "global") {
            if (variablesClientMap[id] !== undefined) {
                var tmpMap = variablesClientMap[id];
                delete tmpMap["operate"];
                variablesClientMap[id] = tmpMap;
            }
        } else {
            var tmpMap = variablesClientMap[id];
            if (tmpMap === undefined) {
                tmpMap = {};
            }
            tmpMap["operate"] = checked;
            variablesClientMap[id] = tmpMap;
        }

        createOneMap("variables");

        activateSettingSaveButton(false, true);
    });

    $(document.body).on("click", "[name='changeFloatSFClient']", function () {
        var obj = $(this);
        var id = obj.data("id");
        var toChange = obj.data("change");
        var value = $("#" + toChange + id).val();

        if (variablesClientMap === undefined) {
            variablesClientMap = {};
        }

        if (value === "global") {
            if (variablesClientMap[id] !== undefined) {
                var tmpMap = variablesClientMap[id];
                delete tmpMap[toChange];
                variablesClientMap[id] = tmpMap;
            }
        } else {
            var tmpMap = variablesClientMap[id];
            if (tmpMap === undefined) {
                tmpMap = {};
            }
            tmpMap[toChange] = value;
            variablesClientMap[id] = tmpMap;
        }

        var tmpMap = variablesMap[id];
        if ("listType" === toChange) {
            $('#mainNumber' + id).replaceWith(addSetValueList(0, id, "0", tmpMap['valueList'], tmpMap['valueUnit'], "", false, true, value, true));
        }
        $('#mainNumber' + id).enhanceWithin();

        createOneMap("variables");

        activateSettingSaveButton(false, true);
    });

});