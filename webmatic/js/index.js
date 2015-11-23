/* global optionsMap, theme, font */

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

    //Menüpunkt Favoriten
    if (optionsMap["favorites"]) {
        $("#main_menu").append("<div class='scrollToTop' data-role='collapsible' data-collapsed='" + (optionsMap["collapsed"] === "favorites") + "'><h3>Favoriten</h3><ul id='listFavorites' data-role='listview' data-inset='true'></ul></div>");

        if (localStorage.getItem("webmaticFavoritesMap") === null) {
            loadConfigData(false, 'cgi/favorites.cgi', 'favorites', 'webmaticFavoritesMap');
        } else {
            favoritesMap = JSON.parse(localStorage.getItem("webmaticFavoritesMap"));
            loadConfigData(true, 'cgi/favorites.cgi', 'favorites', 'webmaticFavoritesMap');
        }

        $.each(favoritesMap, function (key, val) {
            $("#listFavorites").append("<li class='menuListItem scrollToList' id='" + key + "'><a href='#'><img id='menuImg" + key + "' class='lazyFavorites " + gfxClass + " ui-img-" + theme + "' data-original='../webmatic_user/img/ids/favorites/" + key + ".png' src='img/menu/favorites.png'><span class='breakText'>" + val + "</span></a></li>");
        });
        $("#listFavorites").listview().listview("refresh");
        $("img.lazyFavorites").lazyload({event: "lazyLoadInstantly"});
        $("img").trigger("lazyLoadInstantly");
    }

    //Menüpunkt Räume
    if (optionsMap["rooms"]) {
        $("#main_menu").append("<div class='scrollToTop' data-role='collapsible' data-collapsed='" + (optionsMap["collapsed"] === "rooms") + "'><h3>R&auml;ume</h3><ul id='listRooms' data-role='listview' data-inset='true'></ul></div>");

        if (localStorage.getItem("webmaticRoomsMap") === null) {
            loadConfigData(false, 'cgi/rooms.cgi', 'rooms', 'webmaticRoomsMap'); 
        } else {
            roomsMap = JSON.parse(localStorage.getItem("webmaticRoomsMap"));
            loadConfigData(true, 'cgi/rooms.cgi', 'rooms', 'webmaticRoomsMap'); 
        }

        $.each(roomsMap, function (key, val) {
            $("#listRooms").append("<li class='menuListItem scrollToList' id='" + key + "'><a href='#'><img id='menuImg" + key + "' class='lazyRooms " + gfxClass + " ui-img-" + theme + "' data-original='../webmatic_user/img/ids/rooms/" + key + ".png' src='img/menu/rooms.png'><span class='breakText'>" + val + "</span></a></li>");
        });
        $("#listRooms").listview().listview("refresh");
        $("img.lazyRooms").lazyload({event: "lazyLoadInstantly"});
        $("img").trigger("lazyLoadInstantly");
    }

    //Menüpunkt Gewerke
    if (optionsMap["functions"]) {
        $("#main_menu").append("<div class='scrollToTop' data-role='collapsible' data-collapsed='" + (optionsMap["collapsed"] === "functions") + "'><h3>Gewerke</h3><ul id='listFunctions' data-role='listview' data-inset='true'></ul></div>");

        if (localStorage.getItem("webmaticFunctionsMap") === null) {
            loadConfigData(false, 'cgi/functions.cgi', 'functions', 'webmaticFunctionsMap');
        } else {
            functionsMap = JSON.parse(localStorage.getItem("webmaticFunctionsMap"));
            loadConfigData(true, 'cgi/functions.cgi', 'functions', 'webmaticFunctionsMap');
        }

        $.each(functionsMap, function (key, val) {
            $("#listFunctions").append("<li class='menuListItem scrollToList' id='" + key + "'><a href='#'><img id='menuImg" + key + "' class='lazyFunctions " + gfxClass + " ui-img-" + theme + "' data-original='../webmatic_user/img/ids/functions/" + key + ".png' src='img/menu/functions.png'><span class='breakText'>" + val + "</span></a></li>");
        });
        $("#listFunctions").listview().listview("refresh");
        $("img.lazyFunctions").lazyload({event: "lazyLoadInstantly"});
        $("img").trigger("lazyLoadInstantly");
    }

    //Menüpunkt Variablen
    if (optionsMap["variables"]) {
        $("#main_menu").append("<div id='listVariables' class='scrollToList' data-role='collapsible' data-collapsed-icon='carat-r' data-expanded-icon='carat-r' data-collapsed='" + (optionsMap["collapsed"] === "variables") + "'><h3>Systemvariablen</h3></div>");
    }

    //Menüpunkt Programme
    if (optionsMap["programs"]) {
        $("#main_menu").append("<div id='listPrograms' class='scrollToList' data-role='collapsible' data-collapsed-icon='carat-r' data-expanded-icon='carat-r' data-collapsed='" + (optionsMap["collapsed"] === "programs") + "'><h3>Programme</h3></div>");
    }

    //Menüpunkt Sonstiges
    if (optionsMap["others"]) {
        $("#main_menu").append("<div class='menuListRow' data-role='collapsible' data-collapsed='" + (optionsMap["collapsed"] === "others") + "'><h3>Sonstiges</h3><ul id='listOther' data-role='listview' data-inset='true'></ul></div>");
        $("#listOther").append("<li id='menuItemVariables' class='menuItemVariables'><a href='#'><img class='" + gfxClass + " ui-img-" + theme + "' src='img/menu/variables.png'><span class='breakText'>Systemvariablen</span></a></li>");
        $("#listOther").append("<li id='menuItemPrograms' class='menuItemPrograms'><a href='#'><img class='" + gfxClass + " ui-img-" + theme + "' src='img/menu/programs.png'><span class='breakText'>Programme</span></a></li>");
        $("#listOther").append("<li id='menuItemOptions' class='menuItemOptions'><a href='#'><img class='" + gfxClass + " ui-img-" + theme + "' src='img/menu/options.png'><span class='breakText'>Optionen</span></a></li>");
        $("#listOther").append("<li id='menuItemGraphicIDs' class='menuItemGraphicIDs'><a href='#'><img class='" + gfxClass + " ui-img-" + theme + "' src='img/menu/graphics.png'><span class='breakText'>Grafik IDs</span></a></li>");

        // Größe der Grafiken aus localStorage holen:
        var showTestPages = localStorage.getItem("optionsMenuShowTestpages");
        if (showTestPages && showTestPages === "true") {
            $("#listOther").append("<li id='menuItemDebug' class='menuItemDebug'><a href='#'><img class='" + gfxClass + " ui-img-" + theme + "' src='img/menu/debug.png'><span class='breakText'>Testseite</span></a></li>");
            $("#listOther").append("<li id='menuItemDebugCUxD' class='menuItemDebugCUxD'><a href='#'><img class='" + gfxClass + " ui-img-" + theme + "' src='img/menu/debug.png'><span class='breakText'>Testseite CUxD</span></a></li>");
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
        lastClickType = 4;
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