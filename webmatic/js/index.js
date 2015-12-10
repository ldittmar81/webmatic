/* global optionsMap, theme, font, newVersion, saveDataToFile, debugModus, client, optionsClientMap */

// ------------------------- Initial call after page loading ------------------------
$(function () {
    // Disable all caching. Default in most browsers, but not in IE and Android (at least 2.2):
    $.ajaxSetup({cache: false});

    // Größe der Grafiken aus localStorage holen:
    var gfxClass = localStorage.getItem("optionsMenuGfxSize");
    if (!gfxClass || gfxClass === "" || gfxClass === "large") {
        gfxClass = "ui-li-thumbnail";
    } else {
        gfxClass = "ui-li-icon";
    }

    // ----------------------- Menüpunkte -----------------------

    var collapsed = ("collapsed" in optionsClientMap?optionsClientMap["collapsed"]:optionsMap["collapsed"]);
    
    //Menüpunkt Favoriten
    var showFavorites = ("favorites" in optionsClientMap?optionsClientMap["favorites"]:optionsMap["favorites"]);
    if (showFavorites) {
        $("#main_menu").append("<div class='scrollToTop' data-role='collapsible' data-collapsed='" + (collapsed === "favorites") + "'><h3>" + mapText("FAVORITES") + "</h3><ul id='listFavorites' data-role='listview' data-inset='true'></ul></div>");

        if (localStorage.getItem("webmaticfavoritesMap") === null) {
            if(newVersion){
                saveDataToFile = true;
            }
            loadConfigData(false, '../webmatic_user/favorites.json', 'favorites', 'webmaticfavoritesMap', false, false);
        } else {
            favoritesMap = JSON.parse(localStorage.getItem("webmaticfavoritesMap"));            
        }
        
        loadConfigData(true, 'cgi/favorites.cgi', 'favorites', 'webmaticfavoritesMap', false, true);
        
        var tmpObj = {};
        $.each(favoritesMap, function (key, val) {
            var html = "<li class='menuListItem scrollToList' id='" + key + "' " + (val['visible']?"":"style='display: none;'") + ">";
            html += "<a href='#'><img id='menuImg" + key + "' class='" + gfxClass + " ui-img-" + theme;
            if(val['pic']){
                html += " lazyFavorites' data-original='../webmatic_user/img/ids/favorites/" + key + ".png";
            }
            html += "' src='img/menu/favorites.png'><span id='menuText" + key + "' class='breakText'>" + val['name'] + "</span></a></li>";
            tmpObj[val['position']] = html;            
        });
        var keys = Object.keys(tmpObj).sort(function(a,b){return a-b});
        var len = keys.length;    
        for (var i = 0; i < len; i++) {
            var k = keys[i];
            $("#listFavorites").append(tmpObj[k]);
        }
        $("#listFavorites").listview().listview("refresh");
        $("img.lazyFavorites").lazyload({event: "lazyLoadInstantly"});
        $("img").trigger("lazyLoadInstantly");
    }

    //Menüpunkt Räume
    var showRooms = ("rooms" in optionsClientMap?optionsClientMap["rooms"]:optionsMap["rooms"]);
    if (showRooms) {
        $("#main_menu").append("<div class='scrollToTop' data-role='collapsible' data-collapsed='" + (collapsed === "rooms") + "'><h3>" + mapText("ROOMS") + "</h3><ul id='listRooms' data-role='listview' data-inset='true'></ul></div>");

        if (localStorage.getItem("webmaticroomsMap") === null) {
            if(newVersion){
                saveDataToFile = true;
            }
            loadConfigData(false, '../webmatic_user/rooms.json', 'rooms', 'webmaticroomsMap', false, false);
        } else {
            roomsMap = JSON.parse(localStorage.getItem("webmaticroomsMap"));            
        }
        
        loadConfigData(true, 'cgi/rooms.cgi', 'rooms', 'webmaticroomsMap', false, true);

        var tmpObj = {};
        $.each(roomsMap, function (key, val) {
            var html = "<li class='menuListItem scrollToList' id='" + key + "' " + (val['visible']?"":"style='display: none;'") + ">";
            html += "<a href='#'><img id='menuImg" + key + "' class='" + gfxClass + " ui-img-" + theme;
            if(val['pic']){
                html += " lazyRooms' data-original='../webmatic_user/img/ids/rooms/" + key + ".png";
            }
            html += "' src='img/menu/rooms.png'><span id='menuText" + key + "' class='breakText'>" + val['name'] + "</span></a></li>";
            tmpObj[val['position']] = html;            
        });
        var keys = Object.keys(tmpObj).sort(function(a,b){return a-b});
        var len = keys.length;    
        for (var i = 0; i < len; i++) {
            var k = keys[i];
            $("#listRooms").append(tmpObj[k]);
        }
        $("#listRooms").listview().listview("refresh");
        $("img.lazyRooms").lazyload({event: "lazyLoadInstantly"});
        $("img").trigger("lazyLoadInstantly");
    }

    //Menüpunkt Gewerke
    var showFunctions = ("functions" in optionsClientMap?optionsClientMap["functions"]:optionsMap["functions"]);
    if (showFunctions) {
        $("#main_menu").append("<div class='scrollToTop' data-role='collapsible' data-collapsed='" + (collapsed === "functions") + "'><h3>" + mapText("FUNCTIONS") + "</h3><ul id='listFunctions' data-role='listview' data-inset='true'></ul></div>");

        if (localStorage.getItem("webmaticfunctionsMap") === null) {
            if(newVersion){
                saveDataToFile = true;
            }
            loadConfigData(false, '../webmatic_user/functions.json', 'functions', 'webmaticfunctionsMap', false, false);
        } else {
            functionsMap = JSON.parse(localStorage.getItem("webmaticfunctionsMap"));            
        }
        
        loadConfigData(true, 'cgi/functions.cgi', 'functions', 'webmaticfunctionsMap', false, true);

        var tmpObj = {};
        $.each(functionsMap, function (key, val) {
            var html = "<li class='menuListItem scrollToList' id='" + key + "' " + (val['visible']?"":"style='display: none;'") + ">";
            html += "<a href='#'><img id='menuImg" + key + "' class='" + gfxClass + " ui-img-" + theme;
            if(val['pic']){
                html += " lazyFunctions' data-original='../webmatic_user/img/ids/functions/" + key + ".png";
            }
            html += "' src='img/menu/functions.png'><span id='menuText" + key + "' class='breakText'>" + val['name'] + "</span></a></li>";
            tmpObj[val['position']] = html;            
        });
        var keys = Object.keys(tmpObj).sort(function(a,b){return a-b});
        var len = keys.length;    
        for (var i = 0; i < len; i++) {
            var k = keys[i];
            $("#listFunctions").append(tmpObj[k]);
        }
        $("#listFunctions").listview().listview("refresh");
        $("img.lazyFunctions").lazyload({event: "lazyLoadInstantly"});
        $("img").trigger("lazyLoadInstantly");
    }

    //Menüpunkt Variablen
    var showVariables = ("variables" in optionsClientMap?optionsClientMap["variables"]:optionsMap["variables"]);
    if (showVariables) {
        $("#main_menu").append("<div id='listVariables' class='scrollToList' data-role='collapsible' data-collapsed-icon='carat-r' data-expanded-icon='carat-r' data-collapsed='" + (collapsed === "variables") + "'><h3>" + mapText("SYS_VAR") + "</h3></div>");
    }

    //Menüpunkt Programme
    var showPrograms = ("programs" in optionsClientMap?optionsClientMap["programs"]:optionsMap["programs"]);
    if (showPrograms) {
        $("#main_menu").append("<div id='listPrograms' class='scrollToList' data-role='collapsible' data-collapsed-icon='carat-r' data-expanded-icon='carat-r' data-collapsed='" + (collapsed === "programs") + "'><h3>" + mapText("PROGRAMS") + "</h3></div>");
    }

    //Menüpunkt Sonstiges
    var showOthers = ("others" in optionsClientMap?optionsClientMap["others"]:optionsMap["others"]);
    if (showOthers) {
        $("#main_menu").append("<div class='menuListRow' data-role='collapsible' data-collapsed='" + (collapsed === "others") + "'><h3>" + mapText("SETTINGS") + "</h3><ul id='listOther' data-role='listview' data-inset='true'></ul></div>");
        $("#listOther").append("<li id='menuItemVariables' class='menuItemVariables'><a href='#'><img class='" + gfxClass + " ui-img-" + theme + "' src='img/menu/variables.png'><span class='breakText'>" + mapText("SYS_VAR") + "</span></a></li>");
        $("#listOther").append("<li id='menuItemPrograms' class='menuItemPrograms'><a href='#'><img class='" + gfxClass + " ui-img-" + theme + "' src='img/menu/programs.png'><span class='breakText'>" + mapText("PROGRAMS") + "</span></a></li>");
        $("#listOther").append("<li id='menuItemOptions' class='menuItemOptions'><a href='#'><img class='" + gfxClass + " ui-img-" + theme + "' src='img/menu/options.png'><span class='breakText'>" + mapText("OPTIONS") + "</span></a></li>");
        if(client !== ""){
            $("#listOther").append("<li id='menuItemOptionsClient' class='menuItemOptionsClient'><a href='#'><img class='" + gfxClass + " ui-img-" + theme + "' src='img/menu/options.png'><span class='breakText'>" + mapText("OPTIONS_CLIENT") + "</span></a></li>");
        }
        $("#listOther").append("<li id='menuItemGraphicIDs_FAVORITES' class='menuItemGraphicIDs' data-refresh-id='4'><a href='#'><img class='" + gfxClass + " ui-img-" + theme + "' src='img/menu/graphics.png'><span class='breakText'>" + mapText("EDIT") + " (" + mapText("FAVORITES") + ")</span></a></li>");
        $("#listOther").append("<li id='menuItemGraphicIDs_ROOMS' class='menuItemGraphicIDs' data-refresh-id='8'><a href='#'><img class='" + gfxClass + " ui-img-" + theme + "' src='img/menu/graphics.png'><span class='breakText'>" + mapText("EDIT") + " (" + mapText("ROOMS") + ")</span></a></li>");
        $("#listOther").append("<li id='menuItemGraphicIDs_FUNCTIONS' class='menuItemGraphicIDs' data-refresh-id='9'><a href='#'><img class='" + gfxClass + " ui-img-" + theme + "' src='img/menu/graphics.png'><span class='breakText'>" + mapText("EDIT") + " (" + mapText("FUNCTIONS") + ")</span></a></li>");
        $("#listOther").append("<li id='menuItemGraphicIDs_PROGRAMS' class='menuItemGraphicIDs' data-refresh-id='10'><a href='#'><img class='" + gfxClass + " ui-img-" + theme + "' src='img/menu/graphics.png'><span class='breakText'>" + mapText("EDIT") + " (" + mapText("PROGRAMS") + ")</span></a></li>");

        if (debugModus) {
            $("#listOther").append("<li id='menuItemDebug' class='menuItemDebug'><a href='#'><img class='" + gfxClass + " ui-img-" + theme + "' src='img/menu/debug.png'><span class='breakText'>" + mapText("TEST_DEVICE") + "</span></a></li>");
            $("#listOther").append("<li id='menuItemDebugCUxD' class='menuItemDebugCUxD'><a href='#'><img class='" + gfxClass + " ui-img-" + theme + "' src='img/menu/debug.png'><span class='breakText'>" + mapText("TEST_CUXD") + "</span></a></li>");
        }
        $("#listOther").listview().listview("refresh");
    }

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

    $(document.body).on("collapsibleexpand", "#listVariables", function () {
        $(this).children(".ui-collapsible-content").hide();
        lastClickType = 2;
        lastClickID = $(this).attr("id");
        $('.ui-input-search .ui-input-text').val("");
        readModus = true;
        refreshPage($(this), false);
    });

    $(document.body).on("collapsibleexpand", "#listPrograms", function () {
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

    $(document.body).on("click", "#optionsMenuGfxSizeSmall", function () {
        localStorage.setItem("optionsMenuGfxSize", "small");
        refreshPage(0, true);
    });

    $(document.body).on("click", "#optionsMenuGfxSizeLarge", function () {
        localStorage.setItem("optionsMenuGfxSize", "large");
        refreshPage(0, true);
    });

    $(document.body).on("click", "#optionsMenuShowTestpages", function () {
        localStorage.setItem("optionsMenuShowTestpages", "true");
        refreshPage(0, true);
    });

    $(document.body).on("click", "#optionsMenuHideTestpages", function () {
        localStorage.setItem("optionsMenuShowTestpages", "false");
        refreshPage(0, true);
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