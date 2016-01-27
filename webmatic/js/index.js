/* global theme, font, newVersion, saveDataToFile, debugModus, client, resultOptionsMap, resultRoomsMap, resultFunctionsMap, resultFavoritesMap, isTempClient, picturesList, picturesListError, prim */

function loadMainMenu(indexType, gfxClassParent, gfxClassSelected, collapsed) {
    $("#main_menu").append("<div " + (resultOptionsMap[indexType] ? "" : "style='display:none;'") + " id='" + indexType + "MainMenu' class='scrollToTop' data-role='collapsible' data-collapsed='" + (collapsed === indexType) + "'><h3>" + mapText(indexType) + "</h3><ul id='list" + indexType + "' data-role='listview' data-inset='true'></ul></div>");
    //Global
    if (localStorage.getItem("webmatic" + indexType + "Map") === null) {
        if (newVersion) {
            saveDataToFile = true;
        }
        loadConfigData(false, '../webmatic_user/' + indexType + '.json', indexType, 'webmatic' + indexType + 'Map', false, false);
    } else {
        loadLocalStorageMap(indexType);
    }
    //Lokal
    if (localStorage.getItem("webmatic" + indexType + "clientMap") === null) {
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
        if (key === "date" || key === "size") {
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
            tmpObj[val['name']] = html;
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
}

executeButtons = function (lct, lcid, rm, $this) {
    if (twoPage) {
        $.mobile.changePage("#page2", {transition: resultOptionsMap['transition'], changeHash: true});
        page2 = true;
    }
    lastClickType = lct;
    lastClickID = lcid;
    $('.ui-input-search .ui-input-text').val("");
    readModus = rm;
    refreshPage($this);
    
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

    $("img").trigger("lazyLoadInstantly");

    //Menüpunkt Variablen
    $("#main_menu").append("<div " + (resultOptionsMap["variables"] ? "" : "style='display:none;'") + " id='variablesMainMenu' class='scrollToList listVariables' data-role='collapsible' data-collapsed-icon='carat-r' data-expanded-icon='carat-r' data-collapsed='" + (collapsed === "variables") + "'><h3>" + mapText("SYS_VAR") + "</h3></div>");

    //Menüpunkt Programme
    $("#main_menu").append("<div " + (resultOptionsMap["programs"] ? "" : "style='display:none;'") + " id='programsMainMenu' class='scrollToList listPrograms' data-role='collapsible' data-collapsed-icon='carat-r' data-expanded-icon='carat-r' data-collapsed='" + (collapsed === "programs") + "'><h3>" + mapText("PROGRAMS") + "</h3></div>");

    //Menüpunkt Sonstiges
    $("#main_menu").append("<div " + (resultOptionsMap["others"] || isTempClient ? "" : "style='display:none;'") + " id='othersMainMenu' class='menuListRow' data-role='collapsible' data-collapsed='" + (collapsed === "others") + "'><h3>" + mapText("SETTINGS") + "</h3><ul id='listOther' data-role='listview' data-inset='true'></ul></div>");
    $("#listOther").append("<li id='menuItemVariables' class='menuItemVariables " + gfxClassParent + "'><a href='#'><img class='menu " + gfxClassSelected + " ui-img-" + theme + "' src='img/menu/variables.png'><span class='breakText'>" + mapText("SYS_VAR") + "</span></a></li>");
    $("#listOther").append("<li id='menuItemPrograms' class='menuItemPrograms " + gfxClassParent + "'><a href='#'><img class='menu " + gfxClassSelected + " ui-img-" + theme + "' src='img/menu/programs.png'><span class='breakText'>" + mapText("PROGRAMS") + "</span></a></li>");
    $("#listOther").append("<li id='menuItemOptions' class='menuItemOptions " + gfxClassParent + "'><a href='#'><img class='menu " + gfxClassSelected + " ui-img-" + theme + "' src='img/menu/options.png'><span class='breakText'>" + mapText("OPTIONS") + "</span></a></li>");
    if (client !== "") {
        $("#listOther").append("<li id='menuItemOptionsClient' class='menuItemOptionsClient " + gfxClassParent + "'><a href='#'><img class='menu " + gfxClassSelected + " ui-img-" + theme + "' src='img/menu/options.png'><span class='breakText'>" + mapText("OPTIONS_CLIENT") + "</span></a></li>");
    }
    $("#listOther").append("<li id='menuItemGraphicIDs_FAVORITES' class='menuItemGraphicIDs " + gfxClassParent + "' data-refresh-id='4'><a href='#'><img class='menu " + gfxClassSelected + " ui-img-" + theme + "' src='img/menu/graphics.png'><span class='breakText'>" + mapText("EDIT") + " (" + mapText("FAVORITES") + ")</span></a></li>");
    $("#listOther").append("<li id='menuItemGraphicIDs_ROOMS' class='menuItemGraphicIDs " + gfxClassParent + "' data-refresh-id='8'><a href='#'><img class='menu " + gfxClassSelected + " ui-img-" + theme + "' src='img/menu/graphics.png'><span class='breakText'>" + mapText("EDIT") + " (" + mapText("ROOMS") + ")</span></a></li>");
    $("#listOther").append("<li id='menuItemGraphicIDs_FUNCTIONS' class='menuItemGraphicIDs " + gfxClassParent + "' data-refresh-id='9'><a href='#'><img class='menu " + gfxClassSelected + " ui-img-" + theme + "' src='img/menu/graphics.png'><span class='breakText'>" + mapText("EDIT") + " (" + mapText("FUNCTIONS") + ")</span></a></li>");
    $("#listOther").append("<li id='menuItemGraphicIDs_PROGRAMS' class='menuItemGraphicIDs " + gfxClassParent + "' data-refresh-id='10'><a href='#'><img class='menu " + gfxClassSelected + " ui-img-" + theme + "' src='img/menu/graphics.png'><span class='breakText'>" + mapText("EDIT") + " (" + mapText("PROGRAMS") + ")</span></a></li>");
    $("#listOther").append("<li id='menuItemGraphicIDs_VARIABLES' class='menuItemGraphicIDs " + gfxClassParent + "' data-refresh-id='12'><a href='#'><img class='menu " + gfxClassSelected + " ui-img-" + theme + "' src='img/menu/graphics.png'><span class='breakText'>" + mapText("EDIT") + " (" + mapText("SYS_VAR") + ")</span></a></li>");

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

    $(document.body).on("click", ".scrollToList", function () {
        $('html, body').animate({scrollTop: $('#' + prim).offset().top - 60}, 200);
    });

    $(document.body).on("collapsibleexpand", ".scrollToTop", function () {
        $('html, body').animate({scrollTop: $('#main_menu').offset().top - 60}, 200);
    });


    // ----------------------- Buttons -----------------------

    $(document.body).on("collapsibleexpand", ".listVariables", function () {
        $(this).children(".ui-collapsible-content").hide();
        executeButtons(2, $(this).attr("id"), true, $(this));
    });

    $(document.body).on("collapsibleexpand", ".listPrograms", function () {
        $(this).children(".ui-collapsible-content").hide();
        executeButtons(3, $(this).attr("id"), true, $(this));
    });

    $(document.body).on("click", ".menuListItem", function () {
        executeButtons(1, $(this).attr("id"), true, $(this));
    });

    $(document.body).on("click", ".menuItemVariables", function () {
        executeButtons(2, $(this).attr("id"), false, $(this));
    });

    $(document.body).on("click", ".menuItemPrograms", function () {
        executeButtons(3, $(this).attr("id"), false, $(this));
    });

    $(document.body).on("click", ".menuItemGraphicIDs", function () {
        executeButtons($(this).data("refresh-id"), $(this).attr("id"), true, $(this));
    });

    $(document.body).on("click", ".menuItemDebug", function () {
        executeButtons(5, 0, true, $(this));
    });

    $(document.body).on("click", ".menuItemDebugCUxD", function () {
        executeButtons(6, 0, true, $(this));
    });

    $(document.body).on("click", ".menuItemOptions", function () {
        executeButtons(7, $(this).attr("id"), true, $(this));
    });

    $(document.body).on("click", ".menuItemOptionsClient", function () {
        executeButtons(11, $(this).attr("id"), true, $(this));
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
        executeButtons(11, "menuItemOptionsClient", true, $(this));
    }
    
    $(".backText").on("click", function(){
        page2 = false; 
    });

});