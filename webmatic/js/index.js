/* global theme, font, newVersion, saveDataToFile, debugModus, client, resultOptionsMap, resultRoomsMap, resultFunctionsMap, resultFavoritesMap */

function loadMainMenu(indexType, gfxClassParent, gfxClassSelected, collapsed){
    $("#main_menu").append("<div " + (resultOptionsMap[indexType]?"":"style='display:none;'") + " id='" + indexType + "MainMenu' class='scrollToTop' data-role='collapsible' data-collapsed='" + (collapsed === indexType) + "'><h3>" + mapText(indexType) + "</h3><ul id='list" + indexType + "' data-role='listview' data-inset='true'></ul></div>");
    //Global
    if (localStorage.getItem("webmatic" + indexType + "Map") === null) {
        if(newVersion){
            saveDataToFile = true;
        }
        loadConfigData(false, '../webmatic_user/' + indexType + '.json', indexType, 'webmatic' + indexType + 'Map', false, false);
    } else {
        loadLocalStorageMap(indexType);
    }
    //Lokal
    if (localStorage.getItem("webmatic" + indexType + "clientMap") === null) {
        if(client !== ""){
            loadConfigData(false, '../webmatic_user/' + indexType + client + '.json', indexType + 'Client', 'webmatic' + indexType + 'clientMap', false, true);
        }
    } else {
        setResultMap(indexType, JSON.parse(localStorage.getItem("webmatic" + indexType + "clientMap")));    
    }
    //Kombinieren
    createOneMap(indexType);
        
    loadConfigData(true, 'cgi/' + indexType + '.cgi', indexType, 'webmatic' + indexType + 'Map', false, true, function(){
        createOneMap(indexType);
    });
    
    var tmpObj = {};
    $.each(getResultMap(indexType), function (key, val) {
        var html = "<li class='menuListItem " + gfxClassParent + " scrollToList' id='" + key + "' " + (val['visible']?"":"style='display: none;'") + ">";
        if(debugModus){
            html += "<span>Position: " + val['position'] + "</span>";
        }
        html += "<a href='#'><img id='menuImg" + key + "' class='menu " + gfxClassSelected + " ui-img-" + theme;
        if(val['pic']){
            html += " lazy" + indexType + "' data-original='../webmatic_user/img/ids/" + indexType + "/" + key + ".png";
        }
        html += "' src='img/menu/favorites.png'><span id='menuText" + key + "' class='breakText'>" + val['name'] + "</span></a></li>";
        tmpObj[val['position']] = html;            
    });
    var keys = Object.keys(tmpObj).sort(function(a,b){return a-b;});
    var len = keys.length;    
    for (var i = 0; i < len; i++) {
        var k = keys[i];
        $("#list" + indexType).append(tmpObj[k]);
    }
    $("#list" + indexType).listview().listview("refresh");
    $("img.lazy" + indexType).lazyload({event: "lazyLoadInstantly"});    
}

