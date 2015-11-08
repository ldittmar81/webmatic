// WebMatic
// (c) Frank Epple
// h-Diagrams by Goglo
// ----------------------- Click function handlers ----------------------------

// Variables to save last click:
var lastClickType = -1;
var lastClickID   = -1;
var readModus     = false;

prevItem = 0;

//Initialwerte
var sysVarReadonly = localStorage.getItem("optionsInitSetSysVarReadonly");
var theme_arr = [ "a", "b", "c", "d", "e", "f", "g", "h"];
var theme = localStorage.getItem("optionsMenuGfxTheme");
if($.inArray(theme, theme_arr) == -1){
	theme = "a";
}

// Initialize refresh timer:
refreshTimer = setInterval(function() {CheckRefreshPage();}, 1000);
lastTime = -1;

function CheckRefreshPage(){
  // Statt Timer auf 60 Sekunden hier eigener Vergleich alle Sekunde. Nur so geht es, dass nach einem iOS WakeUp
  // des Browsers sofort ein Reload passiert, wenn mehr als 60 Sekunden vorbei sind.
	d = new Date();
	t = d.getTime();
	if (lastTime != -1)
	{
		if (t - lastTime > 60000)
		{
			if (lastClickType != 4 && lastClickType != 7) RefreshPage(0, true); // Kein Refresh bei GrafikIDs und Optionen.
			RefreshServiceMessages();
			lastTime = t;
		}
	}else{
		lastTime = t;
	}
}

function RestartTimer(){
	// Zeit zurücksetzen, damit wieder neu gezählt wird:
	d = new Date();
	t = d.getTime();
	lastTime = t;
}

function RefreshPage(item, saveScrollPos){
	// Gleich mal den Timer neu starten, lieber vor dem Reload, damit sich die nicht in die Quere kommen.
	// Später dann besser nur einen Refresh zur selben Zeit zulassen:
	RestartTimer();

	// Markieren von selektiertem Menueintrag:
	if (item != 0){
		if (prevItem != 0){
			prevItem.removeClass("ui-btn-down-" + theme);
			prevItem.addClass("ui-btn-up-" + theme);
			prevItem.attr("data-theme", theme);
		}
		item.removeClass("ui-btn-up-" + theme);
		item.addClass("ui-btn-down-" + theme);
		item.attr("data-theme", theme);
		prevItem = item;
	}

	if (lastClickType != -1 && lastClickID != -1){
		oldScrollPos = -1;
		if (saveScrollPos){
			oldScrollPos = $(window).scrollTop();
		}

		switch (lastClickType){
			case 1:
				loadData('cgi/list.cgi?list=' + lastClickID, oldScrollPos);
				break;
			case 2:
				loadVariables(oldScrollPos);
				break;
			case 3:
				loadPrograms(oldScrollPos);
				break;
			case 4:
				loadGraphicIDs();
				break;
			case 5:
				loadData('debug.json', oldScrollPos);
				break;
			case 6:
				loadData('debug_cuxd.json', oldScrollPos);
				break;
			case 7:
				loadOptions();			
		}
		
		$("#prim").find("script").each(function(){
			var src = $(this).attr('src');
			if(src){
				$.getScript(src);
			}else{
				eval($(this).text());
			}
		});
		
	}
}

function RefreshServiceMessages(){
	$('#buttonService .ui-btn-text').html("<img class='ui-img-" + theme + "' src='img/misc/wait16.gif' width=12px height=12px>");

	$.getJSON('cgi/service.cgi', function(data){
		$("#serviceList").empty();
		errNr = 0;
		$.each(data.entries, function(i, msg){
			msgName = msg['name'];
			msgType = msg['type'];
			msgDevice = msg['device'];
			msgError = msg['error'];
			msgValue = msg['value'];
			msgDate = msg['date'];
			msgReadable = GetErrorMessage(msgType, msgError, msgValue, msgDevice);

			$("#serviceList").append("<li><p class='ui-li-desc' style='text-align:right;'>" + msgDate + "</p><h1>" + msgName + "</h1><p>" + msgReadable + "</p></li>");
			errNr = errNr + 1;
		});
		$('#buttonService .ui-btn-text').text("(" + errNr + ")");
		if (errNr == 0){
			$('#buttonService').buttonMarkup({theme: theme});
			$('#headerButtonGroup').controlgroup('refresh', true);
			$("#serviceList").append("<li><p>Keine Servicemeldungen vorhanden.</p></li>");
		}else{
			$('#buttonService').buttonMarkup({theme: theme});
			$('#headerButtonGroup').controlgroup('refresh', true);
		}
		$('#serviceList').listview().listview('refresh', true);
	});
}

function RemoveMessages(){
	$.getJSON('cgi/removemessages.cgi', function(data){
	});
}

// ----------------------- HTML Creation Helper ------------------------------

// Ein Button, bei dessen drücken ein Wert an die ID übertragen wird.
// onlyButton wird benutzt, wenn für das selbe Element mehrere Controls angezeigt werden sollen, aber nur einmal die Zusatzinfos. Z.B. Winmatic, Keymatic, Dimmer.
function AddSetButton(id, text, value, vorDate, onlyButton, noAction, refresh){
	html = "";
	if (!onlyButton){
		html += "<p class='ui-li-desc'>"
	}

	if (noAction){
		html += "<a href='#' data-value='" + value + "' data-role='button' data-inline='true' data-theme='" + theme + "'>" + text + "</a>";
	}else{
		html += "<a href='#' id='setButton_" + id + "' data-id='" + id + "' data-refresh='" + refresh + "' data-value='" + value + "' data-role='button' data-inline='true'>" + text + "</a>";
	}

	if (!onlyButton){
		html += "<i>" + vorDate + "</i> <span id='info_" + id + "' class='valueOK valueOK-" + theme + "'></span></p>";
	}

	return html;
}

// Ein Button, bei dessen drücken ein Programm ID ausgeführt wird.
function AddStartProgramButton(id, text, vorDate, operate){
	html = "<p class='ui-li-desc'><a href='#' class='" + (!operate?"ui-disabled":"") + "' id='startProgramButton_" + id + "' data-id='" + id + "' data-role='button' data-inline='true' data-icon='gear'>" + text + "</a></div>";
	html += "<i>" + vorDate + "</i> <span id='info_" + id + "' class='valueOK valueOK-" + theme +"'></span></p>";
	return html;
}

// Ein Slider und Button, bei dessen drücken der neue Wert an die ID übertragen wird.
// Factor wird für das Setzen verwendet, z.B. bei Jalousien muss 0-1 gesetzt werden, für die Anzeige
// ist aber 0 - 100 schöner.
//
// TODO: Was mit Float/Integer Unterscheidung? Slider evtl. aus, wenn der Bereich zu groß ist?
function AddSetNumber(id, value, unit, min, max, step, factor, vorDate, refresh){
	html = "<div data-role='fieldcontain'>";
	html += "<input type='range' value='" + value * factor + "' min='" + min * factor + "' max='" + max * factor + "' step='" + step * factor + "' data-factor='" + factor + "' id='setValue_" + id + "' data-id='" + id + "' data-highlight='true' data-theme='" + theme + "'/>";
	html += " (" + min * factor + " - " + max * factor + " " + unit + ") ";
	html += "<a href='#' id='setNumberButton_" + id + "' data-id='" + id + "' data-refresh='" + refresh + "' data-role='button' data-inline='true' data-icon='check'>Setzen</a>";
	html += "<i class='ui-li-desc'>" + vorDate + "</i> <span id='info_" + id + "' class='valueOK valueOK-" + theme + "'></span>";
	html += "</div>";
	return html;
}

function AddSetBoolButtonList(valID, strValue, val0, val1, valUnit, vorDate, refresh){
	html = "<div data-role='fieldcontain'>";
	html += "<div data-role='controlgroup' data-type='horizontal'>";

	// Leerstring heißt wohl auch false, z.B. bei Alarmzone.
	if (strValue == "false" || strValue == ""){
		idString = "class='ui-btn-active'";
	}else{
		idString = "id='setButton_" + valID + "' data-id='" + valID + "' data-refresh='" + refresh + "'";
	}	
	html += "<a href='#' " + idString + " data-value='false' data-role='button' data-inline='true' data-theme='" + theme + "'>" + val0 + "</a>";

	if (strValue == "true"){
		idString = "class='ui-btn-active'";
	}else{
		idString = "id='setButton_" + valID + "' data-id='" + valID + "' data-refresh='" + refresh + "'";
	}
	html += "<a href='#' " + idString + " data-value='true' data-role='button' data-inline='true' data-theme='" + theme + "'>" + val1 + "</a>";

	html += "</div>";
	html += "</div>";
	html += " " + valUnit + " ";//<a href='#' id='setBoolButton_" + valID + "' data-id='" + valID + "' data-role='button' data-inline='true' data-icon='check'>Setzen</a>";
	html += "<i class='ui-li-desc'>" + vorDate + "</i> <span id='info_" + valID + "' class='valueOK valueOK-" + theme + "'></span>";

	return html;
}

function AddSetBoolComboBox(valID, strValue, val0, val1, valUnit, vorDate){
	html = "<div data-role='fieldcontain'>";
	html += "<select id='setValue_" + valID + "' data-id='" + valID + "' data-native-menu='false' data-inline='true'>";
	if (strValue == "true"){
		html += "<option value='false'>" + val0 + "</option><option selected value='true'>" + val1 + "</option>";
	}else{
		html += "<option selected value='false'>" + val0 + "</option><option value='true'>" + val1 + "</option>";
	}
	html += "</select>";
	html += " " + valUnit + " <a href='#' id='setBoolButton_" + valID + "' data-id='" + valID + "' data-role='button' data-inline='true' data-icon='check'>Setzen</a>";
	html += "<i class='ui-li-desc'>" + vorDate + "</i> <span id='info_" + valID + "' class='valueOK valueOK-" + theme + "'></span>";
	html += "</div>";

	return html;
}

function AddSetBoolSwitch(valID, strValue, val0, val1, valUnit, vorDate){
	html = "<div data-role='fieldcontain'>";
	html += "<div class='longerFlip'><select id='setValue_" + valID + "' data-id='" + valID + "' data-role='slider'>";
	if (strValue == "true"){
		html += "<option value='false'>" + val0 + "</option><option selected value='true'>" + val1 + "</option>";
	}else{
		html += "<option selected value='false'>" + val0 + "</option><option value='true'>" + val1 + "</option>";
	}
	html += "</select></div>";
	html += " " + valUnit + " <a href='#' id='setBoolButton_" + valID + "' data-id='" + valID + "' data-role='button' data-inline='true' data-icon='check'>Setzen</a>";
	html += "<i class='ui-li-desc'>" + vorDate + "</i> <span id='info_" + valID + "' class='valueOK valueOK-" + theme + "'></span>";
	html += "</div>";

	return html;
}

