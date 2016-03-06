/* global theme, font, newVersion, saveDataToFile, debugModus, client, resultOptionsMap, resultRoomsMap, resultFunctionsMap, resultFavoritesMap, isTempClient, picturesList, picturesListError, prim */

loadMainMenu = function (indexType, gfxClassParent, gfxClassSelected, collapsed) {
    if (resultOptionsMap[indexType + '_divisor'] !== true) {
        if (indexType === "variables" || indexType === "programs") {
            $("#main_menu").append("<div " + (resultOptionsMap[indexType] ? "" : "style='display:none;'") + " id='" + indexType + "MainMenu' class='scrollToList list" + indexType + "' data-role='collapsible' data-collapsed-icon='carat-r' data-expanded-icon='carat-r' data-collapsed='" + (collapsed === indexType) + "'><h3>" + mapText(indexType) + "</h3></div>");
        } else {
            loadSingleMenu(indexType, gfxClassParent, gfxClassSelected, collapsed);
        }
    } else {
        if (indexType === "variables" || indexType === "programs") {
            loadSingleDivisorMenu(indexType, gfxClassParent, gfxClassSelected, collapsed);
        } else {
            loadDivisor(gfxClassParent, gfxClassSelected, collapsed, indexType);
        }
    }
};

loadSingleMenu = function (indexType, gfxClassParent, gfxClassSelected, collapsed) {
    $("#main_menu").append("<div " + (resultOptionsMap[indexType] ? "" : "style='display:none;'") + " id='" + indexType + "MainMenu' class='scrollToTop' data-role='collapsible' data-collapsed='" + (collapsed === indexType) + "'><h3>" + mapText(indexType) + "</h3><ul id='list" + indexType + "' data-role='listview' data-inset='true'></ul></div>");
    //Global
    if (localStorage.getItem("webmatic" + indexType + "Map") === null || localStorage.getItem("webmatic" + indexType + "Map") === "undefined") {
        if (newVersion) {
            saveDataToFile = true;
        }
        loadConfigData(false, '../webmatic_user/' + indexType + '.json', indexType, 'webmatic' + indexType + 'Map', false, false);
    } else {
        loadLocalStorageMap(indexType);
    }
    //Lokal
    if (localStorage.getItem("webmatic" + indexType + "clientMap") === null || localStorage.getItem("webmatic" + indexType + "clientMap") === "undefined") {
        if (client !== "") {
            loadConfigData(false, '../webmatic_user/' + indexType + client + '.json', indexType + 'Client', 'webmatic' + indexType + 'clientMap', false, true);
        }
    } else {
        setResultMap(indexType, JSON.parse(localStorage.getItem("webmatic" + indexType + "clientMap")));
    }
    //Kombinieren
    createOneMap(indexType);

    loadConfigData(true, 'cgi/' + indexType + '.cgi', indexType, 'webmatic' + indexType + 'Map', false, true, function () {
        createOneMap(indexType);
    });

    var tmpObj = {};
    $.each(getResultMap(indexType), function (key, val) {
        if (key === "date" || key === "size" || key === "divisors") {
            return;
        }
        var html = "<li class='menuListItem " + gfxClassParent + " scrollToList' id='" + key + "' " + (val['visible'] ? "" : "style='display: none;'") + ">";
        html += "<a href='#'><img id='menuImg" + key + "' class='menu " + gfxClassSelected + " ui-img-" + theme;
        if ($.inArray(key, picturesList) !== -1 || picturesListError) {
            html += " lazy" + indexType + "' data-original='../webmatic_user/img/ids/" + indexType + "/" + key + ".png";
        }
        html += "' src='img/menu/" + indexType + ".png'><span id='menuText" + key + "' class='breakText'>" + val['name'] + "</span></a></li>";
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
        $("#list" + indexType).append(tmpObj[k]);
    }

    $("#list" + indexType).listview().listview("refresh");
    $("img.lazy" + indexType).lazyload({event: "lazyLoadInstantly"});
};

//Divisor für Variablen oder Programme
loadSingleDivisorMenu = function (type, gfxClassParent, gfxClassSelected, collapsed) {
    $("#main_menu").append("<div " + (resultOptionsMap[type] ? "" : "style='display:none;'") + " id='" + type + "MainMenu' class='scrollToTop' data-role='collapsible' data-collapsed='" + (collapsed === type) + "'><h3>" + mapText(type) + "</h3><ul id='list" + type + "' data-role='listview' data-inset='true'></ul></div>");
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
            loadConfigData(false, '../webmatic_user/' + type + client + '.json', type + 'Client', 'webmatic' + type + 'clientMap', false, true);
        }
    } else {
        setResultMap(type, JSON.parse(localStorage.getItem("webmatic" + type + "clientMap")));
    }
    //Kombinieren
    createOneMap(type);

    loadConfigData(true, 'cgi/' + type + '.cgi', type, 'webmatic' + type + 'Map', false, true, function () {
        createOneMap(type);
    });

    var tmpObj = {};
    var resultMap = getResultMap(type);
    $.each(resultMap['divisors'], function (key, val) {
        var indexType = type + key;
        var html = "<li class='menuListSpecialItem " + gfxClassParent + " scrollToList' data-divisor='true' data-type='" + type + "' data-id='" + key + "' " + (resultOptionsMap[indexType] ? "" : "style='display: none;'") + ">";
        html += "<a href='#'><img id='menuImg" + indexType + "' class='menu " + gfxClassSelected + " ui-img-" + theme;
        if ($.inArray(indexType, picturesList) !== -1 || picturesListError) {
            html += " lazy" + type + "' data-original='../webmatic_user/img/ids/" + type + "/" + indexType + ".png";
        }
        html += "' src='img/menu/" + type + ".png'><span id='menuText" + indexType + "' class='breakText'>" + val['name'] + "</span></a></li>";
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
        $("#list" + type).append(tmpObj[k]);
    }

    $.each(resultMap, function (key, val) {
        if (key === "date" || key === "size" || key === "divisors" || val[type + '_divisor'] !== "unsorted" || !val['visible']) {
            return;
        }
        var indexType = type + "unsorted";
        var html = "<li class='menuListSpecialItem " + gfxClassParent + " scrollToList' data-divisor='true' data-type='" + type + "' data-id='unsorted' >";
        html += "<a href='#'><img id='menuImg" + indexType + "' class='menu " + gfxClassSelected + " ui-img-" + theme;
        html += "' src='img/menu/" + type + ".png'><span id='menuText" + indexType + "' class='breakText'>" + mapText("UNSORTED") + "</span></a></li>";
        $("#list" + type).append(html);
        return false;
    });

    $("#list" + type).listview().listview("refresh");
    $("img.lazy" + type).lazyload({event: "lazyLoadInstantly"});
};