// ------------------------- Initial call after page loading ------------------------
$(function () {
    // Disable all caching. Default in most browsers, but not in IE and Android (at least 2.2):
    $.ajaxSetup({cache: false});

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

    // ----------------------- Menüpunkte -----------------------

    var collapsed = resultOptionsMap["collapsed"];
    
    //Menüpunkt Favoriten
    var indexType = "favorites";
    loadMainMenu(indexType, gfxClassParent, gfxClassSelected, collapsed);
    
    //Menüpunkt Räume
    indexType = "rooms";
    loadMainMenu(indexType, gfxClassParent, gfxClassSelected);
    
    //Menüpunkt Gewerke
    indexType = "functions";
    loadMainMenu(indexType, gfxClassParent, gfxClassSelected);
    
    $("img").trigger("lazyLoadInstantly");
    
    //Menüpunkt Variablen
    $("#main_menu").append("<div " + (resultOptionsMap["variables"]?"":"style='display:none;'") + " id='variablesMainMenu' class='scrollToList listVariables' data-role='collapsible' data-collapsed-icon='carat-r' data-expanded-icon='carat-r' data-collapsed='" + (collapsed === "variables") + "'><h3>" + mapText("SYS_VAR") + "</h3></div>");

    //Menüpunkt Programme
    $("#main_menu").append("<div " + (resultOptionsMap["programs"]?"":"style='display:none;'") + " id='programsMainMenu' class='scrollToList listPrograms' data-role='collapsible' data-collapsed-icon='carat-r' data-expanded-icon='carat-r' data-collapsed='" + (collapsed === "programs") + "'><h3>" + mapText("PROGRAMS") + "</h3></div>");
  
    //Menüpunkt Sonstiges
    $("#main_menu").append("<div " + (resultOptionsMap["others"]?"":"style='display:none;'") + " id='othersMainMenu' class='menuListRow' data-role='collapsible' data-collapsed='" + (collapsed === "others") + "'><h3>" + mapText("SETTINGS") + "</h3><ul id='listOther' data-role='listview' data-inset='true'></ul></div>");
    $("#listOther").append("<li id='menuItemVariables' class='menuItemVariables " + gfxClassParent + "'><a href='#'><img class='menu " + gfxClassSelected + " ui-img-" + theme + "' src='img/menu/variables.png'><span class='breakText'>" + mapText("SYS_VAR") + "</span></a></li>");
    $("#listOther").append("<li id='menuItemPrograms' class='menuItemPrograms " + gfxClassParent + "'><a href='#'><img class='menu " + gfxClassSelected + " ui-img-" + theme + "' src='img/menu/programs.png'><span class='breakText'>" + mapText("PROGRAMS") + "</span></a></li>");
    $("#listOther").append("<li id='menuItemOptions' class='menuItemOptions " + gfxClassParent + "'><a href='#'><img class='menu " + gfxClassSelected + " ui-img-" + theme + "' src='img/menu/options.png'><span class='breakText'>" + mapText("OPTIONS") + "</span></a></li>");
    if(client !== ""){
        $("#listOther").append("<li id='menuItemOptionsClient' class='menuItemOptionsClient " + gfxClassParent + "'><a href='#'><img class='menu " + gfxClassSelected + " ui-img-" + theme + "' src='img/menu/options.png'><span class='breakText'>" + mapText("OPTIONS_CLIENT") + "</span></a></li>");
    }
    $("#listOther").append("<li id='menuItemGraphicIDs_FAVORITES' class='menuItemGraphicIDs " + gfxClassParent + "' data-refresh-id='4'><a href='#'><img class='menu " + gfxClassSelected + " ui-img-" + theme + "' src='img/menu/graphics.png'><span class='breakText'>" + mapText("EDIT") + " (" + mapText("FAVORITES") + ")</span></a></li>");
    $("#listOther").append("<li id='menuItemGraphicIDs_ROOMS' class='menuItemGraphicIDs " + gfxClassParent + "' data-refresh-id='8'><a href='#'><img class='menu " + gfxClassSelected + " ui-img-" + theme + "' src='img/menu/graphics.png'><span class='breakText'>" + mapText("EDIT") + " (" + mapText("ROOMS") + ")</span></a></li>");
    $("#listOther").append("<li id='menuItemGraphicIDs_FUNCTIONS' class='menuItemGraphicIDs " + gfxClassParent + "' data-refresh-id='9'><a href='#'><img class='menu " + gfxClassSelected + " ui-img-" + theme + "' src='img/menu/graphics.png'><span class='breakText'>" + mapText("EDIT") + " (" + mapText("FUNCTIONS") + ")</span></a></li>");
    $("#listOther").append("<li id='menuItemGraphicIDs_PROGRAMS' class='menuItemGraphicIDs " + gfxClassParent + "' data-refresh-id='10'><a href='#'><img class='menu " + gfxClassSelected + " ui-img-" + theme + "' src='img/menu/graphics.png'><span class='breakText'>" + mapText("EDIT") + " (" + mapText("PROGRAMS") + ")</span></a></li>");

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

    $("#main_menu").children("div[data-collapsed='true']").collapsible("expand");

    $(document.body).on("click", ".scrollToList", function () {
        $('html, body').animate({scrollTop: $('#prim').offset().top - 60}, 200);
    });

    $(document.body).on("collapsibleexpand", ".scrollToTop", function () {
        $('html, body').animate({scrollTop: $('#main_menu').offset().top - 60}, 200);
    });


    // ----------------------- Buttons -----------------------

    $(document.body).on("collapsibleexpand", ".listVariables", function () {
        $(this).children(".ui-collapsible-content").hide();
        lastClickType = 2;
        lastClickID = $(this).attr("id");
        $('.ui-input-search .ui-input-text').val("");
        readModus = true;
        refreshPage($(this), false);
    });

    $(document.body).on("collapsibleexpand", ".listPrograms", function () {
        $(this).children(".ui-collapsible-content").hide();
        lastClickType = 3;
        lastClickID = $(this).attr("id");
        $('.ui-input-search .ui-input-text').val("");
        readModus = true;
        refreshPage($(this), false);
    });

    $(document.body).on("click", ".menuListItem", function () {
        lastClickType = 1;
        lastClickID = $(this).attr("id");
        $('.ui-input-search .ui-input-text').val("");
        readModus = true;
        refreshPage($(this), false);
    });

    $(document.body).on("click", ".menuItemVariables", function () {
        lastClickType = 2;
        lastClickID = $(this).attr("id");
        $('.ui-input-search .ui-input-text').val("");
        readModus = false;
        refreshPage($(this), false);
    });

    $(document.body).on("click", ".menuItemPrograms", function () {
        lastClickType = 3;
        lastClickID = $(this).attr("id");
        $('.ui-input-search .ui-input-text').val("");
        readModus = false;
        refreshPage($(this), false);
    });

    $(document.body).on("click", ".menuItemGraphicIDs", function () {
        lastClickType = $(this).data("refresh-id");
        lastClickID = $(this).attr("id");
        $('.ui-input-search .ui-input-text').val("");
        readModus = true;
        refreshPage($(this), false);
    });

    $(document.body).on("click", ".menuItemDebug", function () {
        lastClickType = 5;
        lastClickID = 0;
        $('.ui-input-search .ui-input-text').val("");
        readModus = true;
        refreshPage($(this), false);
    });

    $(document.body).on("click", ".menuItemDebugCUxD", function () {
        lastClickType = 6;
        lastClickID = 0;
        $('.ui-input-search .ui-input-text').val("");
        readModus = true;
        refreshPage($(this), false);
    });

    $(document.body).on("click", ".menuItemOptions", function () {
        lastClickType = 7;
        lastClickID = $(this).attr("id");
        $('.ui-input-search .ui-input-text').val("");
        readModus = true;
        refreshPage($(this), false);
    });
    
    $(document.body).on("click", ".menuItemOptionsClient", function () {
        lastClickType = 11;
        lastClickID = $(this).attr("id");
        $('.ui-input-search .ui-input-text').val("");
        readModus = true;
        refreshPage($(this), false);
    });

    $(document.body).on("click", "#buttonRefresh", function () {
        refreshPage(0, true);
        refreshServiceMessages();
    });

    $(document.body).on("click", "#removeMessages", function () {
        removeMessages();
        refreshServiceMessages();
    });

    $(document.body).on("click", "[name='optionsMenuGfxThemeChooser']", function () {
        $("[name='optionsMenuGfxThemeChooser']").removeClass("ui-btn-active");
        $(this).addClass("ui-btn-active");
        changeTheme($(this).data('value'));
    });
    
    $(document.body).on("click", "[name='optionsMenuGfxFontChooser']", function () {
        $("[name='optionsMenuGfxFontChooser']").removeClass("ui-btn-active");
        $(this).addClass("ui-btn-active");
        changeFont($(this).data('value'));
    });

    $(document.body).on("click", "#reloadWebMatic", function () {
        window.location.reload();
    });

});