function AddSetValueList(valID, strValue, valList, valUnit, vorDate, refresh){
	html = "<div data-role='fieldcontain'>";
	html += "<div data-role='controlgroup' data-type='horizontal'>";
	selIndex = parseInt(strValue);
	optionsArray = valList.split(";");
	for (i = 0; i < optionsArray.length; i++){
		if (selIndex == i){
			html += "<a href='#' data-value='" + i + "' data-role='button' data-inline='true' class='ui-btn-active' data-theme='" + theme + "'>" + optionsArray[i] + "</a>";
		}else{
			html += "<a href='#' id='setButton_" + valID + "' data-id='" + valID + "' data-refresh='" + refresh + "' data-value='" + i + "' data-role='button' data-inline='true'>" + optionsArray[i] + "</a>";
		}
	}
	html += "</div>";
	html += "</div>";
	html += " " + valUnit + " "; //<a href='#' id='setValueListButton_" + valID + "' data-id='" + valID + "' data-role='button' data-inline='true' data-icon='check'>Setzen</a>";
	html += "<i class='ui-li-desc'>" + vorDate + "</i> <span id='info_" + valID + "' class='valueOK valueOK-" + theme + "'></span>";

	return html;
}

function AddSetText(valID, val, valUnit, vorDate){
	html = "<div data-role='fieldcontain'>";
	// Der String ist hier mit " eingefasst, darum müssen diese im String mit &quot; ersetzt werden:
	val = val.replace(/\"/g, "&quot;");
	if(val.length > 40){
		html += "<textarea id='setValue_" + valID + "' data-id='" + valID + "' style='width:20em; display:inline-block;'>" + val + "</textarea>";
	}else{
		html += "<input type='text' id='setValue_" + valID + "' data-id='" + valID + "' value=\"" + val + "\" style='width:20em; display:inline-block;'/>";
	}
	html += " " + valUnit + " <a href='#' id='setTextButton_" + valID + "' data-id='" + valID + "' data-role='button' data-inline='true' data-icon='check'>Setzen</a>";
	html += "<i class='ui-li-desc'>" + vorDate + "</i> <span id='info_" + valID + "' class='valueOK valueOK-" + theme + "'></span>";
	html += "</div>";
	return html;
}

function AddHTML(valID, val, vorDate, readonly){
	html = "<div data-role='fieldcontain' class='" + (readonly?"":"ui-grid-a") + "'>";	
	html += "<div class='" + (readonly?"":"ui-block-a") + "'>" + val + "</div>";
	if(!readonly){
		html += "<div class='ui-block-b'><textarea id='setValue_" + valID + "' data-id='" + valID + "' style='width:20em; display:inline-block;'>" + val + "</textarea>";
		html += "<a href='#' id='setTextButton_" + valID + "' data-id='" + valID + "' data-role='button' data-inline='true' data-icon='check'>Setzen</a>";
		html += "<i class='ui-li-desc'>" + vorDate + "</i> <span id='info_" + valID + "' class='valueOK valueOK-" + theme + "'></span>";
		html += "</div>";
		html += "</div>";
	}
	return html;
}

function AddReadonlyVariable(valID, strValue, vorDate, valType, valUnit, valList){
	// Bestimmen, wie der sichtbare Werte aussehen soll:
	visVal = "";
	if (valType == "2"){
		// Bool.
		if (strValue == "true"){
			visVal = val1;
		}else{
			visVal = val0;
		}
	}else if (valType == "4"){
		// Float, Integer.
		visVal = parseFloat(strValue);
	}else if (valType == "16"){
		// Liste.
		optionsArray = valList.split(";");
		visVal = optionsArray[parseInt(strValue)];
	}else{
		// String oder unbekannt.
		visVal = strValue;
	}
	if (valType == "20" && valUnit == "html"){
		return AddHTML(valID, strValue, vorDate, true);
	}else{
		return "<p><img class='ui-img-" + theme + "' src='img/channels/unknown.png' style='max-height:20px'><span class='valueInfo valueInfo-" + theme + "'>" + visVal + " " + valUnit + " </span></p><i class='ui-li-desc'>" + vorDate + "</i>";
	}
}

// ----------------------- Helper functions ----------------------------

function GetDateFromString(strDate){
	var dy = strDate.substring(0,2);
	var mn = strDate.substring(3,5) - 1; // -1, da 0 basiert.
	var yr = strDate.substring(6,10);
	var hr  = strDate.substring(11,13);
	var mi = strDate.substring(14,16);
	var sc  = strDate.substring(17,19);
	return new Date(yr, mn, dy, hr, mi, sc);
}

function GetTimeDiffString(diffDate, systemDate){
	dateTimeSystem = GetDateFromString(systemDate);
	dateTimeDiff = GetDateFromString(diffDate);
	timeDiff = (dateTimeSystem - dateTimeDiff) / 1000;  // In Sekunden konvertieren.

	if (timeDiff < 60){
		return "Vor " + Math.floor(timeDiff + 0.5) + " Sekunde/n";
	}else if (timeDiff < 60*60){
		return "Vor " + Math.floor(timeDiff / 60 + 0.5) + " Minute/n";
	}else if (timeDiff < 60*60*24){
		return "Vor " + Math.floor(timeDiff / (60 * 60) + 0.5) + " Stunde/n";
	}else if (timeDiff < 60*60*24*30.5){
		return "Vor " + Math.floor(timeDiff / (60 * 60 * 24) + 0.5) + " Tag/en";
	}else if (timeDiff < 60*60*24*30.5*12){
		return "Vor " + Math.floor(timeDiff / (60 * 60 * 24 * 30.5) + 0.5) + " Monat/en";
	}else{
		y = Math.floor(timeDiff / (60 * 60 * 24 * 30.5 * 12) + 0.5);
		if (y > 40){
			return "Noch nicht ver&auml;ndert";
		}else{
			return "Vor " + y + " Jahr/en";
		}
	}
}

function GetErrorMessage(errType, error, errValue, deviceHssType){
	noError = false;  // Wird verwendet, wenn "Unbekannter Fehler" nicht angezeigt werden soll.
	txt = "";

	if (errType == "ALARMDP"){
		if (error == "CONFIG_PENDING"){
			return "<span class='valueInfo valueInfo-" + theme + "'>Konfigurationsdaten werden &uuml;bertragen</span>";
		}
		if (error == "LOWBAT"){
			return "<span class='valueWarning valueWarning-" + theme + "'>Batteriestand niedrig</span>";
		}
		if (error == "STICKY_UNREACH"){
			return "<span class='valueInfo valueInfo-" + theme + "'>Kommunikation war gest&ouml;rt</span>";
		}
		if (error == "UNREACH"){
			return "<span class='valueError valueError-" + theme + "'>Kommunikation zur Zeit gest&ouml;rt</span>";
		}
	}else if (errType == "HSSDP"){
		if (error == "LOWBAT"){
			txt = "Batterie leer";
		}else if (error == "ERROR"){
			if (deviceHssType == "CLIMATECONTROL_VENT_DRIVE"){
				if (errValue == 1){
					txt = "Ventilantrieb schwerg&auml;ngig oder blockiert";
				}else if (errValue == 2){
					txt = "Ventilantrieb nicht montiert oder Stellbereich zu gro&szlig;";
				}else if (errValue == 3){
					txt = "Stellbereich zu klein";
				}else if (errValue == 4){
					txt = "St&iuml;rungsposition angefahren, Batterien nahezu entladen";
				}
			}else if (deviceHssType == "DIMMER" || deviceHssType == "VIRTUAL_DIMMER"){
				if (errValue >= 1){
					txt = "Lastfehler";
				}
			}else if (deviceHssType == "KEYMATIC"){
				if (errValue == 1){
					txt = "Einkuppeln fehlgeschlagen";
				}else if (errValue == 2){
					txt = "Motorlauf abgebrochen";
				}
			}else if (deviceHssType == "WINMATIC"){
				if (errValue == 1){
					txt = "Fehler Drehantrieb";
				}else if (errValue == 2){
					txt = "Fehler Kippantrieb";
				}
			}else if (deviceHssType == "ROTARY_HANDLE_SENSOR" || deviceHssType == "SHUTTER_CONTACT" || deviceHssType == "MOTION_DETECTOR"){
				if (errValue >= 1){
					txt = "Sabotage ausgel&ouml;st";
				}
			}
		}else if (error == "STATE"){
			if (deviceHssType == "SMOKE_DETECTOR_TEAM"){
				if (errValue == "true"){
					txt = "Rauch erkannt";
				}
			}else if (deviceHssType == "SENSOR_FOR_CARBON_DIOXIDE"){
				if (errValue == 1){
					txt = "CO<sub>2</sub> Konzentration erh&ouml;ht";
				}
				if (errValue >= 2){
					txt = "CO<sub>2</sub> Konzentration stark erh&ouml;ht";
				}
			}else if (deviceHssType == "WATERDETECTIONSENSOR"){
				if (errValue == 1){
					txt = "Feucht";
				}
				if (errValue == 2){
					txt = "Nass";
				}
			}
		}else if (error == "ERROR_REDUCED"){
			if (errValue){
				txt = "Reduzierte Leistung";
			}else{
				noError = true;
			}
		}else if (error == "ERROR_OVERLOAD"){
			if (errValue){
				txt = "Strom-&Uuml;berlastung";
			}else{
				noError = true;
			}
		}else if (error == "ERROR_OVERHEAT"){
			if (errValue){
				txt = "&Uuml;berhitzung";
			}else{
				noError = true;
			}
       
		}else if (error == "ERROR_POWER"){    
			if (!errValue){
				txt = "Netzspannung fehlerhaft";
			}else{
				noError = true;
			}
		}else if (error == "ERROR_SABOTAGE"){
			if (!errValue){
				txt = "Sabotage ausgel&ouml;st";
			}else{
				noError = true;
			}
		}else if (error == "ERROR_BATTERY"){
			if (!errValue){
				txt = "Batterie fehlerhaft";
			}else{
				noError = true;
			}
		}

		if (txt != ""){
			txt = "<span class='valueError valueError-" + theme + "'>" + txt + "</span>";
		}      
	}
  
	// Konnte kein Text ermittelt werden, dann "Unbekannter Fehler" anzeigen:
	if (txt == "" && !noError){
		txt = "<span class='valueError valueError-" + theme + "'>Unbekannter Fehler: " + errValue + "</span>";
	}
	return txt;
}

function ScrollToContentHeader(){
	$('html, body').animate({scrollTop: $('#prim').offset().top - 60}, 200);
}

function ScrollToPosition(pos){
	$('html, body').animate({scrollTop: pos}, 200);
}

// ----------------------- Data loading functions ----------------------------

function loadData(url, oldScrollPos){
	if (oldScrollPos == -1){
		ScrollToContentHeader();
	}

	// Listen leeren:
	$("#dataList").empty();
	$("#dataListHeader").empty();
	// "Lade..." anzeigen:
	$("#dataListHeader").append("<li><img src='img/misc/wait16.gif' width=12px height=12px class='ui-li-icon ui-img-" + theme + "'>Lade...</li>");
	$("#dataListHeader").listview().listview("refresh");
	// Icon Animation in Refresh Button:
	$('#buttonRefresh .ui-btn-text').html("<img src='img/misc/wait16.gif' class='ui-img-" + theme + "' width=12px height=12px>");

	$.getJSON(url, function(data) {
		systemDate = data['date'];

		$.each(data.entries, function(i, device) {
			if(device['visible'] != "false"){
				deviceHTML = "<li class='dataListItem' id='" + device['id'] + "'><h2 class='ui-li-heading'>" + unescape(device['name']) + "</h2>";
				addDiagram = false;
				diagramData = "";
				diagramID = "";
				diagramUnit = "";
				varOptions = {};
				varOptionsFirst = "";
				if (device['type'] == "CHANNEL"){
					deviceHssType = device['hssType'];
					hasChannel = false;
					$.each(device.channels, function(j, channel){
						hasChannel = true;
						type = channel['type'];

						if (type == "HSSDP"){
							channelID = channel['id'];
							hssType = channel['hssType'];
							channelDate = channel['date'];
							vorDate = GetTimeDiffString(channelDate, systemDate);
							valString = channel['value'];
							valFloat = parseFloat(channel['value']);
							valBool = (valString == "true");
							valUnit = channel['valueUnit'];
							if (typeof(valUnit) == "undefined"){
								valUnit = "";
							}else if (valUnit == "100%"){
								valUnit = "%";  // Manche Geräte haben als Einheit 100%. Würde zu seltsamen Darstellungen führen.
							}
							if (hssType == "STATE")
							{
								canBeSet = false;
								stateText = "valFloat: " + valFloat + ", valString: " + valString;
								if (deviceHssType == "SHUTTER_CONTACT"){
									if (valString == "true"){
										stateText = "<span class='valueError valueError-" + theme + "'>Offen</span>";
									}else{
										stateText = "<span class='valueOK valueOK-" + theme + "'>Geschlossen</span>";
									}
								}else if (deviceHssType == "SMOKE_DETECTOR_TEAM"){
									if (valString == "true"){
										stateText = "<span class='valueError valueError-" + theme + "'>Rauch erkannt</span>";
									}else{
										stateText = "<span class='valueOK valueOK-" + theme + "'>Kein Rauch erkannt</span>";
									}
								}else if (deviceHssType == "SENSOR_FOR_CARBON_DIOXIDE"){
									if (valFloat == 0){
										stateText = "<span class='valueOK valueOK-" + theme + "'>CO<sub>2</sub> Konzentration normal</span>";
									}
									if (valFloat == 1){
										stateText = "<span class='valueWarning valueWarning-" + theme + "'>CO<sub>2</sub> Konzentration erh&ouml;ht</span>";
									}
									if (valFloat >= 2){
										stateText = "<span class='valueError valueError-" + theme + "'>CO<sub>2</sub> Konzentration stark erh&ouml;ht</span>";
									}
								}else if (deviceHssType == "TILT_SENSOR"){
									if (valString == "true"){
										stateText = "<span class='valueWarning valueWarning-" + theme + "'>Offen</span>";
									}else{
										stateText = "<span class='valueOK valueOK-" + theme + "'>Geschlossen</span>";
									}
								}else if (deviceHssType == "WATERDETECTIONSENSOR"){
									if (valFloat == 0){
										stateText = "<span class='valueOK valueOK-" + theme + "'>Trocken</span>";
									}
									if (valFloat == 1){
										stateText = "<span class='valueWarning valueWarning-" + theme + "'>Feucht</span>";
									}
									if (valFloat == 2){
										stateText = "<span class='valueError valueError-" + theme + "'>Nass</span>";
									}
								}else if (deviceHssType == "ROTARY_HANDLE_SENSOR"){
									if (valFloat == 0){
										stateText = "<span class='valueOK valueOK-" + theme + "'>Geschlossen</span>";
									}
									if (valFloat == 1){
										stateText = "<span class='valueWarning valueWarning-" + theme + "'>Gekippt</span>";
									}
									if (valFloat == 2){
										stateText = "<span class='valueError valueError-" + theme + "'>Offen</span>";
									}
								}else if (deviceHssType == "KEYMATIC"){
									canBeSet = true;
									txtOn = "Auf";
									txtOff = "Zu";
								}else if (deviceHssType == "SWITCH"){				  
									canBeSet = true;
									txtOn = "Ein";
									txtOff = "Aus";
								}else if (deviceHssType == "ALARMACTUATOR"){
									canBeSet = true;
									txtOn = "Ein";
									txtOff = "Aus";
								}else if (deviceHssType == "DIGITAL_OUTPUT"){
									canBeSet = true;
									txtOn = "Ein";
									txtOff = "Aus";
								}else if (deviceHssType == "DIGITAL_ANALOG_OUTPUT"){
									canBeSet = true;
									txtOn = "Ein";
									txtOff = "Aus";
								}else if (deviceHssType == "DIGITAL_INPUT"){
									if (valFloat == "true"){
										stateText = "Ein";
									}else{
										stateText = "Aus";
									}
								}else{
									if (valFloat == "true"){
										stateText = "Aus";
									}else{
										stateText = "Ein";
									}
								}

								if (canBeSet){
									deviceHTML += AddSetBoolButtonList(channel['id'], valString, txtOff, txtOn, "", vorDate, true);									
								}else{
									deviceHTML += "<p class='ui-li-desc'><img class='ui-img-" + theme + "' src='img/channels/unknown.png' style='max-height:20px'><span class='valueInfo valueInfo-" + theme + "'>" + stateText + " </span><span><i>" + vorDate + "</i></span></p>";
								}
							}else if (hssType == "VALUE"){
								deviceHTML += "<p class='ui-li-desc'><img class='ui-img-" + theme + "' src='img/channels/unknown.png' style='max-height:20px'><span class='valueInfo valueInfo-" + theme + "'>" + valString + " " + valUnit + " </span> <span><i>" + vorDate + "</i></span></p>";
							}else if (hssType == "SENSOR" && deviceHssType == "SENSOR"){
								if (valString == "true"){
									stateText = "<span class='valueError valueError-" + theme + "'>Offen</span>";
								}else{
									stateText = "<span class='valueOK valueOK-" + theme + "'>Geschlossen</span>";
								}
								deviceHTML += "<p class='ui-li-desc'><img class='ui-img-" + theme + "' src='img/channels/unknown.png' style='max-height:20px'><span class='valueInfo valueInfo-" + theme + "'>" + stateText + " </span><span><i>" + vorDate + "</i></span></p>";
							}else if (hssType == "PRESS_SHORT"){
								deviceHTML += AddSetButton(channel['id'], "Kurzer Tastendruck", true, vorDate, false, false, true);
							}else if (hssType == "PRESS_LONG"){
								deviceHTML += AddSetButton(channel['id'], "Langer Tastendruck", true, vorDate, false, false, true);
							}else if (hssType == "SETPOINT"){
								deviceHTML += AddSetNumber(channelID, valFloat, valUnit, 6, 30, 0.5, 1.0, vorDate, false);
								lowTemp = valFloat - 3.0;
								highTemp = lowTemp + 6.0;
								if (lowTemp < 6.0){
									lowTemp = 6.0;
									highTemp = 11.0;
								}
								if (highTemp > 30.0){
									lowTemp = 25.0;
									highTemp = 30.0;
								}
								deviceHTML += "<div data-role='controlgroup' data-type='horizontal'>";
								for (i = lowTemp; i <= highTemp; i += 1.0){
									deviceHTML += AddSetButton(channelID, i + valUnit, i, vorDate, true, i == valFloat, false);
								}
								deviceHTML += "</div>";
							}else if (hssType == "RAINING"){
								if (valString == "true"){
									s = "Regen";
								}else{
									s = "Kein Regen";
								}
								deviceHTML += "<p class='ui-li-desc'><img class='ui-img-" + theme + "' src='img/channels/unknown.png' style='max-height:20px'><span class='valueInfo valueInfo-" + theme + "'>" + s + "</span> | <span><i>" + vorDate + "</i></span></p>";
							}else if (hssType == "MOTION"){
								if (valString == "true"){
									txt = "<span class='valueWarning valueWarning-" + theme + "'>Bewegung </span>";
								}else{
									txt = "<span class='valueOK valueOK-" + theme + "'>Keine Bewegung </span>";
								}
								deviceHTML += "<p class='ui-li-desc'><img class='ui-img-" + theme + "' src='img/channels/unknown.png' style='max-height:20px'>" + txt + "<span><i>" + vorDate + "</i></span></p>";
							}else if (hssType == "LEVEL" && deviceHssType == "BLIND"){
								deviceHTML += AddSetNumber(channelID, valFloat, valUnit, 0.0, 1.0, 0.01, 100.0, vorDate + " | 0% = Geschlossen, 100% = Offen", false);
								deviceHTML += "<div data-role='controlgroup' data-type='horizontal'>";
								deviceHTML += AddSetButton(channelID, "Zu", 0.0, vorDate, true, valFloat == 0.0, false);
								deviceHTML += AddSetButton(channelID, "20%", 0.2, vorDate, true, valFloat == 0.2, false);
								deviceHTML += AddSetButton(channelID, "40%", 0.4, vorDate, true, valFloat == 0.4, false);
								deviceHTML += AddSetButton(channelID, "60%", 0.6, vorDate, true, valFloat == 0.6, false);
								deviceHTML += AddSetButton(channelID, "80%", 0.8, vorDate, true, valFloat == 0.8, false);
								deviceHTML += AddSetButton(channelID, "Auf", 1.0, vorDate, true, valFloat == 1.0, false);
								deviceHTML += "</div>";
							}else if (hssType == "STOP" && deviceHssType == "BLIND"){
								deviceHTML += AddSetButton(channelID, "Stop", true, vorDate, false, false, false);
							}else if (hssType == "OPEN" && deviceHssType == "KEYMATIC"){
								deviceHTML += AddSetButton(channelID, "&Ouml;ffnen", true, vorDate, false, false, true);
							}else if (hssType == "LEVEL" && deviceHssType == "WINMATIC"){
								deviceHTML += AddSetNumber(channelID, valFloat, valUnit, -0.005, 1.0, 0.01, 100.0, vorDate + " | -0.5 = Verriegelt, 0% = Geschlossen, 100% = Offen", false);
								deviceHTML += "<div data-role='controlgroup' data-type='horizontal'>";
								deviceHTML += AddSetButton(channelID, "Verriegeln", -0.005, vorDate, true, valFloat == -0.005, false);
								deviceHTML += AddSetButton(channelID, "Zu", 0.0, vorDate, true, valFloat == 0.0, false);
								deviceHTML += AddSetButton(channelID, "20%", 0.2, vorDate, true, valFloat == 0.2, false);
								deviceHTML += AddSetButton(channelID, "40%", 0.4, vorDate, true, valFloat == 0.4, false);
								deviceHTML += AddSetButton(channelID, "60%", 0.6, vorDate, true, valFloat == 0.6, false);
								deviceHTML += AddSetButton(channelID, "80%", 0.8, vorDate, true, valFloat == 0.8, false);
								deviceHTML += AddSetButton(channelID, "Auf", 1.0, vorDate, true, valFloat == 1.0, false);
								deviceHTML += "</div>";
							}else if (hssType == "STOP" && deviceHssType == "WINMATIC"){
								deviceHTML += AddSetButton(channelID, "Stop", true, vorDate, false, false, false);
							}else if (hssType == "LEVEL" && deviceHssType == "AKKU"){
								deviceHTML += "<p class='ui-li-desc'><img class='ui-img-" + theme + "' src='img/channels/unknown.png' style='max-height:20px'><span class='valueInfo valueInfo-" + theme + "'>" + valFloat * 100.0 + " " + valUnit + " </span>Batterieladung | <span><i>" + vorDate + "</i></span></p>";
							}else if (hssType == "LEVEL" && (deviceHssType == "DIMMER" || deviceHssType == "VIRTUAL_DIMMER")){
								deviceHTML += AddSetNumber(channelID, valFloat, valUnit, 0.0, 1.0, 0.01, 100.0, vorDate + " | 0% = Aus, 100% = An", false);
								deviceHTML += "<div data-role='controlgroup' data-type='horizontal'>";
								deviceHTML += AddSetButton(channelID, "Aus", 0.0, vorDate, true, valFloat == 0.0, false);
								deviceHTML += AddSetButton(channelID, "20%", 0.2, vorDate, true, valFloat == 0.2, false);
								deviceHTML += AddSetButton(channelID, "40%", 0.4, vorDate, true, valFloat == 0.4, false);
								deviceHTML += AddSetButton(channelID, "60%", 0.6, vorDate, true, valFloat == 0.6, false);
								deviceHTML += AddSetButton(channelID, "80%", 0.8, vorDate, true, valFloat == 0.8, false);
								deviceHTML += AddSetButton(channelID, "An", 1.0, vorDate, true, valFloat == 1.0, false);
								deviceHTML += "</div>";
							}else if(hssType == "U_SOURCE_FAIL" && deviceHssType == "POWER"){
								if (valString == "false"){
									txt = "<span class='valueNoError valueNoError-" + theme + "'>Netzbetrieb</span>";
								}else{
									txt = "<span class='valueError valueError-" + theme + "'>Batteriebetrieb</span>";
								}
								deviceHTML += "<p class='ui-li-desc'><img class='ui-img-" + theme + "' src='img/channels/unknown.png' style='max-height:20px'>" + txt + " <span><i>" + vorDate + "</i></span></p>";
							}else if(hssType == "LOWBAT" && deviceHssType == "POWER"){
								if (valString == "false"){
									txt = "<span class='valueOK valueOK-" + theme + "'>Batterie OK</span>";
								}else{
									txt = "<span class='valueError valueError-" + theme + "'>Batterie leer</span>";
								}
								deviceHTML += "<p class='ui-li-desc'><img class='ui-img-" + theme + "' src='img/channels/unknown.png' style='max-height:20px'>" + txt + " <span><i>" + vorDate + "</i></span></p>";
							}else if(hssType == "U_USBD_OK" && deviceHssType == "POWER"){
								if (valString == "false"){
									txt = "<span class='valueNoError valueNoError-" + theme + "'>USB nicht aktiv</span>";
								}else{
									txt = "<span class='valueOK valueOK-" + theme + "'>USB aktiv</span>";
								}
								deviceHTML += "<p class='ui-li-desc'><img class='ui-img-" + theme + "' src='img/channels/unknown.png' style='max-height:20px'>" + txt + " <span><i>" + vorDate + "</i></span></p>";
							}else if(hssType == "BAT_LEVEL" && deviceHssType == "POWER"){
								deviceHTML += "<p class='ui-li-desc'><img class='ui-img-" + theme + "' src='img/channels/unknown.png' style='max-height:20px'><span class='valueInfo valueInfo-" + theme + "'>" + valFloat * 100.0 + " " + valUnit + " </span>Batterieladung | <span><i>" + vorDate + "</i></span></p>";
							}else if (hssType == "STATUS" && deviceHssType == "AKKU"){
								if (valFloat == 0){
									txt = "<span class='valueNoError valueNoError-" + theme + "'>Erhaltungsladung</span>";
								}else if (valFloat == 1){
									txt = "<span class='valueNoError valueNoError-" + theme + "'>Akku l&auml;dt</span>";
								}else if (valFloat == 2){
									txt = "<span class='valueNoError valueNoError-" + theme + "'>Versorgung durch Akku</span>";
								}else{
									txt = "<span class='valueWarning valueWarning-" + theme + "'>Status unbekannt</span>";
								}
								deviceHTML += "<p class='ui-li-desc'><img class='ui-img-" + theme + "' src='img/channels/unknown.png' style='max-height:20px'>" + txt + " <span><i>" + vorDate + "</i></span></p>";
							}else if (hssType == "STATE_UNCERTAIN"){
								if (valString == "true"){
									txt = "<span class='valueWarning valueWarning-" + theme + "'>Zustand unbestimmt</span>";
								}else{
									txt = "<span class='valueNoError valueNoError-" + theme + "'>Zustand OK</span>";
								}
								deviceHTML += "<p class='ui-li-desc'><img class='ui-img-" + theme + "' src='img/channels/unknown.png' style='max-height:30px'>" + txt + " <span><i>" + vorDate + "</i></span></p>";
							}else if (hssType == "LED_STATUS"){
								switch (valFloat){
									case 0: // Off
										deviceHTML += "<p><img class='ui-img-" + theme + "' src='img/channels/off_lamp.png' style='max-height:40px'> Status | <span><i>" + vorDate + "</i></span></p>";
										break;
									case 1: // Red
										deviceHTML += "<p><img class='ui-img-" + theme + "' src='img/channels/red_lamp.png' style='max-height:40px'> Status | <span><i>" + vorDate + "</i></span></p>";
										break;
									case 2: // Green
										deviceHTML += "<p><img class='ui-img-" + theme + "' src='img/channels/green_lamp.png' style='max-height:40px'> Status | <span><i>" + vorDate + "</i></span></p>";
										break;
									case 3: // Orange
										deviceHTML += "<p><img class='ui-img-" + theme + "' src='img/channels/orange_lamp.png' style='max-height:40px'> Status | <span><i>" + vorDate + "</i></span></p>";
										break;
								}
							}else if (hssType == "ERROR" || hssType.substring(0, 6) == "ERROR_"){
								if ((hssType == "ERROR" && valFloat > 0) || hssType.substring(0, 6) == "ERROR_"){
									if (hssType == "ERROR"){
										v = valFloat;
									}else{
										v = valBool;
									}
									txt = GetErrorMessage("HSSDP", hssType, v, deviceHssType);
									if (txt != ""){
										deviceHTML += "<p class='ui-li-desc'><img class='ui-img-" + theme + "' src='img/channels/unknown.png' style='max-height:20px'>" + txt + " <span><i>" + vorDate + "</i></span></p>";
									}
								}
							}else if (hssType == "ON_TIME" || hssType == "INHIBIT" || hssType == "ADJUSTING_COMMAND" || hssType == "ADJUSTING_DATA" || hssType == "RELOCK_DELAY" || hssType == "SPEED" || hssType == "LEVEL" || hssType == "RAMP_STOP" || hssType == "RAMP_TIME" || hssType == "OLD_LEVEL"){
								// Don't show.
							}else{
								// Mapping auf lesbaren Text holen:
								name = MapText(hssType);

								// Prüfen ob Zahl, wenn ja, dann die Zahl nehmen, da es automatisch Nullen hinten abschneidet:
								v = valString;
								if (!isNaN(valString)){
									v = valFloat;
								}

								// Wenn dieser "-" ist, dann den Datenpunkt gar nicht anzeigen:
								if (name != "-"){
									deviceHTML += "<p class='ui-li-desc'><img class='ui-img-" + theme + "' src='img/channels/" + MapImage(hssType) + "' style='max-height:20px'><span class='valueInfo valueInfo-" + theme + "'>" + v + " " + valUnit + " </span>" + name + " | <span><i>" + vorDate + "</i></span></p>";
								}
							}
						}else if (type == "VARDP"){
							valName  = unescape(channel['name']);
							valID    = channel['id'];
							valInfo  = unescape(channel['info']);
							strValue = unescape(channel['value']);
							valType  = channel['valueType'];
							valUnit  = channel['valueUnit'];
							val0     = channel['valueName0'];
							val1     = channel['valueName1'];
							valMin   = channel['valueMin'];
							valMax   = channel['valueMax'];
							valList  = channel['valueList'];
							channelDate = channel['date'];
							vorDate = GetTimeDiffString(channelDate, systemDate);

							// Wenn die Variable hinten (r) hat, dann ist sie Read-Only in den Favoriten,
							// bei (d) / (dk) ist es ein Diagramm in den Favoriten,
							// bei (g) eine Tankuhr,
							// bei (nv) soll der Wert ausgeblendet werden (Sollwertscript). Nur bei Variablen in Geräten verknüpft.
							// ( finden:
							varOptionsFirst = "";
							varOptions = [];
							bracketOpen = valInfo.indexOf("(");
							if (bracketOpen != -1){
								// ) finden:
								bracketClose = valInfo.indexOf(")", bracketOpen);
								if (bracketClose != -1){
									optionsString = valInfo.substring(bracketOpen + 1, bracketClose);
									varOptions = optionsString.split(",");

									if (varOptions.length >= 1){
										varOptionsFirst = varOptions[0].toLowerCase();
									}
								}
							}

							if (varOptionsFirst != "nv"){
								// <br> davor, weil es an der Stelle eine mit Gerät verknüpfte Variable ist:
								deviceHTML += "<br><h2 class='ui-li-heading'>" + unescape(channel['name']) + "</h2>";
								deviceHTML += "<p>" + valInfo + "</p>";
								if (isReadOnly()){
									deviceHTML += AddReadonlyVariable(valID, strValue, vorDate, valType, valUnit, valList);
								}else if (varOptionsFirst == "d" || varOptionsFirst == "dk" || varOptionsFirst == "g" || varOptionsFirst == "h" ){
									// Goglo
									addDiagram = true;
									if (varOptionsFirst == "dk"){
										diagramData = channel['diagrams'];
									}else{
										diagramData = strValue;
									}
									diagramID = "chart_" + valID;
									diagramUnit = valUnit;
									if (varOptionsFirst == "g"){
										deviceHTML += "<div id='" + diagramID + "' style='height:200px; width:300px;'></div>" + " <i class='ui-li-desc'>" + vorDate + "</i>";
									}else{
										deviceHTML += "<div id='" + diagramID + "' style='height:300px; width:90%;'></div>" + " <i class='ui-li-desc'>" + vorDate + "</i>";
									}
								}else{
									if (valType == "2"){
										// Bool.
										deviceHTML += AddSetBoolButtonList(valID, strValue, val0, val1, valUnit, vorDate, true);
									}else if (valType == "4"){
										// Float, Integer.
										deviceHTML += AddSetNumber(valID, strValue, valUnit, valMin, valMax, 0.001, 1.0, vorDate, true);
									}else if (valType == "16"){
										// Liste.
										deviceHTML += AddSetValueList(valID, strValue, valList, valUnit, vorDate, true);
									}else if (valType == "20" && valUnit == "html"){
										deviceHTML += AddHTML(valID, strValue, vorDate, false);
									}else if (valType == "20"){
										deviceHTML += AddSetText(valID, strValue, valUnit, vorDate);
									}else{
										deviceHTML += "Unbekannter Variablentyp!";
									}
								}
							}
						}
					});
					
					if (!hasChannel){
						deviceHTML = "";  // Nicht anzeigen, z.B. Raumthermostat:3, wenn kein Fensterkontakt vorhanden.
					}
					
				}else if (device['type'] == "VARDP"){
					valName  = unescape(device['name']);
					valID    = device['id'];
					valInfo  = unescape(device['info']);
					strValue = unescape(device['value']);
					valType  = device['valueType'];
					valUnit  = device['valueUnit'];
					val0     = device['valueName0'];
					val1     = device['valueName1'];
					valMin   = device['valueMin'];
					valMax   = device['valueMax'];
					valList  = device['valueList'];
					channelDate = device['date'];
					vorDate = GetTimeDiffString(channelDate, systemDate);
					// Wenn die Variable hinten (r) hat, dann ist sie Read-Only in den Favoriten:
					varOptionsFirst = "";
					varOptions = [];
					// ( finden:
					bracketOpen= valInfo.indexOf("(");
					if (bracketOpen != -1){
						// ) finden:
						bracketClose = valInfo.indexOf(")", bracketOpen);
						if (bracketClose != -1){
							optionsString = valInfo.substring(bracketOpen + 1, bracketClose);
							varOptions = optionsString.split(",");

							if (varOptions.length >= 1){
								varOptionsFirst = varOptions[0].toLowerCase();
							}
						}
					}

					deviceHTML += "<p>" + valInfo + "</p>";
					if (isReadOnly()){
						deviceHTML += AddReadonlyVariable(valID, strValue, vorDate, valType, valUnit, valList);
					}else if (varOptionsFirst == "d" || varOptionsFirst == "dk" || varOptionsFirst == "g" || varOptionsFirst == "h" ){
						// Goglo
						addDiagram = true;
						if (varOptionsFirst == "dk"){
							diagramData = channel['diagrams'];
						}else{
							diagramData = strValue;
						}
						diagramID = "chart_" + valID;
						diagramUnit = valUnit;
						if (varOptionsFirst == "g"){
							deviceHTML += "<div id='" + diagramID + "' style='height:200px; width:300px;'></div>" + " <i class='ui-li-desc'>" + vorDate + "</i>";
						}else{
							deviceHTML += "<div id='" + diagramID + "' style='height:300px; width:90%;'></div>" + " <i class='ui-li-desc'>" + vorDate + "</i>";
						}
					}else if (varOptionsFirst == "nv"){
						deviceHTML = "";  // Leeren.
					}else{
						if (valType == "2"){
							// Bool.
							deviceHTML += AddSetBoolButtonList(valID, strValue, val0, val1, valUnit, vorDate, true);
						}else if (valType == "4"){
							// Float, Integer.
							deviceHTML += AddSetNumber(valID, strValue, valUnit, valMin, valMax, 0.001, 1.0, vorDate, true);
						}else if (valType == "16"){
							// Liste.
							deviceHTML += AddSetValueList(valID, strValue, valList, valUnit, vorDate, true);
						}else if (valType == "20" && valUnit == "html"){
							deviceHTML += AddHTML(valID, strValue, vorDate, false);
						}else if (valType == "20"){
							deviceHTML += AddSetText(valID, strValue, valUnit, vorDate);
						}else{
							deviceHTML += "Unbekannter Variablentyp!";
						}
					}
				}else if (device['type'] == "PROGRAM"){
					prgID = device['id'];
					prgName = device['name'];
					prgInfo = device['info'];
					prgDate = device['date'];
					vorDate = GetTimeDiffString(prgDate, systemDate);

					deviceHTML += "<p>" + prgInfo + "</p>";
					deviceHTML += AddStartProgramButton(prgID, "Ausf&uuml;hren", vorDate);
				}
				
				if (deviceHTML != ""){ 
					// Ist leer, wenn (nv) oder ein leerer Channel.
					deviceHTML += "</li>";
					$("#dataList").append(deviceHTML);
				}

				if (addDiagram){
					$("#dataList").listview().listview("refresh");
					// Diagrammoptionen Defaults setzen:
					dType  = "l"; // Typ = Line.
					dColor = "69A5CF"; // Farbe.
					dLow   = ""; // Kleinster Werte 10% unter Minimum.
					dHigh  = ""; // Größter Wert 10% über Maximum.
					dKomma = 1; // Eine Nachkommastellen.
					dStart = "0/#008800"; // Startwert für Gauge.
					dEnd = "30/#AA4400";  // Endwert für Gauge.
					
					// Diagrammoptionen prüfen:
					for (i = 0; i < varOptions.length; i++){
						dA = varOptions[i].split("=");
						if (dA.length == 2){
							if (dA[0] == "t"){
								dType = dA[1];
							}else if (dA[0] == "c"){
								dColor = dA[1];
							}else if (dA[0] == "l"){
								dLow = dA[1];
							}else if (dA[0] == "h"){
								dHigh = dA[1];
							}else if (dA[0] == "k"){
								dKomma = parseInt(dA[1]);
							}else if (dA[0] == "s"){
								dStart = dA[1];
							}else if (dA[0] == "e"){
								dEnd = dA[1];
							}
						}
					}

					if (varOptionsFirst == "g"){
						// Gauge
						// In Number Array verwandeln:
						gaugeVal = parseFloat(diagramData);

						// Start ermitteln:
						startArr = dStart.split("/");
						gaugeMin = parseFloat(startArr[0]);
						gaugeMinCol = startArr[1];
						if (gaugeVal < gaugeMin){
							gaugeMin = gaugeVal;
						}
				
						// Ende ermitteln:
						endArr = dEnd.split("/");
						gaugeMax = parseFloat(endArr[0]);
						gaugeMaxCol = endArr[1];
						if (gaugeVal > gaugeMax){
							gaugeMax = gaugeVal;
						}
						
						// Farben teilen:
						rStart = parseInt(gaugeMinCol.substring(1,3) ,16);
						gStart = parseInt(gaugeMinCol.substring(3,5) ,16);
						bStart = parseInt(gaugeMinCol.substring(5,7) ,16);
						rEnd = parseInt(gaugeMaxCol.substring(1,3) ,16);
						gEnd = parseInt(gaugeMaxCol.substring(3,5) ,16);
						bEnd = parseInt(gaugeMaxCol.substring(5,7) ,16);

						// Farbinterpolation:
						gValArr = [];
						gColArr = [];
						resolution = 10;
						for (i = 1; i <= resolution; i++){
							// Interpoliert von 1/4 bis 1:
							f = i / resolution;
							v = gaugeMin + f * (gaugeMax - gaugeMin);
							gValArr.push(v);

							// Interpoliert von 0/resolution bis 1:
							f = (i - 1) / (resolution - 1);
							cr = Math.floor(rStart + f * (rEnd - rStart)).toString(16);
							if (cr.length < 2){
								cr = "0" + cr;
							}
							cg = Math.floor(gStart + f * (gEnd - gStart)).toString(16);
							if (cg.length < 2){
								cg = "0" + cg;
							}
							cb = Math.floor(bStart + f * (bEnd - bStart)).toString(16);
							if (cb.length < 2){
								cb = "0" + cb;
							}
							c = "#" + cr + cg + cb;
							gColArr.push(c);
						}

						// Gauge erstellen:
						gData = [diagramData];
						plotGauge = $.jqplot(diagramID, [gData],{
							seriesDefaults: {
								renderer: $.jqplot.MeterGaugeRenderer,
								rendererOptions: {
									label: diagramData + " " + diagramUnit,
									labelPosition: 'bottom',
									labelHeightAdjust: -5,
									min: gaugeMin,
									max: gaugeMax,
									intervals: gValArr,
									intervalColors: gColArr
								}
							},
							grid: {
								backgroundColor: "transparent"
							}
						});
					}else if(varOptionsFirst == "h"){
						//------------------------------------ begin Goglo
						//wir erwarten die Werte in der Form n;t1;t2;t3...
						// mit t in der Form date,v1,v2,v3...
						srcDiagArr = diagramData.split(";");
						// Erstes Element muss weg, dann ist immer alle numValues wieder ein Datum
						al = srcDiagArr[0];
						if (al > 0){
							// Felder: Datum, Soll-Temp, Ist-Temp, Luftfeucht, Stell1, Stell2
							diagArr = new Array();  // Neues, n-dimensionales Array.
							diagArr[0] = new Array();
							diagArr[1] = new Array();
							diagArr[2] = new Array();
							diagArr[3] = new Array();
							diagArr[4] = new Array();
							j = 0;
							if ( dLow == ""){
								lowVal = 15.0;
							}else{
								lowVal = parseFloat(dLow);
							}
							if(dHigh == ""){
								highVal = 23.0;
							}else{
								highVal = parseFloat(dHigh);
							}
							lowDate = "";
							highDate = "";
							// Werte in Array aus 2-dim Arrays umwandeln:
							// i 0..al ist index von scrDiagArr, also ueber alle Tupel
							// j  0.. ist index von diagArr, also alle Werte innerhalb des Tupels

							for (i = 1; i <= al; i++)
							{
								t = srcDiagArr[i]; 
								tArr = t.split(",");
								v1 = tArr[0];
								if (lowDate == "" || v1 < lowDate){
									lowDate = v1;
								}
								if (highDate == "" || v1 > highDate){
									highDate = v1;
								}
								
								for (j = 1; j < tArr.length; j++)
								{
									vArr = new Array();
									vArr[0] = v1;
									v2 = tArr[j];
									vArr[1] = v2;
									diagArr[j-1][i-1] = vArr;
								}
							}
						}
						////////////////////////////
						//var plotDiagram = $.jqplot(diagramID, [diagArr0, diagArr1], {
						var plotDiagram = $.jqplot(diagramID, [diagArr[0], diagArr[1], diagArr[2], diagArr[3], diagArr[4]], {
							axes:{
								xaxis:{
									renderer:$.jqplot.DateAxisRenderer,
									tickRenderer: $.jqplot.CanvasAxisTickRenderer,
									tickOptions:{formatString:'%a, %#d %#H:%M', angle:20},
									min:lowDate,
									max:highDate
								},
								yaxis:{
									min: lowVal,
									max: highVal,
									showLabel: true,
									tickOptions:{
										formatString: '%.' + dKomma + 'f' + '&deg;C'
									}
								},
								y2axis:{
									min: 0.0,
									max: 100.0,
									showLabel: true,
									tickOptions:{
										formatString: '%d' + "%"
									}
								}
							},
							legend: {
								show: false,
								fontSize: 23,
								placement: 'outside',
								location: 'e'
							},
							seriesDefaults: {
								lineWidth:2,
								showMarker:false,
								fill: false,
								shadow: false,
								//rendererOptions: {
								//    smooth: true
								//}
							},
							series:[{
									label: "Soll",
									color: "#555555", //+ dColor,
									fill: true,
									fillAlpha: 0.1,
								},{
									label: "Ist",
									color: "#DD0000",// Farbe Ist-Temperatur
								},{
									label: "relF%",
									color: "#0174DF",// Farbe rel. Luftfeuchtigkeit
									yaxis:'y2axis',
									lineWidth: 1,
								},{
									label: "Ventil",
									color: "#777777",// Farbe Ventil 1
									yaxis:'y2axis',
									lineWidth: 1,
								},{
									label: "Ventil",
									color: "#777777",// Farbe Ventil 2
									yaxis:'y2axis',
							}],
							highlighter: {
								show: true,
								sizeAdjust: 5.5
							},
							cursor: {
								zoom: true,
								show: true
							},
							grid: {
								backgroundColor: "#F4F4F4"
							}
						});	
						//------------------------------------ end Goglo
					}else if (dType == "l" || dType == "f"){
						srcDiagArr = diagramData.split(",");
						// Erstes Element muss weg, dann immer zwei, also min = 3:
						al = srcDiagArr.length;
						if (al >= 3){
							diagArr = new Array();  // Neues, zweidimensionales Array.
							j = 0;
							lowVal = 1e6;
							highVal = -1e6;
							lowDate = "";
							highDate = "";
							// Werte in Array aus 2-dim Arrays umwandeln:
							for (i = 1; i < al; i = i + 2)
							{
								v1 = srcDiagArr[i];
								v2 = srcDiagArr[i + 1];
								smallArr = new Array();
								smallArr[0] = v1;
								if (v2 == "true"){
									v = 1;
								}else if (v2 == "false"){
									v = 0;
								}else{
									v = parseFloat(v2);
								}
								smallArr[1] = v

								if (v < lowVal){
									lowVal = v;
								}
								if (v > highVal){
									highVal = v;
								}
								
								if (lowDate == "" || v1 < lowDate){
									lowDate = v1;
								}
								if (highDate == "" || v1 > highDate){
									highDate = v1;
								}
								diagArr[j] = smallArr;
								j++;
							}

							// Low Values anpassen:
							if (dLow == "")
							  lowVal = lowVal - 0.1 * (highVal - lowVal);
							else if (dLow == "m")
							  ; // lowVal ist schon Minimum;
							else
							{
							  sugLowVal = parseFloat(dLow);
							  if (sugLowVal < lowVal)
								lowVal = sugLowVal;
							}
							// High Values anpassen:
							if (dHigh == "")
							  highVal = highVal + 0.1 * (highVal - lowVal);
							else if (dHigh == "m")
							  ; // highVal ist schon Maximum;
							else
							{
							  sugHighVal = parseFloat(dHigh);
							  if (sugHighVal > highVal)
								highVal = sugHighVal;
							}

							// Fill/Line:
							if (dType == "l"){
								diagFill = false;
							}else{
								diagFill = true;
							}
							
							var plotDiagram = $.jqplot(diagramID, [diagArr], {
								axes:{
									xaxis:{
										renderer:$.jqplot.DateAxisRenderer,
										tickRenderer: $.jqplot.CanvasAxisTickRenderer,
										tickOptions:{formatString:'%b %#d, %#H:%M', angle:20},
										min:lowDate,
										max:highDate
									},
									yaxis:{
										min: lowVal,
										max: highVal,
										tickOptions:{
											formatString: '%.' + dKomma + 'f' + diagramUnit
										}
									}
								},
								//legend: {
								//  show: true,
								//  placement: 'inside'
								//},
								seriesDefaults: {
									rendererOptions: {
										smooth: true
									}
								},
								series:[{
									color: "#" + dColor,
									//label: varName,
									lineWidth:2,
									showMarker:false,
									fill: diagFill
								}],
								highlighter: {
									show: true,
									sizeAdjust: 5.5
								},
								cursor: {
									show: false
								},
								grid: {
									backgroundColor: "#F4F4F4"
								}
							});
						}
					}   // if  dType...
				}		
			}
		});
		
		// "Lade..." wieder entfernen und Überschrift anzeigen:
		$("#dataListHeader").empty();
		$("#dataListHeader").append("<li data-role='list-divider' role='heading'>" + data['name'] + "<p style='float:right;'>" + systemDate + "</p></li>");
		$("#dataListHeader").listview().listview("refresh");

		// Animated Icon aus Refresh wieder entfernen:
		$('#buttonRefresh .ui-btn-text').html("&nbsp;");

		$("#dataList").listview().listview("refresh");
		$("#dataList").trigger("create");
		// Filter Update:
		$(".ui-input-search .ui-input-text").trigger("change");
		$("[id^=button]").trigger("create");
		$("[id^=input]").trigger("create");

		if (oldScrollPos == -1){
			ScrollToContentHeader();
		}else{
			ScrollToPosition(oldScrollPos);
		}
	});
}

function loadVariables(oldScrollPos){
	if (oldScrollPos == -1){
		ScrollToContentHeader();
	}

	$("#dataList").empty();
	$("#dataListHeader").empty();
	// "Lade..." anzeigen:
	$("#dataListHeader").append("<li><img src='img/misc/wait16.gif' width=12px height=12px class='ui-li-icon ui-img-" + theme + "'>Lade...</li>");
	$("#dataListHeader").listview().listview("refresh");
	// Icon Animation in Refresh Button:
	$('#buttonRefresh .ui-btn-text').html("<img class='ui-img-" + theme + "' src='img/misc/wait16.gif' width=12px height=12px>");

	$.getJSON('cgi/systemvariables.cgi', function(data) {		
		systemDate = data['date'];
		$.each(data.entries, function(i, variable) {
			valVisible = variable['visible'] == "true";
			if((readModus && valVisible) || !readModus){
				valID    = variable['id'];
				valName  = unescape(variable['name']);
				valInfo  = unescape(variable['info']);
				strValue = unescape(variable['value']);
				valType  = variable['valueType'];
				valUnit  = variable['valueUnit'];
				val0     = variable['valueName0'];
				val1     = variable['valueName1'];
				valMin   = variable['valueMin'];
				valMax   = variable['valueMax'];
				valList  = variable['valueList'];
				channelDate = variable['date'];
				vorDate = GetTimeDiffString(channelDate, systemDate);
				contentString = "<li class='dataListItem' id='" + valID + "'><h2 class='ui-li-heading'>" + valName + "</h2>";

				contentString += "<p>" + valInfo + "</p>";
				
				// In der Variablenliste editieren zulassen:
				if(isReadOnly()){
					contentString += AddReadonlyVariable(valID, strValue, vorDate, valType, valUnit, valList);
				}else if (valType == "2"){
					// Bool.
					contentString += AddSetBoolButtonList(valID, strValue, val0, val1, valUnit, vorDate, true);
				}else if (valType == "4"){
					// Float, Integer.
					contentString += AddSetNumber(valID, strValue, valUnit, valMin, valMax, 0.001, 1.0, vorDate, true);
				}else if (valType == "16"){
					// Liste.
					contentString += AddSetValueList(valID, strValue, valList, valUnit, vorDate, true);
				}else if (valType == "20" && valUnit == "html"){
					contentString += AddHTML(valID, strValue, vorDate, false);
				}else if (valType == "20"){
					contentString += AddSetText(valID, strValue, valUnit, vorDate);
				}else{
					contentString += "Unbekannter Variablentyp!";
				}
				contentString += "</li>";
				$("#dataList").append(contentString);
			}
		});

		// "Lade..." wieder entfernen und Überschrift anzeigen:
		$("#dataListHeader").empty();
		$("#dataListHeader").append("<li data-role='list-divider' role='heading'>Systemvariablen<p style='float:right;'>" + systemDate + "</p></li>").listview().listview("refresh");
		$("#dataListHeader").listview().listview("refresh");

		// Animated Icon aus Refresh wieder entfernen:
		$('#buttonRefresh .ui-btn-text').html("&nbsp;");

		$("#dataList").listview().listview("refresh");
		$("#dataList").trigger("create");

		// Filter Update:
		$(".ui-input-search .ui-input-text").trigger("change");

		if (oldScrollPos == -1){
			ScrollToContentHeader();
		}else{
			ScrollToPosition(oldScrollPos);
		}
	});
}

function loadPrograms(oldScrollPos){
	if (oldScrollPos == -1){
		ScrollToContentHeader();
	}
  
	$("#dataList").empty();
	$("#dataListHeader").empty();
	// "Lade..." anzeigen:
	$("#dataListHeader").append("<li><img src='img/misc/wait16.gif' width=12px height=12px class='ui-li-icon ui-img-" + theme + "'>Lade...</li>");
	$("#dataListHeader").listview().listview("refresh");
	// Icon Animation in Refresh Button:
	$('#buttonRefresh .ui-btn-text').html("<img class='ui-img-" + theme + "' src='img/misc/wait16.gif' width=12px height=12px>");

	$.getJSON('cgi/programs.cgi', function(data) {
	systemDate = data['date'];
		$.each(data.entries, function(i, prog) {
			prgVisible = prog['visible'] == "true";
			prgActive = prog['active'] == "true";			
			
			if((readModus && prgVisible && prgActive) || !readModus){
				prgID = prog['id'];
				prgName = prog['name'];
				prgInfo = prog['info'];
				prgDate = prog['date'];
				prgOperate = prog['operate'] == "true";
				vorDate = GetTimeDiffString(prgDate, systemDate);			

				deviceHTML = "<li class='dataListItem' id='" + prgID + "'><h2 class='ui-li-heading'>" + prgName + "</h2><p>" + prgInfo + "</p>";
				deviceHTML += AddStartProgramButton(prgID, "Ausf&uuml;hren", vorDate, prgOperate);
				deviceHTML += "</li>";
				$("#dataList").append(deviceHTML);
			}
		});

		// "Lade..." wieder entfernen und Überschrift anzeigen:
		$("#dataListHeader").empty();
		$("#dataListHeader").append("<li data-role='list-divider' role='heading'>Programme<p style='float:right;'>" + systemDate + "</p></li>").listview().listview("refresh");
		$("#dataListHeader").listview().listview("refresh");

		// Animated Icon aus Refresh wieder entfernen:
		$('#buttonRefresh .ui-btn-text').html("&nbsp;");

		$("#dataList").listview().listview("refresh");
		$("#dataList").trigger("create");
		// Filter Update:
		$(".ui-input-search .ui-input-text").trigger("change");

		if (oldScrollPos == -1){
			ScrollToContentHeader();
		}else{
			ScrollToPosition(oldScrollPos);
		}
	});
}

function loadGraphicIDs(){
	$("#dataList").empty();
	$("#dataListHeader").empty();
	// "Lade..." anzeigen:
	$("#dataListHeader").append("<li><img src='img/misc/wait16.gif' width=12px height=12px class='ui-li-icon ui-img-" + theme + "'>Lade...</li>");
	$("#dataListHeader").listview().listview("refresh");
	// Icon Animation in Refresh Button:
	$('#buttonRefresh .ui-btn-text').html("<img class='ui-img-" + theme + "' src='img/misc/wait16.gif' width=12px height=12px>");

	$.getJSON('cgi/favorites.cgi', function(data) {
		$("#dataList").append("<li data-role='list-divider' role='heading'>Favoriten</li>");
		$.each(data, function(key, val) {
			var html = "<li>";			
			html += "<img class='lazyFavoritesID ui-li-thumbnail ui-img-" + theme + "' data-original='../webmatic_user/img/ids/favorites/" + key + ".png' src='img/menu/favorites.png'/>";
			html += "<form method='post' enctype='multipart/form-data' action='#' id='form" + key +"'>";
			html += "<div class='ui-grid-b'>"
			html += "<div class='ui-block-a'><h1>" + val + "</h1></div>";
			html += "<div class='ui-block-b'><input name='file' id='file" + key + "' type='file' accept='image/*' /></div>";
			html += "<div class='ui-block-c'><a href='#' name='uploadPicture' data-type='favorites' id='uploadPicture" + key + "' data-inline='true' disable='disabled' data-role='button' data-icon='check'>Speichern</a></div>";
			html += "</div>";
			html += "</form>";	
			html += "<output id='filesInfo" + key + "'></output>"
			html += "</li>";
			$("#dataList").append(html);
		});
		$("#dataList").listview().listview("refresh");
		$("img.lazyFavoritesID").lazyload({event: "lazyLoadInstantly"});
		$("img").trigger("lazyLoadInstantly");

		$.getJSON('cgi/rooms.cgi', function(data) {
			$("#dataList").append("<li data-role='list-divider' role='heading'>R&auml;ume</li>");
			$.each(data, function(key, val) {
				var html = "<li>";			
				html += "<img class='lazyRoomsID ui-li-thumbnail ui-img-" + theme + "' data-original='../webmatic_user/img/ids/rooms/" + key + ".png' src='img/menu/rooms.png'/>";
				html += "<form method='post' enctype='multipart/form-data' action='#' id='form" + key +"'>";
				html += "<div class='ui-grid-b'>"
				html += "<div class='ui-block-a'><h1>" + val + "</h1></div>";
				html += "<div class='ui-block-b'><input name='file' id='file" + key + "' type='file' accept='image/*' /></div>";
				html += "<div class='ui-block-c'><a href='#' name='uploadPicture' data-type='rooms' id='uploadPicture" + key + "' data-inline='true' disable='disabled' data-role='button' data-icon='check'>Speichern</a></div>";
				html += "</div>";
				html += "</form>";	
				html += "<output id='filesInfo" + key + "'></output>"
				html += "</li>";
				$("#dataList").append(html);
			});
			$("#dataList").listview().listview("refresh");
			$("img.lazyRoomsID").lazyload({event: "lazyLoadInstantly"});
			$("img").trigger("lazyLoadInstantly");

			$.getJSON('cgi/functions.cgi', function(data) {
				$("#dataList").append("<li data-role='list-divider' role='heading'>Gewerke</li>");
				$.each(data, function(key, val) {
					var html = "<li>";			
					html += "<img class='lazyFunctionsID ui-li-thumbnail ui-img-" + theme + "' data-original='../webmatic_user/img/ids/functions/" + key + ".png' src='img/menu/functions.png'/>";
					html += "<form method='post' enctype='multipart/form-data' action='#' id='form" + key +"'>";
					html += "<div class='ui-grid-b'>"
					html += "<div class='ui-block-a'><h1>" + val + "</h1></div>";
					html += "<div class='ui-block-b'><input name='file' id='file" + key + "' type='file' accept='image/*' /></div>";
					html += "<div class='ui-block-c'><a href='#' name='uploadPicture' data-type='functions' id='uploadPicture" + key + "' data-inline='true' disable='disabled' data-role='button' data-icon='check'>Speichern</a></div>";
					html += "</div>";
					html += "</form>";	
					html += "<output id='filesInfo" + key + "'></output>"
					html += "</li>";
					$("#dataList").append(html);
				});
				$("#dataList").listview().listview("refresh");
				$("img.lazyFunctionsID").lazyload({event: "lazyLoadInstantly"});
				$("img").trigger("lazyLoadInstantly");

			});
		});

		// "Lade..." wieder entfernen und Überschrift anzeigen:
		$("#dataListHeader").empty();
		$("#dataListHeader").append("<li data-role='list-divider' role='heading'>Grafik IDs</li>");
		$("#dataListHeader").append("<li>Damit im Menu eigene Grafiken f&uuml;r R&auml;ume, Gewerke und Favoriten verwendet werden, m&uuml;ssen Grafiken mit der ID als Name in das Verzeichnis webmatic_user/img/ids eingespielt werden (z.B. <i>webmatic_user/img/ids/1436.png</i>). Die Grafiken sollten 80x80 Pixel gro&szlig; sein (bzw. 160x160 f&uuml;r das iPad mit Retina Display) und brauchen das Format PNG. Man kann also auch mit Transparenz arbeiten. In dieser Liste kann man die IDs ablesen und auch sehen, ob bereits Grafiken vergeben wurden.</li>");
		$("#dataListHeader").listview().listview("refresh");

		// Animated Icon aus Refresh wieder entfernen:
		$('#buttonRefresh .ui-btn-text').html("&nbsp;");

		$("#dataList").listview().listview("refresh");
		$("#dataList").trigger("create");
	});
}

// ------------------------- Options -------------------

function loadOptions(){
	$("#dataList").empty();
	$("#dataListHeader").empty();

	$("#dataListHeader").append("<li data-role='list-divider' role='heading'>Optionen</li>");
	html = "<li><h1>Gr&ouml;&szlig;e der Menugrafiken</h1><p><div data-role='fieldcontain'>";
	html += "<div data-role='controlgroup' data-type='horizontal'>";
	gfxSize = localStorage.getItem("optionsMenuGfxSize");
	if (!gfxSize || gfxSize == "" || gfxSize == "large"){
		theme1 = "";
		theme2 = "class='ui-btn-active'";
	}else{
		theme1 = "class='ui-btn-active'";
		theme2 = ""
	}
	html += "<a href='#' id='optionsMenuGfxSizeSmall' data-id='optionsMenuGfxSizeSmall' data-role='button' data-inline='true' " + theme1 + ">Klein</a>";
	html += "<a href='#' id='optionsMenuGfxSizeLarge' data-id='optionsMenuGfxSizeLarge' data-role='button' data-inline='true' " + theme2 + ">Gro&szlig;</a>";
	html += "</div></li>";
	$("#dataList").append(html);

	html = "<li><h1>Testseiten anzeigen</h1><p><div data-role='fieldcontain'>";
	showTestPages = localStorage.getItem("optionsMenuShowTestpages");
	if (!showTestPages || showTestPages == "" || showTestPages == "false"){
		theme1 = "";
		theme2 = "class='ui-btn-active'";
	}else{
		theme1 = "class='ui-btn-active'";
		theme2 = ""
	}
	html += "<div data-role='controlgroup' data-type='horizontal'>";
	html += "<a href='#' id='optionsMenuShowTestpages' data-id='optionsMenuShowTestpages' data-role='button' data-inline='true' " + theme1 + ">Anzeigen</a>";
	html += "<a href='#' id='optionsMenuHideTestpages' data-id='optionsMenuHideTestpages' data-role='button' data-inline='true' " + theme2 + ">Verstecken</a>";
	html += "</div></li>";
	$("#dataList").append(html);
	
	html = "<li><h1>Theme ausw&auml;hlen</h1><p><div data-role='fieldcontain'>";
	html += "<div data-role='controlgroup' data-type='horizontal'>";
	html += "<a href='#' name='optionsMenuGfxThemeChooser' data-value='a' class='" + (theme == 'a'?'ui-btn-active':'') + "' data-role='button' data-inline='true'>Normal</a>";
	html += "<a href='#' name='optionsMenuGfxThemeChooser' data-value='b' class='" + (theme == 'b'?'ui-btn-active':'') + "' data-role='button' data-inline='true'>Schwarz</a>";
	html += "<a href='#' name='optionsMenuGfxThemeChooser' data-value='c' class='" + (theme == 'c'?'ui-btn-active':'') + "' data-role='button' data-inline='true'>Rosa</a>";
	html += "<a href='#' name='optionsMenuGfxThemeChooser' data-value='d' class='" + (theme == 'd'?'ui-btn-active':'') + "' data-role='button' data-inline='true'>Gr&uuml;n</a>";
	html += "<a href='#' name='optionsMenuGfxThemeChooser' data-value='e' class='" + (theme == 'e'?'ui-btn-active':'') + "' data-role='button' data-inline='true'>Gelb</a>";
	html += "<a href='#' name='optionsMenuGfxThemeChooser' data-value='f' class='" + (theme == 'f'?'ui-btn-active':'') + "' data-role='button' data-inline='true'>Grau</a>";
	html += "<a href='#' name='optionsMenuGfxThemeChooser' data-value='g' class='" + (theme == 'g'?'ui-btn-active':'') + "' data-role='button' data-inline='true'>Blau</a>";
	html += "<a href='#' name='optionsMenuGfxThemeChooser' data-value='h' class='" + (theme == 'h'?'ui-btn-active':'') + "' data-role='button' data-inline='true'>Rot</a>";
	html += "</div></li>";
	$("#dataList").append(html);

	html = "<li><h1>WebMatic neu laden, damit alle Einstellungen wirksam werden</h1><p><div data-role='fieldcontain'>";
	html += "<a href='#' id='reloadWebMatic' data-id='reloadWebMatic' data-role='button' data-inline='true'>Neu laden</a>";
	html += "</li>";
	$("#dataList").append(html);

	$("#dataListHeader").listview().listview("refresh");
	$("#dataList").listview().listview("refresh");
	$("#dataList").trigger("create");
}

function isReadOnly(){
	
	if(!readModus){
		return false;
	}
	
	// Wenn die Variable hinten (r) hat, dann ist sie Read-Only:
	// Wenn die Variable hinten (w) hat, dann ist sie nicht Read-Only:
	varOptionsFirst = "";
	varOptions = [];
	// ( finden:
	bracketOpen= valInfo.indexOf("(");
	if (bracketOpen != -1){
		// ) finden:
		bracketClose = valInfo.indexOf(")", bracketOpen);
		if (bracketClose != -1){
			optionsString = valInfo.substring(bracketOpen + 1, bracketClose);
			varOptions = optionsString.split(",");

			if (varOptions.length >= 1){
				varOptionsFirst = varOptions[0].toLowerCase();
			}
		}
	}
	
	if(sysVarReadonly && readModus){
		return varOptionsFirst != "w";
	}	
	return varOptionsFirst == "r";
}

function changeTheme(newTheme){

	$('body').removeClass(function(index, css){
		return (css.match (/(^|\s)ui-overlay-\S{1}/g) || []).join(' ');
	}).addClass('ui-overlay-' + newTheme);
	
	$('.ui-page').removeClass(function(index, css){
		return (css.match (/(^|\s)ui-page-theme-\S{1}/g) || []).join(' ');
	}).addClass('ui-page-theme-' + newTheme).attr('data-theme', newTheme);
	
	$('.ui-header').removeClass(function(index, css){
		return (css.match (/(^|\s)ui-bar-\S{1}/g) || []).join(' ');
	}).addClass('ui-bar-' + newTheme).attr('data-theme', newTheme);
	
	$('.ui-content').removeClass(function(index, css){
		return (css.match (/(^|\s)ui-body-\S{1}/g) || []).join(' ');
	}).addClass('ui-body-' + newTheme).attr('data-theme', newTheme);
	
	$('.ui-popup-screen').removeClass(function(index, css){
		return (css.match (/(^|\s)ui-overlay-\S{1}/g) || []).join(' ');
	}).addClass('ui-overlay-' + newTheme);
	
	$('.ui-collapsible-set').removeClass(function(index, css){
		return (css.match (/(^|\s)ui-group-theme-\S{1}/g) || []).join(' ');
	}).addClass('ui-group-theme-' + newTheme).attr('data-theme', newTheme);
	
	$('.ui-listview').removeClass(function(index, css){
		return (css.match (/(^|\s)ui-group-theme-\S{1}/g) || []).join(' ');
	}).addClass('ui-group-theme-' + newTheme).attr('data-theme', newTheme);
	
	$('.ui-btn').removeClass(function(index, css){
		return (css.match (/(^|\s)ui-btn-\S{1}/g) || []).join(' ');
	}).addClass('ui-btn-' + newTheme).attr('data-theme', newTheme);
	
	$('.valueNoError').removeClass(function(index, css){
		return (css.match (/(^|\s)valueNoError-\S{1}/g) || []).join(' ');
	}).addClass('valueNoError-' + newTheme);
	
	$('.valueInfo').removeClass(function(index, css){
		return (css.match (/(^|\s)valueInfo-\S{1}/g) || []).join(' ');
	}).addClass('valueInfo-' + newTheme);
	
	$('.valueWarning').removeClass(function(index, css){
		return (css.match (/(^|\s)valueWarning-\S{1}/g) || []).join(' ');
	}).addClass('valueWarning-' + newTheme);
	
	$('.valueError').removeClass(function(index, css){
		return (css.match (/(^|\s)valueError-\S{1}/g) || []).join(' ');
	}).addClass('valueError-' + newTheme);
	
	$('.valueOK').removeClass(function(index, css){
		return (css.match (/(^|\s)valueOK-\S{1}/g) || []).join(' ');
	}).addClass('valueOK-' + newTheme);
	
	$('img').removeClass(function(index, css){
		return (css.match (/(^|\s)ui-img-\S{1}/g) || []).join(' ');
	}).addClass('ui-img-' + newTheme);
	
	theme = newTheme;
	localStorage.setItem("optionsMenuGfxTheme", theme);
}

$(function(){
    
    // Ein Button, bei dessen drücken ein Wert an die ID übertragen wird.
	$(document.body).on("click", "[id^=setButton]", function(){
		dataID = $(this).data("id");    // Homematic Geräte ID.
		refresh = $(this).data("refresh");  // Hinweis, ob ein Refresh stattfinden soll.
		value  = $(this).data("value"); // Wert.
		infoID = "info_" + dataID;      // Info Textfeld neben Button.

		$("#" + infoID).text("Übertrage...");
		$.getJSON('cgi/set.cgi?id=' + dataID + '&value=' + value , function(data){
			if (refresh){
				$("#" + infoID).text("OK!");
				RefreshPage(0, true);
			}else{
				$("#" + infoID).text("Wert wird noch an Gerät übertragen und erst verzögert hier dargestellt.");
			}
		});
	});

	// Ein Button, bei dessen drücken ein Wert an die ID übertragen wird.
	$(document.body).on("click", "[id^=setNumberButton]", function(){
		dataID  = $(this).data("id");  // Homematic Geräte ID.
		refresh = $(this).data("refresh");  // Hinweis, ob ein Refresh stattfinden soll.
		valueID = "setValue_" + dataID; // Wertfeld, dessen Inhalt gesetzt werden soll.
		infoID  = "info_" + dataID;  // Info Textfeld neben Button.
		value   = $("#" + valueID).val(); // Wert aus Wertfeld auslesen.
		factor  = $("#" + valueID).data("factor"); // Factor auslesen.

		valueDivided = parseFloat(value) / factor;
		$("#" + infoID).text("Übertrage...");
		$.getJSON('cgi/set.cgi?id=' + dataID + '&value=' + valueDivided, function(data) {
			if (refresh){
				$("#" + infoID).text("OK!");
				RefreshPage(0, true);
			}else{
				$("#" + infoID).text("Wert wird noch an Gerät übertragen und erst verzögert hier dargestellt.");
			}
		});
	});

	// Ein Button, bei dessen drücken ein Bool an die ID übertragen wird.
	$(document.body).on("click", "[id^=setBoolButton]", function(){
		dataID  = $(this).data("id");  // Homematic Geräte ID.
		valueID = "setValue_" + dataID; // Wertfeld, dessen Inhalt gesetzt werden soll.
		infoID  = "info_" + dataID;  // Info Textfeld neben Button.
		value   = $("#" + valueID).val(); // Wert aus Wertfeld auslesen.

		$("#" + infoID).text("Übertrage...");
		$.getJSON('cgi/set.cgi?id=' + dataID + '&value=' + value, function(data) {
			$("#" + infoID).text("OK!");
			RefreshPage(0, true);
		});
	});

	// Ein Button, bei dessen drücken ein ValueList Item an die ID übertragen wird.
	$(document.body).on("click", "[id^=setValueListButton]", function(){
		dataID  = $(this).data("id");  // Homematic Geräte ID.
		valueID = "setValue_" + dataID; // Wertfeld, dessen Inhalt gesetzt werden soll.
		infoID  = "info_" + dataID;  // Info Textfeld neben Button.
		value   = $("#" + valueID).val(); // Wert aus Wertfeld auslesen.

		$("#" + infoID).text("Übertrage...");
		$.getJSON('cgi/set.cgi?id=' + dataID + '&value=' + value, function(data) {
			$("#" + infoID).text("OK!");
			RefreshPage(0, true);
		});
	});

	// Ein Button, bei dessen drücken ein Bool an die ID übertragen wird.
	$(document.body).on("click", "[id^=setTextButton]", function(){
		dataID  = $(this).data("id");  // Homematic Geräte ID.
		valueID = "setValue_" + dataID; // Wertfeld, dessen Inhalt gesetzt werden soll.
		infoID  = "info_" + dataID;  // Info Textfeld neben Button.
		value   = $("#" + valueID).val(); // Wert aus Wertfeld auslesen.
		// Alle " durch ' ersetzen, da sonst Probleme an verschiedenen Stellen:
		value   = value.replace(/\"/g, "'");
		// Dann noch enocden, damit alles übertragen wird:
		value   = encodeURIComponent(value);

		$("#" + infoID).text("Übertrage...");
		$.getJSON('cgi/set.cgi?id=' + dataID + '&value=' + value, function(data) {
			$("#" + infoID).text("OK!");
			RefreshPage(0, true);
		});
	});

	// Ein Button, bei dessen drücken ein "true" an die ID übertragen wird.
	$(document.body).on("click", "[id^=startProgramButton]", function(){
		dataID = $(this).data("id");  // Homematic Geräte ID.
		infoID = "info_" + dataID;  // Info Textfeld neben Button.

		$("#" + infoID).text("Starte...");
		$.getJSON('cgi/startprogram.cgi?id=' + dataID, function(data) {
			$("#" + infoID).text("OK!");
		});
	});
	
	$(document.body).on("change", ":file", function(){
		var file = this.files[0];
		name = file.name;
		size = file.size;
		type = file.type;

		if(file.name.length < 1) {
		}
		else if(file.type != 'image/png' && file.type != 'image/jpg' && !file.type != 'image/gif' && file.type != 'image/jpeg' ) {
			alert("Es muss ein Bild sein!");
		}
		else { 
			var id = $(this).attr('id');
			var key = id.substr(4, id.length);
			$("#uploadPicture" + key).button("enable");
		}
	});
	
	$(document.body).on("click", 'a[name=uploadPicture]', function(){
		var id = $(this).attr('id');
		var key = id.substr(13, id.length);	
		var type = $(this).data('type');
			
		var formData = new FormData();
		
		var file = document.getElementById('file' + key).files[0];
		var reader = new FileReader();
		reader.onloadend = function() { 
			var tempImg = new Image();
			tempImg.src = reader.result;
			tempImg.onload = function() { 
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
				for (var i=0; i<image_data.length; i++) {
					view[i] = image_data.charCodeAt(i) & 0xff;
				}				
				try {
					var blob = new Blob([arraybuffer], {type: 'image/png'});
				} catch (e) {
					var bb = new (window.WebKitBlobBuilder || window.MozBlobBuilder);
					bb.append(arraybuffer);
					var blob = bb.getBlob('image/png');
				}
	 
				formData.append('file', blob, key + '.png');
				formData.append('filename', key + '.png')
				formData.append('path', '/usr/local/etc/config/addons/www/webmatic_user/img/ids/' + type + '/');
				
				$.ajax({
					url: 'cgi/upload.cgi',  //server script to process data
					type: 'POST',				
					success: completeHandler = function(data) {
						/*
						* workaround for crome browser // delete the fakepath
						*/
						if(navigator.userAgent.indexOf('Chrome')) {
							var catchFile = $(":file").val().replace(/C:\\fakepath\\/i, '');
						}
						else {
							var catchFile = $(":file").val();
						}
					},
					data: formData,
					cache: false,
					contentType: false,
					processData: false
				}, 'json');
			
			}
		}
		reader.readAsDataURL(file);
	});
				
});