loadDivisor = function (gfxClassParent, gfxClassSelected, collapsed, type) {

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
            loadConfigData(false, '../webmatic_user/' + type + client + '.json', type + 'Client', 'webmatic' + type + 'clientMap', false, true);
        }
    } else {
        setResultMap(type, JSON.parse(localStorage.getItem("webmatic" + type + "clientMap")));
    }
    //Kombinieren
    createOneMap(type);

    loadConfigData(true, 'cgi/' + type + '.cgi', type, 'webmatic' + type + 'Map', false, true, function () {
        createOneMap(type);
    });

    var resultMap = getResultMap(type);
    var tmpMap = {};
    addUnsorted(resultMap);
    $.each(resultMap['divisors'], function (key, val) {
        if ($.isNumeric(key)) {
            key = parseInt(key);
        }
        var indexType = type + key;
        var html = "<div " + (resultOptionsMap[indexType] || key === "unsorted" ? "" : "style='display:none;'") + " id='" + indexType + "MainMenu' class='scrollToTop' data-role='collapsible' data-collapsed='" + (collapsed === indexType) + "'>";
        html += "<h3>" + val['name'] + "</h3>";
        html += "<ul class='list" + type + "Div' data-role='listview' id='listElement" + indexType + "' data-inset='true'>";

        var tmpObj = {};
        $.each(resultMap, function (key2, val2) {
            if (key2 === "date" || key2 === "size" || key2 === "divisors" || val2[type + '_divisor'] !== key) {
                return;
            }
            var html = "<li class='menuListItem " + gfxClassParent + " scrollToList' id='" + key2 + "' " + (val2['visible'] ? "" : "style='display: none;'") + ">";
            html += "<a href='#'><img id='menuImg" + key2 + "' class='menu " + gfxClassSelected + " ui-img-" + theme;
            if ($.inArray(key2, picturesList) !== -1 || picturesListError) {
                html += " lazy" + type + "Div' data-original='../webmatic_user/img/ids/" + type + "/" + key2 + ".png";
            }
            html += "' src='img/menu/" + type + ".png'><span id='menuText" + key2 + "' class='breakText'>" + val2['name'] + "</span></a></li>";

            if (resultOptionsMap['default_sort_manually']) {
                tmpObj[parseInt(val2['position'])] = html;
            } else {
                tmpObj[val2['name'].toLowerCase()] = html;
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
            html += tmpObj[k];
        }
        html += "</ul></div>";

        tmpMap[parseInt(val['position'])] = html;
    });
    removeUnsorted(resultMap);

    var keys = Object.keys(tmpMap).sort(function (a, b) {
        return a - b;
    });
    var len = keys.length;
    for (var i = 0; i < len; i++) {
        var k = keys[i];
        $("#main_menu").append(tmpMap[k]);
    }

    if ($('#listElement' + type + 'unsorted').children().length === 0) {
        $('#' + type + 'unsortedMainMenu').remove();
    }

    $(".list" + type + "Div").listview().listview("refresh");
    $("img.lazy" + type + "Div").lazyload({event: "lazyLoadInstantly"});
};

executeButtons = function (lct, lcid, rm, $this, col) {
    if (twoPage) {
        $.mobile.changePage("#page2", {transition: resultOptionsMap['transition'], changeHash: true});
        page2 = true;
    }
    lastClickType = lct;
    lastClickID = lcid;
    $('.ui-input-search .ui-input-text').val("");
    readModus = rm;
    if ($this.data('divisor')) {
        divisorClick = true;
    } else {
        divisorClick = false;
    }
    refreshPage($this, col);
};

// ------------------------- Initial call after page loading ------------------------
$(function () {
    // Disable all caching. Default in most browsers, but not in IE and Android (at least 2.2):
    $.ajaxSetup({cache: false});

    //Übersetzungen
    $('#removeMessages').text(mapText("REMOVE_MESSAGES"));
    $('.dlgAbout').text(mapText("ABOUT"));
    $("#serviceText").text(mapText("SERVICE_NOTE"));
    $("#serviceTextNone").text(mapText("NO_DISORDERS"));
    $(".backText").text(mapText("BACK"));
    $(".save-button").text(mapText("SAVE"));

    // Größe der Grafiken aus localStorage holen:
    gfxClass = resultOptionsMap['default_menugfxsize'];
    var gfxClassSelected = "";
    var gfxClassParent = "";
    if (!gfxClass || gfxClass === "" || gfxClass === "large") {
        gfxClass = "large";
        gfxClassSelected = "ui-li-thumb";
        gfxClassParent = "ui-li-has-thumb";
    } else {
        gfxClass = "small";
        gfxClassSelected = "ui-li-icon";
        gfxClassParent = "ui-li-has-icon";
    }
    twoPage = resultOptionsMap['two_sites'];

    // ----------------------- Menüpunkte -----------------------

    var collapsed = resultOptionsMap["collapsed"];
    if (isTempClient) {
        collapsed = "others";
    }

    //Menüpunkt Favoriten
    var indexType = "favorites";
    loadMainMenu(indexType, gfxClassParent, gfxClassSelected, collapsed);

    //Menüpunkt Räume
    indexType = "rooms";
    loadMainMenu(indexType, gfxClassParent, gfxClassSelected, collapsed);

    //Menüpunkt Gewerke
    indexType = "functions";
    loadMainMenu(indexType, gfxClassParent, gfxClassSelected, collapsed);

    //Menüpunkt Variablen
    indexType = "variables";
    loadMainMenu(indexType, gfxClassParent, gfxClassSelected, collapsed);

    //Menüpunkt Programme
    indexType = "programs";
    loadMainMenu(indexType, gfxClassParent, gfxClassSelected, collapsed);

    $("img").trigger("lazyLoadInstantly");

    //Menüpunkt Sonstiges
    $("#main_menu").append("<div " + (resultOptionsMap["others"] || isTempClient ? "" : "style='display:none;'") + " id='othersMainMenu' class='menuListRow' data-role='collapsible' data-collapsed='" + (collapsed === "others") + "'><h3>" + mapText("SETTINGS") + "</h3><ul id='listOther' data-role='listview' data-inset='true'></ul></div>");
    $("#listOther").append("<li id='menuItemvariables' class='menuItemvariables " + gfxClassParent + "'><a href='#'><img class='menu " + gfxClassSelected + " ui-img-" + theme + "' src='img/menu/variables.png'><span class='breakText'>" + mapText("VARIABLES") + "</span></a></li>");
    $("#listOther").append("<li id='menuItemprograms' class='menuItemprograms " + gfxClassParent + "'><a href='#'><img class='menu " + gfxClassSelected + " ui-img-" + theme + "' src='img/menu/programs.png'><span class='breakText'>" + mapText("PROGRAMS") + "</span></a></li>");
    $("#listOther").append("<li id='menuItemOptions' class='menuItemOptions " + gfxClassParent + "'><a href='#'><img class='menu " + gfxClassSelected + " ui-img-" + theme + "' src='img/menu/options.png'><span class='breakText'>" + mapText("OPTIONS") + "</span></a></li>");
    if (client !== "") {
        $("#listOther").append("<li id='menuItemOptionsClient' class='menuItemOptionsClient " + gfxClassParent + "'><a href='#'><img class='menu " + gfxClassSelected + " ui-img-" + theme + "' src='img/menu/options.png'><span class='breakText'>" + mapText("OPTIONS_CLIENT") + "</span></a></li>");
    }
    $("#listOther").append("<li id='menuItemGraphicIDs_favorites' class='menuItemGraphicIDs " + gfxClassParent + "' data-refresh-id='4'><a href='#'><img class='menu " + gfxClassSelected + " ui-img-" + theme + "' src='img/menu/graphics.png'><span class='breakText'>" + mapText("EDIT") + " (" + mapText("FAVORITES") + ")</span></a></li>");
    $("#listOther").append("<li id='menuItemGraphicIDs_rooms' class='menuItemGraphicIDs " + gfxClassParent + "' data-refresh-id='8'><a href='#'><img class='menu " + gfxClassSelected + " ui-img-" + theme + "' src='img/menu/graphics.png'><span class='breakText'>" + mapText("EDIT") + " (" + mapText("ROOMS") + ")</span></a></li>");
    $("#listOther").append("<li id='menuItemGraphicIDs_functions' class='menuItemGraphicIDs " + gfxClassParent + "' data-refresh-id='9'><a href='#'><img class='menu " + gfxClassSelected + " ui-img-" + theme + "' src='img/menu/graphics.png'><span class='breakText'>" + mapText("EDIT") + " (" + mapText("FUNCTIONS") + ")</span></a></li>");
    $("#listOther").append("<li id='menuItemGraphicIDs_programs' class='menuItemGraphicIDs " + gfxClassParent + "' data-refresh-id='10'><a href='#'><img class='menu " + gfxClassSelected + " ui-img-" + theme + "' src='img/menu/graphics.png'><span class='breakText'>" + mapText("EDIT") + " (" + mapText("PROGRAMS") + ")</span></a></li>");
    $("#listOther").append("<li id='menuItemGraphicIDs_variables' class='menuItemGraphicIDs " + gfxClassParent + "' data-refresh-id='12'><a href='#'><img class='menu " + gfxClassSelected + " ui-img-" + theme + "' src='img/menu/graphics.png'><span class='breakText'>" + mapText("EDIT") + " (" + mapText("VARIABLES") + ")</span></a></li>");

    if (debugModus) {
        $("#listOther").append("<li id='menuItemDebug' class='menuItemDebug " + gfxClassParent + "'><a href='#'><img class='menu " + gfxClassSelected + " ui-img-" + theme + "' src='img/menu/debug.png'><span class='breakText'>" + mapText("TEST_DEVICE") + "</span></a></li>");
        $("#listOther").append("<li id='menuItemDebugCUxD' class='menuItemDebugCUxD " + gfxClassParent + "'><a href='#'><img class='menu " + gfxClassSelected + " ui-img-" + theme + "' src='img/menu/debug.png'><span class='breakText'>" + mapText("TEST_CUXD") + "</span></a></li>");
    }
    $("#listOther").listview().listview("refresh");

    $("#main_menu").collapsibleset("refresh");

    refreshServiceMessages();
    restartTimer();
    changeTheme(theme);
    changeFont(font);
    changeTwoPage(twoPage);
    changeNumberOfColumns(resultOptionsMap['colums'], false);

    $(document.body).on("click", ".scrollToList", function () {
        $('html, body').animate({scrollTop: $('#' + prim).offset().top - 60}, 200);
    });

    $(document.body).on("collapsibleexpand", ".scrollToTop", function () {
        $('html, body').animate({scrollTop: $('#main_menu').offset().top - 60}, 200);
    });


    // ----------------------- Buttons -----------------------

    $(document.body).on("collapsibleexpand", ".listvariables", function () {
        $(this).children(".ui-collapsible-content").hide();
        executeButtons(2, $(this).attr("id"), true, $(this));
    });

    $(document.body).on("collapsibleexpand", ".listprograms", function () {
        $(this).children(".ui-collapsible-content").hide();
        executeButtons(3, $(this).attr("id"), true, $(this));
    });

    $(document.body).on("click", ".menuListItem", function () {
        executeButtons(1, $(this).attr("id"), true, $(this));
    });

    $(document.body).on("click", ".menuListSpecialItem", function () {
        var $obj = $(this);
        var type = $obj.data("type");
        executeButtons("variables" === type ? 2 : 3, $obj.data("id"), true, $obj);
    });

    $(document.body).on("click", ".menuItemvariables", function () {
        executeButtons(2, $(this).attr("id"), false, $(this));
    });

    $(document.body).on("click", ".menuItemprograms", function () {
        executeButtons(3, $(this).attr("id"), false, $(this));
    });

    $(document.body).on("click", ".menuItemGraphicIDs", function () {
        executeButtons($(this).data("refresh-id"), $(this).attr("id"), true, $(this), 1);
    });

    $(document.body).on("click", ".menuItemDebug", function () {
        executeButtons(5, 0, true, $(this));
    });

    $(document.body).on("click", ".menuItemDebugCUxD", function () {
        executeButtons(6, 0, true, $(this));
    });

    $(document.body).on("click", ".menuItemOptions", function () {
        executeButtons(7, $(this).attr("id"), true, $(this), 1);
    });

    $(document.body).on("click", ".menuItemOptionsClient", function () {
        executeButtons(11, $(this).attr("id"), true, $(this), 1);
    });

    $(document.body).on("click", ".buttonRefresh", function () {
        refreshPage(0);
        refreshServiceMessages();
    });

    $(document.body).on("click", "#removeMessages", function () {
        removeMessages();
        refreshServiceMessages();
    });

    $(document.body).on("click", "#reloadWebMatic", function () {
        window.location.reload();
    });

    $("#main_menu").children("div[data-collapsed='true']").collapsible("expand");

    if (isTempClient) {
        collapsed = "others";
        executeButtons(11, "menuItemOptionsClient", true, $(this), 1);
    }

    $(".backText").on("click", function () {
        page2 = false;
    });

});