// ------------------------- Initial call after page loading ------------------------
$(function(){
	// Disable all caching. Default in most browsers, but not in IE and Android (at least 2.2):
	$.ajaxSetup({ cache: false });
	
	// Größe der Grafiken aus localStorage holen:
	gfxClass = localStorage.getItem("optionsMenuGfxSize");
	if (!gfxClass || gfxClass == "" || gfxClass == "large"){
		gfxClass = "ui-li-thumbnail";
	}else{
		gfxClass = "ui-li-icon";
	}
	
	var rooms = true;
	var functions = true;
	var favorites = true;
	var variables = true;
	var programs = true;
	var others = true;
	var collapsed = "";
	
	$.getJSON("../webmatic_user/config.json", function(data) {
		sysVarReadonly = data["systemvar_readonly"] == "true";
		localStorage.setItem("optionsInitSetSysVarReadonly", sysVarReadonly);
		rooms = data["rooms"] == "true";
		functions = data["functions"] == "true";
		favorites = data["favorites"] == "true";
		others = data["others"] == "true";
		variables = data["variables"] == "true";
		programs = data["programs"] == "true";
		collapsed = data["collapsed"];
	
		if(favorites){
			$("#main_menu").append("<div data-role='collapsible' data-collapsed='" + (collapsed == "favorites") + "'><h3>Favoriten</h3><ul id='listFavorites' data-role='listview' data-inset='true'></ul></div>");
			$.getJSON('cgi/favorites.cgi', function(data) {
				$.each(data, function(key, val) {
					$("#listFavorites").append("<li class='menuListItem' id='" + key + "'><a href='#'><img class='lazyFavorites " + gfxClass + " ui-img-" + theme +"' data-original='../webmatic_user/img/ids/favorites/" + key + ".png' src='img/menu/favorites.png'><span class='breakText'>" + val + "</span></a></li>");
				});
				$("#listFavorites").listview().listview("refresh");
				$("img.lazyFavorites").lazyload({event: "lazyLoadInstantly"});
				$("img").trigger("lazyLoadInstantly");
			});
		}

		if(rooms){
			$("#main_menu").append("<div data-role='collapsible' data-collapsed='" + (collapsed == "rooms") + "'><h3>R&auml;ume</h3><ul id='listRooms' data-role='listview' data-inset='true'></ul></div>");
			$.getJSON('cgi/rooms.cgi', function(data) {
				$.each(data, function(key, val) {
					$("#listRooms").append("<li class='menuListItem' id='" + key + "'><a href='#'><img class='lazyRooms " + gfxClass + " ui-img-" + theme +"' data-original='../webmatic_user/img/ids/rooms/" + key + ".png' src='img/menu/rooms.png'><span class='breakText'>" + val + "</span></a></li>");
				});
				$("#listRooms").listview().listview("refresh");
				$("img.lazyRooms").lazyload({event: "lazyLoadInstantly"});
				$("img").trigger("lazyLoadInstantly");
			});
		}

		if(functions){
			$("#main_menu").append("<div data-role='collapsible' data-collapsed='" + (collapsed == "functions") + "'><h3>Gewerke</h3><ul id='listFunctions' data-role='listview' data-inset='true'></ul></div>");
			$.getJSON('cgi/functions.cgi', function(data) {
				$.each(data, function(key, val) {
					$("#listFunctions").append("<li class='menuListItem' id='" + key + "'><a href='#'><img class='lazyFunctions " + gfxClass + " ui-img-" + theme +"' data-original='../webmatic_user/img/ids/functions/" + key + ".png' src='img/menu/functions.png'><span class='breakText'>" + val + "</span></a></li>");
				});
				$("#listFunctions").listview().listview("refresh");
				$("img.lazyFunctions").lazyload({event: "lazyLoadInstantly"});
				$("img").trigger("lazyLoadInstantly");
			});
		}
		
		if(variables){
			$("#main_menu").append("<div id='listVariables' data-role='collapsible' data-collapsed-icon='carat-r' data-expanded-icon='carat-r' data-collapsed='" + (collapsed == "variables") + "'><h3>Systemvariablen</h3></div>");
		}
		
		if(programs){
			$("#main_menu").append("<div id='listPrograms' data-role='collapsible' data-collapsed-icon='carat-r' data-expanded-icon='carat-r' data-collapsed='" + (collapsed == "programs") + "'><h3>Programme</h3></div>");
		}

		if(others){
			$("#main_menu").append("<div data-role='collapsible' data-collapsed='" + (collapsed == "others") + "'><h3>Sonstiges</h3><ul id='listOther' data-role='listview' data-inset='true'></ul></div>");
			$("#listOther").append("<li class='menuItemVariables'><a href='#'><img class='" + gfxClass + " ui-img-" + theme +"' src='img/menu/variables.png'><span class='breakText'>Systemvariablen</span></a></li>");
			$("#listOther").append("<li class='menuItemPrograms'><a href='#'><img class='" + gfxClass + " ui-img-" + theme +"' src='img/menu/programs.png'><span class='breakText'>Programme</span></a></li>");
			$("#listOther").append("<li class='menuItemOptions'><a href='#'><img class='" + gfxClass + " ui-img-" + theme +"' src='img/menu/options.png'><span class='breakText'>Optionen</span></a></li>");
			$("#listOther").append("<li class='menuItemGraphicIDs'><a href='#'><img class='" + gfxClass + " ui-img-" + theme +"' src='img/menu/graphics.png'><span class='breakText'>Grafik IDs</span></a></li>");

			// Größe der Grafiken aus localStorage holen:
			showTestPages = localStorage.getItem("optionsMenuShowTestpages");
			if (showTestPages && showTestPages == "true"){
				$("#listOther").append("<li class='menuItemDebug'><a href='#'><img class='" + gfxClass + " ui-img-" + theme +"' src='img/menu/debug.png'><span class='breakText'>Testseite</span></a></li>");
				$("#listOther").append("<li class='menuItemDebugCUxD'><a href='#'><img class='" + gfxClass + " ui-img-" + theme +"' src='img/menu/debug.png'><span class='breakText'>Testseite CUxD</span></a></li>");
			}
			$("#listOther").listview().listview("refresh");
		}
		
		$("#main_menu").collapsibleset( "refresh" );

		RefreshServiceMessages();

		// Update Timer loslaufen lassen:
		RestartTimer();
		
		changeTheme(theme);
		
		$(document.body).on("collapsibleexpand collapsiblecollapse", "#listVariables", function( event, ui ) {
			$(this).children(".ui-collapsible-content").hide();
			lastClickType = 2;
			lastClickID   = $(this).attr("id");
			$('.ui-input-search .ui-input-text').val("");
			readModus = true;
			RefreshPage($(this), false);
		});
		
		$(document.body).on("collapsibleexpand collapsiblecollapse", "#listPrograms", function( event, ui ) {
			$(this).children(".ui-collapsible-content").hide();
			lastClickType = 3;
			lastClickID   = $(this).attr("id");
			$('.ui-input-search .ui-input-text').val("");
			readModus = true;
			RefreshPage($(this), false);
		});
		
		$( "#main_menu" ).children("div[data-collapsed='true']").collapsible("expand");
	}).error(function(e) { 
		var error = e; 
	});
	
	$(document.body).on("click", ".menuListItem", function(){
		lastClickType = 1;
		lastClickID   = $(this).attr("id");
		$('.ui-input-search .ui-input-text').val("");
		readModus = true;
		RefreshPage($(this), false);
	});

	$(document.body).on("click", ".menuItemVariables", function(){
		lastClickType = 2;
		lastClickID   = $(this).attr("id");
		$('.ui-input-search .ui-input-text').val("");
		readModus = false;
		RefreshPage($(this), false);
	});

	$(document.body).on("click", ".menuItemPrograms", function(){
		lastClickType = 3;
		lastClickID   = $(this).attr("id");
		$('.ui-input-search .ui-input-text').val("");
		readModus = false;
		RefreshPage($(this), false);
	});

	$(document.body).on("click", ".menuItemGraphicIDs", function(){
		lastClickType = 4;
		lastClickID   = $(this).attr("id");
		$('.ui-input-search .ui-input-text').val("");
		readModus = true;
		RefreshPage($(this), false);
	});

	$(document.body).on("click", ".menuItemDebug", function(){
		lastClickType = 5;
		lastClickID   = 0;
		$('.ui-input-search .ui-input-text').val("");
		readModus = true;
		RefreshPage($(this), false);
	});

	$(document.body).on("click", ".menuItemDebugCUxD", function(){
		lastClickType = 6;
		lastClickID   = 0;
		$('.ui-input-search .ui-input-text').val("");
		readModus = true;
		RefreshPage($(this), false);
	});

	$(document.body).on("click", ".menuItemOptions", function(){
		lastClickType = 7;
		lastClickID   = $(this).attr("id");
		$('.ui-input-search .ui-input-text').val("");
		readModus = true;
		RefreshPage($(this), false);
	});
	
	$(document.body).on("click", "#buttonRefresh", function(){
		RefreshPage(0, true);
		RefreshServiceMessages();
	});

	$(document.body).on("click", "#removeMessages", function(){
		RemoveMessages();
		RefreshServiceMessages();
	});
	
	$(document.body).on("click", "#optionsMenuGfxSizeSmall", function(){
		localStorage.setItem("optionsMenuGfxSize", "small");
		RefreshPage(0, true);
	});

	$(document.body).on("click", "#optionsMenuGfxSizeLarge", function(){
		localStorage.setItem("optionsMenuGfxSize", "large");
		RefreshPage(0, true);
	});

	$(document.body).on("click", "#optionsMenuShowTestpages", function(){
		localStorage.setItem("optionsMenuShowTestpages", "true");
		RefreshPage(0, true);
	});

	$(document.body).on("click", "#optionsMenuHideTestpages", function(){
		localStorage.setItem("optionsMenuShowTestpages", "false");
		RefreshPage(0, true);
	});
	
	$(document.body).on("click", "[name='optionsMenuGfxThemeChooser']", function(){
		$("[name='optionsMenuGfxThemeChooser']").removeClass("ui-btn-active");
		$(this).addClass("ui-btn-active");
		changeTheme($(this).data('value'));
	});

	$(document.body).on("click", "#reloadWebMatic", function(){
		window.location.reload();
	});
	
});